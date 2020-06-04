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
import { WMMDPhySkeleton }  from '../../jsm/world/WMMDPhySkeleton.js';
import { CCDIKSolver } from "../../jsm/three/animation/CCDIKSolver.js";

/**
 * @param {THREE.SkinnedMesh} mesh
 * @param {Array<Object>} grants
 */
function GrantSolver( mesh, grants ) {

	this.mesh = mesh;
	this.grants = grants || [];

}

GrantSolver.prototype = {

	constructor: GrantSolver,

	/**
	 * @return {GrantSolver}
	 */
	update: function () {

		var quaternion = new Quaternion();

		return function () {

			var bones = this.mesh.skeleton.bones;
			var grants = this.grants;

			for ( var i = 0, il = grants.length; i < il; i ++ ) {

				var grant = grants[ i ];
				var bone = bones[ grant.index ];
				var parentBone = bones[ grant.parentIndex ];

				if ( grant.isLocal ) {

					// TODO: implement
					if ( grant.affectPosition ) {

					}

					// TODO: implement
					if ( grant.affectRotation ) {

					}

				} else {

					// TODO: implement
					if ( grant.affectPosition ) {

					}

					if ( grant.affectRotation ) {

						quaternion.set( 0, 0, 0, 1 );
						quaternion.slerp( parentBone.quaternion, grant.ratio );
						bone.quaternion.multiply( quaternion );

					}

				}

			}

			return this;

		};

	}()

};
var WMMD = function (pConfO) {
	
	this.index = 0;
	this.ename = pConfO.ename;
	this.cname = pConfO.cname;
	this.findPath = false;
	this.life = 100;
	this.scale = pConfO.scale;
	this.initPos = pConfO.position;
	this.physicBody = pConfO.physicBody;
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
	this.addModel(window.WEngine.view.getModel(this.ename),pConfO);	
	this.initActions(pConfO);
	
	this.ikSolver = this.createCCDIKSolver( this.model );
	this.grantSolver = this.createGrantSolver( this.model );
	this.damageUUIDS = [];
	

	
    this.isReady = true;

};

