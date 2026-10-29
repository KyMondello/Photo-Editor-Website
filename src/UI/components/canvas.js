// src/UI/components/canvas.js

// Grab the elements we need from editor.html
const canvas = document.getElementById('photo-canvas');
const ctx = canvas.getContext('2d');
const uploadInput = document.getElementById('image-upload');
const uploadPrompt = document.getElementById('upload-prompt');

// Keep track of the currently loaded image so tool functions
// (crop, rotate, filters, etc.) can reference it later
let currentImage = null;

function initCanvas() {
  uploadInput.addEventListener('change', handleImageUpload);
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    const img = new Image();

    img.onload = () => {
      currentImage = img;
      drawImageToCanvas(img);
      showCanvas();
      // history.js listens for this to reset the undo/redo stacks
      document.dispatchEvent(new CustomEvent('canvas:loaded'));
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

function drawImageToCanvas(img) {
  // Canvas keeps the image's full resolution so saved files match the original.
  // On screen it is scaled down by CSS (max-width in editor.css)
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function showCanvas() {
  uploadPrompt.style.display = 'none';
  canvas.style.display = 'block';
}

// Tools get this wrapped context instead of the raw one. It behaves the same,
// but fires 'canvas:edited' (once per tool action) after any drawImage call so
// history.js knows an edit happened without the tools having to report it.
// canvas.js's own drawing (upload) uses the raw ctx and does not fire it.
let editQueued = false;

function notifyEdited() {
  if (editQueued) return;
  editQueued = true;
  // Microtask: wait until the tool's current action has finished drawing
  queueMicrotask(() => {
    editQueued = false;
    document.dispatchEvent(new CustomEvent('canvas:edited'));
  });
}

const toolCtx = new Proxy(ctx, {
  get(target, prop) {
    const value = target[prop];
    if (typeof value !== 'function') return value;

    // Canvas methods must run with the real context as `this`
    return (...args) => {
      const result = value.apply(target, args);
      if (prop === 'drawImage') notifyEdited();
      return result;
    };
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  }
});

// Exported so tool functions (src/tools/) and toolbar.js
// can access the current image/canvas context without
// duplicating upload logic
export function getCanvasContext() {
  return toolCtx;
}

export function getCurrentImage() {
  return currentImage;
}

export function getCanvas() {
  return canvas;
}

initCanvas();
