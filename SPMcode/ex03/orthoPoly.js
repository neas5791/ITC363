// Variation on Angel's ortho.js with the following changes:
// * Initial settings to radius, near and far allow viewer angular
//   motion with no clipping of the cube.
// * Viewer's vertical is in the North polar direction.
// * Viewer's initial position provides a sensible initial view.
// * Viewer's location is kept away from polar singularities.
// KWL 07/08/2015

var canvas;
var gl;

var numVertices  = 18;

var pointsArray = [];
var colorsArray = [];

vertices = [
    vec4(   0.0 , 0.75 ,       0.0        , 1.0 ),
    vec4(   0.5 , 0.00 ,       0.0        , 1.0 ),
    vec4(  0.25 , 0.00 ,  Math.sqrt(3)/4  , 1.0 ),
    vec4( -0.25 , 0.00 ,  Math.sqrt(3)/4  , 1.0 ),
    vec4( - 0.5 , 0.00 ,       0.0        , 1.0 ),
    vec4( -0.25 , 0.00 ,  -Math.sqrt(3)/4 , 1.0 ),
    vec4(  0.25 , 0.00 ,  -Math.sqrt(3)/4 , 1.0 )
];

var vertexColors = [
	vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
	vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
	vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
	vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
	vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
	vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
	vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
	vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
];

var near = -1;
var far = 1;
var radius = 1.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;
var minTheta = 5.0*Math.PI/180.0;   // Closest approach to poles

var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;


var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// Each face determines two triangles
function triags(a, b, c) {
    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[b]); 
    pointsArray.push(scale(0.25, vertices[b]));
    colorsArray.push(vertexColors[b]); 
    pointsArray.push(scale(0.25, vertices[c]));
    colorsArray.push(vertexColors[b]); 
}

// Each face
function createTriangles() {
    triags( 0, 6, 5 );
    triags( 0, 5, 4 );
    triags( 0, 4, 3 );
    triags( 0, 3, 2 );
    triags( 0, 2, 1 );
    triags( 0, 1, 6 );
}



window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    createTriangles();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelView = gl.getUniformLocation( program, "modelView" );
    projection = gl.getUniformLocation( program, "projection" );

// buttons to change viewing parameters
//	add call to render following any change KWL 06/08/2015
    document.getElementById("Button1").onclick = function(){near  *= 1.1; far *= 1.1;};
    document.getElementById("Button2").onclick = function(){near *= 0.9; far *= 0.9;};
    document.getElementById("Button3").onclick = function(){radius *= 1.1;};
    document.getElementById("Button4").onclick = function(){radius *= 0.9;};
    // document.getElementById("Button5").onclick = function(){theta += dr;};
    // document.getElementById("Button6").onclick = function(){theta -= dr;};
    // document.getElementById("Button7").onclick = function(){phi += dr;};
    // document.getElementById("Button8").onclick = function(){phi -= dr;};
// keys to change viewing position
	window.onkeydown = function(event) {
		var key = String.fromCharCode(event.keyCode);
		switch( key ) {
		  case 'W':
			theta -= dr;
			// On decrease prevent theta < minimum
			if (theta < minTheta) {
				theta = minTheta;
			}
			break;
		  case 'S':
			theta += dr;
			// On increase prevent theta > maximum
			if (theta > Math.PI - minTheta) {
				theta = Math.PI - minTheta;
			}
			break;
		  case 'A':
			phi -= dr;
			break;
		  case 'D':
		    phi += dr;
		    break;
		}
		render();
	};

    render();
}


function render() {
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// Fix to correspond to polar coordinates (Textbook p. 273) KWL 06/08/2015
	eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
	           radius*Math.sin(theta)*Math.sin(phi),
		 	   radius*Math.cos(theta));

	mvMatrix = lookAt(eye, at , up);
	pMatrix = ortho(left, right, bottom, ytop, near, far);

	gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
	gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

	gl.drawArrays( gl.TRIANGLES, 0, numVertices );
	// Remove unnecessary animation KWL 06/08/2015
	// requestAnimFrame(render);
}

function state(){
    console.log("near : " + near);
    console.log("far : " + far);
    console.log("radius : " + radius);
    // console.log("near : " + near);
}