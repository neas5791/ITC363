
var gl;             // the gl context object
var n = 50;         // the number of divisions map out
var nRows = n;      // used for array to store x co ordinates
var nColumns = n;   // used for array to stor y co ordinate
var unit = 2.0 / n; // as we map the plot from -1 < x < 1 && -1 < y < 1 our array starts at the exteme
                    // of x = -1 and y = -1  effective unit constant is double the inverse of division



var data = [];  // data is a two dimesnional array which store the z values for the respective 
                // x and y inputs.
var pointsArray = [];   // the array that will store the vertices information to be sent to buffer

var xAxis;      // position in the array where the x Axis vertices start
var yAxis;      // position in the array where the y Axis vertices start
var zAxis;      // position in the array where the z Axis vertices start

var fColor;     // vertex shader link variable

var near   = -10 ; // initial position for near altered by increasing and decreasing the z buttons
var far    =  10 ;   // initial position for far  altered by increasing and decreasing the z buttons
var radius =  6.0 ;   // initial position of camera
var theta  =  Math.PI/2.5 ;   // initial camera polar position about the z axis
var phi    =  25.0 * Math.PI / 180.0 ;   // initial camera polar position 
var dr     =   5.0 * Math.PI / 180.0 ;   // the amount to alter theta and phi


/* **** COLOUR CONSTANTS **** */
const black = vec4(0.0, 0.0, 0.0, 1.0);
const lgreen = vec4(0.37, 0.68, 0.53);
const red = vec4(1.0, 0.0, 0.0, 1.0);
const blue = vec4(0.0, 1.0, 0.0, 1.0);
const green = vec4(0.0, 0.0, 1.0, 1.0);
const yellow = vec4(1.0, 1.0, 0.0, 1.0);
const grey =  vec4(0.539, 0.539, 0.539, 1.0);


const at = vec3(0.0, 0.0, 0.0); // the center of the object
const up = vec3(0.0, 1.0, 0.0); // the reference up direction

var left = -2.0;    // dimensions of the viewing volume
var right = 2.0;    // dimensions of the viewing volume
var ytop = 2.42;     // dimensions of the viewing volume
var bottom = -2.42;  // dimensions of the viewing volume

var modeViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

window.onload = function init()
{
    buildDataArray();
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    // enable depth testing and polygon offset
    // so lines will be in front of filled triangles
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

    // // vertex array of nRows*nColumns quadrilaterals 
    // // (two triangles/quad) from data
    
    // for(var i=0; i<nRows-1; i++) {
    //     for(var j=0; j<nColumns-1;j++) {
    //         // push the vetices into the pointsArray in the correct order
    //         pointsArray.push( vec4 ( unit * ( i - ( n / 2 ) )
    //                                 , data[i][j]
    //                                 , unit * ( j - ( n / 2 ) )
    //                                 , 1.0));

    //         pointsArray.push( vec4 ( unit * ( ( i + 1 ) - ( n / 2 ) )
    //                                 , data[ i + 1 ][ j ]
    //                                 , unit * ( j - ( n / 2 ) )
    //                                 , 1.0)); 

    //         pointsArray.push( vec4 ( unit * ( ( i + 1 ) - ( n / 2 ) )
    //                                 , data[ i + 1 ][ j + 1 ]
    //                                 , unit * ( ( j + 1 ) - ( n / 2 ) )
    //                                 , 1.0));

    //         pointsArray.push( vec4 ( unit * ( i - ( n / 2 ) )
    //                                 , data[ i ][ j + 1 ]
    //                                 , unit * ( ( j + 1 ) - ( n / 2 ) )
    //                                 , 1.0) );
    //     }
    // }

    buildPointArray();

    // // Set marker for the end of the vertex data and 
    // // start of the x axis vertices
    // xAxis = pointsArray.length;

    // pointsArray.push( vec4(-1.0, 0.0, 0.0, 1) )
    // pointsArray.push( vec4( 1.0, 0.0, 0.0, 1) )

    // // Set marker for the start of the y axis vertices
    // yAxis = pointsArray.length;

    // pointsArray.push( vec4( 0.0, -1.0, 0.0, 1) )
    // pointsArray.push( vec4( 0.0,  1.0, 0.0, 1) )

    // // Set marker for the start of the z axis vertices
    // zAxis = pointsArray.length;

    // pointsArray.push( vec4( 0.0, 0.0, -1.0, 1) )
    // pointsArray.push( vec4( 0.0, 0.0,  1.0, 1) )


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    var vBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    fColor = gl.getUniformLocation(program, "fColor");
 
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

// buttons for moving viewer and changing size 

    document.getElementById("Button1").onclick = function()  { near   *= 1.1 ; far    *= 1.1 ; render() ; };
    document.getElementById("Button2").onclick = function()  { near   *= 0.9 ; far    *= 0.9 ; render() ; };
    document.getElementById("Button3").onclick = function()  { radius *= 2.0 ; render()      ; };
    document.getElementById("Button4").onclick = function()  { radius *= 0.5 ; render()      ; };
    document.getElementById("Button5").onclick = function()  { theta  += dr  ; render()      ; };
    document.getElementById("Button6").onclick = function()  { theta  -= dr  ; render()      ; };
    document.getElementById("Button7").onclick = function()  { phi    += dr  ; render()      ; };
    document.getElementById("Button8").onclick = function()  { phi    -= dr  ; render()      ; };
    document.getElementById("Button9").onclick = function()  { left   *= 0.9 ; right  *= 0.9 ; render() ; };
    document.getElementById("Button10").onclick = function() { left   *= 1.1 ; right  *= 1.1 ; render() ; };
    document.getElementById("Button11").onclick = function() { ytop   *= 0.9 ; bottom *= 0.9 ; render() ; };
    document.getElementById("Button12").onclick = function() { ytop   *= 1.1 ; bottom *= 1.1 ; render() ; };


    document.getElementById("vertex-slider").onchange = function(event) {
        // set variable to slider value
        n = event.target.value;

        nRows = n;      // used for array to store x co ordinates
        nColumns = n;   // used for array to stor y co ordinate
        unit = 2.0 / n; // as we map the plot from -1 < x < 1 && -1 < y < 1 our array starts at the exteme
                        // of x = -1 and y = -1  effective unit constant is double the inverse of division

        buildDataArray();
        buildPointArray();

        render();

        console.log("Number of Vertices is now " + n);
    };

       
    render();
 
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var eye = vec3( radius*Math.sin(theta)*Math.cos(phi), 
                    radius*Math.sin(theta)*Math.sin(phi),
                    radius*Math.cos(theta));

    modelViewMatrix = lookAt( eye, at, up );

    projectionMatrix = ortho( left, right, bottom, ytop, near, far );

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    
    // draw each quad as two filled yellow triangles
    // and then as two black line loops
    
    for(var i=0; i<pointsArray.length - 6; i+=4) { 
        gl.uniform4fv(fColor, flatten(yellow));
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
        
        if (n > 50 )
            gl.uniform4fv(fColor, flatten(grey));
        else
            gl.uniform4fv(fColor, flatten(black));

        gl.drawArrays( gl.LINE_LOOP, i, 4 );
    }

    // Draw the axis markers 
    // x axis red
    gl.uniform4fv(fColor, flatten(red));
    gl.drawArrays( gl.LINES, xAxis, 2);
    // y axis green
    gl.uniform4fv(fColor, flatten(green));
    gl.drawArrays( gl.LINES, yAxis, 2);
    // z axis blue
    gl.uniform4fv(fColor, flatten(blue));
    gl.drawArrays( gl.LINES, zAxis, 2);
}

