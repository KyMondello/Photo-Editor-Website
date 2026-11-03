
// validation.js
// Checks that user information is valid.
// The backend validates information even if the frontend
// already performs validation.

// Creates an error that the controller can return as HTTP 400.
function createValidationError(message) {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
}

// Checks whether a password meets the project requirements.
function validatePassword(password) {

    if (typeof password !== "string") {
        throw createValidationError("Please enter a password.");
    }

    // Require passwords to be between 9 and 64 characters.
    if (password.length < 9 || password.length > 64) {
        throw createValidationError(
            "Password must be between 9 and 64 characters."
        );
    }

    // Require at least one lowercase letter.
    if (!/[a-z]/.test(password)) {
        throw createValidationError(
            "Password must contain at least one lowercase letter."
        );
    }

    // Require at least one uppercase letter.
    if (!/[A-Z]/.test(password)) {
        throw createValidationError(
            "Password must contain at least one uppercase letter."
        );
    }

    // Require at least one number.
    if (!/[0-9]/.test(password)) {
        throw createValidationError(
            "Password must contain at least one number."
        );
    }

    // Require at least one special character.
    if (!/[^a-zA-Z0-9]/.test(password)) {
        throw createValidationError(
            "Password must contain at least one special character."
        );
    }
}

// Checks the information provided during registration.
function validateRegistration(username, email, password) {

    // Make sure a username was provided as a string.
    if (typeof username !== "string") {
        throw createValidationError("Please enter a username.");
    }

    username = username.trim();

    // Require usernames to be between 5 and 64 characters.
    if (username.length < 5 || username.length > 64) {
        throw createValidationError(
            "Username must be between 5 and 64 characters."
        );
    }

    // Allow only letters, numbers, and underscores.
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw createValidationError(
            "Username can only contain letters, numbers, and underscores."
        );
    }

    // Make sure a valid email address was provided.
    if (
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
    ) {
        throw createValidationError("Please enter a valid email address.");
    }

    // Check the password using the shared password rules.
    validatePassword(password);
}

// Make the functions available to other backend files.
module.exports = {
    validateRegistration,
    validatePassword
};

