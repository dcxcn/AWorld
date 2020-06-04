var ShapeID = 0;
var Shape = function() {
    this.id = ShapeID;
    ShapeID++;
    this.segments = []
};
Shape.prototype = {
    constructor: Shape,
    dispose: function() {
        for (; 0 < this.segments.length;) this.segments.pop().dispose();
        this.segments = null
    }
};
export { Shape };