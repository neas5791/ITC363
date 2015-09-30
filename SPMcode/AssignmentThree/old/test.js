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
		cylinderVerts[j] = vec4( Math.cos( ( j - 1 ) * theta) / 4.0, 0.0, Math.sin( ( j - 1 ) * theta) / 4.0, 1.0 );
	}
}

for (var i = 0; i < conicalVerts.length; i ++) {
	console.log("Cone vertices " + i + " = " + conicalVerts[i])
}

for (var i = 0; i < cylinderVerts.length; i ++) {
	console.log(i + " = " + cylinderVerts[i])
}