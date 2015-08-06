
var gl;
var points = [];
var x;
var y;
var count = 0;
var NumVertices = 2;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our point
    //
    

    canvas.addEventListener("mousedown", function(event){
	if (count == 0 ) {
          gl.clearColor(0.0, 0.0, 0.0, 1.0);
          gl.clear( gl.COLOR_BUFFER_BIT );
        }
        // Get the point fromt the event
	x = -1 + ( 2 * ( event.clientX ) / canvas.width );
	y = -1 + ( 2 * ( ( canvas.height - event.clientY ) ) / canvas.height);
	//console.log ("[" + x + ", " + y + "]");
	
	point = vec2(x,y);
	console.log(point);
	points[count++]= point;


	// After all vertices entered send data to buffer and render
	if (count == NumVertices) {
		//console.log(points[0]);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

		render();
	}
    });


    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear( gl.COLOR_BUFFER_BIT );
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Setup a GPU buffer for data

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


    // Slider handler fix: event added to parameter list (KWL 22/05/2015)
    document.getElementById("slider").onchange = function(event) {
        NumVertices = event.target.value;
    };

    render();
//    points = [];
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINE_STRIP, 0, NumVertices );
    count = 0;
}
