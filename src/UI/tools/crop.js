//import canvas functions
import { getCurrentImage } from '../components/canvas.js';
import { getCanvasContext } from '../components/canvas.js';


//get button element
const button = document.getElementById('tool-crop');

//link the button to the crop function
//at the moment, set to shave off a set ratio of image, can be adjusted to whatever you feel like
//it does need to be int this format: num1/num2
//can accept decimals though
button.addEventListener('click',() =>  cropCustom(500,500));

//crop image using a ratio
function crop(ratio)
{
    //Get the current image data from the canvas
    const canvas = getCurrentImage();
    const ctx = getCanvasContext();

    //might need this later
    const can = document.getElementById('photo-canvas');

    //center cropped image when drawn
    const x = (can.width/2)-(canvas.width*ratio)/2;
    const y = (can.height/2)-(canvas.height*ratio)/2;

    

    //clear old pic from canvas, otherwise you'll see the unaltered image
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //display cropped image
    ctx.drawImage(canvas, 0,0, canvas.width*ratio ,canvas.height*ratio, x, y, canvas.width*ratio,canvas.height*ratio);
}

//crop via custom measurements, as in not using ratios
//a = start point on x-axis
//b = start point on y-axis
function cropCustom(a,b)
{
    //Get the current image data from the canvas
    const canvas = getCurrentImage();
    const ctx = getCanvasContext();

    //might need this later
    const can = document.getElementById('photo-canvas');

    //center cropped image when drawn
    //canvas w/h divided by 2 - image w/h divided by 2 to calculate the center of both
    const x = (can.width/2)-(canvas.width-a)/2;
    const y = (can.height/2)-(canvas.height-b)/2;

    //clear old pic from canvas, otherwise you'll see the unaltered image
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //display cropped image
    ctx.drawImage(canvas, 0,0,a,b, x, y, canvas.width-a,canvas.height-b);

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
