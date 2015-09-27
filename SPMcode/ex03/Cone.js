// Variation on Angel's ortho.js with the following changes:
// * Initial settings to radius, near and far allow viewer angular
//   motion with no clipping of the cube.
// * Viewer's vertical is in the North polar direction.
// * Viewer's initial position provides a sensible initial view.
// * Viewer's location is kept away from polar singularities.
// KWL 07/08/2015

var canvas;
var gl;
var vBuffer;
var vPosition;
var cBuffer;
var vColor;
// var numVertices  = 18;

var pointsArray = [];
var colorsArray;
var nConicalFace = 6;
var conicalVerts ; // 3 vertice per face therefor 18 vertices

var omega = ( 360.0 / nConicalFace ) * Math.PI / 180.0; // convert to radians


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


    buildDataArray();
    createTriangles();

    console.log(conicalVerts.length > 0 ? true:false);
    console.log(conicalVerts.length);
    console.log(colorsArray.length > 0 ? true:false);


    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, sizeof['vec4'] * 100, gl.STATIC_DRAW );

    vPosition = gl.getAttribLocation( program, "vPosition" );
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
    console.log("In render()");
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// Fix to correspond to polar coordinates (Textbook p. 273) KWL 06/08/2015
	eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
	           radius*Math.sin(theta)*Math.sin(phi),
		 	   radius*Math.cos(theta));

	mvMatrix = lookAt(eye, at , up);
	pMatrix = ortho(left, right, bottom, ytop, near, far);

	gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
	gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

    gl.enableVertexAttribArray( vPosition );

	gl.drawArrays( gl.TRIANGLE_FAN, 0, (nConicalFace + 2) );

}

function state(){
    console.log("near : " + near);
    console.log("far : " + far);
    console.log("radius : " + radius);
    // console.log("near : " + near);
}

function buildDataArray(){
    console.log("In buildDataArray()");

    conicalVerts = [];
    colorsArray = [];

    // push the point vertex
    conicalVerts.push( vec4( 0.0, 0.5, 0.0, 1.0));
    // push the 
    for ( var j = 0; j < nConicalFace; j++ ) {
        conicalVerts[ j + 1 ] = vec4( Math.cos( j * omega) / 4.0, 0.1, Math.sin(j * omega) / 4.0, 1.0 ); // scale the rawVertices
        colorsArray.push(vertexColors[j%7]);
    }

    conicalVerts.push(conicalVerts[1]);


    for (var i = 0; i < conicalVerts.length; i ++) {
        console.log("Cone vertices " + i + " = " + conicalVerts[i]);
    }


}

// Each face
// function createCone() {
//     console.log("In createCone()");
//     for ( var i = nConicalFace; i > 0; i-- ) {
//         triags( 0, i, (i - 1) == 0 ? 6 : i - 1)
//     }
//     console.log(pointsArray.length);
// }

// // Each face determines two triangles
function triags(a, b, c) {

    pointsArray.push(conicalVerts[a]);
    colorsArray.push(vertexColors[b]); 
    pointsArray.push(scale(0.25, conicalVerts[b]));
    colorsArray.push(vertexColors[b]); 
    pointsArray.push(scale(0.25, conicalVerts[c]));
    colorsArray.push(vertexColors[b]); 
}

// // Each face
function createTriangles() {
    triags( 0, 6, 5 );
    triags( 0, 5, 4 );
    triags( 0, 4, 3 );
    triags( 0, 3, 2 );
    triags( 0, 2, 1 );
    triags( 0, 1, 6 );
}



