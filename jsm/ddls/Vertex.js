import { VERTEX } from './constants.js';
import { Point } from './Point.js';
var VertexID = 0;
var Vertex = function() {
    this.type = VERTEX;
    this.id = VertexID;
    VertexID++;
    this.pos = new Point;
    this.fromConstraintSegments = [];
    this.edge = null;
    this.isReal = !1
};
Vertex.prototype = {
    constructor: Vertex,
    setDatas: function(a, b) {
        this.isReal = void 0 !== b ? b : !0;
        this.edge = a
    },
    addFromConstraintSegment: function(a) {
        -1 == this.fromConstraintSegments.indexOf(a) && this.fromConstraintSegments.push(a)
    },
    removeFromConstraintSegment: function(a) {
        a = this.fromConstraintSegments.indexOf(a); - 1 != a && this.fromConstraintSegments.splice(a, 1)
    },
    dispose: function() {
        this.fromConstraintSegments = this.edge = this.pos = null
    },
    toString: function() {
        return "ver_id " + this.id
    }
};
export { Vertex };