WMMD.prototype =  {
	//这里放属性，被多个孩子共用
	constructor:WMMD,
	clearFreezeBones: function(){
		this.freezeBones=[];
	},
	addNameLabel :function(){
		var nameDiv = document.createElement( 'div' );
		nameDiv.className = 'label';
		nameDiv.textContent = this.cname ;
		nameDiv.style.marginTop = '-1em';
		var nameLabel = new CSS2DObject( nameDiv );
		nameLabel.position.set( 0, this.halfExtent.y+0.2, 0 );
		this.model.parent.add( nameLabel );
		return nameLabel;
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
	setBvhPlaySpeed:function(speed){		
		if(this.isTestBvh){
			this.mixer.timeScale = speed;
		}
		
	},
	enableTestBvhData:function(b){
		this.isTestBvh = b;
		//停止上一次Action
		if(this.curActionName!=null 
		&& this.actions[this.curActionName]!=null ){
			this.actions[this.curActionName].stop();			
		}
		if(!b){
			this.mixer.timeScale = 1;
		}
	},
	loadAndPlayBvhData:function(r, fname){
		this.enableTestBvhData(true);
		var _self = this;
		
		var doWithAction = function(actionO,name){
			if(!_self.animations.hasOwnProperty(name)){
				var newClip = _self.makeAnimation(actionO,name,{name:name,reverse:false});
				_self.actions[name] = _self.mixer.clipAction(newClip);
			}				
			_self.doAction(name);
		};
		window.setTimeout(function(){
			var type = fname.substring(fname.indexOf('.')+1,fname.length);
			var name = fname.substring(0, fname.indexOf('.'));
			var isMixAmo = fname.indexOf('mixamo')!=-1;
			if(type==='z'){
				lzma.decompress( new Uint8Array( r ), function on_complete( r ) { 
					doWithAction(r,name);
				}); 
			   
			} else if( type === 'bvh' || type === 'BVH' ){
				var bvhTxt = "";
				var raw = new Uint8Array( r );
				for ( var i = 0; i < raw.length; ++ i ) {
					bvhTxt += String.fromCharCode( raw[ i ] );
				}
				doWithAction({type:isMixAmo?'mixamo':'common',data:bvhTxt},name);
			}
		},500);

	},
	playAction : function(actionName){
		if(this.isTestBvh || !this.hasActions || this.logicPlay) return;
		this.doAction(actionName);
	},
	doAction : function(actionName){
		
		if(!this.actions[actionName]) return;	
		this.isVMDAction = this.actions[actionName].isVMD;
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
		if(this.physicBody){
			if(this.physicSkeleton==null || this.physicSkeleton.isRunning==false) return;
		}
		this.restoreBones(this.model);		
		this.mixer.update( delta );
		this.saveBones(this.model);
		if(this.isVMDAction){
			this.model.updateMatrixWorld( true );
			this.ikSolver.update();
			this.grantSolver.update();
		}
		
		if(this.physicSkeleton){
			this.physicSkeleton.update(delta);
		};
		
		//console.log("this.model.position="+this.model.position.x+"---"+this.model.position.y+"---"+this.model.position.z);
	}
};
WMMD.prototype.addModel = function( model, options ){	
	model.traverse(function (child) {
		if (child.isMesh) {
			child.castShadow = true;                       
			child.material.alphaTest=0.1;
			//console.log(child);
			//console.log(child.material.alphaTest);						
		}
	});
	function makePhongMaterials( materials ) {
		var array = [];
		for ( var i = 0, il = materials.length; i < il; i ++ ) {
			var m = new THREE.MeshPhongMaterial();
			m.copy( materials[ i ] );
			m.needsUpdate = true;
			m.envMap = window.WEngine.view.getEnvmap();
			array.push( m );
		}
		return array;
	}
	if(options.usePhongMat)model.material = makePhongMaterials(model.material);
	this.model= model;
	if(options.scale){
		this.model.scale.fromArray( [options.scale,options.scale,options.scale]);
	}
	if(!this.size){
		this.box = new Box3().setFromObject(this.model);
		this.halfExtent =  new Vector3(
			(this.box.max.x - this.box.min.x) * 0.25,
			(this.box.max.y - this.box.min.y) * 0.5,
			(this.box.max.z - this.box.min.z) * 0.25
		);
		this.size = [this.halfExtent.x,this.halfExtent.y,this.halfExtent.z];
	}else{		
		this.halfExtent =  new Vector3(this.size[0],this.size[1],this.size[2]);
	}
	if(options.offset){
		this.vmdOffset = options.offset;
		this.model.position.set(options.offset[0],-this.size[ 1 ]+options.offset[1],options.offset[2]);
	}else{
		this.model.position.set(0,-this.size[ 1 ],0);
	}
	this.mixer = new AnimationMixer( this.model );
	if( this.tPose_idx === undefined ) this.tPose_idx = [];
	if( this.sizes === undefined ) this.sizes = {};
	//this.bones = this.getBoneList(model);
	this.bones = model.skeleton.bones;
	//this.model.skeleton = new Skeleton(this.bones);
    var name = model.name;
	
    var bones = this.bones;
    var lng = bones.length, i, b, n;
    var v = new Vector3();
    var p = [];

    for( i = 0; i < lng; i++ ){ 

        b = bones[ i ];
		b.skeleton = this.model.skeleton;
		

	    if( b.name === 'hip' || b.name === 'Hips' ||b.name === 'hips' || b.name === 'センター') this.hipParentMtx = b.parent.matrixWorld.clone();//必须clone
		//console.log('hipParentMtx----'+this.hipParentMtx.toArray());
		
        // get id of parent bones
        if( b.parent ) b.userData['id'] = bones.indexOf( b.parent );

        if( options !== undefined ) this.renameBone( b, options.names );

        n = -1;
        if( b.name === 'rThigh' || b.name === 'RightUpLeg' || b.name === 'thighR' || b.name === '右足') n = 1;
        if( b.name === 'rShin' || b.name === 'RightLeg' || b.name === 'shinR' || b.name === '右ひざ') n = 2;
        if( b.name === 'rFoot' || b.name === 'RightFoot' || b.name === 'footR' || b.name === '右足首') n = 3; 
        if( n!==-1 ) p[n] = b.getWorldPosition( v.clone() )
			
		if( b.name === 'RightHand' || b.name === 'handR' || b.name === '右手首') this.handR = b;


		if(b.name ==='左腕'){
			b.matrixWorld.multiply( new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler().fromArray(window.WEngine.toRad([0,0,45]))))
		}
		if(b.name ==='右腕'){
			b.matrixWorld.multiply( new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler().fromArray(window.WEngine.toRad([0,0,-45]))))
		}
		this.tPose_idx[i] = b.matrixWorld.clone();
    }
    this.sizes[name] = p[1].distanceTo( p[2] ) + p[2].distanceTo( p[3] );
};

