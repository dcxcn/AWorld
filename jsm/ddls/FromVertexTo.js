var FromVertexToHoldingFaces = function() {
    Object.defineProperty(this, "fromVertex", {
        set: function(a) {
            this._fromVertex = a;
            this._nextEdge = this._fromVertex.edge
        }
    })
};
FromVertexToHoldingFaces.prototype = {
    next: function() {
        if (null != this._nextEdge) {
            do if (this._resultFace = this._nextEdge.leftFace, this._nextEdge = this._nextEdge.rotLeftEdge, this._nextEdge == this._fromVertex.edge) {
                this._nextEdge = null;
                this._resultFace.isReal || (this._resultFace = null);
                break
            }
            while (!this._resultFace.isReal)
        } else this._resultFace = null;
        return this._resultFace
    }
};
export { FromVertexToHoldingFaces };

var FromVertexToIncomingEdges = function() {
    Object.defineProperty(this, "fromVertex", {
        set: function(a) {
            this._fromVertex = a;
            for (this._nextEdge = this._fromVertex.edge; !this._nextEdge.isReal;) this._nextEdge = this._nextEdge.rotLeftEdge
        }
    })
};
FromVertexToIncomingEdges.prototype = {
    next: function() {
        if (null != this._nextEdge) {
            this._resultEdge = this._nextEdge.oppositeEdge;
            do if (this._nextEdge = this._nextEdge.rotLeftEdge, this._nextEdge == this._fromVertex.edge) {
                this._nextEdge = null;
                break
            }
            while (!this._nextEdge.isReal)
        } else this._resultEdge = null;
        return this._resultEdge
    }
};
export { FromVertexToIncomingEdges };

var FromVertexToOutgoingEdges = function() {
    this.realEdgesOnly = !0;
    Object.defineProperty(this, "fromVertex", {
        set: function(a) {
            this._fromVertex = a;
            this._nextEdge = this._fromVertex.edge;
            if (null != this._nextEdge) for (; this.realEdgesOnly && !this._nextEdge.isReal;) this._nextEdge = this._nextEdge.rotLeftEdge
        }
    })
};
FromVertexToOutgoingEdges.prototype = {
    next: function() {
        if (null != this._nextEdge) {
            this._resultEdge = this._nextEdge;
            do if (this._nextEdge = this._nextEdge.rotLeftEdge, this._nextEdge == this._fromVertex.edge) {
                this._nextEdge = null;
                break
            }
            while (this.realEdgesOnly && !this._nextEdge.isReal)
        } else this._resultEdge = null;
        return this._resultEdge
    }
};
export { FromVertexToOutgoingEdges };

var FromVertexToNeighbourVertices = function() {
    Object.defineProperty(this, "fromVertex", {
        set: function(a) {
            this._fromVertex = a;
            this._nextEdge = this._fromVertex.edge
        }
    })
};
FromVertexToNeighbourVertices.prototype = {
    next: function() {
        if (null != this._nextEdge) {
            this._resultVertex = this._nextEdge.destinationVertex;
            do this._nextEdge = this._nextEdge.rotLeftEdge;
            while (!this._nextEdge.isReal);
            this._nextEdge == this._fromVertex.edge && (this._nextEdge = null)
        } else this._resultVertex = null;
        return this._resultVertex
    }
};
export { FromVertexToNeighbourVertices };