import compression from 'compression';
import { Request, Response } from 'express';

// Only compress responses larger than 1KB
const shouldCompress = (req: Request, res: Response) => {
  if (req.headers['x-no-compression']) {
    return false;
  }
  
  // Fallback to standard compression behavior
  return compression.filter(req, res);
};

// Configure compression middleware
const compressionMiddleware = compression({
  // Compression level (0-9)
  level: 6,
  // Filter function to determine which responses to compress
  filter: shouldCompress,
  // Only compress responses larger than 1KB
  threshold: 1024,
});

export default compressionMiddleware; 