var PathIterator = function() {
    this.entity = null;
    this.hasNext = this.hasPrev = !1;
    this._currentY = this._currentX = this.count = this.countMax = 0;
    this._path = [];
    Object.defineProperty(this, "x", {
        get: function() {
            return this._currentX
        }
    });
    Object.defineProperty(this, "y", {
        get: function() {
            return this._currentY
        }
    });
    Object.defineProperty(this, "path", {
        get: function() {
            return this._path
        },
        set: function(a) {
            this._path = a;
            this.countMax = 0.5 * this._path.length;
            this.reset()
        }
    })
};
PathIterator.prototype = {
    reset: function() {
        this.count = 0;
        this._currentX = this._path[this.count];
        this._currentY = this._path[this.count + 1];
        this.updateEntity();
        this.hasPrev = !1;
        this.hasNext = 2 < this._path.length ? !0 : !1
    },
    prev: function() {
        if (!this.hasPrev) return !1;
        this.hasNext = !0;
        this.count--;
        this._currentX = this._path[2 * this.count];
        this._currentY = this._path[2 * this.count + 1];
        this.updateEntity();
        0 == this.count && (this.hasPrev = !1);
        return !0
    },
    next: function() {
        if (!this.hasNext) return !1;
        this.hasPrev = !0;
        this.count++;
        this._currentX = this._path[2 * this.count];
        this._currentY = this._path[2 * this.count + 1];
        this.updateEntity();
        2 * (this.count + 1) == this._path.length && (this.hasNext = !1);
        return !0
    },
    updateEntity: function() {
        this.entity && (this.entity.x = this._currentX, this.entity.y = this._currentY)
    }
};
export { PathIterator };