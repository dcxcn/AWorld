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
import { WAvatarPhySkeleton }  from '../../jsm/world/WAvatarPhySkeleton.js';
var WAvatar = function (pConfO) {
	
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
	this.mixamoOffset = new Vector3(0,0,0);
	this.size = pConfO.size;	
	this.addModel(window.WEngine.view.getModel(this.ename));
	this.initActions(pConfO)
	this.damageUUIDS = [];
	
	if(pConfO.physicBody){
		this.initPhysicSkeleton();
	}	
    this.isReady = true;
};

WAvatar.prototype =  {
	//这里放属性，被多个孩子共用
	constructor:WAvatar,
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
	makeAnimation:function(actionO,actionName,meta){
		var parseData = this.bvhData[actionName] =  this.bvhLoader.parse(actionO.data);
		parseData.actionName = actionName;
		parseData.bvhType = actionO.type;
		parseData.meta = meta;
		var newClip = this.getAnimationClip( this.model, parseData, this.tPose_idx );
		this.freezeBones[actionName]=meta.freezebones||[];		
		this.animations[actionName] = newClip;
		return newClip;
	},
	playAction : function(actionName){
		if(this.isTestBvh || !this.hasActions || this.logicPlay) return;
		this.doAction(actionName);
	},
	doAction : function(actionName){
		
		window.WEngine.playSound(this.model.parent,actionName);
		if(actionName!=this.curActionName) window.WEngine.stopPlaySound(this.model.parent,this.curActionName);

		
		//console.log(this.ename+'----doAction=='+actionName);
		if( this.curFreezeActionName==actionName){
			this.curFreezeActionName = null;
			return;
		}
		if(this.freezeBones[actionName].length>0){
			this.curFreezeActionName = actionName;
		}
		
		if(this.curFreezeActionName!=null && this.curFreezeActionName!=actionName){
			if(this.actions[actionName+"_"+this.curFreezeActionName]){
				this.actions[actionName+"_"+this.curFreezeActionName].play();
				//console.log("play actionName=="+actionName+"_"+this.curFreezeActionName);
			}else{
				//如果有冻结的骨头，需要重新生成当前的action
				var newClip = this.animations[actionName].clone() ;
				for(var i=0;i<newClip.tracks.length;i++){
					var noFreeze = true;
					var trackName = newClip.tracks[i].name;
					for(var j=0;j<this.freezeBones[this.curFreezeActionName].length;j++){						
						var freezeName = this.freezeBones[this.curFreezeActionName][j];						
						if(trackName.indexOf(freezeName)!=-1 && this.boneTracks[this.curFreezeActionName].hasOwnProperty(freezeName)){
							//console.log(this.ename+'---冻结骨头---'+freezeName);
							newClip.tracks[i] = this.boneTracks[this.curFreezeActionName][freezeName];
							break;
						}
					}
				}				
				this.animations[actionName+"_"+this.curFreezeActionName] = newClip;				
				this.actions[actionName+"_"+this.curFreezeActionName] = this.mixer.clipAction( newClip);				
				this.actions[actionName+"_"+this.curFreezeActionName].play();
			}
			//console.log("play actionName=="+actionName+"_"+this.curFreezeActionName);

		}else{
			if(this.actions[actionName]==null){
				this.actions[actionName] = this.mixer.clipAction( this.animations[actionName] );
			}
			//console.log("play actionName=="+actionName);
			this.actions[actionName].play();
		}
		//停止上一次Action
		if(this.curActionName!=null 
		&& this.actions[this.curActionName]!=null 
		&& this.curActionName!=actionName 
		&& this.curActionName!=actionName+"_"+this.curFreezeActionName){
			this.actions[this.curActionName].stop();
			
		}
		//设置当前actionName
		if(this.curFreezeActionName!=null && this.curFreezeActionName!=actionName){
			this.curActionName= actionName+"_"+this.curFreezeActionName;
		}else{
			this.curActionName= actionName;
		}		
	},
	getKey : function(){
		if(window.WEngine.currentFollow && window.WEngine.currentFollow.userData.avatar == this){
			return window.WEngine.user.keyboard.getKey();
		}else{
			return  new Float32Array( 20 );
		}
	},
	addHandGun : function (){
		if( this.handGun){
			this.handR.remove( this.handGun );
		}	
		var gun = window.WEngine.byName('handgun1');
		gun.position.set(-0.05,0.05,0);
		gun.rotation.set(0,Math.PI/2,Math.PI/2*0.85);
		this.handR.add( gun );
		this.handGun  = gun;
	},
	getThrowPos : function (){
		var throwPos = new Vector3();
		if( this.handGun){
			throwPos.set(0,0,0);
			throwPos.add( this.handGun.userData.muzzle.getWorldPosition( new Vector3()));
		}else{
			throwPos.set(0,2,0);
			throwPos.add( this.parent.position );
		}
		return throwPos;
	},
	getThrowDir : function (){
		var throwDir = new Vector3();		
		if( this.handGun){
			var muzzleP = this.handGun.userData.muzzle.getWorldPosition( new Vector3());
			var muzzleBackP = this.handGun.userData.muzzleBack.getWorldPosition( new Vector3());
			throwDir.copy(muzzleP);
			throwDir.sub(muzzleBackP);
		}else{		
			var throwRot = this.model.parent.userData.characterController.rotation-Math.PI/2;
			throwDir.set( Math.cos(throwRot),0,-Math.sin(throwRot));		
		}
		throwDir.multiplyScalar( 250 );
		return throwDir;
	},
	update : function(delta){
		this.mixer.update( delta );
		if(this.physicSkeleton){
			this.physicSkeleton.update(delta);
		};		
		//console.log("this.model.position="+this.model.position.x+"---"+this.model.position.y+"---"+this.model.position.z);
	}
};
WAvatar.prototype.addModel = function( model, options ){	
	model.traverse(function (child) {
		if (child.isMesh) {
			child.castShadow = true;                       
			child.material.alphaTest=0.1;
			//console.log(child);
			//console.log(child.material.alphaTest);						
		}
	});
	this.model = model;	
	if(!this.size){
		this.box = new Box3().setFromObject(model);
		this.halfExtent =  new Vector3(
			(this.box.max.x - this.box.min.x) * 0.25,
			(this.box.max.y - this.box.min.y) * 0.5,
			(this.box.max.z - this.box.min.z) * 0.25
		);
		this.size = [this.halfExtent.x,this.halfExtent.y,this.halfExtent.z];
	}else{		
		this.halfExtent =  new Vector3(this.size[0],this.size[1],this.size[2]);
	}
	this.model.position.set(0,-this.size[ 1 ],0);
	this.mixer = new AnimationMixer( this.model );
    if( this.tPose_idx === undefined ) this.tPose_idx = [];
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
	this.model.skeleton = new Skeleton(this.bones);
    var name = model.name;
	
    var bones = this.bones;
    var lng = bones.length, i, b, n;
    var v = new Vector3();
    var p = [];

    for( i = 0; i < lng; i++ ){ 

        b = bones[ i ];
		b.skeleton = this.model.skeleton;		

	    if( b.name === 'hip' || b.name === 'Hips' ||b.name === 'hips' || b.name === 'mixamorigHips') this.hipParentMtx = b.parent.matrixWorld.clone();//必须clone
		//console.log('hipParentMtx----'+this.hipParentMtx.toArray());
		
        // get id of parent bones
        if( b.parent ) b.userData['id'] = bones.indexOf( b.parent );

        if( options !== undefined ) this.renameBone( b, options.names );

        n = -1;
        if( b.name === 'rThigh' || b.name === 'RightUpLeg' || b.name === 'thighR' || b.name === 'mixamorigRightUpLeg') n = 1;
        if( b.name === 'rShin' || b.name === 'RightLeg' || b.name === 'shinR' || b.name === 'mixamorigRightLeg') n = 2;
        if( b.name === 'rFoot' || b.name === 'RightFoot' || b.name === 'footR' || b.name === 'mixamorigRightFoot') n = 3; 
        if( n!==-1 ) p[n] = b.getWorldPosition( v.clone() )
			
		if( b.name === 'RightHand' || b.name === 'handR' || b.name === 'mixamorigRightHand') this.handR = b;
        this.tPose_idx[i] = b.matrixWorld.clone();

    }
    this.sizes[name] = p[1].distanceTo( p[2] ) + p[2].distanceTo( p[3] );

};
WAvatar.prototype.renameBone = function( bone, names ){

    for( var n in names ){
        if( bone.name === n ) bone.name = names[n];
    }

};


