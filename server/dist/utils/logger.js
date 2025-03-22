"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = exports.requestLogger = void 0;
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const path_1 = __importDefault(require("path"));
// Create logs directory if it doesn't exist
const logsDir = path_1.default.join(__dirname, '../../logs');
// Define log format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json(), winston_1.default.format.printf((_a) => {
    var { timestamp, level, message } = _a, meta = __rest(_a, ["timestamp", "level", "message"]);
    return JSON.stringify(Object.assign({ timestamp,
        level,
        message }, meta));
}));
// Create access log transport
const accessTransport = new winston_1.default.transports.DailyRotateFile({
    filename: path_1.default.join(logsDir, 'access-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info'
});
// Create error log transport
const errorTransport = new winston_1.default.transports.DailyRotateFile({
    filename: path_1.default.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error'
});
// Create console transport for development
const consoleTransport = new winston_1.default.transports.Console({
    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
});
// Create logger instance
const logger = winston_1.default.createLogger({
    format: logFormat,
    transports: [
        accessTransport,
        errorTransport,
        ...(process.env.NODE_ENV !== 'production' ? [consoleTransport] : [])
    ]
});
// Create request logger middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('API Request', {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
    });
    next();
};
exports.requestLogger = requestLogger;
// Create error logger middleware
const errorLogger = (err, req, res, next) => {
    logger.error('API Error', {
        method: req.method,
        url: req.originalUrl,
        error: {
            message: err.message,
            stack: err.stack
        },
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next(err);
};
exports.errorLogger = errorLogger;
exports.default = logger;
