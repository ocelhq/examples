package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"example.com/go-postgres/infra"
)

type note struct {
	ID   int64  `json:"id"`
	Text string `json:"text"`
}

func main() {
	http.HandleFunc("POST /notes", func(w http.ResponseWriter, r *http.Request) {
		var in struct{ Text string }
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil || in.Text == "" {
			http.Error(w, `send {"text": "..."}`, http.StatusBadRequest)
			return
		}
		pool, err := infra.DB.Pool(r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if _, err := pool.Exec(r.Context(), `CREATE TABLE IF NOT EXISTS notes (id bigserial PRIMARY KEY, text text NOT NULL)`); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		var n note
		err = pool.QueryRow(r.Context(), `INSERT INTO notes (text) VALUES ($1) RETURNING id, text`, in.Text).Scan(&n.ID, &n.Text)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		writeJSON(w, http.StatusCreated, n)
	})

	http.HandleFunc("GET /notes", func(w http.ResponseWriter, r *http.Request) {
		pool, err := infra.DB.Pool(r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		rows, err := pool.Query(r.Context(), `SELECT id, text FROM notes ORDER BY id`)
		if err != nil {
			http.Error(w, "no notes yet: POST one first", http.StatusNotFound)
			return
		}
		defer rows.Close()
		notes := []note{}
		for rows.Next() {
			var n note
			if err := rows.Scan(&n.ID, &n.Text); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			notes = append(notes, n)
		}
		writeJSON(w, http.StatusOK, notes)
	})

	serve()
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("content-type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func serve() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Printf("listening on http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
