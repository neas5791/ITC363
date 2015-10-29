// ITC363 Assignment 3
// Task 1: A 3D Function-Viewing Program
// Sean Matkovich
// ID: 11187033

var gl;             // the gl context object

var faces = 20;


var pointsArray = [];   // the array that will store the vertices information to be sent to buffer

var fColor;     // vertex shader link variable

var near   = -10 ; // initial position for near altered by increasing and decreasing the z buttons
var far    =  10 ;   // initial position for far  altered by increasing and decreasing the z buttons
var radius =  6.0 ;   // initial position of camera
var theta  =  Math.PI/2.5 ;   // initial camera polar position about the z axis
var phi    =  25.0 * Math.PI / 180.0 ;   // initial camera polar position 
var dr     =   5.0 * Math.PI / 180.0 ;   // the amount to alter theta and phi


/* ************* COLOUR CONSTANTS ************* */
const black = vec4(0.0, 0.0, 0.0, 1.0);
const lgreen = vec4(0.37, 0.68, 0.53);
const red = vec4(1.0, 0.0, 0.0, 1.0);
const blue = vec4(0.0, 1.0, 0.0, 1.0);
const green = vec4(0.0, 0.0, 1.0, 1.0);
const yellow = vec4(1.0, 1.0, 0.0, 1.0);
const grey =  vec4(0.539, 0.539, 0.539, 1.0);
/* ******************************************** */

const at = vec3(0.0, 0.0, 0.0); // the center of the object
const up = vec3(0.0, 0.0, 1.0); // the reference up direction

var left = -2.0;    // dimensions of the viewing volume
var right = 2.0;    // dimensions of the viewing volume
var ytop = 2.42;     // dimensions of the viewing volume
var bottom = -2.42;  // dimensions of the viewing volume

var modeViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.6, 0.8, 1.0, 1.0);      // Light blue background    

    
    // enable depth testing and polygon offset
    // so lines will be in front of filled triangles
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

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


    // get the number vertices to display from the user interface html slider
    // setVerticesCount(document.getElementById("vertex-slider").value);

    var cone = makeCone(faces);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cone), gl.STATIC_DRAW); // push the new pointArray to the buffer
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


    // document.getElementById("vertex-slider").onchange = function(event) { setVerticesCount(event.target.value); render() ; };

       
    render();
 
}


/*
 * Renders the buffer to the webgl canvas
*/
function render()
{
    console.log("In render()");
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var eye = vec3( radius*Math.sin(theta)*Math.cos(phi), 
                    radius*Math.sin(theta)*Math.sin(phi),
                    radius*Math.cos(theta));

    modelViewMatrix = lookAt( eye, at, up );

    projectionMatrix = ortho( left, right, bottom, ytop, near, far );

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

        gl.uniform4fv(fColor, flatten(yellow));
        gl.drawArrays( gl.TRIANGLE_FAN, 0, faces + 2 );
}


// outputs vertices to produce triangle fan in cone shape
// 
function makeCone(nfaces)
{
    var omega = (360.0 / faces) * (Math.PI / 180.0);
    var vertices = [];

    // The 8 raw vertices of the canopy (cone shape)
    vertices.push( vec4( 0.0, 0.0, 0.5 , 1) );

    for (var i = 0; i < faces; i++){
        vertices[i + 1] = vec4( Math.cos( i * omega) / 2.0, Math.sin( i * omega) / 2.0, 0.1, 1 ); // scale the rawVertices
    }

    vertices.push(vertices[1]);

    for (var j = 0 ; j < vertices.length; j++) {
        console.log(vertices[j]);
    }

    return vertices;
}



/*
 * Outputs state variable information to console
*/
function state()
{
    console.log("n: " + n);
    console.log("nRows: " + nRows);
    console.log("nColumns: " + nColumns);
    console.log("unit: " + unit);
}