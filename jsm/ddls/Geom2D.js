import { POSITIVE_INFINITY,NULL,EPSILON_SQUARED,EPSILON} from './constants.js';
import { int,pow,sqrt,Squared,SquaredSqrt,Log} from './utils.js';
import { Point } from './Point.js';
import { RandGenerator } from './RandGenerator.js';
import { FromVertexToHoldingFaces } from './FromVertexTo.js';
import { FromFaceToInnerEdges } from './FromFaceTo.js';
import { Dictionary } from './Dictionary.js';
var Geom2D = {};
Geom2D.__samples = [];
Geom2D.__circumcenter = new Point;
Geom2D.locatePosition = function(a, b) {
    null == Geom2D._randGen && (Geom2D._randGen = new RandGenerator);
    Geom2D._randGen.seed = int(10 * a.x + 4 * a.y);
    var c;
    Geom2D.__samples.splice(0, Geom2D.__samples.length);
    var d = int(pow(b._vertices.length, 0.3333333333333333));
    Geom2D._randGen.rangeMin = 0;
    Geom2D._randGen.rangeMax = b._vertices.length - 1;
    for (c = d; c--;) Geom2D.__samples.push(b._vertices[Geom2D._randGen.next()]);
    for (var e, f = POSITIVE_INFINITY, g = null,
    k = 0; k < d;) c = k++, c = Geom2D.__samples[c], e = c.pos, e = Squared(e.x - a.x, e.y - a.y), e < f && (f = e, g = c);
    d = new FromVertexToHoldingFaces;
    d.fromVertex = g;
    k = d.next();
    g = new Dictionary(1);
    d = new FromFaceToInnerEdges;
    f = 0;
    for (c = Geom2D.isInFace(a, k); g.get(k) || 3 === c.type;) {
        g.set(k, !0);
        f++;
        50 == f && Log("WALK TAKE MORE THAN 50 LOOP");
        if (1E3 == f) {
            Log("WALK TAKE MORE THAN 1000 LOOP -> WE ESCAPE");
            c = {
                type: NULL
            };
            break
        }
        d.fromFace = k;
        do {
            k = d.next();
            if (null == k) return Log("KILL PATH"), null;
            c = Geom2D.getRelativePosition(a, k)
        } while (1 == c || 0 == c);
        k = k.rightFace;
        c = Geom2D.isInFace(a, k)
    }
    g.dispose();
    return c
};
Geom2D.isCircleIntersectingAnyConstraint = function(a, b, c) {
    if (0 >= a.x || a.x >= c.width || 0 >= a.y || a.y >= c.height) return !0;
    c = Geom2D.locatePosition(a, c);
    var d;
    switch (c.type) {
        case 0:
            d = c.edge.leftFace;
            break;
        case 1:
            d = c.leftFace;
            break;
        case 2:
            d = c;
            break;
        case 3:
            d = null
    }
    c = b * b;
    var e;
    e = d.edge.originVertex.pos;
    e = Squared(e.x - a.x, e.y - a.y);
    if (e <= c) return !0;
    e = d.edge.nextLeftEdge.originVertex.pos;
    e = Squared(e.x - a.x, e.y - a.y);
    if (e <= c) return !0;
    e = d.edge.nextLeftEdge.nextLeftEdge.originVertex.pos;
    e = Squared(e.x - a.x, e.y - a.y);
    if (e <= c) return !0;
    c = [];
    c.push(d.edge);
    c.push(d.edge.nextLeftEdge);
    c.push(d.edge.nextLeftEdge.nextLeftEdge);
    var f, g;
    for (e = new Dictionary(0); 0 < c.length;) if (d = c.pop(), e.set(d, !0), f = d.originVertex.pos, g = d.destinationVertex.pos, f = Geom2D.intersectionsSegmentCircle(f, g, a, b)) {
        if (d.isConstrained) return !0;
        d = d.oppositeEdge.nextLeftEdge;
        e.get(d) || e.get(d.oppositeEdge) || -1 != c.indexOf(d) || -1 != c.indexOf(d.oppositeEdge) || c.push(d);
        d = d.nextLeftEdge;
        e.get(d) || e.get(d.oppositeEdge) || -1 != c.indexOf(d) || -1 != c.indexOf(d.oppositeEdge) || c.push(d)
    }
    return !1
};
Geom2D.getDirection = function(a, b, c) {
    a = (c.x - a.x) * (b.y - a.y) + (c.y - a.y) * (-b.x + a.x);
    return 0 == a ? 0 : 0 < a ? 1 : -1
};
Geom2D.Orient2d = function(a, b, c) {
    a = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
    return a > -EPSILON_SQUARED && a < EPSILON_SQUARED ? 0 : 0 < a ? -1 : 1
};
Geom2D.getRelativePosition = function(a, b) {
    return Geom2D.getDirection(b.originVertex.pos, b.destinationVertex.pos, a)
};
Geom2D.getRelativePosition2 = function(a, b) {
    return Geom2D.Orient2d(b.originVertex.pos, b.destinationVertex.pos, a)
};
Geom2D.isInFace = function(a, b) {
    var c = {
        type: NULL
    }, d = b.edge,
        e = d.nextLeftEdge,
        f = e.nextLeftEdge;
    if (0 <= Geom2D.getRelativePosition(a, d) && 0 <= Geom2D.getRelativePosition(a, e) && 0 <= Geom2D.getRelativePosition(a, f)) var c = d.originVertex,
        g = e.originVertex,
        k = f.originVertex,
        l = c.pos.x,
        m = c.pos.y,
        h = g.pos.x,
        n = g.pos.y,
        p = k.pos.x,
        q = k.pos.y,
        r = Squared(l - a.x, m - a.y),
        s = Squared(h - a.x, n - a.y),
        t = Squared(p - a.x, q - a.y),
        u = 1 / Squared(h - l, n - m),
        v = 1 / Squared(p - h, q - n),
        w = 1 / Squared(l - p, m - q),
        x = (a.x - l) * (h - l) + (a.y - m) * (n - m),
        h = (a.x - h) * (p - h) + (a.y - n) * (q - n),
        l = (a.x - p) * (l - p) + (a.y - q) * (m - q),
        s = s - h * h * v <= EPSILON_SQUARED ? !0 : !1,
        t = t - l * l * w <= EPSILON_SQUARED ? !0 : !1,
        c = r - x * x * u <= EPSILON_SQUARED ? t ? c : s ? g : d : s ? t ? k : e : t ? f : b;
    return c
};
Geom2D.clipSegmentByTriangle = function(a, b, c, d, e, f, g) {
    var k = Geom2D.getDirection(c, d, a),
        l = Geom2D.getDirection(c, d, b);
    if (0 >= k && 0 >= l) return !1;
    var m = Geom2D.getDirection(d, e, a),
        h = Geom2D.getDirection(d, e, b);
    if (0 >= m && 0 >= h) return !1;
    var n = Geom2D.getDirection(e, c, a),
        p = Geom2D.getDirection(e, c, b);
    if (0 >= n && 0 >= p) return !1;
    if (0 <= k && 0 <= m && 0 <= n && 0 <= l && 0 <= h && 0 <= p) return a.clone(), b.clone(), !0;
    var q = 0;
    Geom2D.intersections2segments(a, b, c, d, f, null) && q++;
    0 == q ? Geom2D.intersections2segments(a,
    b, d, e, f, null) && q++ : Geom2D.intersections2segments(a, b, d, e, g, null) && (-0.01 > f.x - g.x || f.x - g.x > EPSILON || -EPSILON > f.y - g.y || f.y - g.y > EPSILON) && q++;
    0 == q ? Geom2D.intersections2segments(a, b, e, c, f, null) && q++ : 1 == q && Geom2D.intersections2segments(a, b, e, c, g, null) && (-EPSILON > f.x - g.x || f.x - g.x > EPSILON || -EPSILON > f.y - g.y || f.y - g.y > EPSILON) && q++;
    1 == q && (0 <= k && 0 <= m && 0 <= n ? a.clone() : 0 <= l && 0 <= h && 0 <= p ? b.clone() : q = 0);
    return 0 < q ? !0 : !1
};
Geom2D.isDelaunay = function(a) {
    var b = a.nextLeftEdge.destinationVertex,
        c = a.nextRightEdge.destinationVertex;
    Geom2D.getCircumcenter(b.pos, a.originVertex.pos, a.destinationVertex.pos, Geom2D.__circumcenter);
    return (c.pos.x - Geom2D.__circumcenter.x) * (c.pos.x - Geom2D.__circumcenter.x) + (c.pos.y - Geom2D.__circumcenter.y) * (c.pos.y - Geom2D.__circumcenter.y) >= (b.pos.x - Geom2D.__circumcenter.x) * (b.pos.x - Geom2D.__circumcenter.x) + (b.pos.y - Geom2D.__circumcenter.y) * (b.pos.y - Geom2D.__circumcenter.y) ? !0 : !1
};
Geom2D.getCircumcenter = function(a, b, c, d) {
    null == d && (d = new Point);
    var e = 0.5 * (a.x + b.x),
        f = 0.5 * (a.y + b.y);
    c = (e * (a.x - c.x) + (f - 0.5 * (a.y + c.y)) * (a.y - c.y) + 0.5 * (a.x + c.x) * (c.x - a.x)) / (a.x * (c.y - b.y) + b.x * (a.y - c.y) + c.x * (b.y - a.y));
    d.x = e + c * (b.y - a.y);
    d.y = f - c * (b.x - a.x);
    return d
};
Geom2D.intersections2segments = function(a, b, c, d, e, f, g) {
    null == g && (g = !1);
    var k = 0,
        l = 0,
        m, h = (a.x - b.x) * (c.y - d.y) + (b.y - a.y) * (c.x - d.x);
    0 == h ? m = !1 : (m = !0, h = 1 / h, g && null == e && null == f || (k = (a.x * (c.y - d.y) + a.y * (d.x - c.x) + c.x * d.y - c.y * d.x) * h, l = (a.x * (c.y - b.y) + a.y * (b.x - c.x) - b.x * c.y + b.y * c.x) * h, g || 0 <= k && 1 >= k && 0 <= l && 1 >= l || (m = !1)));
    m && (null != e && (e.x = a.x + k * (b.x - a.x), e.y = a.y + k * (b.y - a.y)), null != f && f.push(k, l));
    return m
};
Geom2D.intersections2edges = function(a, b, c, d, e) {
    null == e && (e = !1);
    return Geom2D.intersections2segments(a.originVertex.pos, a.destinationVertex.pos, b.originVertex.pos, b.destinationVertex.pos, c, d, e)
};
Geom2D.isConvex = function(a) {
    var b = !0,
        c, d;
    c = a.nextLeftEdge.oppositeEdge;
    d = a.nextRightEdge.destinationVertex; - 1 != Geom2D.getRelativePosition(d.pos, c) ? b = !1 : (c = a.prevRightEdge, d = a.prevLeftEdge.originVertex, -1 != Geom2D.getRelativePosition(d.pos, c) && (b = !1));
    return b
};
Geom2D.projectOrthogonaly = function(a, b) {
    var c = b.originVertex.pos.x,
        d = b.originVertex.pos.y,
        e = b.destinationVertex.pos.x,
        f = b.destinationVertex.pos.y,
        g = a.x,
        k = a.y,
        g = (c * c - c * e - c * g + d * d - d * f - d * k + e * g + f * k) / (c * c - 2 * c * e + d * d - 2 * d * f + e * e + f * f);
    a.x = c + g * (e - c);
    a.y = d + g * (f - d)
};
Geom2D.intersections2Circles = function(a, b, c, d, e) {
    var f, g;
    g = Squared(c.x - a.x, c.y - a.y);
    f = 1 / (2 * g);
    return (a.x != c.x || a.y != c.y) && g <= (b + d) * (b + d) && g >= (b - d) * (b - d) ? (g = sqrt(((b + d) * (b + d) - g) * (g - (d - b) * (d - b))), f = c.clone().sub(a).mul(f), a = a.clone().add(c).mul(0.5), b = f.clone().mul(b * b - d * d), b = a.clone().add(b), null != e && e.push(b.x + f.y * g, b.y - f.x * g, b.x - f.y * g, b.y + f.x * g), !0) : !1
};
Geom2D.intersectionsSegmentCircle = function(a, b, c, d, e) {
    var f = a.x * a.x,
        g = a.y * a.y,
        k = b.y * b.y - 2 * b.y * a.y + g + b.x * b.x - 2 * b.x * a.x + f,
        l = 2 * a.y * c.y - 2 * f + 2 * b.y * a.y - 2 * g + 2 * b.x * a.x - 2 * b.x * c.x + 2 * a.x * c.x - 2 * b.y * c.y;
    c = l * l - 4 * k * (g + c.y * c.y + c.x * c.x - 2 * a.y * c.y - 2 * a.x * c.x + f - d * d);
    if (0 > c) return !1;
    if (0 == c) {
        c = -l / (2 * k);
        if (0 > c || 1 < c) return !1;
        null != e && e.push(a.x + c * (b.x - a.x), a.y + c * (b.y - a.y), c);
        return !0
    }
    d = sqrt(c);
    c = (-l + d) / (2 * k);
    k = (-l - d) / (2 * k);
    l = !1;
    0 <= c && 1 >= c && (null != e && e.push(a.x + c * (b.x - a.x), a.y + c * (b.y - a.y), c), l = !0);
    0 <= k && 1 >= k && (null != e && e.push(a.x + k * (b.x - a.x), a.y + k * (b.y - a.y), k), l = !0);
    return l
};
Geom2D.tangentsPointToCircle = function(a, b, c, d) {
    var e = a.clone().add(b).mul(0.5);
    a = 0.5 * SquaredSqrt(a.x - b.x, a.y - b.y);
    return Geom2D.intersections2Circles(e, a, b, c, d)
};
Geom2D.tangentsCrossCircleToCircle = function(a, b, c, d) {
    var e = SquaredSqrt(b.x - c.x, b.y - c.y),
        f = 0.25 * e,
        g = c.clone().sub(b).mul(0.25).add(b);
    if (Geom2D.intersections2Circles(b, a, g, f, d)) {
        a = d[0];
        var f = d[1],
            g = d[2],
            k = d[3],
            l = b.clone().add(c).mul(0.5),
            m = ((a - l.x) * (c.y - b.y) + (f - l.y) * (-c.x + b.x)) / (e * e),
            e = 2 * (l.x + m * (c.y - b.y)) - a;
        b = 2 * (l.y - m * (c.x - b.x)) - f;
        d.push(e + g - a, k + b - f, e, b);
        return !0
    }
    return !1
};
Geom2D.tangentsParalCircleToCircle = function(a, b, c, d) {
    var e = 1 / SquaredSqrt(b.x - c.x, b.y - c.y),
        f = b.x + a * (c.y - b.y) * e;
    a = b.y + a * (-c.x + b.x) * e;
    var e = 2 * b.x - f,
        g = 2 * b.y - a;
    d.push(f, a, e, g, e + c.x - b.x, g + c.y - b.y, f + c.x - b.x, a + c.y - b.y)
};
Geom2D.distanceSquaredPointToSegment = function(a, b, c) {
    var d = Squared(c.x - b.x, c.y - b.y),
        e = ((a.x - b.x) * (c.x - b.x) + (a.y - b.y) * (c.y - b.y)) / d;
    return 0 > e ? Squared(a.x - b.x, a.y - b.y) : 1 >= e ? Squared(b.x - a.x, b.y - a.y) - e * e * d : Squared(a.x - c.x, a.y - c.y)
};
Geom2D.distanceSquaredVertexToEdge = function(a, b) {
    return Geom2D.distanceSquaredPointToSegment(a.pos, b.originVertex.pos, b.destinationVertex.pos)
};
Geom2D.pathLength = function(a) {
    for (var b = 0, c = a[0], d = a[1], e, f, g = 2; g < a.length;) e = a[g], f = a[g + 1], c = e - c, d = f - d, d = SquaredSqrt(c, d), b += d, c = e, d = f, g += 2;
    return b
};

export { Geom2D};