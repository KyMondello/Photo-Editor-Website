
//authController.js
//Receives authentication requests and sends
//appropriate HTTP responses to the frontend.

const authService = require("./authService");
const passwordResetService = require("./passwordResetService");
const userQueries = require("../db/queries/userQueries");

// Creates a new account.
async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        const user = await authService.register(
            username,
            email,
            password
        );

        // Only return safe account fields.
        return res.status(201).json({
            message: "Account created successfully.",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } 
    catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "That username or email is already in use."
            });
        }

        // Validation errors can be returned as client errors.
        if (error.statusCode === 400) {
            return res.status(400).json({
                message: error.message
            });
        }
        console.error("Registration failed:", error);

        return res.status(500).json({
            message: "Registration could not be completed."
        });
    }
}

// Authenticates a user and sets the login cookie.
async function login(req, res) {
    try {
        const { username, password } = req.body;

        const result = await authService.login(username, password);

        res.cookie("token", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 1000,
            path: "/"
        });

        return res.json({
            message: "Login successful.",
            user: result.user
        });
    } 
    catch (error) {
        if (error.message === "Authentication is not configured.") {
            return res.status(500).json({
                message: error.message
            });
        }
        return res.status(401).json({
            message: "Invalid username or password."
        });
    }
}

// Clears the login cookie.
function logout(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/"
    });

    return res.json({
        message: "Logout successful."
    });
}

// Returns information about the logged-in user.
async function getCurrentUser(req, res) {
    try {
        const user = await userQueries.findUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User account not found."
            });
        }
        return res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } 
    catch (error) {
        console.error("Current user lookup failed:", error);

        return res.status(500).json({
            message: "Could not retrieve the current user."
        });
    }
}

// Starts password recovery.
// Checks the username and email before starting password recovery.
async function requestPasswordReset(req, res) {
    try {
        const { username, email } = req.body;

        await passwordResetService.requestReset(username, email);

        return res.json({
            message: "Account details verified."
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "The username or email is incorrect."
        });
    }
}

// Changes the password using a verified reset token.
async function resetPassword(req, res) {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "The passwords do not match."});
        }
        await passwordResetService.resetPassword(token, newPassword);

        return res.json({ message: "Password changed successfully."});
    } 
    catch (error) {
        if (error.statusCode === 400) {
            return res.status(400).json({
                message: error.message
            });
        }
        console.error("Password reset failed:", error);

        return res.status(400).json({
            message: "The reset link is invalid or expired, or the password could not be changed."
        });
    }
}

module.exports = { register, login, logout, getCurrentUser, requestPasswordReset, resetPassword};
