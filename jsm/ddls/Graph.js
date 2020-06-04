import { GraphNode } from './GraphNode.js';
import { GraphEdge } from './GraphEdge.js';
var GraphID = 0;
var Graph = function() {
    this.id = GraphID;
    GraphID++;
    this.node = this.edge = null
};
Graph.prototype = {
    dispose: function() {
        for (; null != this.node;) this.deleteNode(this.node)
    },
    insertNode: function() {
        var a = new GraphNode;
        null != this.node && (a.next = this.node, this.node.prev = a);
        return this.node = a
    },
    deleteNode: function(a) {
        for (; null != a.outgoingEdge;) null != a.outgoingEdge.oppositeEdge && this.deleteEdge(a.outgoingEdge.oppositeEdge), this.deleteEdge(a.outgoingEdge);
        for (var b = this.node, c; null != b;) c = b.successorNodes.get(a), null != c && this.deleteEdge(c), b = b.next;
        this.node == a ? null != a.next ? (a.next.prev = null, this.node = a.next) : this.node = null : null != a.next ? (a.prev.next = a.next, a.next.prev = a.prev) : a.prev.next = null;
        a.dispose()
    },
    insertEdge: function(a, b) {
        if (null != a.successorNodes.get(b)) return null;
        var c = new GraphEdge;
        null != this.edge && (this.edge.prev = c, c.next = this.edge);
        this.edge = c;
        c.sourceNode = a;
        c.destinationNode = b;
        a.successorNodes.set(b, c);
        null != a.outgoingEdge && (a.outgoingEdge.rotPrevEdge = c, c.rotNextEdge = a.outgoingEdge);
        a.outgoingEdge = c;
        var d = b.successorNodes.get(a);
        null != d && (c.oppositeEdge = d, d.oppositeEdge = c);
        return c
    },
    deleteEdge: function(a) {
        this.edge == a ? null != a.next ? (a.next.prev = null, this.edge = a.next) : this.edge = null : null != a.next ? (a.prev.next = a.next, a.next.prev = a.prev) : a.prev.next = null;
        a.sourceNode.outgoingEdge == a ? null != a.rotNextEdge ? (a.rotNextEdge.rotPrevEdge = null, a.sourceNode.outgoingEdge = a.rotNextEdge) : a.sourceNode.outgoingEdge = null : null != a.rotNextEdge ? (a.rotPrevEdge.rotNextEdge = a.rotNextEdge, a.rotNextEdge.rotPrevEdge = a.rotPrevEdge) : a.rotPrevEdge.rotNextEdge = null;
        a.dispose()
    }
};

export { Graph };