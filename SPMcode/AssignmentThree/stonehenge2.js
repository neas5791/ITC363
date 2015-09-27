// // A scene of a park
// // Using a Tree class to represent each tree in the scene
// // ----------------------------------------------------------------------------------------
// // The Tree class
// // The constructor function for a block
// // Arguments: a vec3 location, a floating-point angle (degrees) and a vec3 scales
// function Tree(location, scales) {
//     var rs = scalem(scales);
//     this.trs = mult(translate(location), rs);
// }

// // A Tree's render function
// // Arguments:
// //   offset - offset of vertices into current vertex attribute array
// //   worldview - current worldview transformation
// Tree.prototype.render = function(offset, worldview, colLoc) {
//     gl.uniformMatrix4fv(mvLoc, false, flatten(mult(worldview, this.trs)));
//     gl.uniform4fv(colLoc, flatten(vec4(0.0, 0.37, 0.0, 1.0)));
//     gl.drawArrays(gl.TRIANGLE_FAN, offset, Tree.faces + 2);
//     gl.uniform4fv(colLoc, flatten(vec4(0.398, 0.0, 0.0, 1.0)));
//     gl.drawArrays(gl.TRIANGLES, offset + Tree.faces + 2, Tree.faces * 2 * 3);
// };

// // Block class fields
// // The number of vertices to represent a tree (trunk 6 faces x 2 triangles - 18 vertices & cone 6 faces 
// // in triangle_fan - 8 vertices   )
// Tree.NV = 44;
// Tree.faces = 6;
// // Generator of model vertices - a class method
// // Order is important - It should appear before it is used for Block.vertices
// Tree.initModel = function() {
//     var omega = (360.0 / Tree.faces) * (Math.PI / 180.0);
//     // create the trunk (cylinder shape)
//     var upper = []; 
//     var lower = [];
//     for ( var j = 0; j < Tree.faces ; j++ ){
//         upper.push( vec3( Math.cos( j * omega ) / -6.0, Math.sin( j * omega ) / 6.0, 0.1 ) );
//         lower.push( vec3( Math.cos( j * omega ) / -6.0, Math.sin( j * omega ) / 6.0, 0.0 ) );
//     }

//     var cylinder = upper.concat(lower);

//     // A local array in which to develop the 36 vertices
//     var vertices = [];

//     // The 8 raw vertices of the canopy (cone shape)
//     vertices.push( vec3( 0.0, 0.0, 0.5) );
//     for (var i = 0; i < Tree.faces; i++){
//         vertices[i + 1] = vec3( Math.cos( i * omega) / 2.0, Math.sin( i * omega) / 2.0, 0.1 ); // scale the rawVertices
//     }
//     vertices.push(vertices[1]);

//     // A nested function generating the vertices for each face
//     function quad(a, b, c, d) {
//         // if abcd is an anticlockwise winding on a face
//         // then abc and acd are anticlockwise windings on its triangles
//         var indices = [a, b, c, a, c, d];

//         for (var i = 0; i < indices.length; ++i) {
//             vertices.push(cylinder[indices[i]]);
//         }
//     }

//     // A nested function generating the cube's faces
//     function doCube() {
//         // Use anticlockwise windings
//         quad(0,  6,  7, 1);
//         quad(1,  7,  8, 2);
//         quad(2,  8,  9, 3);
//         quad(3,  9, 10, 4);
//         quad(4, 10, 11, 5);
//         quad(5, 11,  6, 0);
//     }
//     // console.log(vertices.length);
//     doCube();

//     // for (var j = 0; j < vertices.length; j++ ) {
//     //     console.log(vertices[j]);
//     // }
//     // console.log(vertices.length);

//     // the vertices array contains 8 vertices for the 
//     // GL.TRIANGLE_FAN and 36 vertices for the GL.TRIANGLE
//     return vertices;
// }

// // The model vertices - a class field
// Tree.vertices = Tree.initModel();
// //----------------------------------------------------------------------------



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
const TREE = vec4(0.0, 0.37, 0.0, 1.0); // 005f00 - dark green
const PATH = vec4(1.0, 0.53, 0.0, 1.0); // ff8700 - orange sort of colour
const HUT_ROOF = vec4(0.0, 0.0, 0.0, 1.0); // 000000 - black 
const HUT = vec4(0.0, 0.0, 1.0 , 1.0); // 0000ff - blue

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

// Stonehenge parameters (lengths in metres)
// const RINGRAD = 16.5;   // Radius of ring
// const SSH = 4.1;        // Standing stone height (above ground)
// const SSW = 2.1;        // Standing stone width
// const SST = 1.1;        // Standing stone thickness
// const LSH = 0.8;        // Lintel stone height
// const LSW = 3.2;        // Lintel stone width (aka length)
// const LST = 1.0;        // Lintel stone thickness
const NST = 300;         // Number of standing trees

// Arrays of Trees objects representing the standing stones and the lintels
var trees = [];


window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect =  canvas.width/canvas.height;

    // Generate arrays of stone blocks
    doTrees();

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
    gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec3']*(NVground+NVpath+NVpath+Tree.NV), gl.STATIC_DRAW);
    // put the ground into the buffer
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(ground));
    // put a path into the buffer
    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec3']*NVground, flatten(path));
    // put the second path into the buffer
    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec3']*(NVground+NVpath), flatten(path2));
    // put the trees into the buffer
    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec3']*(NVground+(2*NVpath)), flatten(Tree.vertices));

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
    // Stones in model coordinates need modelview = worldview*TRS
    // gl.uniform4fv(colLoc, flatten(TREE));
    for (var i = 0; i < NST; i++) {
        trees[i].render(NVground+NVpath+NVpath, worldview, colLoc);
    }
}

function doTrees() {
    // Generate tree array
    var scales = vec3( 2.1, 2.1, 20.0);   // scale the trees
    var location;

    var unique = uniqueLocations(300, 100);

    for (var i = 0; i < NST; i++) {
        location = unique[i];
        trees[i] = new Tree(location, scales);
    }
    console.log(trees.length);
}

/* Creating an array of unique vec3 positions
 * 
*/
function uniqueLocations(numberOfLocations, area){
    
    var unique = [];

    function test(x){
        if (x > -pathWidth*1.2 && x < pathWidth*1.2){
            // console.log("found a false!");
            return false;

        }

        return true;
    }

    do {
        var x = ( Math.random() * area ) - (area / 2);
        var y = ( Math.random() * area ) - (area / 2);
        var z = 0;
        var v = vec3(x, y, z);
        if (unique.length == 0) {
            unique.push(v);
        }
        else
        {
            if (test(x) && test(y))
                if (unique.indexOf(v) < 0 )
                    unique.push(v);
        }
    } while (unique.length < numberOfLocations);

    console.log(unique.length);

    // for (var i = 0; i < numberOfLocations; i++){
    //     var x = ( Math.random() * area ) - (area / 2);
    //     var y = ( Math.random() * area ) - (area / 2);
    //     var z = 0;
    //     var v = vec3(x, y, z);
    //     if (i == 0) {
    //         unique.push(v);
    //     }
    //     else
    //     {
    //         if (test(x) && test(y))
    //             if (unique.indexOf(v) < 0 )
    //                 unique.push(v);
    //             else
    //                 i--;
    //     }
    // }



    // for (var i = 0 ; i < unique.length; i++)
    //     console.log(unique[i]);
    return unique;
}
