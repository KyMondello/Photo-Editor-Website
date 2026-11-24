// accountMenu.js
// Editor navbar: shows Login or the account dropdown, and handles
// Load / Save to account and Logout.
import { loadAuthState, isAuthenticated, getCurrentUser } from "../auth/authState.js";
import { logout } from "../auth/logout.js";
import { listImages, downloadLatestImage, createImage, saveImageVersion } from "../api/images.js";
import { getCurrentImage, loadImageFromBlob, hasUnsavedEdits, markSaved } from "./canvas.js";
import { renderExport } from "./save.js";

const authStatus = document.getElementById("auth-status");
const loginLink = document.getElementById("login-link");
const menu = document.getElementById("account-menu");
const toggle = document.getElementById("account-toggle");
const usernameElement = document.getElementById("account-username");
const dropdown = document.getElementById("account-dropdown");
const loadButton = document.getElementById("menu-load");
const saveButton = document.getElementById("menu-save");
const logoutButton = document.getElementById("menu-logout");

const loadDialog = document.getElementById("load-dialog");
const loadList = document.getElementById("load-list");
const loadStatus = document.getElementById("load-status");
const loadCancel = document.getElementById("load-cancel");

// Account project the canvas is currently tied to (null = not saved yet).
// Saving while this is set adds a new version instead of a duplicate project.
let currentProjectId = null;
let currentProjectName = null;

function openMenu() {
    refreshItemStates();
    dropdown.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
}

function closeMenu() {
    dropdown.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
}

function refreshItemStates() {
    saveButton.disabled = !getCurrentImage();
}

function showSignedInUser(user) {
    loginLink.hidden = true;
    menu.hidden = false;
    usernameElement.textContent = user.username;
}

function wireEvents() {
    toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.hidden ? openMenu() : closeMenu();
    });

    // Click anywhere outside the menu to close it.
    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target)) closeMenu();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !dropdown.hidden) { closeMenu(); toggle.focus(); }
    });

    logoutButton.addEventListener("click", handleLogout);
    saveButton.addEventListener("click", () => { closeMenu(); handleSaveToAccount(); });
    loadButton.addEventListener("click", () => { closeMenu(); handleLoadFromAccount(); });
    loadCancel.addEventListener("click", () => loadDialog.close());

    // A file picked from disk is a different image: stop tying it to an account project.
    document.addEventListener("canvas:loaded", (e) => {
        if (e.detail?.source !== "account") {
            currentProjectId = null;
            currentProjectName = null;
        }
    });
}

async function handleLogout() {
    if (getCurrentImage() && hasUnsavedEdits() && !confirm("Sign out? Unsaved edits will be lost.")) return;
    try {
        await logout();
        window.location.href = "index.html";
    } catch (error) {
        alert(error.message || "Logout failed.");
    }
}

// Canvas -> PNG blob with the slider filters baked in (same output as Save Locally).
function exportBlob() {
    return new Promise((resolve, reject) => {
        renderExport().toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Could not export the image."))),
            "image/png"
        );
    });
}

async function handleSaveToAccount() {
    if (!getCurrentImage()) {
        alert("Upload an image before saving.");
        return;
    }

    let name = currentProjectName;
    if (!currentProjectId) {
        name = prompt("Name this image:", "edited-image");
        if (name === null) return; // cancelled
        name = name.trim();
        // The server only accepts letters, numbers, spaces, _ and -.
        if (!/^[\p{L}\p{N}_ -]+$/u.test(name)) {
            alert("Names can only contain letters, numbers, spaces, - and _.");
            return;
        }
    }

    saveButton.disabled = true;
    try {
        const blob = await exportBlob();
        if (currentProjectId) {
            await saveImageVersion(currentProjectId, blob);
        } else {
            currentProjectId = await createImage(blob, `${name}.png`);
            currentProjectName = name;
        }
        markSaved();
        alert(`Saved "${name}" to your account.`);
    } catch (error) {
        alert(error.message || "Could not save your image.");
    } finally {
        refreshItemStates();
    }
}

async function handleLoadFromAccount() {
    if (getCurrentImage() && hasUnsavedEdits() &&
        !confirm("Load a saved image? Unsaved edits will be lost.")) return;

    loadList.replaceChildren();
    loadStatus.textContent = "Loading...";
    loadDialog.showModal();

    try {
        const images = await listImages();
        if (images.length === 0) {
            loadStatus.textContent = "You have no saved images yet.";
            return;
        }
        loadStatus.textContent = "";

        for (const image of images) {
            const item = document.createElement("li");
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = image.file_name; // textContent: names are user-controlled
            button.addEventListener("click", () => openProject(image));
            item.appendChild(button);
            loadList.appendChild(item);
        }
    } catch (error) {
        loadStatus.textContent = error.message || "Could not load your images.";
    }
}

async function openProject(image) {
    loadStatus.textContent = "Opening...";
    try {
        const { blob } = await downloadLatestImage(image.image_id);
        await loadImageFromBlob(blob, "account");
        currentProjectId = image.image_id;
        currentProjectName = image.file_name;
        loadDialog.close();
    } catch (error) {
        loadStatus.textContent = error.message || "Could not open that image.";
    }
}

async function init() {
    wireEvents();
    const ok = await loadAuthState();
    if (ok && isAuthenticated()) showSignedInUser(getCurrentUser());
    // else: leave the login link visible and the account menu hidden
    authStatus.style.visibility = "visible";
}

init();
