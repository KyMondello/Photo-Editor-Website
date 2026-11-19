//lasso tool

//import canvas functions
import { getCurrentImage } from '../components/canvas.js';
import { snapshotCanvas } from '../components/canvas.js';
import { getCanvasContext } from '../components/canvas.js';

//Get the current image data from the canvas
    const canvas = getCurrentImage();
    const ctx = getCanvasContext();


//keeping track of xy coordinates
//idea is to use these for figuring out the selected area's...area
    var startX = 0;
    var startY = 0;
    var endX = 0;
    var endY = 0;

//get button element
const button = document.getElementById('tool-lasso');

//link button and function
button.addEventListener('click', () => lassoSelect(200, 200, 400, 600));

function lassoSelect(startX, startY, endX, endY)
{
    const canvas = getCurrentImage();
    const ctx = getCanvasContext();

        var copy = snapshotCanvas();

        //CHANGE LATER
        ctx.strokeStyle = 'red';
        ctx.setLineDash([5, 3]);
        ctx.lineDashOffset = 2;
        ctx.lineWidth = 8;

        //early test
        ctx.beginPath();
        ctx.rect(startX, startY, (endX-startX), (endY-startY));
        ctx.clip();
        

        //draw from start coordinates to end coordinates
        //width and height are calculated by subtracting start coordinates from end coordinates
        ctx.strokeRect(startX, startY, endX-startX, endY-startY);

        //reset line dash to solid
        //otherwise highlighter will have dashes
        ctx.setLineDash([]);

        


}

//what it needs to do:
//select based on mouse
//pass mouse start coordinates in, pass in path mouse took?
//have visual indication of the tool being active
function lasso()
{
    if(!canvas)return;

    //testing purposes
    lassoSelect(100, 100, 200, 200);
    

}

//track mouse movement for X & Y coordinates
//use mousemove to constant spawn more rectangles
//mousedown ot click to spawn one at a time


/*
//REMINDER: move into function at some point
   document.addEventListener('click', function (event) 
{
    //get starting coordinates
    if(event.escapeKey)
    {
        //set vars to current coordinates
        startX = event.clientX;
        startY = event.clientY;

    }

    //get end coordinates
    else if(event.tabKey)
    {
        
        //set vars to current coordinates
        endX = event.clientX;
        endY = event.clientY;

        lassoSelect(startX, startY, endX, endY);
    
    }



    

}) */