import { sqrt } from './utils.js';
var Point = function(a, b) {
    this.x = a || 0;
    this.y = b || 0;
    return this
};
Point.prototype = {
    constructor: Point,
    transform: function(a) {
        a.tranform(this);
        return this
    },
    set: function(a, b) {
        this.x = a;
        this.y = b;
        return this
    },
    copy: function(a) {
        this.x = a.x;
        this.y = a.y;
        return this
    },
    clone: function() {
        return new Point(this.x, this.y)
    },
    sub: function(a) {
        this.x -= a.x;
        this.y -= a.y;
        return this
    },
    mul: function(a) {
        this.x *= a;
        this.y *= a;
        return this
    },
    add: function(a) {
        this.x += a.x;
        this.y += a.y;
        return this
    },
    div: function(a) {
        a = 1 / a;
        this.x *= a;
        this.y *= a;
        return this
    },
    negate: function() {
        return new Point(-this.x, -this.y)
    },
    transformMat2D: function(a) {
        var b = this.x,
            c = this.y;
        a = a.n;
        this.x = a[0] * b + a[2] * c + a[4];
        this.y = a[1] * b + a[3] * c + a[5];
        return this
    },
    get_length: function() {
        return sqrt(this.x * this.x + this.y * this.y)
    },
    normalize: function() {
        var a = this.get_length();
        this.x /= a;
        this.y /= a;
        return a
    },
    distanceTo: function(a) {
        var b = this.x - a.x;
        a = this.y - a.y;
        return sqrt(b * b + a * a)
    },
    distanceSquaredTo: function(a) {
        var b = this.x - a.x;
        a = this.y - a.y;
        return b * b + a * a
    },
    equals: function(a) {
        return this.x === a.x && this.y === a.y
    }
};

export { Point };