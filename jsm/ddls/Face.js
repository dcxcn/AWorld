import { FACE } from './constants.js';
var FaceID = 0;
var Face = function() {
    this.type = FACE;
    this.id = FaceID;
    FaceID++;
    this.isReal = !1;
    this.edge = null
};
Face.prototype = {
    constructor: Face,
    setDatas: function(a, b) {
        this.isReal = void 0 !== b ? b : !0;
        this.edge = a
    },
    dispose: function() {
        this.edge = null
    }
};
export { Face };