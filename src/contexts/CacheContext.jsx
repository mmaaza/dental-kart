import React, { createContext, useState, useEffect, useContext } from 'react';

// Cache context
export const CacheContext = createContext();

// Cache version - increment when changing data structure
const CACHE_VERSION = '1.0';

// Cache expiration time in milliseconds (default: 1 hour)
const CACHE_EXPIRATION = 60 * 60 * 1000;

// Maximum size for individual cache items in bytes (5MB)
const MAX_CACHE_SIZE = 5 * 1024 * 1024;

// Cache storage prefix
const CACHE_PREFIX = 'mbnepal_cache_';

export const CacheProvider = ({ children }) => {
  const [cache, setCache] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cache from localStorage on mount
  useEffect(() => {
    try {
      // Get all cache keys from localStorage that match our prefix and version
      const cacheKeys = Object.keys(localStorage)
        .filter(key => key.startsWith(CACHE_PREFIX));
      
      const loadedCache = {};
      
      // Load and validate each cache item
      cacheKeys.forEach(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          
          // Skip if version doesn't match or item is invalid
          if (!item || item.version !== CACHE_VERSION) {
            localStorage.removeItem(key);
            return;
          }
          
          // Extract the actual cache key (without prefix)
          const cacheKey = key.substring(CACHE_PREFIX.length);
          loadedCache[cacheKey] = item;
        } catch (err) {
          // Remove invalid cache item
          localStorage.removeItem(key);
        }
      });
      
      setCache(loadedCache);
    } catch (error) {
      console.error('Error loading cache from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save individual cache items to localStorage when they change
  const persistCacheItem = (key, value) => {
    try {
      localStorage.setItem(
        `${CACHE_PREFIX}${key}`, 
        JSON.stringify(value)
      );
    } catch (error) {
      // Handle storage quota exceeded or other localStorage errors
      if (error.name === 'QuotaExceededError' || 
          error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        // Clear expired cache items first
        clearExpiredCache();
        
        // Try again after clearing
        try {
          localStorage.setItem(
            `${CACHE_PREFIX}${key}`, 
            JSON.stringify(value)
          );
        } catch (retryError) {
          console.error('Storage quota still exceeded after clearing expired cache items', retryError);
        }
      } else {
        console.error('Error saving cache to localStorage:', error);
      }
    }
  };

  // Clear expired cache items
  const clearExpiredCache = () => {
    const now = new Date().getTime();
    const newCache = { ...cache };
    let hasChanges = false;
    
    // Check all items for expiration
    Object.entries(newCache).forEach(([key, item]) => {
      if (now - item.timestamp > item.expiration) {
        delete newCache[key];
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
        hasChanges = true;
      }
    });
    
    // Update state only if there were changes
    if (hasChanges) {
      setCache(newCache);
    }
    
    return hasChanges;
  };

  // Estimate size of data in bytes
  const getDataSize = (data) => {
    try {
      const serialized = JSON.stringify(data);
      // In JavaScript, each character is 2 bytes
      return serialized.length * 2;
    } catch (e) {
      return 0;
    }
  };

  // Get data from cache, returns null if not found or expired
  const getCachedData = (key) => {
    if (!isInitialized || !cache[key]) return null;

    // Check if cache has expired
    const { timestamp, data, expiration = CACHE_EXPIRATION } = cache[key];
    const now = new Date().getTime();
    
    if (now - timestamp > expiration) {
      // Cache expired, remove it
      const newCache = { ...cache };
      delete newCache[key];
      setCache(newCache);
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    
    return data;
  };

  // Add or update data in cache with custom expiration
  const setCachedData = (key, data, options = {}) => {
    // Skip caching if data is too large
    const dataSize = getDataSize(data);
    if (dataSize > MAX_CACHE_SIZE) {
      console.warn(`Cache item ${key} exceeds max size (${dataSize} bytes)`);
      return;
    }

    const cacheItem = {
      data,
      timestamp: new Date().getTime(),
      version: CACHE_VERSION,
      expiration: options.expiration || CACHE_EXPIRATION,
      size: dataSize
    };
    
    setCache(prevCache => {
      const newCache = { 
        ...prevCache, 
        [key]: cacheItem 
      };
      return newCache;
    });
    
    // Persist to localStorage
    persistCacheItem(key, cacheItem);
  };

  // Background refresh - fetch new data while serving from cache
  const refreshInBackground = async (key, fetchFunction, options = {}) => {
    try {
      // Get fresh data
      const result = await fetchFunction();
      
      // Update cache with new data
      setCachedData(key, result, options);
      return result;
    } catch (error) {
      console.error(`Background refresh failed for ${key}:`, error);
      return null;
    }
  };

  // Get cached data, but also refresh it in the background if needed
  const getWithBackgroundRefresh = (key, fetchFunction, options = {}) => {
    const cachedData = getCachedData(key);
    
    // If we have cached data but it's getting stale (over 50% of expiration time)
    if (cachedData && cache[key]) {
      const { timestamp, expiration = CACHE_EXPIRATION } = cache[key];
      const now = new Date().getTime();
      const age = now - timestamp;
      const refreshThreshold = expiration * 0.5; // 50% of expiration time
      
      if (age > refreshThreshold) {
        // Refresh in background if data is getting stale
        refreshInBackground(key, fetchFunction, options);
      }
    } 
    // If no cached data, don't block rendering - return null and let component handle refresh
    
    return cachedData;
  };

  // Clear specific cache entry
  const clearCacheItem = (key) => {
    setCache(prevCache => {
      const newCache = { ...prevCache };
      delete newCache[key];
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return newCache;
    });
  };

  // Clear all cache
  const clearAllCache = () => {
    // Remove all cache items with our prefix from localStorage
    Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
      
    setCache({});
  };
  
  // Get cache stats
  const getCacheStats = () => {
    let totalSize = 0;
    let itemCount = 0;
    
    Object.values(cache).forEach(item => {
      totalSize += item.size || 0;
      itemCount++;
    });
    
    return {
      totalSize,
      itemCount,
      maxSize: MAX_CACHE_SIZE
    };
  };

  // Run cache cleanup periodically
  useEffect(() => {
    if (!isInitialized) return;
    
    // Clean up expired items once on initialization
    clearExpiredCache();
    
    // Set up periodic cleanup (every 5 minutes)
    const cleanupInterval = setInterval(clearExpiredCache, 5 * 60 * 1000);
    
    return () => clearInterval(cleanupInterval);
  }, [isInitialized]);

  return (
    <CacheContext.Provider value={{ 
      getCachedData, 
      setCachedData,
      getWithBackgroundRefresh,
      clearCacheItem, 
      clearAllCache,
      getCacheStats,
      isInitialized
    }}>
      {children}
    </CacheContext.Provider>
  );
};

// Custom hook to use the cache context
export const useCache = () => useContext(CacheContext);