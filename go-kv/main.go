package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"

	"example.com/go-kv/infra"
	"ocel.dev/kv"
)

func main() {
	http.HandleFunc("POST /hits/{page}", func(w http.ResponseWriter, r *http.Request) {
		count, err := infra.Hits.Increment(r.Context(), r.PathValue("page"), 1)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		writeJSON(w, map[string]int64{"hits": count})
	})

	http.HandleFunc("GET /hits/{page}", func(w http.ResponseWriter, r *http.Request) {
		count, err := infra.Hits.Get(r.Context(), r.PathValue("page"))
		if errors.Is(err, kv.ErrMiss) {
			count, err = 0, nil
		}
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		writeJSON(w, map[string]int64{"hits": count})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Printf("listening on http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func writeJSON(w http.ResponseWriter, body any) {
	w.Header().Set("content-type", "application/json")
	_ = json.NewEncoder(w).Encode(body)
}
