
// register.js
// Sends new account information to the backend.
// The frontend does not connect directly to the database.

export async function register(username, email, password) {

    // Send the registration information to the backend.
    const response = await fetch("/api/auth/register", {
        method: "POST",

        // Tell the server that the request contains JSON.
        headers: {
            "Content-Type": "application/json"
        },

        // Include cookies if the browser has any.
        credentials: "include",

        // Send the registration fields.
        body: JSON.stringify({
            username: username.trim(),
            email: email.trim(),
            password: password
        })
    });

    // Read the response from the server.
    let data;

    try {
        data = await response.json();
    } catch (error) {
        throw new Error("The server returned an invalid response.");
    }

    // Display an error if registration failed.
    if (!response.ok) {
        throw new Error(
            data.message || "Registration failed."
        );
    }

    // Return the successful registration result.
    return data;
}
