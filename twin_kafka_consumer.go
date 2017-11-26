// Copyright 2018 NTT Group

// Permission is hereby granted, free of charge, to any person obtaining a copy of this
// software and associated documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to the following
// conditions:

// The above copyright notice and this permission notice shall be included in all copies
// or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
// PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
// FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

package main

import (
	"encoding/json"
	"os"
	"os/signal"
	"time"

	"github.com/Shopify/sarama"
	"github.com/wvanbergen/kafka/consumergroup"
)

const consumerGroup = "mwc.twin"

// CreateKafkaConsumer creates a Kafka consumer which is conected to the respective Kafka server
func CreateKafkaConsumer(zookeeperConn string) (*consumergroup.ConsumerGroup, error) {
	MainLogger.Println("Starting Consumer")
	config := consumergroup.NewConfig()
	config.Offsets.Initial = sarama.OffsetOldest
	config.Offsets.ProcessingTimeout = 10 * time.Second

	consumer, err := consumergroup.JoinConsumerGroup(consumerGroup, []string{"Status"}, []string{zookeeperConn}, config)
	if err != nil {
		MainLogger.Println("ERROR: Failed to join consumer group", consumerGroup, err)
		return nil, err
	}

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	signal.Notify(c, os.Kill)

	go func() {
		<-c
		if err := consumer.Close(); err != nil {
			MainLogger.Println("ERROR: Error closing the consumer", err)
		}

		MainLogger.Println("INFO: Consumer closed")
		os.Exit(0)
	}()

	go func() {
		for err := range consumer.Errors() {
			MainLogger.Println(err)
		}
	}()

	go func() {
		MainLogger.Println("Waiting for messages")
		for message := range consumer.Messages() {
			MainLogger.Printf("INFO: Topic: %s\t Partition: %v\t Offset: %v\n", message.Topic, message.Partition, message.Offset)

			e := handler(message)
			if e != nil {
				MainLogger.Fatal(e)
				consumer.Close()
			} else {
				consumer.CommitUpto(message)
			}
		}
	}()

	return consumer, nil
}

func handler(m *sarama.ConsumerMessage) error {
	MainLogger.Printf("INFO: Received message: %s", m.Value)
	statusUpdate := &Status{}
	err := json.Unmarshal(m.Value, statusUpdate)
	if err != nil {
		MainLogger.Printf("WARNING: Could not unmarshal message, ignoring: %s", m.Value)
		return nil
	}
	TheStatus.MergeStatusUpdate(statusUpdate)
	return nil
}
