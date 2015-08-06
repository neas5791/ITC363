// Program to draw a red cross
// Shows WebGL line facilities
// Author Ken Lodge 27/07/2014

var gl;
var vertices;

var NumVertices = 4;

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    //
    //  Initialise data
    //

    // Define the vertices for lines from corner to corner

    vertices = [
        vec2(-1, 1),
        vec2(1, -1),
        vec2(1, 1),
        vec2(-1, -1)
    ];

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
    gl.lineWidth(5.0);
    gl.drawArrays(gl.LINES, 0, vertices.length);
}
