// ----------------------------------------------------------------------------------------
// The Hut class
// The constructor function for a block
// Arguments: a vec3 location, a floating-point angle (degrees) and a vec3 scales
function Hut(location, scales) {
    var rs = scalem(scales);
    this.trs = mult(translate(location), rs);
}

// A Tree's render function
// Arguments:
//   offset - offset of vertices into current vertex attribute array
//   worldview - current worldview transformation
Hut.prototype.render = function(offset, worldview, colLoc) {
    gl.uniformMatrix4fv(mvLoc, false, flatten(mult(worldview, this.trs)));
    gl.uniform4fv(colLoc, flatten(Hut.BLUE));
    gl.drawArrays(gl.TRIANGLES, offset, Hut.NV-18);

    gl.uniform4fv(colLoc, flatten(Hut.BLACK));
    gl.drawArrays(gl.TRIANGLES, offset + Hut.NV - 18, 18);
};

// Block class fields
// The number of vertices to represent a tree (trunk 6 faces x 2 triangles - 18 vertices & cone 6 faces 
// in triangle_fan - 8 vertices   )
Hut.NV = 54;//42;//36
Hut.NVroof = 6;
Hut.faces = 6;
Hut.buffer = 20;

Hut.BLACK = vec4(0.0, 0.0, 0.0, 1.0); // 000000 - black
Hut.BLUE = vec4(0.0, 0.0, 1.0 , 1.0); // 0000ff - blue

// Generator of model vertices - a class method
// Order is important - It should appear before it is used for Block.vertices
Hut.initModel = function() {
    // The 8 raw vertices of a cube
    var rawverts = [
        vec3(-0.5, -0.5,  0.5),//0
        vec3(-0.5,  0.5,  0.5),//1
        vec3( 0.5,  0.5,  0.5),//2
        vec3( 0.5, -0.5,  0.5),//3
        vec3(-0.5, -0.5, -0.5),//4
        vec3(-0.5,  0.5, -0.5),//5
        vec3( 0.5,  0.5, -0.5),//6
        vec3( 0.5, -0.5, -0.5),//7
        vec3(-0.4,  0.0, 0.75),//8
        vec3( 0.4,  0.0, 0.75) //9
    ];
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
        // 24 vertices in cube

        // console.log(vertices.length);
        vertices.push(rawverts[1]); // triangle at end
        vertices.push(rawverts[0]); // triangle at end
        vertices.push(rawverts[9]); // triangle at end
        // 27 vertices

        quad(8,0,3,9);
        // console.log(vertices.length);
        // 33 vertices

        vertices.push(rawverts[1]); // triangle at end
        vertices.push(rawverts[1]); // triangle at end
        vertices.push(rawverts[1]); // triangle at end
        // 36 vertices

        quad(9, 2, 1, 8);
        // 42 vertices
    }

    doCube();
    return vertices;
}

// The model vertices - a class field
Hut.vertices = Hut.initModel();
//----------------------------------------------------------------------------
