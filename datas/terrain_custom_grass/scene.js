{
	ename:window.world.currentSceneName,
	models:[{
		name:'human1',
		url:'./assets/models/avatar/makehuman/human1/human1.gltf',
		isSet:false	
	}],	
	materials:[{
			name:'ball0',
			type : 'Standard',
			color: 0xffffff,
			opacity: 1,
			metalness: 0.4,
			roughness: 0.5,
			transparent: false,
			map:{url:'ball/ball.jpg',wrap:1,repeat:[1,1]},
			normalMap:{url:'ball/ball_n.jpg',normalScale:[-1,-1]}
	},{
		name:'rs_grass1',
		type : 'RawShader',
		uniforms:{
			map: {
				value: WTextures.make({url:"plant/grass1.png",name:"grass1"})
			},
			alphaMap: {
				value:  WTextures.make({url:"plant/grass2.png",name:"grass2"})
			},
			time: {
				type: 'float',
				value: 0
			},
			blade_h:{
				type: 'float',
				value: 0.5
			}
		},
		vertexShaderSrc:"vs.glsl",
		fragmentShaderSrc:"fs.glsl",
		loop:function(delta){
			var uniforms1 = AWEngine.getShaderUnforms("rs_grass1");
			uniforms1.time.value += 1 / 100;
		},
		debugParams:[{name:"time",min:0,max:10,step:0.01,value:5,f:function(val){
			var uniforms1 = AWEngine.getShaderUnforms("rs_grass1");
			uniforms1.time.value = val;
		}},{name:"blade_h",min:0.1,max:3,step:0.1,value:1,f:function(val){
			var uniforms1 = AWEngine.getShaderUnforms("rs_grass1");
			uniforms1.blade_h.value = val;
		}}
		]
	}],
	sounds:[{
		name:'avatar_walk_f',
		url:'./assets/sounds/avatar_walk_f.mp3'
	},{
		name:'avatar_walk_b',
		url:'./assets/sounds/avatar_walk_b.mp3'
	},{
		name:'avatar_run',
		url:'./assets/sounds/avatar_run.mp3'
	},{
		name:'addbullet',
		url:'./assets/sounds/addbullet.mp3'
	},{
		name:'gun01',
		url:'./assets/sounds/gun01.mp3'
	}],
	actions:[{
		name:'avatar_stand',
		url:'./assets/bvhs/avatar_stand.bvh'
	},{
		name:'avatar_slowwalk',
		url:'./assets/bvhs/avatar_slowwalk.bvh'
	},{
		name:'avatar_walk',
		url:'./assets/bvhs/avatar_walk.bvh'
	},{
		name:'avatar_female_walk',
		url:'./assets/bvhs/avatar_female_walk.bvh'
	},{
		name:'avatar_crouch',
		url:'./assets/bvhs/avatar_crouch.bvh'
	},{
		name:'avatar_crouchwalk',
		url:'./assets/bvhs/avatar_crouchwalk.bvh'
	},{
		name:'avatar_run',
		url:'./assets/bvhs/avatar_run.bvh'
	},{
		name:'avatar_prejump',
		url:'./assets/bvhs/avatar_prejump.bvh'
	},{
		name:'avatar_jump',
		url:'./assets/bvhs/avatar_jump.bvh'
	},{
		name:'avatar_dead',
		url:'./assets/bvhs/avatar_dead.bvh'
	},{
		name:'avatar_aim_R_handgun',
		url:'./assets/bvhs/avatar_aim_R_handgun.bvh'
	},{
		name:'avatar_holding_idle',
		url:'./assets/bvhs/holding_idle.bvh',
		type:'mixamo'
	}],
	objects: [{ 
        type:'terrain',
		terrainType:'terrain',
		name:'pathfindzone', 
		position : [0,0,0], // terrain position
		size : [40,5,40], // terrain size in meter
		sample : [32,32], // number of subdivision
		frequency : [0.016,0.05,0.2], // frequency of noise
		level : [1,0.2,0.05], // influence of octave
		expo: 0,
		hdt : 'PHY_FLOAT', // height data type PHY_FLOAT, PHY_UCHAR, PHY_SHORT
		friction: 0.5, 
		bounce: 0.0,
		water:false,
		border:true,
		bottom:true,
		heightMapUrl:'terrain/terrain1.png',
		maxSpeed: 0.02,
		onTerrainObjects:[{		
			type: 'custom',
			name: 'grassLand',
			customFunc:function(terrainPos,terrainData){
				function getYPosition(x, z) {
					var pX = x + terrainPos.x;
					var pZ = z + terrainPos.z;
					var y = terrainData.getHeightAt(pX, pZ, true);
					return y;
				};
				function multiplyQuaternions(q1, q2) {
					x = q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x;
					y = -q1.x * q2.z + q1.y * q2.w + q1.z * q2.x + q1.w * q2.y;
					z = q1.x * q2.y - q1.y * q2.x + q1.z * q2.w + q1.w * q2.z;
					w = -q1.x * q2.x - q1.y * q2.y - q1.z * q2.z + q1.w * q2.w;
					return new THREE.Vector4(x, y, z, w);
				}
				
				var joints = 5;
				var w_ = 0.12*0.5;
				var h_ = 1*0.5;
				var instances = 50000;
				//Patch side length
				var width = 40;
				var base_geometry = new THREE.PlaneBufferGeometry(w_, h_, 1, joints);
				base_geometry.translate(0, h_ / 2, 0);
	
				var instanced_geometry = new THREE.InstancedBufferGeometry();
	
				//----------ATTRIBUTES----------//
				instanced_geometry.index = base_geometry.index;
				instanced_geometry.attributes.position = base_geometry.attributes.position;
				instanced_geometry.attributes.uv = base_geometry.attributes.uv;
	
				// Each instance has its own data for position, rotation and scale
				var offsets = [];
				var orientations = [];
				var stretches = [];
				var halfRootAngleSin = [];
				var halfRootAngleCos = [];
	
				//Temp variables
				var quaternion_0 = new THREE.Vector4();
				var quaternion_1 = new THREE.Vector4();
				var x, y, z, w;
	
				//The min and max angle for the growth direction (in radians)
				var min = -0.5;
				var max = 0.5;
	
				//For each instance of the grass blade
				for (var i = 0; i < instances; i++) {
					//Offset of the roots
					x = Math.random() * width - width / 2;
					z = Math.random() * width - width / 2;
					y = getYPosition(x, z);
					offsets.push(x, y, z);
	
					//Define random growth directions
					//Rotate around Y
					var angle = Math.PI - Math.random() * (2 * Math.PI);
					halfRootAngleSin.push(Math.sin(0.5 * angle));
					halfRootAngleCos.push(Math.cos(0.5 * angle));
	
					var RotationAxis = new THREE.Vector3(0, 1, 0);
					var x = RotationAxis.x * Math.sin(angle / 2.0);
					var y = RotationAxis.y * Math.sin(angle / 2.0);
					var z = RotationAxis.z * Math.sin(angle / 2.0);
					var w = Math.cos(angle / 2.0);
					quaternion_0.set(x, y, z, w).normalize();
	
					//Rotate around X
					angle = Math.random() * (max - min) + min;
					RotationAxis = new THREE.Vector3(1, 0, 0);
					x = RotationAxis.x * Math.sin(angle / 2.0);
					y = RotationAxis.y * Math.sin(angle / 2.0);
					z = RotationAxis.z * Math.sin(angle / 2.0);
					w = Math.cos(angle / 2.0);
					quaternion_1.set(x, y, z, w).normalize();
	
					//Combine rotations to a single quaternion
					quaternion_0 = multiplyQuaternions(quaternion_0, quaternion_1);
	
					//Rotate around Z
					angle = Math.random() * (max - min) + min;
					RotationAxis = new THREE.Vector3(0, 0, 1);
					x = RotationAxis.x * Math.sin(angle / 2.0);
					y = RotationAxis.y * Math.sin(angle / 2.0);
					z = RotationAxis.z * Math.sin(angle / 2.0);
					w = Math.cos(angle / 2.0);
					quaternion_1.set(x, y, z, w).normalize();
	
					//Combine rotations to a single quaternion
					quaternion_0 = multiplyQuaternions(quaternion_0, quaternion_1);
	
					orientations.push(quaternion_0.x, quaternion_0.y, quaternion_0.z, quaternion_0.w);
	
					//Define variety in height
					if (i < instances / 3) {
						stretches.push(Math.random() * 1.8);
					} else {
						stretches.push(Math.random());
					}
				}
	
				var offsetAttribute = new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3);
				var stretchAttribute = new THREE.InstancedBufferAttribute(new Float32Array(stretches), 1);
				var halfRootAngleSinAttribute = new THREE.InstancedBufferAttribute(new Float32Array(halfRootAngleSin), 1);
				var halfRootAngleCosAttribute = new THREE.InstancedBufferAttribute(new Float32Array(halfRootAngleCos), 1);
				var orientationAttribute = new THREE.InstancedBufferAttribute(new Float32Array(orientations), 4);
	
				instanced_geometry.setAttribute('offset', offsetAttribute);
				instanced_geometry.setAttribute('orientation', orientationAttribute);
				instanced_geometry.setAttribute('stretch', stretchAttribute);
				instanced_geometry.setAttribute('halfRootAngleSin', halfRootAngleSinAttribute);
				instanced_geometry.setAttribute('halfRootAngleCos', halfRootAngleCosAttribute);
				var mat = AWEngine.view.getMaterial("rs_grass1");
				var mesh = new THREE.Mesh(instanced_geometry, mat);
				mesh.position.set(20,0,20);
				AWEngine.view.addVisual(mesh);		
	
			}
			
		}]
    },{
		type: 'water',
		waterType: 'water',
		size:[40,40],
		position: [0, 2, 0]
	},{
		type: 'sky',
		distance: 40,
		azimuth: 0.205,
		hour:12,
		shadowMapSize:[1024,1024],
		shadowCamera:{left:-20,right:20,top:20,bottom:-20,near:0,far:100},
	},{
		type:'light',
		lightType:'AmbientLight',
		color:0xffffff,
		intensity:0.8
	},{
		type: 'avatar',
		ename: 'human1',
		cname: '老大',		
		position :[3,3,3],
		physicBody: true,
		sounds:{
			data:{
				addbullet:{name:'addbullet',loop:false,refdistance:5},
				walk_f:{name:'avatar_walk_f',loop:false,refdistance:5},
				walk_b:{name:'avatar_walk_b',loop:false,refdistance:5},
				run:{name:'avatar_run',loop:false,refdistance:5}
			}
		},
		actions:[
			{name:'idle',refBVH:'avatar_holding_idle',speed:0.5},
			{name:'walk_f',refBVH:'avatar_walk',speed:1.5},
			{name:'walk_b',refBVH:'avatar_walk',reverse:true,speed:1.5},
			{name:'walk_cf',refBVH:'avatar_crouchwalk',speed:1.5},
			{name:'walk_cb',refBVH:'avatar_crouchwalk',reverse:true,speed:1.5},
			{name:'crouch',refBVH:'avatar_crouch',speed:1.5},
			{name:'run',refBVH:'avatar_run',speed:1.5},
			{name:'prejump',refBVH:'avatar_prejump',speed:0.5},
			{name:'jump',refBVH:'avatar_jump',speed:0.5},
			{name:'dead',refBVH:'avatar_dead',speed:0.5},
			{name:'aim_r_handgun',refBVH:'avatar_aim_R_handgun',speed:0.5,
					freezebones:['Spine','LeftShoulder','RightShoulder','LeftArm','LeftForeArm','RightArm','RightForeArm','LeftHand','RightHand']}
				
		]
		
	},{
		type: 'sphere',
		radius:0.2,
		mass:1,
		material:'ball0',		
		position: [0.3, 5, 0.3]
	}]
}