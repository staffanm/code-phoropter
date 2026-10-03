#include <iostream>
#include <vector>
#include <memory>
#include <algorithm>
#include <chrono>

// Cache implementation with LRU eviction policy
template<typename K, typename V>
class LRUCache {
private:
    struct Node {
        K key;
        V value;
        std::shared_ptr<Node> prev;
        std::shared_ptr<Node> next;

        Node(const K& k, const V& v) : key(k), value(v) {}
    };

    size_t capacity;
    std::unordered_map<K, std::shared_ptr<Node>> cache;
    std::shared_ptr<Node> head;
    std::shared_ptr<Node> tail;

    void moveToFront(std::shared_ptr<Node> node) {
        if (node == head) return;

        // Remove from current position__GHOST_CARET__
        __GHOST_BEGIN__if (node->prev) node->prev->next = node->next;
        if (node->next) node->next->prev = node->prev;
        if (node == tail) tail = node->prev;__GHOST_END__

        // Move to front
        node->next = head;
        node->prev = nullptr;
        if (head) head->prev = node;
        head = node;
        if (!tail) tail = head;
    }

public:
    explicit LRUCache(size_t cap) : capacity(cap) {}

    std::optional<V> get(const K& key) {
        auto it = cache.find(key);
        if (it == cache.end()) return std::nullopt;

        moveToFront(it->second);
        return it->second->value;
    }

    void put(const K& key, const V& value) {
        auto it = cache.find(key);

        if (it != cache.end()) {
            it->second->value = value;
            moveToFront(it->second);
            return;
        }

        // Evict if at capacity
        if (cache.size() >= capacity) {
            cache.erase(tail->key);
            tail = tail->prev;
            if (tail) tail->next = nullptr;
        }

        // Create new node
        auto node = std::make_shared<Node>(key, value);
        cache[key] = node;
        moveToFront(node);
    }
};