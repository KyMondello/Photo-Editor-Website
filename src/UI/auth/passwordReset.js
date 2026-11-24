//passwordReset.js
//Sets a new password. Only works after the forgot-password step has
//verified the account (the backend stores that in a short-lived cookie).

const form = document.getElementById("passwordResetForm");
const message = document.getElementById("message");

form.addEventListener("submit", async function (event) {
    // Prevent the page from refreshing when the form is submitted.
    event.preventDefault();

    // Read the new password and its confirmation.
    const newPassword = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (!newPassword || !confirmPassword) {
        message.textContent = "Please enter and confirm a new password.";
        return;
    }

    if (newPassword !== confirmPassword) {
        message.textContent = "The passwords do not match.";
        return;
    }

    try {
        const response = await fetch("/api/auth/reset-password", {
            //information to the server
            method: "POST",
            // Tell Express that the body is JSON
            headers: { "Content-Type": "application/json" },
            // Include the reset-session cookie
            credentials: "include",
            body: JSON.stringify({
                newPassword: newPassword,
                confirmPassword: confirmPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Unable to reset password.";
            return;
        }

        // Success: send the user to log in with the new password.
        message.textContent = "Password changed. Redirecting to login...";
        setTimeout(function () {
            window.location.href = "/login.html";
        }, 1500);
    }
    catch (error) {
        message.textContent = "Unable to contact the server.";

        console.error("Password reset request failed:", error);
    }
});
