
var gl;
var points = [];
var x, xx;
var y, yy;
var count = 0;
var NumVertices = 4; // Minimum vertices for polygon

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    

    //
    // Create the gl object
    //
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear( gl.COLOR_BUFFER_BIT );


    //
    // initialize the shaders
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    //
    // Initialize the GPU buffers
    //
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);



    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


    // Slider handler
    document.getElementById("slider").onchange = function(event) {
        // set variable to slider value
        NumVertices = event.target.value;
        // just a little bit of sconsole action to see how things are going
        console.log("NumVertices=" + NumVertices);
    };

    //render();
//    points = [];
    
    // Mousedown handler
    canvas.addEventListener("mousedown", function(event){

        var rect = canvas.getBoundingClientRect();
        //     vertices[count++] = 
        xx = 2*(event.clientX-rect.left)/canvas.width-1;
        yy = 2*(canvas.height-(event.clientY-rect.top))/canvas.height-1;
        showLocation(xx, yy);

        if (count == 0 ) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear( gl.COLOR_BUFFER_BIT );
        }

        x = -1 + ( 2 * ( event.offsetX ) / canvas.width );
        y = -1 + ( 2 * ( ( canvas.height - event.offsetY ) ) / canvas.height);

        showLocation(x, y);


        point = vec2(x,y);
        // console.log(point + " : " + count);

        points[count++]= point;

        // a little bit more console action to see the state of things
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

function showLocation(u, v) {
    console.log("[" + u + ":" + v + "]" );
}

function showState() {
    console.log("currently " + count + " of " + NumVertices + " selected. Array Length is " + points.length);
<<<<<<< HEAD
}

function clearState() {
    points = [];
=======

>>>>>>> 5c2c7f21bc2d980daa93611ec421fa46bb81d6df
}