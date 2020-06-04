import { SquaredSqrt }  from './utils.js';
import { Point }  from './Point.js';
var LinearPathSampler = function() {
    this._path = this.entity = null;
    this._samplingDistance = this._samplingDistanceSquared = 1;
    this._preCompX = [];
    this._preCompY = [];
    this.pos = new Point;
    this.hasNext = this.hasPrev = !1;
    this._count = 0;
    Object.defineProperty(this, "x", {
        get: function() {
            return this.pos.x
        }
    });
    Object.defineProperty(this, "y", {
        get: function() {
            return this.pos.y
        }
    });
    Object.defineProperty(this, "countMax", {
        get: function() {
            return this._preCompX.length - 1
        }
    });
    Object.defineProperty(this, "count", {
        get: function() {
            return this._count
        },
        set: function(a) {
            this._count = a;
            0 > this._count && (this._count = 0);
            this._count > this.countMax - 1 && (this._count = this.countMax - 1);
            this.hasPrev = 0 == this._count ? !1 : !0;
            this.hasNext = this._count == this.countMax - 1 ? !1 : !0;
            this.applyLast();
            this.updateEntity()
        }
    });
    Object.defineProperty(this, "samplingDistance", {
        get: function() {
            return this._samplingDistance
        },
        set: function(a) {
            this._samplingDistance = a;
            this._samplingDistanceSquared = this._samplingDistance * this._samplingDistance
        }
    });
    Object.defineProperty(this, "path", {
        get: function() {
            return this._path
        },
        set: function(a) {
            this._path = a;
            this._preComputed = !1;
            this.reset()
        }
    })
};
LinearPathSampler.prototype = {
    dispose: function() {
        this._preCompY = this._preCompX = this._path = this.entity = null
    },
    reset: function() {
        0 < this._path.length ? (this.pos.x = this._path[0], this.pos.y = this._path[1], this._iPrev = 0, this._iNext = 2, this.hasPrev = !1, this.hasNext = !0, this._count = 0, this.updateEntity()) : (this.hasNext = this.hasPrev = !1, this._count = 0)
    },
    preCompute: function() {
        this._preCompX.splice(0, this._preCompX.length);
        this._preCompY.splice(0, this._preCompY.length);
        this._count = 0;
        this._preCompX.push(this.pos.x);
        this._preCompY.push(this.pos.y);
        for (this._preComputed = !1; this.next();) this._preCompX.push(this.pos.x), this._preCompY.push(this.pos.y);
        this.reset();
        this._preComputed = !0
    },
    prev: function() {
        if (!this.hasPrev) return !1;
        this.hasNext = !0;
        if (this._preComputed) return this._count--, 0 == this._count && (this.hasPrev = !1), this.applyLast(), this.updateEntity(), !0;
        var a, b;
        for (a = this._samplingDistance;;) if (b = SquaredSqrt(this.pos.x - this._path[this._iPrev], this.pos.y - this._path[this._iPrev + 1]), b < a) {
            if (a -= b, this._iPrev -= 2, this._iNext -= 2, 0 == this._iNext) break
        } else break;
        0 == this._iNext ? (this.pos.x = this._path[0], this.pos.y = this._path[1], this.hasPrev = !1, this._iNext = 2, this._iPrev = 0) : (this.pos.x += (this._path[this._iPrev] - this.pos.x) * a / b, this.pos.y += (this._path[this._iPrev + 1] - this.pos.y) * a / b);
        this.updateEntity();
        return !0
    },
    next: function() {
        if (!this.hasNext) return !1;
        this.hasPrev = !0;
        if (this._preComputed) return this._count++, this._count == this._preCompX.length - 1 && (this.hasNext = !1), this.applyLast(), this.updateEntity(), !0;
        var a,
        b;
        for (a = this._samplingDistance;;) if (b = SquaredSqrt(this.pos.x - this._path[this._iNext], this.pos.y - this._path[this._iNext + 1]), b < a) {
            if (a -= b, this.pos.x = this._path[this._iNext], this.pos.y = this._path[this._iNext + 1], this._iPrev += 2, this._iNext += 2, this._iNext == this._path.length) break
        } else break;
        this._iNext == this._path.length ? (this.pos.x = this._path[this._iPrev], this.pos.y = this._path[this._iPrev + 1], this.hasNext = !1, this._iNext = this._path.length - 2, this._iPrev = this._iNext - 2) : (this.pos.x += (this._path[this._iNext] - this.pos.x) * a / b, this.pos.y += (this._path[this._iNext + 1] - this.pos.y) * a / b);
        this.updateEntity();
        return !0
    },
    applyLast: function() {
        this.pos.set(this._preCompX[this._count], this._preCompY[this._count])
    },
    updateEntity: function() {
        null != this.entity && this.entity.position.copy(this.pos)
    }
};
export { LinearPathSampler };