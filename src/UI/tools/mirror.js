//import canvas functions
import { getCurrentImage } from '../components/canvas.js';
import { getCanvasContext } from '../components/canvas.js';

//get button element
const button = document.getElementById('tool-flip');

//link button and function
button.addEventListener('click', () => mirrorImage());

function mirrorImage()
{
    //Get the current image data from the canvas
    const canvas = getCurrentImage();
    const ctx = getCanvasContext();

    //preventing unseen by the user errors
    if(!canvas)return;

    //save to restore later
    ctx.save();

    //invert x coordinates
    ctx.scale(-1,1);

    //clear old pic from canvas, otherwise you'll see the unaltered image
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //display image
    ctx.drawImage(canvas, 0, 0, -canvas.width, canvas.height);

    //just in case
    ctx.restore();
    
}

