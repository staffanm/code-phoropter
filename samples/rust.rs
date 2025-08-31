use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use std::time::{Duration, Instant};
use tokio::time::sleep;
use serde::{Deserialize, Serialize};
use anyhow::{Context, Result};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheEntry<T> {
    value: T,
    expires_at: Instant,
    hit_count: u64,
}

impl<T> CacheEntry<T> {
    fn new(value: T, ttl: Duration) -> Self {
        Self {
            value,
            expires_at: Instant::now() + ttl,
            hit_count: 0,
        }
    }
    
    fn is_expired(&self) -> bool {
        Instant::now() > self.expires_at
    }
    
    fn touch(&mut self) {
        self.hit_count += 1;
    }
}

#[derive(Debug)]
pub struct AsyncCache<K, V> 
where
    K: std::hash::Hash + Eq + Clone,
    V: Clone + Send + Sync,
{
    data: Arc<RwLock<HashMap<K, CacheEntry<V>>>>,
    default_ttl: Duration,
    max_size: usize,
}

impl<K, V> AsyncCache<K, V>
where
    K: std::hash::Hash + Eq + Clone + Send + Sync,
    V: Clone + Send + Sync,
{
    pub fn new(default_ttl: Duration, max_size: usize) -> Self {
        Self {
            data: Arc::new(RwLock::new(HashMap::new())),
            default_ttl,
            max_size,
        }
    }

    pub async fn get(&self, key: &K) -> Option<V> {
        // Try read lock first
        {
            let data = self.data.read().unwrap();
            if let Some(entry) = data.get(key) {
                if !entry.is_expired() {
                    return Some(entry.value.clone());
                }
            }
        }
        
        // If expired or not found, clean up with write lock
        {
            let mut data = self.data.write().unwrap();
            if let Some(mut entry) = data.get_mut(key) {
                if entry.is_expired() {
                    data.remove(key);
                    None
                } else {
                    entry.touch();
                    Some(entry.value.clone())
                }
            } else {
                None
            }
        }
    }

    pub async fn insert(&self, key: K, value: V) -> Result<()> {
        self.insert_with_ttl(key, value, self.default_ttl).await
    }

    pub async fn insert_with_ttl(&self, key: K, value: V, ttl: Duration) -> Result<()> {
        let mut data = self.data.write().unwrap();
        
        // Evict expired entries and enforce size limit
        self.cleanup_expired(&mut data);
        
        if data.len() >= self.max_size {
            self.evict_lru(&mut data)?;
        }
        
        let entry = CacheEntry::new(value, ttl);
        data.insert(key, entry);
        
        Ok(())
    }

    pub async fn remove(&self, key: &K) -> Option<V> {
        let mut data = self.data.write().unwrap();
        data.remove(key).map(|entry| entry.value)
    }

    pub async fn clear(&self) {
        let mut data = self.data.write().unwrap();
        data.clear();
    }

    pub async fn size(&self) -> usize {
        let data = self.data.read().unwrap();
        data.len()
    }

    /// Get or compute a value, with caching
    pub async fn get_or_compute<F, Fut>(&self, key: K, compute_fn: F) -> Result<V>
    where
        F: FnOnce() -> Fut + Send,
        Fut: std::future::Future<Output = Result<V>> + Send,
    {
        // Try to get from cache first
        if let Some(cached_value) = self.get(&key).await {
            return Ok(cached_value);
        }

        // Compute the value
        let computed_value = compute_fn().await
            .context("Failed to compute value")?;

        // Cache and return
        self.insert(key, computed_value.clone()).await?;
        Ok(computed_value)
    }

    fn cleanup_expired(&self, data: &mut HashMap<K, CacheEntry<V>>) {
        let now = Instant::now();
        data.retain(|_, entry| entry.expires_at > now);
    }

    fn evict_lru(&self, data: &mut HashMap<K, CacheEntry<V>>) -> Result<()> {
        if data.is_empty() {
            return Ok(());
        }

        // Find the entry with the lowest hit count and oldest expiry
        let lru_key = data
            .iter()
            .min_by(|(_, a), (_, b)| {
                a.hit_count.cmp(&b.hit_count)
                    .then(a.expires_at.cmp(&b.expires_at))
            })
            .map(|(k, _)| k.clone())
            .context("Failed to find LRU entry")?;

        data.remove(&lru_key);
        Ok(())
    }
}

// Background cleanup task
impl<K, V> AsyncCache<K, V>
where
    K: std::hash::Hash + Eq + Clone + Send + Sync + 'static,
    V: Clone + Send + Sync + 'static,
{
    pub fn start_cleanup_task(self: Arc<Self>, interval: Duration) -> tokio::task::JoinHandle<()> {
        tokio::spawn(async move {
            let mut cleanup_interval = tokio::time::interval(interval);
            loop {
                cleanup_interval.tick().await;
                
                {
                    let mut data = self.data.write().unwrap();
                    let initial_size = data.len();
                    self.cleanup_expired(&mut data);
                    let cleaned_size = data.len();
                    
                    if initial_size != cleaned_size {
                        println!("Cleaned up {} expired entries", initial_size - cleaned_size);
                    }
                }
                
                // Sleep to avoid holding the lock too long
                sleep(Duration::from_millis(10)).await;
            }
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::time::{sleep, Duration};

    #[tokio::test]
    async fn test_cache_basic_operations() {
        let cache = AsyncCache::new(Duration::from_secs(60), 100);
        
        // Insert and retrieve
        cache.insert("key1", "value1").await.unwrap();
        assert_eq!(cache.get(&"key1").await, Some("value1"));
        
        // Non-existent key
        assert_eq!(cache.get(&"nonexistent").await, None);
        
        // Remove
        assert_eq!(cache.remove(&"key1").await, Some("value1"));
        assert_eq!(cache.get(&"key1").await, None);
    }

    #[tokio::test]
    async fn test_cache_expiration() {
        let cache = AsyncCache::new(Duration::from_millis(10), 100);
        
        cache.insert("key1", "value1").await.unwrap();
        assert_eq!(cache.get(&"key1").await, Some("value1"));
        
        // Wait for expiration
        sleep(Duration::from_millis(20)).await;
        assert_eq!(cache.get(&"key1").await, None);
    }

    #[tokio::test]
    async fn test_get_or_compute() {
        let cache = AsyncCache::new(Duration::from_secs(60), 100);
        
        let result = cache.get_or_compute("expensive_key", || async {
            sleep(Duration::from_millis(10)).await;
            Ok::<String, anyhow::Error>("computed_value".to_string())
        }).await.unwrap();
        
        assert_eq!(result, "computed_value");
        
        // Should be cached now
        let cached_result = cache.get(&"expensive_key").await;
        assert_eq!(cached_result, Some("computed_value".to_string()));
    }
}