var FromMeshToVertices = function() {
    Object.defineProperty(this, "fromMesh", {
        set: function(a) {
            this._fromMesh = a;
            this._currIndex = 0
        }
    })
};
FromMeshToVertices.prototype = {
    next: function() {
        do if (this._currIndex < this._fromMesh._vertices.length) this._resultVertex = this._fromMesh._vertices[this._currIndex], this._currIndex++;
        else {
            this._resultVertex = null;
            break
        }
        while (!this._resultVertex.isReal);
        return this._resultVertex
    }
};
export { FromMeshToVertices };

var FromMeshToFaces = function() {
    Object.defineProperty(this, "fromMesh", {
        set: function(a) {
            this._fromMesh = a;
            this._currIndex = 0
        }
    })
};
FromMeshToFaces.prototype = {
    next: function() {
        do if (this._currIndex < this._fromMesh._faces.length) this._resultFace = this._fromMesh._faces[this._currIndex], this._currIndex++;
        else {
            this._resultFace = null;
            break
        }
        while (!this._resultFace.isReal);
        return this._resultFace
    }
};
export { FromMeshToFaces };