import { Point } from './Point.js';
import { Geom2D } from './Geom2D.js';
var ShapeSimplifier = function(a, b) {
    b = b || 1;
    var c = a.length;
    if (4 >= c) return [].concat(a);
    for (var d = a[0], e = a[1], f = a[c - 2], g = a[c - 1], k = -1, l = 0, m = 1, c = c >> 1; m < c;) {
        var h = m++,
            n = Geom2D.distanceSquaredPointToSegment(new Point(a[h << 1], a[(h << 1) + 1]), new Point(d, e), new Point(f, g));
        n > l && (l = n, k = h)
    }
    return l > b * b ? (d = a.slice(0, (k << 1) + 2), k = a.slice(k << 1), d = ShapeSimplifier(d, b), k = ShapeSimplifier(k, b), d.slice(0, d.length - 2).concat(k)) : [d, e, f, g]
};

export { ShapeSimplifier };