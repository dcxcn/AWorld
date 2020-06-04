import {	
	Box3,
	Vector3,
	Matrix4,
	Quaternion,
	AnimationMixer,
	AnimationClip,
	AnimationUtils,
	Skeleton,
	SkeletonHelper,
	VectorKeyframeTrack,
	QuaternionKeyframeTrack	
} from "../libs/three.module.js";
import { BVHLoader } from '../../jsm/three/loaders/BVHLoader.js';
import { lzma,extract } from '../../jsm/libs/extract.module.js';
import { CSS2DObject } from '../../jsm/three/renderers/CSS2DRenderer.js';
import { WAnimalPhySkeleton }  from '../../jsm/world/WAnimalPhySkeleton.js';
var WAnimal = function (pConfO) {
	
	this.index = 0;
	this.ename = pConfO.ename;
	this.cname = pConfO.cname;
	this.findPath = false;
	this.life = 100;
	
	this.isTestBvh = false;
	this.logicPlay = false;
	this.bvhLoader = new BVHLoader();
	this.animations = [];

	this.actions=[];
	this.boneTracks=[];
	this.bvhData=[];
	this.boneNames = [];//为了骨骼排重
	this.bones=[];
	this.freezeBones=[];	
	this.hipParentMtx=null;//根骨父亲Mtx
	
	this.canJump = true;
	this.isJumping = false;
	this.curActionName = null;
	this.curFreezeActionName=null;
	this.size = pConfO.size;
	this.addModel(window.WEngine.view.getModel(pConfO.modelName),pConfO);

	this.damageUUIDS = [];
	
	if(pConfO.physicBody){
		this.initPhysicSkeleton();
	}
	this.animations = window.WEngine.view.getAnimations(pConfO.modelName);
	this.initActions(pConfO)		
    this.isReady = true;

};

WAnimal.prototype =  {
	//这里放属性，被多个孩子共用
	constructor:WAnimal,
	clearFreezeBones: function(){
		this.freezeBones=[];
	},
	addNameLabel :function(){
		var nameDiv = document.createElement( 'div' );
		nameDiv.className = 'label';
		nameDiv.textContent = this.cname ;
		nameDiv.style.marginTop = '-1em';
		var nameLabel = new CSS2DObject( nameDiv );
		nameLabel.position.set( 0, this.halfExtent.y+0.1, 0 );
		this.model.parent.add( nameLabel );
		return nameLabel;
	},
	addDamage : function (uuid, val ){
		if(this.damageUUIDS.indexOf(uuid)!=-1) return;
		this.damageUUIDS.push(uuid);
		this.life -= val;
		if(this.life<=0){
			this.life = 0;
		}
	},	
	getBoneList:function ( object ) {
		var boneList = [];
		if ( object && object.isBone && this.boneNames.indexOf(object.name)==-1) {
			boneList.push( object );
			this.boneNames.push(object.name);		
		}
		for ( var i = 0; i < object.children.length; i ++ ) {
			boneList.push.apply( boneList, this.getBoneList( object.children[ i ] ) );
		}
		return boneList;
	},
	playAction : function(actionName){
		if(!this.hasActions || this.logicPlay) return;
		this.doAction(actionName);
	},
	doAction : function(actionName){
		if(!this.actions[actionName]) return;	
		this.actions[actionName].play();	
		if(this.curActionName!=null && this.curActionName != actionName){
			this.actions[this.curActionName].stop();
		}
		this.curActionName = actionName;
	},
	getKey : function(){
		if(window.WEngine.currentFollow && window.WEngine.currentFollow.userData.avatar == this){
			return window.WEngine.user.keyboard.getKey();
		}else{
			return  new Float32Array( 20 );
		}
	},
	update : function(delta){
		this.mixer.update( delta );
		if(this.physicSkeleton){
			this.physicSkeleton.update(delta);
		};		
		//console.log("this.model.position="+this.model.position.x+"---"+this.model.position.y+"---"+this.model.position.z);
	}
};
WAnimal.prototype.addModel = function( model, options ){	
	model.traverse(function (child) {
		if (child.isMesh) {
			child.castShadow = true;                       
			child.material.alphaTest=0.1;
			//console.log(child);
			//console.log(child.material.alphaTest);						
		}
	});
	if(options.scale){
		model.scale.fromArray( [options.scale[0],options.scale[1],options.scale[2]]);
	}
	this.model = model;
	if(!this.size){
		this.box = new Box3().setFromObject(model);
		this.halfExtent =  new Vector3(
			(this.box.max.x - this.box.min.x) * 0.5,
			(this.box.max.y - this.box.min.y) * 0.5,
			(this.box.max.z - this.box.min.z) * 0.5
		);
		this.size = [this.halfExtent.x,this.halfExtent.y,this.halfExtent.z];
	}else{		
		this.halfExtent =  new Vector3(this.size[0],this.size[1],this.size[2]);
	}
	if(options.offset){
		this.model.position.set(options.offset[0],-this.size[ 1 ]+options.offset[1],options.offset[2]);
	}else{
		this.model.position.set(0,-this.size[ 1 ],0);
	}
	
	this.mixer = new AnimationMixer( this.model );
    if( this.tPose === undefined ) this.tPose = [];
    if( this.sizes === undefined ) this.sizes = {};
	if(model.modelType=='fbx'){
		for(var c=0;c<model.children.length;c++){
			if(model.children[c].isGroup){
				this.bones = this.getBoneList(model.children[c]);
				break;
			}
		}
	}else if(model.modelType=='gltf'){
		this.bones = this.getBoneList(model);
	}

};

WAnimal.prototype.initPhysicSkeleton = function() {
	console.log("initPhysicSkeleton=="+this.ename);
	this.physicSkeleton = new WAnimalPhySkeleton( this );	
	this.physicSkeleton.init();
};

WAnimal.prototype.initActions = function (pConfO){
	if(pConfO.hasOwnProperty("actions")){
		this.hasActions = true;
		var actions = pConfO.actions;
		for(var i=0;i<actions.length;i++){
			var newClip = this.animations[actions[i].clipName];
			if(actions[i].duration){
				newClip.duration = actions[i].duration;
			}
			this.actions[actions[i].name] = this.mixer.clipAction(newClip);
		}
	}else{
		this.hasActions = false;
	}
};
//-----------------------
// skeleton Helper
//-----------------------

WAnimal.prototype.addHelper = function (){

    this.helper = new SkeletonHelper( this.model );
    window.WEngine.view.addVisual( this.helper );

};

WAnimal.prototype.removeHelper = function (){

	if(this.helper!=null){
		window.WEngine.view.removeVisual( this.helper );
		this.helper = null;
	}
};

WAnimal.prototype.showSkeleton = function(b){
	if(b){
		this.addHelper();
	}else{
		this.removeHelper();
	}
}
export { WAnimal };