// ITC363 Assignment 2
// Sean Matkovich
// ID 11187033

var gl; // the gl object instance
var vertices    = []; // array of vec3 vertices

var index       = 0; // current count of vertices
var vCount      = 5; // default number of vertices use wishes to display
var maxVertices = 11; // maximum number of vertices buffer can accomodate

var GREEN       = vec4(0.0, 1.0, 0.0, 1.0);
var RED         = vec4(1.0, 0.0, 0.0, 1.0);
var BLACK       = vec4(0.0, 0.0, 0.0, 1.0);
var BLUE        = vec4(51.0/255.0,51.0/255.0, 1.0, 1.0);

// vertex buffer
var vBuffer;

var rotation; // represents the winding direction of triangle
var isIntersect; // represents whether lines intersect
var edges       = []; // each element is a pair of vertices on triangle 

var colLoc; // frag_shader variable for the colour
var matLoc; // shader program location of modelview
var thetaLoc; // vertex_shader rotation variable
var trans       = [0.0,0.0,0.0]; // displacement of triangle's origin
var origin; // the centre of the polygon (determined by averaging the vertices)
var mv; // the transformation matrix

var theta = 0.0;
var displacementX = [ 0.05, 0, 0 ]; // the positive amount to move the object when translating in X direction
var displacementY = [ 0, 0.05, 0 ]; // the positive amount to move the object when translating in Y direction
var displacementR = 5.0; // the positive amount to rotate the object about an axis
var transList = []; // the list of transfromation that have been applied to the object 

window.onload = function() {
    // console.log(String.fromCharCode(27));
    var canvas = document.getElementById("gl-canvas");
    
    setHtmlUi();

    mv = mat4(); // set mv with identity matrix
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.7, 0.7, 0.7, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    gl.bufferData( gl.ARRAY_BUFFER, sizeof['vec3'] * maxVertices, gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    colLoc = gl.getUniformLocation(program, "fColour");
    matLoc = gl.getUniformLocation(program, "modelview");
    // thetaLoc = gl.getUniformLocation( program, "theta" );

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
        
        if (index < vCount){
            gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec3'] * index, flatten( t ) );
            console.log("index " + index + " is in buffer");
        }
        vertices[index] = t;

        // test windings and intersections 
        // while required number of vertices not reached
        if ( index != vCount ) {
            // check windings direction 
            if ( !checkWindings() ) { 
                console.log("Wrong winding");
                setHtmlDetails("WINDING DIRECTION INCORRECT");
                error(); 
                // console.log("after error");
                return;
            }
            
            // check if the last segement intersect with any other existing edge
            if (checkIntersection() ) {
                console.log("intersection found");
                setHtmlDetails("TWO OR MORE EDGES INTERSECT");
                error();
                return;
            }

            setHtmlDetails("");
            // if the addition of the last vertex passes winding and intersection testing
            // add the new edge to the edge array.
            if (index >= 1) {
                edges.push( [ vertices[index - 1], vertices[index] ] );
                if (index >= 2) {
                    edges.push( [ vertices[index], vertices[index - 2] ] );
                }
            }
        }

        // increment index only while index is less than the number of required vertices
        if ( index < vCount ) {
            index++;
        } 
        
        if (index == vCount) {
            setCentre();
            movePolygon(trans);
        }

        // update the HTML UI display with count of how many vertices are selected
        setHtmlUi();

        render();
    });
    
    window.onkeydown = function( event ) {
        // refactored out to function
        // making the onload function more readable
        keyboardEvent(event);
    };

    render();
}

