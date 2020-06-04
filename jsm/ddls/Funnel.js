import { TwoPI }  from './constants.js';
import {max,cos,sin,Squared,Log,fix,sqrt }  from './utils.js';
import { Dictionary } from './Dictionary.js';
import { Point } from './Point.js';
import { Geom2D } from './Geom2D.js';
var Funnel = function() {
    this._currPoolPointsIndex = 0;
    this._poolPointsSize = 3E3;
    this._numSamplesCircle = 16;
    this._radius = this._radiusSquared = 0;
    this._poolPoints = [];
    for (var a = this._poolPointsSize, b = 0; b < a;) b++, this._poolPoints.push(new Point);
    Object.defineProperty(this, "radius", {
        get: function() {
            return this._radius
        },
        set: function(a) {
            this._radius = max(0, a);
            this._radiusSquared = this._radius * this._radius;
            this._sampleCircle = [];
            if (0 != this._radius) {
                a = this._numSamplesCircle;
                for (var b = 0, e; b < a;) e = b++, e = -TwoPI * e / this._numSamplesCircle, this._sampleCircle.push(new Point(this._radius * cos(e), this._radius * sin(e)));
                this._sampleCircleDistanceSquared = Squared(this._sampleCircle[0].x - this._sampleCircle[1].x, this._sampleCircle[0].y - this._sampleCircle[1].y)
            }
        }
    })
};
Funnel.prototype = {
    dispose: function() {
        this._sampleCircle = null
    },
    getPoint: function(a, b) {
        this.__point = this._poolPoints[this._currPoolPointsIndex];
        this.__point.set(a || 0, b || 0);
        this._currPoolPointsIndex++;
        this._currPoolPointsIndex == this._poolPointsSize && (this._poolPoints.push(new Point), this._poolPointsSize++);
        return this.__point
    },
    getCopyPoint: function(a) {
        return this.getPoint(a.x, a.y)
    },
    findPath: function(a, b, c, d, e) {
        var f = 1.01 * this._radius;
        this._currPoolPointsIndex = 0;
        if (0 < this._radius) {
            var g = c[0],
                k, l, m;
            l = g.edge.originVertex.pos;
            m = g.edge.destinationVertex.pos;
            g = g.edge.nextLeftEdge.destinationVertex.pos;
            k = Squared(l.x - a.x, l.y - a.y);
            k <= this._radiusSquared ? (k = sqrt(k), a.sub(l).div(k).mul(f).add(l)) : (k = Squared(m.x - a.x, m.y - a.y), k <= this._radiusSquared ? (k = sqrt(k), a.sub(m).div(k).mul(f).add(m)) : (k = Squared(g.x - a.x, g.y - a.y), k <= this._radiusSquared && (k = sqrt(k), a.sub(g).div(k).mul(f).add(g))));
            g = c[c.length - 1];
            l = g.edge.originVertex.pos;
            m = g.edge.destinationVertex.pos;
            g = g.edge.nextLeftEdge.destinationVertex.pos;
            k = Squared(l.x - b.x, l.y - b.y);
            k <= this._radiusSquared ? (k = sqrt(k), b.sub(l).div(k).mul(f).add(l)) : (k = Squared(m.x - b.x, m.y - b.y), k <= this._radiusSquared ? (k = sqrt(k), b.sub(m).div(k).mul(f).add(m)) : (k = Squared(g.x - b.x, g.y - b.y), k <= this._radiusSquared && (k = sqrt(k), b.sub(g).div(k).mul(f).add(g))))
        }
        var h;
        h = a.clone();
        f = b.clone();
        if (1 == c.length) e.push(fix(h.x)), e.push(fix(h.y)), e.push(fix(f.x)), e.push(fix(f.y));
        else {
            var n = null,
                p = null;
            d[0] == Geom2D.isInFace(a, c[0]) && (d.shift(), c.shift());
			if(d.length==0) return;
            m = [];
            g = [];
            m.push(h);
            g.push(h);
            var q = new Dictionary(1);
            k = [];
            c = new Dictionary(0);
            l = new Dictionary(0);
            c.set(h, 0);
            var n = d[0],
                r = Geom2D.getRelativePosition2(a, n),
                s, t;
            s = this.getCopyPoint(n.destinationVertex.pos);
            t = this.getCopyPoint(n.originVertex.pos);
            k.push(s);
            k.push(t);
            l.set(h, s);
            l.set(s, t);
            a = t;
            1 == r ? (c.set(s, 1), c.set(t, -1), q.set(n.destinationVertex, 1), q.set(n.originVertex, -1)) : -1 == r && (c.set(s, -1), c.set(t, 1), q.set(n.destinationVertex, -1), q.set(n.originVertex, 1));
            r = d[0].originVertex;
            s = d[0].destinationVertex;
            t = 1;
            for (var u = d.length; t < u;) n = t++, n = d[n], n.originVertex == r ? p = n.destinationVertex : n.destinationVertex == r ? p = n.originVertex : n.originVertex == s ? (p = n.destinationVertex, r = s) : n.destinationVertex == s ? (p = n.originVertex, r = s) : Log("IMPOSSIBLE TO IDENTIFY THE VERTEX !!!"), s = this.getCopyPoint(p.pos), k.push(s), n = -q.get(r), c.set(s, n), l.set(a, s), q.set(p, n), a = s, s = r, r = p;
            l.set(a, f);
            c.set(f, 0);
            d = [];
            p = new Dictionary(1);
            d.push(h);
            p.set(h, 0);
            q = 0;
            for (a = k.length; q < a;) if (h = q++, s = k[h], -1 == c.get(s)) {
                for (h = m.length - 2; 0 <= h;) {
                    n = Geom2D.getDirection(m[h], m[h + 1], s);
                    if (-1 != n) {
                        m.shift();
                        for (n = 0; n < h;) n++, d.push(m[0]), p.set(m[0], 1), m.shift();
                        d.push(m[0]);
                        p.set(m[0], 1);
                        g.splice(0, g.length);
                        g.push(m[0]);
                        g.push(s);
                        break
                    }
                    h--
                }
                g.push(s);
                for (h = g.length - 3; 0 <= h;) {
                    n = Geom2D.getDirection(g[h], g[h + 1], s);
                    if (-1 == n) break;
                    else g.splice(h + 1, 1);
                    h--
                }
            } else {
                for (h = g.length - 2; 0 <= h;) {
                    n = Geom2D.getDirection(g[h], g[h + 1], s);
                    if (1 != n) {
                        g.shift();
                        for (n = 0; n < h;) n++, d.push(g[0]), p.set(g[0], -1), g.shift();
                        d.push(g[0]);
                        p.set(g[0], -1);
                        m.splice(0, m.length);
                        m.push(g[0]);
                        m.push(s);
                        break
                    }
                    h--
                }
                m.push(s);
                for (h = m.length - 3; 0 <= h;) {
                    n = Geom2D.getDirection(m[h], m[h + 1], s);
                    if (1 == n) break;
                    else m.splice(h + 1, 1);
                    h--
                }
            }
            k = !1;
            for (h = g.length - 2; 0 <= h;) {
                n = Geom2D.getDirection(g[h], g[h + 1], b);
                if (1 != n) {
                    g.shift();
                    k = 0;
                    for (h += 1; k < h;) k++, d.push(g[0]), p.set(g[0], -1), g.shift();
                    d.push(f);
                    p.set(f, 0);
                    k = !0;
                    break
                }
                h--
            }
            if (!k) for (h = m.length - 2; 0 <= h;) {
                n = Geom2D.getDirection(m[h], m[h + 1], b);
                if (-1 != n) {
                    m.shift();
                    b = 0;
                    for (g = h + 1; b < g;) b++, d.push(m[0]),
                    p.set(m[0], 1), m.shift();
                    d.push(f);
                    p.set(f, 0);
                    k = !0;
                    break
                }
                h--
            }
            k || (d.push(f), p.set(f, 0));
            b = [];
            if (0 < this._radius) {
                m = [];
                if (2 == d.length) this.adjustWithTangents(d[0], !1, d[1], !1, c, l, m, b);
                else if (2 < d.length) {
                    this.adjustWithTangents(d[0], !1, d[1], !0, c, l, m, b);
                    if (3 < d.length) for (g = 1, k = d.length - 3 + 1; g < k;) h = g++, this.adjustWithTangents(d[h], !0, d[h + 1], !0, c, l, m, b);
                    g = d.length;
                    this.adjustWithTangents(d[g - 2], !0, d[g - 1], !1, c, l, m, b)
                }
                m.push(f);
                this.checkAdjustedPath(m, b, c);
                l = [];
                for (f = m.length - 2; 1 <= f;) {
                    for (this.smoothAngle(b[2 * f - 1], m[f], b[2 * f], c.get(m[f]), l); 0 != l.length;) b.splice(2 * f, 0, l.pop());
                    f--
                }
            } else b = d;
            l = 0;
            for (c = b.length; l < c;) f = l++, e.push(fix(b[f].x)), e.push(fix(b[f].y))
        }
    },
    adjustWithTangents: function(a, b, c, d, e, f, g, k) {
        var l = [],
            m = e.get(a),
            h = e.get(c),
            n = null,
            p = null;
        if (b || d) if (b) if (d) if (1 == m && 1 == h) Geom2D.tangentsParalCircleToCircle(this._radius, a, c, l), n = this.getPoint(l[2], l[3]), p = this.getPoint(l[4], l[5]);
        else if (-1 == m && -1 == h) Geom2D.tangentsParalCircleToCircle(this._radius, a, c, l), n = this.getPoint(l[0],
        l[1]), p = this.getPoint(l[6], l[7]);
        else if (1 == m && -1 == h) if (Geom2D.tangentsCrossCircleToCircle(this._radius, a, c, l)) n = this.getPoint(l[2], l[3]), p = this.getPoint(l[6], l[7]);
        else {
            Log("NO TANGENT, points are too close for radius");
            return
        } else if (Geom2D.tangentsCrossCircleToCircle(this._radius, a, c, l)) n = this.getPoint(l[0], l[1]), p = this.getPoint(l[4], l[5]);
        else {
            Log("NO TANGENT, points are too close for radius");
            return
        } else if (Geom2D.tangentsPointToCircle(c, a, this._radius, l)) 0 < l.length && (n = 1 == m ? this.getPoint(l[0], l[1]) : this.getPoint(l[2], l[3]), p = c);
        else {
            Log("NO TANGENT");
            return
        } else if (Geom2D.tangentsPointToCircle(a, c, this._radius, l)) 1 == h ? (n = a, p = this.getPoint(l[2], l[3])) : (n = a, p = this.getPoint(l[0], l[1]));
        else {
            Log("NO TANGENT");
            return
        } else n = a, p = c;
        for (l = f.get(a); l != c;) {
            m = Geom2D.distanceSquaredPointToSegment(l, n, p);
            if (m < this._radiusSquared) {
                this.adjustWithTangents(a, b, l, !0, e, f, g, k);
                this.adjustWithTangents(l, !0, c, d, e, f, g, k);
                return
            }
            l = f.get(l)
        }
        k.push(n);
        k.push(p);
        g.push(a)
    },
    checkAdjustedPath: function(a, b, c) {
        for (var d = !0, e, f, g, k, l, m, h, n = [], p = null, q = null; d;) for (var d = !1, r = 2; r < a.length;) k = a[r], l = c.get(k), e = a[r - 1], g = c.get(e), e = a[r - 2], f = c.get(e), g == l && (g = b[2 * (r - 2)], m = b[2 * (r - 1) - 1], h = b[2 * (r - 1)], g = (g.x - m.x) * (h.x - m.x) + (g.y - m.y) * (h.y - m.y), 0 < g && (2 == r ? (Geom2D.tangentsPointToCircle(e, k, this._radius, n), 1 == l ? (p = e, q = this.getPoint(n[2], n[3])) : (p = e, q = this.getPoint(n[0], n[1]))) : r == a.length - 1 ? (Geom2D.tangentsPointToCircle(k, e, this._radius, n), p = 1 == f ? this.getPoint(n[0], n[1]) : this.getPoint(n[2],
        n[3]), q = k) : 1 == f && -1 == l ? (Geom2D.tangentsCrossCircleToCircle(this._radius, e, k, n), p = this.getPoint(n[2], n[3]), q = this.getPoint(n[6], n[7])) : -1 == f && 1 == l ? (Geom2D.tangentsCrossCircleToCircle(this._radius, e, k, n), p = this.getPoint(n[0], n[1]), q = this.getPoint(n[4], n[5])) : 1 == f && 1 == l ? (Geom2D.tangentsParalCircleToCircle(this._radius, e, k, n), p = this.getPoint(n[2], n[3]), q = this.getPoint(n[4], n[5])) : -1 == f && -1 == l && (Geom2D.tangentsParalCircleToCircle(this._radius, e, k, n), p = this.getPoint(n[0], n[1]), q = this.getPoint(n[6],
        n[7])), b.splice(2 * (r - 2), 1, p), b.splice(2 * r - 1, 1, q), a.splice(r - 1, 1), b.splice(2 * (r - 1) - 1, 2), n.splice(0, n.length), r--)), r++
    },
    smoothAngle: function(a, b, c, d, e) {
        var f = Geom2D.getDirection(a, b, c);
        if (!(Squared(a.x - c.x, a.y - c.y) <= this._sampleCircleDistanceSquared)) {
            for (var g = 0, k, l, m, h, n = 0, p = this._numSamplesCircle; n < p;) {
                k = n++;
                m = !1;
                h = b.clone().add(this._sampleCircle[k]);
                k = Geom2D.getDirection(a, b, h);
                l = Geom2D.getDirection(b, c, h);
                if (1 == d) if (-1 == f) - 1 == k && -1 == l && (m = !0);
                else {
                    if (-1 == k || -1 == l) m = !0
                } else if (1 == f) 1 == k && 1 == l && (m = !0);
                else if (1 == k || 1 == l) m = !0;
                m ? (e.splice(g, 0, h), g++) : g = 0
            } - 1 == d && e.reverse()
        }
    }
};

export { Funnel };