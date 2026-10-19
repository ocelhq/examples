package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"

	"example.com/go-uptime-monitor/infra"
	"github.com/jackc/pgx/v5"
)

type monitor struct {
	ID     int64        `json:"id"`
	URL    string       `json:"url"`
	Latest *infra.Check `json:"latest"`
}

func main() {
	http.HandleFunc("POST /monitors", func(w http.ResponseWriter, r *http.Request) {
		var in struct{ URL string }
		_ = json.NewDecoder(r.Body).Decode(&in)
		if u, err := url.Parse(in.URL); err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" {
			http.Error(w, `send {"url": "https://..."}`, http.StatusBadRequest)
			return
		}
		pool, err := infra.Pool(r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		target := infra.Target{URL: in.URL}
		if err := pool.QueryRow(r.Context(), `INSERT INTO monitors (url) VALUES ($1) RETURNING id`, in.URL).Scan(&target.ID); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		// Probe now rather than waiting up to a minute for the next sweep.
		if _, err := infra.Probe.Trigger(r.Context(), target); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		writeJSON(w, http.StatusCreated, monitor{ID: target.ID, URL: target.URL})
	})

	http.HandleFunc("GET /monitors", func(w http.ResponseWriter, r *http.Request) {
		pool, err := infra.Pool(r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		rows, err := pool.Query(r.Context(), `SELECT id, url FROM monitors ORDER BY id`)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		targets, err := pgx.CollectRows(rows, pgx.RowToStructByPos[infra.Target])
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		ids := make([]int64, len(targets))
		for i, t := range targets {
			ids[i] = t.ID
		}
		latest, err := infra.Latest.GetMany(r.Context(), ids...)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		monitors := make([]monitor, len(targets))
		for i, t := range targets {
			monitors[i] = monitor{ID: t.ID, URL: t.URL}
			if check, ok := latest[t.ID]; ok {
				monitors[i].Latest = &check
			}
		}
		writeJSON(w, http.StatusOK, monitors)
	})

	http.HandleFunc("GET /monitors/{id}", func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
		if err != nil {
			http.NotFound(w, r)
			return
		}
		pool, err := infra.Pool(r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		var out struct {
			ID     int64         `json:"id"`
			URL    string        `json:"url"`
			Uptime *float64      `json:"uptime24h"`
			Checks []infra.Check `json:"checks"`
		}
		err = pool.QueryRow(r.Context(), `
			SELECT m.id, m.url,
			       (SELECT avg(up::int)::float8 FROM checks WHERE monitor_id = m.id AND at > now() - interval '24 hours')
			FROM monitors m WHERE m.id = $1`, id).Scan(&out.ID, &out.URL, &out.Uptime)
		if errors.Is(err, pgx.ErrNoRows) {
			http.NotFound(w, r)
			return
		}
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		rows, err := pool.Query(r.Context(), `
			SELECT up, coalesce(status, 0), coalesce(error, ''), latency_ms, at
			FROM checks WHERE monitor_id = $1 ORDER BY at DESC LIMIT 20`, id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if out.Checks, err = pgx.CollectRows(rows, pgx.RowToStructByPos[infra.Check]); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		writeJSON(w, http.StatusOK, out)
	})

	http.HandleFunc("DELETE /monitors/{id}", func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
		if err != nil {
			http.NotFound(w, r)
			return
		}
		pool, err := infra.Pool(r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if _, err := pool.Exec(r.Context(), `DELETE FROM monitors WHERE id = $1`, id); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if _, err := infra.Latest.Delete(r.Context(), id); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
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

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("content-type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}
