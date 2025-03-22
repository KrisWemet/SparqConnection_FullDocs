"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateCache = exports.clearCache = exports.cache = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("../utils/logger");
const redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});
redis.on('error', (error) => {
    logger_1.logger.error('Redis connection error:', error);
});
const defaultOptions = {
    expire: 3600, // 1 hour default
};
const cache = (options = defaultOptions) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const key = typeof options.key === 'function'
                ? options.key(req)
                : options.key || req.originalUrl;
            // Check if we have cached data
            const cachedData = yield redis.get(key);
            if (cachedData) {
                return res.json(JSON.parse(cachedData));
            }
            // Store the original json method
            const originalJson = res.json;
            // Override json method to cache the response
            res.json = function (data) {
                // Cache the data
                redis.setex(key, options.expire || defaultOptions.expire, JSON.stringify(data))
                    .catch((error) => logger_1.logger.error('Redis set error:', error));
                // Call the original json method
                return originalJson.call(this, data);
            };
            next();
        }
        catch (error) {
            logger_1.logger.error('Cache middleware error:', error);
            next();
        }
    });
};
exports.cache = cache;
const clearCache = (pattern) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const keys = yield redis.keys(pattern);
        if (keys.length > 0) {
            yield redis.del(...keys);
        }
    }
    catch (error) {
        logger_1.logger.error('Clear cache error:', error);
    }
});
exports.clearCache = clearCache;
const invalidateCache = (pattern) => {
    return (_req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield (0, exports.clearCache)(pattern);
            next();
        }
        catch (error) {
            logger_1.logger.error('Invalidate cache error:', error);
            next();
        }
    });
};
exports.invalidateCache = invalidateCache;
