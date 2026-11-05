//filter tool

//TODO:
//simple filters: b&w, sepia, all warm colors, all cool colors
//more difficult filters: night vision, pastel (maybe)

//import canvas functions
import { getCanvas, getCurrentImage } from '../components/canvas.js';
import { getCanvasContext } from '../components/canvas.js';


//toolbar.js emits 'filter:apply' when a filter button is clicked
//its button keys are the same names filters() expects (Sepia, Gray, Black&White, ...)
document.addEventListener('filter:apply', ({ detail }) => {
    //pixel filters can't be reversed, so turning one off does nothing (use undo)
    if (!detail.active) return;

    //canvas.js fires 'canvas:edited' itself when putImageData is called
    filters(detail.key);
});

//filter function
//pass a name in to determine the filter
function filters(usrInput)
{
    //Get the current image data from the canvas
    //use the canvas (not the original image) so rotate/crop/resize sizes are respected
    const canvas = getCanvas();
    const ctx = getCanvasContext();

    //might need access to canvas itself
    const can = document.getElementById('photo-canvas');

    //make slightly warmer
    if(usrInput=='Warm')
    {
        //getting data from image
        const imgColor = ctx.getImageData(0,0,canvas.width, canvas.height);
        const colorData = imgColor.data

        //cycle through entire image
        for(let i = 0; i < colorData.length; i +=4 )
        {
            //red
            colorData[i] = (colorData[i]+10);
        
            //green
            colorData[i+1] = (colorData[i+1]-10);

            //blue
            colorData[i+2] = colorData[i+2];

            //alpha
            colorData[i+3] = 255;
        }

        //setting edited data so it can be drawn
        imgColor.data.set(colorData);
        ctx.putImageData(imgColor,0,0);
    }

    //make slightly cooler
    else if(usrInput=='Cool')
    {
     
        //getting data from image
        const imgColor = ctx.getImageData(0,0,canvas.width, canvas.height);
        const colorData = imgColor.data

        //cycle through entire image
        for(let i = 0; i < colorData.length; i +=4 )
        {
            //red
            colorData[i] = colorData[i]-10;
        
            //green
            colorData[i+1] = colorData[i+1];

            //blue
            colorData[i+2] = colorData[i+2]+10;
            
            //alpha
            colorData[i+3] = 255;
        }

        //setting edited data so it can be drawn
        imgColor.data.set(colorData);
        ctx.putImageData(imgColor,0,0);
    }

    //make greener
    else if(usrInput=='NightVision')
    {
     
        //getting data from image
        const imgColor = ctx.getImageData(0,0,canvas.width, canvas.height);
        const colorData = imgColor.data

        //cycle through entire image
        for(let i = 0; i < colorData.length; i +=4 )
        {
            //red
            colorData[i] = colorData[i]*.8;
        
            //green
            colorData[i+1] = colorData[i+1];

            //blue
            colorData[i+2] = colorData[i+2]*.8;
            
            //alpha
            colorData[i+3] = 255;
        }

        //setting edited data so it can be drawn
        imgColor.data.set(colorData);
        ctx.putImageData(imgColor,0,0);
    }

    //make sepia
    else if(usrInput=='Sepia')
    {
     
        //getting data from image
        const imgColor = ctx.getImageData(0,0,canvas.width, canvas.height);
        const colorData = imgColor.data

        //cycle through entire image
        for(let i = 0; i < colorData.length; i += 4)
        {

            //calculate new rgb values
            //values for the math found online, allegedly from MS
            //could not find the page myself, but other pages kept referencing it
            var r = (colorData[i]*.393 + colorData[i+1]*.769 + colorData[i+2]*.189);
            var g = (colorData[i]*.349 + colorData[i+1]*.534 + colorData[i+2]*.131);
            var b = (colorData[i]*.272 + colorData[i+1]*.534 + colorData[i+2]*.131);

            //clamp rgb values down
            if(r > 255)
            {
                r = 255;
            }

            else if(g > 255)
            {
                g = 255;
            }

            else if(b > 255)
            {
                b = 255;
            }
            
            colorData[i] = r;
            colorData[i+1] = g;
            colorData[i+2] = b;
        }

        //setting edited data so it can be drawn
        imgColor.data.set(colorData);
        ctx.putImageData(imgColor,0,0);
    }
    

    //make grayscale
    else if(usrInput=='Gray')
    {
        //getting data from image
        const imgColor = ctx.getImageData(0,0,canvas.width, canvas.height);
        const colorData = imgColor.data

        //cycle through entire image
        for(let i = 0; i < colorData.length; i +=4 )
        {
            //vars to calc average value of a pixel
            var r = colorData[i];
            var g = colorData[i+1];
            var b = colorData[i+2];

            //find average
            var avg = (r+g+b)/3;

            //update rgb values
            colorData[i] = avg;
            colorData[i+1] = avg;
            colorData[i+2] = avg;
        }

        //setting edited data so it can be drawn
        imgColor.data.set(colorData);
        ctx.putImageData(imgColor,0,0);
    }

    //black & white filter
    else if(usrInput == 'Black&White')
    {
        //getting data from image
        const imgColor = ctx.getImageData(0,0,canvas.width, canvas.height);
        const colorData = imgColor.data

        //cycle through entire image
        for(let i = 0; i < colorData.length; i +=4 )
        {
            //vars to calc average value of a pixel
            var r = colorData[i];
            var g = colorData[i+1];
            var b = colorData[i+2];

            //find average
            var avg = (r+g+b)/3;

            //check if avg is closer to black
            //if it is, set pixel to black
            if(avg < 100)
            {
                colorData[i] = 0;
                colorData[i+1] = 0;
                colorData[i+2] = 0;
            }
            
            //otherwise set pixel to white
            else
            {
                colorData[i] = 255;
                colorData[i+1] = 255;
                colorData[i+2] = 255;
            }
            
        }

        //setting edited data so it can be drawn
        imgColor.data.set(colorData);
        ctx.putImageData(imgColor,0,0);
    }

    //Invert colors
    //behaves weirdly with brightness
    //maybe don't use that
    else if(usrInput=='Invert')
    {
        //getting data from image
        const imgColor = ctx.getImageData(0,0,canvas.width, canvas.height);
        const colorData = imgColor.data

        //cycle through entire image
        for(let i = 0; i < colorData.length; i +=4 )
        {
            //current rgb
            var r = colorData[i];
            var g = colorData[i+1];
            var b = colorData[i+2];

            //inverse rgb
            var ir = 255 - r;
            var ig = 255 - g;
            var ib = 255 - b;

            //set rgb to new values
            colorData[i] = ir;
            colorData[i+1] = ig;
            colorData[i+2] = ib;

        }

        //setting edited data so it can be drawn
        imgColor.data.set(colorData);
        ctx.putImageData(imgColor,0,0);
    }

    }

    //brightness editing
    //functionally works almost the same as most of the filters 
    function changeBrightness(pm)
    {
        //Get the current image data from the canvas
        const canvas = getCurrentImage();
        const ctx = getCanvasContext();

            //getting data from image
            const imgColor = ctx.getImageData(0,0,canvas.width, canvas.height);
            const colorData = imgColor.data

            //plus key = brighten
            if(pm == '+')
            {
                //cycle through entire image
                for(let i = 0; i < colorData.length; i +=4 )
                {
                    //red
                    colorData[i] = (colorData[i]+5);
                
                    //green
                    colorData[i+1] = (colorData[i+1]+5);

                    //blue
                    colorData[i+2] = (colorData[i+2]+5);

                    //alpha
                    colorData[i+3] = 255;
                }
            }

            //minus key = darken
            else if(pm == '-')
            {
                //cycle through entire image
                for(let i = 0; i < colorData.length; i +=4 )
                {
                    //red
                    colorData[i] = (colorData[i]-5);
                
                    //green
                    colorData[i+1] = (colorData[i+1]-5);

                    //blue
                    colorData[i+2] = (colorData[i+2]-5);

                    //alpha
                    colorData[i+3] = 255;
                }
            }

            //setting edited data so it can be drawn
            imgColor.data.set(colorData);
            ctx.putImageData(imgColor,0,0);
        

    }


//for testing purposes, remove later
document.addEventListener('keydown', function (event) 
{
    if(event.key === "w")
    {
        filters("Warm");
    }

    else if(event.key === "c")
    {
        filters("Cool");
    }

    else if(event.key === "n")
    {
        filters("NightVision");
    }

    else if(event.key === "s")
    {
        filters("Sepia");
    }

    else if(event.key === "x")
    {
        filters("Gray");
    }

    else if(event.key === "b")
    {
        filters("Black&White");
    }

    else if(event.key === "i")
    {
        filters("Invert");
    }

    //brightness editing
    else if(event.key === "-")
    {
        changeBrightness('-');
    }

    //brightness editing
    else if(event.key === "+")
    {
        changeBrightness('+');
    }


});


