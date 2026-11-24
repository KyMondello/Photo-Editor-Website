import {login} from "../auth/login.js";

const form = document.getElementById("login-form");
const errorElement = document.getElementById("form-error");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorElement.textContent = ""; // Clear previous error messages
    const button = form.querySelector("button");
    button.disabled = true; // Disable the button to prevent multiple submissions

    try{
        await login(form.username.value.trim(), form.password.value);
        window.location.href = "editor.html"; // Redirect to editor page on successful login
    } catch (error) {
        errorElement.textContent = error.message; // Display error message
    } finally {
        button.disabled = false; // Re-enable the button    
    }
});