//authRoutes.js

const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

// Slows down password guessing and repeated reset attempts.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again later." }
});

const {
    register,
    login,
    logout,
    getCurrentUser,
    requestPasswordReset,
    resetPassword
} = require("./authController");

const { requireLogin } = require("./authMiddleware");

// Create an account.
router.post("/register", authLimiter, register);

// Log in using username and password.
router.post("/login", authLimiter, login);

// Clear the login cookie.
router.post("/logout", logout);

// Check the current login.
router.get("/me", requireLogin, getCurrentUser);

// Request a password-reset link.
router.post("/forgot-password", authLimiter, requestPasswordReset);

// Set a new password using the reset session from /forgot-password.
router.post("/reset-password", authLimiter, resetPassword);

module.exports = router;