WAvatar.prototype.findBoneRealName = function(bname, bvhType){
	//console.log('bname1==='+bname+' bvhType==='+bvhType);
	if(bname=="Hips" || bname=="hips" || bname=="mixamorigHips"){
		bname  = bvhType==="mixamo"?"mixamorig:Hips":"hip";
	}else if(bname=="LowerBack" || bname=="spine" || bname=="mixamorigSpine"){//脊柱
		bname  = bvhType==="mixamo"?"mixamorig:Spine":"abdomen";//腹部
	}else if(bname=="Neck" || bname=="neck" || bname=="mixamorigNeck"){
		bname  = bvhType==="mixamo"?"mixamorig:Neck":"neck";
	}else if(bname=="Spine" || bname=="chest" || bname=="chest1" || bname=="mixamorigSpine1"){
		bname  = bvhType==="mixamo"?"mixamorig:Spine1":"chest";
	}else if(bname=="Head" || bname=="head" || bname=="mixamorigHead"){
		bname  = bvhType==="mixamo"?"mixamorig:Head":"head";
	}else if(bname=="LeftUpLeg" || bname=="thighL" || bname=="mixamorigLeftUpLeg"){
		bname  = bvhType==="mixamo"?"mixamorig:LeftUpLeg":"lThigh";
	}else if(bname=="RightUpLeg" || bname=="thighR" || bname=="mixamorigRightUpLeg"){
		bname  = bvhType==="mixamo"?"mixamorig:RightUpLeg":"rThigh";
	}else if(bname=="LeftLeg" || bname=="shinL" || bname=="mixamorigLeftLeg"){
		bname  = bvhType==="mixamo"?"mixamorig:LeftLeg":"lShin";
	}else if(bname=="RightLeg" || bname=="shinR"  || bname=="mixamorigRightLeg"){
		bname  = bvhType==="mixamo"?"mixamorig:RightLeg":"rShin";
	}else if(bname=="LeftFoot" || bname=="footL"  || bname=="mixamorigLeftFoot"){
		bname  = bvhType==="mixamo"?"mixamorig:LeftFoot":"lFoot";
	}else if(bname=="RightFoot" || bname=="footR" || bname=="mixamorigRightFoot"){
		bname  = bvhType==="mixamo"?"mixamorig:RightFoot":"rFoot";
		
	}else if(bname=="LeftShoulder" || bname=="shoulderL"  || bname=="mixamorigLeftShoulder"){
		bname  = bvhType==="mixamo"?"mixamorig:LeftShoulder":"lCollar";
	}else if(bname=="RightShoulder" || bname=="shoulderR"  || bname=="mixamorigRightShoulder"){
		bname  = bvhType==="mixamo"?"mixamorig:RightShoulder":"rCollar";
	}else if(bname=="LeftArm" || bname=="upper_armL" || bname=="mixamorigLeftArm"){
		bname  = bvhType==="mixamo"?"mixamorig:LeftArm":"lShldr";
	}else if(bname=="RightArm" || bname=="upper_armR"  || bname=="mixamorigRightArm"){
		bname  = bvhType==="mixamo"?"mixamorig:RightArm":"rShldr";
	}else if(bname=="LeftForeArm" || bname=="forearmL"  || bname=="mixamorigLeftForeArm"){
		bname  = bvhType==="mixamo"?"mixamorig:LeftForeArm":"lForeArm";
	}else if(bname=="RightForeArm" || bname=="forearmR" || bname=="mixamorigRightForeArm"){
		bname  = bvhType==="mixamo"?"mixamorig:RightForeArm":"rForeArm";
	}else if(bname == "LeftHand" || bname=="handL" || bname=="mixamorigLeftHand"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHand":"lHand";
	}else if(bname == "RightHand" || bname=="handR" || bname=="mixamorigRightHand"){
		bname = bvhType==="mixamo"?"mixamorig:RightHand":"rHand";
	}else if(bname == "thumb01L" || bname=="mixamorigLeftHandThumb1"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandThumb1":bname;
	}else if(bname == "thumb02L" || bname=="mixamorigLeftHandThumb2"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandThumb2":bname;
	}else if(bname == "thumb03L" || bname=="mixamorigLeftHandThumb3"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandThumb3":bname;
	}else if(bname == "f_index01L" || bname=="mixamorigLeftHandIndex2"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandIndex2":bname;
	}else if(bname == "f_index02L" || bname=="mixamorigLeftHandIndex3"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandIndex3":bname;
	}else if(bname == "f_index03L" || bname=="mixamorigLeftHandIndex4"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandIndex4":bname;
	}else if(bname == "f_middle01L" || bname=="mixamorigLeftHandMiddle2"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandMiddle2":bname;
	}else if(bname == "f_middle02L" || bname=="mixamorigLeftHandMiddle3"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandMiddle3":bname;
	}else if(bname == "f_middle03L" || bname=="mixamorigLeftHandMiddle4"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandMiddle4":bname;
	}else if(bname == "f_ring01L" || bname=="mixamorigLeftHandRing2"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandRing2":bname;
	}else if(bname == "f_ring02L" || bname=="mixamorigLeftHandRing3"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandRing3":bname;
	}else if(bname == "f_ring03L" || bname=="mixamorigLeftHandRing4"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandRing4":bname;
	}else if(bname == "f_pinky01L" || bname=="mixamorigLeftHandPinky2"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandPinky2":bname;
	}else if(bname == "f_pinky02L" || bname=="mixamorigLeftHandPinky3"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandPinky3":bname;
	}else if(bname == "f_pinky03L" || bname=="mixamorigLeftHandPinky4"){
		bname = bvhType==="mixamo"?"mixamorig:LeftHandPinky4":bname;
	}
	else if(bname == "thumb01R" || bname=="mixamorigRightHandThumb1"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandThumb1":bname;
	}else if(bname == "thumb02R" || bname=="mixamorigRightHandThumb2"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandThumb2":bname;
	}else if(bname == "thumb03R" || bname=="mixamorigRightHandThumb3"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandThumb3":bname;
	}else if(bname == "f_index01R" || bname=="mixamorigRightHandIndex2"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandIndex2":bname;
	}else if(bname == "f_index02R" || bname=="mixamorigRightHandIndex3" ){
		bname = bvhType==="mixamo"?"mixamorig:RightHandIndex3":bname;
	}else if(bname == "f_index03R" || bname=="mixamorigRightHandIndex4"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandIndex4":bname;
	}else if(bname == "f_middle01R"  || bname=="mixamorigRightHandMiddle2"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandMiddle2":bname;
	}else if(bname == "f_middle02R" || bname=="mixamorigRightHandMiddle3"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandMiddle3":bname;
	}else if(bname == "f_middle03R" || bname=="mixamorigRightHandMiddle4"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandMiddle4":bname;
	}else if(bname == "f_ring01R" || bname=="mixamorigRightHandRing2"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandRing2":bname;
	}else if(bname == "f_ring02R" || bname=="mixamorigRightHandRing3" ){
		bname = bvhType==="mixamo"?"mixamorig:RightHandRing3":bname;
	}else if(bname == "f_ring03R"  || bname=="mixamorigRightHandRing4"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandRing4":bname;
	}else if(bname == "f_pinky01R" || bname=="mixamorigRightHandPinky2"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandPinky2":bname;
	}else if(bname == "f_pinky02R" || bname=="mixamorigRightHandPinky3"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandPinky3":bname;
	}else if(bname == "f_pinky03R" || bname=="mixamorigRightHandPinky4"){
		bname = bvhType==="mixamo"?"mixamorig:RightHandPinky4":bname;
	}
	//console.log('bname2==='+bname);
	return bname;
};


