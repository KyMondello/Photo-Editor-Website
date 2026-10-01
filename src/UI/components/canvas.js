// src/ui/components/canvas.js

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
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

function drawImageToCanvas(img) {
  // Resize canvas to match the image's aspect ratio,
  // capped to a max width so large photos don't overflow the layout
  const maxWidth = 800;
  const scale = Math.min(1, maxWidth / img.width);

  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function showCanvas() {
  uploadPrompt.style.display = 'none';
  canvas.style.display = 'block';
}

// Exported so tool functions (src/tools/) and toolbar.js
// can access the current image/canvas context without
// duplicating upload logic
export function getCanvasContext() {
  return ctx;
}

export function getCurrentImage() {
  return currentImage;
}

initCanvas();