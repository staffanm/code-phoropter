package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// Metrics
var (
	httpRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "endpoint", "status"},
	)

	httpRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "http_request_duration_seconds",
			Help: "HTTP request duration in seconds",
		},
		[]string{"method", "endpoint"},
	)

	cacheHits = promauto.NewCounter(prometheus.CounterOpts{
		Name: "cache_hits_total",
		Help: "Total number of cache hits",
	})

	cacheMisses = promauto.NewCounter(prometheus.CounterOpts{
		Name: "cache_misses_total",
		Help: "Total number of cache misses",
	})
)

// User represents a user in the system
type User struct {
	ID        int       `json:"id" db:"id"`
	Username  string    `json:"username" db:"username"`
	Email     string    `json:"email" db:"email"`
	FullName  string    `json:"full_name" db:"full_name"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// CacheEntry represents a cached item with TTL
type CacheEntry[T any] struct {
	Value     T
	ExpiresAt time.Time
}

// IsExpired checks if the cache entry is expired
func (ce *CacheEntry[T]) IsExpired() bool {
	return time.Now().After(ce.ExpiresAt)
}

// Cache is a thread-safe in-memory cache with TTL
type Cache[K comparable, V any] struct {
	mu       sync.RWMutex
	data     map[K]*CacheEntry[V]
	defaultTTL time.Duration
}

// NewCache creates a new cache with the specified default TTL
func NewCache[K comparable, V any](defaultTTL time.Duration) *Cache[K, V] {
	c := &Cache[K, V]{
		data:       make(map[K]*CacheEntry[V]),
		defaultTTL: defaultTTL,
	}
	
	// Start cleanup goroutine
	go c.cleanup()
	
	return c
}

// Get retrieves an item from the cache
func (c *Cache[K, V]) Get(key K) (V, bool) {
	c.mu.RLock()
	entry, exists := c.data[key]
	c.mu.RUnlock()

	var zero V
	if !exists {
		cacheMisses.Inc()
		return zero, false
	}

	if entry.IsExpired() {
		c.mu.Lock()
		delete(c.data, key)
		c.mu.Unlock()
		cacheMisses.Inc()
		return zero, false
	}

	cacheHits.Inc()
	return entry.Value, true
}

// Set stores an item in the cache with default TTL
func (c *Cache[K, V]) Set(key K, value V) {
	c.SetWithTTL(key, value, c.defaultTTL)
}

// SetWithTTL stores an item in the cache with custom TTL
func (c *Cache[K, V]) SetWithTTL(key K, value V, ttl time.Duration) {
	entry := &CacheEntry[V]{
		Value:     value,
		ExpiresAt: time.Now().Add(ttl),
	}

	c.mu.Lock()
	c.data[key] = entry
	c.mu.Unlock()
}

// Delete removes an item from the cache
func (c *Cache[K, V]) Delete(key K) {
	c.mu.Lock()
	delete(c.data, key)
	c.mu.Unlock()
}

// cleanup removes expired entries periodically
func (c *Cache[K, V]) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		c.mu.Lock()
		for key, entry := range c.data {
			if entry.IsExpired() {
				delete(c.data, key)
			}
		}
		c.mu.Unlock()
	}
}

// UserService handles user-related operations
type UserService struct {
	cache   *Cache[int, *User]
	users   map[int]*User
	mu      sync.RWMutex
	nextID  int
}

// NewUserService creates a new user service
func NewUserService() *UserService {
	service := &UserService{
		cache:  NewCache[int, *User](15 * time.Minute),
		users:  make(map[int]*User),
		nextID: 1,
	}

	// Add some dummy data
	service.CreateUser("john_doe", "john@example.com", "John Doe")
	service.CreateUser("jane_smith", "jane@example.com", "Jane Smith")
	service.CreateUser("bob_wilson", "bob@example.com", "Bob Wilson")

	return service
}

// CreateUser creates a new user
func (s *UserService) CreateUser(username, email, fullName string) *User {
	s.mu.Lock()
	defer s.mu.Unlock()

	user := &User{
		ID:        s.nextID,
		Username:  username,
		Email:     email,
		FullName:  fullName,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	s.users[s.nextID] = user
	s.cache.Set(s.nextID, user)
	s.nextID++

	return user
}

// GetUser retrieves a user by ID, with caching
func (s *UserService) GetUser(id int) (*User, error) {
	// Try cache first
	if user, exists := s.cache.Get(id); exists {
		return user, nil
	}

	// Fallback to direct lookup
	s.mu.RLock()
	user, exists := s.users[id]
	s.mu.RUnlock()

	if !exists {
		return nil, fmt.Errorf("user with ID %d not found", id)
	}

	// Cache for future requests
	s.cache.Set(id, user)
	return user, nil
}

// ListUsers returns all users with pagination
func (s *UserService) ListUsers(limit, offset int) ([]*User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	users := make([]*User, 0, len(s.users))
	for _, user := range s.users {
		users = append(users, user)
	}

	// Simple pagination
	start := offset
	end := offset + limit

	if start >= len(users) {
		return []*User{}, nil
	}

	if end > len(users) {
		end = len(users)
	}

	return users[start:end], nil
}

// UserHandler handles HTTP requests for user operations
type UserHandler struct {
	service *UserService
}

// NewUserHandler creates a new user handler
func NewUserHandler(service *UserService) *UserHandler {
	return &UserHandler{service: service}
}

// GetUser handles GET /users/{id}
func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr, exists := vars["id"]
	if !exists {
		http.Error(w, "Missing user ID", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	user, err := h.service.GetUser(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// ListUsers handles GET /users
func (h *UserHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	limit := 10 // default
	offset := 0 // default

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	if offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	users, err := h.service.ListUsers(limit, offset)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"users":  users,
		"limit":  limit,
		"offset": offset,
		"total":  len(users),
	})
}

// MetricsMiddleware adds metrics to HTTP requests
func MetricsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Wrap ResponseWriter to capture status code
		recorder := &statusRecorder{ResponseWriter: w, statusCode: 200}

		next.ServeHTTP(recorder, r)

		duration := time.Since(start)
		
		// Record metrics
		httpRequestsTotal.WithLabelValues(
			r.Method,
			r.URL.Path,
			strconv.Itoa(recorder.statusCode),
		).Inc()

		httpRequestDuration.WithLabelValues(
			r.Method,
			r.URL.Path,
		).Observe(duration.Seconds())
	})
}

// statusRecorder wraps http.ResponseWriter to capture status code
type statusRecorder struct {
	http.ResponseWriter
	statusCode int
}

func (r *statusRecorder) WriteHeader(statusCode int) {
	r.statusCode = statusCode
	r.ResponseWriter.WriteHeader(statusCode)
}

func main() {
	// Create service and handler
	userService := NewUserService()
	userHandler := NewUserHandler(userService)

	// Setup routes
	r := mux.NewRouter()
	
	// Add metrics middleware
	r.Use(MetricsMiddleware)

	// API routes
	api := r.PathPrefix("/api/v1").Subrouter()
	api.HandleFunc("/users", userHandler.ListUsers).Methods("GET")
	api.HandleFunc("/users/{id:[0-9]+}", userHandler.GetUser).Methods("GET")

	// Metrics endpoint
	r.Handle("/metrics", promhttp.Handler())

	// Health check
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status": "healthy",
			"time":   time.Now().Format(time.RFC3339),
		})
	})

	// Start server
	server := &http.Server{
		Addr:         ":8080",
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("Server starting on :8080")
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server failed to start: %v", err)
	}
}