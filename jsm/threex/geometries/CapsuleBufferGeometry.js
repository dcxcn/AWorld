import {
	Matrix4,
	Geometry,
	BufferGeometry,
	CylinderGeometry,
	SphereGeometry,
	Float32BufferAttribute	
} from "../../libs/three.module.js";
var CapsuleBufferGeometry = function( Radius, Height, SRadius, H) {

    BufferGeometry.call( this );

    this.type = 'CapsuleBufferGeometry';

    

    var radius = Radius || 1;
    var height = Height || 1;

    var sRadius = SRadius || 12;
    var sHeight = ~~ sRadius*0.5;// SHeight || 6;
    var h = H || 1;
    var o0 = Math.PI * 2;
    var o1 = Math.PI * 0.5;
    var g = new Geometry();
    var m0 = new CylinderGeometry(radius, radius, height, sRadius, h, true);
    var m1 = new SphereGeometry(radius, sRadius, sHeight, 0, o0, 0, o1);
    var m2 = new SphereGeometry(radius, sRadius, sHeight, 0, o0, o1, o1);
    var mtx0 = new Matrix4().makeTranslation(0,0,0);
    var mtx1 = new Matrix4().makeTranslation(0, height*0.5,0);
    var mtx2 = new Matrix4().makeTranslation(0, -height*0.5,0);
    g.merge( m0, mtx0);
    g.merge( m1, mtx1);
    g.merge( m2, mtx2);
    g.mergeVertices();

    this.fromGeometry( g );
}

CapsuleBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
CapsuleBufferGeometry.prototype.constructor = CapsuleBufferGeometry;

export { CapsuleBufferGeometry };