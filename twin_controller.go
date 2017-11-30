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
	"net/http"
	"time"

	"github.com/Shopify/sarama"
	"goji.io"
	"goji.io/pat"
)

type (
	// TwinController represents the controller for working with this app
	TwinController struct {
	}
)

// NewTwinController provides a reference to an IncomingController
func NewTwinController() *TwinController {
	return &TwinController{}
}

// AddHandlers inserts new greeting
func (tc *TwinController) AddHandlers(mux *goji.Mux) {
	mux.HandleFunc(pat.Get("/v1/twin/status"), Logger(tc.GetStatus))
	mux.HandleFunc(pat.Post("/v1/twin/command"), Logger(tc.PostCommand))
}

// GetStatus inserts new greeting
func (tc *TwinController) GetStatus(w http.ResponseWriter, r *http.Request) {
	sj, err := json.Marshal(TheStatus)
	if err != nil {
		MainLogger.Println("ERROR: Error de-marshaling TheStatus")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(sj)
}

// PostCommand sends a command via Kafka to the controller
func (tc *TwinController) PostCommand(w http.ResponseWriter, r *http.Request) {
	// Read command from request
	cmd := &Command{}
	err := json.NewDecoder(r.Body).Decode(cmd)
	if err != nil {
		MainLogger.Printf("ERROR: Error decoding request body: %s", err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	cmdstr, err := cmd.ControllerString()
	if err != nil {
		MainLogger.Println("ERROR: Error decoding command to commend string")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	MainLogger.Printf("INFO: Received command string: %s", cmdstr)
	// Send message to broker
	TheProducer.Input() <- &sarama.ProducerMessage{
		Value:     sarama.StringEncoder(cmdstr),
		Topic:     "Command" + cmd.CarNo,
		Partition: 0,
		Timestamp: time.Now(),
	}
	w.WriteHeader(http.StatusOK)
}
