import { Squared,Log,SquaredSqrt }  from './utils.js';
import { FromFaceToInnerEdges } from './FromFaceTo.js';
import { Dictionary } from './Dictionary.js';
import { Point } from './Point.js';
import { Geom2D } from './Geom2D.js';

var AStar = function() {
    this.iterEdge = new FromFaceToInnerEdges;
    this.mesh = null;
    this.diameterSquared = this.diameter = this.radiusSquared = this._radius = 0;
    Object.defineProperty(this, "radius", {
        get: function() {
            return this._radius
        },
        set: function(a) {
            this._radius = a;
            this.radiusSquared = this._radius * this._radius;
            this.diameter = 2 * this._radius;
            this.diameterSquared = this.diameter * this.diameter
        }
    })
};
AStar.prototype = {
    dispose: function() {
        this.mesh = null;
        this.closedFaces.dispose();
        this.openedFaces.dispose();
        this.entryEdges.dispose();
        this.predecessor.dispose();
        this.entryX.dispose();
        this.entryY.dispose();
        this.scoreF.dispose();
        this.scoreG.dispose();
        this.scoreH.dispose();
        this.predecessor = this.scoreH = this.scoreG = this.scoreF = this.entryY = this.entryX = this.entryEdges = this.openedFaces = this.closedFaces = this.sortedOpenedFaces = null
    },
    findPath: function(a, b, c, d) {
        this.sortedOpenedFaces = [];
        this.closedFaces = new Dictionary(1);
        this.openedFaces = new Dictionary(1);
        this.entryEdges = new Dictionary(1);
        this.predecessor = new Dictionary(1);
        this.entryX = new Dictionary(1);
        this.entryY = new Dictionary(1);
        this.scoreF = new Dictionary(1);
        this.scoreG = new Dictionary(1);
        this.scoreH = new Dictionary(1);
        var e;
        e = Geom2D.locatePosition(a, this.mesh);
        if (0 != e.type) {
            if (1 == e.type) {
                if (e.isConstrained) return;
                this.fromFace = e.leftFace
            } else this.fromFace = e;
            e = Geom2D.locatePosition(b, this.mesh);
            this.toFace = 0 == e.type ? e.edge.leftFace : 1 == e.type ? e.leftFace : e;
            this.sortedOpenedFaces.push(this.fromFace);
            this.entryEdges.set(this.fromFace, null);
            this.entryX.set(this.fromFace, a.x);
            this.entryY.set(this.fromFace, a.y);
            this.scoreG.set(this.fromFace, 0);
            a = SquaredSqrt(b.x - a.x, b.y - a.y);
            this.scoreH.set(this.fromFace, a);
            this.scoreF.set(this.fromFace, a);
            for (var f, g, k, l = new Point, m = new Point, h = new Point, n = !1;;) {
                if (0 == this.sortedOpenedFaces.length) {
                    Log("AStar no path found");
                    this.curFace = null;
                    break
                }
                this.curFace = this.sortedOpenedFaces.pop();
                if (this.curFace == this.toFace) break;
                for (this.iterEdge.fromFace = this.curFace; null != (a = this.iterEdge.next());) a.isConstrained || (e = a.rightFace, this.closedFaces.get(e) || this.curFace != this.fromFace && 0 < this._radius && !this.isWalkableByRadius(this.entryEdges.get(this.curFace), this.curFace, a) || (l.x = this.entryX.get(this.curFace), l.y = this.entryY.get(this.curFace), m.x = l.x, m.y = l.y, m.x = 0.5 * (a.originVertex.pos.x + a.destinationVertex.pos.x), m.y = 0.5 * (a.originVertex.pos.y + a.destinationVertex.pos.y),
                h.x = m.x - b.x, h.y = m.y - b.y, k = h.get_length(), h.x = l.x - m.x, h.y = l.y - m.y, g = this.scoreG.get(this.curFace) + h.get_length(), f = k + g, n = !1, null != this.openedFaces.get(e) && this.openedFaces.get(e) ? this.scoreF.get(e) > f && (n = !0) : (this.sortedOpenedFaces.push(e), this.openedFaces.set(e, !0), n = !0), n && (this.entryEdges.set(e, a), this.entryX.set(e, m.x), this.entryY.set(e, m.y), this.scoreF.set(e, f), this.scoreG.set(e, g), this.scoreH.set(e, k), this.predecessor.set(e, this.curFace))));
                this.openedFaces.set(this.curFace, !1);
                this.closedFaces.set(this.curFace, !0);
                this.sortedOpenedFaces.sort(function(a, b) {
                    return this.scoreF.get(a) == this.scoreF.get(b) ? 0 : this.scoreF.get(a) < this.scoreF.get(b) ? 1 : -1
                }.bind(this))
            }
            if (null != this.curFace) for (c.push(this.curFace); this.curFace != this.fromFace;) d.unshift(this.entryEdges.get(this.curFace)), this.curFace = this.predecessor.get(this.curFace), c.unshift(this.curFace)
        }
    },
    isWalkableByRadius: function(a, b, c) {
        var d = null,
            e = null,
            f = null;
        a.originVertex == c.originVertex ? (d = a.destinationVertex, e = c.destinationVertex, f = a.originVertex) : a.destinationVertex == c.destinationVertex ? (d = a.originVertex, e = c.originVertex, f = a.destinationVertex) : a.originVertex == c.destinationVertex ? (d = a.destinationVertex, e = c.originVertex, f = a.originVertex) : a.destinationVertex == c.originVertex && (d = a.originVertex, e = c.destinationVertex, f = a.destinationVertex);
        var g;
        g = (f.pos.x - d.pos.x) * (e.pos.x - d.pos.x) + (f.pos.y - d.pos.y) * (e.pos.y - d.pos.y);
        if (0 >= g) return f = Squared(f.pos.x - d.pos.x, f.pos.y - d.pos.y), f >= this.diameterSquared ? !0 : !1;
        g = (f.pos.x - e.pos.x) * (d.pos.x - e.pos.x) + (f.pos.y - e.pos.y) * (d.pos.y - e.pos.y);
        if (0 >= g) return f = Squared(f.pos.x - e.pos.x, f.pos.y - e.pos.y), f >= this.diameterSquared ? !0 : !1;
        c = b.edge != a && b.edge.oppositeEdge != a && b.edge != c && b.edge.oppositeEdge != c ? b.edge : b.edge.nextLeftEdge != a && b.edge.nextLeftEdge.oppositeEdge != a && b.edge.nextLeftEdge != c && b.edge.nextLeftEdge.oppositeEdge != c ? b.edge.nextLeftEdge : b.edge.prevLeftEdge;
        if (c.isConstrained) return b = new Point(f.pos.x, f.pos.y), Geom2D.projectOrthogonaly(b, c), f = Squared(b.x - f.pos.x, b.y - f.pos.y), f >= this.diameterSquared ? !0 : !1;
        d = Squared(f.pos.x - d.pos.x, f.pos.y - d.pos.y);
        e = Squared(f.pos.x - e.pos.x, f.pos.y - e.pos.y);
        if (d < this.diameterSquared || e < this.diameterSquared) return !1;
        e = [];
        d = [];
        a = new Dictionary(1);
        d.push(c);
        c.leftFace == b ? (e.push(c.rightFace), a.set(c.rightFace, !0)) : (e.push(c.leftFace), a.set(c.leftFace, !0));
        for (var k; 0 < e.length;) {
            b = e.shift();
            c = d.shift();
            b.edge == c || b.edge == c.oppositeEdge ? (c = b.edge.nextLeftEdge, k = b.edge.nextLeftEdge.nextLeftEdge) : b.edge.nextLeftEdge == c || b.edge.nextLeftEdge == c.oppositeEdge ? (c = b.edge, k = b.edge.nextLeftEdge.nextLeftEdge) : (c = b.edge, k = b.edge.nextLeftEdge);
            g = c.leftFace == b ? c.rightFace : c.leftFace;
            b = k.leftFace == b ? k.rightFace : k.leftFace;
            if (!a.get(g) && Geom2D.distanceSquaredVertexToEdge(f, c) < this.diameterSquared) {
                if (c.isConstrained) return !1;
                e.push(g);
                d.push(c);
                a.set(g, !0)
            }
            if (!a.get(b) && Geom2D.distanceSquaredVertexToEdge(f, k) < this.diameterSquared) {
                if (k.isConstrained) return !1;
                e.push(b);
                d.push(k);
                a.set(b, !0)
            }
        }
        a.dispose();
        return !0
    }
};
export { AStar };