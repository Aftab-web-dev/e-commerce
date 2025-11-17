import { Router } from "express";
import {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    registerAdmin,
} from "../controllers/auth.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/register-admin").post(registerAdmin);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes (require auth middleware)
router.route("/logout").post(verifyJWT, logoutUser);

export default router;