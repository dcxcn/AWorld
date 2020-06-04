import { round } from  './utils.js';
var RandGenerator = function(a, b, c) {
    this.rangeMin = b || 0;
    this.rangeMax = c || 1;
    this._originalSeed = this._currSeed = a || 1234;
    this._numIter = 0;
    Object.defineProperty(this, "seed", {
        get: function() {
            return this._originalSeed
        },
        set: function(a) {
            this._originalSeed = this._currSeed = a
        }
    })
};
RandGenerator.prototype = {
    constructor: RandGenerator,
    reset: function() {
        this._currSeed = this._originalSeed;
        this._numIter = 0
    },
    next: function() {
        var a = 1 * this._currSeed;
        for (this._tempString = (a * a).toString(); 8 > this._tempString.length;) this._tempString = "0" + this._tempString;
        this._currSeed = parseInt(this._tempString.substr(1, 5));
        a = round(this.rangeMin + this._currSeed / 99999 * (this.rangeMax - this.rangeMin));
        0 == this._currSeed && (this._currSeed = this._originalSeed + this._numIter);
        this._numIter++;
        200 == this._numIter && this.reset();
        return a
    },
    nextInRange: function(a, b) {
        this.rangeMin = a;
        this.rangeMax = b;
        return this.next()
    },
    shuffle: function(a) {
        for (var b = a.length; 0 < b;) {
            var c = this.nextInRange(0, b - 1);
            b--;
            var d = a[b];
            a[b] = a[c];
            a[c] = d
        }
    }
};

export { RandGenerator };