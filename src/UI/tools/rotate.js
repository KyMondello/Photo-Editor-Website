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
    const canvas = getCurrentImage();
    const ctx = getCanvasContext();

    //might need access to canvas itself
    const can = document.getElementById('photo-canvas');

    //clear old pic from canvas, otherwise you'll see the unaltered image
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //save unchanged ctx
    ctx.save();

    //move center to center of canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);

    //testing
    //rotate using degrees and not radians
    ctx.rotate(degrees * Math.PI / 180);

    //draw image with offset
    ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

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
