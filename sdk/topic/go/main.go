package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"example.com/sdk-topic-go/infra"
)

func main() {
	http.HandleFunc("POST /orders", func(w http.ResponseWriter, r *http.Request) {
		var order infra.Order
		if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		id, err := infra.Orders.Send(r.Context(), order)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		writeJSON(w, http.StatusAccepted, map[string]string{"messageId": id})
	})

	http.HandleFunc("GET /failed/receipts", func(w http.ResponseWriter, r *http.Request) {
		page, err := infra.Orders.DeadLetter(infra.Receipts.Name()).List(r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		failed := []map[string]any{}
		for _, letter := range page.DeadLetters {
			failed = append(failed, map[string]any{"payload": letter.Payload, "error": letter.Error})
		}
		writeJSON(w, http.StatusOK, failed)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Printf("listening on http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("content-type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}
