import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from 'cookie-parser'
import { ApiError } from './utils/ApiError';


const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}
));

app.use(express.json({limit: '16mb'}));
app.use(express.urlencoded({extended: true , limit: '16kb'}));
app.use(express.static("public"))
app.use(cookieParser());

//routes import
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/products.routes";
import cartRoutes from "./routes/cart.routes";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode,
            message: err.message,
            errors: err.errors,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            statusCode: 401,
            message: 'Invalid token',
            errors: []
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            statusCode: 401,
            message: 'Token expired',
            errors: []
        });
    }

    // Generic error response
    res.status(500).json({
        success: false,
        statusCode: 500,
        message: err.message || 'Internal Server Error',
        errors: [],
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

export {app};