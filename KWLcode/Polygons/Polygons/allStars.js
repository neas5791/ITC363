// A field of filled stars
// Using a Star class to represent each star
// Showing use of instance transforms of a model star
// Author Ken Lodge 21/07/2015
//--------------------------------------------------------------------
// The Star class
// The constructor function for a star
function Star() {
	var angle = Math.random()*72;
	var loc = vec3(Math.random()*2 - 1, Math.random()*2 - 1, 0.0);
	var scale = (Math.floor(Math.random()*10) + 1)/300;
	var scales = vec3(scale, scale, 0.0);
	var rs = mult(rotate(angle, [0,0,1]), scalem(scales));
	this.trs = mult(translate(loc), rs);
}

// A star's render function
Star.prototype.render = function() {
	gl.uniformMatrix4fv(matLoc, false, flatten(this.trs));
	gl.drawArrays(gl.TRIANGLE_FAN, 0, Star.NV);
};

Star.NV = 12;	// The number of vertices - a class field

// Generator of model vertices - a class method
// Order is important - It should appear before it is used for Star.vertices
Star.initModel = function() {
	// Generate the 10 basic vertices of a 5-point star
	// Order: 5 x (inner then outer)
	var vertices = [];
	var radin = Math.sin(Math.PI/10)/Math.cos(Math.PI/5);
	for (var n = 0; n < 5; n++) {
		var theta = (Math.PI/5)*(2*n - 0.5);
		vertices[2*n] = scale(radin, vec2(Math.cos(theta), Math.sin(theta)));
		theta += Math.PI/5;
		vertices[2*n+1] = vec2(Math.cos(theta), Math.sin(theta));
	}

	// Generate vertex array for triangle fan
	vertices.push(vertices[0]); 	// Repeat zeroth at end
	vertices.unshift(vec2(0,0));	// Insert origin at start
	return vertices;
};

Star.vertices = Star.initModel();  // The model vertices - a class field
//----------------------------------------------------------------------------

var canvas;
var gl;

var stars = [];				// The array of stars
var NStars = 50;			// The number of stars

var matLoc;					// Shader program location of model-view matrix

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Set up the array of stars
    for (var n = 0; n < NStars; n++) {
		stars.push(new Star());
	}

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );	// Black background for stars

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    // Load the data into the GPU, using a class member of Star for the model data
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(Star.vertices), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

	// get modelview's shader program location
    matLoc = gl.getUniformLocation(program, "modelview");

    render();
};

function render() {

    gl.clear(gl.COLOR_BUFFER_BIT);
    // Instance transform is sent and rendering done in an instance method
    for (var n = 0; n < NStars; n++) {
		stars[n].render();
	}
}

