//this will be server side but is here for now to prevent acess from hacker 
//passwordService.js
// Handles password hashing and verification for both reg and log.
// We never need to decrypt or store the original password.
const bcrypt = require("bcrypt");

async function hashPassword(password) {
    const saltRounds = 12;

    const hashedPassword = await bcrypt.hash(
        password,
        saltRounds
    );

    return hashedPassword;
}

// Check whether the entered password matches the stored hash.
async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}
// Make these functions available to authService.js.
module.exports = {
    hashPassword,
    verifyPassword
};
