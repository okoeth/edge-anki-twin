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
	"flag"
	"log"
	"net/http"
	"os"

	"github.com/wvanbergen/kafka/consumergroup"

	"github.com/Shopify/sarama"
	"github.com/rs/cors"
	"goji.io"
	"goji.io/pat"
)

// MainLogger is the logger for the app
var MainLogger = log.New(os.Stdout, "MWC-TWIN: ", log.Lshortfile|log.LstdFlags)

// TheStatus carries the latest status information
var TheStatus = [3]Status{}

// TheProducer provides a reference to the Kafka producer
var TheProducer sarama.AsyncProducer

// TheConsumer provides a reference to the Kafka producer
var TheConsumer *consumergroup.ConsumerGroup

func init() {
	flag.Parse()
}

func main() {
	// Initialise Cars
	TheStatus[0].CarNo = "1"
	TheStatus[1].CarNo = "2"
	TheStatus[2].CarNo = "3"

	// Set-up Kafka
	kafkaServer := os.Getenv("KAFKA_SERVER")
	if kafkaServer == "" {
		MainLogger.Printf("INFO: Using 127.0.0.1 as default KAFKA_SERVER.")
		kafkaServer = "127.0.0.1"
	}
	p, err := CreateKafkaProducer(kafkaServer + ":9092")
	if err != nil {
		MainLogger.Fatalf("ERROR: Cannot create Kafka producer: %s", err)
	}
	TheProducer = p
	c, err := CreateKafkaConsumer(kafkaServer + ":2181")
	if err != nil {
		MainLogger.Fatalf("ERROR: Cannot create Kafka consumer: %s", err)
	}
	TheConsumer = c

	// Set-up routes
	mux := goji.NewMux()
	tc := NewTwinController()
	tc.AddHandlers(mux)
	mux.Handle(pat.Get("/html/*"), http.FileServer(http.Dir("html/dist/")))
	corsHandler := cors.Default().Handler(mux)
	MainLogger.Printf("INFO: System is ready.\n")
	http.ListenAndServe("0.0.0.0:8000", corsHandler)
}
