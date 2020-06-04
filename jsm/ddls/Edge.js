import { EDGE } from './constants.js';
var EdgeID = 0;
var Edge = function() {
    this.type = EDGE;
    this.id = EdgeID;
    EdgeID++;
    this.fromConstraintSegments = [];
    this.isReal = this.isConstrained = !1;
    this.leftFace = this.nextLeftEdge = this.oppositeEdge = this.originVertex = null;
    Object.defineProperty(this, "destinationVertex", {
        get: function() {
            return this.oppositeEdge.originVertex
        }
    });
    Object.defineProperty(this, "nextRightEdge", {
        get: function() {
            return this.oppositeEdge.nextLeftEdge.nextLeftEdge.oppositeEdge
        }
    });
    Object.defineProperty(this, "prevRightEdge", {
        get: function() {
            return this.oppositeEdge.nextLeftEdge.oppositeEdge
        }
    });
    Object.defineProperty(this, "prevLeftEdge", {
        get: function() {
            return this.nextLeftEdge.nextLeftEdge
        }
    });
    Object.defineProperty(this, "rotLeftEdge", {
        get: function() {
            return this.nextLeftEdge.nextLeftEdge.oppositeEdge
        }
    });
    Object.defineProperty(this, "rotRightEdge", {
        get: function() {
            return this.oppositeEdge.nextLeftEdge
        }
    });
    Object.defineProperty(this, "rightFace", {
        get: function() {
            return this.oppositeEdge.leftFace
        }
    })
};
Edge.prototype = {
    constructor: Edge,
    setDatas: function(a, b, c, d, e, f) {
        this.isConstrained = void 0 !== e ? f : !1;
        this.isReal = void 0 !== e ? e : !0;
        this.originVertex = a;
        this.oppositeEdge = b;
        this.nextLeftEdge = c;
        this.leftFace = d
    },
    getDatas: function() {
        return [this.originVertex.pos.x, this.originVertex.pos.y, this.destinationVertex.pos.x, this.destinationVertex.pos.y, this.isConstrained ? 1 : 0]
    },
    addFromConstraintSegment: function(a) {
        -1 == this.fromConstraintSegments.indexOf(a) && this.fromConstraintSegments.push(a)
    },
    removeFromConstraintSegment: function(a) {
        a = this.fromConstraintSegments.indexOf(a); - 1 != a && this.fromConstraintSegments.splice(a, 1)
    },
    dispose: function() {
        this.fromConstraintSegments = this.leftFace = this.nextLeftEdge = this.oppositeEdge = this.originVertex = null
    },
    toString: function() {
        return "edge " + this.originVertex.id + " - " + this.destinationVertex.id
    }
};
export { Edge };