WAvatar.prototype.findBoneTrack = function( name, tracks, bvhType ){

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
WAvatar.prototype.findTime = function( times, value ){

    var lng = times.length, i, t, n = 0;

    for( i=0; i<lng; i++ ){

        t = times[i];
        if( t > value ) break;
        n = i;

    }

    return n;

};
WAvatar.prototype.uuid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};
WAvatar.prototype.findSize = function( target, source, type ){

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
	if(target.modelType == 'gltf'){
		this.offset = new Vector3(0,0.1+this.halfExtent.y,0);
		this.mixamoOffset = new Vector3(0,-this.halfExtent.y*5.5+3.6,0);
		return {ratio:ratio,footY:p[3].y*ratio};
	}else if(target.modelType == 'fbx'){
		this.offset = new Vector3(0,p[3].y*ratio*8.35,0);
		this.mixamoOffset = new Vector3(0,0,0);
		return {ratio:ratio,footY:-p[3].y*ratio*8.5-this.halfExtent.y+0.78};
	}
};

WAvatar.prototype.getAnimationClip=function ( model, bvhData, tPose, seq ) {
        
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

	var matrixWorldInv = new Matrix4().copy( model.matrixWorld ).invert();

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

			if( name === 'hip' || name === 'Hips' || name === 'hips' || name === 'mixamorigHips') hipId = i;

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

						localMtx.identity().copy( parentMtx ).invert();
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

						localMtx.identity().copy( parentMtx ).invert();
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
				   
					localMtx.identity().copy( this.hipParentMtx ).invert();
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
					localMtx.identity().copy( this.hipParentMtx ).invert();
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

WAvatar.prototype.initPhysicSkeleton = function() {
	console.log("initPhysicSkeleton=="+this.ename);
	this.physicSkeleton = new WAvatarPhySkeleton( this );	
	this.physicSkeleton.init();
};
WAvatar.prototype.initActions = function (pConfO){
	if(pConfO.hasOwnProperty("actions")){
		this.hasActions = true;
		var actions = pConfO.actions;
		for(var i=0;i<actions.length;i++){
			var actionO = window.WEngine.getActionData(actions[i].refBVH);		
			var newClip = this.makeAnimation(actionO,actions[i].name,actions[i]);
			this.actions[actions[i].name] = this.mixer.clipAction( newClip);
		}
	}else{
		this.hasActions = false;
	}
};
//-----------------------
// skeleton Helper
//-----------------------

WAvatar.prototype.addHelper = function (){

    this.helper = new SkeletonHelper( this.model );
    window.WEngine.view.addVisual( this.helper );

};

WAvatar.prototype.removeHelper = function (){

	if(this.helper!=null){
		window.WEngine.view.removeVisual( this.helper );
		this.helper = null;
	}
};

WAvatar.prototype.showSkeleton = function(b){
	if(b){
		this.addHelper();
	}else{
		this.removeHelper();
	}
}
export { WAvatar };