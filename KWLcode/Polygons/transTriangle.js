// Program to translate a triangle
// Based on the winding test example
// Author Ken Lodge 27/07/2015

var gl;
var vertices = [];
var count = 0;
var NumVertices = 3;
var GREEN = vec4(0.0, 1.0, 0.0, 1.0);
var RED = vec4(1.0, 0.0, 0.0, 1.0);
var colLoc;

var trans;		// displacement of triangle's origin
var matLoc;		// shader program location of modelview

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    canvas.addEventListener("mousedown", function(event){
		// Allow for canvas bounding box and record vertex
		var rect = canvas.getBoundingClientRect();
		// Reset count on beginning to draw a new triangle
		if (count == NumVertices) {
			count = 0;
		}
        vertices[count++] = vec3(2*(event.clientX-rect.left)/canvas.width-1,
           2*(canvas.height-(event.clientY-rect.top))/canvas.height-1, 0);

        // After all vertices entered send data to buffer and render
        if (count == NumVertices) {
			doModel();
			gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
			render();
		}
    });

	window.onkeydown = function( event ) {
		var key = String.fromCharCode(event.keyCode);
		switch( key ) {
		  case 'W':
			trans = add(trans, [0, 0.01, 0]);
			break;
		  case 'S':
			trans = add(trans, [0, -0.01, 0]);
			break;
		  case 'A':
			trans = add(trans, [-0.01, 0, 0]);
			break;
		  case 'D':
		    trans = add(trans, [0.01, 0, 0]);
		    break;
		}
		render();
	};


    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.7, 0.7, 0.7, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Setup a GPU buffer for data

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

    // Associate our shader variables with our data buffer

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    // Get location of uniform variables
    colLoc = gl.getUniformLocation(program, "colour");
    matLoc = gl.getUniformLocation(program, "modelview");

    render();
};

// Tests if the winding is anticlockwise (Right Hand Thumb rule)
function RHTwinding(vlist) {
	// Argument is assumed an array of 3 3D points in order P0, P1, P2
	// Calculate cross product (P1-P0)x(P2-P0)
	var norm = cross(subtract(vlist[1], vlist[0]), subtract(vlist[2], vlist[0]));
	return norm[2] >= 0;
}

// Model the vertices entered
function doModel() {
	// Calculate model origin for triangle by averaging vertices
	trans = vec3();
	for (var i = 0; i < NumVertices; i++) {
		trans = add(trans, vertices[i]);
	}
	trans = scale(1/NumVertices, trans);
	// Reset vertices with respect to model origin
	for (i = 0; i < NumVertices; i++) {
		vertices[i] = subtract(vertices[i], trans);
	}
}

function render() {
	var colour;
	var mv;
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Render triangle only if defined
    // Rendering colour depends on whether winding is anticlockwise
    if (count == NumVertices) {
		colour = RHTwinding(vertices) ? GREEN : RED;
        gl.uniform4fv(colLoc, flatten(colour));
        // Calculate the modelview matrix and send
        mv = translate(trans);
        gl.uniformMatrix4fv(matLoc, false, flatten(mv));

        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
	}
}
