package main

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"os"

	"example.com/go-bucket/infra"
	"ocel.dev"
)

func main() {
	http.HandleFunc("PUT /files/{key...}", func(w http.ResponseWriter, r *http.Request) {
		data, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		err = infra.Uploads.WriteAll(r.Context(), r.PathValue("key"), data,
			ocel.ContentType(r.Header.Get("content-type")))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
	})

	http.HandleFunc("GET /files/{key...}", func(w http.ResponseWriter, r *http.Request) {
		reader, err := infra.Uploads.NewReader(r.Context(), r.PathValue("key"))
		if errors.Is(err, ocel.ErrObjectNotFound) {
			http.NotFound(w, r)
			return
		}
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer reader.Close()
		w.Header().Set("content-type", reader.Attrs().ContentType)
		_, _ = io.Copy(w, reader)
	})

	http.HandleFunc("GET /files", func(w http.ResponseWriter, r *http.Request) {
		keys := []string{}
		for object, err := range infra.Uploads.List(r.Context(), ocel.Prefix(r.URL.Query().Get("prefix"))) {
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			keys = append(keys, object.Key)
		}
		w.Header().Set("content-type", "application/json")
		_ = json.NewEncoder(w).Encode(keys)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Printf("listening on http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
