// Program to draw a stationary cube
// Shows full data structure techniques
// Author Ken Lodge 03/06/2015

var gl;
var NumIndices = 36;

var indices = [];

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

    // Generate the 36 indices needed for the cube
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
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Load the vertex colours into VBO cBuffer
    // and set up a vertex attribute array on vColour

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColours), gl.STATIC_DRAW);

    var vColour = gl.getAttribLocation(program, "vColour");
    gl.vertexAttribPointer(vColour, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColour);

    // Load the index array into VBO iBuffer

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);


    render();
};

// Generate a face's indices by generating indices for each triangle
function quad(a, b, c, d)
{
	// if abcd is an anticlockwise winding on a face
	// then abc and acd are anticlockwise windings on its triangles
	var faceIndex = [a, b, c, a, c, d];

	for (var i = 0; i < faceIndex.length; ++i) {
		indices.push(faceIndex[i]);
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
    gl.drawElements(gl.TRIANGLES, NumIndices, gl.UNSIGNED_BYTE, 0);
}
