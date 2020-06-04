import { getPixel,NodeData,EdgeData,sqrt }  from './utils.js';
import { Dictionary } from './Dictionary.js';
import { Point } from './Point.js';
import { Graph } from './Graph.js';
import { Geom2D } from './Geom2D.js';
var Potrace = {};
Potrace.MAX_INT = 2147483647;
Potrace.maxDistance = 1;

Potrace.buildShapes = function(a, b, c) {
    for (var d = [], e = new Dictionary(2), f = 1, g = a.height - 1; f < g;) for (var k = f++, l = 0, m = a.width - 1; l < m;) {
        var h = l++;
        16777215 == getPixel(a, h, k) && 16777215 > getPixel(a, h + 1, k) && (e.get(h + 1 + "_" + k) || d.push(Potrace.buildShape(a, k, h + 1, e, b, c)))
    }
    e.dispose();
    console.log("shapes done");
    return d
};
Potrace.buildShape = function(a, b, c, d, e, f) {
    e = c;
    f = b;
    var g = [e, f];
    d.set(e + "_" + f, !0);
    for (var k = new Point(0, 1), l = new Point, m, h, n = -1;;) {
        m = b + k.x + k.y;
        h = c + k.x - k.y;
        16777215 > getPixel(a, h, m) ? (l.x = -k.y, l.y = k.x) : (m = b + k.y, h = c + k.x, 16777215 > getPixel(a, h, m) ? (l.x = k.x, l.y = k.y) : (m = b, h = c, l.x = k.y, l.y = -k.x));
        e += k.x;
        f += k.y;
        if (e == g[0] && f == g[1]) break;
        else g.push(e), g.push(f), d.set(e + "_" + f, !0), b = m, c = h, k.x = l.x, k.y = l.y;
        n--;
        if (0 == n) break
    }
    console.log("shape done");
    return g
};
Potrace.buildGraph = function(a) {
    var b, c = new Graph,
        d;
    for (b = 0; b < a.length;) d = c.insertNode(), d.data = new NodeData, d.data.index = b, d.data.point = new Point(a[b], a[b + 1]), b += 2;
    var e, f, g, k = !1;
    for (a = c.node; null != a;) {
        for (b = null != a.next ? a.next : c.node; b != a;) {
            k = !0;
            e = null != a.next ? a.next : c.node;
            g = 2;
            for (d = 0; e != b;) {
                f = Geom2D.distanceSquaredPointToSegment(e.data.point, a.data.point, b.data.point);
                0 > f && (f = 0);
                if (f >= Potrace.maxDistance) {
                    k = !1;
                    break
                }
                g++;
                d += f;
                e = null != e.next ? e.next : c.node
            }
            if (!k) break;
            e = c.insertEdge(a, b);
            f = new EdgeData;
            f.sumDistancesSquared = d;
            f.length = a.data.point.distanceTo(b.data.point);
            f.nodesCount = g;
            e.data = f;
            b = null != b.next ? b.next : c.node
        }
        a = a.next
    }
    console.log("graph done");
    return c
};
Potrace.buildPolygon = function(a, b) {
    var c = [],
        d, e, f, g;
    d = 2147483647;
    var k;
    f = null;
    for (g = a.node; g.data.index < d;) {
        d = g.data.index;
        c.push(g.data.point.x);
        c.push(g.data.point.y);
        e = 0;
        for (g = g.outgoingEdge; null != g;) k = g.data.nodesCount - g.data.length * sqrt(g.data.sumDistancesSquared / g.data.nodesCount), k > e && (e = k, f = g), g = g.rotNextEdge;
        g = f.destinationNode
    }
    d = new Point(c[c.length - 2], c[c.length - 1]);
    e = new Point(c[0], c[1]);
    f = new Point(c[2], c[3]);
    0 == Geom2D.getDirection(d, e, f) && (c.shift(), c.shift());
    console.log("polygone done");
    return c
};