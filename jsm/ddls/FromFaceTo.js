var FromFaceToInnerVertices = function() {
    Object.defineProperty(this, "fromFace", {
        set: function(a) {
            this._fromFace = a;
            this._nextEdge = this._fromFace.edge
        }
    })
};
FromFaceToInnerVertices.prototype = {
    next: function() {
        null != this._nextEdge ? (this._resultVertex = this._nextEdge.originVertex, this._nextEdge = this._nextEdge.nextLeftEdge, this._nextEdge == this._fromFace.edge && (this._nextEdge = null)) : this._resultVertex = null;
        return this._resultVertex
    }
};
export { FromFaceToInnerVertices };

var FromFaceToInnerEdges = function() {
    Object.defineProperty(this, "fromFace", {
        set: function(a) {
            this._fromFace = a;
            this._nextEdge = this._fromFace.edge
        }
    })
};
FromFaceToInnerEdges.prototype = {
    next: function() {
        null != this._nextEdge ? (this._resultEdge = this._nextEdge, this._nextEdge = this._nextEdge.nextLeftEdge, this._nextEdge == this._fromFace.edge && (this._nextEdge = null)) : this._resultEdge = null;
        return this._resultEdge
    }
};
export { FromFaceToInnerEdges };

var FromFaceToNeighbourFaces = function() {
    Object.defineProperty(this, "fromFace", {
        set: function(a) {
            this._fromFace = a;
            this._nextEdge = this._fromFace.edge
        }
    })
};
FromFaceToNeighbourFaces.prototype = {
    next: function() {
        if (null != this._nextEdge) {
            do if (this._resultFace = this._nextEdge.rightFace, this._nextEdge = this._nextEdge.nextLeftEdge, this._nextEdge == this._fromFace.edge) {
                this._nextEdge = null;
                this._resultFace.isReal || (this._resultFace = null);
                break
            }
            while (!this._resultFace.isReal)
        } else this._resultFace = null;
        return this._resultFace
    }
};
export { FromFaceToNeighbourFaces };