// Program to test segment intersection
// Shows intersection testing
// Author Ken Lodge 24/06/2015

var gl;
var vertices = [];
var count = 0;
var NumVertices = 4;
var GREEN = vec4(0.0, 1.0, 0.0, 1.0);
var RED = vec4(1.0, 0.0, 0.0, 1.0);
var colLoc;

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    canvas.addEventListener("mousedown", function(event){
		// Allow for canvas bounding box and record vertex
		var rect = canvas.getBoundingClientRect();
        	vertices[count++] = 
			vec2(2*(event.clientX-rect.left)/canvas.width-1, 2*(canvas.height-(event.clientY-rect.top))/canvas.height-1);

        	// After all vertices entered send data to buffer and render
        	if (count == NumVertices) {
			gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
			render();
		}
    });

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
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    // Get location of uniform variable
    colLoc = gl.getUniformLocation(program, "colour");

    render();
};

// Tests if the line segments are intersecting
function intersecting(vlist) {
	// Argument is assumed an array of 4 2D points in order P0, P1, Q0, Q1
	var pq = subtract(vlist[2], vlist[0]);	// The vector from P0 to Q0 (i.e. Q0-P0)
	var v = subtract(vlist[1], vlist[0]);	// The vector from P0 to P1
	var w = subtract(vlist[3], vlist[2]);	// The vector from Q0 to Q1
	var v2 = dot(v, v);
	var w2 = dot(w, w);
	var vw = dot(v, w);
	var denom = v2*w2 - vw*vw;
	var alpha = dot(pq, subtract(scale(w2,v), scale(vw,w)))/denom;
	var beta = -dot(pq, subtract(scale(v2,w), scale(vw,v)))/denom;
	// The intersection condition counts touching segments as not intersecting
	return alpha > 0.0 && alpha < 1.0 && beta > 0.0 && beta < 1.0;
}


function render() {
	var colour;
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Render lines only if existing
    // Rendering colour depends on whether line segments intersect
    if (count == NumVertices) {
		colour = intersecting(vertices) ? RED : GREEN;
        gl.uniform4fv(colLoc, flatten(colour));
        gl.drawArrays(gl.LINES, 0, vertices.length);
        count = 0;	// Allow user to repeat after each rendering
	}
}
