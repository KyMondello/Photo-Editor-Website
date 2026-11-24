// authStatus.js
// Navbar login state for pages that only have the simple #auth-status slot
// (the home page). The editor uses components/accountMenu.js instead.
import { loadAuthState, isAuthenticated, getCurrentUser } from "../auth/authState.js";
import { logout } from "../auth/logout.js";

const slot = document.getElementById("auth-status");

async function init() {
    if (!slot) return;

    const ok = await loadAuthState();
    // Logged out: leave the Login link that is already in the HTML.
    if (!ok || !isAuthenticated()) return;

    const name = document.createElement("span");
    name.className = "auth-username";
    name.textContent = getCurrentUser().username; // textContent: never inject as HTML

    const button = document.createElement("button");
    button.type = "button";
    button.className = "logout-button";
    button.textContent = "Logout";
    button.addEventListener("click", async () => {
        try {
            await logout();
            window.location.reload();
        } catch (error) {
            alert(error.message || "Logout failed.");
        }
    });

    slot.replaceChildren(name, button);
}

init();
