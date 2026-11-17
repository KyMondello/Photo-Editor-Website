// src/ui/components/save.js

//Grab canvas and image
import { getCanvas, getCurrentImage } from "./canvas.js";
import { getFilterString } from "./adjustments.js";

const saveButton = document.getElementById('save-button');

//Copy the visible canvas (all tool edits are already drawn on it) and bake in the slider filters
function renderExport() {
    const source = getCanvas();
    const out = document.createElement('canvas');
    out.width = source.width;
    out.height = source.height;

    const outCtx = out.getContext('2d');
    outCtx.filter = getFilterString();
    outCtx.drawImage(source, 0, 0);

    return out;
}

function saveImage({filename = 'edited-image', type = 'image/png', quality = 0.92} = {}) {
    const img = getCurrentImage();

    if(!img) {
        alert('Upload an image before saving');
        return;
    }

    const offscreen = renderExport();
    const extension = type === 'image/jpeg' ? 'jpg' : 'png';

    offscreen.toBlob(blob => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${extension}`;
        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    }, type, quality);
}

function initSave() {
    if(!saveButton) return;
    saveButton.addEventListener('click', () => saveImage());
}

export {saveImage};

initSave();