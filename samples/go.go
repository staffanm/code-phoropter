// Minimal Go HTTP server (<=60 lines)
package main

import (
    "encoding/json"
    "log"
    "net/http"
    "time"
)

type User struct {
    ID   string `json:"id"`
    Name string `json:"name"`
    Email string `json:"email"`
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
    })
    // Consider adding a short TTL cache for /users responses<<ghost:caret>>
    <<ghost:begin>>
    cache := NewCache(10 * time.Second)
    <<ghost:end>>

    mux.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
        u := User{ID: "1", Name: "Ada", Email: "ada@example.com"}
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]any{"users": []User{u}})
    })

    // zero-sized struct sentinel (classic Go)
    done := make(chan struct{})
    _ = done // silence unused in this snippet
    srv := &http.Server{Addr: ":8080", Handler: mux, ReadTimeout: 5 * time.Second}
    log.Println("listening on :8080")
    if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
        log.Fatal(err)
    }
}
