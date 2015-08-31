
var gl;
var points;

var colLoc; // fragment shader location
var matLoc; // shader program location of modelview
var trans       = [0.0,0.0,0.0]; // displacement of triangle's origin
var mv; // the transformation matrix
var theta = 0;
var vertices;
var displacementX = [ 0.01, 0, 0 ]; // the positive amount to move the object when translating in X direction
var displacementY = [ 0, 0.01, 0 ]; // the positive amount to move the object when translating in Y direction
var displacementR = 45.0; // the positive amount to rotate the object about an axis
var trans2;


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
        vec2( -0.5, -0.5 ),
        vec2(  -0.5,  0.5 ),
        vec2(  0.5, 0.5 ),
        vec2( 0.5, -0.5)
    ];

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
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

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

            // float s = sin( theta );
            // float c = cos( theta );

            // gl_Position.x = -s * vPosition.y + c * vPosition.x;
            // gl_Position.y =  s * vPosition.x + c * vPosition.y;



            var tX = -1* Math.sin(theta) * displacementY[1];//test
            var tY = Math.cos(theta) * displacementY[1];//test

            var t = [tX, tY, 0];// test
            
            trans = add(trans, t);

            // trans = add(trans, displacementY);
            
            mv = mult(mv, translate(t));//test
            // mv = mult(mv, translate(displacementY));
            break;
          case 115:
          case 83:
            // s key
            console.log(String.fromCharCode(key));
            trans = add(trans, scale(-1, displacementY));
            // mv = mat4();
            mv = mult(mv, translate(scale(-1, displacementY)));
            break;
          case 97:
          case 65:
            // a key
            console.log(String.fromCharCode(key));
            trans = add(trans, scale(-1,displacementX));
            // mv = mat4();
            mv = mult(mv, translate(scale(-1,displacementX)));
            break;
          case 100:
          case 68:
            // d key
            console.log(String.fromCharCode(key));
            trans = add(trans, displacementX);
            // mv = mat4();
            mv = mult(mv, translate(displacementX));
            break;
          case 27:
            // escape key
            console.log("Esc");
            clearCanvas();
            break;
          case 113:
          case 81:
            // q key
            // reset trans to [0,0,0]
            trans = add(trans, scale(-1, trans));
            // set mv to be the identity matrix
            mv = mat4(); // no modifictation to vertices information :)
            // 
            //mv = mult(mv, translate(trans));
            console.log(String.fromCharCode(key));
            theta = 0;
            break;
          case 101:
          case 69:
            // e key

            //home(); // sets trans2 to current position
            theta = theta+ displacementR;
            var moveCentre = scale(-1,trans);
            var rotat = rotate(displacementR, [0,0,1]);
            var movePo = scale(-1, moveCentre);

            mv = mult(mv,translate(moveCentre));
            mv = mult(mv,rotat);
            mv = mult(mv,translate(movePo));

            var bv = inverse
/*          
            var temp = trans;
            mv =mat4();
            trans = add(trans, scale(-1, trans));
            // mv = mat4();
            mv = mult(mv, translate(trans));

            theta++;
            console.log(theta)
            var rot = rotate(theta, [0,0,15]);
            console.log(rot);
            mv = mult(mv, rot);

            // mv = mat4();
            mv = mult(mv, translate(temp));

*/
            // console.log(String.fromCharCode(key));
            break;
        }

        render();
    };

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    // console.log(trans); // deleted 20150831
    // mv = translate(trans); // deleted 20150831 don need we set the mv matrix when interaction is handled
    gl.uniformMatrix4fv(matLoc, false, flatten(mv));
    gl.uniform4fv(colLoc, flatten(CYAN));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
    gl.uniform4fv(colLoc, flatten(BLACK));
    gl.drawArrays (gl.POINTS, 2, 1);
}


// point is the vec3 vertices that represents the centre of the 
function rotatep(angle, point){
    var R = mat4();
    var ctm = mat4();

    var thetaX = Math.acos()

}
function movePolygon(){
    trans = trans2;

    console.log(trans2);

    // trans = add(trans, [0, 0.01, 0]);
    mv = mat4();
    mv = mult(mv, translate(trans));
    render();
}

function home() {
    // reset state variables
    theta = 0;
    trans = [0,0,0]; // issue 
    mv = mat4();

    render();   
}

function whereami(){
    console.log("Where am I?");
    console.log(trans + " @ " + theta);
    console.log("**************");

}
function reset(){
    mv = mat4();
    trans = [0,0,0];
    theta = 0;
}