import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

interface AppError extends Error {
  status?: number;
  code?: string;
}

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // Check if it's an operational error
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message
    });
  }

  // Check for MongoDB errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: err.message
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      error: err.message
    });
  }

  // Handle MongoDB duplicate key error
  if (err.code && Number(err.code) === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate value error',
      error: err.message
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler; 