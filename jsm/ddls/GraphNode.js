import { Dictionary }  from './Dictionary.js';
var GraphNodeID = 0;
var GraphNode = function() {
    this.id = GraphNodeID;
    GraphNodeID++;
    this.successorNodes = new Dictionary(1);
    this.data = this.outgoingEdge = this.next = this.prev = null
};
GraphNode.prototype = {
    dispose: function() {
        this.successorNodes.dispose();
        this.data = this.successorNodes = this.outgoingEdge = this.next = this.prev = null
    }
};