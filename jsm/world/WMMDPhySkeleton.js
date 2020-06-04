import {
	Vector3,
	Matrix4,
	Quaternion,
	Bone	
} from "../libs/three.module.js";

var posN = new Vector3();
var quatWO = new Quaternion();
var quatWN = new Quaternion();
var quatLO =  new Quaternion();
var WMMDPhySkeleton = function( wmmd ){
	this.wmmd = wmmd;	
	this.scale = wmmd.scale;
	this.bones = wmmd.model.skeleton.bones;	

	var userData = wmmd.model.geometry.userData;
	this.rigidBodies = userData.MMD.rigidBodies;
	this.constraints = userData.MMD.constraints;
   
	this.ammoBodies=[];

    this.isRunning = false;
	this.updateAll = false;
	this.updateBone = false;
};

WMMDPhySkeleton.prototype = {
    constructor : WMMDPhySkeleton,
	init:function(){
		var _self = this;
		setTimeout(function(){	
			_self.initRigidBodies();
			_self.resetRigidBodies();
			_self.initConstraints();
			//_self.initConstraints_test();
			_self.isRunning = true;
			setTimeout(function(){
				_self.updateBone = true;
			},5000)
		},5000);//7000,5000,3000,1500
		
    },
	initRigidBodies:function ( ){
		var scale = this.scale;
		var type,size,bodyConf, bone,ammobodyName;
		var p = new Vector3();
		var tmpQ = new THREE.Quaternion();
		var tmpE = new THREE.Euler();
		var offsetMtx = new Matrix4();
		console.log(this.wmmd.ename+'--rigidBodies.length-'+this.rigidBodies.length);
        for(var i = 0, il = this.rigidBodies.length; i < il; i ++){
            bodyConf = this.rigidBodies[i];
			ammobodyName = this.wmmd.ename+"_"+i;            
			if(bodyConf.boneIndex == -1){
				bone = new Bone();
			}else{
				bone = this.bones[bodyConf.boneIndex];
				bone.updateMatrixWorld( true );
				bone.getWorldPosition(p);
			}

			console.log(bone.name+"--type--"+bodyConf.type+"--shapeType--"+bodyConf.shapeType);
			type = null;
			switch ( bodyConf.shapeType ) {

				case 0:
					type = 'sphere';					
					size = [bodyConf.width*scale,bodyConf.width*scale,bodyConf.width*scale];								
					break;
				case 1:
					type = 'box';				
					size = [bodyConf.width*2*scale, bodyConf.height*2*scale, bodyConf.depth*2*scale];					
					break;
				case 2:
					type = 'capsule';
					size = [bodyConf.width*scale, bodyConf.height*scale,bodyConf.width*scale ];					
					break;
				default:
					throw 'unknown shape type ' + bodyConf.shapeType;

			}
			if(type!=null){
				bone.bodyType = bodyConf.type;	
				var mmdQuat = tmpQ.setFromEuler( tmpE.fromArray( bodyConf.rotation )).toArray();
				var mmdPos = [bodyConf.position[0]*scale,bodyConf.position[1]*scale,bodyConf.position[2]*scale];				
				console.log(ammobodyName+'--'+bodyConf.name+'--type-'+type);
				var o={   
					type:type,
					size:size, 
					pos:mmdPos,
					quat:mmdQuat,
					bonePos:p.toArray(),
					name:ammobodyName,					
					friction:bodyConf.friction*scale, 
					restitution:bodyConf.restitution*scale,
					damping:[bodyConf.positionDamping*scale,bodyConf.rotationDamping*scale]
				};
				if(bodyConf.type === 0){
					o.group = 4;
					o.mask = 8;
					o.flag = 2;					
					o.state = 4;
					o.mass = 0;
					o.kinematic = true;
				}else{
					o.group = 8;
					o.mask=2|4;
					o.flag = 2;
					o.mass=bodyConf.weight*scale;
					o.kinematic = true;
					o.neverSleep = true;
				} 
				var ammoBody = window.WEngine.physic.add(o);
				offsetMtx.identity();				
				offsetMtx.makeTranslation(mmdPos[0], mmdPos[1], mmdPos[2]);
				offsetMtx.makeRotationFromQuaternion(tmpQ);
				//获取偏移逆矩阵
				var offsetIMtx = new Matrix4();
				offsetIMtx.getInverse(offsetMtx);				
				ammoBody.mmdData = {p:mmdPos,q:mmdQuat,imtx:offsetIMtx,boneIndex:bodyConf.boneIndex,type:bodyConf.type};
				this.ammoBodies.push(ammoBody);

			}
		}
		console.log(this.wmmd.ename+'--ammoBodies.length-'+this.ammoBodies.length);
	},
	initConstraints_test:function(){
		var _physic = window.WEngine.physic;
		var num = 20;
		var mid = (num * 0.21) * 0.5;
		var py = 0.2;
		var down = true;
		var isDone = false;
		var x;
		for ( var i = 0; i < num; i++) {
			x = (i*2) - mid;
			_physic.add({ type:'box', name:'box' + i, mass: 1, pos:[x,py,0], size:[0.2],group:8,mask:2|4, kinematic:  false, neverSleep:true });
		}
		_physic.add({ 
				type:'joint_spring_dof', name:'joint_head', b1:'miku_0', b2:'box0', 
				pos1:[0.1,0,0], pos2:[-0.1,0,0], 
				axe1:[0,0,1], axe2:[0,0,1], 
				linLower:[0, 0, 0], linUpper:[0, 0, 0], 
				angLower:[-20, -20, -20], angUpper:[20, 20, 20],
				collision:false, 
				local:true 
			});
		for ( var i = 0; i < num-1; i++) {
			_physic.add({ 
				type:'joint_spring_dof', name:'joint'+i, b1:'box'+i, b2:'box'+(i+1), 
				pos1:[0.1,0,0], pos2:[-0.1,0,0], 
				axe1:[0,0,1], axe2:[0,0,1], 
				linLower:[0, 0, 0], linUpper:[0, 0, 0], 
				angLower:[-20, -20, -20], angUpper:[20, 20, 20],
				collision:false, 
				local:true 
			});
		}
	},
	initConstraints: function ( ) {			
		var scale = this.scale;
		var tmpQ = new THREE.Quaternion();
		var tmpE = new THREE.Euler();
		var p,q;
		var toDeg = 180/Math.PI;
		
		for ( var i = 0, il = this.constraints.length; i < il; i ++ ) {
			var cParams = this.constraints[ i ];
			var ammoBodyA = this.ammoBodies[cParams.rigidBodyIndex1];			
			var ammoBodyB = this.ammoBodies[cParams.rigidBodyIndex2];
			/*if((ammoBodyA.name !== 'miku_0') || (ammoBodyB.name !== 'miku_13')){
				continue;
			}*/
			
			var tranL1 = cParams.translationLimitation1;
			var tranL2 = cParams.translationLimitation2;
			var rotL1 = cParams.rotationLimitation1;
			var rotL2 = cParams.rotationLimitation2;
			var sPos = cParams.springPosition;
			var sRot = cParams.springRotation;			

			console.log('create joint_'+ammoBodyA.name+'_'+ammoBodyB.name);
			p = [cParams.position[0]*scale+this.wmmd.initPos[0],cParams.position[1]*scale+this.wmmd.initPos[1],cParams.position[2]*scale+this.wmmd.initPos[2]];
			console.log('p--'+cParams.position[0]*scale+' '+cParams.position[1]*scale+' '+cParams.position[2]*scale);
			q = tmpQ.setFromEuler( tmpE.fromArray( cParams.rotation )).toArray();
			//debugger;
			window.WEngine.physic.add({ 
				type: 'joint_spring_dof', 
				name: 'joint_'+ammoBodyA.name+'_'+ammoBodyB.name, 
				b1: ammoBodyA.name, 
				b2: ammoBodyB.name, 
				pos1: p, 
				quat1: q,
				pos2: p, 
				quat2: q,
				linLower: [tranL1[0]*scale,tranL1[1]*scale,tranL1[2]*scale], 
				linUpper: [tranL2[0]*scale,tranL2[1]*scale,tranL2[2]*scale],  
				angLower: [rotL1[0]*toDeg,rotL1[1]*toDeg,rotL1[2]*toDeg], 
				angUpper: [rotL2[0]*toDeg,rotL2[1]*toDeg,rotL2[2]*toDeg],
				spring: [sPos[0]*scale,sPos[1]*scale,sPos[2]*scale,sRot[0],sRot[1],sRot[2]],
				params: [[2, 0.475],[2, 0.475],[2, 0.475],[2, 0.475],[2, 0.475],[2, 0.475]],
				collision: false,
				local: false
			});
			window.WEngine.physic.options({
				name: ammoBodyB.name,
				type: 'body',
				flag: 0
			});
		}
	},
	showPhyBones:function(b){
		var i = this.ammoBodies.length;
		while(i--){
			this.ammoBodies[i].visible=b;
		}
	},
	update:function(delta){
		if(!this.isRunning) return;
		this.updateRigidBodies();
		this.updateBones();
	},
	updateBones:function(delta){
		if(!this.updateBone) return;
        var ammoBody,bone;
        for ( var i = 0, il = this.ammoBodies.length; i < il; i ++ ) {
			ammoBody = this.ammoBodies[i];
			if(ammoBody.mmdData.type != 0){
				if(ammoBody.mmdData.boneIndex<0) continue;
				bone = this.bones[ammoBody.mmdData.boneIndex];
				this.updateOneBoneFromAmmoBody(bone,ammoBody);
			}
        }
	},
	updateOneBoneFromAmmoBody:function(bone,ammoBody){
		//"miku_6","miku_5"
		//if(["miku_6","miku_5","miku_4","miku_3"].indexOf(ammoBody.name)==-1)return;
		//if(["miku_13"].indexOf(ammoBody.name)==-1)return;
		//console.log('刚体到骨骼_body='+ammoBody.name+'_bone'+bone.name);	

		var boneNMtxW = ammoBody.matrix.clone().multiply(ammoBody.mmdData.imtx);	
		posN.setFromMatrixPosition(boneNMtxW);
		quatWN.setFromRotationMatrix(boneNMtxW);
		quatLO.setFromRotationMatrix( bone.matrix );
		quatWO.setFromRotationMatrix( bone.matrixWorld );
		quatWO.conjugate().multiply( quatWN );
		bone.quaternion.multiply( quatWO );			
		//bone.quaternion.copy( quatWO.multiply( quatLO ).normalize() );
		//排除紧连(直接连接的)body type = 0 骨骼的附属骨骼
		if(ammoBody.mmdData.type === 1 && bone.parent.bodyType!=0){
			if ( bone.parent ) {			
				bone.parent.worldToLocal( posN );
			}
			bone.position.copy( posN );
		}		
		bone.updateMatrixWorld( true );
		/*if(ammoBody.mmdData.type === 2){
			var p = new Vector3();
			var q = new Quaternion();
			var s = new Vector3();
			console.log('2==name=='+bone.name);
			bone.matrixWorld.decompose( p, q, s );
			//console.log(i+'==updateRigidBodies=='+ammoBody.name);
			window.WEngine.physic.options({
				name: ammoBody.name,
				type: 'body',
				mmdPos: ammoBody.mmdData.p,
				mmdQuat: ammoBody.mmdData.q,
				trans: [p.x, p.y, p.z, q.x, q.y, q.z, q.w]
			},true);
		}*/
		
	},
    updateRigidBodies:function(delta){
        var ammoBody,bone;
        var p = new Vector3();
        var q = new Quaternion();
		var s = new Vector3();
		var i = this.ammoBodies.length;		
        while ( i-- ) {
			ammoBody = this.ammoBodies[i];			
			//debugger; 
			if(this.updateAll || ammoBody.mmdData.type === 0){//|| ammoBody.mmdData.type === 2
				if(ammoBody.mmdData.boneIndex<0) continue;
				bone = this.bones[ammoBody.mmdData.boneIndex];
				//console.log(i+'==name=='+bone.name);
				bone.matrixWorld.decompose( p, q, s );
				//console.log(i+'==updateRigidBodies=='+ammoBody.name);
				window.WEngine.physic.options({
					name: ammoBody.name,
					type: 'body',
					mmdPos: ammoBody.mmdData.p,
					mmdQuat: ammoBody.mmdData.q,
					trans: [p.x, p.y, p.z, q.x, q.y, q.z, q.w]
				},true);
			}  
        }
    },
	resetRigidBodies:function(){
		this.wmmd.model.updateMatrixWorld( true );
        var ammoBody,bone;
        var p = new Vector3();
        var q = new Quaternion();
		var s = new Vector3();
		var i = this.ammoBodies.length;		
        while ( i-- ) {
			ammoBody = this.ammoBodies[i];			
			if(ammoBody.mmdData.boneIndex<0){
				p.fromArray(this.wmmd.initPos);
				q.set(0,0,0,1);
			}else{
				bone = this.bones[ammoBody.mmdData.boneIndex];
				//console.log(i+'==name=='+bone.name);
				bone.matrixWorld.decompose( p, q, s );
			}

			//console.log(i+'==updateRigidBodies=='+ammoBody.name);
			window.WEngine.options({
				name: ammoBody.name,
				type: 'body',				
				mmdPos: ammoBody.mmdData.p,
				mmdQuat: ammoBody.mmdData.q,
				trans: [p.x, p.y, p.z, q.x, q.y, q.z, q.w]
			},true);
        }
    }
}

export { WMMDPhySkeleton };