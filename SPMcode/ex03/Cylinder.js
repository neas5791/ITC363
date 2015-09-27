// Variation on Angel's ortho.js with the following changes:
// * Initial settings to radius, near and far allow viewer angular
//   motion with no clipping of the cube.
// * Viewer's vertical is in the North polar direction.
// * Viewer's initial position provides a sensible initial view.
// * Viewer's location is kept away from polar singularities.
// KWL 07/08/2015

var canvas;
var gl;

// var numVertices  = 18;

var pointsArray = [];
var colorsArray = [];

var nConicalFace = 6;
var conicalVerts = []; // 3 vertice per face therefor 18 vertices
var cylinderVerts = [];
var omega = ( 360.0 / nConicalFace ) * Math.PI / 180.0; // convert to radians


var vertices = [
    // vec4(   0.0 , 0.75 ,       0.0        , 1.0 ),
    vec4(  -0.5 , 0.00 ,       0.0        , 1.0 ),
    vec4( -0.25 , 0.00 ,  Math.sqrt(3)/4  , 1.0 ),
    vec4(  0.25 , 0.00 ,  Math.sqrt(3)/4  , 1.0 ),
    vec4(   0.5 , 0.00 ,       0.0        , 1.0 ),
    vec4(  0.25 , 0.00 ,  -Math.sqrt(3)/4 , 1.0 ),
    vec4( -0.25 , 0.00 ,  -Math.sqrt(3)/4 , 1.0 ),
    vec4(  -0.5 , 0.10 ,       0.0        , 1.0 ),
    vec4( -0.25 , 0.10 ,  Math.sqrt(3)/4  , 1.0 ),
    vec4(  0.25 , 0.10 ,  Math.sqrt(3)/4  , 1.0 ),
    vec4(   0.5 , 0.10 ,       0.0        , 1.0 ),
    vec4(  0.25 , 0.10 ,  -Math.sqrt(3)/4 , 1.0 ),
    vec4( -0.25 , 0.10 ,  -Math.sqrt(3)/4 , 1.0 )
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


window.onload = function init() {

    var upper = [];
    var lower = [];

    var nv = (nConicalFace * 2.0) + 2.0;
    // number of vertices = 2V + 2 
    // i.e 6 faces polygon = 
    //          4V on first face then 2 vertices on each face after that
    for ( var j = 0; j < nConicalFace ; j++ ){
        
        upper.push( vec4( Math.cos( j * omega ) / -4.0,  0.1, Math.sin( j * omega ) / 4.0, 1.0 ) );
        lower.push( vec4( Math.cos( j * omega ) / -4.0,  0.0, Math.sin( j * omega ) / 4.0, 1.0 ) );

        // if (j % 2 == 0)
        //     cylinderVerts[ j ] = vec4(        Math.cos( j * omega ) / 4.0,  0.1,        Math.sin( j * omega ) / 4.0, 1.0 );
        // else
        // // each odd count of j represents a vertices directly below in the y direction
        //     cylinderVerts[ j ] = vec4( Math.cos( ( j - 1 ) * omega) / 4.0,  0.0, Math.sin( ( j - 1 ) * omega) / 4.0, 1.0 );

        // j += 2;
    }

    cylinderVerts = upper.concat(lower);

    for (var i = 0; i < nConicalFace; i++) {
        pointsArray.push(cylinderVerts[i]);
        pointsArray.push(cylinderVerts[i + nConicalFace]);
    }

    for (var i = 0; i < pointsArray.length; i++) {
        console.log(pointsArray[i]);
    }

    var test=[];

    for (var i = 0; i < pointsArray.length;i++){
        var x = pointsArray.length;
        test.push( pointsArray[ i ] );
        test.push( pointsArray[ i + 1 == x ? (i+1) - x : i + 1 ] );
        test.push( pointsArray[ i + 2 == x ? (i+2) - x : i + 2 ] );

        console.log( i + ", " + (i + 1 >= x ? (i+1) - x : i + 1) + ", " + (i + 2 >= x ? (i+2) - x : i + 2));
        console.log( pointsArray[i] );
        console.log( pointsArray[(i + 1 >= x ? (i+1) - x : i + 1) ] );
        console.log( pointsArray[(i + 2 >= x ? (i+2) - x : i + 2) ] );
        
        // console.log( RHTwinding(test) );

        test = [];
    }


    vertices.push(vertices[2]);




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

    // createTriangles();
    // buildDataArray();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);


    console.log(vertices.length + " vertices to put into the buffer");
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

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


	gl.drawArrays( gl.POINTS, 0, vertices.length );

}

function state(){
    console.log("near : " + near);
    console.log("far : " + far);
    console.log("radius : " + radius);
    // console.log("near : " + near);
}

function buildDataArray(){
    console.log("In buildDataArray()");

    var upper = [];
    var lower = [];

    var nv = (nConicalFace * 2.0) + 2.0;
    // number of vertices = 2V + 2 
    // i.e 6 faces polygon = 
    //          4V on first face then 2 vertices on each face after that
    for ( var j = 0; j < nConicalFace ; j++ ){
        
        upper.push( vec4( Math.cos( j * omega ) / -4.0,  0.1, Math.sin( j * omega ) / 4.0, 1.0 ) );
        lower.push( vec4( Math.cos( j * omega ) / -4.0,  0.0, Math.sin( j * omega ) / 4.0, 1.0 ) );

        // if (j % 2 == 0)
        //     cylinderVerts[ j ] = vec4(        Math.cos( j * omega ) / 4.0,  0.1,        Math.sin( j * omega ) / 4.0, 1.0 );
        // else
        // // each odd count of j represents a vertices directly below in the y direction
        //     cylinderVerts[ j ] = vec4( Math.cos( ( j - 1 ) * omega) / 4.0,  0.0, Math.sin( ( j - 1 ) * omega) / 4.0, 1.0 );

        // j += 2;
    }

    cylinderVerts = upper.concat(lower);

    for (var i = 0; i < nConicalFace; i++) {
        pointsArray.push(cylinderVerts[i]);
        pointsArray.push(cylinderVerts[i + nConicalFace]);
    }

    for (var i = 0; i < pointsArray.length; i++) {
        console.log(pointsArray[i]);
    }

    var test;

    for (var i = 0; i < pointsArray.length - 2;i++){
        test = pointsArray.slice(i, i + 3);
        console.log(RHTwinding(test));
    }
}

function RHTwinding(vlist) {
    var i = vlist.length;

    // Argument is assumed an array of 3 3D points in order P0, P1, P2
    // Calculate cross product (P1-P0)x(P2-P0)
    var norm = cross ( subtract ( vlist[ i - 2 ], vlist[ i - 3 ] ),
                        subtract( vlist[ i - 1 ], vlist[ i - 3 ] ) );
    return norm[2] >= 0;
}