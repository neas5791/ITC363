
var canvas;
var gl;

var near = 1.0;     // near/far clipping in metres
var far = 300;

var fovy = 27.0;    // Vertical FoV to match standard 50mm lens with 35mm film
var aspect;         // Aspect ratio set from canvas should match 35mm film

var worldview, modelview, projection;   // Worldview, Modelview and projection matrices
var mvLoc, projLoc;                     //   and their shader program locations
var colLoc;                             // Colour shader program location

var eye = vec3(0.0, -75.0, 2.0);    // Viewed from standing height, 75m along negative y-axis
var at = vec3(0.0, 0.0, 2.0);       // Looking at standing height in henge centre
const up = vec3(0.0, 0.0, 1.0);     // VUP along world vertical

const GRASS = vec4(0.4, 0.8, 0.2, 1.0); // Some colours
const PATH = vec4(1.0, 1.0, 0.0, 1.0); // ff8700  - orange(1,0.53,0) sort of colour

//  Ground vertices for a 2000m x 2000m triangle fan
var ground = [
    vec3( 1000.0, -1000.0, 0.0),
    vec3( 1000.0,  1000.0, 0.0),
    vec3(-1000.0,  1000.0, 0.0),
    vec3(-1000.0, -1000.0, 0.0)
];


//  Path vertices through the grass area
var pathWidth = 5.0;

var path = [
    vec3( pathWidth, -1000.0, 0.1),
    vec3( pathWidth,  1000.0, 0.1),
    vec3(-pathWidth,  1000.0, 0.1),
    vec3(-pathWidth, -1000.0, 0.1),
];

var path2 = [
    vec3( 1000.0, -pathWidth, 0.1),
    vec3( 1000.0,  pathWidth, 0.1),
    vec3(-1000.0,  pathWidth, 0.1),
    vec3(-1000.0, -pathWidth, 0.1),
];

var NVground = 4;   // Number of ground vertices
var NVpath = 4;
var Pathbuffer = 2;
// Stonehenge parameters (lengths in metres)
// const RINGRAD = 16.5;   // Radius of ring
const HUT_H = 10.0;        // Standing stone height (above ground)
const HUT_W = 5.0;        // Standing stone width
const HUT_T = 10.0;        // Standing stone thickness
const AREA = 100;
// const LSH = 0.8;        // Lintel stone height
// const LSW = 3.2;        // Lintel stone width (aka length)
// const LST = 1.0;        // Lintel stone thickness
var NST = 200;         // Number of standing trees
var NSH = 2;           // Number of standing huts
// Arrays of Trees objects representing the standing stones and the lintels

