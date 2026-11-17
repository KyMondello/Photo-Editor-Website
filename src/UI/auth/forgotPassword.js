//forgotPassword.js
// Handles the username and email form on the forgot-password page.

const form = document.getElementById("forgotPasswordForm");
const message = document.getElementById("message");

form.addEventListener("submit", async function (event) {
    // Prevent the page from refreshing when the form is submitted.
    event.preventDefault();

    // Read the username and email entered by the user.
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();

    // Make sure both fields contain information.
    if (!username || !email) {
        message.textContent = "Please enter your username and email.";
        return;
    }

    try {
        // Send the account information to the backend.
        const response = await fetch("/api/auth/forgotPassword", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                username: username,
                email: email
            })
        });

        const data = await response.json();

        // Display the result returned by the backend.
        if (!response.ok) {
            message.textContent =
                data.message || "Unable to start the password reset process.";
            return;
        }

        // Continue to the second page after the backend
        // has established an authorized password-reset session.
        window.location.href = "reset-password.html";

    }
    catch (error) {
        message.textContent = "Unable to contact the server.";
        console.error("Password reset request failed:", error);
    }
});
