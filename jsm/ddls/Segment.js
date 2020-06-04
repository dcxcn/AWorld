var SegmentID = 0;
var Segment = function(a, b) {
    this.id = SegmentID;
    SegmentID++;
    this.edges = [];
    this.fromShape = null
};
Segment.prototype = {
    constructor: Segment,
    addEdge: function(a) {
        -1 == this.edges.indexOf(a) && -1 == this.edges.indexOf(a.oppositeEdge) && this.edges.push(a)
    },
    removeEdge: function(a) {
        var b = this.edges.indexOf(a); - 1 == b && (b = this.edges.indexOf(a.oppositeEdge)); - 1 != b && this.edges.splice(b, 1)
    },
    dispose: function() {
        this.fromShape = this.edges = null
    },
    toString: function() {
        return "seg_id " + this.id
    }
};
export { Segment };