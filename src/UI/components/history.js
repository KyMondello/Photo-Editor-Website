// src/UI/components/history.js

// Undo/redo by snapshotting the canvas after each edit.
// Snapshots are PNG blobs (browsers can keep these off the JS heap), not raw pixel
// copies, since the canvas now holds full-resolution photos.

import { getCanvas } from './canvas.js';
import { getValues, setValues } from './adjustments.js';

const MAX_STEPS = 20;

const canvas = getCanvas();
const undoButton = document.getElementById('undo-button');
const redoButton = document.getElementById('redo-button');

// The last entry of undoStack is the state currently on screen
let undoStack = [];
let redoStack = [];
let hasImage = false;

// Snapshots finish asynchronously, so every stack change runs through this
// queue to keep them in the order the edits happened
let queue = Promise.resolve();

function enqueue(task) {
  queue = queue.then(task).catch(console.error);
  return queue;
}

function updateButtons() {
  if (undoButton) undoButton.disabled = undoStack.length < 2;
  if (redoButton) redoButton.disabled = redoStack.length === 0;
}

// Capture the canvas pixels + slider values as they are right now
function record() {
  if (!hasImage) return;

  const values = getValues();
  // toBlob copies the bitmap at call time, so later edits can't leak into this snapshot
  const pending = new Promise(resolve =>
    canvas.toBlob(blob => resolve({ blob, values }), 'image/png'));

  enqueue(async () => {
    const state = await pending;
    if (!state.blob) return;

    undoStack.push(state);
    if (undoStack.length > MAX_STEPS + 1) undoStack.shift();
    redoStack = [];
    updateButtons();
  });
}

// Draw a snapshot back onto the canvas and restore the sliders.
// Uses the raw context (canvas.getContext), so it does not fire 'canvas:edited'.
async function restore({ blob, values }) {
  const bitmap = await createImageBitmap(blob);

  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0);
  bitmap.close();

  setValues(values);
}

function undo() {
  enqueue(async () => {
    if (undoStack.length < 2) return;

    redoStack.push(undoStack.pop());
    await restore(undoStack[undoStack.length - 1]);
    updateButtons();
  });
}

function redo() {
  enqueue(async () => {
    const state = redoStack.pop();
    if (!state) return;

    undoStack.push(state);
    await restore(state);
    updateButtons();
  });
}

// New image: clear history, then record it as the starting state
document.addEventListener('canvas:loaded', () => {
  hasImage = true;
  enqueue(async () => {
    undoStack = [];
    redoStack = [];
    updateButtons();
  });
  record();
});

// A tool drew on the canvas (rotate, crop, resize, ...)
document.addEventListener('canvas:edited', record);

// A slider drag finished (fires on release, not on every pixel of movement)
document.addEventListener('tool:change', record);

if (undoButton) undoButton.addEventListener('click', undo);
if (redoButton) redoButton.addEventListener('click', redo);

document.addEventListener('keydown', (event) => {
  if (!(event.ctrlKey || event.metaKey)) return;

  const key = event.key.toLowerCase();
  if (key === 'z' && !event.shiftKey) {
    event.preventDefault();
    undo();
  } else if (key === 'y' || (key === 'z' && event.shiftKey)) {
    event.preventDefault();
    redo();
  }
});

updateButtons();
