import { EPSILON_SQUARED,NEGATIVE_INFINITY,POSITIVE_INFINITY,DDLS_ARRAY_TYPE }  from './constants.js';
import { Log,Squared,min,max }  from './utils.js';
import { Vertex } from './Vertex.js';
import { Edge } from './Edge.js';
import { Point } from './Point.js';
import { Segment } from './Segment.js';
import { Face } from './Face.js';
import { Shape } from './Shape.js';
import { Geom2D } from './Geom2D.js';
import { Dictionary } from './Dictionary.js';
import { FromMeshToVertices } from './FromMeshTo.js';
import { FromVertexToIncomingEdges,FromVertexToOutgoingEdges } from './FromVertexTo.js';
var MeshID = 0;
var Mesh = function(a, b) {
    this.id = MeshID;
    MeshID++;
    this.__objectsUpdateInProgress = !1;
    this.__centerVertex = null;
    this.width = a;
    this.height = b;
    this.clipping = !0;
    this._edges = [];
    this._faces = [];
    this._objects = [];
    this._vertices = [];
    this._constraintShapes = [];
    this.__edgesToCheck = [];
    this.AR_edge = this.AR_vertex = null;
    this.isRedraw = !0
};
Mesh.prototype = {
    constructor: Mesh,
    clear: function(a) {
        for (; 0 < this._vertices.length;) this._vertices.pop().dispose();
        for (this._vertices = []; 0 < this._edges.length;) this._edges.pop().dispose();
        for (this._edges = []; 0 < this._faces.length;) this._faces.pop().dispose();
        for (this._faces = []; 0 < this._constraintShapes.length;) this._constraintShapes.pop().dispose();
        this._constraintShapes = [];
        if (!a) for (; 0 < this._objects.length;) this._objects.pop().dispose();
        this._objects = [];
        this.__edgesToCheck = [];
        this.__centerVertex = [];
        this.AR_edge = this.AR_vertex = null
    },
    dispose: function() {
        for (; 0 < this._vertices.length;) this._vertices.pop().dispose();
        for (this._vertices = null; 0 < this._edges.length;) this._edges.pop().dispose();
        for (this._edges = null; 0 < this._faces.length;) this._faces.pop().dispose();
        for (this._faces = null; 0 < this._constraintShapes.length;) this._constraintShapes.pop().dispose();
        for (this._constraintShapes = null; 0 < this._objects.length;) this._objects.pop().dispose();
        this.AR_edge = this.AR_vertex = this.__centerVertex = this.__edgesToCheck = this._objects = null
    },
    get___constraintShapes: function() {
        return this._constraintShapes
    },
    buildFromRecord: function(a) {
        a = a.split(";");
        for (var b = a.length, c = 0; c < b;) this.insertConstraintSegment(parseFloat(a[c]), parseFloat(a[c + 1]), parseFloat(a[c + 2]), parseFloat(a[c + 3])), c += 4
    },
    insertObject: function(a) {
        null != a.constraintShape && this.deleteObject(a);
        var b = new Shape,
            c, d = a.coordinates;
        a.updateMatrixFromValues();
        for (var e = a.matrix, f = new Point, g = new Point, k = d.length, l = 0; l < k;) f.set(d[l], d[l + 1]).transformMat2D(e),
        g.set(d[l + 2], d[l + 3]).transformMat2D(e), c = this.insertConstraintSegment(f.x, f.y, g.x, g.y), null != c && (c.fromShape = b, b.segments.push(c)), l += 4;
        this._constraintShapes.push(b);
        a.constraintShape = b;
        this.__objectsUpdateInProgress || this._objects.push(a)
    },
    deleteObject: function(a) {
        null != a.constraintShape && (this.deleteConstraintShape(a.constraintShape), a.constraintShape = null, this.__objectsUpdateInProgress || (a = this._objects.indexOf(a), this._objects.splice(a, 1)))
    },
    updateObjects: function() {
        this.__objectsUpdateInProgress = !0;
        for (var a = this._objects.length, b = 0, c = 0; b < a;) c = b++, c = this._objects[c], c.hasChanged && (this.deleteObject(c), this.insertObject(c), c.hasChanged = !1, this.isRedraw = !0);
        this.__objectsUpdateInProgress = !1
    },
    insertConstraintShape: function(a) {
        for (var b = new Shape, c = null, d = a.length, e = 0; e < d;) c = this.insertConstraintSegment(a[e], a[e + 1], a[e + 2], a[e + 3]), null != c && (c.fromShape = b, b.segments.push(c)), e += 4;
        this._constraintShapes.push(b);
        return b
    },
    deleteConstraintShape: function(a) {
        for (var b = 0, c = 0, d = a.segments.length; b < d;) c = b++, this.deleteConstraintSegment(a.segments[c]);
        this._constraintShapes.splice(this._constraintShapes.indexOf(a), 1);
        a.dispose()
    },
    insertConstraintSegment: function(a, b, c, d) {
        var e = a,
            f = b,
            g = c,
            k = d;
        if (a > this.width && c > this.width || 0 > a && 0 > c || b > this.height && d > this.height || 0 > b && 0 > d) return null;
        c -= a;
        d -= b;
        var l = NEGATIVE_INFINITY,
            m = POSITIVE_INFINITY;
        if (0 != c) var h = (0 - a) / c,
            n = (this.width - a) / c,
            l = max(l, min(h, n)),
            m = min(m, max(h, n));
        0 != d && (h = (0 - b) / d, n = (this.height - b) / d, l = max(l, min(h,
        n)), m = min(m, max(h, n)));
        if (m >= l) 1 > m && (g = c * m + a, k = d * m + b), 0 < l && (e = c * l + a, f = d * l + b);
        else return null;
        a = this.insertVertex(e, f);
        if (null == a) return null;
        g = this.insertVertex(g, k);
        if (null == g || a.id == g.id) return null;
        k = new FromVertexToOutgoingEdges;
        b = new Segment;
        e = new Edge;
        f = new Edge;
        e.setDatas(a, f, null, null, !0, !0);
        f.setDatas(g, e, null, null, !0, !0);
        f = [];
        c = [];
        d = [];
        for (var n = {
            type: 3
        }, l = new Point, p = !1, n = a;;) if (p = !1, 0 === n.type) {
            m = n;
            for (k.fromVertex = m; null != (h = k.next());) {
                if (h.destinationVertex.id == g.id) return h.isConstrained || (h.isConstrained = !0, h.oppositeEdge.isConstrained = !0), h.addFromConstraintSegment(b), h.oppositeEdge.fromConstraintSegments = h.fromConstraintSegments, a.addFromConstraintSegment(b), g.addFromConstraintSegment(b), b.addEdge(h), b;
                if (Geom2D.distanceSquaredVertexToEdge(h.destinationVertex, e) <= EPSILON_SQUARED) {
                    h.isConstrained || (h.isConstrained = !0, h.oppositeEdge.isConstrained = !0);
                    h.addFromConstraintSegment(b);
                    h.oppositeEdge.fromConstraintSegments = h.fromConstraintSegments;
                    a.addFromConstraintSegment(b);
                    b.addEdge(h);
                    a = h.destinationVertex;
                    n = e.originVertex = a;
                    p = !0;
                    break
                }
            }
            if (!p) for (k.fromVertex = m; null != (h = k.next());) if (h = h.nextLeftEdge, Geom2D.intersections2edges(h, e, l)) {
                if (h.isConstrained) {
                    a = this.splitEdge(h, l.x, l.y);
                    for (k.fromVertex = m; null != (h = k.next());) if (h.destinationVertex.id == a.id) {
                        h.isConstrained = !0;
                        h.oppositeEdge.isConstrained = !0;
                        h.addFromConstraintSegment(b);
                        h.oppositeEdge.fromConstraintSegments = h.fromConstraintSegments;
                        b.addEdge(h);
                        break
                    }
                    m.addFromConstraintSegment(b);
                    n = e.originVertex = a
                } else f.push(h), c.unshift(h.nextLeftEdge), d.push(h.prevLeftEdge), n = h = h.oppositeEdge;
                break
            }
        } else if (1 === n.type) {
            h = n;
            m = h.nextLeftEdge;
            if (m.destinationVertex.id == g.id) return c.unshift(m.nextLeftEdge), d.push(m), h = new Edge, n = new Edge, h.setDatas(a, n, null, null, !0, !0), n.setDatas(g, h, null, null, !0, !0), c.push(h), d.push(n), this.insertNewConstrainedEdge(b, h, f, c, d), b;
            if (Geom2D.distanceSquaredVertexToEdge(m.destinationVertex, e) <= EPSILON_SQUARED) c.unshift(m.nextLeftEdge), d.push(m),
            h = new Edge, n = new Edge, h.setDatas(a, n, null, null, !0, !0), n.setDatas(m.destinationVertex, h, null, null, !0, !0), c.push(h), d.push(n), this.insertNewConstrainedEdge(b, h, f, c, d), f.splice(0, f.length), c.splice(0, c.length), d.splice(0, d.length), a = m.destinationVertex, n = e.originVertex = a;
            else if (Geom2D.intersections2edges(m, e, l)) if (m.isConstrained) {
                m = this.splitEdge(m, l.x, l.y);
                for (k.fromVertex = m; null != (h = k.next());) h.destinationVertex == c[0].originVertex && c.unshift(h), h.destinationVertex == d[d.length - 1].destinationVertex && d.push(h.oppositeEdge);
                h = new Edge;
                n = new Edge;
                h.setDatas(a, n, null, null, !0, !0);
                n.setDatas(m, h, null, null, !0, !0);
                c.push(h);
                d.push(n);
                this.insertNewConstrainedEdge(b, h, f, c, d);
                f.splice(0, f.length);
                c.splice(0, c.length);
                d.splice(0, d.length);
                a = m;
                n = e.originVertex = a
            } else f.push(m), c.unshift(m.nextLeftEdge), n = h = m.oppositeEdge;
            else if (m = m.nextLeftEdge, Geom2D.intersections2edges(m, e, l), m.isConstrained) {
                m = this.splitEdge(m, l.x, l.y);
                for (k.fromVertex = m; null != (h = k.next());) h.destinationVertex.id == c[0].originVertex.id && c.unshift(h), h.destinationVertex.id == d[d.length - 1].destinationVertex.id && d.push(h.oppositeEdge);
                h = new Edge;
                n = new Edge;
                h.setDatas(a, n, null, null, !0, !0);
                n.setDatas(m, h, null, null, !0, !0);
                c.push(h);
                d.push(n);
                this.insertNewConstrainedEdge(b, h, f, c, d);
                f.splice(0, f.length);
                c.splice(0, c.length);
                d.splice(0, d.length);
                a = m;
                n = e.originVertex = a
            } else f.push(m), d.push(m.prevLeftEdge), n = h = m.oppositeEdge
        }
    },
    insertNewConstrainedEdge: function(a, b, c, d, e) {
        this._edges.push(b);
        this._edges.push(b.oppositeEdge);
        b.addFromConstraintSegment(a);
        b.oppositeEdge.fromConstraintSegments = b.fromConstraintSegments;
        a.addEdge(b);
        b.originVertex.addFromConstraintSegment(a);
        b.destinationVertex.addFromConstraintSegment(a);
        this.untriangulate(c);
        this.triangulate(d, !0);
        this.triangulate(e, !0)
    },
    deleteConstraintSegment: function(a) {
        for (var b = [], c = null, d, e = a.edges.length, f = 0; f < e;) c = f++, c = a.edges[c], c.removeFromConstraintSegment(a), 0 == c.fromConstraintSegments.length && (c.isConstrained = !1, c.oppositeEdge.isConstrained = !1), d = c.originVertex, d.removeFromConstraintSegment(a),
        b.push(d);
        d = c.destinationVertex;
        d.removeFromConstraintSegment(a);
        b.push(d);
        e = b.length;
        for (f = 0; f < e;) c = f++, this.deleteVertex(b[c]);
        a.dispose()
    },
    check: function() {
        for (var a = this._edges.length, b = 0, c; b < a;) if (c = b++, null == this._edges[c].nextLeftEdge) {
            Log("!!! missing nextLeftEdge");
            return
        }
        Log("check OK")
    },
    insertVertex: function(a, b) {
        if (0 > a || 0 > b || a > this.width || b > this.height) return null;
        this.__edgesToCheck.splice(0, this.__edgesToCheck.length);
        var c = Geom2D.locatePosition(new Point(a, b), this),
            d = null;
        switch (c.type) {
            case 0:
                d = c;
                break;
            case 1:
                d = this.splitEdge(c, a, b);
                break;
            case 2:
                d = this.splitFace(c, a, b)
        }
        this.restoreAsDelaunay();
        return d
    },
    flipEdge: function(a) {
        var b = a.oppositeEdge,
            c = new Edge,
            d = new Edge,
            e = a.nextLeftEdge,
            f = e.nextLeftEdge,
            g = b.nextLeftEdge,
            k = g.nextLeftEdge,
            l = a.originVertex,
            m = b.originVertex,
            h = f.originVertex,
            n = k.originVertex,
            p = a.leftFace,
            q = b.leftFace,
            r = new Face,
            s = new Face;
        this._edges.push(c);
        this._edges.push(d);
        this._faces.push(s);
        this._faces.push(r);
        c.setDatas(h,
        d, k, s, a.isReal, a.isConstrained);
        d.setDatas(n, c, f, r, a.isReal, a.isConstrained);
        s.setDatas(c);
        r.setDatas(d);
        m.edge.id == b.id && m.setDatas(e);
        l.edge.id == a.id && l.setDatas(g);
        e.nextLeftEdge = c;
        e.leftFace = s;
        f.nextLeftEdge = g;
        f.leftFace = r;
        g.nextLeftEdge = d;
        g.leftFace = r;
        k.nextLeftEdge = e;
        k.leftFace = s;
        this._edges.splice(this._edges.indexOf(a), 1);
        this._edges.splice(this._edges.indexOf(b), 1);
        a.dispose();
        b.dispose();
        this._faces.splice(this._faces.indexOf(p), 1);
        this._faces.splice(this._faces.indexOf(q), 1);
        p.dispose();
        q.dispose();
        return d
    },
    splitEdge: function(a, b, c) {
        this.__edgesToCheck.splice(0, this.__edgesToCheck.length);
        var d = a.oppositeEdge,
            e = a.nextLeftEdge,
            f = e.nextLeftEdge,
            g = d.nextLeftEdge,
            k = g.nextLeftEdge,
            l = f.originVertex,
            m = a.originVertex,
            h = k.originVertex,
            n = d.originVertex,
            p = a.leftFace,
            q = d.leftFace;
        if ((m.pos.x - b) * (m.pos.x - b) + (m.pos.y - c) * (m.pos.y - c) <= EPSILON_SQUARED) return m;
        if ((n.pos.x - b) * (n.pos.x - b) + (n.pos.y - c) * (n.pos.y - c) <= EPSILON_SQUARED) return n;
        var r = new Vertex,
            s = new Edge,
            t = new Edge,
            u = new Edge,
            v = new Edge,
            w = new Edge,
            x = new Edge,
            z = new Edge,
            y = new Edge,
            A = new Face,
            B = new Face,
            C = new Face,
            D = new Face;
        this._vertices.push(r);
        this._edges.push(t);
        this._edges.push(s);
        this._edges.push(x);
        this._edges.push(w);
        this._edges.push(v);
        this._edges.push(u);
        this._edges.push(y);
        this._edges.push(z);
        this._faces.push(D);
        this._faces.push(C);
        this._faces.push(B);
        this._faces.push(A);
        r.setDatas(p.isReal ? t : v);
        r.pos.x = b;
        r.pos.y = c;
        Geom2D.projectOrthogonaly(r.pos,
        a);
        t.setDatas(r, s, f, A, p.isReal);
        s.setDatas(l, t, y, D, p.isReal);
        x.setDatas(r, w, g, B, a.isReal, a.isConstrained);
        w.setDatas(m, x, t, A, a.isReal, a.isConstrained);
        v.setDatas(r, u, k, C, q.isReal);
        u.setDatas(h, v, x, B, q.isReal);
        y.setDatas(r, z, e, D, a.isReal, a.isConstrained);
        z.setDatas(n, y, v, C, a.isReal, a.isConstrained);
        A.setDatas(t, p.isReal);
        B.setDatas(x, q.isReal);
        C.setDatas(v, q.isReal);
        D.setDatas(y, p.isReal);
        m.edge.id == a.id && m.setDatas(w);
        n.edge.id == d.id && n.setDatas(z);
        f.nextLeftEdge = w;
        f.leftFace = A;
        g.nextLeftEdge = u;
        g.leftFace = B;
        k.nextLeftEdge = z;
        k.leftFace = C;
        e.nextLeftEdge = s;
        e.leftFace = D;
        if (a.isConstrained) {
            b = a.fromConstraintSegments;
            w.fromConstraintSegments = b.slice(0);
            x.fromConstraintSegments = w.fromConstraintSegments;
            y.fromConstraintSegments = b.slice(0);
            z.fromConstraintSegments = y.fromConstraintSegments;
            c = 0;
            for (l = a.fromConstraintSegments.length; c < l;) m = c++, m = a.fromConstraintSegments[m].edges, h = m.indexOf(a), -1 != h ? m.splice(h, 1, w, y) : m.splice(m.indexOf(d), 1, z, x);
            r.fromConstraintSegments = b.slice(0)
        }
        this._edges.splice(this._edges.indexOf(a),
        1);
        this._edges.splice(this._edges.indexOf(d), 1);
        a.dispose();
        d.dispose();
        this._faces.splice(this._faces.indexOf(p), 1);
        this._faces.splice(this._faces.indexOf(q), 1);
        p.dispose();
        q.dispose();
        this.__centerVertex = r;
        this.__edgesToCheck.push(f);
        this.__edgesToCheck.push(g);
        this.__edgesToCheck.push(k);
        this.__edgesToCheck.push(e);
        return r
    },
    splitFace: function(a, b, c) {
        this.__edgesToCheck.splice(0, this.__edgesToCheck.length);
        var d = a.edge,
            e = d.nextLeftEdge,
            f = e.nextLeftEdge,
            g = d.originVertex,
            k = e.originVertex,
            l = f.originVertex,
            m = new Vertex,
            h = new Edge,
            n = new Edge,
            p = new Edge,
            q = new Edge,
            r = new Edge,
            s = new Edge,
            t = new Face,
            u = new Face,
            v = new Face;
        this._vertices.push(m);
        this._edges.push(h);
        this._edges.push(n);
        this._edges.push(p);
        this._edges.push(q);
        this._edges.push(r);
        this._edges.push(s);
        this._faces.push(t);
        this._faces.push(u);
        this._faces.push(v);
        m.setDatas(n);
        m.pos.x = b;
        m.pos.y = c;
        h.setDatas(g, n, s, v);
        n.setDatas(m, h, d, t);
        p.setDatas(k, q, n, t);
        q.setDatas(m, p, e, u);
        r.setDatas(l, s, q, u);
        s.setDatas(m,
        r, f, v);
        t.setDatas(n);
        u.setDatas(q);
        v.setDatas(s);
        d.nextLeftEdge = p;
        d.leftFace = t;
        e.nextLeftEdge = r;
        e.leftFace = u;
        f.nextLeftEdge = h;
        f.leftFace = v;
        this._faces.splice(this._faces.indexOf(a), 1);
        a.dispose();
        this.__centerVertex = m;
        this.__edgesToCheck.push(d);
        this.__edgesToCheck.push(e);
        this.__edgesToCheck.push(f);
        return m
    },
    restoreAsDelaunay: function() {
        for (var a; 0 < this.__edgesToCheck.length;) a = this.__edgesToCheck.shift(), !a.isReal || a.isConstrained || Geom2D.isDelaunay(a) || (a.nextLeftEdge.destinationVertex.id == this.__centerVertex.id ? (this.__edgesToCheck.push(a.nextRightEdge), this.__edgesToCheck.push(a.prevRightEdge)) : (this.__edgesToCheck.push(a.nextLeftEdge), this.__edgesToCheck.push(a.prevLeftEdge)), this.flipEdge(a))
    },
    deleteVertex: function(a) {
        var b, c = new FromVertexToOutgoingEdges;
        c.fromVertex = a;
        c.realEdgesOnly = !1;
        var d, e = [];
        b = 0 == a.fromConstraintSegments.length ? !0 : !1;
        var f = [],
            g = !1,
            k = !1,
            l = [],
            m = [];
        if (b) for (; null != (d = c.next());) e.push(d), f.push(d.nextLeftEdge);
        else {
            l = 0;
            for (m = a.fromConstraintSegments.length; l < m;) if (g = l++, d = a.fromConstraintSegments[g].edges, d[0].originVertex.id == a.id || d[d.length - 1].destinationVertex.id == a.id) return !1;
            for (l = 0; null != (d = c.next());) if (e.push(d), d.isConstrained && (l++, 2 < l)) return !1;
            var l = [],
                m = [],
                h = c = null,
                n = new Edge,
                p = new Edge;
            this._edges.push(n);
            this._edges.push(p);
            g = 0;
            for (k = e.length; g < k;) d = g++, d = e[d], d.isConstrained ? null == c ? (p.setDatas(d.destinationVertex, n, null, null, !0, !0), l.push(n), l.push(d.nextLeftEdge), m.push(p), c = d) : null == h && (n.setDatas(d.destinationVertex, p,
            null, null, !0, !0), m.push(d.nextLeftEdge), h = d) : null == c ? m.push(d.nextLeftEdge) : null == h ? l.push(d.nextLeftEdge) : m.push(d.nextLeftEdge);
            g = c.leftFace.isReal;
            k = h.leftFace.isReal;
            n.fromConstraintSegments = c.fromConstraintSegments.slice(0);
            p.fromConstraintSegments = n.fromConstraintSegments;
            for (var q, r = 0, s = a.fromConstraintSegments.length; r < s;) d = r++, d = a.fromConstraintSegments[d].edges, q = d.indexOf(c), -1 != q ? d.splice(q - 1, 2, n) : d.splice(d.indexOf(h) - 1, 2, p)
        }
        c = 0;
        for (h = e.length; c < h;) n = c++, d = e[n], n = d.leftFace, this._faces.splice(this._faces.indexOf(n),
        1), n.dispose(), d.destinationVertex.edge = d.nextLeftEdge, this._edges.splice(this._edges.indexOf(d.oppositeEdge), 1), d.oppositeEdge.dispose(), this._edges.splice(this._edges.indexOf(d), 1), d.dispose();
        this._vertices.splice(this._vertices.indexOf(a), 1);
        a.dispose();
        b ? this.triangulate(f, !0) : (this.triangulate(l, g), this.triangulate(m, k));
        return !0
    },
    untriangulate: function(a) {
        for (var b = new Dictionary(1), c, d = 0, e = a.length; d < e;) {
            var f = d++;
            c = a[f];
            null == b.get(c.originVertex) && (c.originVertex.edge = c.prevLeftEdge.oppositeEdge,
            b.set(c.originVertex, !0));
            null == b.get(c.destinationVertex) && (c.destinationVertex.edge = c.nextLeftEdge, b.set(c.destinationVertex, !0));
            this._faces.splice(this._faces.indexOf(c.leftFace), 1);
            c.leftFace.dispose();
            f == a.length - 1 && (this._faces.splice(this._faces.indexOf(c.rightFace), 1), c.rightFace.dispose())
        }
        b.dispose();
        b = 0;
        for (d = a.length; b < d;) c = b++, c = a[c], this._edges.splice(this._edges.indexOf(c.oppositeEdge), 1), this._edges.splice(this._edges.indexOf(c), 1), c.oppositeEdge.dispose(), c.dispose()
    },
    triangulate: function(a,
    b) {
        if (2 > a.length) Log("BREAK ! the hole has less than 2 edges");
        else if (2 == a.length) Log("BREAK ! the hole has only 2 edges");
        else if (3 == a.length) {
            var c = new Face;
            c.setDatas(a[0], b);
            this._faces.push(c);
            a[0].leftFace = c;
            a[1].leftFace = c;
            a[2].leftFace = c;
            a[0].nextLeftEdge = a[1];
            a[1].nextLeftEdge = a[2];
            a[2].nextLeftEdge = a[0]
        } else {
            var c = a[0],
                d = c.originVertex,
                e = c.destinationVertex,
                f, g, k = new Point;
            g = f = 0;
            for (var l = !1, m = 0, h = 2, n = a.length; h < n;) {
                var p = h++;
                f = a[p].originVertex;
                if (1 == Geom2D.getRelativePosition2(f.pos,
                c)) {
                    m = p;
                    l = !0;
                    Geom2D.getCircumcenter(d.pos, e.pos, f.pos, k);
                    f = Squared(d.pos.x - k.x, d.pos.y - k.y);
                    f -= EPSILON_SQUARED;
                    for (var q = 2, r = a.length; q < r;) if (g = q++, g != p && (g = a[g].originVertex, g = Squared(g.pos.x - k.x, g.pos.y - k.y), g < f)) {
                        l = !1;
                        break
                    }
                    if (l) break
                }
            }
            l || (Log("NO DELAUNAY FOUND"), m = 2);
            k = e = l = null;
            m < a.length - 1 && (l = new Edge, e = new Edge, this._edges.push(l, e), l.setDatas(d, e, null, null, b, !1), e.setDatas(a[m].originVertex, l, null, null, b, !1), d = a.slice(m), d.push(l), this.triangulate(d, b));
            2 < m && (k = new Edge, d = new Edge, this._edges.push(k, d), k.setDatas(a[1].originVertex, d, null, null, b, !1), d.setDatas(a[m].originVertex, k, null, null, b, !1), l = a.slice(1, m), l.push(d), this.triangulate(l, b));
            d = [];
            2 == m ? d.push(c, a[1], e) : m == a.length - 1 ? d.push(c, k, a[m]) : d.push(c, k, e);
            this.triangulate(d, b)
        }
    },
    findPositionFromBounds: function(a, b) {
        return 0 >= a ? 0 >= b ? 1 : b >= this.height ? 7 : 8 : a >= this.width ? 0 >= b ? 3 : b >= this.height ? 5 : 4 : 0 >= b ? 2 : b >= this.height ? 6 : 0
    },
    compute_Data: function() {
        var a = [],
            b = [],
            c, d;
        d = new FromMeshToVertices;
        d.fromMesh = this;
        var e;
        e = new FromVertexToIncomingEdges;
        for (var f = new Dictionary(1); null != (c = d.next());) if (f.set(c, !0), this.vertexIsInsideAABB(c, this)) for (a.push(c.pos.x, c.pos.y), e.fromVertex = c; null != (c = e.next());) f.get(c.originVertex) || (b = b.concat(c.getDatas()));
        f.dispose();
        this.AR_vertex = new DDLS_ARRAY_TYPE(a);
        this.AR_edge = new DDLS_ARRAY_TYPE(b);
        this.data_edges = this.data_vertex = null
    },
    vertexIsInsideAABB: function(a, b) {
        return 0 > a.pos.x || a.pos.x > b.width || 0 > a.pos.y || a.pos.y > b.height ? !1 : !0
    }
};
Mesh.prototype.draw = function(){
    console.log('meshdraw')
    this.compute_Data();
    var edge = this.AR_edge;
    var i = edge.length;
    var n = 0;
    while(i--){
        n = i * 5;
        if(edge[n+4]) {
             window.AWEngine.ddlsRender.insertLine(edge[n], edge[n+1], edge[n+2], edge[n+3], 0,0,0);
        }else{
             window.AWEngine.ddlsRender.insertLine(edge[n], edge[n+1], edge[n+2], edge[n+3], 0.4,0.4,0.4);
        }
    }
    this.isRedraw = false;
}
export { Mesh };