import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { AuthModel } from '../models/auth.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

// Register User
const registerUser = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
    const { username, email, fullName, password } = req.body;

    // Validation - check if all fields are provided and not empty
    if (!username || !email || !fullName || !password) {
        throw new ApiError(400, "All fields are required");
    }

    // Trim and validate fields
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedFullName = fullName.trim();

    // Basic validation for username (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmedUsername)) {
        throw new ApiError(400, "Username must be 3-20 characters, alphanumeric and underscore only");
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        throw new ApiError(400, "Invalid email format");
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters");
    }

    // Check if user already exists with same username or email
    const existingUser = await AuthModel.findOne({
        $or: [
            { username: trimmedUsername },
            { email: trimmedEmail }
        ]
    });

    if (existingUser) {
        throw new ApiError(409, "User with this username or email already exists");
    }

    // Create new user
    const newUser = await AuthModel.create({
        username: trimmedUsername,
        email: trimmedEmail,
        fullName: trimmedFullName,
        password: password // Will be hashed by the schema pre-save hook
    });

    // Generate tokens
    const accessToken = newUser.generateJWT();
    const refreshToken = newUser.generateRefreshToken();

    // Update refresh token in database
    newUser.refreshToken = refreshToken;
    await newUser.save({ validateBeforeSave: false });

    // Remove sensitive fields from response
    const userResponse = {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        createdAt: newUser.createdAt
    };

    return res
        .status(201)
        .json(
            new ApiResponse(201, { user: userResponse, accessToken, refreshToken }, "User registered successfully")
        );
});

// Login User
const loginUser = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
    const { username, email, password } = req.body;

    // Validation - at least one identifier required
    if ((!username && !email) || !password) {
        throw new ApiError(400, "Username/Email and password are required");
    }

    // Find user by username or email
    const user = await AuthModel.findOne({
        $or: [
            { username: username?.toLowerCase() },
            { email: email?.toLowerCase() }
        ]
    });

    if (!user) {
        throw new ApiError(401, "Invalid username/email or password");
    }

    // Check if password matches
    const isPasswordMatch = await user.isPasswordMatch(password);
    if (!isPasswordMatch) {
        throw new ApiError(401, "Invalid username/email or password");
    }

    // Generate new tokens
    const accessToken = user.generateJWT();
    const refreshToken = user.generateRefreshToken();

    // Update refresh token in database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Remove sensitive fields from response
    const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName
    };

    return res
        .status(200)
        .json(
            new ApiResponse(200, { user: userResponse, accessToken, refreshToken }, "User logged in successfully")
        );
});

// Refresh Access Token
const refreshAccessToken = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
    const incomingRefreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    try {
        // Find user with matching refresh token
        const user = await AuthModel.findOne({ refreshToken: incomingRefreshToken });

        if (!user) {
            throw new ApiError(401, "Invalid or expired refresh token");
        }

        // Generate new access token
        const newAccessToken = user.generateJWT();

        return res
            .status(200)
            .json(
                new ApiResponse(200, { accessToken: newAccessToken }, "Access token refreshed successfully")
            );
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }
});

// Logout User
const logoutUser = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
    // Assuming req.user is set by auth middleware
    const userId = (req as any).user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    // Remove refresh token from database
    await AuthModel.findByIdAndUpdate(
        userId,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Register Admin
const registerAdmin = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
    const { username, email, fullName, password, adminSecret } = req.body;

    // Verify admin secret key
    const secretKey = process.env.ADMIN_SECRET_KEY;
    if (!adminSecret || adminSecret !== secretKey) {
        throw new ApiError(401, "Invalid admin secret key");
    }

    // Validation - check if all fields are provided and not empty
    if (!username || !email || !fullName || !password) {
        throw new ApiError(400, "All fields are required");
    }

    // Trim and validate fields
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedFullName = fullName.trim();

    // Basic validation for username (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmedUsername)) {
        throw new ApiError(400, "Username must be 3-20 characters, alphanumeric and underscore only");
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        throw new ApiError(400, "Invalid email format");
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters");
    }

    // Check if user already exists with same username or email
    const existingUser = await AuthModel.findOne({
        $or: [
            { username: trimmedUsername },
            { email: trimmedEmail }
        ]
    });

    if (existingUser) {
        throw new ApiError(409, "User with this username or email already exists");
    }

    // Create new admin user
    const newAdmin = await AuthModel.create({
        username: trimmedUsername,
        email: trimmedEmail,
        fullName: trimmedFullName,
        password: password,
        role: 'admin' // Set role as admin
    });

    // Generate tokens
    const accessToken = newAdmin.generateJWT();
    const refreshToken = newAdmin.generateRefreshToken();

    // Update refresh token in database
    newAdmin.refreshToken = refreshToken;
    await newAdmin.save({ validateBeforeSave: false });

    // Remove sensitive fields from response
    const userResponse = {
        _id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        fullName: newAdmin.fullName,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt
    };

    return res
        .status(201)
        .json(
            new ApiResponse(201, { user: userResponse, accessToken, refreshToken }, "Admin registered successfully")
        );
});

// Login Admin
const loginAdmin = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
    const { username, email, password } = req.body;

    // Validation - at least one identifier required
    if ((!username && !email) || !password) {
        throw new ApiError(400, "Username/Email and password are required");
    }

    // Find user by username or email
    const admin = await AuthModel.findOne({
        $or: [
            { username: username?.toLowerCase() },
            { email: email?.toLowerCase() }
        ]
    });

    if (!admin) {
        throw new ApiError(401, "Invalid username/email or password");
    }

    // Check if user is admin
    if (admin.role !== 'admin') {
        throw new ApiError(403, "Access denied: Admin role required");
    }

    // Check if password matches
    const isPasswordMatch = await admin.isPasswordMatch(password);
    if (!isPasswordMatch) {
        throw new ApiError(401, "Invalid username/email or password");
    }

    // Generate new tokens
    const accessToken = admin.generateJWT();
    const refreshToken = admin.generateRefreshToken();

    // Update refresh token in database
    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    // Remove sensitive fields from response
    const adminResponse = {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role
    };

    return res
        .status(200)
        .json(
            new ApiResponse(200, { user: adminResponse, accessToken, refreshToken }, "Admin logged in successfully")
        );
});

export { registerUser, loginUser, refreshAccessToken, logoutUser, registerAdmin, loginAdmin };