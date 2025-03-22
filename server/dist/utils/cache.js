import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
/**
 * Get a value from the cache
 * @param key - The cache key
 * @returns The cached value or null if not found
 */
export const getCached = async (key) => {
    try {
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
    }
    catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
};
/**
 * Set a value in the cache with optional expiration
 * @param key - The cache key
 * @param value - The value to cache
 * @param expirySeconds - Optional expiration time in seconds
 */
export const setCached = async (key, value, expirySeconds) => {
    try {
        const serialized = JSON.stringify(value);
        if (expirySeconds) {
            await redis.setex(key, expirySeconds, serialized);
        }
        else {
            await redis.set(key, serialized);
        }
    }
    catch (error) {
        console.error('Cache set error:', error);
    }
};
/**
 * Clear a value from the cache
 * @param key - The cache key to clear
 */
export const clearCache = async (key) => {
    try {
        await redis.del(key);
    }
    catch (error) {
        console.error('Cache clear error:', error);
    }
};
