//import canvas functions
import { getCanvas, getCurrentImage, snapshotCanvas } from '../components/canvas.js';
import { getCanvasContext } from '../components/canvas.js';


//get button element
const button = document.getElementById('tool-crop');

//link the button to the crop function
//at the moment, set to shave off a set amount from the top-left, can be adjusted to whatever you feel like
button.addEventListener('click',() =>  cropCustom(500,500));

//draw the part of the current canvas starting at (sx, sy) and sw x sh big
//the canvas shrinks to that size, so the result stacks with rotate/resize/filters
function cropRegion(sx, sy, sw, sh)
{
    const ctx = getCanvasContext();
    const can = getCanvas();

    //nothing uploaded yet
    if (!getCurrentImage()) return;

    //copy what is on the canvas now, so earlier edits are kept
    const src = snapshotCanvas();

    //keep the region inside the canvas and at least 1px big
    sx = Math.max(0, Math.min(Math.round(sx), src.width - 1));
    sy = Math.max(0, Math.min(Math.round(sy), src.height - 1));
    sw = Math.max(1, Math.min(Math.round(sw), src.width - sx));
    sh = Math.max(1, Math.min(Math.round(sh), src.height - sy));

    //resizing the canvas also clears it
    can.width = sw;
    can.height = sh;

    ctx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
}

//crop image using a ratio, keeping the center
function crop(ratio)
{
    const can = getCanvas();
    const w = can.width * ratio;
    const h = can.height * ratio;

    cropRegion((can.width - w) / 2, (can.height - h) / 2, w, h);
}

//crop via custom measurements, as in not using ratios
//a = how much to cut off the left (x-axis)
//b = how much to cut off the top (y-axis)
function cropCustom(a,b)
{
    const can = getCanvas();

    cropRegion(a, b, can.width - a, can.height - b);
}

//keyboard shortcuts
//mostly for testing purposes
//crop by various ratios
//testing custom crop amounts
document.addEventListener('keydown', function (event)
{
    if(event.key === "1")
    {
        crop(1/1.5);
    }

    else if(event.key === "2")
    {
        crop(1/2);
    }

    else if(event.key === "3")
    {
        crop(2/3);
    }

    else if(event.key === "4")
    {
        crop(3/4);
    }

    //cropCustom showcase
    else if(event.key === "5")
    {
        cropCustom(1000,1000);
    }

    else if(event.key === "6")
    {
        cropCustom(600,600);
    }



}
);
