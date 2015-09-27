// A scene of Stonehenge
// Using a Block class to represent each stone block
// Showing use of instance transforms, model-view transformation and perspective projection
// Combined with scene walk-through
// Author Ken Lodge 10/09/2015
// ----------------------------------------------------------------------------------------
// The Tree class
// The constructor function for a tree
// Arguments: a vec3 location and a vec3 scales
function Tree(location, scales) {
	var rs = scalem(scales);	// scale the tree size
	this.trs = mult(translate(location), rs); // move the tree into location
}

// A tree's render function
// Arguments:
//   offset - offset of vertices into current vertex attribute array
//   worldview - current worldview transformation
Block.prototype.render = function(offset, worldview) {
	gl.uniformMatrix4fv(mvLoc, false, flatten(mult(worldview, this.trs)));
	gl.drawArrays(gl.TRIANGLES, offset, Block.NV);
};

// Tree class fields
// The number of vertices to represent a tree (6 faces x 1 triangle each face)
Block.NV = 18;	// this should be set when we decide how many faces the tree has

// Generator of model vertices - a class method
// Order is important - It should appear before it is used for Tree.vertices
Block.initModel = function() {

	var nConicalFace = 6;
	// var nCylinderFace = 6;
	var conicalVerts = [];
	var cylinderVerts = [];
	var theta = ( 360.0 / nConicalFace ) * Math.PI / 180.0; // convert to radians
	
	conicalVerts.push( vec4( 0.0, 0.5, 0.0, 1.0));

	for ( var j = 0; j < nConicalFace; j++ ) {
		conicalVerts[ j + 1 ] = vec4( Math.cos( j * theta) / 2.0, 0.1, Math.sin(j * theta) / 2.0, 1.0 ); // scale the rawVertices
	}

	// number of vertices = 2V + 2 
	// i.e 6 faces polygon = 
	//			4V on first face then 2 vertices on each face after that
	for ( var j = 0; j < (nConicalFace * 2.0) + 2.0; j++ ){
		if (j % 2 == 0) {
			cylinderVerts[j] = vec4( Math.cos( j * theta) / 4.0, 0.1, Math.sin(j * theta) / 4.0, 1.0 );
		}
		else {
			// each odd count of j represents a vertices directly below in the y direction
			cylinderVerts[j] = vec4( Math.cos( (j - 1) * theta) / 4.0, 0.0, Math.sin(j * theta) / 4.0, 1.0 );
		}
	}

	// // The 8 raw vertices of a cube
	// var rawverts = [
	// 	vec3(-0.5, -0.5,  0.5),
	// 	vec3(-0.5,  0.5,  0.5),
	// 	vec3( 0.5,  0.5,  0.5),
	// 	vec3( 0.5, -0.5,  0.5),
	// 	vec3(-0.5, -0.5, -0.5),
	// 	vec3(-0.5,  0.5, -0.5),
	// 	vec3( 0.5,  0.5, -0.5),
	// 	vec3( 0.5, -0.5, -0.5)
	// ];
	// A local array in which to develop the 36 vertices
	var vertices = [];

	// A nested function generating the vertices for each face
	function quad(a, b, c, d) {
		// if abcd is an anticlockwise winding on a face
		// then abc and acd are anticlockwise windings on its triangles
		var indices = [a, b, c, a, c, d];

		for (var i = 0; i < indices.length; ++i) {
			vertices.push(rawverts[indices[i]]);
		}
	}

	// A nested function generating the cube's faces
	function doCube() {
		// Use anticlockwise windings
		quad(1, 0, 3, 2);
		quad(2, 3, 7, 6);
		quad(3, 0, 4, 7);
		quad(6, 5, 1, 2);
		quad(4, 5, 6, 7);
		quad(5, 4, 0, 1);
	}

	doCube();
	return vertices;
}

// The model vertices - a class field
Block.vertices = Block.initModel();
//----------------------------------------------------------------------------