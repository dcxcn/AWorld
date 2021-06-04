import {
	Vector3,
	Matrix4,
	Quaternion	
} from "../libs/three.module.js";

var WAnimalPhySkeleton = function( human ){
	this.bones = human.bones;
    this.data = new Float32Array( this.bones.length*8 );
    this.isRunning = false;
    this.boneDecal = [];
	this.phyBones=[];
    this.root = human;

    this.matrix = human.model.matrixWorld;
    this.matrixAutoUpdate = false;

};

WAnimalPhySkeleton.prototype = {
    constructor : WAnimalPhySkeleton,

    distance : function( v1, v2 ){
        var d = v2.clone().sub(v1);
        return Math.sqrt( d.x * d.x + d.y * d.y + d.z * d.z );

    },
	init:function(){
		var scale = 0.01;
		var p1 = new Vector3();
		var p2 = new Vector3();
		var type,size;
        var i = this.bones.length , bone, name, ln, lz, ls;
		var ammobodyName;
        while(i--){

            bone = this.bones[i];
            name = bone.name;
			ammobodyName = this.root.ename+"_"+name;
			bone.ammobodyName = ammobodyName;
			bone.getWorldPosition(p1);
            if( bone.children.length > 0 ) {
				bone.children[0].getWorldPosition(p2);		
			}
			ln = 10*scale;
			ls = 32*scale;
			lz = 4*scale;
			
			this.boneDecal[i] = ls*0.5;
			type = null;
		   
			if( name === 'Head' ){
				type = 'sphere';
				size = [8*scale];
				this.boneDecal[i] = 5*scale*0.5;				
			}
			else if(name === 'Neck' || name === 'Neck1' || name==='neck'){ 
				type = 'cylinder'; 
				size = [lz, ln, lz];
				this.boneDecal[i] = -1*scale*0.5;
			}
			else if(name==='Spine' || name==='chest' ){ 				
				type = 'sphere'; 
				size = [16*scale]; 
			}else if(name==='LowerBack' || name==='abdomen' ){ 				
				type = 'sphere'; 
				size = [14*scale];			
			}
			else if(name==='Hips' || name==='hip' ){ 				
				type = 'sphere'; 
				size = [12*scale]; 
				this.boneDecal[i]=0;				
			}
			else if(name === 'LeftUpLeg' || name === 'RightUpLeg' || name==='lThigh' || name==='rThigh'){ 
			  lz = 6*scale;
			  if( bone.children[0]  ) 
				ln = this.distance(p1, p2)+2*scale;				 
				ls = ln;				
				type = 'cylinder'; 
				size = [lz, ln, lz];
			
			}
			else if(name === 'LeftLeg' || name === 'RightLeg' || name==='lShin' || name==='rShin'){ 
				lz = 4.6*scale;
				ln = this.distance( bone.parent.position, bone.position )+2*scale;
				ls = ln;
				type = 'cylinder'; 
				size = [lz, ln, lz]; 
			}
			else if( name === 'LeftFoot' || name === 'RightFoot' || name==='lFoot' || name==='rFoot'){ 
				lz = 3.2*scale;
				ln = 12*scale;
				ls = 6*scale;
				type = 'box';
				size = [lz*2, ln, lz];
				this.boneDecal[i]=0;
			}
			else if( name === 'LeftToeBase' || name === 'RightToeBase' || name==='lFoot' || name==='rFoot'){ 
				lz = 3.2*scale;
				ln = 6*scale;
				ls = 6*scale;
				type = 'box';
				size = [lz*2, ln, lz];
				this.boneDecal[i]=0;
			}
			else if(name=="LeftShoulder" || name=="RightShoulder" || name==='lCollar' || name==='rCollar'){ 
				type = 'sphere'; 
				size = [4.6*scale];
			}
			else if(name=="LeftArm" || name=="RightArm" || name==='lShldr' || name==='rShldr'){ 
			
				lz = 4.6*scale;
				if( bone.children[0]  ) 
					ln = this.distance(p1, p2 )+4*scale;					
				ls = ln;
			  
				type = 'cylinder'; 
				size = [lz, ln, lz];  
			}
			else if(name=="LeftForeArm" || name=="RightForeArm" || name==='lForeArm' || name==='rForeArm'){ 
				lz = 2*scale;
				ln = this.distance( bone.parent.position, bone.position )+3*scale;
				ls = ln;
				
				type = 'cylinder'; 
				size = [lz, ln, lz];   
			}
			else if(name == "LeftHand" || name == "RightHand" || name==='lHand' || name==='rHand'){ 
				if( bone.children[0]  ) 
					ln = this.distance(p1, p2 );
				ls = ln;
				type = 'box';
				size = [lz, ln, lz];
			}

			if(type!=null){
				this.phyBones.push(				
				window.AWEngine.add({   
					type:type,
					size:size, 
					pos:p1.toArray(), 
					name:ammobodyName, 
					mass:3, 
					flag:2, 
					state:4, 
					friction:0.5, 
					restitution:0.9, 
					kinematic:true,
					mask:2
				}));

			}
		}
		this.isRunning = true;

    },
	showPhyBones:function(b){
		var i = this.phyBones.length;
		while(i--){
			this.phyBones[i].visible=b;
		}
	},
    update:function(delta){
        if(!this.isRunning) return;
		//this.root.update(delta);
        var boneMatrix = new Matrix4();
        var bone;
        var pos = new Vector3();
        var quat = new Quaternion();

		//var tmpTrans = new window.Ammo.btTransform()
		//var tmpPos = new window.Ammo.btVector3();
		//var tmpQuat = new window.Ammo.btQuaternion();
		var i = this.bones.length;
        while ( i-- ) {

			var mtx = new Matrix4();
			var mtx2 = new Matrix4();
			bone = this.bones[i];
			//console.log(i+'==name=='+bone.name);
			if(i!=14 && i!=15 && i!=24 && i!=25 ){

				//30==name==RightToeBase
				//29==name==RightFoot
				//28==name==RightLeg
				//27==name==RightUpLeg
				//26==name==RHipJoint
				//25==name==RightHandFinger1
				//24==name==RightFingerBase
				//23==name==RThumb
				//22==name==RightHand
				//21==name==RightForeArm
				//20==name==RightArm
				//19==name==RightShoulder
				//18==name==Head
				//17==name==Neck1
				//16==name==Neck
				//15==name==LeftHandFinger1
				//14==name==LeftFingerBase
				//13==name==LThumb
				//12==name==LeftHand
				//11==name==LeftForeArm
				//10==name==LeftArm
				//9==name==LeftShoulder
				//8==name==Spine1
				//7==name==Spine
				//6==name==LowerBack
				//5==name==LeftToeBase
				//4==name==LeftFoot
				//3==name==LeftLeg
				//2==name==LeftUpLeg
				//1==name==LHipJoint
				//0==name==Hips


				/*if(i!=2&&i!=3&&i!=28&&i!=27&&i!=7&&i!=8&&i!=4&&i!=29&&i!=16&&i!=17&&i!=0){
					//mtx.makeRotationZ( Math.PI*0.5 );					
				}
				if( i==6 || i==20 || i==21 || i==22){ 
					mtx2.makeTranslation(0, this.boneDecal[i], 0);
				}else{
					//mtx.makeRotationY( Math.PI*0.5 );
					//mtx2.makeTranslation(0, -this.boneDecal[i], 0);
					mtx2.makeTranslation(0, this.boneDecal[i], 0);
				}*/
				mtx2.makeTranslation(0, this.boneDecal[i], 0);
                mtx.multiply( mtx2 );

                boneMatrix.multiplyMatrices( bone.matrixWorld, mtx );
                pos.setFromMatrixPosition( boneMatrix );
                quat.setFromRotationMatrix( boneMatrix );
				window.AWEngine.options({
					name: bone.ammobodyName,
					type: 'Rigid',
					flag:2,
					trans:[pos.x,pos.y, pos.z,quat.x, quat.y, quat.z, quat.w ]
				});
				
            }
                
        }

    }
}

export { WAnimalPhySkeleton };