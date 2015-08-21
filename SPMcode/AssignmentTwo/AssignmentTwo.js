

var gl;
var vertices = []; // array of vec3 vertices

var count = 0;
var NumVertices = 3;

var maxVertices = 3;
var winding = 1;

var GREEN = vec4(0.0, 1.0, 0.0, 1.0);
var RED = vec4(1.0, 0.0, 0.0, 1.0);
var colLoc;


window.onload = function() {
    
    // sets the number of vertices html element
    document.getElementById("count").innerHTML = NumVertices;

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
    gl.bufferData( gl.ARRAY_BUFFER, sizeof['vec3'] * 4 * maxVertices, gl.STATIC_DRAW );
    console.log(sizeof['vec3']);
    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Get location of uniform variable
    colLoc = gl.getUniformLocation(program, "colour");


    canvas.addEventListener("mousedown", function(event){
        // if ( count == 0 )
        //      showLocation(vertices[0]);

        // Allow for canvas bounding box and record vertex
		var rect = canvas.getBoundingClientRect();
        
        vertices[count] = vec3( 2 * (event.clientX-rect.left) / canvas.width - 1,
                                  2 * (canvas.height- (event.clientY-rect.top) ) / canvas.height - 1,
                                  0
                                  );

        showLocation(vertices[count]);
            
        gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec3'] * (count), flatten(vertices));

        count++;
        render();
    });


        // Handle the slider event 
    document.getElementById("slider").onchange = function(event) {
        // set variable to slider value
        NumVertices = event.target.value;
        // just a little bit of sconsole action to see how things are going
        var element = document.getElementById("count");
        element.innerHTML = NumVertices;

        clearCanvas(); // clear the screen and reset for the user to start again

        console.log("NumVertices is now " + NumVertices);
    };

    render();

}
// Tests if the winding is anticlockwise (Right Hand Thumb rule)
function RHTwinding(vlist) {
    var i = vlist.length;

	// Argument is assumed an array of 3 3D points in order P0, P1, P2
	// Calculate cross product (P1-P0)x(P2-P0)
    // console.log(i);
    console.log ("["+ (i - 2) +":"+(i-3)+"]");
	var norm = cross(subtract(vlist[i-2], vlist[i-3]), subtract(vlist[i-1], vlist[i-3]));
	return norm[2] >= 0;
}

function render1() {
	var colour;
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Render triangle only if defined
    // Rendering colour depends on whether winding is anticlockwise
    if (count == NumVertices) {
		colour = RHTwinding(vertices) ? GREEN : RED;
        // console.log(RHTwinding(vertices));
        gl.uniform4fv(colLoc, flatten(colour));
        gl.drawArrays(gl.LINE, 0, vertices.length);
        count = 0;	// Allow user to repeat after each rendering
	}
    colour = vec4(0.0, 0.0, 0.0, 1.0);
    gl.uniform4fv(colLoc, flatten(colour));
    gl.drawArrays(gl.LINE_STRIP, 0, vertices.length)
}

function clearCanvas() {
    vertices = [];
    count = 0;

    render();

    console.log("clearCanvas called");
    // console.log(sizeof['vec3']);
}

function render(){
    // cleans the screen paints canvas 
    gl.clear( gl.COLOR_BUFFER_BIT );

    // set colour to black
    colour = vec4(0.0,0.0,0.0,1.0);

    if (count == 2)
        colour = RED;
    else if ( count == 3)
        colour = GREEN;

    gl.uniform4fv(colLoc, flatten(colour));
    gl.drawArrays( gl.POINTS, 0, count );


    // if (count == 2) {
    //     colour = GREEN;
    //     gl.uniform4fv(colLoc, flatten(colour));
    //     // gl.drawArrays(gl.LINE, 0, count);
    // } 
    // else if (count > 2) {
    //     console.log("more then two vertices")
    // }

}

// function showLocation(u, v) {
//     console.log("[" + u + ":" + v + "]" );
// }
function showLocation(u) {
    console.log("[" + u[0] + ":" + u[1] + ":" + u[2] + "]" );
}