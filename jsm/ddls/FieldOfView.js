import { EPSILON }  from './constants.js';
import { Squared,sin,cos,atan2,sqrt }  from './utils.js';
import { Dictionary }  from './Dictionary.js';
import { Point }  from './Point.js';
import { Geom2D }  from './Geom2D.js';
var FieldOfView = function(a, b) {
    this.entity = a || null;
    this.mesh = b || null
};
FieldOfView.prototype = {
    isInField: function(a) {
        if (this.mesh && this.entity) {
            var b = this.entity.position,
                c = this.entity.direction,
                d = a.position,
                e = this.entity.radiusFOV,
                f = this.entity.angleFOV,
                g = a.radius;
            a = Squared(b.x - d.x, b.y - d.y);
            if (a >= (e + g) * (e + g)) return !1;
            if (a < g * g) return !0;
            a = new Point;
            var k = new Point,
                l = [];
            Geom2D.intersections2Circles(b, e, d, g, l) && (a.set(l[0], l[1]), k.set(l[2], l[3]));
            e = b.clone().add(d).mul(0.5);
            if (0 == l.length || Squared(e.x - d.x, e.y - d.y) < Squared(e.x - a.x, e.y - a.y)) l.splice(0,
            l.length), Geom2D.tangentsPointToCircle(b, d, g, l), a.set(l[0], l[1]), k.set(l[2], l[3]);
            e = cos(0.5 * this.entity.angleFOV);
            d = a.clone().sub(b);
            g = sqrt(d.x * d.x + d.y * d.y);
            d = d.x / g * c.x + d.y / g * c.y > e ? !0 : !1;
            g = k.clone().sub(b);
            l = sqrt(g.x * g.x + g.y * g.y);
            e = g.x / l * c.x + g.y / l * c.y > e ? !0 : !1;
            if (!d && !e && (g = b.clone().add(c), 1 != Geom2D.getDirection(b, g, a) || -1 != Geom2D.getDirection(b, g, k))) return !1;
            d && e || (g = new Point, c = atan2(c.y, c.x), d || (d = (new Point(cos(c - 0.5 * f), sin(c - 0.5 * f))).add(b),
            Geom2D.intersections2segments(b, d, a, k, g, null, !0), a = g.clone()), e || (f = (new Point(cos(c + 0.5 * f), sin(c + 0.5 * f))).add(b), Geom2D.intersections2segments(b, f, a, k, g, null, !0), k = g.clone()));
            var f = new Dictionary,
                c = new Dictionary,
                d = [],
                e = Geom2D.locatePosition(b, this.mesh),
                m;
            2 == e.type ? m = e : 1 == e.type ? m = e.leftFace : 0 == e.type && (m = e.edge.leftFace);
            e = [];
            g = new Dictionary;
            e.push(m);
            g[m] = !0;
            var h, n, p;
            m = new Point;
            for (var l = new Point, q, r, s = [], t = []; 0 < e.length;) for (h = e.shift(),
            g.set(h, null), f.set(h, !0), h = h.edge, c.get(h) || c.get(h.oppositeEdge) || (t.push(h), c.set(h, !0)), h = h.nextLeftEdge, c.get(h) || c.get(h.oppositeEdge) || (t.push(h), c.set(h, !0)), h = h.nextLeftEdge, c.get(h) || c.get(h.oppositeEdge) || (t.push(h), c.set(h, !0)); 0 < t.length;) if (h = t.pop(), n = h.originVertex.pos, p = h.destinationVertex.pos, Geom2D.clipSegmentByTriangle(n.x, n.y, p.x, p.y, b.x, b.y, k.x, k.y, a.x, a.y, m, l)) {
                if (h.isConstrained) {
                    s.splice(0, s.length);
                    Geom2D.intersections2segments(b, m, a, k, null, s, !0);
                    Geom2D.intersections2segments(b,
                    l, a, k, null, s, !0);
                    n = s[1];
                    q = s[3];
                    q < n && (n = q, q = s[1]);
                    for (r = d.length - 1; 0 <= r && !(q >= d[r]); r--);
                    p = r + 1;
                    0 == p % 2 && d.splice(p, 0, q);
                    for (r = 0; r < d.length && !(n <= d[r]); r++);
                    q = r;
                    0 == q % 2 ? (d.splice(q, 0, n), p++) : q--;
                    d.splice(q + 1, p - q - 1);
                    if (2 == d.length && -EPSILON < d[0] && d[0] < EPSILON && 1 - EPSILON < d[1] && d[1] < 1 + EPSILON) return !1
                }
                h = h.rightFace;
                g.get(h) || f.get(h) || (e.push(h), g.set(h, !0))
            }
            return !0
        }
    }
};

export { FieldOfView };