WMMD.prototype.createCCDIKSolver = function ( mesh ) {

	if ( CCDIKSolver === undefined ) {

		throw new Error( 'THREE.MMDAnimationHelper: Import CCDIKSolver.' );

	}

	return new CCDIKSolver( mesh, mesh.geometry.userData.MMD.iks );

},
WMMD.prototype.createGrantSolver = function ( mesh ) {

	return new GrantSolver( mesh, mesh.geometry.userData.MMD.grants );

},
WMMD.prototype.saveBones = function ( mesh ) {

	
	var bones = mesh.skeleton.bones;

	if ( this.backupBones === undefined ) {

		this.backupBones = new Float32Array( bones.length * 7 );
	}

	for ( var i = 0, il = bones.length; i < il; i ++ ) {

		var bone = bones[ i ];
		bone.position.toArray( this.backupBones, i * 7 );
		bone.quaternion.toArray( this.backupBones, i * 7 + 3 );

	}

},
WMMD.prototype.restoreBones = function ( mesh ) {

	if ( this.backupBones === undefined ) return;

	var bones = mesh.skeleton.bones;

	for ( var i = 0, il = bones.length; i < il; i ++ ) {

		var bone = bones[ i ];
		bone.position.fromArray( this.backupBones, i * 7 );
		bone.quaternion.fromArray( this.backupBones, i * 7 + 3 );

	}

},
WMMD.prototype.initPhysicSkeleton = function() {
	console.log("initPhysicSkeleton=="+this.ename);
	this.physicSkeleton = new WMMDPhySkeleton( this );	
	this.physicSkeleton.init();
};
WMMD.prototype.initActions = function (options){
    if(options.hasOwnProperty("actions")){		
		this.hasActions = true;
		var actions = options.actions;
		for(var i=0;i<actions.length;i++){	
			var mmdAnimation = null;
			var isVMD = false;
			if(actions[i].refVMD){
				isVMD = true;
				mmdAnimation = window.WEngine.view.getMMDAnimation(actions[i],this.model);
			}else if(actions[i].refBVH){
				isVMD = false;
				var actionO = window.WEngine.getActionData(actions[i].refBVH);
				mmdAnimation = this.makeAnimation(actionO,actions[i].name,actions[i]);
			}
			if(mmdAnimation!=null)this.actions[actions[i].name] = this.mixer.clipAction(mmdAnimation);
			this.actions[actions[i].name].isVMD = isVMD;			
		}

	}else{
		this.hasActions = false;
	}
};
WMMD.prototype.makeAnimation = function(actionO,actionName,meta) {
	var parseData = this.bvhData[actionName] =  this.bvhLoader.parse(actionO.data);
	parseData.actionName = actionName;
	parseData.bvhType = actionO.type;
	parseData.meta = meta;
	var newClip = this.getAnimationClip( this.model, parseData,this.tPose_idx);
	this.freezeBones[actionName]=meta.freezebones||[];		
	this.animations[actionName] = newClip;
	return newClip;
};
WMMD.prototype.getAnimationClip=function ( model, bvhData, tPose, seq ) {
        
	var lng, lngB, lngS, n,m, i, j, k, bone, name, tmptime, tracks;
	var sizeO = this.findSize( model, bvhData.skeleton,bvhData.bvhType );
	console.log('footY=='+sizeO.footY);
	var ratio = sizeO.ratio;
	var clip = bvhData.clip;
	var modelName = model.name;

	var bones = this.bones;
	

	//var bones =  this.getBoneList(model);
	var baseTracks = clip.tracks;
	var nodeTracks = []; // 0:position, 1:quaternion

	var times, positions, resultPositions, rotations, resultRotations, pos, rot;

	var matrixWorldInv = new Matrix4().getInverse( model.matrixWorld );

	var globalQuat = new Quaternion();
	var globalPos = new Vector3();
	var globalMtx = new Matrix4();
	var localMtx = new Matrix4();

	var parentMtx;
	
	var resultQuat = new Quaternion();
	var resultPos = new Vector3();
	var resultScale = new Vector3();
	
	if(bvhData.meta.freezebones ){
		//console.log(this.ename+'---'+bvhData.actionName+'  boneTracks=[]');
		this.boneTracks[bvhData.actionName]=[];
	}

	// 1° get bones worldMatxix in Tpose

	if( tPose === undefined||tPose === null ){

		tPose = [];
		lngB = bones.length;

		for( i = 0; i < lngB; i++ ){

			tPose[i] = bones[ i ].matrixWorld.clone();

		}

	}

	// 2° find same name bones track 

	lngB = bones.length

	for ( i = 0; i < lngB; ++ i ) {

		bone = bones[ i ];
		name = bone.name;

		//if( name === 'root' ) bone.matrixWorld.copy( tPose[i] );
		//if( name === 'hip'||name === 'Hips' ) bone.matrixWorld.copy( tPose[i] );
		//if( name === 'hip'||name === 'Hips' ) console.log('debug hip---'+bone.position.x+' '+bone.position.y+' '+bone.position.z);

		nodeTracks[ i ] = this.findBoneTrack( name, baseTracks, bvhData.bvhType );

	}

	// 3° divide track in sequency

	var fp = Math.floor(clip.frameTime * 1000);
	var frametime = 1/30;
	if( fp === 33 ) frametime = 1/30;
	if( fp === 16 ) frametime = 1/60;
	if( fp === 11 ) frametime = 1/90;
	if( fp === 8 ) frametime = 1/120;

	//clip.frameTime;

	var clipName = clip.name;
	var clipStart = 0;
	var clipEnd = 0;
	var timeStart = 0;
	var timeEnd = 0;
	var startId = 0;
	var endId = 0;
	var clipLoop = 1;

	var hipId;

	var sequences = [[ clip.name, 0, clip.frames ]];

	if(seq !== undefined ) if(seq.length) sequences = seq;

	lngS = sequences.length;

	for( k = 0; k < lngS; k++ ){

		clipName = sequences[k][0];
		clipStart = sequences[k][1];
		clipEnd = sequences[k][2];//+1;
		clipLoop = sequences[k][3] !== undefined ? sequences[k][3] : 1;

		timeStart = clipStart * frametime;
		timeEnd = clipEnd * frametime;

		tracks = [];

		// 4° copy track to track with correct matrix

		lngB = bones.length;

		for ( i = 0; i < lngB; i ++ ) {

			bone = bones[ i ];
			name = bone.name;

			if( name === 'hip' || name === 'Hips' || name === 'hips' || name === 'センター') hipId = i;

			if( nodeTracks[i].length === 2 ){

				parentMtx = bone.parent ? bone.parent.matrixWorld : matrixWorldInv;

				// rotation

				rot = nodeTracks[i][1];

				startId = this.findTime( baseTracks[rot].times, timeStart );
				endId = this.findTime( baseTracks[rot].times, timeEnd ) + 1;

				tmptime = AnimationUtils.arraySlice( baseTracks[rot].times, startId, endId );
				rotations = AnimationUtils.arraySlice( baseTracks[rot].values, startId * 4, endId * 4 );

				resultRotations = [];
				times = [];


				lng  = tmptime.length;

				
				if(bvhData.meta.reverse==true){
					for( j = 0; j < lng; j ++ ){

						times[j] = tmptime[j] - timeStart;

						n = (lng-j-1)*4;
						m = j*4;
						globalQuat.set( rotations[n], rotations[n+1], rotations[n+2], rotations[n+3] );

						globalMtx.identity().makeRotationFromQuaternion( globalQuat );
						globalMtx.multiply( tPose[i] );

						localMtx.identity().getInverse( parentMtx );
						localMtx.multiply( globalMtx );
						localMtx.decompose( resultPos, resultQuat, resultScale );

						resultQuat.normalize();

						resultRotations[m] = resultQuat.x;
						resultRotations[m+1] = resultQuat.y;
						resultRotations[m+2] = resultQuat.z;
						resultRotations[m+3] = resultQuat.w;

					}					
				}else{
					for( j = 0; j < lng; j ++ ){

						times[j] = tmptime[j] - timeStart;

						n = j*4;

						globalQuat.set( rotations[n], rotations[n+1], rotations[n+2], rotations[n+3] );

						globalMtx.identity().makeRotationFromQuaternion( globalQuat );
						globalMtx.multiply( tPose[i] );

						localMtx.identity().getInverse( parentMtx );
						localMtx.multiply( globalMtx );
						localMtx.decompose( resultPos, resultQuat, resultScale );

						resultQuat.normalize();

						resultRotations[n] = resultQuat.x;
						resultRotations[n+1] = resultQuat.y;
						resultRotations[n+2] = resultQuat.z;
						resultRotations[n+3] = resultQuat.w;

					}
				}
				if( times.length > 0 ) {
					var bTrack = new QuaternionKeyframeTrack( ".bones[" + name + "].quaternion", times, resultRotations );
					if(bvhData.meta.freezebones && bvhData.meta.freezebones.indexOf(name)!=-1){
						//console.log(this.ename+'---保存骨头轨迹--'+bvhData.actionName+'  '+name)						
						this.boneTracks[bvhData.actionName][name] = bTrack;
					}
					tracks.push(bTrack);
				}

			}

		}

		// HIP position 

		i = hipId;
		bone = bones[ i ];
		name = bone.name;

		if( nodeTracks[i].length === 2 ){			
			//parentMtx = bone.parent ? bone.parent.matrixWorld : matrixWorldInv;
			pos = nodeTracks[i][0];
			
			startId = this.findTime( baseTracks[pos].times, timeStart );
			endId = this.findTime( baseTracks[pos].times, timeEnd ) + 1;

			tmptime = AnimationUtils.arraySlice( baseTracks[pos].times, startId, endId );
			positions = AnimationUtils.arraySlice( baseTracks[pos].values, startId * 3, endId * 3 );

			times = [];
			resultPositions = [];

			lng = tmptime.length;

			
			if(bvhData.meta.reverse==true){
				for( j = 0; j < lng; j++ ){

					times[j] = tmptime[j] - timeStart;

					n = (lng-j-1)*3;
					m = j * 3;
					globalPos.set( positions[n], positions[n+1], positions[n+2] );
					globalPos.multiplyScalar( ratio );
					
					globalPos.add(new Vector3(0,sizeO.footY,0));
					if(bvhData.bvhType==='mixamo'){globalPos.add(this.mixamoOffset);}else{globalPos.add(this.offset);}					
					globalMtx.identity();
					globalMtx.setPosition( globalPos );
				   
					localMtx.identity().getInverse( this.hipParentMtx );
					localMtx.multiply( globalMtx );

					localMtx.decompose( resultPos, resultQuat, resultScale );

					resultPositions[m] = resultPos.x;
					resultPositions[m+1] = resultPos.y;
					resultPositions[m+2] = resultPos.z;

				}				
			}else{
				for( j = 0; j < lng; j++ ){

					times[j] = tmptime[j] - timeStart;

					n = j*3;

					globalPos.set( positions[n], positions[n+1], positions[n+2] );
					globalPos.multiplyScalar( ratio );
					//console.log('debug---ratio---'+ratio);					
					globalPos.add(new Vector3(0,sizeO.footY,0));
					if(bvhData.bvhType==='mixamo'){globalPos.add(this.mixamoOffset);}else{globalPos.add(this.offset);}
					globalMtx.identity();
					globalMtx.setPosition( globalPos );
				    //console.log('debug---globalPos---'+bvhData.actionName+'   '+globalPos.x+'  '+globalPos.y+'  '+globalPos.z);
					//console.log('debug---hipParentMtx---'+bvhData.actionName+'   '+this.hipParentMtx.toArray());
					localMtx.identity().getInverse( this.hipParentMtx );
					localMtx.multiply( globalMtx );
					
					localMtx.decompose( resultPos, resultQuat, resultScale );

					resultPositions[n] = resultPos.x;
					resultPositions[n+1] = resultPos.y;
					resultPositions[n+2] = resultPos.z;
					//console.log('debug---resultPos---'+bvhData.actionName+'   '+resultPos.x+'  '+resultPos.y+'  '+resultPos.z);
				}
			}
			if( times.length > 0 ){
				tracks.push( new VectorKeyframeTrack( ".bones[" + name + "].position", times, resultPositions ) );
			}

		}
		//var newClip = new AnimationClip( clipName, timeEnd-timeStart, tracks );		
		var newClip = new AnimationClip( clipName, -1, tracks );
		newClip.frameTime = frametime;
		newClip.repeat = clipLoop === 1 ? true : false;
		newClip.timeScale = 1;
		newClip.uuid = this.uuid();
	    return newClip;
	}
};
WMMD.prototype.findSize = function( target, source, type ){

    var ratio = 0.5;

    var hip = source.getBoneByName(type==='mixamo'?'mixamorig:Hips':'hip');
    var thigh = source.getBoneByName(type==='mixamo'?'mixamorig:RightUpLeg':'rThigh');
    var shin = source.getBoneByName(type==='mixamo'?'mixamorig:RightLeg':'rShin');
    var foot = source.getBoneByName(type==='mixamo'?'mixamorig:RightFoot':'rFoot');

    if( hip !== undefined && thigh !== undefined  && shin !== undefined  && foot !== undefined ){

        var sourceLegDistance = 0;
        var p = [];

        if( shin.userData.offset ){

            p[1] = new Vector3();
            p[2] = shin.userData.offset.clone();
            p[3] = foot.userData.offset.clone();

            sourceLegDistance = p[1].distanceTo( p[2] ) + p[1].distanceTo( p[3] );

        } else {

            var i = source.bones.length, b, n;
            var v = new Vector3();

            // force skeleton update
            hip.updateMatrixWorld( true );

            p[1] = thigh.getWorldPosition( v.clone() );
            p[2] = shin.getWorldPosition( v.clone() );
            p[3] = foot.getWorldPosition( v.clone() );

            sourceLegDistance = p[1].distanceTo( p[2] ) + p[2].distanceTo( p[3] );

        }

        var targetLegDistance = this.sizes[ target.name ];

        ratio = (targetLegDistance / sourceLegDistance).toFixed(4) * 1.0;

    } else {

        console.log( 'Bad bvh name = unexpected result !!' );

    }
	console.log('this.halfExtent.y=='+this.halfExtent.y+'    p[3].y*ratio='+p[3].y*ratio);
	//bvh 运动调整偏差
	this.offset = new Vector3(0,this.halfExtent.y-(this.vmdOffset?this.vmdOffset[1]:0),0);
	this.mixamoOffset = new Vector3(0,-this.halfExtent.y-(this.vmdOffset?this.vmdOffset[1]:0)-0.4,0);
	return {ratio:ratio,footY:p[3].y*ratio};
};
WMMD.prototype.findTime = function( times, value ){

    var lng = times.length, i, t, n = 0;

    for( i=0; i<lng; i++ ){

        t = times[i];
        if( t > value ) break;
        n = i;

    }

    return n;

};
WMMD.prototype.uuid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};
WMMD.prototype.renameBone = function( bone, names ){

    for( var n in names ){
        if( bone.name === n ) bone.name = names[n];
    }

};