var trees = [];
var huts = [];

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect =  canvas.width/canvas.height;

    // Generate arrays of Trees
    createLandscape();

    gl.clearColor(0.6, 0.8, 1.0, 1.0);      // Light blue background for sky
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialise attribute buffers
    //  Uses a single buffer and a single vertex array
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    // buffer needs to be big enough to keep grass, two paths, all the trees & a couple of huts
    gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec3']*(NVground+NVpath+NVpath+Tree.NV+Hut.NV), gl.STATIC_DRAW);
    // put the ground into the buffer
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(ground));
    // put a path into the buffer
    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec3']*NVground, flatten(path));
    // put the second path into the buffer
    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec3']*(NVground+NVpath), flatten(path2));
    // put the trees into the buffer
    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec3']*(NVground+(2*NVpath)), flatten(Tree.vertices));
    // put the trees into the buffer
    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec3']*(NVground + ( 2 * NVpath ) + Tree.NV), flatten(Hut.vertices) );


    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    mvLoc = gl.getUniformLocation(program, "modelView");
    projLoc = gl.getUniformLocation(program, "projection");
    colLoc = gl.getUniformLocation(program, "colour");

    projection = perspective(fovy, aspect, near, far);
    gl.uniformMatrix4fv(projLoc, false, flatten(projection));

    // Event handlers
    // Buttons to change fovy
    document.getElementById("Button1").onclick = function() {
        fovy += 6.0;
        if (fovy > 45.0) {fovy = 45.0;}
        projection = perspective(fovy, aspect, near, far);
        gl.uniformMatrix4fv(projLoc, false, flatten(projection));
        render();
    };
    document.getElementById("Button2").onclick = function() {
        fovy -= 6.0;
        if (fovy < 15.0) {fovy = 15.0;}
        projection = perspective(fovy, aspect, near, far);
        gl.uniformMatrix4fv(projLoc, false, flatten(projection));
        render();
    };


    // Keys to change viewing position/direction
    // Inefficient code arranged for readability
    window.onkeydown = function(event) {
        var key = String.fromCharCode(event.keyCode);
        var forev = subtract(at, eye);              // current view forward vector
        var foreLen = length(forev);                // current view forward vector length
        var fore = normalize(forev);                // current view forward direction
        var right = normalize(cross(fore, up));     // current horizontal right direction
        var ddir = 2.0*Math.PI/180.0;               // incremental view angle change
        var dat;                                    // incremental at change
        switch( key ) {
          case 'W':
            at = add(at, fore);
            eye = add(eye, fore);
            break;
          case 'S':
            at = subtract(at, fore);
            eye = subtract(eye, fore);
            break;
          case 'A':
            at = subtract(at, right);
            eye = subtract(eye, right);
            break;
          case 'D':
            at = add(at, right);
            eye = add(eye, right);
            break;
          // The following calculate the displacement of 'at' for +/- 2 degree view angle change
          //   around the horizontal circle centred at 'eye', then apply it to 'at'
          case 'Q':
            dat = subtract(scale(foreLen*(Math.cos(ddir) - 1.0), fore), scale(foreLen*Math.sin(ddir), right));
            at = add(at, dat);
            break;
          case 'E':
            dat = add(scale(foreLen*(Math.cos(ddir) - 1.0), fore), scale(foreLen*Math.sin(ddir), right));
            at = add(at, dat);
            break;
        }
        render();
    };

    // document.getElementById("tree-slider").onchange = function(event) { setNumberOfTrees(event.target.value); render() ; };
    // document.getElementById("hut-slider").onchange = function(event) { setNumberOfHuts(event.target.value); render() ; };
    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    worldview = lookAt(eye, at, up);
    // Ground in world coordinates needs modelview = worldview
    gl.uniformMatrix4fv(mvLoc, false, flatten(worldview));
    gl.uniform4fv(colLoc, flatten(GRASS));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, NVground);
    gl.uniform4fv(colLoc, flatten(PATH));
    gl.drawArrays(gl.TRIANGLE_FAN, NVground, NVpath);
    gl.drawArrays(gl.TRIANGLE_FAN, NVground+NVpath, NVpath);
    // Trees in model coordinates need modelview = worldview*TRS
    for (var i = 0; i < NST; i++) {
        trees[i].render(NVground+NVpath+NVpath, worldview, colLoc);
    }
    for (var i = 0; i < NSH; i++) {
        huts[i].render(NVground+NVpath+NVpath+Tree.NV, worldview, colLoc);
    }

}

function setNumberOfTrees(numberOfTrees){
    NST = numberOfTrees;
    if (NST > 50){
        NHT = 2;
        document.getElementById("hut-slider").value = 2;
    }

    createLandscape();
}

function setNumberOfHuts(numberOfHuts){
    NSH = numberOfHuts;

    createLandscape();
}

function createLandscape() {
    // Generate tree array
    var scales;// = vec3( 2.1, 2.1, 20.0);   // scale the trees
    var location;
    var factor;

    var unique = uniqueLocations(NST + NSH, AREA, 30, 15);

    console.log("Huts = " + NSH);
    console.log("Trees = " + NST);
    console.log("locations = " + unique.length);

    for (var i = 0; i < NST; i++) {
        location = unique[i + NSH];
        factor = ((Math.random() * 1.0) - 3.0);
        scales = vec3( factor , factor, ((Math.random() * 20.0) + 10.0));   // scale the trees ( 2.1 , 2.1, ((Math.random() * 20.0) + 10.0))
        trees[i] = new Tree(location, scales);
    }

    for (var i = 0; i < NSH; i++) {
        location = unique[i];
        // factor = ((Math.random() * 1.0) - 3.0);
        scales = vec3( HUT_T , HUT_W, HUT_H);   // scale the trees ( 2.1 , 2.1, ((Math.random() * 20.0) + 10.0))
        huts[i] = new Hut(location, scales);        
    }
}

