

var canvas;
var gl;


var maxNumTriangles = 2;
var maxNumVertices  = 3 * maxNumTriangles;
var index = 0;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    canvas.addEventListener("mousedown", function(event){
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
		// Allow for canvas bounding box (KWL 26/05/2015)
		var rect = canvas.getBoundingClientRect();
        var t = vec2(2*(event.clientX-rect.left)/canvas.width-1,
           2*(canvas.height-(event.clientY-rect.top))/canvas.height-1);
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t));

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        t = vec4(colors[(index)%7]);
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(t));
        index++;
        // Call render after handling each user interaction (KWL 23/05/2015)
        render();
    } );


    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    render();

}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.POINTS, 0, index );
	// Prevent unnecessary animation (KWL 23/05/2015)
    //window.requestAnimFrame(render);

}
