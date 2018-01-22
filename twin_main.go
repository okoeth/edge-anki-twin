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

	anki "github.com/okoeth/edge-anki-base"
	"github.com/rs/cors"
	"github.com/gorilla/websocket"
	"goji.io"
	"goji.io/pat"
	"encoding/base64"
	"strings"
	"image"
	"image/jpeg"
)

// Logging
var mlog = log.New(os.Stdout, "EDGE-ANKI-TWIN: ", log.Lshortfile|log.LstdFlags)

func init() {
	flag.Parse()
}

func main() {
	// Set-up channels for status and commands
	anki.SetLogger(mlog)
	cmdCh, statusCh, err := anki.CreateChannels("edge.twin")
	if err != nil {
		mlog.Fatalln("FATAL: Could not establish channels: %s", err)
	}
	track := anki.CreateTrack()

	// Go and watch the track
	go watchTrack(track, cmdCh, statusCh)

	// Set-up routes
	mux := goji.NewMux()
	tc := NewTwinController(track, cmdCh)
	tc.AddHandlers(mux)
	mux.Handle(pat.Get("/html/*"), http.FileServer(http.Dir("html/dist/")))
	mux.HandleFunc(pat.Get("/image"), websocket_handler)
	corsHandler := cors.Default().Handler(mux)
	mlog.Printf("INFO: System is ready.\n")
	http.ListenAndServe("0.0.0.0:8001", corsHandler)
}

var upgrader = websocket.Upgrader{
	ReadBufferSize: 0,
	WriteBufferSize: 1024,
}

func websocket_handler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		mlog.Println(err)
		return
	}
	mlog.Println("Client subscribed")

	for {
		_, imageData, err := conn.ReadMessage()
		if err != nil {
			mlog.Println(err)
			return
		}

		//Decode image as jpg
		mlog.Println("INFO: Received base64 image")
		reader := base64.NewDecoder(base64.StdEncoding, strings.NewReader(string(imageData)))
		jpg, _, err := image.Decode(reader)
		if err != nil {
			mlog.Fatal(err)
		}

		//Save image to file
		imageFile, err := os.OpenFile("html/dist/html/images/capture.jpg", os.O_WRONLY|os.O_CREATE, 0777)
		if err != nil {
			mlog.Fatal(err)
			panic("Cannot open file")
		}

		jpeg.Encode(imageFile, jpg, &jpeg.Options{ Quality: 100 })
	}
	mlog.Println("Client unsubscribed")
}
