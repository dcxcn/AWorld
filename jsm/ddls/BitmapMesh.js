import { Potrace } from './Potrace.js';
import { ShapeSimplifier } from './ShapeSimplifier.js';
import { RectMesh } from './RectMesh.js';
var BitmapMesh = {};
BitmapMesh.buildFromBmpData = function(a, b, c, d) {
    b = b || 1;
    c = Potrace.buildShapes(a, c, d);
    if (1 <= b) for (var e = 0, f = c.length; e < f;) {
        var g = e++;
        c[g] = ShapeSimplifier(c[g], b)
    }
    b = [];
    e = 0;
    for (f = c.length; e < f;) g = e++, b.push(Potrace.buildGraph(c[g]));
    c = [];
    e = 0;
    for (f = b.length; e < f;) g = e++, c.push(Potrace.buildPolygon(b[g], d));
    d = RectMesh(a.width, a.height);
    b = 0;
    for (e = c.length; b < e;) {
        f = b++;
        for (a = 0; a < c[f].length - 2;) d.insertConstraintSegment(c[f][a], c[f][a + 1], c[f][a + 2], c[f][a + 3]), a += 2;
        d.insertConstraintSegment(c[f][a],
        c[f][a + 1], c[f][a + 2], c[f][a + 3])
    }
    return d
};
export { BitmapMesh };