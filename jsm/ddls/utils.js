export var sqrt = Math.sqrt;
export var cos = Math.cos;
export var sin = Math.sin;
export var atan2 = Math.atan2;
export var round = Math.round;
export var pow = Math.pow;
export var max = Math.max;
export var min = Math.min;
export var random = Math.random;
export var lerp = function(a, b, c) {
    return a + (b - a) * c
};
export var rand = function(a, b) {
    return lerp(a, b,  random())
};
export var randInt = function(a, b, c) {
    return 1 *  lerp(a, b, random()).toFixed(c || 0)
};

export var isFinite = function(a) {
    return isFinite(a)
};
export var isNaN = function(a) {
    return isNaN(a)
};
export var int = function(a) {
    return parseInt(a)
};
export var fix = function(a, b) {
    return 1 * a.toFixed(b || 3)
};

var DDLS_ARRAY_TYPE;
DDLS_ARRAY_TYPE || (DDLS_ARRAY_TYPE = "undefined" !== typeof Float32Array ? Float32Array : Array);
export { DDLS_ARRAY_TYPE };
export var Log = function(a) {
    console.log(a)
};
export var Squared = function(a, b) {
    return a * a + b * b
};
export var SquaredSqrt = function(a, b) {
    return sqrt(a * a + b * b)
};
export var PixelsData = function(a, b) {
    this.length = a * b;
    this.bytes = new DDLS_ARRAY_TYPE(this.length << 2);
    this.width = a;
    this.height = b
};
export var fromImageData = function(a) {
    var b = new PixelsData(a.width, a.height);
    a = a.data;
    for (var c = a.byteLength, d = 0, e = 0; d < c;) e = d++, b.bytes[e] = a[e] & 255;
    return b
};

export var EdgeData = function() {};
export var NodeData = function() {};

export var getPixel = function(a, b, c) {
    c = c * a.width + b << 2;
    b = a.bytes[c + 3];
    a = "0x" + ("000000" + (a.bytes[c + 0] << 16 | a.bytes[c + 1] << 8 | a.bytes[c + 2]).toString(16)).slice(-6);
    0 == b && (a = 16777215);
    return a
};