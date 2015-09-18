// A scene of Stonehenge
// Using a Block class to represent each stone block
// Showing use of instance transforms, model-view transformation and perspective projection
// Combined with scene walk-through
// Author Ken Lodge 10/09/2015
// ----------------------------------------------------------------------------------------
// The Block class
// The constructor function for a block
// Arguments: a vec3 location, a floating-point angle (degrees) and a vec3 scales
function Block(location, angle, scales) {
	var rs = mult(rotate(angle, [0,0,1]), scalem(scales));
	this.trs = mult(translate(location), rs);
}

// A block's render function
// Arguments:
//   offset - offset of vertices into current vertex attribute array
//   worldview - current worldview transformation
Block.prototype.render = function(offset, worldview) {
	gl.uniformMatrix4fv(mvLoc, false, flatten(mult(worldview, this.trs)));
	gl.drawArrays(gl.TRIANGLES, offset, Block.NV);
};

// Block class fields
// The number of vertices to represent a cube (6 faces x 2 triangles)
Block.NV = 36;

// Generator of model vertices - a class method
// Order is important - It should appear before it is used for Block.vertices
Block.initModel = function() {
	// The 8 raw vertices of a cube
	var rawverts = [
		vec3(-0.5, -0.5,  0.5),
		vec3(-0.5,  0.5,  0.5),
		vec3( 0.5,  0.5,  0.5),
		vec3( 0.5, -0.5,  0.5),
		vec3(-0.5, -0.5, -0.5),
		vec3(-0.5,  0.5, -0.5),
		vec3( 0.5,  0.5, -0.5),
		vec3( 0.5, -0.5, -0.5)
	];
	// A local array in which to develop the 36 vertices
	var vertices = [];

	// A nested function generating the vertices for each face
	function quad(a, b, c, d) {
		// if abcd is an anticlockwise winding on a face
		// then abc and acd are anticlockwise windings on its triangles
		var indices = [a, b, c, a, c, d];

		for (var i = 0; i < indices.length; ++i) {
			vertices.push(rawverts[indices[i]]);
		}
	}

	// A nested function generating the cube's faces
	function doCube() {
		// Use anticlockwise windings
		quad(1, 0, 3, 2);
		quad(2, 3, 7, 6);
		quad(3, 0, 4, 7);
		quad(6, 5, 1, 2);
		quad(4, 5, 6, 7);
		quad(5, 4, 0, 1);
	}

	doCube();
	return vertices;
}

// The model vertices - a class field
Block.vertices = Block.initModel();
//----------------------------------------------------------------------------


var canvas;
var gl;

var near = 1.0;		// near/far clipping in metres
var far = 300;

var fovy = 27.0;	// Vertical FoV to match standard 50mm lens with 35mm film
var aspect;			// Aspect ratio set from canvas should match 35mm film

var worldview, modelview, projection;	// Worldview, Modelview and projection matrices
var mvLoc, projLoc;						//   and their shader program locations
var colLoc;								// Colour shader program location

var eye = vec3(0.0, -75.0, 2.0);	// Viewed from standing height, 75m along negative y-axis
var at = vec3(0.0, 0.0, 2.0);		// Looking at standing height in henge centre
const up = vec3(0.0, 0.0, 1.0);		// VUP along world vertical

const GRASS = vec4(0.4, 0.8, 0.2, 1.0);		// Some colours
const STONE = vec4(0.5, 0.5, 0.4, 1.0);

//	Ground vertices for a 2000m x 2000m triangle fan
var ground = [
	vec3(1000.0, -1000.0, 0.0),
	vec3(1000.0, 1000.0, 0.0),
	vec3(-1000.0, 1000.0, 0.0),
	vec3(-1000.0, -1000.0, 0.0)
];
var NVground = 4;	// Number of ground vertices

// Stonehenge parameters (lengths in metres)
const RINGRAD = 16.5;	// Radius of ring
const SSH = 4.1;		// Standing stone height (above ground)
const SSW = 2.1;		// Standing stone width
const SST = 1.1;		// Standing stone thickness
const LSH = 0.8;		// Lintel stone height
const LSW = 3.2;		// Lintel stone width (aka length)
const LST = 1.0;		// Lintel stone thickness
const NST = 30;			// Number of stones of each types (total = 2*NST)

// Arrays of Block objects representing the standing stones and the lintels
var uprights = [];
var lintels = [];


