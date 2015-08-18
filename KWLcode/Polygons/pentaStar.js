// Displays a pentagon with inscribed star and border.
// Showing how to use element arrays so the same vertex array
//   can be used with a number of different graphics primitives.
// Author Ken Lodge 11/08/2015

var canvas;
var gl;

var vertices = [];	// To represent the pentagon as a triangle fan
var NV = 7;			// Number of vertices
var star;       // An element array for the star vertices

var colLoc;
var YELLOW = vec4(1.0, 1.0, 0.0, 1.0);
var RED = vec4(1.0, 0.0, 0.0, 1.0);
var BLACK = vec4(0.0, 0.0, 0.0, 1.0);

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );	// Grey background

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Generate the vertices for a pentagon represented as a triangle fan
    // Begin with point at origin
    vertices[0] = vec2(0.0, 0.0);
    // Now add 5 vertices around a circle
    for (var n = 0; n < 5; n++) {
		var theta = (Math.PI/5)*(2*n + 0.5);
		vertices[n+1] = vec2(Math.cos(theta), Math.sin(theta));
	}
	// Now wrap the triangle fan around
	vertices.push(vertices[1]);
	// The element array representing the inscribed star and border
	star = [1, 3, 5, 2, 4, 1, 2, 3, 4, 5];

    // Load the vertex data into the GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

	// Load the additional element data into the GPU
	var iBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(star), gl.STATIC_DRAW);

    colLoc = gl.getUniformLocation(program, "colour");

    render();
};


function render() {

    gl.clear(gl.COLOR_BUFFER_BIT);

	// Draw the penatagon
    gl.uniform4fv(colLoc, flatten(YELLOW));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, NV);

	// Draw the inscribed star
    gl.uniform4fv(colLoc, flatten(RED));
    gl.drawElements(gl.LINE_LOOP, 5, gl.UNSIGNED_BYTE, 0);

	// Draw the border
    gl.uniform4fv(colLoc, flatten(BLACK));
    gl.drawElements(gl.LINE_LOOP, 5, gl.UNSIGNED_BYTE, 5);

}
