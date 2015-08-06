// Program to draw the Maxwell triangle
// Shows WebGL colour interpolationline facilities
// Author Ken Lodge 08/05/2015

var gl;
var vertices, colours;

var NumVertices = 3;

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    //
    //  Initialise data
    //

    // Define vertices for an equilateral triangle and colours R,G,B

    vertices = [
        vec2(-1.0, -0.866),
        vec2(0.0, 0.866),
        vec2(1.0, -0.866)
    ];

    colours = [
    	vec3(1.0, 0.0, 0.0),
    	vec3(0.0, 1.0, 0.0),
    	vec3(0.0, 0.0, 1.0)
    ];

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the vertex locations into VBO vBuffer
    // and set up a vertex attribute array on vPosition

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Load the vertex colours into VBO cBuffer
    // and set up a vertex attribute array on vColour

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colours), gl.STATIC_DRAW);

    var vColour = gl.getAttribLocation(program, "vColour");
    gl.vertexAttribPointer(vColour, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColour);

    render();
};


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
}
