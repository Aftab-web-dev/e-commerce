import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

// Middleware to verify admin role
const verifyAdmin = asyncHandler(async (req: ExpressRequest, res: ExpressResponse, next?: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
        throw new ApiError(401, "User not authenticated");
    }

    if (user.role !== 'admin') {
        throw new ApiError(403, "Access denied: Admin role required");
    }

    next?.();
});

export { verifyAdmin };
