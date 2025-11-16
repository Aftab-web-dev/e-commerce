import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { AuthModel } from '../models/auth.model';
import { asyncHandler } from '../utils/asyncHandler';

// Extend Express Request to include user property
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

// Middleware to verify JWT token
const verifyJWT = asyncHandler(async (req: ExpressRequest, res: ExpressResponse, next?: NextFunction) => {
    // Get token from Authorization header or cookies
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.accessToken;

    if (!token) {
        throw new ApiError(401, "Access token is required");
    }

    // Verify and decode the token
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
        throw new ApiError(500, "ACCESS_TOKEN_SECRET is not configured");
    }

    const decoded: any = jwt.verify(token, secret);

    // Find user in database to ensure user still exists
    const user = await AuthModel.findById(decoded._id).select('-password');

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    // Attach user to request
    req.user = user;
    next?.();
});

export { verifyJWT };
