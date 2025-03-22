import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta
    });
  })
);

// Create access log transport
const accessTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, 'access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info'
});

// Create error log transport
const errorTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error'
});

// Create console transport for development
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
});

// Create logger instance
const logger = winston.createLogger({
  format: logFormat,
  transports: [
    accessTransport,
    errorTransport,
    ...(process.env.NODE_ENV !== 'production' ? [consoleTransport] : [])
  ]
});

// Create request logger middleware
export const requestLogger = (req: any, res: any, next: any) => {
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

// Create error logger middleware
export const errorLogger = (err: any, req: any, res: any, next: any) => {
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

export default logger; 