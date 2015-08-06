// Program to draw different line types
// Shows how to handle different line types with a single buffer
// Author Ken Lodge 27/07/2014

var gl;

var NumVertices = 24;
var vertices = new Array(NumVertices);		// The vertices defining the lines
var NVLines, NVStrip1, NVStrip2, NVLoop; 	// The vertices for each line type

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert( "WebGL isn't available" ); }

    //
    //  Initialise data
    //

    var i = 0;

    // Define the vertices for two separate line segments
    vertices[i++] = vec2(-0.4, 0.25);
    vertices[i++] = vec2(-0.2, 0.25);
    vertices[i++] = vec2(0.2, 0.25);
    vertices[i++] = vec2(0.4, 0.25);
    NVLines = i;

    // Define the vertices for one line strip
    vertices[i++] = vec2(-0.1, -0.05);
    vertices[i++] = vec2(0.0, 0.15);
    vertices[i++] = vec2(0.1, -0.05);
    NVStrip1 = i - NVLines;

    //Define vertices for another line strip
    vertices[i++] = vec2(-0.4, -0.3);
    vertices[i++] = vec2(-0.3, -0.25);
    vertices[i++] = vec2(-0.2, -0.3);
    vertices[i++] = vec2(-0.1, -0.25);
    vertices[i++] = vec2(0.0, -0.3);
    vertices[i++] = vec2(0.1, -0.25);
    vertices[i++] = vec2(0.2, -0.3);
    vertices[i++] = vec2(0.3, -0.25);
    vertices[i++] = vec2(0.4, -0.3);
    NVStrip2 = i - (NVLines + NVStrip1);

    //Define the vertices for a line loop
    vertices[i++] = vec2(0.7, -0.3);
    vertices[i++] = vec2(0.7, 0.3);
    vertices[i++] = vec2(0.3, 0.7);
    vertices[i++] = vec2(-0.3, 0.7);
    vertices[i++] = vec2(-0.7, 0.3);
    vertices[i++] = vec2(-0.7, -0.3);
    vertices[i++] = vec2(-0.3, -0.7);
    vertices[i++] = vec2(0.3, -0.7);
    NVLoop = i - (NVLines + NVStrip1 + NVStrip2);

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render();
};


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, NVLines);                                // draw the line segments
    gl.drawArrays(gl.LINE_STRIP, NVLines, NVStrip1);                    // draw line strip 1
    gl.drawArrays(gl.LINE_STRIP, NVLines + NVStrip1, NVStrip2);         // draw line strip 2
    gl.drawArrays(gl.LINE_LOOP, NVLines + NVStrip1 + NVStrip2, NVLoop); // draw the line loop
}
