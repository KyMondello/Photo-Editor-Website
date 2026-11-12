import { loadAuthState, isAuthenticated, getCurrentUser } from "../auth.js";
import {logout} from "../auth/logout.js";
import {getCurrentImage} from "./canvas.js";

const loginLink = document.getElementById("login-link");
const menu = document.getElementById("account-menu");
const toggle = document.getElementById("account-toggle");
const usernnameElement = document.getElementById("account-username");
const dropdown = document.getElementById("account-dropdown");
const loadButton = document.getElementById("load-button");
const saveDbButton = document.getElementById("save-button");
const logoutButton = document.getElementById("logout-button");

//Opens dropdown
function openMenu() {
    refreshItemStates();
    dropdown.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
}

//Closes dropdown
function closeMenu(){
    dropdown.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
}

//Displays the current user's username in the account menu and hides the login link.
function showSignedInUser() {
    loginLink.hidden = true;
    menu.hidden = false;
    usernameElement.textContent = user.username;
}

async function init(){
    const ok = await loadAuthState();
    if(ok && isAuthenticated()) showSignedInUser(getCurrentUser());
    //else: leave login link visible and account menu hidden
    document.getElementById("auth-status").style.visibility = "visible";
    wireEvents();
}
init();

function refreshItemStates(){
    saveDbButton.disabled = !getCurrentImage();
}

function wireEvents() {
    toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.hidden ? openMenu() : closeMenu();
    });

    //CLick anywhere outside the menu to close it
    document.addEventListener("click", (e) => {
        if(!menu.contains(e.target)) closeMenu();
    });
    //Escape key closes the menu
    document.addEventListener("keydown", (e) => {
        if(e.key === "Escape" && !dropdown.hidden) {closeMenu(); toggle.focus();}
    });

    logoutButton.addEventListener("click", handleLogout);
    saveDbButton.addEventListener("click", handleSaveToAccount);
    loadButton.addEventListener("click", handleLoadFromAccount);
}

async function handleLogout() {
    if(getCurrentImage() && !confirm("Sign out? Unsaved edits will be lost.")) return;
    try {
        await logout();
        window.location.href = "index.html";
    } catch (error) {
        alert(error.message || "Logout failed.");
    }
} 

async function handleSaveToAccount() {
    //TO DO: Implement saving the current image to the user's account
}

async function handleLoadFromAccount() {
    //TO DO: Implement loading an image from the user's account
}

await loadAuthState();