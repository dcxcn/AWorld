var GraphEdgeID = 0;
var GraphEdge = function() {
    this.id = GraphEdgeID;
    GraphEdgeID++;
    this.data = this.destinationNode = this.sourceNode = this.oppositeEdge = this.rotNextEdge = this.rotPrevEdge = this.prev = this.next = null
};
GraphEdge.prototype = {
    dispose: function() {}
};