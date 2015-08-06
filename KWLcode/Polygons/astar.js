// Displays a 5-point star.
// Keyboard controls alter colour.
// Author Ken Lodge 23/06/2015

var canvas;
var gl;

var NFan = 12;

var colLoc;
var Rval = 1.0;
var Gval = 1.0;
var Bval = 1.0;
var delta = 0.1;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	window.onkeydown = function (event) {
		var key = String.fromCharCode(event.keyCode);
		switch(key) {
			case 'R':
				Rval = event.shiftKey ? Rval + delta : Rval - delta;
				if (Rval > 1.0) Rval = 1.0;
				if (Rval < 0.0) Rval = 0.0;
				break;
			case 'G':
				Gval = event.shiftKey ? Gval + delta : Gval - delta;
				if (Gval > 1.0) Gval = 1.0;
				if (Gval < 0.0) Gval = 0.0;
				break;
			case 'B':
				Bval = event.shiftKey ? Bval + delta : Bval - delta;
				if (Bval > 1.0) Bval = 1.0;
				if (Bval < 0.0) Bval = 0.0;
		}
		render();
	};
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );	// Black background for star

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Generate the 10 basic vertices of a 5-point star
    // Order: 5 x (inner then outer)
    var rawVertices = [];
    var radin = Math.sin(Math.PI/10)/Math.cos(Math.PI/5);
    for (var n = 0; n < 5; n++) {
		var theta = (Math.PI/5)*(2*n - 0.5);
		rawVertices[2*n] = scale(radin, vec2(Math.cos(theta), Math.sin(theta)));
		theta += Math.PI/5;
		rawVertices[2*n+1] = vec2(Math.cos(theta), Math.sin(theta));
	}

    // Generate vertex array for triangle fan
    var trifan = [vec2(0,0)];
    for (var n = 0; n < 10; n++) {
		trifan[n+1] = rawVertices[n];
	}
	trifan.push(rawVertices[0]);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(trifan), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colLoc = gl.getUniformLocation(program, "colour");

    render();
};


function render() {

    gl.clear(gl.COLOR_BUFFER_BIT);

    var colour = vec4(Rval, Gval, Bval, 1.0);
    gl.uniform4fv(colLoc, flatten(colour));

    gl.drawArrays(gl.TRIANGLE_FAN, 0, NFan);
}
