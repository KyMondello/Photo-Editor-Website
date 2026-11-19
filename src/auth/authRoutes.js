//authRoutes.js
import express from "express";
const router = express.Router();

import {
    register,
    login,
    logout,
    getCurrentUser,
    requestPasswordReset,
    resetPassword
} from "./authController.js";

import { requireLogin } from "./authMiddleware.js";

// Create an account.
router.post("/register", register);

// Log in using username and password.
router.post("/login", login);

// Clear the login cookie.
router.post("/logout", logout);

// Check the current login.
router.get("/me", requireLogin, getCurrentUser);

// Request a password-reset link.
router.post("/forgot-password", requestPasswordReset);

// Set a new password using a verified recovery token.
router.post("/reset-password", resetPassword);

export default router;
