// Variation on Angel's ortho.js with the following changes:
// * Initial settings to radius, near and far allow viewer angular
//   motion with no clipping of the cube.
// * Viewer's vertical is in the North polar direction.
// * Viewer's initial position provides a sensible initial view.
// * Viewer's location is kept away from polar singularities.
// KWL 07/08/2015

var canvas;
var gl;


var pointsArray = [];
var colorsArray = [];


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

var nConicalFace = 6;
var conicalVerts = []; // 3 vertice per face
var cylinderVerts = [];
var theta = ( 360.0 / nConicalFace ) * Math.PI / 180.0; // convert to radians


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

    buildDataArray();

    createCanopy();

    // createTrunk();

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

    // console.log ("TRIANGLES = " + nConicalFace * 3);
    // console.log ("QUADS = " + ( 2 + ( nConicalFace * 2)));

    // console.log( (nConicalFace * 3) + ( 2 + ( nConicalFace * 2)) == pointsArray.length? true:false)

	gl.drawArrays( gl.TRIANGLES, 0, nConicalFace * 3 );
    // gl.drawArrays( gl.TRIANGLE_STRIP, nConicalFace * 3, ( ( nConicalFace * 2) + 2 ) );

}

function state(){
    console.log("near : " + near);
    console.log("far : " + far);
    console.log("radius : " + radius);
    // console.log("near : " + near);
}

function buildDataArray(){
    console.log("In buildDataArray()");
    conicalVerts.push( vec4( 0.0, 0.5, 0.0, 1.0));

    for ( var j = 0; j < nConicalFace; j++ ) {
        conicalVerts[ j + 1 ] = vec4( Math.cos( j * theta) / 2.0, 0.1, Math.sin(j * theta) / 2.0, 1.0 ); // scale the rawVertices
    }

    // number of vertices = 2V + 2 
    // i.e 6 faces polygon = 
    //     4V on first face then 2 vertices on each face after that
    for ( var j = 0; j < (nConicalFace * 2.0) + 2.0; j++ ){
        if (j % 2 == 0) {
            cylinderVerts[j] = vec4( Math.cos( j * theta) / 6.0, 0.1, Math.sin(j * theta) / 6.0, 1.0 );
        }
        else {
            // each odd count of j represents a vertices directly below in the y direction
            cylinderVerts[j] = vec4( Math.cos( ( j - 1 ) * theta) / 6.0, 0.0, Math.sin( ( j - 1 ) * theta) / 6.0, 1.0 );
        }
    }

    // for (var i = 0; i < conicalVerts.length; i ++) {
    //     console.log("Cone vertices " + i + " = " + conicalVerts[i])
    // }

    // for (var i = 0; i < cylinderVerts.length; i ++) {
    //     console.log(i + " = " + cylinderVerts[i])
    // }
}


// Each face
function createCanopy() {
    console.log("In createCanopy()");
    for ( var i = nConicalFace; i > 0; i-- ) {
        triags( 0, i, (i - 1) == 0 ? 6 : i - 1)
    }
    console.log(pointsArray.length);
}

function createTrunk(){
    console.log("In createTrunk()");
    for (var i = 0; i < cylinderVerts.length; i++)
        pointsArray.push(cylinderVerts[i]);
}

// pushes triangle vertices to the pointsArray
function triags(a, b, c) {
    pointsArray.push(conicalVerts[a]);
    colorsArray.push(vertexColors[b]); 
    pointsArray.push(scale(1.0, conicalVerts[b]));
    colorsArray.push(vertexColors[b]); 
    pointsArray.push(scale(1.0, conicalVerts[c]));
    colorsArray.push(vertexColors[b]); 
}

// pushes the vertices for each face to pointsArray
function quad(a, b, c, d) {
    // if abcd is an anticlockwise winding on a face
    // then abc and acd are anticlockwise windings on its triangles
    var indices = [a, b, c, a, c, d];

    for (var i = 0; i < indices.length; ++i) {
        vertices.push(pointsArray[indices[i]]);
    }
}

// A nested function generating the cube's faces
function doCube() {
    // Use anticlockwise windings
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}
