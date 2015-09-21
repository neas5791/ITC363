// ----------------------------------------------------------------------------------------
// The Tree class
// The constructor function for a tree
// Arguments: a vec3 location, a floating-point angle (degrees) and a vec3 scales
function Tree(){

	var loc = vec3 ( 0, 0, 0);

	// var loc = vec3( Math.random() * 2 - 1, 0, Math.random() * 2 - 1);
	// var scale = ( Math.floor( Math.random() * 10 ) + 1 ) / 300;
	// var scales = vec3( scale, 0.0, scale );
}

// A star's render function
Tree.prototype.render = function() {
	// gl.uniformMatrix4fv(matLoc, false, flatten(this.trs));
	console.log("in Tree render function");
	if (Tree.count > 0){
		Tree.printVertices(Tree.count);
		gl.drawArrays( gl.POINT, 0, Tree.count + 1 );
	}
};

Tree.NV = 6;	// The number of vertices - a class field

Tree.count = 0;
Tree.addCount = function(newCount){
	if (newCount < (Tree.NV + 1))
		Tree.count = newCount;

	console.log("Number of vertices to display is " + Tree.count);
}

Tree.printVertices = function(numberOfVetices){
	for (var i = 0; i < numberOfVetices+1; i++)
		console.log("Vertex " + i + ": " + Tree.vertices[i]);
}

Tree.initModel = function() {
	var vertices = [];
	var height = 1;
	var radius = 5;
	var triangles = 6;
	var angle = 360.0 / triangles;
	vertices.push( vec3( 0, 0, 0 ) );
	// pushes all of the vertices to the array

	// this loop creates the vertices on the circumfrence
	for ( var i = 0; i <= triangles ; i++ ) {
		var x = Math.cos( i * angle * Math.PI / 180) / 2;
		var y = Math.sin( i * angle * Math.PI / 180) / 2;
		vertices.push( vec3( x, y, 0) );
		// console.log(vertices[i]);
	}

	// console.log("****************************");
	// for (var i = 0; i < vertices.length; i++) {
	// 	console.log(i + " : " + vertices[i]);	
	// }

	return vertices;

}

Tree.vertices = Tree.initModel();  // The model vertices - a class field
// ------------------------------------------------------------------------------------

var canvas;
var gl;

var tree;			// The array of trees
var NTrees = 1;			// The number of trees


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    tree = new Tree();
    
    var count = 0
    canvas.addEventListener("mousedown", function(event){
    		count++;
    		console.log("count = " + count);
    		Tree.addCount(count);
    		render();
    });

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );	// Black background for stars

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    // Load the data into the GPU, using a class member of Star for the model data
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(Tree.vertices), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

	// get modelview's shader program location
    // matLoc = gl.getUniformLocation(program, "modelview");

    render();
}

function render() {

    gl.clear(gl.COLOR_BUFFER_BIT);
    tree.render();
}


// // Tests if the winding is anticlockwise (Right Hand Thumb rule)
// // returns true if vlist is in the correct order based on the 
// // right hand thumb rule
// function RHTw(vlist) {
//     var i = vlist.length;
//     for (var t = 0; t < 3; t++)
//     	console.log(vlist[t]);
// }

// // Tests if the winding is anticlockwise (Right Hand Thumb rule)
// // returns true if vlist is in the correct order based on the 
// // right hand thumb rule
// function RHTwinding(vlist) {
//     var i = vlist.length;
//     // Argument is assumed an array of 3 3D points in order P0, P1, P2
//     // Calculate cross product (P1-P0)x(P2-P0)
//     var norm = cross ( subtract ( vlist[ i - 2 ], vlist[ i - 3 ] ),
//                         subtract( vlist[ i - 1 ], vlist[ i - 3 ] ) );
//     return norm[2] >= 0;
// }

/*
	taken out of onload function 
	// var vertices = [];
	// var height = 8;
	// var radius = 5;
	// var divisions = 6;
	// vertices.push( vec3( 0, height, 0 ) );
	// // pushes all of the vertices to the array
	// for ( var i = 1; i <= divisions; i++ ) {
	// 	var x = Math.cos( i * ( 360 / divisions ) * Math.PI / 180) * radius;
	// 	var z = Math.sin( i * ( 360 / divisions ) * Math.PI / 180) * radius;
	// 	vertices.push( vec3( x, 0, z) );
	// 	// console.log( vertices[ i - 1 ] );
	// }
	// console.log(vertices.length);


	// var counter = divisions;
	// var t = [] ;
	// // vertices = [0,1,2,3,4,5,6];
	// test = [];
	// var isTrue = true;
	// // var str;
	// // var str2;
	// for (var i = 0; i < divisions ; i++) {


	// 	if ( (i % 2) == 0 ) {
	// 		console.log("even " + i);

	// 		test.push( vertices[ ( ( i + 1 ) > divisions ) ? ( - divisions + ( i + 1 ) ) : i + 1 ] );
	// 		test.push( vertices[ 0 ] );	
	// 		test.push( vertices[ ( ( i + 2 ) > divisions ) ? ( - divisions + ( i + 2 ) ) : i + 2 ] );
			
	// 	} 
	// 	else {
	// 		console.log("odd " + i);

	// 		test.push( vertices[ ( ( i + 1 ) > divisions ) ? ( - divisions + ( i + 1 ) ) : i + 1 ] );
	// 		test.push( vertices[ ( ( i + 2 ) > divisions ) ? ( - divisions + ( i + 2 ) ) : i + 2 ] );
	// 		test.push( vertices[ 0 ] );	

	// 	}

	// 	if ( test.length >= 2 ){
	// 		t = test.slice(-3, test.length);
	// 		str = i + " : ";
	// 		// str2 = RHTwinding(t) ? "TRUE" : "FALSE";
	// 		// console.log(str + str2);
	// 		RHTw(t);
	// 		console.log( RHTwinding(t) ? "TRUE" : "FALSE" );
	// 		// console.log(t);
	// 	}
	// 	t = [];
	// 	// var rhtw = RHTwinding(test.slice(-3))?"TRUE":"FALSE";
	// 	// console.log(rhtw);	
	// }
*/



//SUNDAY
	// // var counter = divisions;
	// // var t = [] ;
	// // vertices = [0,1,2,3,4,5,6];
	// var test = [];
	// var isTrue = true;
	// // var str;
	// // var str2;
	// for (var i = triangles; i > 0 ; i--) {

	// 	test.push( vertices[ 0 ] );	
	// 	test.push( vertices[ i ] ); 
	// 	test.push( vertices[ ( i - 1 ) == 0 ? triangles : i - 1 ] );


	// 	// if ( (i % 2) == 0 ) {
	// 	// 	console.log("even " + i);
	// 	// 	test.push( vertices[ 0 ] );	
	// 	// 	test.push( vertices[ i ] ); 
	// 	// 	test.push( vertices[ ( i - 1 ) == 0 ? triangles : i - 1 ] );
			
	// 	// } 
	// 	// else {
	// 	// 	console.log("odd " + i);

	// 	// 	test.push( vertices[ 0 ] );	
	// 	// 	test.push( vertices[ ( i - 1 ) == 0 ? triangles : i - 1 ] );
	// 	// 	test.push( vertices[ i ] ); 

	// 	// }

	// }



	// // push the origin to the start of the array
	
	// console.log("********************" + test.length);
	// for (var i = 0; i < test.length; i++) {
	// 	console.log(test[i]);
	// }