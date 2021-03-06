import * as THREE from '../../jsm/libs/three.module.js';

var DDLS = DDLS || {};
DDLS.SegmentID = 0;
DDLS.ShapeID = 0;
DDLS.EdgeID = 0;
DDLS.FaceID = 0;
DDLS.MeshID = 0;
DDLS.ObjectID = 0;
DDLS.VertexID = 0;
DDLS.GraphID = 0;
DDLS.GraphEdgeID = 0;
DDLS.GraphNodeID = 0;
DDLS.VERTEX = 0;
DDLS.EDGE = 1;
DDLS.FACE = 2;
DDLS.NULL = 3;
DDLS.sqrt = Math.sqrt;
DDLS.cos = Math.cos;
DDLS.sin = Math.sin;
DDLS.atan2 = Math.atan2;
DDLS.round = Math.round;
DDLS.pow = Math.pow;
DDLS.max = Math.max;
DDLS.min = Math.min;
DDLS.random = Math.random;
DDLS.lerp = function(a, b, c) {
    return a + (b - a) * c
};
DDLS.rand = function(a, b) {
    return DDLS.lerp(a, b, DDLS.random())
};
DDLS.randInt = function(a, b, c) {
    return 1 * DDLS.lerp(a, b, DDLS.random()).toFixed(c || 0)
};
DDLS.EPSILON = 0.01;
DDLS.EPSILON_SQUARED = 1E-4;
DDLS.PI = 3.141592653589793;
DDLS.TwoPI = 6.283185307179586;
DDLS.PI90 = 1.570796326794896;
DDLS.PI270 = 4.712388980384689;
DDLS.NaN = Number.NaN;
DDLS.NEGATIVE_INFINITY = -Infinity;
DDLS.POSITIVE_INFINITY = Infinity;
DDLS.isFinite = function(a) {
    return isFinite(a)
};
DDLS.isNaN = function(a) {
    return isNaN(a)
};
DDLS.int = function(a) {
    return parseInt(a)
};
DDLS.fix = function(a, b) {
    return 1 * a.toFixed(b || 3)
};
var DDLS_ARRAY_TYPE;
DDLS_ARRAY_TYPE || (DDLS_ARRAY_TYPE = "undefined" !== typeof Float32Array ? Float32Array : Array);
DDLS.Log = function(a) {
    console.log(a)
};
DDLS.Dictionary = function(a, b) {
    this.type = a || 0;
    0 == this.type ? (this.k = [], this.v = []) : this.h = {}
};
DDLS.Dictionary.prototype = {
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
DDLS.Point = function(a, b) {
    this.x = a || 0;
    this.y = b || 0;
    return this
};
DDLS.Point.prototype = {
    constructor: DDLS.Point,
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
        return new DDLS.Point(this.x, this.y)
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
        return new DDLS.Point(-this.x, -this.y)
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
        return DDLS.sqrt(this.x * this.x + this.y * this.y)
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
        return DDLS.sqrt(b * b + a * a)
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
DDLS.Matrix2D = function(a, b, c, d, e, f) {
    this.n = new DDLS_ARRAY_TYPE(6);
    this.n[0] = a || 1;
    this.n[1] = b || 0;
    this.n[2] = c || 0;
    this.n[3] = d || 1;
    this.n[4] = e || 0;
    this.n[5] = f || 0
};
DDLS.Matrix2D.prototype = {
    constructor: DDLS.Matrix2D,
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
        return new DDLS.Matrix2D(this.n[0], this.n[1], this.n[2], this.n[3], this.n[4], this.n[5])
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
DDLS.RandGenerator = function(a, b, c) {
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
DDLS.RandGenerator.prototype = {
    constructor: DDLS.RandGenerator,
    reset: function() {
        this._currSeed = this._originalSeed;
        this._numIter = 0
    },
    next: function() {
        var a = 1 * this._currSeed;
        for (this._tempString = (a * a).toString(); 8 > this._tempString.length;) this._tempString = "0" + this._tempString;
        this._currSeed = parseInt(this._tempString.substr(1, 5));
        a = DDLS.round(this.rangeMin + this._currSeed / 99999 * (this.rangeMax - this.rangeMin));
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
DDLS.Edge = function() {
    this.type = DDLS.EDGE;
    this.id = DDLS.EdgeID;
    DDLS.EdgeID++;
    this.fromConstraintSegments = [];
    this.isReal = this.isConstrained = !1;
    this.leftFace = this.nextLeftEdge = this.oppositeEdge = this.originVertex = null;
    Object.defineProperty(this, "destinationVertex", {
        get: function() {
            return this.oppositeEdge.originVertex
        }
    });
    Object.defineProperty(this, "nextRightEdge", {
        get: function() {
            return this.oppositeEdge.nextLeftEdge.nextLeftEdge.oppositeEdge
        }
    });
    Object.defineProperty(this, "prevRightEdge", {
        get: function() {
            return this.oppositeEdge.nextLeftEdge.oppositeEdge
        }
    });
    Object.defineProperty(this, "prevLeftEdge", {
        get: function() {
            return this.nextLeftEdge.nextLeftEdge
        }
    });
    Object.defineProperty(this, "rotLeftEdge", {
        get: function() {
            return this.nextLeftEdge.nextLeftEdge.oppositeEdge
        }
    });
    Object.defineProperty(this, "rotRightEdge", {
        get: function() {
            return this.oppositeEdge.nextLeftEdge
        }
    });
    Object.defineProperty(this, "rightFace", {
        get: function() {
            return this.oppositeEdge.leftFace
        }
    })
};
DDLS.Edge.prototype = {
    constructor: DDLS.Edge,
    setDatas: function(a, b, c, d, e, f) {
        this.isConstrained = void 0 !== e ? f : !1;
        this.isReal = void 0 !== e ? e : !0;
        this.originVertex = a;
        this.oppositeEdge = b;
        this.nextLeftEdge = c;
        this.leftFace = d
    },
    getDatas: function() {
        return [this.originVertex.pos.x, this.originVertex.pos.y, this.destinationVertex.pos.x, this.destinationVertex.pos.y, this.isConstrained ? 1 : 0]
    },
    addFromConstraintSegment: function(a) {
        -1 == this.fromConstraintSegments.indexOf(a) && this.fromConstraintSegments.push(a)
    },
    removeFromConstraintSegment: function(a) {
        a = this.fromConstraintSegments.indexOf(a); - 1 != a && this.fromConstraintSegments.splice(a, 1)
    },
    dispose: function() {
        this.fromConstraintSegments = this.leftFace = this.nextLeftEdge = this.oppositeEdge = this.originVertex = null
    },
    toString: function() {
        return "edge " + this.originVertex.id + " - " + this.destinationVertex.id
    }
};
DDLS.Face = function() {
    this.type = DDLS.FACE;
    this.id = DDLS.FaceID;
    DDLS.FaceID++;
    this.isReal = !1;
    this.edge = null
};
DDLS.Face.prototype = {
    constructor: DDLS.Face,
    setDatas: function(a, b) {
        this.isReal = void 0 !== b ? b : !0;
        this.edge = a
    },
    dispose: function() {
        this.edge = null
    }
};
DDLS.Vertex = function() {
    this.type = DDLS.VERTEX;
    this.id = DDLS.VertexID;
    DDLS.VertexID++;
    this.pos = new DDLS.Point;
    this.fromConstraintSegments = [];
    this.edge = null;
    this.isReal = !1
};
DDLS.Vertex.prototype = {
    constructor: DDLS.Vertex,
    setDatas: function(a, b) {
        this.isReal = void 0 !== b ? b : !0;
        this.edge = a
    },
    addFromConstraintSegment: function(a) {
        -1 == this.fromConstraintSegments.indexOf(a) && this.fromConstraintSegments.push(a)
    },
    removeFromConstraintSegment: function(a) {
        a = this.fromConstraintSegments.indexOf(a); - 1 != a && this.fromConstraintSegments.splice(a, 1)
    },
    dispose: function() {
        this.fromConstraintSegments = this.edge = this.pos = null
    },
    toString: function() {
        return "ver_id " + this.id
    }
};
DDLS.Object = function() {
    this.id = DDLS.ObjectID;
    DDLS.ObjectID++;
    this._pivot = new DDLS.Point;
    this._position = new DDLS.Point;
    this._scale = new DDLS.Point(1, 1);
    this._matrix = new DDLS.Matrix2D;
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
DDLS.Object.prototype = {
    constructor: DDLS.Object,
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
DDLS.Segment = function(a, b) {
    this.id = DDLS.SegmentID;
    DDLS.SegmentID++;
    this.edges = [];
    this.fromShape = null
};
DDLS.Segment.prototype = {
    constructor: DDLS.Segment,
    addEdge: function(a) {
        -1 == this.edges.indexOf(a) && -1 == this.edges.indexOf(a.oppositeEdge) && this.edges.push(a)
    },
    removeEdge: function(a) {
        var b = this.edges.indexOf(a); - 1 == b && (b = this.edges.indexOf(a.oppositeEdge)); - 1 != b && this.edges.splice(b, 1)
    },
    dispose: function() {
        this.fromShape = this.edges = null
    },
    toString: function() {
        return "seg_id " + this.id
    }
};
DDLS.Shape = function() {
    this.id = DDLS.ShapeID;
    DDLS.ShapeID++;
    this.segments = []
};
DDLS.Shape.prototype = {
    constructor: DDLS.Shape,
    dispose: function() {
        for (; 0 < this.segments.length;) this.segments.pop().dispose();
        this.segments = null
    }
};
DDLS.FromEdgeToRotatedEdges = function() {};
DDLS.FromFaceToInnerVertices = function() {
    Object.defineProperty(this, "fromFace", {
        set: function(a) {
            this._fromFace = a;
            this._nextEdge = this._fromFace.edge
        }
    })
};
DDLS.FromFaceToInnerVertices.prototype = {
    next: function() {
        null != this._nextEdge ? (this._resultVertex = this._nextEdge.originVertex, this._nextEdge = this._nextEdge.nextLeftEdge, this._nextEdge == this._fromFace.edge && (this._nextEdge = null)) : this._resultVertex = null;
        return this._resultVertex
    }
};
DDLS.FromFaceToInnerEdges = function() {
    Object.defineProperty(this, "fromFace", {
        set: function(a) {
            this._fromFace = a;
            this._nextEdge = this._fromFace.edge
        }
    })
};
DDLS.FromFaceToInnerEdges.prototype = {
    next: function() {
        null != this._nextEdge ? (this._resultEdge = this._nextEdge, this._nextEdge = this._nextEdge.nextLeftEdge, this._nextEdge == this._fromFace.edge && (this._nextEdge = null)) : this._resultEdge = null;
        return this._resultEdge
    }
};
DDLS.FromFaceToNeighbourFaces = function() {
    Object.defineProperty(this, "fromFace", {
        set: function(a) {
            this._fromFace = a;
            this._nextEdge = this._fromFace.edge
        }
    })
};
DDLS.FromFaceToNeighbourFaces.prototype = {
    next: function() {
        if (null != this._nextEdge) {
            do if (this._resultFace = this._nextEdge.rightFace, this._nextEdge = this._nextEdge.nextLeftEdge, this._nextEdge == this._fromFace.edge) {
                this._nextEdge = null;
                this._resultFace.isReal || (this._resultFace = null);
                break
            }
            while (!this._resultFace.isReal)
        } else this._resultFace = null;
        return this._resultFace
    }
};
DDLS.FromMeshToVertices = function() {
    Object.defineProperty(this, "fromMesh", {
        set: function(a) {
            this._fromMesh = a;
            this._currIndex = 0
        }
    })
};
DDLS.FromMeshToVertices.prototype = {
    next: function() {
        do if (this._currIndex < this._fromMesh._vertices.length) this._resultVertex = this._fromMesh._vertices[this._currIndex], this._currIndex++;
        else {
            this._resultVertex = null;
            break
        }
        while (!this._resultVertex.isReal);
        return this._resultVertex
    }
};
DDLS.FromMeshToFaces = function() {
    Object.defineProperty(this, "fromMesh", {
        set: function(a) {
            this._fromMesh = a;
            this._currIndex = 0
        }
    })
};
DDLS.FromMeshToFaces.prototype = {
    next: function() {
        do if (this._currIndex < this._fromMesh._faces.length) this._resultFace = this._fromMesh._faces[this._currIndex], this._currIndex++;
        else {
            this._resultFace = null;
            break
        }
        while (!this._resultFace.isReal);
        return this._resultFace
    }
};
DDLS.FromVertexToHoldingFaces = function() {
    Object.defineProperty(this, "fromVertex", {
        set: function(a) {
            this._fromVertex = a;
            this._nextEdge = this._fromVertex.edge
        }
    })
};
DDLS.FromVertexToHoldingFaces.prototype = {
    next: function() {
        if (null != this._nextEdge) {
            do if (this._resultFace = this._nextEdge.leftFace, this._nextEdge = this._nextEdge.rotLeftEdge, this._nextEdge == this._fromVertex.edge) {
                this._nextEdge = null;
                this._resultFace.isReal || (this._resultFace = null);
                break
            }
            while (!this._resultFace.isReal)
        } else this._resultFace = null;
        return this._resultFace
    }
};
DDLS.FromVertexToIncomingEdges = function() {
    Object.defineProperty(this, "fromVertex", {
        set: function(a) {
            this._fromVertex = a;
            for (this._nextEdge = this._fromVertex.edge; !this._nextEdge.isReal;) this._nextEdge = this._nextEdge.rotLeftEdge
        }
    })
};
DDLS.FromVertexToIncomingEdges.prototype = {
    next: function() {
        if (null != this._nextEdge) {
            this._resultEdge = this._nextEdge.oppositeEdge;
            do if (this._nextEdge = this._nextEdge.rotLeftEdge, this._nextEdge == this._fromVertex.edge) {
                this._nextEdge = null;
                break
            }
            while (!this._nextEdge.isReal)
        } else this._resultEdge = null;
        return this._resultEdge
    }
};
DDLS.FromVertexToOutgoingEdges = function() {
    this.realEdgesOnly = !0;
    Object.defineProperty(this, "fromVertex", {
        set: function(a) {
            this._fromVertex = a;
            this._nextEdge = this._fromVertex.edge;
            if (null != this._nextEdge) for (; this.realEdgesOnly && !this._nextEdge.isReal;) this._nextEdge = this._nextEdge.rotLeftEdge
        }
    })
};
DDLS.FromVertexToOutgoingEdges.prototype = {
    next: function() {
        if (null != this._nextEdge) {
            this._resultEdge = this._nextEdge;
            do if (this._nextEdge = this._nextEdge.rotLeftEdge, this._nextEdge == this._fromVertex.edge) {
                this._nextEdge = null;
                break
            }
            while (this.realEdgesOnly && !this._nextEdge.isReal)
        } else this._resultEdge = null;
        return this._resultEdge
    }
};
DDLS.FromVertexToNeighbourVertices = function() {
    Object.defineProperty(this, "fromVertex", {
        set: function(a) {
            this._fromVertex = a;
            this._nextEdge = this._fromVertex.edge
        }
    })
};
DDLS.FromVertexToNeighbourVertices.prototype = {
    next: function() {
        if (null != this._nextEdge) {
            this._resultVertex = this._nextEdge.destinationVertex;
            do this._nextEdge = this._nextEdge.rotLeftEdge;
            while (!this._nextEdge.isReal);
            this._nextEdge == this._fromVertex.edge && (this._nextEdge = null)
        } else this._resultVertex = null;
        return this._resultVertex
    }
};
DDLS.Squared = function(a, b) {
    return a * a + b * b
};
DDLS.SquaredSqrt = function(a, b) {
    return DDLS.sqrt(a * a + b * b)
};
DDLS.Geom2D = {};
DDLS.Geom2D.__samples = [];
DDLS.Geom2D.__circumcenter = new DDLS.Point;
DDLS.Geom2D.locatePosition = function(a, b) {
    null == DDLS.Geom2D._randGen && (DDLS.Geom2D._randGen = new DDLS.RandGenerator);
    DDLS.Geom2D._randGen.seed = DDLS.int(10 * a.x + 4 * a.y);
    var c;
    DDLS.Geom2D.__samples.splice(0, DDLS.Geom2D.__samples.length);
    var d = DDLS.int(DDLS.pow(b._vertices.length, 0.3333333333333333));
    DDLS.Geom2D._randGen.rangeMin = 0;
    DDLS.Geom2D._randGen.rangeMax = b._vertices.length - 1;
    for (c = d; c--;) DDLS.Geom2D.__samples.push(b._vertices[DDLS.Geom2D._randGen.next()]);
    for (var e, f = DDLS.POSITIVE_INFINITY, g = null,
    k = 0; k < d;) c = k++, c = DDLS.Geom2D.__samples[c], e = c.pos, e = DDLS.Squared(e.x - a.x, e.y - a.y), e < f && (f = e, g = c);
    d = new DDLS.FromVertexToHoldingFaces;
    d.fromVertex = g;
    k = d.next();
    g = new DDLS.Dictionary(1);
    d = new DDLS.FromFaceToInnerEdges;
    f = 0;
    for (c = DDLS.Geom2D.isInFace(a, k); g.get(k) || 3 === c.type;) {
        g.set(k, !0);
        f++;
        50 == f && DDLS.Log("WALK TAKE MORE THAN 50 LOOP");
        if (1E3 == f) {
            DDLS.Log("WALK TAKE MORE THAN 1000 LOOP -> WE ESCAPE");
            c = {
                type: DDLS.NULL
            };
            break
        }
        d.fromFace = k;
        do {
            k = d.next();
            if (null == k) return DDLS.Log("KILL PATH"), null;
            c = DDLS.Geom2D.getRelativePosition(a, k)
        } while (1 == c || 0 == c);
        k = k.rightFace;
        c = DDLS.Geom2D.isInFace(a, k)
    }
    g.dispose();
    return c
};
DDLS.Geom2D.isCircleIntersectingAnyConstraint = function(a, b, c) {
    if (0 >= a.x || a.x >= c.width || 0 >= a.y || a.y >= c.height) return !0;
    c = DDLS.Geom2D.locatePosition(a, c);
    var d;
    switch (c.type) {
        case 0:
            d = c.edge.leftFace;
            break;
        case 1:
            d = c.leftFace;
            break;
        case 2:
            d = c;
            break;
        case 3:
            d = null
    }
    c = b * b;
    var e;
    e = d.edge.originVertex.pos;
    e = DDLS.Squared(e.x - a.x, e.y - a.y);
    if (e <= c) return !0;
    e = d.edge.nextLeftEdge.originVertex.pos;
    e = DDLS.Squared(e.x - a.x, e.y - a.y);
    if (e <= c) return !0;
    e = d.edge.nextLeftEdge.nextLeftEdge.originVertex.pos;
    e = DDLS.Squared(e.x - a.x, e.y - a.y);
    if (e <= c) return !0;
    c = [];
    c.push(d.edge);
    c.push(d.edge.nextLeftEdge);
    c.push(d.edge.nextLeftEdge.nextLeftEdge);
    var f, g;
    for (e = new DDLS.Dictionary(0); 0 < c.length;) if (d = c.pop(), e.set(d, !0), f = d.originVertex.pos, g = d.destinationVertex.pos, f = DDLS.Geom2D.intersectionsSegmentCircle(f, g, a, b)) {
        if (d.isConstrained) return !0;
        d = d.oppositeEdge.nextLeftEdge;
        e.get(d) || e.get(d.oppositeEdge) || -1 != c.indexOf(d) || -1 != c.indexOf(d.oppositeEdge) || c.push(d);
        d = d.nextLeftEdge;
        e.get(d) || e.get(d.oppositeEdge) || -1 != c.indexOf(d) || -1 != c.indexOf(d.oppositeEdge) || c.push(d)
    }
    return !1
};
DDLS.Geom2D.getDirection = function(a, b, c) {
    a = (c.x - a.x) * (b.y - a.y) + (c.y - a.y) * (-b.x + a.x);
    return 0 == a ? 0 : 0 < a ? 1 : -1
};
DDLS.Geom2D.Orient2d = function(a, b, c) {
    a = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
    return a > -DDLS.EPSILON_SQUARED && a < DDLS.EPSILON_SQUARED ? 0 : 0 < a ? -1 : 1
};
DDLS.Geom2D.getRelativePosition = function(a, b) {
    return DDLS.Geom2D.getDirection(b.originVertex.pos, b.destinationVertex.pos, a)
};
DDLS.Geom2D.getRelativePosition2 = function(a, b) {
    return DDLS.Geom2D.Orient2d(b.originVertex.pos, b.destinationVertex.pos, a)
};
DDLS.Geom2D.isInFace = function(a, b) {
    var c = {
        type: DDLS.NULL
    }, d = b.edge,
        e = d.nextLeftEdge,
        f = e.nextLeftEdge;
    if (0 <= DDLS.Geom2D.getRelativePosition(a, d) && 0 <= DDLS.Geom2D.getRelativePosition(a, e) && 0 <= DDLS.Geom2D.getRelativePosition(a, f)) var c = d.originVertex,
        g = e.originVertex,
        k = f.originVertex,
        l = c.pos.x,
        m = c.pos.y,
        h = g.pos.x,
        n = g.pos.y,
        p = k.pos.x,
        q = k.pos.y,
        r = DDLS.Squared(l - a.x, m - a.y),
        s = DDLS.Squared(h - a.x, n - a.y),
        t = DDLS.Squared(p - a.x, q - a.y),
        u = 1 / DDLS.Squared(h - l, n - m),
        v = 1 / DDLS.Squared(p - h, q - n),
        w = 1 / DDLS.Squared(l - p, m - q),
        x = (a.x - l) * (h - l) + (a.y - m) * (n - m),
        h = (a.x - h) * (p - h) + (a.y - n) * (q - n),
        l = (a.x - p) * (l - p) + (a.y - q) * (m - q),
        s = s - h * h * v <= DDLS.EPSILON_SQUARED ? !0 : !1,
        t = t - l * l * w <= DDLS.EPSILON_SQUARED ? !0 : !1,
        c = r - x * x * u <= DDLS.EPSILON_SQUARED ? t ? c : s ? g : d : s ? t ? k : e : t ? f : b;
    return c
};
DDLS.Geom2D.clipSegmentByTriangle = function(a, b, c, d, e, f, g) {
    var k = DDLS.Geom2D.getDirection(c, d, a),
        l = DDLS.Geom2D.getDirection(c, d, b);
    if (0 >= k && 0 >= l) return !1;
    var m = DDLS.Geom2D.getDirection(d, e, a),
        h = DDLS.Geom2D.getDirection(d, e, b);
    if (0 >= m && 0 >= h) return !1;
    var n = DDLS.Geom2D.getDirection(e, c, a),
        p = DDLS.Geom2D.getDirection(e, c, b);
    if (0 >= n && 0 >= p) return !1;
    if (0 <= k && 0 <= m && 0 <= n && 0 <= l && 0 <= h && 0 <= p) return a.clone(), b.clone(), !0;
    var q = 0;
    DDLS.Geom2D.intersections2segments(a, b, c, d, f, null) && q++;
    0 == q ? DDLS.Geom2D.intersections2segments(a,
    b, d, e, f, null) && q++ : DDLS.Geom2D.intersections2segments(a, b, d, e, g, null) && (-0.01 > f.x - g.x || f.x - g.x > DDLS.EPSILON || -DDLS.EPSILON > f.y - g.y || f.y - g.y > DDLS.EPSILON) && q++;
    0 == q ? DDLS.Geom2D.intersections2segments(a, b, e, c, f, null) && q++ : 1 == q && DDLS.Geom2D.intersections2segments(a, b, e, c, g, null) && (-DDLS.EPSILON > f.x - g.x || f.x - g.x > DDLS.EPSILON || -DDLS.EPSILON > f.y - g.y || f.y - g.y > DDLS.EPSILON) && q++;
    1 == q && (0 <= k && 0 <= m && 0 <= n ? a.clone() : 0 <= l && 0 <= h && 0 <= p ? b.clone() : q = 0);
    return 0 < q ? !0 : !1
};
DDLS.Geom2D.isDelaunay = function(a) {
    var b = a.nextLeftEdge.destinationVertex,
        c = a.nextRightEdge.destinationVertex;
    DDLS.Geom2D.getCircumcenter(b.pos, a.originVertex.pos, a.destinationVertex.pos, DDLS.Geom2D.__circumcenter);
    return (c.pos.x - DDLS.Geom2D.__circumcenter.x) * (c.pos.x - DDLS.Geom2D.__circumcenter.x) + (c.pos.y - DDLS.Geom2D.__circumcenter.y) * (c.pos.y - DDLS.Geom2D.__circumcenter.y) >= (b.pos.x - DDLS.Geom2D.__circumcenter.x) * (b.pos.x - DDLS.Geom2D.__circumcenter.x) + (b.pos.y - DDLS.Geom2D.__circumcenter.y) * (b.pos.y - DDLS.Geom2D.__circumcenter.y) ? !0 : !1
};
DDLS.Geom2D.getCircumcenter = function(a, b, c, d) {
    null == d && (d = new DDLS.Point);
    var e = 0.5 * (a.x + b.x),
        f = 0.5 * (a.y + b.y);
    c = (e * (a.x - c.x) + (f - 0.5 * (a.y + c.y)) * (a.y - c.y) + 0.5 * (a.x + c.x) * (c.x - a.x)) / (a.x * (c.y - b.y) + b.x * (a.y - c.y) + c.x * (b.y - a.y));
    d.x = e + c * (b.y - a.y);
    d.y = f - c * (b.x - a.x);
    return d
};
DDLS.Geom2D.intersections2segments = function(a, b, c, d, e, f, g) {
    null == g && (g = !1);
    var k = 0,
        l = 0,
        m, h = (a.x - b.x) * (c.y - d.y) + (b.y - a.y) * (c.x - d.x);
    0 == h ? m = !1 : (m = !0, h = 1 / h, g && null == e && null == f || (k = (a.x * (c.y - d.y) + a.y * (d.x - c.x) + c.x * d.y - c.y * d.x) * h, l = (a.x * (c.y - b.y) + a.y * (b.x - c.x) - b.x * c.y + b.y * c.x) * h, g || 0 <= k && 1 >= k && 0 <= l && 1 >= l || (m = !1)));
    m && (null != e && (e.x = a.x + k * (b.x - a.x), e.y = a.y + k * (b.y - a.y)), null != f && f.push(k, l));
    return m
};
DDLS.Geom2D.intersections2edges = function(a, b, c, d, e) {
    null == e && (e = !1);
    return DDLS.Geom2D.intersections2segments(a.originVertex.pos, a.destinationVertex.pos, b.originVertex.pos, b.destinationVertex.pos, c, d, e)
};
DDLS.Geom2D.isConvex = function(a) {
    var b = !0,
        c, d;
    c = a.nextLeftEdge.oppositeEdge;
    d = a.nextRightEdge.destinationVertex; - 1 != DDLS.Geom2D.getRelativePosition(d.pos, c) ? b = !1 : (c = a.prevRightEdge, d = a.prevLeftEdge.originVertex, -1 != DDLS.Geom2D.getRelativePosition(d.pos, c) && (b = !1));
    return b
};
DDLS.Geom2D.projectOrthogonaly = function(a, b) {
    var c = b.originVertex.pos.x,
        d = b.originVertex.pos.y,
        e = b.destinationVertex.pos.x,
        f = b.destinationVertex.pos.y,
        g = a.x,
        k = a.y,
        g = (c * c - c * e - c * g + d * d - d * f - d * k + e * g + f * k) / (c * c - 2 * c * e + d * d - 2 * d * f + e * e + f * f);
    a.x = c + g * (e - c);
    a.y = d + g * (f - d)
};
DDLS.Geom2D.intersections2Circles = function(a, b, c, d, e) {
    var f, g;
    g = DDLS.Squared(c.x - a.x, c.y - a.y);
    f = 1 / (2 * g);
    return (a.x != c.x || a.y != c.y) && g <= (b + d) * (b + d) && g >= (b - d) * (b - d) ? (g = DDLS.sqrt(((b + d) * (b + d) - g) * (g - (d - b) * (d - b))), f = c.clone().sub(a).mul(f), a = a.clone().add(c).mul(0.5), b = f.clone().mul(b * b - d * d), b = a.clone().add(b), null != e && e.push(b.x + f.y * g, b.y - f.x * g, b.x - f.y * g, b.y + f.x * g), !0) : !1
};
DDLS.Geom2D.intersectionsSegmentCircle = function(a, b, c, d, e) {
    var f = a.x * a.x,
        g = a.y * a.y,
        k = b.y * b.y - 2 * b.y * a.y + g + b.x * b.x - 2 * b.x * a.x + f,
        l = 2 * a.y * c.y - 2 * f + 2 * b.y * a.y - 2 * g + 2 * b.x * a.x - 2 * b.x * c.x + 2 * a.x * c.x - 2 * b.y * c.y;
    c = l * l - 4 * k * (g + c.y * c.y + c.x * c.x - 2 * a.y * c.y - 2 * a.x * c.x + f - d * d);
    if (0 > c) return !1;
    if (0 == c) {
        c = -l / (2 * k);
        if (0 > c || 1 < c) return !1;
        null != e && e.push(a.x + c * (b.x - a.x), a.y + c * (b.y - a.y), c);
        return !0
    }
    d = DDLS.sqrt(c);
    c = (-l + d) / (2 * k);
    k = (-l - d) / (2 * k);
    l = !1;
    0 <= c && 1 >= c && (null != e && e.push(a.x + c * (b.x - a.x), a.y + c * (b.y - a.y), c), l = !0);
    0 <= k && 1 >= k && (null != e && e.push(a.x + k * (b.x - a.x), a.y + k * (b.y - a.y), k), l = !0);
    return l
};
DDLS.Geom2D.tangentsPointToCircle = function(a, b, c, d) {
    var e = a.clone().add(b).mul(0.5);
    a = 0.5 * DDLS.SquaredSqrt(a.x - b.x, a.y - b.y);
    return DDLS.Geom2D.intersections2Circles(e, a, b, c, d)
};
DDLS.Geom2D.tangentsCrossCircleToCircle = function(a, b, c, d) {
    var e = DDLS.SquaredSqrt(b.x - c.x, b.y - c.y),
        f = 0.25 * e,
        g = c.clone().sub(b).mul(0.25).add(b);
    if (DDLS.Geom2D.intersections2Circles(b, a, g, f, d)) {
        a = d[0];
        var f = d[1],
            g = d[2],
            k = d[3],
            l = b.clone().add(c).mul(0.5),
            m = ((a - l.x) * (c.y - b.y) + (f - l.y) * (-c.x + b.x)) / (e * e),
            e = 2 * (l.x + m * (c.y - b.y)) - a;
        b = 2 * (l.y - m * (c.x - b.x)) - f;
        d.push(e + g - a, k + b - f, e, b);
        return !0
    }
    return !1
};
DDLS.Geom2D.tangentsParalCircleToCircle = function(a, b, c, d) {
    var e = 1 / DDLS.SquaredSqrt(b.x - c.x, b.y - c.y),
        f = b.x + a * (c.y - b.y) * e;
    a = b.y + a * (-c.x + b.x) * e;
    var e = 2 * b.x - f,
        g = 2 * b.y - a;
    d.push(f, a, e, g, e + c.x - b.x, g + c.y - b.y, f + c.x - b.x, a + c.y - b.y)
};
DDLS.Geom2D.distanceSquaredPointToSegment = function(a, b, c) {
    var d = DDLS.Squared(c.x - b.x, c.y - b.y),
        e = ((a.x - b.x) * (c.x - b.x) + (a.y - b.y) * (c.y - b.y)) / d;
    return 0 > e ? DDLS.Squared(a.x - b.x, a.y - b.y) : 1 >= e ? DDLS.Squared(b.x - a.x, b.y - a.y) - e * e * d : DDLS.Squared(a.x - c.x, a.y - c.y)
};
DDLS.Geom2D.distanceSquaredVertexToEdge = function(a, b) {
    return DDLS.Geom2D.distanceSquaredPointToSegment(a.pos, b.originVertex.pos, b.destinationVertex.pos)
};
DDLS.Geom2D.pathLength = function(a) {
    for (var b = 0, c = a[0], d = a[1], e, f, g = 2; g < a.length;) e = a[g], f = a[g + 1], c = e - c, d = f - d, d = DDLS.SquaredSqrt(c, d), b += d, c = e, d = f, g += 2;
    return b
};
DDLS.Mesh = function(a, b) {
    this.id = DDLS.MeshID;
    DDLS.MeshID++;
    this.__objectsUpdateInProgress = !1;
    this.__centerVertex = null;
    this.width = a;
    this.height = b;
    this.clipping = !0;
    this._edges = [];
    this._faces = [];
    this._objects = [];
    this._vertices = [];
    this._constraintShapes = [];
    this.__edgesToCheck = [];
    this.AR_edge = this.AR_vertex = null;
    this.isRedraw = !0
};
DDLS.Mesh.prototype = {
    constructor: DDLS.Mesh,
    clear: function(a) {
        for (; 0 < this._vertices.length;) this._vertices.pop().dispose();
        for (this._vertices = []; 0 < this._edges.length;) this._edges.pop().dispose();
        for (this._edges = []; 0 < this._faces.length;) this._faces.pop().dispose();
        for (this._faces = []; 0 < this._constraintShapes.length;) this._constraintShapes.pop().dispose();
        this._constraintShapes = [];
        if (!a) for (; 0 < this._objects.length;) this._objects.pop().dispose();
        this._objects = [];
        this.__edgesToCheck = [];
        this.__centerVertex = [];
        this.AR_edge = this.AR_vertex = null
    },
    dispose: function() {
        for (; 0 < this._vertices.length;) this._vertices.pop().dispose();
        for (this._vertices = null; 0 < this._edges.length;) this._edges.pop().dispose();
        for (this._edges = null; 0 < this._faces.length;) this._faces.pop().dispose();
        for (this._faces = null; 0 < this._constraintShapes.length;) this._constraintShapes.pop().dispose();
        for (this._constraintShapes = null; 0 < this._objects.length;) this._objects.pop().dispose();
        this.AR_edge = this.AR_vertex = this.__centerVertex = this.__edgesToCheck = this._objects = null
    },
    get___constraintShapes: function() {
        return this._constraintShapes
    },
    buildFromRecord: function(a) {
        a = a.split(";");
        for (var b = a.length, c = 0; c < b;) this.insertConstraintSegment(parseFloat(a[c]), parseFloat(a[c + 1]), parseFloat(a[c + 2]), parseFloat(a[c + 3])), c += 4
    },
    insertObject: function(a) {
        null != a.constraintShape && this.deleteObject(a);
        var b = new DDLS.Shape,
            c, d = a.coordinates;
        a.updateMatrixFromValues();
        for (var e = a.matrix, f = new DDLS.Point, g = new DDLS.Point, k = d.length, l = 0; l < k;) f.set(d[l], d[l + 1]).transformMat2D(e),
        g.set(d[l + 2], d[l + 3]).transformMat2D(e), c = this.insertConstraintSegment(f.x, f.y, g.x, g.y), null != c && (c.fromShape = b, b.segments.push(c)), l += 4;
        this._constraintShapes.push(b);
        a.constraintShape = b;
        this.__objectsUpdateInProgress || this._objects.push(a)
    },
    deleteObject: function(a) {
        null != a.constraintShape && (this.deleteConstraintShape(a.constraintShape), a.constraintShape = null, this.__objectsUpdateInProgress || (a = this._objects.indexOf(a), this._objects.splice(a, 1)))
    },
    updateObjects: function() {
        this.__objectsUpdateInProgress = !0;
        for (var a = this._objects.length, b = 0, c = 0; b < a;) c = b++, c = this._objects[c], c.hasChanged && (this.deleteObject(c), this.insertObject(c), c.hasChanged = !1, this.isRedraw = !0);
        this.__objectsUpdateInProgress = !1
    },
    insertConstraintShape: function(a) {
        for (var b = new DDLS.Shape, c = null, d = a.length, e = 0; e < d;) c = this.insertConstraintSegment(a[e], a[e + 1], a[e + 2], a[e + 3]), null != c && (c.fromShape = b, b.segments.push(c)), e += 4;
        this._constraintShapes.push(b);
        return b
    },
    deleteConstraintShape: function(a) {
        for (var b = 0, c = 0, d = a.segments.length; b < d;) c = b++, this.deleteConstraintSegment(a.segments[c]);
        this._constraintShapes.splice(this._constraintShapes.indexOf(a), 1);
        a.dispose()
    },
    insertConstraintSegment: function(a, b, c, d) {
        var e = a,
            f = b,
            g = c,
            k = d;
        if (a > this.width && c > this.width || 0 > a && 0 > c || b > this.height && d > this.height || 0 > b && 0 > d) return null;
        c -= a;
        d -= b;
        var l = DDLS.NEGATIVE_INFINITY,
            m = DDLS.POSITIVE_INFINITY;
        if (0 != c) var h = (0 - a) / c,
            n = (this.width - a) / c,
            l = DDLS.max(l, DDLS.min(h, n)),
            m = DDLS.min(m, DDLS.max(h, n));
        0 != d && (h = (0 - b) / d, n = (this.height - b) / d, l = DDLS.max(l, DDLS.min(h,
        n)), m = DDLS.min(m, DDLS.max(h, n)));
        if (m >= l) 1 > m && (g = c * m + a, k = d * m + b), 0 < l && (e = c * l + a, f = d * l + b);
        else return null;
        a = this.insertVertex(e, f);
        if (null == a) return null;
        g = this.insertVertex(g, k);
        if (null == g || a.id == g.id) return null;
        k = new DDLS.FromVertexToOutgoingEdges;
        b = new DDLS.Segment;
        e = new DDLS.Edge;
        f = new DDLS.Edge;
        e.setDatas(a, f, null, null, !0, !0);
        f.setDatas(g, e, null, null, !0, !0);
        f = [];
        c = [];
        d = [];
        for (var n = {
            type: 3
        }, l = new DDLS.Point, p = !1, n = a;;) if (p = !1, 0 === n.type) {
            m = n;
            for (k.fromVertex = m; null != (h = k.next());) {
                if (h.destinationVertex.id == g.id) return h.isConstrained || (h.isConstrained = !0, h.oppositeEdge.isConstrained = !0), h.addFromConstraintSegment(b), h.oppositeEdge.fromConstraintSegments = h.fromConstraintSegments, a.addFromConstraintSegment(b), g.addFromConstraintSegment(b), b.addEdge(h), b;
                if (DDLS.Geom2D.distanceSquaredVertexToEdge(h.destinationVertex, e) <= DDLS.EPSILON_SQUARED) {
                    h.isConstrained || (h.isConstrained = !0, h.oppositeEdge.isConstrained = !0);
                    h.addFromConstraintSegment(b);
                    h.oppositeEdge.fromConstraintSegments = h.fromConstraintSegments;
                    a.addFromConstraintSegment(b);
                    b.addEdge(h);
                    a = h.destinationVertex;
                    n = e.originVertex = a;
                    p = !0;
                    break
                }
            }
            if (!p) for (k.fromVertex = m; null != (h = k.next());) if (h = h.nextLeftEdge, DDLS.Geom2D.intersections2edges(h, e, l)) {
                if (h.isConstrained) {
                    a = this.splitEdge(h, l.x, l.y);
                    for (k.fromVertex = m; null != (h = k.next());) if (h.destinationVertex.id == a.id) {
                        h.isConstrained = !0;
                        h.oppositeEdge.isConstrained = !0;
                        h.addFromConstraintSegment(b);
                        h.oppositeEdge.fromConstraintSegments = h.fromConstraintSegments;
                        b.addEdge(h);
                        break
                    }
                    m.addFromConstraintSegment(b);
                    n = e.originVertex = a
                } else f.push(h), c.unshift(h.nextLeftEdge), d.push(h.prevLeftEdge), n = h = h.oppositeEdge;
                break
            }
        } else if (1 === n.type) {
            h = n;
            m = h.nextLeftEdge;
            if (m.destinationVertex.id == g.id) return c.unshift(m.nextLeftEdge), d.push(m), h = new DDLS.Edge, n = new DDLS.Edge, h.setDatas(a, n, null, null, !0, !0), n.setDatas(g, h, null, null, !0, !0), c.push(h), d.push(n), this.insertNewConstrainedEdge(b, h, f, c, d), b;
            if (DDLS.Geom2D.distanceSquaredVertexToEdge(m.destinationVertex, e) <= DDLS.EPSILON_SQUARED) c.unshift(m.nextLeftEdge), d.push(m),
            h = new DDLS.Edge, n = new DDLS.Edge, h.setDatas(a, n, null, null, !0, !0), n.setDatas(m.destinationVertex, h, null, null, !0, !0), c.push(h), d.push(n), this.insertNewConstrainedEdge(b, h, f, c, d), f.splice(0, f.length), c.splice(0, c.length), d.splice(0, d.length), a = m.destinationVertex, n = e.originVertex = a;
            else if (DDLS.Geom2D.intersections2edges(m, e, l)) if (m.isConstrained) {
                m = this.splitEdge(m, l.x, l.y);
                for (k.fromVertex = m; null != (h = k.next());) h.destinationVertex == c[0].originVertex && c.unshift(h), h.destinationVertex == d[d.length - 1].destinationVertex && d.push(h.oppositeEdge);
                h = new DDLS.Edge;
                n = new DDLS.Edge;
                h.setDatas(a, n, null, null, !0, !0);
                n.setDatas(m, h, null, null, !0, !0);
                c.push(h);
                d.push(n);
                this.insertNewConstrainedEdge(b, h, f, c, d);
                f.splice(0, f.length);
                c.splice(0, c.length);
                d.splice(0, d.length);
                a = m;
                n = e.originVertex = a
            } else f.push(m), c.unshift(m.nextLeftEdge), n = h = m.oppositeEdge;
            else if (m = m.nextLeftEdge, DDLS.Geom2D.intersections2edges(m, e, l), m.isConstrained) {
                m = this.splitEdge(m, l.x, l.y);
                for (k.fromVertex = m; null != (h = k.next());) h.destinationVertex.id == c[0].originVertex.id && c.unshift(h), h.destinationVertex.id == d[d.length - 1].destinationVertex.id && d.push(h.oppositeEdge);
                h = new DDLS.Edge;
                n = new DDLS.Edge;
                h.setDatas(a, n, null, null, !0, !0);
                n.setDatas(m, h, null, null, !0, !0);
                c.push(h);
                d.push(n);
                this.insertNewConstrainedEdge(b, h, f, c, d);
                f.splice(0, f.length);
                c.splice(0, c.length);
                d.splice(0, d.length);
                a = m;
                n = e.originVertex = a
            } else f.push(m), d.push(m.prevLeftEdge), n = h = m.oppositeEdge
        }
    },
    insertNewConstrainedEdge: function(a, b, c, d, e) {
        this._edges.push(b);
        this._edges.push(b.oppositeEdge);
        b.addFromConstraintSegment(a);
        b.oppositeEdge.fromConstraintSegments = b.fromConstraintSegments;
        a.addEdge(b);
        b.originVertex.addFromConstraintSegment(a);
        b.destinationVertex.addFromConstraintSegment(a);
        this.untriangulate(c);
        this.triangulate(d, !0);
        this.triangulate(e, !0)
    },
    deleteConstraintSegment: function(a) {
        for (var b = [], c = null, d, e = a.edges.length, f = 0; f < e;) c = f++, c = a.edges[c], c.removeFromConstraintSegment(a), 0 == c.fromConstraintSegments.length && (c.isConstrained = !1, c.oppositeEdge.isConstrained = !1), d = c.originVertex, d.removeFromConstraintSegment(a),
        b.push(d);
        d = c.destinationVertex;
        d.removeFromConstraintSegment(a);
        b.push(d);
        e = b.length;
        for (f = 0; f < e;) c = f++, this.deleteVertex(b[c]);
        a.dispose()
    },
    check: function() {
        for (var a = this._edges.length, b = 0, c; b < a;) if (c = b++, null == this._edges[c].nextLeftEdge) {
            DDLS.Log("!!! missing nextLeftEdge");
            return
        }
        DDLS.Log("check OK")
    },
    insertVertex: function(a, b) {
        if (0 > a || 0 > b || a > this.width || b > this.height) return null;
        this.__edgesToCheck.splice(0, this.__edgesToCheck.length);
        var c = DDLS.Geom2D.locatePosition(new DDLS.Point(a, b), this),
            d = null;
        switch (c.type) {
            case 0:
                d = c;
                break;
            case 1:
                d = this.splitEdge(c, a, b);
                break;
            case 2:
                d = this.splitFace(c, a, b)
        }
        this.restoreAsDelaunay();
        return d
    },
    flipEdge: function(a) {
        var b = a.oppositeEdge,
            c = new DDLS.Edge,
            d = new DDLS.Edge,
            e = a.nextLeftEdge,
            f = e.nextLeftEdge,
            g = b.nextLeftEdge,
            k = g.nextLeftEdge,
            l = a.originVertex,
            m = b.originVertex,
            h = f.originVertex,
            n = k.originVertex,
            p = a.leftFace,
            q = b.leftFace,
            r = new DDLS.Face,
            s = new DDLS.Face;
        this._edges.push(c);
        this._edges.push(d);
        this._faces.push(s);
        this._faces.push(r);
        c.setDatas(h,
        d, k, s, a.isReal, a.isConstrained);
        d.setDatas(n, c, f, r, a.isReal, a.isConstrained);
        s.setDatas(c);
        r.setDatas(d);
        m.edge.id == b.id && m.setDatas(e);
        l.edge.id == a.id && l.setDatas(g);
        e.nextLeftEdge = c;
        e.leftFace = s;
        f.nextLeftEdge = g;
        f.leftFace = r;
        g.nextLeftEdge = d;
        g.leftFace = r;
        k.nextLeftEdge = e;
        k.leftFace = s;
        this._edges.splice(this._edges.indexOf(a), 1);
        this._edges.splice(this._edges.indexOf(b), 1);
        a.dispose();
        b.dispose();
        this._faces.splice(this._faces.indexOf(p), 1);
        this._faces.splice(this._faces.indexOf(q), 1);
        p.dispose();
        q.dispose();
        return d
    },
    splitEdge: function(a, b, c) {
        this.__edgesToCheck.splice(0, this.__edgesToCheck.length);
        var d = a.oppositeEdge,
            e = a.nextLeftEdge,
            f = e.nextLeftEdge,
            g = d.nextLeftEdge,
            k = g.nextLeftEdge,
            l = f.originVertex,
            m = a.originVertex,
            h = k.originVertex,
            n = d.originVertex,
            p = a.leftFace,
            q = d.leftFace;
        if ((m.pos.x - b) * (m.pos.x - b) + (m.pos.y - c) * (m.pos.y - c) <= DDLS.EPSILON_SQUARED) return m;
        if ((n.pos.x - b) * (n.pos.x - b) + (n.pos.y - c) * (n.pos.y - c) <= DDLS.EPSILON_SQUARED) return n;
        var r = new DDLS.Vertex,
            s = new DDLS.Edge,
            t = new DDLS.Edge,
            u = new DDLS.Edge,
            v = new DDLS.Edge,
            w = new DDLS.Edge,
            x = new DDLS.Edge,
            z = new DDLS.Edge,
            y = new DDLS.Edge,
            A = new DDLS.Face,
            B = new DDLS.Face,
            C = new DDLS.Face,
            D = new DDLS.Face;
        this._vertices.push(r);
        this._edges.push(t);
        this._edges.push(s);
        this._edges.push(x);
        this._edges.push(w);
        this._edges.push(v);
        this._edges.push(u);
        this._edges.push(y);
        this._edges.push(z);
        this._faces.push(D);
        this._faces.push(C);
        this._faces.push(B);
        this._faces.push(A);
        r.setDatas(p.isReal ? t : v);
        r.pos.x = b;
        r.pos.y = c;
        DDLS.Geom2D.projectOrthogonaly(r.pos,
        a);
        t.setDatas(r, s, f, A, p.isReal);
        s.setDatas(l, t, y, D, p.isReal);
        x.setDatas(r, w, g, B, a.isReal, a.isConstrained);
        w.setDatas(m, x, t, A, a.isReal, a.isConstrained);
        v.setDatas(r, u, k, C, q.isReal);
        u.setDatas(h, v, x, B, q.isReal);
        y.setDatas(r, z, e, D, a.isReal, a.isConstrained);
        z.setDatas(n, y, v, C, a.isReal, a.isConstrained);
        A.setDatas(t, p.isReal);
        B.setDatas(x, q.isReal);
        C.setDatas(v, q.isReal);
        D.setDatas(y, p.isReal);
        m.edge.id == a.id && m.setDatas(w);
        n.edge.id == d.id && n.setDatas(z);
        f.nextLeftEdge = w;
        f.leftFace = A;
        g.nextLeftEdge = u;
        g.leftFace = B;
        k.nextLeftEdge = z;
        k.leftFace = C;
        e.nextLeftEdge = s;
        e.leftFace = D;
        if (a.isConstrained) {
            b = a.fromConstraintSegments;
            w.fromConstraintSegments = b.slice(0);
            x.fromConstraintSegments = w.fromConstraintSegments;
            y.fromConstraintSegments = b.slice(0);
            z.fromConstraintSegments = y.fromConstraintSegments;
            c = 0;
            for (l = a.fromConstraintSegments.length; c < l;) m = c++, m = a.fromConstraintSegments[m].edges, h = m.indexOf(a), -1 != h ? m.splice(h, 1, w, y) : m.splice(m.indexOf(d), 1, z, x);
            r.fromConstraintSegments = b.slice(0)
        }
        this._edges.splice(this._edges.indexOf(a),
        1);
        this._edges.splice(this._edges.indexOf(d), 1);
        a.dispose();
        d.dispose();
        this._faces.splice(this._faces.indexOf(p), 1);
        this._faces.splice(this._faces.indexOf(q), 1);
        p.dispose();
        q.dispose();
        this.__centerVertex = r;
        this.__edgesToCheck.push(f);
        this.__edgesToCheck.push(g);
        this.__edgesToCheck.push(k);
        this.__edgesToCheck.push(e);
        return r
    },
    splitFace: function(a, b, c) {
        this.__edgesToCheck.splice(0, this.__edgesToCheck.length);
        var d = a.edge,
            e = d.nextLeftEdge,
            f = e.nextLeftEdge,
            g = d.originVertex,
            k = e.originVertex,
            l = f.originVertex,
            m = new DDLS.Vertex,
            h = new DDLS.Edge,
            n = new DDLS.Edge,
            p = new DDLS.Edge,
            q = new DDLS.Edge,
            r = new DDLS.Edge,
            s = new DDLS.Edge,
            t = new DDLS.Face,
            u = new DDLS.Face,
            v = new DDLS.Face;
        this._vertices.push(m);
        this._edges.push(h);
        this._edges.push(n);
        this._edges.push(p);
        this._edges.push(q);
        this._edges.push(r);
        this._edges.push(s);
        this._faces.push(t);
        this._faces.push(u);
        this._faces.push(v);
        m.setDatas(n);
        m.pos.x = b;
        m.pos.y = c;
        h.setDatas(g, n, s, v);
        n.setDatas(m, h, d, t);
        p.setDatas(k, q, n, t);
        q.setDatas(m, p, e, u);
        r.setDatas(l, s, q, u);
        s.setDatas(m,
        r, f, v);
        t.setDatas(n);
        u.setDatas(q);
        v.setDatas(s);
        d.nextLeftEdge = p;
        d.leftFace = t;
        e.nextLeftEdge = r;
        e.leftFace = u;
        f.nextLeftEdge = h;
        f.leftFace = v;
        this._faces.splice(this._faces.indexOf(a), 1);
        a.dispose();
        this.__centerVertex = m;
        this.__edgesToCheck.push(d);
        this.__edgesToCheck.push(e);
        this.__edgesToCheck.push(f);
        return m
    },
    restoreAsDelaunay: function() {
        for (var a; 0 < this.__edgesToCheck.length;) a = this.__edgesToCheck.shift(), !a.isReal || a.isConstrained || DDLS.Geom2D.isDelaunay(a) || (a.nextLeftEdge.destinationVertex.id == this.__centerVertex.id ? (this.__edgesToCheck.push(a.nextRightEdge), this.__edgesToCheck.push(a.prevRightEdge)) : (this.__edgesToCheck.push(a.nextLeftEdge), this.__edgesToCheck.push(a.prevLeftEdge)), this.flipEdge(a))
    },
    deleteVertex: function(a) {
        var b, c = new DDLS.FromVertexToOutgoingEdges;
        c.fromVertex = a;
        c.realEdgesOnly = !1;
        var d, e = [];
        b = 0 == a.fromConstraintSegments.length ? !0 : !1;
        var f = [],
            g = !1,
            k = !1,
            l = [],
            m = [];
        if (b) for (; null != (d = c.next());) e.push(d), f.push(d.nextLeftEdge);
        else {
            l = 0;
            for (m = a.fromConstraintSegments.length; l < m;) if (g = l++, d = a.fromConstraintSegments[g].edges, d[0].originVertex.id == a.id || d[d.length - 1].destinationVertex.id == a.id) return !1;
            for (l = 0; null != (d = c.next());) if (e.push(d), d.isConstrained && (l++, 2 < l)) return !1;
            var l = [],
                m = [],
                h = c = null,
                n = new DDLS.Edge,
                p = new DDLS.Edge;
            this._edges.push(n);
            this._edges.push(p);
            g = 0;
            for (k = e.length; g < k;) d = g++, d = e[d], d.isConstrained ? null == c ? (p.setDatas(d.destinationVertex, n, null, null, !0, !0), l.push(n), l.push(d.nextLeftEdge), m.push(p), c = d) : null == h && (n.setDatas(d.destinationVertex, p,
            null, null, !0, !0), m.push(d.nextLeftEdge), h = d) : null == c ? m.push(d.nextLeftEdge) : null == h ? l.push(d.nextLeftEdge) : m.push(d.nextLeftEdge);
            g = c.leftFace.isReal;
            k = h.leftFace.isReal;
            n.fromConstraintSegments = c.fromConstraintSegments.slice(0);
            p.fromConstraintSegments = n.fromConstraintSegments;
            for (var q, r = 0, s = a.fromConstraintSegments.length; r < s;) d = r++, d = a.fromConstraintSegments[d].edges, q = d.indexOf(c), -1 != q ? d.splice(q - 1, 2, n) : d.splice(d.indexOf(h) - 1, 2, p)
        }
        c = 0;
        for (h = e.length; c < h;) n = c++, d = e[n], n = d.leftFace, this._faces.splice(this._faces.indexOf(n),
        1), n.dispose(), d.destinationVertex.edge = d.nextLeftEdge, this._edges.splice(this._edges.indexOf(d.oppositeEdge), 1), d.oppositeEdge.dispose(), this._edges.splice(this._edges.indexOf(d), 1), d.dispose();
        this._vertices.splice(this._vertices.indexOf(a), 1);
        a.dispose();
        b ? this.triangulate(f, !0) : (this.triangulate(l, g), this.triangulate(m, k));
        return !0
    },
    untriangulate: function(a) {
        for (var b = new DDLS.Dictionary(1), c, d = 0, e = a.length; d < e;) {
            var f = d++;
            c = a[f];
            null == b.get(c.originVertex) && (c.originVertex.edge = c.prevLeftEdge.oppositeEdge,
            b.set(c.originVertex, !0));
            null == b.get(c.destinationVertex) && (c.destinationVertex.edge = c.nextLeftEdge, b.set(c.destinationVertex, !0));
            this._faces.splice(this._faces.indexOf(c.leftFace), 1);
            c.leftFace.dispose();
            f == a.length - 1 && (this._faces.splice(this._faces.indexOf(c.rightFace), 1), c.rightFace.dispose())
        }
        b.dispose();
        b = 0;
        for (d = a.length; b < d;) c = b++, c = a[c], this._edges.splice(this._edges.indexOf(c.oppositeEdge), 1), this._edges.splice(this._edges.indexOf(c), 1), c.oppositeEdge.dispose(), c.dispose()
    },
    triangulate: function(a,
    b) {
        if (2 > a.length) DDLS.Log("BREAK ! the hole has less than 2 edges");
        else if (2 == a.length) DDLS.Log("BREAK ! the hole has only 2 edges");
        else if (3 == a.length) {
            var c = new DDLS.Face;
            c.setDatas(a[0], b);
            this._faces.push(c);
            a[0].leftFace = c;
            a[1].leftFace = c;
            a[2].leftFace = c;
            a[0].nextLeftEdge = a[1];
            a[1].nextLeftEdge = a[2];
            a[2].nextLeftEdge = a[0]
        } else {
            var c = a[0],
                d = c.originVertex,
                e = c.destinationVertex,
                f, g, k = new DDLS.Point;
            g = f = 0;
            for (var l = !1, m = 0, h = 2, n = a.length; h < n;) {
                var p = h++;
                f = a[p].originVertex;
                if (1 == DDLS.Geom2D.getRelativePosition2(f.pos,
                c)) {
                    m = p;
                    l = !0;
                    DDLS.Geom2D.getCircumcenter(d.pos, e.pos, f.pos, k);
                    f = DDLS.Squared(d.pos.x - k.x, d.pos.y - k.y);
                    f -= DDLS.EPSILON_SQUARED;
                    for (var q = 2, r = a.length; q < r;) if (g = q++, g != p && (g = a[g].originVertex, g = DDLS.Squared(g.pos.x - k.x, g.pos.y - k.y), g < f)) {
                        l = !1;
                        break
                    }
                    if (l) break
                }
            }
            l || (DDLS.Log("NO DELAUNAY FOUND"), m = 2);
            k = e = l = null;
            m < a.length - 1 && (l = new DDLS.Edge, e = new DDLS.Edge, this._edges.push(l, e), l.setDatas(d, e, null, null, b, !1), e.setDatas(a[m].originVertex, l, null, null, b, !1), d = a.slice(m), d.push(l), this.triangulate(d, b));
            2 < m && (k = new DDLS.Edge, d = new DDLS.Edge, this._edges.push(k, d), k.setDatas(a[1].originVertex, d, null, null, b, !1), d.setDatas(a[m].originVertex, k, null, null, b, !1), l = a.slice(1, m), l.push(d), this.triangulate(l, b));
            d = [];
            2 == m ? d.push(c, a[1], e) : m == a.length - 1 ? d.push(c, k, a[m]) : d.push(c, k, e);
            this.triangulate(d, b)
        }
    },
    findPositionFromBounds: function(a, b) {
        return 0 >= a ? 0 >= b ? 1 : b >= this.height ? 7 : 8 : a >= this.width ? 0 >= b ? 3 : b >= this.height ? 5 : 4 : 0 >= b ? 2 : b >= this.height ? 6 : 0
    },
    compute_Data: function() {
        var a = [],
            b = [],
            c, d;
        d = new DDLS.FromMeshToVertices;
        d.fromMesh = this;
        var e;
        e = new DDLS.FromVertexToIncomingEdges;
        for (var f = new DDLS.Dictionary(1); null != (c = d.next());) if (f.set(c, !0), this.vertexIsInsideAABB(c, this)) for (a.push(c.pos.x, c.pos.y), e.fromVertex = c; null != (c = e.next());) f.get(c.originVertex) || (b = b.concat(c.getDatas()));
        f.dispose();
        this.AR_vertex = new DDLS_ARRAY_TYPE(a);
        this.AR_edge = new DDLS_ARRAY_TYPE(b);
        this.data_edges = this.data_vertex = null
    },
    vertexIsInsideAABB: function(a, b) {
        return 0 > a.pos.x || a.pos.x > b.width || 0 > a.pos.y || a.pos.y > b.height ? !1 : !0
    }
};
DDLS.Graph = function() {
    this.id = DDLS.GraphID;
    DDLS.GraphID++;
    this.node = this.edge = null
};
DDLS.Graph.prototype = {
    dispose: function() {
        for (; null != this.node;) this.deleteNode(this.node)
    },
    insertNode: function() {
        var a = new DDLS.GraphNode;
        null != this.node && (a.next = this.node, this.node.prev = a);
        return this.node = a
    },
    deleteNode: function(a) {
        for (; null != a.outgoingEdge;) null != a.outgoingEdge.oppositeEdge && this.deleteEdge(a.outgoingEdge.oppositeEdge), this.deleteEdge(a.outgoingEdge);
        for (var b = this.node, c; null != b;) c = b.successorNodes.get(a), null != c && this.deleteEdge(c), b = b.next;
        this.node == a ? null != a.next ? (a.next.prev = null, this.node = a.next) : this.node = null : null != a.next ? (a.prev.next = a.next, a.next.prev = a.prev) : a.prev.next = null;
        a.dispose()
    },
    insertEdge: function(a, b) {
        if (null != a.successorNodes.get(b)) return null;
        var c = new DDLS.GraphEdge;
        null != this.edge && (this.edge.prev = c, c.next = this.edge);
        this.edge = c;
        c.sourceNode = a;
        c.destinationNode = b;
        a.successorNodes.set(b, c);
        null != a.outgoingEdge && (a.outgoingEdge.rotPrevEdge = c, c.rotNextEdge = a.outgoingEdge);
        a.outgoingEdge = c;
        var d = b.successorNodes.get(a);
        null != d && (c.oppositeEdge = d, d.oppositeEdge = c);
        return c
    },
    deleteEdge: function(a) {
        this.edge == a ? null != a.next ? (a.next.prev = null, this.edge = a.next) : this.edge = null : null != a.next ? (a.prev.next = a.next, a.next.prev = a.prev) : a.prev.next = null;
        a.sourceNode.outgoingEdge == a ? null != a.rotNextEdge ? (a.rotNextEdge.rotPrevEdge = null, a.sourceNode.outgoingEdge = a.rotNextEdge) : a.sourceNode.outgoingEdge = null : null != a.rotNextEdge ? (a.rotPrevEdge.rotNextEdge = a.rotNextEdge, a.rotNextEdge.rotPrevEdge = a.rotPrevEdge) : a.rotPrevEdge.rotNextEdge = null;
        a.dispose()
    }
};
DDLS.GraphEdge = function() {
    this.id = DDLS.GraphEdgeID;
    DDLS.GraphEdgeID++;
    this.data = this.destinationNode = this.sourceNode = this.oppositeEdge = this.rotNextEdge = this.rotPrevEdge = this.prev = this.next = null
};
DDLS.GraphEdge.prototype = {
    dispose: function() {}
};
DDLS.GraphNode = function() {
    this.id = DDLS.GraphNodeID;
    DDLS.GraphNodeID++;
    this.successorNodes = new DDLS.Dictionary(1);
    this.data = this.outgoingEdge = this.next = this.prev = null
};
DDLS.GraphNode.prototype = {
    dispose: function() {
        this.successorNodes.dispose();
        this.data = this.successorNodes = this.outgoingEdge = this.next = this.prev = null
    }
};
DDLS.fromImageData = function(a) {
    var b = new DDLS.PixelsData(a.width, a.height);
    a = a.data;
    for (var c = a.byteLength, d = 0, e = 0; d < c;) e = d++, b.bytes[e] = a[e] & 255;
    return b
};
DDLS.PixelsData = function(a, b) {
    this.length = a * b;
    this.bytes = new DDLS_ARRAY_TYPE(this.length << 2);
    this.width = a;
    this.height = b
};
DDLS.ImageLoader = function(a, b) {
    this.images = new DDLS.Dictionary(2);
    this.loaded = b;
    this.count = a.length;
    for (var c = 0; c < a.length;) {
        var d = a[c];
        ++c;
        this.load(d)
    }
};
DDLS.ImageLoader.prototype = {
    load: function(a) {
        var b;
        b = window.document.createElement("img");
        b.style.cssText = "position:absolute;";
        b.onload = function() {
            this.store(b, a.split("/").pop())
        }.bind(this);
        b.src = a
    },
    store: function(a, b) {
        this.count--;
        DDLS.Log("store " + b + " " + this.count);
        this.images.set(b, a);
        0 == this.count && this.loaded()
    }
};
DDLS.EdgeData = function() {};
DDLS.NodeData = function() {};
DDLS.Potrace = {};
DDLS.Potrace.MAX_INT = 2147483647;
DDLS.Potrace.maxDistance = 1;
DDLS.getPixel = function(a, b, c) {
    c = c * a.width + b << 2;
    b = a.bytes[c + 3];
    a = "0x" + ("000000" + (a.bytes[c + 0] << 16 | a.bytes[c + 1] << 8 | a.bytes[c + 2]).toString(16)).slice(-6);
    0 == b && (a = 16777215);
    return a
};
DDLS.Potrace.buildShapes = function(a, b, c) {
    for (var d = [], e = new DDLS.Dictionary(2), f = 1, g = a.height - 1; f < g;) for (var k = f++, l = 0, m = a.width - 1; l < m;) {
        var h = l++;
        16777215 == DDLS.getPixel(a, h, k) && 16777215 > DDLS.getPixel(a, h + 1, k) && (e.get(h + 1 + "_" + k) || d.push(DDLS.Potrace.buildShape(a, k, h + 1, e, b, c)))
    }
    e.dispose();
    console.log("shapes done");
    return d
};
DDLS.Potrace.buildShape = function(a, b, c, d, e, f) {
    e = c;
    f = b;
    var g = [e, f];
    d.set(e + "_" + f, !0);
    for (var k = new DDLS.Point(0, 1), l = new DDLS.Point, m, h, n = -1;;) {
        m = b + k.x + k.y;
        h = c + k.x - k.y;
        16777215 > DDLS.getPixel(a, h, m) ? (l.x = -k.y, l.y = k.x) : (m = b + k.y, h = c + k.x, 16777215 > DDLS.getPixel(a, h, m) ? (l.x = k.x, l.y = k.y) : (m = b, h = c, l.x = k.y, l.y = -k.x));
        e += k.x;
        f += k.y;
        if (e == g[0] && f == g[1]) break;
        else g.push(e), g.push(f), d.set(e + "_" + f, !0), b = m, c = h, k.x = l.x, k.y = l.y;
        n--;
        if (0 == n) break
    }
    console.log("shape done");
    return g
};
DDLS.Potrace.buildGraph = function(a) {
    var b, c = new DDLS.Graph,
        d;
    for (b = 0; b < a.length;) d = c.insertNode(), d.data = new DDLS.NodeData, d.data.index = b, d.data.point = new DDLS.Point(a[b], a[b + 1]), b += 2;
    var e, f, g, k = !1;
    for (a = c.node; null != a;) {
        for (b = null != a.next ? a.next : c.node; b != a;) {
            k = !0;
            e = null != a.next ? a.next : c.node;
            g = 2;
            for (d = 0; e != b;) {
                f = DDLS.Geom2D.distanceSquaredPointToSegment(e.data.point, a.data.point, b.data.point);
                0 > f && (f = 0);
                if (f >= DDLS.Potrace.maxDistance) {
                    k = !1;
                    break
                }
                g++;
                d += f;
                e = null != e.next ? e.next : c.node
            }
            if (!k) break;
            e = c.insertEdge(a, b);
            f = new DDLS.EdgeData;
            f.sumDistancesSquared = d;
            f.length = a.data.point.distanceTo(b.data.point);
            f.nodesCount = g;
            e.data = f;
            b = null != b.next ? b.next : c.node
        }
        a = a.next
    }
    console.log("graph done");
    return c
};
DDLS.Potrace.buildPolygon = function(a, b) {
    var c = [],
        d, e, f, g;
    d = 2147483647;
    var k;
    f = null;
    for (g = a.node; g.data.index < d;) {
        d = g.data.index;
        c.push(g.data.point.x);
        c.push(g.data.point.y);
        e = 0;
        for (g = g.outgoingEdge; null != g;) k = g.data.nodesCount - g.data.length * DDLS.sqrt(g.data.sumDistancesSquared / g.data.nodesCount), k > e && (e = k, f = g), g = g.rotNextEdge;
        g = f.destinationNode
    }
    d = new DDLS.Point(c[c.length - 2], c[c.length - 1]);
    e = new DDLS.Point(c[0], c[1]);
    f = new DDLS.Point(c[2], c[3]);
    0 == DDLS.Geom2D.getDirection(d, e, f) && (c.shift(), c.shift());
    console.log("polygone done");
    return c
};
DDLS.ShapeSimplifier = function(a, b) {
    b = b || 1;
    var c = a.length;
    if (4 >= c) return [].concat(a);
    for (var d = a[0], e = a[1], f = a[c - 2], g = a[c - 1], k = -1, l = 0, m = 1, c = c >> 1; m < c;) {
        var h = m++,
            n = DDLS.Geom2D.distanceSquaredPointToSegment(new DDLS.Point(a[h << 1], a[(h << 1) + 1]), new DDLS.Point(d, e), new DDLS.Point(f, g));
        n > l && (l = n, k = h)
    }
    return l > b * b ? (d = a.slice(0, (k << 1) + 2), k = a.slice(k << 1), d = DDLS.ShapeSimplifier(d, b), k = DDLS.ShapeSimplifier(k, b), d.slice(0, d.length - 2).concat(k)) : [d, e, f, g]
};
DDLS.AStar = function() {
    this.iterEdge = new DDLS.FromFaceToInnerEdges;
    this.mesh = null;
    this.diameterSquared = this.diameter = this.radiusSquared = this._radius = 0;
    Object.defineProperty(this, "radius", {
        get: function() {
            return this._radius
        },
        set: function(a) {
            this._radius = a;
            this.radiusSquared = this._radius * this._radius;
            this.diameter = 2 * this._radius;
            this.diameterSquared = this.diameter * this.diameter
        }
    })
};
DDLS.AStar.prototype = {
    dispose: function() {
        this.mesh = null;
        this.closedFaces.dispose();
        this.openedFaces.dispose();
        this.entryEdges.dispose();
        this.predecessor.dispose();
        this.entryX.dispose();
        this.entryY.dispose();
        this.scoreF.dispose();
        this.scoreG.dispose();
        this.scoreH.dispose();
        this.predecessor = this.scoreH = this.scoreG = this.scoreF = this.entryY = this.entryX = this.entryEdges = this.openedFaces = this.closedFaces = this.sortedOpenedFaces = null
    },
    findPath: function(a, b, c, d) {
        this.sortedOpenedFaces = [];
        this.closedFaces = new DDLS.Dictionary(1);
        this.openedFaces = new DDLS.Dictionary(1);
        this.entryEdges = new DDLS.Dictionary(1);
        this.predecessor = new DDLS.Dictionary(1);
        this.entryX = new DDLS.Dictionary(1);
        this.entryY = new DDLS.Dictionary(1);
        this.scoreF = new DDLS.Dictionary(1);
        this.scoreG = new DDLS.Dictionary(1);
        this.scoreH = new DDLS.Dictionary(1);
        var e;
        e = DDLS.Geom2D.locatePosition(a, this.mesh);
        if (0 != e.type) {
            if (1 == e.type) {
                if (e.isConstrained) return;
                this.fromFace = e.leftFace
            } else this.fromFace = e;
            e = DDLS.Geom2D.locatePosition(b, this.mesh);
            this.toFace = 0 == e.type ? e.edge.leftFace : 1 == e.type ? e.leftFace : e;
            this.sortedOpenedFaces.push(this.fromFace);
            this.entryEdges.set(this.fromFace, null);
            this.entryX.set(this.fromFace, a.x);
            this.entryY.set(this.fromFace, a.y);
            this.scoreG.set(this.fromFace, 0);
            a = DDLS.SquaredSqrt(b.x - a.x, b.y - a.y);
            this.scoreH.set(this.fromFace, a);
            this.scoreF.set(this.fromFace, a);
            for (var f, g, k, l = new DDLS.Point, m = new DDLS.Point, h = new DDLS.Point, n = !1;;) {
                if (0 == this.sortedOpenedFaces.length) {
                    DDLS.Log("AStar no path found");
                    this.curFace = null;
                    break
                }
                this.curFace = this.sortedOpenedFaces.pop();
                if (this.curFace == this.toFace) break;
                for (this.iterEdge.fromFace = this.curFace; null != (a = this.iterEdge.next());) a.isConstrained || (e = a.rightFace, this.closedFaces.get(e) || this.curFace != this.fromFace && 0 < this._radius && !this.isWalkableByRadius(this.entryEdges.get(this.curFace), this.curFace, a) || (l.x = this.entryX.get(this.curFace), l.y = this.entryY.get(this.curFace), m.x = l.x, m.y = l.y, m.x = 0.5 * (a.originVertex.pos.x + a.destinationVertex.pos.x), m.y = 0.5 * (a.originVertex.pos.y + a.destinationVertex.pos.y),
                h.x = m.x - b.x, h.y = m.y - b.y, k = h.get_length(), h.x = l.x - m.x, h.y = l.y - m.y, g = this.scoreG.get(this.curFace) + h.get_length(), f = k + g, n = !1, null != this.openedFaces.get(e) && this.openedFaces.get(e) ? this.scoreF.get(e) > f && (n = !0) : (this.sortedOpenedFaces.push(e), this.openedFaces.set(e, !0), n = !0), n && (this.entryEdges.set(e, a), this.entryX.set(e, m.x), this.entryY.set(e, m.y), this.scoreF.set(e, f), this.scoreG.set(e, g), this.scoreH.set(e, k), this.predecessor.set(e, this.curFace))));
                this.openedFaces.set(this.curFace, !1);
                this.closedFaces.set(this.curFace, !0);
                this.sortedOpenedFaces.sort(function(a, b) {
                    return this.scoreF.get(a) == this.scoreF.get(b) ? 0 : this.scoreF.get(a) < this.scoreF.get(b) ? 1 : -1
                }.bind(this))
            }
            if (null != this.curFace) for (c.push(this.curFace); this.curFace != this.fromFace;) d.unshift(this.entryEdges.get(this.curFace)), this.curFace = this.predecessor.get(this.curFace), c.unshift(this.curFace)
        }
    },
    isWalkableByRadius: function(a, b, c) {
        var d = null,
            e = null,
            f = null;
        a.originVertex == c.originVertex ? (d = a.destinationVertex, e = c.destinationVertex, f = a.originVertex) : a.destinationVertex == c.destinationVertex ? (d = a.originVertex, e = c.originVertex, f = a.destinationVertex) : a.originVertex == c.destinationVertex ? (d = a.destinationVertex, e = c.originVertex, f = a.originVertex) : a.destinationVertex == c.originVertex && (d = a.originVertex, e = c.destinationVertex, f = a.destinationVertex);
        var g;
        g = (f.pos.x - d.pos.x) * (e.pos.x - d.pos.x) + (f.pos.y - d.pos.y) * (e.pos.y - d.pos.y);
        if (0 >= g) return f = DDLS.Squared(f.pos.x - d.pos.x, f.pos.y - d.pos.y), f >= this.diameterSquared ? !0 : !1;
        g = (f.pos.x - e.pos.x) * (d.pos.x - e.pos.x) + (f.pos.y - e.pos.y) * (d.pos.y - e.pos.y);
        if (0 >= g) return f = DDLS.Squared(f.pos.x - e.pos.x, f.pos.y - e.pos.y), f >= this.diameterSquared ? !0 : !1;
        c = b.edge != a && b.edge.oppositeEdge != a && b.edge != c && b.edge.oppositeEdge != c ? b.edge : b.edge.nextLeftEdge != a && b.edge.nextLeftEdge.oppositeEdge != a && b.edge.nextLeftEdge != c && b.edge.nextLeftEdge.oppositeEdge != c ? b.edge.nextLeftEdge : b.edge.prevLeftEdge;
        if (c.isConstrained) return b = new DDLS.Point(f.pos.x, f.pos.y), DDLS.Geom2D.projectOrthogonaly(b, c), f = DDLS.Squared(b.x - f.pos.x, b.y - f.pos.y), f >= this.diameterSquared ? !0 : !1;
        d = DDLS.Squared(f.pos.x - d.pos.x, f.pos.y - d.pos.y);
        e = DDLS.Squared(f.pos.x - e.pos.x, f.pos.y - e.pos.y);
        if (d < this.diameterSquared || e < this.diameterSquared) return !1;
        e = [];
        d = [];
        a = new DDLS.Dictionary(1);
        d.push(c);
        c.leftFace == b ? (e.push(c.rightFace), a.set(c.rightFace, !0)) : (e.push(c.leftFace), a.set(c.leftFace, !0));
        for (var k; 0 < e.length;) {
            b = e.shift();
            c = d.shift();
            b.edge == c || b.edge == c.oppositeEdge ? (c = b.edge.nextLeftEdge, k = b.edge.nextLeftEdge.nextLeftEdge) : b.edge.nextLeftEdge == c || b.edge.nextLeftEdge == c.oppositeEdge ? (c = b.edge, k = b.edge.nextLeftEdge.nextLeftEdge) : (c = b.edge, k = b.edge.nextLeftEdge);
            g = c.leftFace == b ? c.rightFace : c.leftFace;
            b = k.leftFace == b ? k.rightFace : k.leftFace;
            if (!a.get(g) && DDLS.Geom2D.distanceSquaredVertexToEdge(f, c) < this.diameterSquared) {
                if (c.isConstrained) return !1;
                e.push(g);
                d.push(c);
                a.set(g, !0)
            }
            if (!a.get(b) && DDLS.Geom2D.distanceSquaredVertexToEdge(f, k) < this.diameterSquared) {
                if (k.isConstrained) return !1;
                e.push(b);
                d.push(k);
                a.set(b, !0)
            }
        }
        a.dispose();
        return !0
    }
};
DDLS.EntityAI = function(a, b, c) {
    this.path = [];
    this.position = new DDLS.Point(a || 0, b || 0);
    this.direction = new DDLS.Point(1, 0);
    this.radius = c || 10;
    this.angle = 0;
    this.angleFOV = 60;
    this.radiusFOV = 0
};
DDLS.EntityAI.prototype = {};
DDLS.Funnel = function() {
    this._currPoolPointsIndex = 0;
    this._poolPointsSize = 3E3;
    this._numSamplesCircle = 16;
    this._radius = this._radiusSquared = 0;
    this._poolPoints = [];
    for (var a = this._poolPointsSize, b = 0; b < a;) b++, this._poolPoints.push(new DDLS.Point);
    Object.defineProperty(this, "radius", {
        get: function() {
            return this._radius
        },
        set: function(a) {
            this._radius = DDLS.max(0, a);
            this._radiusSquared = this._radius * this._radius;
            this._sampleCircle = [];
            if (0 != this._radius) {
                a = this._numSamplesCircle;
                for (var b = 0, e; b < a;) e = b++, e = -DDLS.TwoPI * e / this._numSamplesCircle, this._sampleCircle.push(new DDLS.Point(this._radius * DDLS.cos(e), this._radius * DDLS.sin(e)));
                this._sampleCircleDistanceSquared = DDLS.Squared(this._sampleCircle[0].x - this._sampleCircle[1].x, this._sampleCircle[0].y - this._sampleCircle[1].y)
            }
        }
    })
};
DDLS.Funnel.prototype = {
    dispose: function() {
        this._sampleCircle = null
    },
    getPoint: function(a, b) {
        this.__point = this._poolPoints[this._currPoolPointsIndex];
        this.__point.set(a || 0, b || 0);
        this._currPoolPointsIndex++;
        this._currPoolPointsIndex == this._poolPointsSize && (this._poolPoints.push(new DDLS.Point), this._poolPointsSize++);
        return this.__point
    },
    getCopyPoint: function(a) {
        return this.getPoint(a.x, a.y)
    },
    findPath: function(a, b, c, d, e) {
        var f = 1.01 * this._radius;
        this._currPoolPointsIndex = 0;
        if (0 < this._radius) {
            var g = c[0],
                k, l, m;
            l = g.edge.originVertex.pos;
            m = g.edge.destinationVertex.pos;
            g = g.edge.nextLeftEdge.destinationVertex.pos;
            k = DDLS.Squared(l.x - a.x, l.y - a.y);
            k <= this._radiusSquared ? (k = DDLS.sqrt(k), a.sub(l).div(k).mul(f).add(l)) : (k = DDLS.Squared(m.x - a.x, m.y - a.y), k <= this._radiusSquared ? (k = DDLS.sqrt(k), a.sub(m).div(k).mul(f).add(m)) : (k = DDLS.Squared(g.x - a.x, g.y - a.y), k <= this._radiusSquared && (k = DDLS.sqrt(k), a.sub(g).div(k).mul(f).add(g))));
            g = c[c.length - 1];
            l = g.edge.originVertex.pos;
            m = g.edge.destinationVertex.pos;
            g = g.edge.nextLeftEdge.destinationVertex.pos;
            k = DDLS.Squared(l.x - b.x, l.y - b.y);
            k <= this._radiusSquared ? (k = DDLS.sqrt(k), b.sub(l).div(k).mul(f).add(l)) : (k = DDLS.Squared(m.x - b.x, m.y - b.y), k <= this._radiusSquared ? (k = DDLS.sqrt(k), b.sub(m).div(k).mul(f).add(m)) : (k = DDLS.Squared(g.x - b.x, g.y - b.y), k <= this._radiusSquared && (k = DDLS.sqrt(k), b.sub(g).div(k).mul(f).add(g))))
        }
        var h;
        h = a.clone();
        f = b.clone();
        if (1 == c.length) e.push(DDLS.fix(h.x)), e.push(DDLS.fix(h.y)), e.push(DDLS.fix(f.x)), e.push(DDLS.fix(f.y));
        else {
            var n = null,
                p = null;
            d[0] == DDLS.Geom2D.isInFace(a, c[0]) && (d.shift(), c.shift());
			if(d.length==0) return;
            m = [];
            g = [];
            m.push(h);
            g.push(h);
            var q = new DDLS.Dictionary(1);
            k = [];
            c = new DDLS.Dictionary(0);
            l = new DDLS.Dictionary(0);
            c.set(h, 0);
            var n = d[0],
                r = DDLS.Geom2D.getRelativePosition2(a, n),
                s, t;
            s = this.getCopyPoint(n.destinationVertex.pos);
            t = this.getCopyPoint(n.originVertex.pos);
            k.push(s);
            k.push(t);
            l.set(h, s);
            l.set(s, t);
            a = t;
            1 == r ? (c.set(s, 1), c.set(t, -1), q.set(n.destinationVertex, 1), q.set(n.originVertex, -1)) : -1 == r && (c.set(s, -1), c.set(t, 1), q.set(n.destinationVertex, -1), q.set(n.originVertex, 1));
            r = d[0].originVertex;
            s = d[0].destinationVertex;
            t = 1;
            for (var u = d.length; t < u;) n = t++, n = d[n], n.originVertex == r ? p = n.destinationVertex : n.destinationVertex == r ? p = n.originVertex : n.originVertex == s ? (p = n.destinationVertex, r = s) : n.destinationVertex == s ? (p = n.originVertex, r = s) : DDLS.Log("IMPOSSIBLE TO IDENTIFY THE VERTEX !!!"), s = this.getCopyPoint(p.pos), k.push(s), n = -q.get(r), c.set(s, n), l.set(a, s), q.set(p, n), a = s, s = r, r = p;
            l.set(a, f);
            c.set(f, 0);
            d = [];
            p = new DDLS.Dictionary(1);
            d.push(h);
            p.set(h, 0);
            q = 0;
            for (a = k.length; q < a;) if (h = q++, s = k[h], -1 == c.get(s)) {
                for (h = m.length - 2; 0 <= h;) {
                    n = DDLS.Geom2D.getDirection(m[h], m[h + 1], s);
                    if (-1 != n) {
                        m.shift();
                        for (n = 0; n < h;) n++, d.push(m[0]), p.set(m[0], 1), m.shift();
                        d.push(m[0]);
                        p.set(m[0], 1);
                        g.splice(0, g.length);
                        g.push(m[0]);
                        g.push(s);
                        break
                    }
                    h--
                }
                g.push(s);
                for (h = g.length - 3; 0 <= h;) {
                    n = DDLS.Geom2D.getDirection(g[h], g[h + 1], s);
                    if (-1 == n) break;
                    else g.splice(h + 1, 1);
                    h--
                }
            } else {
                for (h = g.length - 2; 0 <= h;) {
                    n = DDLS.Geom2D.getDirection(g[h], g[h + 1], s);
                    if (1 != n) {
                        g.shift();
                        for (n = 0; n < h;) n++, d.push(g[0]), p.set(g[0], -1), g.shift();
                        d.push(g[0]);
                        p.set(g[0], -1);
                        m.splice(0, m.length);
                        m.push(g[0]);
                        m.push(s);
                        break
                    }
                    h--
                }
                m.push(s);
                for (h = m.length - 3; 0 <= h;) {
                    n = DDLS.Geom2D.getDirection(m[h], m[h + 1], s);
                    if (1 == n) break;
                    else m.splice(h + 1, 1);
                    h--
                }
            }
            k = !1;
            for (h = g.length - 2; 0 <= h;) {
                n = DDLS.Geom2D.getDirection(g[h], g[h + 1], b);
                if (1 != n) {
                    g.shift();
                    k = 0;
                    for (h += 1; k < h;) k++, d.push(g[0]), p.set(g[0], -1), g.shift();
                    d.push(f);
                    p.set(f, 0);
                    k = !0;
                    break
                }
                h--
            }
            if (!k) for (h = m.length - 2; 0 <= h;) {
                n = DDLS.Geom2D.getDirection(m[h], m[h + 1], b);
                if (-1 != n) {
                    m.shift();
                    b = 0;
                    for (g = h + 1; b < g;) b++, d.push(m[0]),
                    p.set(m[0], 1), m.shift();
                    d.push(f);
                    p.set(f, 0);
                    k = !0;
                    break
                }
                h--
            }
            k || (d.push(f), p.set(f, 0));
            b = [];
            if (0 < this._radius) {
                m = [];
                if (2 == d.length) this.adjustWithTangents(d[0], !1, d[1], !1, c, l, m, b);
                else if (2 < d.length) {
                    this.adjustWithTangents(d[0], !1, d[1], !0, c, l, m, b);
                    if (3 < d.length) for (g = 1, k = d.length - 3 + 1; g < k;) h = g++, this.adjustWithTangents(d[h], !0, d[h + 1], !0, c, l, m, b);
                    g = d.length;
                    this.adjustWithTangents(d[g - 2], !0, d[g - 1], !1, c, l, m, b)
                }
                m.push(f);
                this.checkAdjustedPath(m, b, c);
                l = [];
                for (f = m.length - 2; 1 <= f;) {
                    for (this.smoothAngle(b[2 * f - 1], m[f], b[2 * f], c.get(m[f]), l); 0 != l.length;) b.splice(2 * f, 0, l.pop());
                    f--
                }
            } else b = d;
            l = 0;
            for (c = b.length; l < c;) f = l++, e.push(DDLS.fix(b[f].x)), e.push(DDLS.fix(b[f].y))
        }
    },
    adjustWithTangents: function(a, b, c, d, e, f, g, k) {
        var l = [],
            m = e.get(a),
            h = e.get(c),
            n = null,
            p = null;
        if (b || d) if (b) if (d) if (1 == m && 1 == h) DDLS.Geom2D.tangentsParalCircleToCircle(this._radius, a, c, l), n = this.getPoint(l[2], l[3]), p = this.getPoint(l[4], l[5]);
        else if (-1 == m && -1 == h) DDLS.Geom2D.tangentsParalCircleToCircle(this._radius, a, c, l), n = this.getPoint(l[0],
        l[1]), p = this.getPoint(l[6], l[7]);
        else if (1 == m && -1 == h) if (DDLS.Geom2D.tangentsCrossCircleToCircle(this._radius, a, c, l)) n = this.getPoint(l[2], l[3]), p = this.getPoint(l[6], l[7]);
        else {
            DDLS.Log("NO TANGENT, points are too close for radius");
            return
        } else if (DDLS.Geom2D.tangentsCrossCircleToCircle(this._radius, a, c, l)) n = this.getPoint(l[0], l[1]), p = this.getPoint(l[4], l[5]);
        else {
            DDLS.Log("NO TANGENT, points are too close for radius");
            return
        } else if (DDLS.Geom2D.tangentsPointToCircle(c, a, this._radius, l)) 0 < l.length && (n = 1 == m ? this.getPoint(l[0], l[1]) : this.getPoint(l[2], l[3]), p = c);
        else {
            DDLS.Log("NO TANGENT");
            return
        } else if (DDLS.Geom2D.tangentsPointToCircle(a, c, this._radius, l)) 1 == h ? (n = a, p = this.getPoint(l[2], l[3])) : (n = a, p = this.getPoint(l[0], l[1]));
        else {
            DDLS.Log("NO TANGENT");
            return
        } else n = a, p = c;
        for (l = f.get(a); l != c;) {
            m = DDLS.Geom2D.distanceSquaredPointToSegment(l, n, p);
            if (m < this._radiusSquared) {
                this.adjustWithTangents(a, b, l, !0, e, f, g, k);
                this.adjustWithTangents(l, !0, c, d, e, f, g, k);
                return
            }
            l = f.get(l)
        }
        k.push(n);
        k.push(p);
        g.push(a)
    },
    checkAdjustedPath: function(a, b, c) {
        for (var d = !0, e, f, g, k, l, m, h, n = [], p = null, q = null; d;) for (var d = !1, r = 2; r < a.length;) k = a[r], l = c.get(k), e = a[r - 1], g = c.get(e), e = a[r - 2], f = c.get(e), g == l && (g = b[2 * (r - 2)], m = b[2 * (r - 1) - 1], h = b[2 * (r - 1)], g = (g.x - m.x) * (h.x - m.x) + (g.y - m.y) * (h.y - m.y), 0 < g && (2 == r ? (DDLS.Geom2D.tangentsPointToCircle(e, k, this._radius, n), 1 == l ? (p = e, q = this.getPoint(n[2], n[3])) : (p = e, q = this.getPoint(n[0], n[1]))) : r == a.length - 1 ? (DDLS.Geom2D.tangentsPointToCircle(k, e, this._radius, n), p = 1 == f ? this.getPoint(n[0], n[1]) : this.getPoint(n[2],
        n[3]), q = k) : 1 == f && -1 == l ? (DDLS.Geom2D.tangentsCrossCircleToCircle(this._radius, e, k, n), p = this.getPoint(n[2], n[3]), q = this.getPoint(n[6], n[7])) : -1 == f && 1 == l ? (DDLS.Geom2D.tangentsCrossCircleToCircle(this._radius, e, k, n), p = this.getPoint(n[0], n[1]), q = this.getPoint(n[4], n[5])) : 1 == f && 1 == l ? (DDLS.Geom2D.tangentsParalCircleToCircle(this._radius, e, k, n), p = this.getPoint(n[2], n[3]), q = this.getPoint(n[4], n[5])) : -1 == f && -1 == l && (DDLS.Geom2D.tangentsParalCircleToCircle(this._radius, e, k, n), p = this.getPoint(n[0], n[1]), q = this.getPoint(n[6],
        n[7])), b.splice(2 * (r - 2), 1, p), b.splice(2 * r - 1, 1, q), a.splice(r - 1, 1), b.splice(2 * (r - 1) - 1, 2), n.splice(0, n.length), r--)), r++
    },
    smoothAngle: function(a, b, c, d, e) {
        var f = DDLS.Geom2D.getDirection(a, b, c);
        if (!(DDLS.Squared(a.x - c.x, a.y - c.y) <= this._sampleCircleDistanceSquared)) {
            for (var g = 0, k, l, m, h, n = 0, p = this._numSamplesCircle; n < p;) {
                k = n++;
                m = !1;
                h = b.clone().add(this._sampleCircle[k]);
                k = DDLS.Geom2D.getDirection(a, b, h);
                l = DDLS.Geom2D.getDirection(b, c, h);
                if (1 == d) if (-1 == f) - 1 == k && -1 == l && (m = !0);
                else {
                    if (-1 == k || -1 == l) m = !0
                } else if (1 == f) 1 == k && 1 == l && (m = !0);
                else if (1 == k || 1 == l) m = !0;
                m ? (e.splice(g, 0, h), g++) : g = 0
            } - 1 == d && e.reverse()
        }
    }
};
DDLS.PathFinder = function() {
    this.astar = new DDLS.AStar;
    this.funnel = new DDLS.Funnel;
    this.listFaces = [];
    this.listEdges = [];
    this.entity = this._mesh = null;
    Object.defineProperty(this, "mesh", {
        get: function() {
            return this._mesh
        },
        set: function(a) {
            this._mesh = a;
            this.astar.mesh = a
        }
    })
};
DDLS.PathFinder.prototype = {
    dispose: function() {
        this._mesh = null;
        this.astar.dispose();
        this.astar = null;
        this.funnel.dispose();
        this.listFaces = this.listEdges = this.funnel = null
    },
    findPath: function(a, b) {
        b.splice(0, b.length);
        if (!DDLS.Geom2D.isCircleIntersectingAnyConstraint(a, this.entity.radius, this._mesh)) {
            this.astar.radius = this.entity.radius;
            this.funnel.radius = this.entity.radius;
            this.listFaces.splice(0, this.listFaces.length);
            this.listEdges.splice(0, this.listEdges.length);
            var c = this.entity.position;
            this.astar.findPath(c,
            a, this.listFaces, this.listEdges);
            0 == this.listFaces.length ? DDLS.Log("PathFinder listFaces.length == 0") : this.funnel.findPath(c, a, this.listFaces, this.listEdges, b)
        }
    }
};
DDLS.FieldOfView = function(a, b) {
    this.entity = a || null;
    this.mesh = b || null
};
DDLS.FieldOfView.prototype = {
    isInField: function(a) {
        if (this.mesh && this.entity) {
            var b = this.entity.position,
                c = this.entity.direction,
                d = a.position,
                e = this.entity.radiusFOV,
                f = this.entity.angleFOV,
                g = a.radius;
            a = DDLS.Squared(b.x - d.x, b.y - d.y);
            if (a >= (e + g) * (e + g)) return !1;
            if (a < g * g) return !0;
            a = new DDLS.Point;
            var k = new DDLS.Point,
                l = [];
            DDLS.Geom2D.intersections2Circles(b, e, d, g, l) && (a.set(l[0], l[1]), k.set(l[2], l[3]));
            e = b.clone().add(d).mul(0.5);
            if (0 == l.length || DDLS.Squared(e.x - d.x, e.y - d.y) < DDLS.Squared(e.x - a.x, e.y - a.y)) l.splice(0,
            l.length), DDLS.Geom2D.tangentsPointToCircle(b, d, g, l), a.set(l[0], l[1]), k.set(l[2], l[3]);
            e = DDLS.cos(0.5 * this.entity.angleFOV);
            d = a.clone().sub(b);
            g = DDLS.sqrt(d.x * d.x + d.y * d.y);
            d = d.x / g * c.x + d.y / g * c.y > e ? !0 : !1;
            g = k.clone().sub(b);
            l = DDLS.sqrt(g.x * g.x + g.y * g.y);
            e = g.x / l * c.x + g.y / l * c.y > e ? !0 : !1;
            if (!d && !e && (g = b.clone().add(c), 1 != DDLS.Geom2D.getDirection(b, g, a) || -1 != DDLS.Geom2D.getDirection(b, g, k))) return !1;
            d && e || (g = new DDLS.Point, c = DDLS.atan2(c.y, c.x), d || (d = (new DDLS.Point(DDLS.cos(c - 0.5 * f), DDLS.sin(c - 0.5 * f))).add(b),
            DDLS.Geom2D.intersections2segments(b, d, a, k, g, null, !0), a = g.clone()), e || (f = (new DDLS.Point(DDLS.cos(c + 0.5 * f), DDLS.sin(c + 0.5 * f))).add(b), DDLS.Geom2D.intersections2segments(b, f, a, k, g, null, !0), k = g.clone()));
            var f = new DDLS.Dictionary,
                c = new DDLS.Dictionary,
                d = [],
                e = DDLS.Geom2D.locatePosition(b, this.mesh),
                m;
            2 == e.type ? m = e : 1 == e.type ? m = e.leftFace : 0 == e.type && (m = e.edge.leftFace);
            e = [];
            g = new DDLS.Dictionary;
            e.push(m);
            g[m] = !0;
            var h, n, p;
            m = new DDLS.Point;
            for (var l = new DDLS.Point, q, r, s = [], t = []; 0 < e.length;) for (h = e.shift(),
            g.set(h, null), f.set(h, !0), h = h.edge, c.get(h) || c.get(h.oppositeEdge) || (t.push(h), c.set(h, !0)), h = h.nextLeftEdge, c.get(h) || c.get(h.oppositeEdge) || (t.push(h), c.set(h, !0)), h = h.nextLeftEdge, c.get(h) || c.get(h.oppositeEdge) || (t.push(h), c.set(h, !0)); 0 < t.length;) if (h = t.pop(), n = h.originVertex.pos, p = h.destinationVertex.pos, DDLS.Geom2D.clipSegmentByTriangle(n.x, n.y, p.x, p.y, b.x, b.y, k.x, k.y, a.x, a.y, m, l)) {
                if (h.isConstrained) {
                    s.splice(0, s.length);
                    DDLS.Geom2D.intersections2segments(b, m, a, k, null, s, !0);
                    DDLS.Geom2D.intersections2segments(b,
                    l, a, k, null, s, !0);
                    n = s[1];
                    q = s[3];
                    q < n && (n = q, q = s[1]);
                    for (r = d.length - 1; 0 <= r && !(q >= d[r]); r--);
                    p = r + 1;
                    0 == p % 2 && d.splice(p, 0, q);
                    for (r = 0; r < d.length && !(n <= d[r]); r++);
                    q = r;
                    0 == q % 2 ? (d.splice(q, 0, n), p++) : q--;
                    d.splice(q + 1, p - q - 1);
                    if (2 == d.length && -DDLS.EPSILON < d[0] && d[0] < DDLS.EPSILON && 1 - DDLS.EPSILON < d[1] && d[1] < 1 + DDLS.EPSILON) return !1
                }
                h = h.rightFace;
                g.get(h) || f.get(h) || (e.push(h), g.set(h, !0))
            }
            return !0
        }
    }
};
DDLS.LinearPathSampler = function() {
    this._path = this.entity = null;
    this._samplingDistance = this._samplingDistanceSquared = 1;
    this._preCompX = [];
    this._preCompY = [];
    this.pos = new DDLS.Point;
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
DDLS.LinearPathSampler.prototype = {
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
        for (a = this._samplingDistance;;) if (b = DDLS.SquaredSqrt(this.pos.x - this._path[this._iPrev], this.pos.y - this._path[this._iPrev + 1]), b < a) {
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
        for (a = this._samplingDistance;;) if (b = DDLS.SquaredSqrt(this.pos.x - this._path[this._iNext], this.pos.y - this._path[this._iNext + 1]), b < a) {
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
DDLS.PathIterator = function() {
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
DDLS.PathIterator.prototype = {
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
DDLS.RectMesh = function(a, b) {
    for (var c = [], d = [], e = [], f = [], g = 4; g--;) e.push(new DDLS.Face), c.push(new DDLS.Vertex), f.push(new DDLS.Segment), d.push(new DDLS.Edge, new DDLS.Edge, new DDLS.Edge);
    g = new DDLS.Shape;
    c[0].pos.set(-10, -10);
    c[1].pos.set(a + 10, -10);
    c[2].pos.set(a + 10, b + 10);
    c[3].pos.set(-10, b + 10);
    c[0].setDatas(d[0]);
    c[1].setDatas(d[2]);
    c[2].setDatas(d[4]);
    c[3].setDatas(d[6]);
    d[0].setDatas(c[0], d[1], d[2], e[3], !0, !0);
    d[1].setDatas(c[1], d[0], d[7], e[0], !0, !0);
    d[2].setDatas(c[1], d[3], d[11], e[3], !0, !0);
    d[3].setDatas(c[2],
    d[2], d[8], e[1], !0, !0);
    d[4].setDatas(c[2], d[5], d[6], e[2], !0, !0);
    d[5].setDatas(c[3], d[4], d[3], e[1], !0, !0);
    d[6].setDatas(c[3], d[7], d[10], e[2], !0, !0);
    d[7].setDatas(c[0], d[6], d[9], e[0], !0, !0);
    d[8].setDatas(c[1], d[9], d[5], e[1], !0, !1);
    d[9].setDatas(c[3], d[8], d[1], e[0], !0, !1);
    d[10].setDatas(c[0], d[11], d[4], e[2], !1, !1);
    d[11].setDatas(c[2], d[10], d[0], e[3], !1, !1);
    e[0].setDatas(d[9], !0);
    e[1].setDatas(d[8], !0);
    e[2].setDatas(d[4], !1);
    e[3].setDatas(d[2], !1);
    c[0].fromConstraintSegments = [f[0], f[3]];
    c[1].fromConstraintSegments = [f[0], f[1]];
    c[2].fromConstraintSegments = [f[1], f[2]];
    c[3].fromConstraintSegments = [f[2], f[3]];
    d[0].fromConstraintSegments.push(f[0]);
    d[1].fromConstraintSegments.push(f[0]);
    d[2].fromConstraintSegments.push(f[1]);
    d[3].fromConstraintSegments.push(f[1]);
    d[4].fromConstraintSegments.push(f[2]);
    d[5].fromConstraintSegments.push(f[2]);
    d[6].fromConstraintSegments.push(f[3]);
    d[7].fromConstraintSegments.push(f[3]);
    f[0].edges.push(d[0]);
    f[1].edges.push(d[2]);
    f[2].edges.push(d[4]);
    f[3].edges.push(d[6]);
    f[0].fromShape = g;
    f[1].fromShape = g;
    f[2].fromShape = g;
    f[3].fromShape = g;
    g.segments.push(f[0], f[1], f[2], f[3]);
    f = new DDLS.Mesh(a, b);
    f._vertices = c;
    f._edges = d;
    f._faces = e;
    f._constraintShapes.push(g);
    f.clipping = !1;
    f.insertConstraintShape([0, 0, a, 0, a, 0, a, b, a, b, 0, b, 0, b, 0, 0]);
    f.clipping = !0;
    return f
};
DDLS.BitmapObject = {};
DDLS.BitmapObject.buildFromBmpData = function(a, b, c, d) {
    null == b && (b = 1);
    a = DDLS.Potrace.buildShapes(a, c, d);
    if (1 <= b) {
        c = 0;
        for (var e = a.length; c < e;) {
            var f = c++;
            a[f] = DDLS.ShapeSimplifier(a[f], b)
        }
    }
    b = [];
    c = 0;
    for (e = a.length; c < e;) f = c++, b.push(DDLS.Potrace.buildGraph(a[f]));
    a = [];
    c = 0;
    for (e = b.length; c < e;) f = c++, a.push(DDLS.Potrace.buildPolygon(b[f], d));
    b = new DDLS.Object;
    c = 0;
    for (e = a.length; c < e;) {
        f = c++;
        for (d = 0; d < a[f].length - 2;) b.coordinates.push(a[f][d]), b.coordinates.push(a[f][d + 1]), b.coordinates.push(a[f][d + 2]), b.coordinates.push(a[f][d + 3]), d += 2;
        b.coordinates.push(a[f][0]);
        b.coordinates.push(a[f][1]);
        b.coordinates.push(a[f][d]);
        b.coordinates.push(a[f][d + 1])
    }
    console.log("build");
    return b
};
DDLS.BitmapMesh = {};
DDLS.BitmapMesh.buildFromBmpData = function(a, b, c, d) {
    b = b || 1;
    c = DDLS.Potrace.buildShapes(a, c, d);
    if (1 <= b) for (var e = 0, f = c.length; e < f;) {
        var g = e++;
        c[g] = DDLS.ShapeSimplifier(c[g], b)
    }
    b = [];
    e = 0;
    for (f = c.length; e < f;) g = e++, b.push(DDLS.Potrace.buildGraph(c[g]));
    c = [];
    e = 0;
    for (f = b.length; e < f;) g = e++, c.push(DDLS.Potrace.buildPolygon(b[g], d));
    d = DDLS.RectMesh(a.width, a.height);
    b = 0;
    for (e = c.length; b < e;) {
        f = b++;
        for (a = 0; a < c[f].length - 2;) d.insertConstraintSegment(c[f][a], c[f][a + 1], c[f][a + 2], c[f][a + 3]), a += 2;
        d.insertConstraintSegment(c[f][a],
        c[f][a + 1], c[f][a + 2], c[f][a + 3])
    }
    return d
};
DDLS.World = function(a, b) {
    this.w = a || 512;
    this.h = b || 512;
    this.mesh = DDLS.RectMesh(this.w, this.h);
    this.pathFinder = new DDLS.PathFinder;
    this.pathFinder.mesh = this.mesh;
    this.heroes = [];
    this.shapes = [];
    this.segments = [];
    this.objects = []
};
DDLS.World.prototype = {
    update: function() {
        for (var a = this.heroes.length; a--;) this.heroes[a].update()
    },
    add: function(a) {
        this.mesh.insertObject(a);
        this.objects.push(a)
    },
    addObject: function(a) {
        a = a || {};
        var b = new DDLS.Object;
        b.coordinates = a.coord || [-1, -1, 1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, 1, -1, -1];
        b.position(a.x || 1, a.y || 1);
        b.scale(a.w || 1, a.h || 1);
        b.pivot(a.px || 0, a.py || 0);
        b.rotation = a.r || 0;
        this.mesh.insertObject(b);
        this.objects.push(b);
        return b
    },
    reset: function(a, b) {
        this.mesh.dispose();
        a && (this.w = a);
        b && (this.h = b);
        this.mesh = DDLS.RectMesh(this.w, this.h);
        this.pathFinder.mesh = this.mesh
    },
    rebuild: function() {
        this.mesh.clear(!0);
        this.mesh = DDLS.RectMesh(this.w, this.h);
        this.pathFinder.mesh = this.mesh;
        for (var a = this.objects.length; a--;) this.objects[a]._constraintShape = null, this.mesh.insertObject(this.objects[a])
    },
    addHeroe: function(a) {
        a = new DDLS.Heroe(a, this);
        this.heroes.push(a);
        return a
    }
};
DDLS.Heroe = function(a, b) {
    a = a || {};
    this.world = b;
    this.path = [];
    this.tmppath = [];
    this.target = new DDLS.Point;
    this.newPath = this.move = !1;
    this.mesh = null;
    this.isSelected = !1;
    this.entity = new DDLS.EntityAI(a.x || 0, a.y || 0, a.r || 4);
    this.fov = new DDLS.FieldOfView(this.entity, this.world.mesh);
    this.pathSampler = new DDLS.LinearPathSampler;
    this.pathSampler.entity = this.entity;
    this.pathSampler.path = this.path;
    this.pathSampler.samplingDistance = a.speed || 10
};
DDLS.Heroe.prototype = {
    setTarget: function(a, b) {
		this.entity.position.set(this.mesh.position.x,this.mesh.position.z);
        this.target.set(a, b);
        this.world.pathFinder.entity = this.entity;
        this.world.pathFinder.findPath(this.target, this.path);
        this.testPath()
    },
    testPath: function() {
        if (0 < this.path.length) {
            this.tmppath = [];
            for (var a = this.path.length; a--;) this.tmppath[a] = this.path[a];
            this.newPath = !0
        }
    },
    update: function() {
        if(null != this.mesh && this.move){
		   //计算旋转角度
		   var up = new THREE.Vector3( 0, 1, 0 );
		   var forward = new THREE.Vector3();
		   var point = new THREE.Vector3(this.entity.position.x,this.mesh.position.y,this.entity.position.y);
		   var prevPoint = new THREE.Vector3(this.mesh.position.x,this.mesh.position.y,this.mesh.position.z);
		   forward.subVectors( point, prevPoint ).normalize();
		   var angle = Math.atan2( forward.x, forward.z );
		   window.AWEngine.options({
			   name:this.mesh.name,
			   type:'character',
			   angle:angle			   
		   },true);
		   window.AWEngine.options({
			   name:this.mesh.name,
			   type:'character',
			   pos:[this.entity.position.x,this.mesh.position.y,this.entity.position.y]			   
		   },true);
		   this.mesh.userData.findPath = true;
		   this.mesh.userData.avatar.playAction("run");
		}
        this.newPath && this.pathSampler.reset();
        this.pathSampler.hasNext ? (this.newPath = !1, this.move = !0, this.pathSampler.next()) : (this.move = !1, this.mesh.userData.findPath = false);
    }
};
//=======================================================
function DDLSRender(world,scene){
    this.maxVertices = 30000;
    this.currentVertex = 0;
	this.world = world;
	this.scene = scene;
	this.renderObjs = [];
	this.debug = false;
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute( new Float32Array( this.maxVertices * 3 ), 3 ));
    geometry.setAttribute('color', new THREE.BufferAttribute( new Float32Array( this.maxVertices * 3 ), 3 ));
    this.positions = geometry.attributes.position.array;
    this.colors = geometry.attributes.color.array;
    geometry.computeBoundingSphere();

    
    this.buffer = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ vertexColors: true }));
    this.buffer.frustumCulled = false;
	this.buffer.visible = this.debug;
    this.scene.add(this.buffer);
	this.renderObjs.push(this.buffer);

    // PATH

    this.maxPathVertices = 1000;
    this.currentPathVertex = 0;

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute( new Float32Array( this.maxPathVertices * 3 ), 3 ));
    geometry.setAttribute('color', new THREE.BufferAttribute( new Float32Array( this.maxPathVertices * 3 ), 3 ));
    this.positionsPath = geometry.attributes.position.array;
    this.colorsPath = geometry.attributes.color.array;
    geometry.computeBoundingSphere();
    
    this.bufferPath = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ vertexColors: true }));
    this.bufferPath.frustumCulled = false;
	this.bufferPath.visible = this.debug;
    this.scene.add(this.bufferPath);
	this.renderObjs.push(this.bufferPath)
}

DDLSRender.prototype = {
    constructor: DDLSRender,
    collapseBuffer : function() {
        var i = this.maxVertices;
        var min = this.currentVertex;
        var n = 0;
        while(i>=min){
            n = i * 3;
            this.positions[n] = 0;
            this.positions[n+1] = 0;
            this.positions[n+2] = 0;
            this.colors[n] = 0;
            this.colors[n+1] = 0;
            this.colors[n+2] = 0;
            i--;
        }
    },
    collapsePathBuffer : function() {
        var i = this.maxPathVertices;
        var min = this.currentPathVertex;
        var n = 0;
        while(i>=min){
            n = i * 3;
            this.positionsPath[n] = 0;
            this.positionsPath[n+1] = 0;
            this.positionsPath[n+2] = 0;
            this.colorsPath[n] = 0;
            this.colorsPath[n+1] = 0;
            this.colorsPath[n+2] = 0;
            i--;
        }
    },
	show : function(v){
		this.debug = v;
		var i = this.renderObjs.length;
		while(i--){
			this.renderObjs[i].visible = v;
		}
	},
    update : function() {

        //var redraw = world.mesh.updateObjects();
        //if(redraw){
        if(this.world.mesh.isRedraw){
            this.currentVertex = 0;
            this.world.mesh.draw();

            this.collapseBuffer();
            this.buffer.geometry.attributes.position.needsUpdate = true;
            this.buffer.geometry.attributes.color.needsUpdate = true;
        }

        var i = this.world.heroes.length;
        while(i--){
            this.world.heroes[i].update();
            if(this.world.heroes[i].isSelected && this.world.heroes[i].tmppath.length>0){
                this.currentPathVertex = 0;
                var p = this.world.heroes[i].tmppath;

                var prevX = p[0];
                var prevY = p[1];

        var j = 2;
        while(j < p.length) {
            this.insertPath(prevX, prevY, p[j], p[j+1], 1,0,0);
            prevX = p[j];
            prevY = p[j+1];
            j += 2;
        }


                /*var j = p.length*0.25, n;
                while(j--){
                    n = j*4;
                    this.insertPath(p[n], p[n+1], p[n+2], p[n+3], 1,0,0);
                }*/

                this.collapsePathBuffer();
                this.bufferPath.geometry.attributes.position.needsUpdate = true;
                this.bufferPath.geometry.attributes.color.needsUpdate = true;

            }
        }

        
    },
    insertLine : function(x1, y1, x2, y2, r, g, b) {
        var i = this.currentVertex;
        var n = i * 3;
        this.positions[n] = x1;
        this.positions[n + 1] = 0;
        this.positions[n + 2] = y1;
        this.colors[n] = r;
        this.colors[n + 1] = g;
        this.colors[n + 2] = b;
        i++;
        n = i * 3;
        this.positions[n] = x2;
        this.positions[n + 1] = 0;
        this.positions[n + 2] = y2;
        this.colors[n] = r;
        this.colors[n + 1] = g;
        this.colors[n + 2] = b;
        this.currentVertex += 2;
    },

    insertPath : function(x1, y1, x2, y2, r, g, b) {
        var i = this.currentPathVertex;
        var n = i * 3;
        this.positionsPath[n] = x1;
        this.positionsPath[n + 1] = 0;
        this.positionsPath[n + 2] = y1;
        this.colorsPath[n] = r;
        this.colorsPath[n + 1] = g;
        this.colorsPath[n + 2] = b;
        i++;
        n = i * 3;
        this.positionsPath[n] = x2;
        this.positionsPath[n + 1] = 0;
        this.positionsPath[n + 2] = y2;
        this.colorsPath[n] = r;
        this.colorsPath[n + 1] = g;
        this.colorsPath[n + 2] = b;
        this.currentPathVertex += 2;
    }
}

DDLS.Mesh.prototype.draw = function(){
    console.log('meshdraw')
    this.compute_Data();
    var edge = this.AR_edge;
    var i = edge.length;
    var n = 0;
    while(i--){
        n = i * 5;
        if(edge[n+4]) {
             window.AWEngine.ddlsRender.insertLine(edge[n], edge[n+1], edge[n+2], edge[n+3], 0,0,0);
        }else{
             window.AWEngine.ddlsRender.insertLine(edge[n], edge[n+1], edge[n+2], edge[n+3], 0.4,0.4,0.4);
        }
    }
    this.isRedraw = false;
}

DDLS.Heroe.prototype.draw = function(){

}
export { DDLS,DDLSRender};