
var gl;
var points;

var colLoc;                         // fragment shader location
var matLoc;                         // shader program location of modelview
var trans       = [0.0, 0.0, 0.0, ];    // displacement of triangle's origin
var mv;                             // the transformation matrix

var theta = 0;
var vertices;
var displacementX = [ 0.05, 0, 0 ]; // the positive amount to move the object when translating in X direction
var displacementY = [ 0, 0.05, 0 ]; // the positive amount to move the object when translating in Y direction
var displacementR = 5.0; // the positive amount to rotate the object about an axis
var trans2;

var NV = 6;
var pointsArray = [];
var vertices;

var CYAN = [0.0,1.0,1.0,1.0];
var BLACK = [0.0,0.0,0.0,1.0];
window.onload = function init()
{
    mv = mat4();

    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    
    // Four Vertices
    
    vertices = [
        vec4(   0.0,      0.0        , 0.75 , 1.0 ),
        vec4(   0.5,      0.0        , 0.0  , 1.0 ),
        vec4(  0.25,  Math.sqrt(3)/4 , 0.0  , 1.0 ),
        vec4( -0.25,  Math.sqrt(3)/4 , 0.0  , 1.0 ),
        vec4( - 0.5,      0.0        , 0.0  , 1.0 ),
        vec4( -0.25, -Math.sqrt(3)/4 , 0.0  , 1.0 ),
        vec4(  0.25, -Math.sqrt(3)/4 , 0.0  , 1.0 ),
    ];


    // vertices = [
    //     vec2(   0.0,      0.0        ),
    //     vec2(   0.5,      0.0        ),
    //     vec2(  0.25,  Math.sqrt(3)/4 ),
    //     vec2( -0.25,  Math.sqrt(3)/4 ),
    //     vec2( - 0.5,      0.0        ),
    //     vec2( -0.25, -Math.sqrt(3)/4 ),
    //     vec2(  0.25, -Math.sqrt(3)/4 ),
    // ];
    // vertices.push(vertices[1]);

    createTriangles();


    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.7, 0.7, 0.7, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colLoc = gl.getUniformLocation(program, "fColour");
    matLoc = gl.getUniformLocation(program, "modelview");
    window.onkeydown = function( event ) {
        var key = event.keyCode;
        switch( key ) {
          case 119:
          case 87:
            // w key
            console.log(String.fromCharCode(key));

            var thetaRadian = toRadians(theta); // * Math.PI / 180.0;
            var tX = 1 * Math.sin(thetaRadian) * displacementY[1]; // x component of transfromation
            var tY = Math.cos(thetaRadian) * displacementY[1]; // y component of transfromation

            var t = [tX, tY, 0]; // transformation based on rotatation
            
            movePolygon(t);            
            break;
          case 115:
          case 83:
            // s key
            console.log(String.fromCharCode(key));

            var thetaRadian = theta * Math.PI / 180.0;
            var tX = 1 * Math.sin(thetaRadian) * displacementY[1]; // x component of transfromation
            var tY = Math.cos(thetaRadian) * displacementY[1]; // y component of transfromation
            

            var t = [-tX, -tY, 0]; // transformation based on rotatation

            movePolygon(t);
            break;
          case 97:
          case 65:
            // a key
            console.log(String.fromCharCode(key));
            
            var thetaRadian = theta * Math.PI / 180.0;

            var tX = Math.cos(thetaRadian) * displacementX[0]; // x component of transfromation
            var tY = Math.sin(thetaRadian) * displacementX[0]; // y component of transfromation

            var t = [-tX, tY, 0]; // transformation based on rotatation

            movePolygon(t);
            break;
          case 100:
          case 68:
            // d key
            console.log(String.fromCharCode(key));

            var thetaRadian = theta * Math.PI / 180.0;

            var tX = Math.cos(thetaRadian) * displacementX[0]; // x component of transfromation
            var tY = Math.sin(thetaRadian) * displacementX[0]; // y component of transfromation

            var t = [tX, -tY, 0]; // transformation based on rotatation

            movePolygon(t);
            break;
          case 27:
            // escape key
            console.log("Esc");
            // clearCanvas();
            break;
          case 113:
          case 81:
            // q key
            console.log(String.fromCharCode(key));
            setTheta(displacementR);
            var moveCentre = scale(-1, trans);
            var rotat = rotate(displacementR, [0,0,1]);
            var movePo = scale(-1, moveCentre);

            // translate the object back to the original position
            // on the canvas i.e. rotate about the single point on the canvas
            var chordR = ( displacementR / 2 ) * Math.PI / 180.0;
            var chord = 2 * Math.sin( chordR ) * trans[1];
            var tX = Math.cos(chordR) * chord;
            var tY = Math.sin(chordR) * chord;

            var t = [tX, -tY, 0];

            // model the transfomrations
            mv = mult(mv, translate(moveCentre));
            mv = mult(mv, rotat);
            mv = mult(mv, translate(movePo));
            mv = mult(mv, translate(t));

            break;
          case 101:
          case 69:
            // e key
            console.log(String.fromCharCode(key));
            setTheta(-1* displacementR);
            var moveCentre = scale(-1, trans);
            var rotat = rotate(-1 * displacementR, [0,0,1]);
            var movePo = scale(-1, moveCentre);

            // translate the object back to the original position
            // on the canvas i.e. rotate about the single point on the canvas
            var chordR = toRadians(displacementR / 2 );//( displacementR / 2 ) * Math.PI / 180.0;
            var chord = 2 * Math.sin( toRadians( chordR ) ) * trans[1];
            var tX = Math.cos(chordR) * chord;
            var tY = Math.sin(chordR) * chord;

            var t = [-tX, tY, 0];

            // model the transfomrations
            mv = mult(mv, translate(moveCentre));
            mv = mult(mv, rotat);
            mv = mult(mv, translate(movePo));
            mv = mult(mv, translate(t));

            break;
          case 122:
          case 90:
            // e key
            console.log(String.fromCharCode(key));
            setTheta(-1* displacementR);
            var moveCentre = scale(-1, trans);
            var rotat = rotate(-1 * displacementR, [1,0,0]);
            var movePo = scale(-1, moveCentre);

            // translate the object back to the original position
            // on the canvas i.e. rotate about the single point on the canvas
            var chordR = toRadians(displacementR / 2 );//( displacementR / 2 ) * Math.PI / 180.0;
            var chord = 2 * Math.sin( toRadians( chordR ) ) * trans[1];
            var tX = Math.cos(chordR) * chord;
            var tY = Math.sin(chordR) * chord;

            var t = [-tX, tY, 0];

            // model the transfomrations
            mv = mult(mv, translate(moveCentre));
            mv = mult(mv, rotat);
            mv = mult(mv, translate(movePo));
            mv = mult(mv, translate(t));

            break;
        }
        whereami();
        render();
    };

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    // console.log(trans); // deleted 20150831
    // mv = translate(trans); // deleted 20150831 don need we set the mv matrix when interaction is handled
    gl.uniformMatrix4fv(matLoc, false, flatten(mv));
    gl.uniform4fv(colLoc, flatten(BLACK));
    gl.drawArrays( gl.TRIANGLES, 0, pointsArray.length );

    // gl.uniform4fv(colLoc, flatten(BLACK));
    // gl.drawArrays (gl.POINTS, 0, NV + 2);
    for (var n = 0; n < pointsArray.length; n++ ) {
        console.log(pointsArray[n]);
    }
}


