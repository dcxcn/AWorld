import { Point } from './Point.js';
import { Matrix2D } from './Matrix2D.js';
var ObjectID = 0;
var DDLSObject = function() {
    this.id = ObjectID;
    ObjectID++;
    this._pivot = new Point;
    this._position = new Point;
    this._scale = new Point(1, 1);
    this._matrix = new Matrix2D;
    this._rotation = 0;
    this._constraintShape = null;
    this._coordinates = [];
    this.hasChanged = !1;
    Object.defineProperty(this, "rotation", {
        get: function() {
            return this._rotation
        },
        set: function(a) {
            this._rotation != a && (this._rotation = a, this.hasChanged = !0)
        }
    });
    Object.defineProperty(this, "matrix", {
        get: function() {
            return this._matrix
        },
        set: function(a) {
            this._matrix = a;
            this.hasChanged = !0
        }
    });
    Object.defineProperty(this, "coordinates", {
        get: function() {
            return this._coordinates
        },
        set: function(a) {
            this._coordinates = a;
            this.hasChanged = !0
        }
    });
    Object.defineProperty(this, "constraintShape", {
        get: function() {
            return this._constraintShape
        },
        set: function(a) {
            this._constraintShape = a;
            this.hasChanged = !0
        }
    });
    Object.defineProperty(this, "edges", {
        get: function() {
            for (var a = [], b = this._constraintShape.segments, c = b.length, d, e = 0, f = 0, g = 0, k = 0; e < c;) for (g = e++, f = 0, d = b[g].edges.length; f < d;) k = f++, a.push(b[g].edges[k]);
            return a
        }
    })
};
DDLSObject.prototype = {
    constructor: DDLSObject,
    position: function(a, b) {
        this._position.set(a, b);
        this.hasChanged = !0
    },
    scale: function(a, b) {
        this._scale.set(a, b);
        this.hasChanged = !0
    },
    pivot: function(a, b) {
        this._pivot.set(a, b);
        this.hasChanged = !0
    },
    dispose: function() {
        this._constraintShape = this._coordinates = this._matrix = null
    },
    updateValuesFromMatrix: function() {},
    updateMatrixFromValues: function() {
        this._matrix.identity().translate(this._pivot.negate()).scale(this._scale).rotate(this._rotation).translate(this._position)
    }
};
export { DDLSObject };
