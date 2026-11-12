// passwordResetService.js
// Handles the two-step password reset.
// Step 1 requestReset- the username and email must match one account.
//   A short-lived reset token is created for the controller to put in a cookie
// Step 2 resetPassword- the token is verified and the new password is saved
// The reset token is signed with JWT_SECRET plus the user's CURRENT password hash

const jwt = require("jsonwebtoken");

// database query functions.
const userQueries = require("../db/queries/userQueries");

// password functions.
const { hashPassword } = require("./passwordService");

// input validation.
const { validatePassword } = require("./validation");

const RESET_PURPOSE = "password-reset";
const RESET_EXPIRES_IN = "10m";

// Creates an error that the controller can return as HTTP 400.
function createClientError(message) {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
}

// The server cannot sign or verify tokens without its secret.
function requireSecret() {
    if (!process.env.JWT_SECRET) {
        throw new Error("Authentication is not configured.");
    }
}

// Each user gets their own signing key for reset tokens.
function resetSecretFor(user) {
    return process.env.JWT_SECRET + user.hashed_password;
}

// Step 1: check the username and email, then create a reset token.
async function requestReset(username, email) {
    requireSecret();

    if (typeof username !== "string" || typeof email !== "string") {
        throw createClientError("The username or email is incorrect.");
    }

    const user = await userQueries.findUserByUsername(username.trim());

    // Same message whether the username or the email was wrong.
    if (
        !user ||
        typeof user.email !== "string" ||
        user.email.trim().toLowerCase() !== email.trim().toLowerCase()
    ) {
        throw createClientError("The username or email is incorrect.");
    }

    return jwt.sign(
        {
            userId: user.id,
            username: user.username,
            purpose: RESET_PURPOSE
        },
        resetSecretFor(user),
        {
            algorithm: "HS256",
            expiresIn: RESET_EXPIRES_IN
        }
    );
}

// Step 2: verify the reset token and save the new password.
async function resetPassword(token, newPassword) {
    requireSecret();

    const invalidSession = () =>
        createClientError("The reset session is invalid or expired. Please start again.");

    if (typeof token !== "string" || !token) {
        throw invalidSession();
    }

    // Read the claims (without trusting them yet) to find which user to check.
    const claims = jwt.decode(token);

    if (
        !claims ||
        claims.purpose !== RESET_PURPOSE ||
        typeof claims.username !== "string"
    ) {
        throw invalidSession();
    }

    const user = await userQueries.findUserByUsername(claims.username);

    if (!user || user.id !== claims.userId) {
        throw invalidSession();
    }

    // Now verify the signature and expiration with this user's own key.
    try {
        jwt.verify(token, resetSecretFor(user), { algorithms: ["HS256"] });
    } catch (error) {
        throw invalidSession();
    }

    // Apply the same password rules used at registration.
    validatePassword(newPassword);

    const hashedPassword = await hashPassword(newPassword);

    await userQueries.updatePassword(user.id, hashedPassword);
}

module.exports = { requestReset, resetPassword };
