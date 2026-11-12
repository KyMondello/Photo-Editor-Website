// authMiddleware.js
// Checks whether a request has a valid login token.

const jwt = require("jsonwebtoken");
// Checks whether a request has a valid login token.
function requireLogin(req, res, next) {
    // The server cannot verify tokens without its secret.
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not configured.");

        return res.status(500).json({
            message: "Authentication is not configured."
        });
    }

    // Read the token from the HTTP-only cookie.
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            message: "You must be logged in."
        });
    }
    try {
        // Verify the signature and expiration.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Use the verified database user ID.
        req.user = {
            id: decoded.userId
        };
        return next();
    } 
    catch (error) {
        return res.status(401).json({
            message: "Invalid or expired login."
        });
    }
}

module.exports = { requireLogin };
