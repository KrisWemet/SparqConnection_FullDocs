import Redis from 'ioredis';
import { logger } from '../utils/logger';
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});
redis.on('error', (error) => {
    logger.error('Redis connection error:', error);
});
const defaultOptions = {
    expire: 3600, // 1 hour default
};
export const cache = (options = defaultOptions) => {
    return async (req, res, next) => {
        try {
            const key = typeof options.key === 'function'
                ? options.key(req)
                : options.key || req.originalUrl;
            // Check if we have cached data
            const cachedData = await redis.get(key);
            if (cachedData) {
                return res.json(JSON.parse(cachedData));
            }
            // Store the original json method
            const originalJson = res.json;
            // Override json method to cache the response
            res.json = function (data) {
                // Cache the data
                redis.setex(key, options.expire || defaultOptions.expire, JSON.stringify(data))
                    .catch((error) => logger.error('Redis set error:', error));
                // Call the original json method
                return originalJson.call(this, data);
            };
            next();
        }
        catch (error) {
            logger.error('Cache middleware error:', error);
            next();
        }
    };
};
export const clearCache = async (pattern) => {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    }
    catch (error) {
        logger.error('Clear cache error:', error);
    }
};
export const invalidateCache = (pattern) => {
    return async (_req, _res, next) => {
        try {
            await clearCache(pattern);
            next();
        }
        catch (error) {
            logger.error('Invalidate cache error:', error);
            next();
        }
    };
};
