
var gl;
var points;

var matLoc; // shader program location of modelview
var trans       = [0.0,0.0,0.0]; // displacement of triangle's origin
var mv; // the transformation matrix


window.onload = function init()
{
    mv = mat4();

    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    
    // Four Vertices
    
    var vertices = [
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

    matLoc = gl.getUniformLocation(program, "modelview");
    window.onkeydown = function( event ) {
        var key = event.keyCode;
        switch( key ) {
          case 119:
          case 87:
            // w key
            console.log(String.fromCharCode(key));
            trans = add(trans, [0, 0.01, 0]);
            mv = mat4();
            mv = mult(mv, translate(trans));
            break;
          case 115:
          case 83:
            // s key
            console.log(String.fromCharCode(key));
            trans = add(trans, [0, -0.01, 0]);
            mv = mat4();
            mv = mult(mv, translate(trans));
            break;
          case 97:
          case 65:
            // a key
            console.log(String.fromCharCode(key));
            trans = add(trans, [-0.01, 0, 0]);
            mv = mat4();
            mv = mult(mv, translate(trans));
            break;
          case 100:
          case 68:
            // d key
            console.log(String.fromCharCode(key));
            trans = add(trans, [0.01, 0, 0]);
            mv = mat4();
            mv = mult(mv, translate(trans));
            break;
          case 27:
            // escape key
            console.log("Esc");
            clearCanvas();
            break;
          case 113:
          case 81:
            // q key
            trans = add(trans, scale(-1, trans));
            mv = mat4();
            mv = mult(mv, translate(trans));
            console.log(String.fromCharCode(key));
            break;
          case 101:
          case 69:
            // e key
            trans = add(trans, scale(-1, trans));
            mv = mat4();
            mv = mult(mv, translate(trans));

            var rot = rotate(4, [0,0,2]);
            mv = mult(mv, rot);
            console.log(String.fromCharCode(key));
            break;
        }

        render();
    };

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    console.log(trans);
    // mv = translate(trans);
    gl.uniformMatrix4fv(matLoc, false, flatten(mv));

    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
}


// point is the vec3 vertices that represents the centre of the 
function rotatep(angle, point){


}