
var gl;
var points = [];
var x, xx;
var y, yy;
var count = 0;
var NumVertices = 4; // Minimum vertices for polygon

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our point
    //
    




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

        console.log("NumVertices=" + NumVertices);
    };

    //render();
//    points = [];

    canvas.addEventListener("mousedown", function(event){
        var rect = canvas.getBoundingClientRect();
        xx = 2*(event.clientX-rect.left)/canvas.width-1;
        yy = 2*(canvas.height-(event.clientY-rect.top))/canvas.height-1;



        if (count == 0 ) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear( gl.COLOR_BUFFER_BIT );
        }
        x = -1 + ( 2 * ( event.offsetX ) / canvas.width );
        y = -1 + ( 2 * ( ( canvas.height - event.offsetY ) ) / canvas.height);
        
        showLocation(x, y);
        showLocation(xx,yy);
    
        point = vec2(x,y);
        // console.log(point + " : " + count);

        points[count++]= point;

        showState();
        // After all vertices entered send data to buffer and render
        // if (count == NumVertices) {
        //     //console.log(points[0]);
        //     gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
        //     render();
        // }

        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
        render();
    });
};

// http://www.corehtml5.com/trianglestripfundamentals.php
function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.POINTS, 0, count  );

    if(count >= NumVertices ) {
        gl.drawArrays( gl.LINE_STRIP, 0, count );
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, count );
        //count = 0;
    }

}
function showLocation(u, v){
    console.log("[" + u + ":" + v + "]");
}

function showState() {
    console.log("currently " + count + " of " + NumVertices + " selected. Array Length is " + points.length);

}