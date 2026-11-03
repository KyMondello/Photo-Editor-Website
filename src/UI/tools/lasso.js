//lasso tool

//import canvas functions
import { getCurrentImage } from '../components/canvas.js';
import { getCanvasContext } from '../components/canvas.js';


//keeping track of xy coordinates
//idea is to use these for figuring out the selected area's...area
    var startX = 0;
    var startY = 0;
    var endX = 0;
    var endY = 0;

//get button element
const button = document.getElementById('tool-lasso');

 var clicked = 0;

//link button and function
button.addEventListener('click', () => lasso(10));

//what it needs to do:
//select based on mouse
//pass mouse start coordinates in, pass in path mouse took?
//have visual indication of the tool being active
//two modes, rectangle and mouse cursor
function lasso(val)
{

    //keep track of if lasso button has been clicked (probably better way to do this)
    clicked = clicked + 1;

    //Get the current image data from the canvas
    const canvas = getCurrentImage();
    const ctx = getCanvasContext();

    if(!canvas)return;

    //odd number clicks
    if(clicked % 2 != 0)
    {
        console.log('test');
        console.log(clicked);

    }

    //even number clicks
    else
    {
        console.log('other test');
        console.log(clicked);
    }

    
}

//track mouse movement for X & Y coordinates
   document.addEventListener('mousemove', function (event) 
{
    if(event.shiftKey)
    {
        //set vars to current coordinates
        startX = event.clientX;
        startY = event.clientY;

        //check if what's there makes sense
        console.log('X:')
        console.log(startX);
        console.log('Y:')
        console.log(startY);
    }
})