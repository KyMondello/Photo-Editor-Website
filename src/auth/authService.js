// authService.js
//Handles the main authentication operations.
// Registration: Validate input check for existing account hash password
// Login: Find username verify password create login token.

const jwt = require("jsonwebtoken");

//database query functions.
const userQueries = require("../db/queries/userQueries");

//password functions.
const {
    hashPassword,
    verifyPassword
} = require("./passwordService");

// input validation.
const {validateRegistration} = require("./validation");

// Creates an error that the controller can return as HTTP 409.
function createConflictError(message) {
    const error = new Error(message);
    error.statusCode = 409;
    return error;
}

// Register a new user.
async function register(username, email, password) {

    // Validate the information first.
    validateRegistration(username, email, password);

    // Normalize the values used for account lookups.
    username = username.trim();
    email = email.trim().toLowerCase();

    // Check whether this username is already taken.
    const existingUsername = await userQueries.findUserByUsername(username);

    if (existingUsername) {
        throw createConflictError("That username is already taken.");
    }

    // Check whether this email is already registered.
    const existingEmail = await userQueries.findUserByEmail(email);

    if (existingEmail) {
        throw createConflictError("An account with that email already exists.");
    }

    // Hash the password before saving it.
    const hashedPassword = await hashPassword(password);

    // database layer inserts the new user and hashed password
    return userQueries.createUser( username, email, hashedPassword);
}
// Log in using a username and password.
async function login(username, password) {
    // Reject missing or incorrectly typed login information.
    if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        !username.trim() ||
        !password
    ) {
        throw new Error("Please enter your username and password.");
    }
    // Look up the account using its username.
    const user = await userQueries.findUserByUsername(//maybe by email
        username.trim()
    );
    // Use the same message for a missing account or wrong password.
    if (!user) {
        throw new Error("Invalid username or password.");
    }

    // Compare the entered password with the stored bcrypt hash.
    const passwordCorrect = await verifyPassword(password, user.hashed_password);

    if (!passwordCorrect) {
        throw new Error("Invalid username or password.");
    }

    // Require a secret key in the server's environment.
    if (!process.env.JWT_SECRET) {
        throw new Error("Authentication is not configured.");
    }
    // Create a signed token containing the user's database ID.
    const token = jwt.sign(
        {
            userId: user.id
        },
        process.env.JWT_SECRET,
        {
            algorithm: "HS256",
            expiresIn: "1h"
        }
    );
    // Return the token for the controller to place in a cookie.
    // Return only safe user fields to the frontend.
    return {
        token: token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    };
}

// Make the functions available to authController.js.
module.exports = {register, login};
