const defaultOptions = {
    defaultLimit: 10,
    maxLimit: 100
};
export const paginate = (options = defaultOptions) => {
    return (req, res, next) => {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(options.maxLimit || defaultOptions.maxLimit, Math.max(1, parseInt(req.query.limit) || options.defaultLimit || defaultOptions.defaultLimit));
        const skip = (page - 1) * limit;
        // Add pagination info to the request object
        req.pagination = {
            page,
            limit,
            skip
        };
        // Override json method to add pagination metadata
        const originalJson = res.json;
        res.json = function (data) {
            if (data && Array.isArray(data.data) && typeof data.total === 'number') {
                const total = data.total;
                const pages = Math.ceil(total / limit);
                const paginatedResponse = {
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
