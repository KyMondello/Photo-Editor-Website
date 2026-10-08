//import canvas functions
import { getCurrentImage } from '../components/canvas.js';
import { getCanvasContext } from '../components/canvas.js';


//get button element
const button = document.getElementById('tool-resize');

//accidentally figured out resize while working on crop
//only accepts ratio in this format -> num1/num2
button.addEventListener('click',() =>  resize(2/1));

//resize image using a ratio
function resize(ratio)
{
    //Get the current image data from the canvas
    const canvas = getCurrentImage();
    const ctx = getCanvasContext();

    //used to find center of canvas
    const can = document.getElementById('photo-canvas');

    //center resized image when drawn
    //canvas w/h divided by 2 - image w/h divided by 2 to calculate the center of both
    const x = (can.width/2)-(canvas.width*ratio)/2;
    const y = (can.height/2)-(canvas.height*ratio)/2;

    //clear old pic from canvas, otherwise you'll see the unaltered image
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //display cropped image
    ctx.drawImage(canvas, 0,0, canvas.width ,canvas.height, x, y, canvas.width*ratio,canvas.height*ratio);

document.addEventListener('keydown', function (event) 
{
    if(event.key === "s")
    {
        resize(1/2);
    }


});
}