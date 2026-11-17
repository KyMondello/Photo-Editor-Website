// src/UI/components/adjustments.js

import { getCanvas } from './canvas.js';

const canvas = getCanvas();
const values = { brightness: 0, saturation: 0, contrast: 0, blur: 0 };

export function getFilterString() {
  return `brightness(${100 + values.brightness}%) saturate(${100 + values.saturation}%) ` +
         `contrast(${100 + values.contrast}%) blur(${values.blur}px)`;
}

// Used by history.js to snapshot and restore slider state
export function getValues() {
  return { ...values };
}

export function setValues(next) {
  Object.assign(values, next);
  canvas.style.filter = getFilterString();
}

// toolbar.js emits { tool, key, value }; the blur slider's key is 'amount'
document.addEventListener('tool:input', ({ detail }) => {
  const key = detail.tool === 'blur' ? 'blur' : detail.key;
  if (!(key in values)) return;

  setValues({ [key]: detail.value });   // live preview
});

document.addEventListener('canvas:loaded', () => {
  setValues({ brightness: 0, saturation: 0, contrast: 0, blur: 0 });
});
