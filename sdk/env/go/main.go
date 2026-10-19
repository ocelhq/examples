package main

import (
	"crypto/subtle"
	"fmt"
	"log"
	"net/http"
	"os"

	"example.com/sdk-env-go/infra"
)

func main() {
	http.HandleFunc("GET /greeting", func(w http.ResponseWriter, _ *http.Request) {
		fmt.Fprintln(w, infra.Env.Greeting)
	})

	http.HandleFunc("GET /secret", func(w http.ResponseWriter, r *http.Request) {
		given := []byte(r.Header.Get("x-api-key"))
		if subtle.ConstantTimeCompare(given, []byte(infra.Env.APIKey.Value())) != 1 {
			http.Error(w, "wrong key", http.StatusUnauthorized)
			return
		}
		fmt.Fprintln(w, "the secret matches")
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Printf("listening on http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