/* 
 * Creating an array of unique vec3 positions
 * numberOfLocations - the quantity of unique locations required
 * area - the square area to distribute the locations over 
 * returns an array of vec3 positions
*/
function uniqueLocations(numberOfLocations, area, boundingX, boundingY){
    
    var unique = [];

    function hutTest(point){

        // check the hut is not on the path
        if ( point[0] > -1 * ( Hut.buffer + ( 1.2 * pathWidth ) ) && point[0] < ( Hut.buffer + ( 1.2 * pathWidth ) )) {
            return false;
        }
        // check the hut is not on the path
        if ( point[1] > -1 * ( Hut.buffer + ( -1.2 * pathWidth ) ) && point[1] < ( Hut.buffer + ( 1.2 * pathWidth ) )) {
            return false;
        }
        // if it is the first hut skip rest of test
        if (unique.length == 0) { return true; }

        // check that the hut doesn't interfer with any other hut in the array
        var testlength = unique.length < NSH ? unique.length : NSH;

        for (var i = 0; i < testlength; i++){
          
            if ( inCircle( point, unique[i], Hut.buffer * 2) )  {
                return false;
            }
        }

        return true;
    }

    function treeTest(point){
        // check tree not in location contained by hut
        for (var i = 0; i < NSH; i++) {
            if ( inCircle( point, unique[i], Hut.buffer * 1.8) )  {
                return false;
            }
        }

        // check tree not in location already containg tree
        for (var i = NSH; i < unique.length; i++){
            
            if ( inCircle( point, unique[i], Tree.buffer) )  {
                return false;
            }

            // // console.log(i);
            // var origin = unique[i];

            // var d = Math.sqrt( Math.pow( (point[0] - origin[0]) , 2) + Math.pow( (point[1] - origin[1] ) ,2) );

            // if ( d < Tree.buffer)
            //     return false;
        }        

        return true;
    }

    function inCircle(point, origin, radius){
        var xp = point[0];
        var yp = point[1];

        var op = origin[0];
        var yp = origin[1];

        var d = Math.sqrt( Math.pow( ( xp - op ) , 2) + Math.pow( ( yp - op ) ,2) );
        // console.log("in the circle");
        return d <= radius;
    }

    function test(point, radius){

        // check the path on the y axis
        if (point[0] > -pathWidth * 0.9 && point[0] < pathWidth * 0.9)
            return false;
        // check the path on the x axis
        if (point[1] > -pathWidth * 0.9 && point[1] < pathWidth * 0.9)
            return false;

        // The check below is based on the  on the following definiton of a circle
        // If you have the equation of the circle, simply plug in the x and y 
        // from your point (x,y). After working out the problem, check to see 
        // whether your added values are greater than, less than, or equal to 
        // the r^2 value. If it is greater, then the point lies outside of the 
        // circle.
        var d = (point[0]*point[0] + point[1]*point[1]);
        
        if ( d > radius*radius)
            return false;

        return true;
    }


    // build the array of uniqueness!
    // random positions for placing objects within a circular region
    do {
        var x = ( Math.random() * area * 2 ) - (area );
        var y = ( Math.random() * area * 2 ) - (area );
        var z = 0;

        var tolerance = 1.2;
        // check the path on the y axis
        if ( x > -pathWidth * tolerance && x < pathWidth * tolerance)
            continue;
        // check the path on the x axis
        if ( y > -pathWidth * tolerance && y < pathWidth * tolerance)
            continue;

        // create a vec3
        var v = vec3(x, y, z);

        // if first point check the hut fits
        // push point to array
        if (unique.length < 1 && hutTest(v)) {
            unique.push(v);
            showLocation("HUT", v);
        }
        else if (unique.length < NSH) {
            if ( hutTest(v) )
                unique.push(v);
                showLocation("HUT", v);
            // var u0 = unique[0];
            // var l = Math.sqrt( Math.pow(v[0] - u0[0],2) + Math.pow(v[1] - u0[1], 2)  );
            // if (l > 50)
            //     unique.push(v);
        }
        else {
            if (treeTest(v))
                if (unique.indexOf(v) < 0 ){
                    unique.push(v);
                    showLocation("TREE", v);
                }

            // if (test(v,area))
                // if (unique.indexOf(v) < 0 )
            //         unique.push(v);
        }
    } while (unique.length < numberOfLocations);

    return unique;
}

function showLocation(type, location){
    console.log(type + ":" +location);
}