import { Request, Response, NextFunction } from 'express';

export interface PaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const defaultOptions: PaginationOptions = {
  defaultLimit: 10,
  maxLimit: 100
};

export const paginate = (options: PaginationOptions = defaultOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      options.maxLimit || defaultOptions.maxLimit!,
      Math.max(1, parseInt(req.query.limit as string) || options.defaultLimit || defaultOptions.defaultLimit!)
    );
    const skip = (page - 1) * limit;

    // Add pagination info to the request object
    req.pagination = {
      page,
      limit,
      skip
    };

    // Override json method to add pagination metadata
    const originalJson = res.json;
    res.json = function(data) {
      if (data && Array.isArray(data.data) && typeof data.total === 'number') {
        const total = data.total;
        const pages = Math.ceil(total / limit);

        const paginatedResponse: PaginatedResponse<any> = {
          data: data.data,
          pagination: {
            total,
            page,
            limit,
            pages,
            hasNext: page < pages,
            hasPrev: page > 1
          }
        };

        return originalJson.call(this, paginatedResponse);
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      pagination: {
        page: number;
        limit: number;
        skip: number;
      };
    }
  }
} 