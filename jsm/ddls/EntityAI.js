import { Point } from './Point.js';
var EntityAI = function(a, b, c) {
    this.path = [];
    this.position = new Point(a || 0, b || 0);
    this.direction = new Point(1, 0);
    this.radius = c || 10;
    this.angle = 0;
    this.angleFOV = 60;
    this.radiusFOV = 0
};
EntityAI.prototype = {};
export { EntityAI };