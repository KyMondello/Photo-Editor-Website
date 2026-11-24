import { register } from "../auth/register.js";

const form = document.getElementById("register-form");
const errorEl = document.getElementById("form-error");

form.addEventListener("submit", async(e) => {
    e.preventDefault();
    errorEl.textContent = "";
    const button = form.querySelector("button");
    button.disabled = true;

    try{
        await register(form.username.value, form.email.value, form.password.value);
        window.location.href = "login.html";

    } catch (error) {
        errorEl.textContent = error.message;
    } finally {
        button.disabled = false;
    }

});