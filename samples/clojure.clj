;; Minimal Clojure Ring-style sample (<=60 lines)
(ns demo.core)

(defn now [] (java.time.Instant/now))

(defn ok [body]
  {:status 200
   :headers {"content-type" "application/json"}
   :body body})

;; <<ghost:begin>>
;; Suggest middleware for simple in-memory caching
;; (wrap-with-cache {:ttl-ms 10000}) ;; TODO <<ghost:caret>>
;; <<ghost:end>>

(defn handler [req]
  (case (:uri req)
    "/health" (ok {:status "ok" :time (str (now))})
    "/users"  (ok {:users [{:id 1 :name "Ada" :email "ada@example.com"}]})
    (ok {:error "not-found"})))

(defn -main [& _]
  #_{:easter-egg :reader-macro-skip}
  (println "Demo handler ready at /health and /users"))
