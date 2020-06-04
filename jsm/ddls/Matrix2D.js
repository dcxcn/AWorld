import { DDLS_ARRAY_TYPE }  from './constants.js';
var Matrix2D = function(a, b, c, d, e, f) {
    this.n = new DDLS_ARRAY_TYPE(6);
    this.n[0] = a || 1;
    this.n[1] = b || 0;
    this.n[2] = c || 0;
    this.n[3] = d || 1;
    this.n[4] = e || 0;
    this.n[5] = f || 0
};
Matrix2D.prototype = {
    constructor: Matrix2D,
    identity: function() {
        this.n[0] = 1;
        this.n[1] = 0;
        this.n[2] = 0;
        this.n[3] = 1;
        this.n[4] = 0;
        this.n[5] = 0;
        return this
    },
    translate: function(a) {
        this.n[4] += a.x;
        this.n[5] += a.y;
        return this
    },
    scale: function(a) {
        this.n[0] *= a.x;
        this.n[1] *= a.y;
        this.n[2] *= a.x;
        this.n[3] *= a.y;
        this.n[4] *= a.x;
        this.n[5] *= a.y;
        return this
    },
    rotate: function(a) {
        var b = this.n[0],
            c = this.n[1],
            d = this.n[2],
            e = this.n[3],
            f = this.n[4],
            g = this.n[5],
            k = Math.sin(a);
        a = Math.cos(a);
        this.n[0] = b * a + c * k;
        this.n[1] = -b * k + c * a;
        this.n[2] = d * a + e * k;
        this.n[3] = -d * k + a * e;
        this.n[4] = a * f + k * g;
        this.n[5] = a * g - k * f;
        return this
    },
    clone: function() {
        return new Matrix2D(this.n[0], this.n[1], this.n[2], this.n[3], this.n[4], this.n[5])
    },
    tranform: function(a) {
        var b = this.n[1] * a.x + this.n[3] * a.y + this.n[5];
        a.x = this.n[0] * a.x + this.n[2] * a.y + this.n[4];
        a.y = b
    },
    transformX: function(a, b) {
        return this.n[0] * a + this.n[2] * b + this.n[4]
    },
    transformY: function(a, b) {
        return this.n[1] * a + this.n[3] * b + this.n[5]
    },
    concat: function(a) {
        var b = this.n[0] * a.n[1] + this.n[1] * a.n[3],
            c = this.n[2] * a.n[0] + this.n[3] * a.n[2],
            d = this.n[2] * a.n[1] + this.n[3] * a.n[3],
            e = this.n[4] * a.n[0] + this.n[5] * a.n[2] + a.n[4],
            f = this.n[4] * a.n[1] + this.n[5] * a.n[3] + a.n[5];
        this.n[0] = this.n[0] * a.n[0] + this.n[1] * a.n[2];
        this.n[1] = b;
        this.n[2] = c;
        this.n[3] = d;
        this.n[4] = e;
        this.n[5] = f;
        return this
    }
};

export { Matrix2D };