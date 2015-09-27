// ----------------------------------------------------------------------------------------
// The Tree class
// The constructor function for a block
// Arguments: a vec3 location, a floating-point angle (degrees) and a vec3 scales
function Tree(location, scales) {
    var rs = scalem(scales);
    this.trs = mult(translate(location), rs);
}

// A Tree's render function
// Arguments:
//   offset - offset of vertices into current vertex attribute array
//   worldview - current worldview transformation
Tree.prototype.render = function(offset, worldview, colLoc) {
    gl.uniformMatrix4fv(mvLoc, false, flatten(mult(worldview, this.trs)));
    gl.uniform4fv(colLoc, flatten(vec4(0.0, 0.37, 0.0, 1.0)));
    gl.drawArrays(gl.TRIANGLE_FAN, offset, Tree.faces + 2);
    gl.uniform4fv(colLoc, flatten(vec4(0.398, 0.0, 0.0, 1.0)));
    gl.drawArrays(gl.TRIANGLES, offset + Tree.faces + 2, Tree.faces * 2 * 3);
};

// Block class fields
// The number of vertices to represent a tree (trunk 6 faces x 2 triangles - 18 vertices & cone 6 faces 
// in triangle_fan - 8 vertices   )
Tree.NV = 44;
Tree.faces = 6;
// Generator of model vertices - a class method
// Order is important - It should appear before it is used for Block.vertices
Tree.initModel = function() {
    var omega = (360.0 / Tree.faces) * (Math.PI / 180.0);
    // create the trunk (cylinder shape)
    var upper = []; 
    var lower = [];
    for ( var j = 0; j < Tree.faces ; j++ ){
        upper.push( vec3( Math.cos( j * omega ) / -6.0, Math.sin( j * omega ) / 6.0, 0.1 ) );
        lower.push( vec3( Math.cos( j * omega ) / -6.0, Math.sin( j * omega ) / 6.0, 0.0 ) );
    }

    var cylinder = upper.concat(lower);

    // A local array in which to develop the 36 vertices
    var vertices = [];

    // The 8 raw vertices of the canopy (cone shape)
    vertices.push( vec3( 0.0, 0.0, 0.5) );
    for (var i = 0; i < Tree.faces; i++){
        vertices[i + 1] = vec3( Math.cos( i * omega) / 2.0, Math.sin( i * omega) / 2.0, 0.1 ); // scale the rawVertices
    }
    vertices.push(vertices[1]);

    // A nested function generating the vertices for each face
    function quad(a, b, c, d) {
        // if abcd is an anticlockwise winding on a face
        // then abc and acd are anticlockwise windings on its triangles
        var indices = [a, b, c, a, c, d];

        for (var i = 0; i < indices.length; ++i) {
            vertices.push(cylinder[indices[i]]);
        }
    }

    // A nested function generating the cube's faces
    function doCube() {
        // Use anticlockwise windings
        quad(0,  6,  7, 1);
        quad(1,  7,  8, 2);
        quad(2,  8,  9, 3);
        quad(3,  9, 10, 4);
        quad(4, 10, 11, 5);
        quad(5, 11,  6, 0);
    }
    // console.log(vertices.length);
    doCube();

    // for (var j = 0; j < vertices.length; j++ ) {
    //     console.log(vertices[j]);
    // }
    // console.log(vertices.length);
    
    // the vertices array contains 8 vertices for the 
    // GL.TRIANGLE_FAN and 36 vertices for the GL.TRIANGLE
    return vertices;
}

// The model vertices - a class field
Tree.vertices = Tree.initModel();
//----------------------------------------------------------------------------
