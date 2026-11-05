// Stores the current user's information in the frontend.
// The backend remains responsible for verifying authentication.
let currentUser = null;
let authenticated = false;

// Checks whether the user has a valid login cookie.
export async function loadAuthState() {
    try {
        const response = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include"
        });

        // A failed response means the user is not authenticated.
        if (!response.ok) {
            currentUser = null;
            authenticated = false;
            return false;
        }

        // Read the user returned by the backend.
        const data = await response.json();

        currentUser = data.user;
        authenticated = true;

        return true;
    } catch (error) {
        // If the server cannot be reached, do not assume the user is logged in.
        currentUser = null;
        authenticated = false;

        console.error("Unable to check authentication:", error);

        return false;
    }
}
// Returns whether the most recent authentication check succeeded.
export function isAuthenticated() {
    return authenticated;
}

// Returns the currently loaded user information.
export function getCurrentUser() {
    return currentUser;
}

// Redirects visitors to login if they are not authenticated.
export function requireAuthentication() {
    if (!authenticated) {
        window.location.href = "/login.html";
        return false;
    }

    return true;
}
