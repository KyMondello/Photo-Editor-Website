//attempt 2

//import canvas functions
import { getCurrentImage } from '../components/canvas.js';
import { getCanvasContext } from '../components/canvas.js';


//get button element
const button = document.getElementById('tool-rotate');

//link the button to the rotate function
//user input will be added later, but for now it will just rotate 90 degrees
button.addEventListener('click', () => rotate(90));

//rotate image by variable degrees
//at the moment the degrees are predetermined by what action was taken 
//to trigger this function, but it can accept custom degrees
//rotate the other way by using negative degrees
function rotate(degrees) {

    //Get the current image data from the canvas
    const img = getCurrentImage();
    const ctx = getCanvasContext();

    //might need access to canvas itself
    const can = document.getElementById('photo-canvas');

    //nothing uploaded yet
    if (!img) return;

    //convert degrees to radians
    const rad = degrees * Math.PI / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));

    //size of the box the rotated image needs (using the image's real size)
    const rotW = img.width * cos + img.height * sin;
    const rotH = img.width * sin + img.height * cos;

    //scale down to the same max width canvas.js uses
    const maxWidth = 800;
    const scale = Math.min(1, maxWidth / rotW);

    //resize canvas to fit the rotated image
    //(setting width/height also clears the canvas and resets ctx)
    can.width = rotW * scale;
    can.height = rotH * scale;

    //save unchanged ctx
    ctx.save();

    //move center to center of canvas
    ctx.translate(can.width / 2, can.height / 2);

    //rotate using radians
    ctx.rotate(rad);

    //draw image at its scaled size, centered on the rotation point
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

    //restore ctx
    ctx.restore();

}

//keyboard shortcuts
//mostly for common angles
document.addEventListener('keydown', function (event) 
{

    //rotate to right
    if (event.key === 'ArrowRight') 
        {
            rotate(45);
        }

    //rotate to left
    else if (event.key === 'ArrowLeft') 
        {
            rotate(-45);
        }

    //flip downward
    else if (event.key === 'ArrowDown') 
        {
            rotate(-180);
        }

}
);
