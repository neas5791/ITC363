
var gl;
var n = 50;
var nRows = n;
var nColumns = n;
var unit = 2.0 / n;
// data for radial hat function: sin(Pi*r)/(Pi*r)

var data = [];
for( var i = 0; i < nRows; ++i ) {
    data.push( [] );
    var x = (i - 25) * unit;

    for( var j = 0; j < nColumns; ++j ) {
        var y = (j - 25) * unit;    
        var z = x*x+y*y;
        
        data[i][j] = z;
    }
}

var pointsArray = [];

var xAxis;
var yAxis;
var zAxis;

var fColor;

var near = -10;
var far = 10;
var radius = 6.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

const black = vec4(0.0, 0.0, 0.0, 1.0);
const red = vec4(1.0, 0.0, 0.0, 1.0);
const lgreen = vec4();


const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var modeViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    // enable depth testing and polygon offset
    // so lines will be in front of filled triangles
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

// vertex array of nRows*nColumns quadrilaterals 
// (two triangles/quad) from data
    
    for(var i=0; i<nRows-1; i++) {
        for(var j=0; j<nColumns-1;j++) {
            pointsArray.push( vec4(unit*i, data[i][j], unit*j, 1.0));
            pointsArray.push( vec4(unit*(i+1), data[i+1][j], unit*j, 1.0)); 
            pointsArray.push( vec4(unit*(i+1), data[i+1][j+1], unit*(j+1), 1.0));
            pointsArray.push( vec4(unit*i, data[i][j+1], unit*(j+1), 1.0) );
        }
    }

    xAxis = pointsArray.length;

    pointsArray.push( vec4(-1.0, 0.0, 0.0, 1) )
    pointsArray.push( vec4( 1.0, 0.0, 0.0, 1) )

    yAxis = pointsArray.length;

    pointsArray.push( vec4( 0.0, -1.0, 0.0, 1) )
    pointsArray.push( vec4( 0.0,  1.0, 0.0, 1) )

    zAxis = pointsArray.length;
    pointsArray.push( vec4( 0.0, 0.0, -1.0, 1) )
    pointsArray.push( vec4( 0.0, 0.0,  1.0, 1) )




    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    var vBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    fColor = gl.getUniformLocation(program, "fColor");
 
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

// buttons for moving viewer and changing size

    document.getElementById("Button1").onclick = function(){near  *= 1.1; far *= 1.1; render();};
    document.getElementById("Button2").onclick = function(){near  *= 0.9; far *= 0.9; render();};
    document.getElementById("Button3").onclick = function(){radius *= 2.0; render();};
    document.getElementById("Button4").onclick = function(){radius *= 0.5; render();};
    document.getElementById("Button5").onclick = function(){theta += dr; render();};
    document.getElementById("Button6").onclick = function(){theta -= dr; render();};
    document.getElementById("Button7").onclick = function(){phi += dr; render();};
    document.getElementById("Button8").onclick = function(){phi -= dr; render();};
    document.getElementById("Button9").onclick = function(){left  *= 0.9; right *= 0.9; render();};
    document.getElementById("Button10").onclick = function(){left *= 1.1; right *= 1.1; render();};
    document.getElementById("Button11").onclick = function(){ytop  *= 0.9; bottom *= 0.9; render();};
    document.getElementById("Button12").onclick = function(){ytop *= 1.1; bottom *= 1.1; render();};
       
    render();
 
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var eye = vec3( radius*Math.sin(theta)*Math.cos(phi), 
                    radius*Math.sin(theta)*Math.sin(phi),
                    radius*Math.cos(theta));
    console.log("eye: " + eye);
    modelViewMatrix = lookAt( eye, at, up );
    console.log("mvm: " + modelViewMatrix);
    projectionMatrix = ortho( left, right, bottom, ytop, near, far );
    console.log("pm: " + projectionMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    
    // draw each quad as two filled red triangles
    // and then as two black line loops
    
    for(var i=0; i<pointsArray.length - 6; i+=4) { 
        gl.uniform4fv(fColor, flatten(red));
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
        gl.uniform4fv(fColor, flatten(black));
        gl.drawArrays( gl.LINE_LOOP, i, 4 );
    }
    gl.drawArrays( gl.LINES, xAxis, 2);
    gl.drawArrays( gl.LINES, yAxis, 2);
    gl.drawArrays( gl.LINES, zAxis, 2);


    //requestAnimFrame(render);
}
