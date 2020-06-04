export var VERTEX = 0;
export var EDGE = 1;
export var FACE = 2;
export var NULL = 3;

export var EPSILON = 0.01;
export var EPSILON_SQUARED = 1E-4;
export var PI = 3.141592653589793;
export var TwoPI = 6.283185307179586;
export var PI90 = 1.570796326794896;
export var PI270 = 4.712388980384689;
export var NaN = Number.NaN;
export var NEGATIVE_INFINITY = -Infinity;
export var POSITIVE_INFINITY = Infinity;
var DDLS_ARRAY_TYPE;
DDLS_ARRAY_TYPE || (DDLS_ARRAY_TYPE = "undefined" !== typeof Float32Array ? Float32Array : Array);
export { DDLS_ARRAY_TYPE };
