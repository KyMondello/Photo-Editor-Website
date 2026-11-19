//highlighter tool

//import canvas functions
import { getCurrentImage } from '../components/canvas.js';
import { getCanvasContext, getCanvas } from '../components/canvas.js';

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
const button = document.getElementById('tool-highlighter');


//link button and function
button.addEventListener('click', highlighter());


//trying to get the coordinates of the mouse click, in reference to the canvas and not the whole page
function trueCoordinates(x, y,ex,ey)
{
    const canvas = getCanvas(); //Kylie's change: get the canvas element from the canvas.js file

    var cRect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / cRect.width;
    const scaleY = canvas.height / cRect.height;

    

    //test purposes
    console.log(cRect.left, cRect.top, cRect.right, cRect.bottom);
    console.log("unchanged: " + x + ", " + y + ", " + ex + ", " + ey);

    return{
        x: (x - cRect.left) * scaleX,
        y: (y - cRect.top) * scaleY,
        ex: (ex - cRect.left) * scaleX,
        ey: (ey - cRect.top) * scaleY
    }
    //Kylie's change: used a scale factor to account for the fact that the canvas is scaled down to fit the window. This should make the coordinates more accurate.
    /*
    x = x - cRect.left;
    y = y - cRect.top;
    ex = ex - cRect.left;
    ey = ey - cRect.top;

    console.log("changed: " + x + ", " + y + ", " + ex + ", " + ey);

    return {x: x, y: y, ex: ex, ey: ey};
    */
}
    

function rect(startX, startY, endX, endY)
{
    //Get the current image data from the canvas

    const ctx = getCanvasContext();

        //CHANGE LATER
        //Reuse these vars for highlighter
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 8;

        //test
        /*
        startX = trueCoordinates(startX, startY, endX, endY).x;
        startY = trueCoordinates(startX, startY, endX, endY).y;
        endX = trueCoordinates(startX, startY, endX, endY).ex;
        endY = trueCoordinates(startX, startY, endX, endY).ey;

        */

        //Kylie's change: use the trueCoordinates function once,
        // All values are read before being changed
        const c = trueCoordinates(startX, startY, endX, endY);  
        startX = c.x;
        startY = c.y;
        endX = c.ex;
        endY = c.ey;
        
        //draw from start coordinates to end coordinates
        //width and height are calculated by subtracting start coordinates from end coordinates
        ctx.strokeRect(startX, startY, endX - startX, endY - startY);

        //strokeRect isn't watched by canvas.js, so tell history.js an edit happened
        document.dispatchEvent(new CustomEvent('canvas:edited'));

}

//nothing in here until I know for sure how this gets triggered
//will move code in after I get that sorted
function highlighter()
{
    if(!canvas)return;

}

//REMINDER: move into function at some point
   getCanvas().addEventListener('click', function (event) 
{

    //get starting coordinates
    if(event.shiftKey)
    {
        //visual indication of the tool being active
        document.documentElement.style.cursor = "crosshair";

        //set vars to current coordinates
        startX = event.clientX;
        startY = event.clientY;
        
    }

    //get end coordinates
    else if(event.ctrlKey)
    {

        //set vars to current coordinates
        endX = event.clientX;
        endY = event.clientY;

        rect(startX, startY, endX, endY);
        //visual indication of the tool no longer being active
        document.documentElement.style.cursor = "pointer";
    }


})