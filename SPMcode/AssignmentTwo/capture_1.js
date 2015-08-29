

var gl;
var vertices    = []; // array of vec3 vertices

var index       = 0;
var vCount      = 5;
var maxVertices = 11; //

var GREEN       = vec4(0.0, 1.0, 0.0, 1.0);
var RED         = vec4(1.0, 0.0, 0.0, 1.0);
var BLACK       = vec4(0.0, 0.0, 0.0, 1.0);
var BLUE        = vec4(51.0/255.0,51.0/255.0, 1.0, 1.0);
var colLoc;

var rotation;// represents the winding direction of triangle
var isIntersect;// represents whether lines intersect
var edges       = [];// is a pair of vertices on triangle

window.onload = function() 
{
    var canvas = document.getElementById("gl-canvas");
    setHtmlUi();
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.7, 0.7, 0.7, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    gl.bufferData( gl.ARRAY_BUFFER, sizeof['vec3'] * maxVertices, gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    colLoc = gl.getUniformLocation(program, "fColour");


    document.getElementById("slider").onchange = function(event) {
        // set variable to slider value
        vCount = event.target.value;
        // just a little bit of sconsole action to see how things are going
        var element = document.getElementById("count");
        element.innerHTML = vCount;

        clearCanvas(); // clear the screen and reset for the user to start again

        console.log("NumVertices is now " + vCount);

    };

    canvas.addEventListener("mousedown", function(event){

        // Allow for canvas bounding box and record vertex
        var rect = canvas.getBoundingClientRect();

        var t = vec3 ( 2 * ( event.clientX - rect.left ) / canvas.width - 1, 
                        2 * ( canvas.height - ( event.clientY - rect.top ) ) / canvas.height - 1, 
                         0 );

        gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec3'] * index, flatten(t));

        // console.log("index: " + index + " = " + t);

        vertices[index] = t;

        // check windings and intersections while required number of vertices not reached
        if ( index != vCount ) {
            // the below code works 
            if ( !checkWindings() ) { 
                console.log("Wrong winding");
                error(); 
                return;
            }
            

            if (checkIntersection() ) {
                console.log("intersection found");
                error();
                return;
            }

            if (index >= 1) {
                edges.push( [ vertices[index - 1], vertices[index] ] );
                if (index >= 2) {
                    edges.push( [ vertices[index], vertices[index - 2] ] );
                }
            }

            console.log("after intersection check");
        }

        // increment index only while index is less than the number of required vertices
        if ( index < vCount ) {
            index++;
        } 

        setHtmlUi();
        render();
    });
    
    render();
}

function render(){
    var colour;
    // cleans the screen paints canvas 
    gl.clear( gl.COLOR_BUFFER_BIT );
    

    gl.uniform4fv(colLoc, flatten(BLACK));
    gl.drawArrays(gl.LINE_STRIP, 0, index);

    if (index == vCount){
        // set fragment shader variable fColour to RED
        // draw the triangle strip
        gl.uniform4fv(colLoc, flatten(BLUE));
        gl.drawArrays( gl.TRIANGLE_STRIP, 0 , index );
        // set fragment shader variable fColour to GREEN
        // draw the lines already proven to be acceptable
        gl.uniform4fv(colLoc, flatten(GREEN));
        gl.drawArrays(gl.LINE_STRIP, 0, index - 1);
        // set fragment shader variable fColour to BLACK
        // draw the lines that represents the last segemnt
        gl.uniform4fv(colLoc, flatten(BLACK));
        gl.drawArrays(gl.LINE_STRIP, index - 1, 1);
    }
}

function error() {
    // console.log("Error on vertex " + index);
    // console.log("Please select another point");

    // cleans the screen paints canvas 
    gl.clear( gl.COLOR_BUFFER_BIT );
 
    gl.uniform4fv(colLoc, flatten(BLACK));
    gl.drawArrays(gl.LINE_STRIP, 0, index );
    // set fragment shader variable fColour to RED
    // draw the lines that represents the last segement
    // that does not meet criteria
    gl.uniform4fv(colLoc, flatten(RED));
    gl.drawArrays(gl.LINE_STRIP, index - 1, 2);
}


// Checks the winding direction of a set of vetices and compares the result with last 
// winding result which is stored in the rotation variable.
// returns true if winding direction is acceptable for triangle_strip windings
function checkWindings(){
    // check if there is less than three vertices to inspect
    if (index < 2 ){
        return true;
    } // set initial rotation based on current winding
    else if (index == 2) {
        rotation = RHTwinding(vertices);
        // console.log(rotation);
        return true;
    }
    else if (index > 2) {
        // windings is what the rotation should be based on the index
        var windings = ( index % 2 ) == 0 ? rotation : !rotation;
        
        /* these two variable were used to output information to console */
        // var t1 = windings == true ? "RHT" : "LHT";
        // var t2 = RHTwinding(vertices) == true ? "RHT" : "LHT";
        
        // check that the winding of the currrent traingle are not equal to
        // previous triangle requirment of a triangle_strip
        return RHTwinding(vertices) == windings ? true : false;
    }
}

// checks that line segmentsdo not intersect
// returns true if intersection is found with any other line segment
// It is assumed that checkIntersection is run after a windings check
// has been confirmed as acceptable.
function checkIntersection(){
    // console.log("checkIntersection");
    if (index <= 2)
        return false;

    var test_intersection = [];

    for ( var i = 0; i < edges.length; i++) {

        Array.prototype.push.apply(test_intersection, edges[i]);
        test_intersection.push(vertices[index -1], vertices[index]);

        if ( intersecting(test_intersection) ){
            // interscetion found
            console.log("intersection of the bad kind found grrrr!");
            return true;
        }
        test_intersection = [];
    }

    return false;
}


// Tests if the line segments are intersecting
// vlist is an array containing 4 2D points in order P0, P1, Q0, Q1
function intersecting(vlist) {
    // showArray(vlist);
    var pq = subtract(vlist[2], vlist[0]);  // The vector from P0 to Q0 (i.e. Q0-P0)
    var v = subtract(vlist[1], vlist[0]);   // The vector from P0 to P1
    var w = subtract(vlist[3], vlist[2]);   // The vector from Q0 to Q1
    var v2 = dot(v, v);
    var w2 = dot(w, w);
    var vw = dot(v, w);
    var denom = v2*w2 - vw*vw;
    var alpha = dot(pq, subtract(scale(w2,v), scale(vw,w)))/denom;
    var beta = -dot(pq, subtract(scale(v2,w), scale(vw,v)))/denom;
    // The intersection condition counts touching segments as not intersecting
    return alpha > 0.0 && alpha < 1.0 && beta > 0.0 && beta < 1.0;
}

// Tests if the winding is anticlockwise (Right Hand Thumb rule)
function RHTwinding(vlist) {
    var i = vlist.length;

    // Argument is assumed an array of 3 3D points in order P0, P1, P2
    // Calculate cross product (P1-P0)x(P2-P0)
    var norm = cross ( subtract ( vlist[ i - 2 ], vlist[ i - 3 ] ),
                        subtract( vlist[ i - 1 ], vlist[ i - 3 ] ) );
    
    return norm[2] >= 0;
}

function reset(){
    vertices = [];
    edges = [];
    index = 0;
    setHtmlUi();
}

function clearCanvas() {
    reset();
    render();

    console.log("clearCanvas called");
}

function setHtmlUi(){
    document.getElementById("count").innerHTML = index + " of " + vCount + " selected";
}
/* *** UTILITY FUNCTIONS BELOW *** */
function state(){
    // logs current state to console
    console.log("vertices length is " + vertices.length);
    console.log("index is " + index);
    console.log("vCount is set to " + vCount);
}

function showArray(arr){
    for (  i = 0; i < arr.length; i++ ) {
        console.log("vertices["+ i +"] = "+ arr[i]);
    }
}

function showLocation(u) {
    // logs selected vertex information to console
    console.log("[" + u[0] + ":" + u[1] + ":" + u[2] + "]" );
    console.log(u.length);
}

// reports contents of edges array to console
function build_list_of_lines(){
   var count = 0;

    if (edges.length > 0){
        do {
            showArray(edges[count]);
            count++;
        }while (count != edges.length);
    }
}
