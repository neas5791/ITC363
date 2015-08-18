
var gl;
var points = [];
var x, xx;
var y, yy;
var count = 0;
var NumVertices = 4; // Minimum vertices for polygon

window.onload = function init()
{
    //
    // get the canvas object from the DOM
    //
    var canvas = document.getElementById( "gl-canvas" );
    
    //
    // create the GL object and sets the global variable
    //
    createGL ( canvas );

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


    // Handle the slider event 
    document.getElementById("slider").onchange = function(event) {
        // set variable to slider value
        NumVertices = event.target.value;
        // just a little bit of sconsole action to see how things are going
        console.log("NumVertices is now " + NumVertices);
    };

    
    // Mousedown handler
    canvas.addEventListener("mousedown", function(event){

        var rect = canvas.getBoundingClientRect();

        xx = 2*(event.clientX-rect.left)/canvas.width-1;
        yy = 2*(canvas.height-(event.clientY-rect.top))/canvas.height-1;

        showLocation(xx, yy);

        if (count == 0 ) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear( gl.COLOR_BUFFER_BIT );
        }

        // x = -1 + ( 2 * ( event.offsetX ) / canvas.width );
        // y = -1 + ( 2 * ( ( canvas.height - event.offsetY ) ) / canvas.height);

        // showLocation(x, y);


        point = vec2(xx,yy);
        // console.log(point + " : " + count);

        if (point.length + 1 % 3 == 0) {
            var test = point.slice(point.length - 3, point.length - 1);
            console.log("hi " + RHTwinding( test ));
        }

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
}

function clearState() {
    points = [];
}

// Tests if the winding is anticlockwise (Right Hand Thumb rule)
function RHTwinding(vlist) {
    // Argument is assumed an array of 3 3D points in order P0, P1, P2
    // Calculate cross product (P1-P0)x(P2-P0)
    var norm = cross(subtract(vlist[1], vlist[0]), subtract(vlist[2], vlist[0]));
    return norm[2] >= 0;
}



function createGL( canvas ) {
        //
    // Create the gl object
    //
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear( gl.COLOR_BUFFER_BIT );

}