function buildDataArray() {
    data = [];

    for( var i = 0; i < nRows; ++i ) {
        // initialize multi dimensional array by pushings and array
        data.push( [] );
        // set the value of x with respect the number of vertices (n)
        // and the scale value (unit)
        var x = (i - ( n / 2 ) ) * unit;

        for( var j = 0; j < nColumns; ++j ) {
            // set the value of y with respect the number of vertices (n)
            // and the scale value (unit)
            var y = (j - ( n / 2 ) ) * unit;

            // set the value of z based on the function f(x,y) = x^2 + y^2
            var z = x*x+y*y;
            
            // push the z value to the array
            data[i][j] = z;
        }
    }
}

function buildPointArray() {
    pointsArray = [];
    // vertex array of nRows*nColumns quadrilaterals 
    // (two triangles/quad) from data
    
    for(var i=0; i<nRows-1; i++) {
        for(var j=0; j<nColumns-1;j++) {
            // push the vetices into the pointsArray in the correct order
            pointsArray.push( vec4 ( unit * ( i - ( n / 2 ) )
                                    , data[i][j]
                                    , unit * ( j - ( n / 2 ) )
                                    , 1.0));

            pointsArray.push( vec4 ( unit * ( ( i + 1 ) - ( n / 2 ) )
                                    , data[ i + 1 ][ j ]
                                    , unit * ( j - ( n / 2 ) )
                                    , 1.0)); 

            pointsArray.push( vec4 ( unit * ( ( i + 1 ) - ( n / 2 ) )
                                    , data[ i + 1 ][ j + 1 ]
                                    , unit * ( ( j + 1 ) - ( n / 2 ) )
                                    , 1.0));

            pointsArray.push( vec4 ( unit * ( i - ( n / 2 ) )
                                    , data[ i ][ j + 1 ]
                                    , unit * ( ( j + 1 ) - ( n / 2 ) )
                                    , 1.0) );
        }
    }

    // Set marker for the end of the vertex data and 
    // start of the x axis vertices
    xAxis = pointsArray.length;

    pointsArray.push( vec4(-1.0, 0.0, 0.0, 1) )
    pointsArray.push( vec4( 1.0, 0.0, 0.0, 1) )

    // Set marker for the start of the y axis vertices
    yAxis = pointsArray.length;

    pointsArray.push( vec4( 0.0, -1.0, 0.0, 1) )
    pointsArray.push( vec4( 0.0,  1.0, 0.0, 1) )

    // Set marker for the start of the z axis vertices
    zAxis = pointsArray.length;

    pointsArray.push( vec4( 0.0, 0.0, -1.0, 1) )
    pointsArray.push( vec4( 0.0, 0.0,  1.0, 1) )


}