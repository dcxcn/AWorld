var Dictionary = function(a, b) {
    this.type = a || 0;
    0 == this.type ? (this.k = [], this.v = []) : this.h = {}
};
Dictionary.prototype = {
    set: function(a, b) {
        2 == this.type ? this.h[a] = b : 1 == this.type ? this.h[a.id] = b : (this.k.push(a), this.v.push(b))
    },
    get: function(a) {
        if (2 == this.type) return this.h[a];
        if (1 == this.type) return this.h[a.id];
        a = this.k.indexOf(a);
        if (-1 != a) return this.v[a]
    },
    dispose: function() {
        if (0 == this.type) {
            for (; 0 < this.k.length;) this.k.pop();
            for (; 0 < this.v.length;) this.v.pop();
            this.v = this.k = null
        } else this.h = null
    }
};
export { Dictionary };