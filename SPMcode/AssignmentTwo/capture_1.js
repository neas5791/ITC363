

var gl;
var vertices    = []; // array of vec3 vertices

var index       = 0;
var vCount      = 5;
var maxVertices = 10;

var GREEN       = vec4(0.0, 1.0, 0.0, 1.0);
var RED         = vec4(1.0, 0.0, 0.0, 1.0);
var colLoc;


window.onload = function() {

    // Handle the slider event 
    document.getElementById("slider").onchange = function(event) {
        // set variable to slider value
        vCount = event.target.value;
        // just a little bit of sconsole action to see how things are going
        var element = document.getElementById("count");
        element.innerHTML = vCount;

        clearCanvas(); // clear the screen and reset for the user to start again

        console.log("NumVertices is now " + vCount);

    };




    
    // sets the number of vertices html element
    document.getElementById("count").innerHTML = vCount;

    // create the canvas object
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
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    // Allocate the MAX memory required for the buffer
    gl.bufferData( gl.ARRAY_BUFFER, sizeof['vec3'] * maxVertices, gl.STATIC_DRAW );

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    // Get location of uniform variable
    // the variable for colour used in the application has to 
    // be linked to the corresponding variable in the vertex shader.
    // The function gl.getUniformLocation performs the first step in the 
    // process by obtaining an identifier for the vertex shader variable vColor.
    colLoc = gl.getUniformLocation(program, "fColour");

    /* ********************************************************************** */
    canvas.addEventListener("mousedown", function(event){
        
        // Select the vertex BUFFER
        // gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );

        // Allow for canvas bounding box and record vertex
		var rect = canvas.getBoundingClientRect();
        var t = 
            vec3( 2 * (event.clientX-rect.left) / canvas.width - 1, 
                    2 * (canvas.height- (event.clientY-rect.top) ) / canvas.height - 1, 0);
        // Put the vertex information onto the GPU BUFFER
        gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec3'] * index, flatten(t));
        
        // add the vertex to the Testing Array
        vertices.push(t);

        if (index < vCount)
            // Incretment the index
            index++;

        // Test rotation of the polygon
        if (index > 2){
            clockwise = RHTwinding(vertices);
            console.log("clockwise = " + clockwise);
            console.log("index: " + index);
            render();
        }

        // render();
    });

    render();
}

function render(){
    // cleans the screen paints canvas 
    gl.clear( gl.COLOR_BUFFER_BIT );

    
    gl.uniform4fv(colLoc, flatten(GREEN));
    console.log("draw triangle")
    gl.drawArrays(gl.TRINGLE, 0, index);

    
    if (index == vCount) {
        console.log("paint triangle");
        gl.uniform4fv(colLoc, flatten(RED));
        gl.drawArrays(gl.TRINGLE_STRIP, 0, index);
    }
}

function isComplete() {
    // test if index is equal to the number of vertex
    return index == vCount ? true : false;
}

function reset(){
    vertices = [];
    index = 0;
}

function showLocation(u) {
    // logs selected vertex information to console
    console.log("[" + u[0] + ":" + u[1] + ":" + u[2] + "]" );
}

// Tests if the winding is anticlockwise (Right Hand Thumb rule)
function RHTwinding(vlist) {
    var i = vlist.length;

    // Argument is assumed an array of 3 3D points in order P0, P1, P2
    // Calculate cross product (P1-P0)x(P2-P0)
    var norm = cross(subtract(vlist[ i - 2 ], vlist[ i - 3 ]), subtract(vlist[ i - 1 ], vlist[ i - 3 ]));
    return norm[2] >= 0;
}

function clearCanvas() {
    reset();

    render();

    console.log("clearCanvas called");
}

function render1() {
    var colour;
    gl.clear(gl.COLOR_BUFFER_BIT);
    testMessage(6);
    // Render triangle only if defined
    // Rendering colour depends on whether winding is anticlockwise
    if (index == NumVertices) {
        colour = RHTwinding(vertices) ? GREEN : RED;
        // console.log(RHTwinding(vertices));
        gl.uniform4fv(colLoc, flatten(colour));
        gl.drawArrays(gl.LINE, 0, vertices.length);
        index = 0;  // Allow user to repeat after each rendering
    }
    colour = vec4(0.0, 0.0, 0.0, 1.0);
    gl.uniform4fv(colLoc, flatten(colour));
    gl.drawArrays(gl.LINE_STRIP, 0, vertices.length)
}

function state(){
    // logs current state to console
    console.log("vertices length is " + vertices.length);
    console.log("index is " + index);
    console.log("vCount is set to " + vCount);
}

function showArray(arr){
    for (  i = 0; i < arr.length; i++ ) {
        console.log("vertics["+ i +"] = "+ arr[i]);
    }
}