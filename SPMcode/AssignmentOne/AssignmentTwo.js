

var gl;
var vertices = [];

var count = 0;
var NumVertices = 3;

var winding = 1;
var GREEN = vec4(0.0, 1.0, 0.0, 1.0);
var RED = vec4(1.0, 0.0, 0.0, 1.0);
var colLoc;


window.onload = function() {
	var canvas = document.getElementById("gl-canvas");

	//  Initialize GL context
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}

	//  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    //  setup the viewport and initial colour
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.7, 0.7, 0.7, 1.0);

	//  Setup a GPU buffer for data
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);


    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Get location of uniform variable
    colLoc = gl.getUniformLocation(program, "colour");


    canvas.addEventListener("mousedown", function(event){
		// Allow for canvas bounding box and record vertex
		var rect = canvas.getBoundingClientRect();
        vertices[count++] = vec3(2*(event.clientX-rect.left)/canvas.width-1,
           2*(canvas.height-(event.clientY-rect.top))/canvas.height-1, 0);

        // After all vertices entered send data to buffer and render
        if (count == NumVertices) {
			gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
			render();
		}
    });

    render();

}
// Tests if the winding is anticlockwise (Right Hand Thumb rule)
function RHTwinding(vlist) {
	// Argument is assumed an array of 3 3D points in order P0, P1, P2
	// Calculate cross product (P1-P0)x(P2-P0)
	var norm = cross(subtract(vlist[1], vlist[0]), subtract(vlist[2], vlist[0]));
	return norm[2] >= 0;
}

function render() {
	var colour;
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Render triangle only if defined
    // Rendering colour depends on whether winding is anticlockwise
    if (count == NumVertices) {
		colour = RHTwinding(vertices) ? GREEN : RED;
        gl.uniform4fv(colLoc, flatten(colour));
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
        count = 0;	// Allow user to repeat after each rendering
	}
}

