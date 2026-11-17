//attempt 2

//import canvas functions
import { getCanvas, getCurrentImage, snapshotCanvas } from '../components/canvas.js';
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

    const ctx = getCanvasContext();
    const can = getCanvas();

    //nothing uploaded yet
    if (!getCurrentImage()) return;

    //copy what is on the canvas now, so earlier crop/resize/filter edits are kept
    const src = snapshotCanvas();

    //convert degrees to radians
    const rad = degrees * Math.PI / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));

    //resize canvas to fit the rotated image (full resolution, CSS scales it on screen)
    //(setting width/height also clears the canvas and resets ctx)
    can.width = Math.round(src.width * cos + src.height * sin);
    can.height = Math.round(src.width * sin + src.height * cos);

    //save unchanged ctx
    ctx.save();

    //move center to center of canvas
    ctx.translate(can.width / 2, can.height / 2);

    //rotate using radians
    ctx.rotate(rad);

    //draw the snapshot centered on the rotation point
    ctx.drawImage(src, -src.width / 2, -src.height / 2);

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
