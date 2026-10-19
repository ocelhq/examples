package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"example.com/sdk-realtime-go/infra"
)

func main() {
	// Browsers subscribe through this handler; it signs the short-lived tokens the transport checks.
	http.Handle("/api/realtime", infra.Live.Handler())

	http.HandleFunc("POST /rooms/{room}/messages", func(w http.ResponseWriter, r *http.Request) {
		var message infra.Message
		if err := json.NewDecoder(r.Body).Decode(&message); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		params := infra.RoomParams{Room: r.PathValue("room")}
		if err := infra.Chat.Publish(r.Context(), params, message); err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Printf("listening on http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
