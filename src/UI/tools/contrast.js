//import canvas functions
import { getCurrentImage } from '../components/canvas.js';
import { getCanvasContext } from '../components/canvas.js';


//get button element
const button = document.getElementById('tool-contrast');

//link button and function
button.addEventListener('click', () => changeContrast(-10));

//contrast editing
function changeContrast(val)
{
    //Get the current image data from the canvas
    const canvas = getCurrentImage();
    const ctx = getCanvasContext();

    //getting data from image
    const imgColor = ctx.getImageData(0,0,canvas.width, canvas.height);
    const colorData = imgColor.data

    //clamping values
    //this is just to prevent a situation that makes it NaN
    //unlikely to happen with the current setup, but just in case
    val = Math.max(-255, Math.min(255, val));

    //get the factor for changing contrast
    const f = (259*(val+255))/(255*(259-val));

    //cycle through pixels
    for(let i = 0; i < colorData.length; i += 4 )
    {
        //r
        colorData[i] = f * (colorData[i] - 128) + 128;

        //g
        colorData[i+1] = f * (colorData[i+1] - 128) + 128;

        //b
        colorData[i+2] = f * (colorData[i+2] - 128) + 128;

    }

    //draw image
    ctx.putImageData(imgColor,0,0);
}

//for testing purposes, remove later
document.addEventListener('keydown', function (event) 
{
    if(event.key === "o")
    {
        changeContrast(10);
    }
})