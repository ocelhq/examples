package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"example.com/sdk-worker-go/infra"
	"ocel.dev"
)

func main() {
	http.HandleFunc("POST /naps", func(w http.ResponseWriter, r *http.Request) {
		var job infra.Job
		if err := json.NewDecoder(r.Body).Decode(&job); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		run, err := infra.Nap.Trigger(r.Context(), job)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		writeJSON(w, http.StatusAccepted, map[string]string{"runId": run.ID})
	})

	http.HandleFunc("GET /runs/{id}", func(w http.ResponseWriter, r *http.Request) {
		run, err := ocel.RetrieveRun(r.Context(), r.PathValue("id"))
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"status": run.Status, "output": run.Output, "error": run.Error})
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