function triangles(a, b, c) {
    pointsArray.push(vertices[a]);

    pointsArray.push(vertices[b]);

    pointsArray.push(vertices[c]);
}

// Each face determines two triangles

function createTriangles() {
    triangles( 0, 6, 5 );
    triangles( 0, 5, 4 );
    triangles( 0, 4, 3 );
    triangles( 0, 3, 2 );
    triangles( 0, 2, 1 );
    triangles( 0, 1, 6 );
}



// point is the vec3 vertices that represents the centre of the 
function rotatep(angle, point){
    var R = mat4();
    var ctm = mat4();

    var thetaX = Math.acos()
}
function movePolygon(t){
    trans = add(trans, t);
    // console.log(trans);
    mv = mult(mv, translate(t));//test  

    // trans = trans2;

    // console.log(trans2);

    // // trans = add(trans, [0, 0.01, 0]);
    // mv = mat4();
    // mv = mult(mv, translate(trans));
    // render();
}
function home() {
    // reset state variables
    theta = 0;
    trans = [0,0,0]; // issue 
    mv = mat4();
    transList = [];
    document.getElementById("where").innerHTML = "";
    render();   
}
var transList = [];

function whereami(){
    console.log("Where am I?");
    var where = trans + " @ " + theta;
    console.log(where);
    console.log("**************");
    transList.push(where);
    
    var locDis = "";

    for (var i = 0; i < transList.length; i++ ) {
        if (i % 20 == 0 )
            locDis = "";
        locDis = transList[i] + "</br>" + locDis;
    }

    document.getElementById("where").innerHTML = locDis;
}
function reset(){
    mv = mat4();
    trans = [0,0,0];
    theta = 0;
}
function state(){
    var t = "trans: "+ trans;
    document.getElementById("where").innerHTML = t;
}

function setTheta(deltaTheta){
    theta = theta + deltaTheta;
    if (theta > 360)
        theta -= 360;
    else if (theta < 0)
        theta += 360;
}
// returns theta in radians
function getTheta(){
    return theta * Math.PI / 180;
}
function toRadians(degrees){
  return degrees * Math.PI / 180;  
}