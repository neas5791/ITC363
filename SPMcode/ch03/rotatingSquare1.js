
var canvas;
var gl;

var theta = 0.0;
var thetaLoc;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var shaders = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( shaders );

    var vertices = [
        vec2(  0,  1 ),
        vec2(  -1,  0 ),
        vec2( 1,  0 ),
        vec2(  0, -1 )
    ];


    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( shaders, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // the variable for the rotation angle used in the application has to 
    // be linked to the corresponding variable in the vertex shader.
    // The function gl.getUniformLocation performs the first step in the 
    // process by obtaining an identifier for the vertex shader variable theta.
    thetaLoc = gl.getUniformLocation( shaders, "theta" );

    render();
};


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
    // change the below value theta to vary speed of rotation
    // smaller value => slower 
    theta += 0.01;
    gl.uniform1f( thetaLoc, theta );

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    window.requestAnimFrame(render);
}
