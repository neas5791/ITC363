
var gl;
var points = [];
var x, xx;// using x for event.offsetX, using xx for canvas.getBoundingClientRect()
var y, yy;// using y for event.offsetY, using yy for canvas.getBoundingClientRect()
var count = 0;
var max_count = 3;
var maxNumVertices = 10;

var NumVertices = 3; // Minimum vertices for polygon

var index = 0; // used for colour

var colors = [

    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0)   // cyan
];




window.onload = function init()
{
    // *****************************************************
    // ********** Sett up GL Context and Buffers ***********
    // *****************************************************
    var canvas = document.getElementById( "gl-canvas" );
    // Set up context    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Setup a GPU buffer for data
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Setup a GPU buffer for colour data
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // Set up viewport
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear( gl.COLOR_BUFFER_BIT );


    // *****************************************************
    // ********** Sett up GL Context and Buffers ***********
    // *****************************************************

    document.getElementById("slider").onchange = function(event) {
        max_count = event.target.value;
        console.log("max_count=" + max_count);
    };


    // click event 
    // canvas.addEventListener("click", function(event){

    //     gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    //     // Allow for canvas bounding box (KWL 29/05/2015)
    //     var rect = canvas.getBoundingClientRect();

    //     var t = vec2(2*(event.clientX-rect.left)/canvas.width-1,
    //        2*(canvas.height-(event.clientY-rect.top))/canvas.height-1);
        
    //     gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t));

    //     gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
        
    //     t = vec4(colors[index%7]);
        



    //     gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(t));
    //     render();
    // } );



    canvas.addEventListener("mousedown", function(event){
        // sets up the canvas if count has been reset
        if (count == 0 ) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear( gl.COLOR_BUFFER_BIT );
        }


        // nominate vBuffer as the buffer to modify
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);

        var rect = canvas.getBoundingClientRect();
        xx = 2*(event.clientX-rect.left)/canvas.width-1;
        yy = 2*(canvas.height-(event.clientY-rect.top))/canvas.height-1;

        points[index]= vec2(xx,yy);

        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

        showLocation(xx,yy);

        // nominate cBuffer as the buffer to modify
        gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
        
        var t = vec4(colors[index%7]);

        gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(t));

        // increment index
        index++;
        showState();

        render();
    });
};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.POINTS, 0, index -1  );

    if(index >= NumVertices ) {
        gl.drawArrays( gl.LINE_STRIP, 0, index );
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, index );
        //count = 0;
    }

}



function showLocation(u, v){
    console.log("[" + u + ":" + v + "]");
}

function showState() {
    console.log("currently " + index + " of " + NumVertices + " selected. Array Length is " + points.length);

}

function RHTwinding(vlist) {
    // Argument is assumed an array of 3 3D points in order P0, P1, P2
    // Calculate cross product (P1-P0)x(P2-P0)
    var norm = cross(subtract(vlist[1], vlist[0]), subtract(vlist[2], vlist[0]));
    return norm[2] >= 0;
}