import { Point } from './Point.js';
import { EntityAI } from './EntityAI.js';
import { FieldOfView } from './FieldOfView.js';
import { LinearPathSampler } from './LinearPathSampler.js';
import {
	Vector3
} from '../libs/three.module.js';
var Heroe = function(a, b) {
    a = a || {};
    this.world = b;
    this.path = [];
    this.tmppath = [];
    this.target = new Point;
    this.newPath = this.move = !1;
    this.mesh = null;
    this.isSelected = !1;
    this.entity = new EntityAI(a.x || 0, a.y || 0, a.r || 4);
    this.fov = new FieldOfView(this.entity, this.world.mesh);
    this.pathSampler = new LinearPathSampler;
    this.pathSampler.entity = this.entity;
    this.pathSampler.path = this.path;
    this.pathSampler.samplingDistance = a.speed || 10
};
Heroe.prototype = {
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
		   var up = new Vector3( 0, 1, 0 );
		   var forward = new Vector3();
		   var point = new Vector3(this.entity.position.x,this.mesh.position.y,this.entity.position.y);
		   var prevPoint = new Vector3(this.mesh.position.x,this.mesh.position.y,this.mesh.position.z);
		   forward.subVectors( point, prevPoint ).normalize();
		   var angle = Math.atan2( forward.x, forward.z );
		   window.WEngine.options({
			   name:this.mesh.name,
			   type:'character',
			   angle:angle			   
		   },true);
		   window.WEngine.options({
			   name:this.mesh.name,
			   type:'character',
			   pos:[this.entity.position.x,this.mesh.position.y,this.entity.position.y]			   
		   },true);
		   this.mesh.userData.findPath = true;
		   this.mesh.userData.avatar.playAction(this.mesh.userData.actionName||"run");
		}
        this.newPath && this.pathSampler.reset();
        this.pathSampler.hasNext ? (this.newPath = !1, this.move = !0, this.pathSampler.next()) : (this.move = !1, this.mesh.userData.findPath = false,this.mesh.userData.findPathCallBack());
    }
};
export { Heroe };