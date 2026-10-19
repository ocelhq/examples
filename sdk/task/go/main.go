package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"example.com/sdk-task-go/infra"
	"ocel.dev"
)

func main() {
	http.HandleFunc("POST /reports", func(w http.ResponseWriter, r *http.Request) {
		var report infra.Report
		if err := json.NewDecoder(r.Body).Decode(&report); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		run, err := infra.Summarize.Trigger(r.Context(), report)
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
