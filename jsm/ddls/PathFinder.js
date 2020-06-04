import { Log }  from './utils.js';
import { AStar } from './AStar.js';
import { Funnel } from './Funnel.js';
import { Geom2D } from './Geom2D.js';
var PathFinder = function() {
    this.astar = new AStar;
    this.funnel = new Funnel;
    this.listFaces = [];
    this.listEdges = [];
    this.entity = this._mesh = null;
    Object.defineProperty(this, "mesh", {
        get: function() {
            return this._mesh
        },
        set: function(a) {
            this._mesh = a;
            this.astar.mesh = a
        }
    })
};
PathFinder.prototype = {
    dispose: function() {
        this._mesh = null;
        this.astar.dispose();
        this.astar = null;
        this.funnel.dispose();
        this.listFaces = this.listEdges = this.funnel = null
    },
    findPath: function(a, b) {
        b.splice(0, b.length);
        if (!Geom2D.isCircleIntersectingAnyConstraint(a, this.entity.radius, this._mesh)) {
            this.astar.radius = this.entity.radius;
            this.funnel.radius = this.entity.radius;
            this.listFaces.splice(0, this.listFaces.length);
            this.listEdges.splice(0, this.listEdges.length);
            var c = this.entity.position;
            this.astar.findPath(c,
            a, this.listFaces, this.listEdges);
            0 == this.listFaces.length ? Log("PathFinder listFaces.length == 0") : this.funnel.findPath(c, a, this.listFaces, this.listEdges, b)
        }
    }
};
export { PathFinder };