// renders the object
function render(){
    // cleans the screen paints canvas 
    gl.clear( gl.COLOR_BUFFER_BIT );
    console.log("render = " + index);
    gl.uniformMatrix4fv(matLoc, false, flatten(mv));

    gl.uniform4fv(colLoc, flatten(BLACK));

    drawLoop();

    // Calculate the modelview matrix and send

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

// this function draws the outlines of the polygon that will be rendered
function drawLoop(){
    // while there are less than 3 vertices just draw a line strip
    if (index < 3) {
        console.log("index < 3");
        gl.drawArrays(gl.LINE_STRIP, 0, index);
    }
    // now we have enough vertices to draw triangles
    // so we construct LINE_LOOPS over three vertices
    else {
        console.log("index > 3");
        // draw the first triangle
        gl.drawArrays(gl.LINE_LOOP, 0, 3);
        // now loop through the rest and draw the rest
        for (var i = 3 ; i < index ; i++){
            gl.drawArrays( gl.LINE_LOOP, i - 2 , 3 ); 
        }
    }
}
// renders the object showing offending line segment.
function error() {
    // cleans the screen paints canvas 
    gl.clear( gl.COLOR_BUFFER_BIT );
    console.log("error = " + index);
    gl.uniform4fv(colLoc, flatten(BLACK));
    
    drawLoop();
    
    console.log("error draw the good stuff first");
    // set fragment shader variable fColour to RED draw the lines 
    // that represents the last segement that does not meet criteria
    gl.uniform4fv(colLoc, flatten(RED));
    gl.drawArrays(gl.LINE_STRIP, index - 1, 2);
    console.log("error now draw the bad stuff");
}

// Checks the winding direction of a set of vetices and compares the result with last 
// winding result which is stored in the rotation variable.
// returns true if winding direction is acceptable for triangle_strip windings
function checkWindings(){
    // console.log("checkWindings");
    // check if there is less than three vertices to inspect

    if (index < 2 ){
        return true;
    } // set initial rotation based on current winding
    else if (index == 2) {
        rotation = RHTwinding(vertices); // set initial rotation based on current winding
        if ( rotation )
            return true; // only return true if the first triangle is ANTI-CLOCKWISE :)
        else
            return false; // oh my it seems the vertices are CLOCKWISE
    }
    else {
        // windings is what the rotation should be based on the index
        var windings = ( ( index % 2 ) == 0 ? rotation : !rotation );
        
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
    // check that there are enough vertices
    if (index <= 2)
        return false;
    // create an array of edges to test against
    var test_intersection = [];
    // for each identified edge pair set loop through
    for ( var i = 0; i < edges.length; i++) {
        // push the first edge pair set into the array
        Array.prototype.push.apply(test_intersection, edges[i]);
        // push the last edge pair of vertices to the temp array
        test_intersection.push(vertices[index -1], vertices[index]);
        // test the two edge array. if the edges intersect return true 
        if ( intersecting(test_intersection) ){
            // interscetion found
            console.log("intersection of the bad kind found grrrr!");
            return true;
        }
        // clear the temp array ready for the next loop and test
        test_intersection = [];
    }
    // returns false if no intersection is found
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
// returns true if vlist is in the correct order based on the 
// right hand thumb rule
function RHTwinding(vlist) {
    var i = vlist.length;

    // Argument is assumed an array of 3 3D points in order P0, P1, P2
    // Calculate cross product (P1-P0)x(P2-P0)
    var norm = cross ( subtract ( vlist[ i - 2 ], vlist[ i - 3 ] ),
                        subtract( vlist[ i - 1 ], vlist[ i - 3 ] ) );
    return norm[2] >= 0;
}

// get the centre of the polygon by averaging the vertices entered
// resets vertices about the new point
function setCentre() {
    centre = vec3();
    // Calculate model origin for triangle by averaging vertices
    for (var i = 0; i < vCount; i++) {
        centre = add(centre, vertices[i]);
    }
    centre = scale(1/vCount, centre);

    // Reset vertices with respect to model origin
    trans = scale(1, centre);

    for (i = 0; i < vCount; i++) {
        vertices[i] = subtract(vertices[i], centre);
    }
    // switch to vBuffer and send the new vertices information to shader
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
}

// reset the state machine ready to sart again
function reset(){
    // I had to add the following two lines to fix a random bug
    // where bufferSubData returned two errors... There didn't appear to be any rhyme or rythme to 
    // the errors :?
    // [.WebGLRenderContext-0x19dd9bb4300]
    // GL ERROR :GL_INVALID_VALUE : glBufferSubData: out of range
    // [.WebGLRenderingContext-0x19dd9bb4300]
    // GL ERROR :GL_INVALID_OPERATION : glDrawArrays: attempt to access out of range vertices in attribute 0
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, sizeof['vec3'] * maxVertices, gl.STATIC_DRAW );

    // reset the polygon data
    vertices = [];
    edges = [];
    index = 0;
    // reset the transformation data
    trans = [0.0, 0.0, 0.0];
    theta = 0;
    mv = mat4();
    transList = [];
    // reset the vertex counter
    setHtmlUi();
}

// clear the canvas 
function clearCanvas() {
    // call to reset state information
    reset();
    // renders the empty model
    render();

    console.log("clearCanvas called");
}

// updates the html element with count of how many vertices are currently selected
function setHtmlUi() {
    // sets the count element
    document.getElementById("count").innerHTML = index + " of " + vCount + " Vertices selected";
}

// moves th model to the canvas frame 0,0,0 position
function home() {
    if ( index != vCount ) {
        return;
    }
    // reset state variables
    theta = 0;
    trans = [0,0,0]; // issue 
    mv = mat4();
    whereami();
    render();   
}

// function provides the what to do on keyboard event
function keyboardEvent(event){
    var key = event.keyCode;
    
    switch( key ) {
      case 119:
      case 87:
        // w key
        // translate in a positive direction along Y axis of window
        vertical(true);
        break;
      case 115:
      case 83:
        // s key
        // translate in a negative direction along Y axis of window
        vertical(false);

        break;
      case 97:
      case 65:
        // a key
        // translate in a negative direction along X axis of window
        horizontal(true);

        break;
      case 100:
      case 68:
        // d key
        // translate in a positive direction along X axis of window
        horizontal(false);

        break;
      case 113:
      case 81:
        // q key
        // move counter clockwise direction

        turn(false);

        break;
      case 101:
      case 69:
        // e key
        // move clockwise direction

        turn(true);

        break;
      case 120:
      case 88:
        // x key
        // translate polygon centre to window [0,0]

        home();

        break;
      case 27:
        // escape key
        console.log("Esc");
        clearCanvas();
        break;
    };
}

/* ******************************************************* */
// below functions are for object translation and rotation //
/* ******************************************************* */

// translates the object by the vec3 t argument
// updates the global trans variable.
function movePolygon(t){
    trans = add(trans, t);
    mv = mult(mv, translate(t));
}

// turn the object about the z axis 
// a true argument moves the polygon object clockwise
// a false argument moves the polygon object anticlockwise
function turn(clockwise){
    if (index != vCount) {
        return;
    }
    // rotat is a temp transformation matrix
    var rotat;
    // sets the rotat matrix based on passed argument
    if (clockwise) {
        setTheta(-1 * displacementR);
        rotat = rotate(-1 * displacementR, [0,0,1]);    
    } 
    else {
        setTheta(displacementR);
        rotat = rotate(displacementR, [0,0,1]);    
    }
    // updates the modelView matrix
    mv = mult(mv, rotat);
    whereami();
    render();
}

// converts degrees to radians
function toRadians(degrees){
  return degrees * Math.PI / 180;  
}

// set the value of global variable theta
function setTheta(deltaTheta){
    theta = theta + deltaTheta;
    if (theta > 360)
        theta -= 360;
    else if (theta < 0)
        theta += 360;
}

// translate object in vertical direction
// a TRUE direction will translate the object in a 
// positive direction along the window Y axis
// a FALSE direction will translate the object in a 
// negative direction along the window Y axis
function vertical(direction){
    // w  and s key
    // console.log(String.fromCharCode(key));
    if(index != vCount)
        return;
    var thetaRadian = toRadians( theta );
    // making adjustment for the rotation.
    var tX = 1 * Math.sin(thetaRadian) * displacementY[1]; // x component of transfromation
    var tY = Math.cos(thetaRadian) * displacementY[1]; // y component of transfromation
    var t;
    if (direction)
        t = [tX, tY, 0]; // transformation based on rotatation
    else 
        t = [-tX, -tY, 0]; // transformation based on rotatation

    movePolygon(t);

    whereami();
    render();
}

// translate object in horizontal direction
// a TRUE direction will translate the object in a 
// positive direction along the window X axis
// a FALSE direction will translate the object in a 
// negative direction along the window X axis
function horizontal(direction){
    // a  and d key
    // console.log(String.fromCharCode(key));
    if(index != vCount)
        return;
    var thetaRadian = toRadians( theta );
    // making adjustment for the rotation.
    var tX = Math.cos(thetaRadian) * displacementX[0]; // x component of transfromation
    var tY = Math.sin(thetaRadian) * displacementX[0]; // y component of transfromation

    var t;
    if (direction)
        t = [-tX, tY, 0]; // transformation based on rotatation
    else
        t = [tX, -tY, 0]; // transformation based on rotatation

    movePolygon(t);
    whereami();
    render();
}

/* ************************************* */
// ****** UTILITY FUNCTIONS BELOW ****** //
/* ************************************* */

// reports the current state information to the console
function state(){
    // logs current state to console
    console.log("vertices length is " + vertices.length);
    console.log("index is " + index);
    console.log("vCount is set to " + vCount);
}
// reports the contents of an array to the console
function showArray(arr){
    for (  i = 0; i < arr.length; i++ ) {
        console.log("vertices["+ i +"] = "+ arr[i]);
    }
}
// reports current location to console
// u is generally the vec3() trans variable
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
// outputs current transformation details to the html 'where' element
function whereami(){
    console.log("Where am I?");
    var where = trans + " @ " + theta;
    console.log(where);
    console.log("**************");
    transList.push(where);
    
    var locDis = "";

    for (var i = 0; i < transList.length; i++ ) {
        if (i % 6 == 0 )
            locDis = "";
        locDis = transList[i] + "</br>" + locDis;
    }

    //document.getElementById("where").innerHTML = locDis;
    setHtmlDetails(locDis);
}
// update the HTML element with the text argument
function setHtmlDetails(text){

    document.getElementById("where").innerHTML = text;
}

