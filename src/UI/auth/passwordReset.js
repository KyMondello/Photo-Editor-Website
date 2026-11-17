//passwordReset.js
//functuional resets user password only operates after forgot password

const form = document.getElementById("passwordResetForm");
const message = document.getElementById("message");

form.addEventListener("submit", async function (event) {

    const username = document.getElementById("password").value.trim();
    
    if (!password) {
        message.textContent = "Please a new password.";
        return;
    }
    try{
    const response = await fetch("/api/auth/passwordReset",
        {
            //information to the server
            method: "POST",
            // Tell Express that the body is JSON
            headers: { "Content-Type": "application/json"},
             // Include authentication cookies
             // The backend will create a login cookie
            credentials: "include", 
            // Convert password into JSON         
            body: JSON.stringify({password: password})
        });

        const data = await response.json();
        if (!response.ok) {
            message.textContent = data.message || "Unable to reset password.";
            return;
        }
    }
        catch (error) {
        message.textContent = "Unable to contact the server.";

        console.error("Password reset request failed:", error);
    }

});