window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect =  canvas.width/canvas.height;

    // Generate arrays of stone blocks
    doStones();

    gl.clearColor(0.6, 0.8, 1.0, 1.0);		// Light blue background for sky
    gl.enable(gl.DEPTH_TEST);

	//
	//  Load shaders and initialise attribute buffers
	//	Uses a single buffer and a single vertex array
	//
	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	var vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec3']*(NVground+Block.NV), gl.STATIC_DRAW);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(ground));
	gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec3']*NVground, flatten(Block.vertices));

	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	mvLoc = gl.getUniformLocation(program, "modelView");
	projLoc = gl.getUniformLocation(program, "projection");
	colLoc = gl.getUniformLocation(program, "colour");

	projection = perspective(fovy, aspect, near, far);
	gl.uniformMatrix4fv(projLoc, false, flatten(projection));

	// Event handlers
	// Buttons to change fovy
	document.getElementById("Button1").onclick = function() {
		fovy += 6.0;
		if (fovy > 45.0) {fovy = 45.0;}
		projection = perspective(fovy, aspect, near, far);
		gl.uniformMatrix4fv(projLoc, false, flatten(projection));
		render();
	};
	document.getElementById("Button2").onclick = function() {
		fovy -= 6.0;
		if (fovy < 15.0) {fovy = 15.0;}
		projection = perspective(fovy, aspect, near, far);
		gl.uniformMatrix4fv(projLoc, false, flatten(projection));
		render();
	};


	// Keys to change viewing position/direction
	// Inefficient code arranged for readability
	window.onkeydown = function(event) {
		var key = String.fromCharCode(event.keyCode);
		var forev = subtract(at, eye);				// current view forward vector
		var foreLen = length(forev);				// current view forward vector length
		var fore = normalize(forev);				// current view forward direction
		var right = normalize(cross(fore, up));		// current horizontal right direction
		var ddir = 2.0*Math.PI/180.0;				// incremental view angle change
		var dat;									// incremental at change
		switch( key ) {
		  case 'W':
			at = add(at, fore);
			eye = add(eye, fore);
			break;
		  case 'S':
			at = subtract(at, fore);
			eye = subtract(eye, fore);
			break;
		  case 'A':
		    at = subtract(at, right);
		    eye = subtract(eye, right);
		    break;
		  case 'D':
		    at = add(at, right);
		    eye = add(eye, right);
		    break;
		  // The following calculate the displacement of 'at' for +/- 2 degree view angle change
		  //   around the horizontal circle centred at 'eye', then apply it to 'at'
		  case 'Q':
		    dat = subtract(scale(foreLen*(Math.cos(ddir) - 1.0), fore), scale(foreLen*Math.sin(ddir), right));
		    at = add(at, dat);
		    break;
		  case 'E':
		    dat = add(scale(foreLen*(Math.cos(ddir) - 1.0), fore), scale(foreLen*Math.sin(ddir), right));
		    at = add(at, dat);
		    break;
		}
		render();
	};

	render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	worldview = lookAt(eye, at, up);
	// Ground in world coordinates needs modelview = worldview
	gl.uniformMatrix4fv(mvLoc, false, flatten(worldview));
    gl.uniform4fv(colLoc, flatten(GRASS));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, NVground);

    // Stones in model coordinates need modelview = worldview*TRS
    gl.uniform4fv(colLoc, flatten(STONE));
    for (var i = 0; i < NST; i++) {
		uprights[i].render(NVground, worldview);
		lintels[i].render(NVground, worldview);
	}
}

function doStones() {
	// Generate uprights array
	var scales = vec3(SST, SSW, SSH);	// stone faces along x-direction
	var dtheta = 2*Math.PI/NST;			// angle change per stone in radians
	var theta;
	var location;
	for (var i = 0; i < NST; i++) {
		theta = i*dtheta;
		location = vec3(RINGRAD*Math.cos(theta), RINGRAD*Math.sin(theta), 0.5*SSH);
		uprights[i] = new Block(location, theta*180.0/Math.PI, scales);
	}
	// Generate lintels array
	scales = vec3(LST, LSW, LSH);	// stone lies along y-direction
	for (i = 0; i < NST; i++) {
		theta = (i + 0.5)*dtheta;	// includes offset angle upright to lintel
		location = vec3(RINGRAD*Math.cos(theta), RINGRAD*Math.sin(theta), SSH + 0.5*LSH);
		lintels[i] = new Block(location, theta*180.0/Math.PI, scales);
	}
}
