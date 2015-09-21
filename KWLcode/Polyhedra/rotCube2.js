// Program to draw a spinning cube
// Develops on rotCube1.js to spin only about viewer's x,y,z axes.
// Author Ken Lodge 13/07/2015, varying A&S cube.js

var gl;
var NumVertices = 36;

var points = [];
var colours = [];

var axis = [1, 0, 0];		// current spin axis
var theta = 0;				// current angle about spin axis

var mv;					// The modelview matrix
var mvlast = mat4();	// The modelview matrix before the current axis
var matLoc;				// Corresponding shader program location

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    //
    //  Initialise data
    //

    // Define vertices and vertex colours for the colour cube
    // Vertex indexing is as in A&S Fig 4.30,
    //   with x along 4-7, y along 4-5, z along 4-0
    // Vertex colours relate to these indexes as in A&S Fig 2.25

    vertices = [
        vec4(-0.5, -0.5,  0.5, 1.0),
        vec4(-0.5,  0.5,  0.5, 1.0),
        vec4( 0.5,  0.5,  0.5, 1.0),
        vec4( 0.5, -0.5,  0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5,  0.5, -0.5, 1.0),
        vec4( 0.5,  0.5, -0.5, 1.0),
        vec4( 0.5, -0.5, -0.5, 1.0)
    ];

    vertexColours = [
    	vec4(0.0, 0.0, 1.0, 1,0),	// blue
    	vec4(0.0, 1.0, 1.0, 1.0),	// cyan
    	vec4(1.0, 1.0, 1.0, 1.0),   // white
    	vec4(1.0, 0.0, 1.0, 1.0),	// magenta
    	vec4(0.0, 0.0, 0.0, 1.0),	// black
    	vec4(0.0, 1.0, 0.0, 1.0),	// green
    	vec4(1.0, 1.0, 0.0, 1.0),	// yellow
    	vec4(1.0, 0.0, 0.0, 1.0)	// red
    ];

    // Generate the 36 vertices needed for the cube
    colourCube();

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the vertex locations into VBO vBuffer
    // and set up a vertex attribute array on vPosition

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Load the vertex colours into VBO cBuffer
    // and set up a vertex attribute array on vColour

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colours), gl.STATIC_DRAW);

    var vColour = gl.getAttribLocation(program, "vColour");
    gl.vertexAttribPointer(vColour, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColour);

	// get modelview's shader program location
    matLoc = gl.getUniformLocation(program, "modelview");

    //event listeners for buttons
	// Each zeros the spin angle and defines the current orientation
	// and new spin axis.
    document.getElementById( "xButton" ).onclick = function () {
		mvlast = mv;
		theta = 0;
        axis = [1, 0, 0];
    };
    document.getElementById( "yButton" ).onclick = function () {
		mvlast = mv;
		theta = 0;
        axis = [0, 1, 0];
    };
    document.getElementById( "zButton" ).onclick = function () {
		mvlast = mv;
		theta = 0;
        axis = [0, 0, 1];
    };

    render();
};

// Generate a face by generating vertices for each triangle
function quad(a, b, c, d)
{
	// if abcd is an anticlockwise winding on a face
	// then abc and acd are anticlockwise windings on its triangles
	var indices = [a, b, c, a, c, d];

	for (var i = 0; i < indices.length; ++i) {
		points.push(vertices[indices[i]]);
		colours.push(vertexColours[indices[i]]);
	}
}

// Generate the cube by generating each face
function colourCube() {
	// Use anticlockwise windings
	quad(1, 0, 3, 2);
	quad(2, 3, 7, 6);
	quad(3, 0, 4, 7);
	quad(6, 5, 1, 2);
	quad(4, 5, 6, 7);
	quad(5, 4, 0, 1);
}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Increment angle about current spin axis
	theta += 2.0;
	// Calculate modelview matrix as a rotation since the last axis change
	mv = mult(rotate(theta, axis), mvlast);
	// Send modelview matrix to shader program
	gl.uniformMatrix4fv(matLoc, false, flatten(mv));

    gl.drawArrays(gl.TRIANGLES, 0, points.length);

    requestAnimFrame(render);
}
>>>>>>> bb68148f39d36f4bb6c8ab72bf66680649fe0436