WMMD.prototype.findBoneRealName = function(bname, bvhType){
	//console.log('bname1==='+bname+' bvhType==='+bvhType);
	if(bname=="Hips" || bname=="hips" || bname=="センター"){
		bname  = bvhType==="mixamo"?"mixamorig:Hips":"hip";
	}else if(bname=="LowerBack" || bname=="spine" || bname=="上半身2"){//脊柱
		bname  = bvhType==="mixamo"?"mixamorig:Spine":"abdomen";//腹部
	}else if(bname=="Neck" || bname=="neck" || bname=="首"){
		bname  = bvhType==="mixamo"?"mixamorig:Neck":"neck";
	}else if(bname=="Spine" || bname=="chest" || bname=="chest1" || bname=="上半身"){
		bname  = bvhType==="mixamo"?"mixamorig:Spine1":"chest";
	}else if(bname=="Head" || bname=="head" || bname=="頭"){
		bname  = bvhType==="mixamo"?"mixamorig:Head":"head";
	}else if(bname=="LeftUpLeg" || bname=="thighL" || bname=="左足"){
		bname  = bvhType==="mixamo"?"mixamorig:LeftUpLeg":"lThigh";
	}else if(bname=="RightUpLeg" || bname=="thighR" || bname=="右足"){
		bname  = bvhType==="mixamo"?"mixamorig:RightUpLeg":"rThigh";
	}else if(bname=="LeftLeg" || bname=="shinL" || bname=="左ひざ"){
		bname  = bvhType==="mixamo"?"mixamorig:LeftLeg":"lShin";
	}else if(bname=="RightLeg" || bname=="shinR"  || bname=="右ひざ"){
		bname  = bvhType==="mixamo"?"mixamorig:RightLeg":"rShin";
	}else if(bname=="LeftFoot" || bname=="footL"  || bname=="左足首"){
		bname  = bvhType==="mixamo"?"mixamorig:LeftFoot":"lFoot";
	}else if(bname=="RightFoot" || bname=="footR" || bname=="右足首"){
		bname  = bvhType==="mixamo"?"mixamorig:RightFoot":"rFoot";
		
	}else if(bname=="LeftShoulder" || bname=="shoulderL"  || bname=="左肩"){
		bname  = bvhType==="mixamo"?"mixamorig:LeftShoulder":"lCollar";
	}else if(bname=="RightShoulder" || bname=="shoulderR"  || bname=="右肩"){
		bname  = bvhType==="mixamo"?"mixamorig:RightShoulder":"rCollar";
	}else if(bname=="LeftArm" || bname=="upper_armL" || bname=="左腕"){
		bname  = bvhType==="mixamo"?"mixamorig:LeftArm":"lShldr";
	}else if(bname=="RightArm" || bname=="upper_armR"  || bname=="右腕"){
		bname  = bvhType==="mixamo"?"mixamorig:RightArm":"rShldr";
	}else if(bname=="LeftForeArm" || bname=="forearmL"  || bname=="左ひじ"){
		bname  = bvhType==="mixamo"?"mixamorig:LeftForeArm":"lForeArm";
	}else if(bname=="RightForeArm" || bname=="forearmR" || bname=="右ひじ"){
		bname  = bvhType==="mixamo"?"mixamorig:RightForeArm":"rForeArm";
	}else if(bname == "LeftHand" || bname=="handL" || bname=="左手首"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHand":"lHand";
	}else if(bname == "RightHand" || bname=="handR" || bname=="右手首"){
		bname = bvhType==="mixamo"?"mixamorig:RightHand":"rHand";
	}else if(bname == "thumb01L" || bname=="左親指１"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandThumb1":bname;
	}else if(bname == "thumb02L" || bname=="左親指２"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandThumb2":bname;
	}else if(bname == "thumb03L" || bname=="左親指先"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandThumb3":bname;
	}else if(bname == "f_index01L" || bname=="左人指１"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandIndex2":bname;
	}else if(bname == "f_index02L" || bname=="左人指２"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandIndex3":bname;
	}else if(bname == "f_index03L" || bname=="左人指３"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandIndex4":bname;
	}else if(bname == "f_middle01L" || bname=="左中指１"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandMiddle2":bname;
	}else if(bname == "f_middle02L" || bname=="左中指２"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandMiddle3":bname;
	}else if(bname == "f_middle03L" || bname=="左中指３"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandMiddle4":bname;
	}else if(bname == "f_ring01L" || bname=="左薬指１"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandRing2":bname;
	}else if(bname == "f_ring02L" || bname=="左薬指２"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandRing3":bname;
	}else if(bname == "f_ring03L" || bname=="左薬指３"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandRing4":bname;
	}else if(bname == "f_pinky01L" || bname=="左小指１"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandPinky2":bname;
	}else if(bname == "f_pinky02L" || bname=="左小指２"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandPinky3":bname;
	}else if(bname == "f_pinky03L" || bname=="左小指３"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandPinky4":bname;
	}
	else if(bname == "thumb01R" || bname=="右親指１"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandThumb1":bname;
	}else if(bname == "thumb02R" || bname=="右親指２"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandThumb2":bname;
	}else if(bname == "thumb03R" || bname=="右親指先"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandThumb3":bname;
	}else if(bname == "f_index01R" || bname=="右人指１"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandIndex2":bname;
	}else if(bname == "f_index02R" || bname=="右人指２" ){
		bname = bvhType==="mixamo"?"mixamorig:RightHandIndex3":bname;
	}else if(bname == "f_index03R" || bname=="右人指３"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandIndex4":bname;
	}else if(bname == "f_middle01R"  || bname=="右中指１"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandMiddle2":bname;
	}else if(bname == "f_middle02R" || bname=="右中指２"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandMiddle3":bname;
	}else if(bname == "f_middle03R" || bname=="右中指３"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandMiddle4":bname;
	}else if(bname == "f_ring01R" || bname=="右薬指１"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandRing2":bname;
	}else if(bname == "f_ring02R" || bname=="右薬指２" ){
		bname = bvhType==="mixamo"?"mixamorig:RightHandRing3":bname;
	}else if(bname == "f_ring03R"  || bname=="右薬指３"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandRing4":bname;
	}else if(bname == "f_pinky01R" || bname=="右小指１"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandPinky2":bname;
	}else if(bname == "f_pinky02R" || bname=="右小指２"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandPinky3":bname;
	}else if(bname == "f_pinky03R" || bname=="右小指３"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandPinky4":bname;
	}
	//console.log('bname2==='+bname);
	return bname;
};
WMMD.prototype.findBoneTrack = function( name, tracks, bvhType ){

	name = this.findBoneRealName(name, bvhType);
    var n, nodeName, type, result = [];
    for ( var i = 0; i < tracks.length; ++ i ) {

        n = tracks[i].name;
        nodeName =  n.substring( n.indexOf('[')+1, n.indexOf(']') );
        type = n.substring( n.lastIndexOf('.')+1 );

        if( name === nodeName ){
            if(type === 'position') result[0] = i;
            else result[1] = i;
        } 

    }
    return result;
};
//-----------------------
// skeleton Helper
//-----------------------

WMMD.prototype.addHelper = function (){

    this.helper = new SkeletonHelper( this.model );
    window.WEngine.view.addVisual( this.helper );

};

WMMD.prototype.removeHelper = function (){

	if(this.helper!=null){
		window.WEngine.view.removeVisual( this.helper );
		this.helper = null;
	}
};

WMMD.prototype.showSkeleton = function(b){
	if(b){
		this.addHelper();
	}else{
		this.removeHelper();
	}
}
export { WMMD };