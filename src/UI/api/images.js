// images.js
// Browser-side calls to /api/images. The server checks the login cookie and
// that the image belongs to the current user.

async function readError(response, fallback) {
    try {
        const data = await response.json();
        return data.message || fallback;
    } catch {
        return fallback;
    }
}

// [{ image_id, file_name }] for the logged-in user.
export async function listImages() {
    const response = await fetch("/api/images", { credentials: "include" });
    if (!response.ok) throw new Error(await readError(response, "Could not load your images."));
    return response.json();
}

// Downloads the newest version of a project. Returns { blob, version }.
export async function downloadLatestImage(imageId) {
    const id = encodeURIComponent(imageId);

    const latestRes = await fetch(`/api/images/${id}/versions/latest`, { credentials: "include" });
    if (!latestRes.ok) throw new Error(await readError(latestRes, "Could not find that image."));
    const { version, extension } = await latestRes.json();

    const fileRes = await fetch(`/api/images/${id}/versions/${version}/download`, { credentials: "include" });
    if (!fileRes.ok) throw new Error(await readError(fileRes, "Could not download that image."));

    // The server sends raw bytes; label them so the browser treats them as an image.
    const bytes = await fileRes.arrayBuffer();
    return { blob: new Blob([bytes], { type: `image/${extension}` }), version };
}

// Creates a new project (version 1). filename must include an extension, e.g. "beach.png".
// Returns the new project's imageId.
export async function createImage(blob, filename) {
    const response = await fetch(`/api/images/upload/${encodeURIComponent(filename)}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": blob.type },
        body: blob
    });
    if (!response.ok) throw new Error(await readError(response, "Could not save your image."));
    const data = await response.json();
    return data.imageId;
}

// Adds a new version to an existing project.
export async function saveImageVersion(imageId, blob) {
    const extension = blob.type.split("/")[1];
    const response = await fetch(`/api/images/${encodeURIComponent(imageId)}/upload/${extension}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": blob.type },
        body: blob
    });
    if (!response.ok) throw new Error(await readError(response, "Could not save your image."));
}
