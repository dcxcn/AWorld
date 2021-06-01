{
	ename:window.world.currentSceneName,
	clearColor:0xbfd1e5,
	arSceneScale:1/40,
	uiControls:[{
		name:'_',
		type:'joystick',
		isFollow:false,
		debug:false
	},{
		name:'pause',
		type:'toggleButton',
		labels:{def:'暂停',sel:'恢复'},
		w:60,
		h:30,
		pos:{right:'10px', top:'10px'},
		callback:function(b){window.WEngine.play(b);}
	}],
	models:[{
		name:'human1',
		url:'./assets/models/avatar/makehuman/human1/human1.gltf',
		isSet:false	
	},{
		name:'human4',
		url:'./assets/models/avatar/makehuman/human4/model.glb',
		isSet:false	
	},{
		name:'human5',
		url:'./assets/models/avatar/makehuman/human5/human5.gltf',
		isSet:false	
	},{
		name:'human6',
		url:'./assets/models/avatar/mixamo/ybot.fbx',
		type:'fbx',
		isSet:false	
	},{
		name:'chr22',
		url:'./assets/models/avatar/mixamo/chr22.fbx',
		type:'fbx',
		isSet:false	
	},{
		name:'mousey',
		url:'./assets/models/avatar/mixamo/chr14.fbx',
		type:'fbx',
		isSet:false	
	},{
		name:'guns',
		url:'./assets/models/gun/handgun1.glb',
		isSet:true
	}],
	materials:[{
			name:'grass',
			type : 'Phong',
			color: 0xffffff,
			shininess: 0,
			specular: 0x000000,
			opacity: 1,
			transparent: false,
			map:{url:'land/grasslight-small.jpg',wrap:1,repeat:[15,15]}
		},{
			name:'tower',
			type : 'Phong',
			color: 0xF4A321
		},{
			name:'bridge',
			type : 'Phong',
			color: 0xB38835
		},{
			name:'stone',
			type : 'Phong',
			color: 0xB0B0B0
		},{
			name:'mountain',
			type : 'Phong',
			color: 0xFFB443
		},{
			name:'ball',
			type : 'Standard',
			color: 0xffffff,
			opacity: 1,
			metalness: 0.4,
			roughness: 0.5,
			transparent: false,
			map:{url:'ball/ball.jpg',wrap:1,repeat:[1,1]},
			normalMap:{url:'ball/ball_n.jpg',normalScale:[-1,-1]}
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
		type: 'compass',
		texture:{url:'sprites/compass.png'}
	},{	
		type: 'box',
		name:'pathfindzone',
		size:[40,1,40],
		mass:0,
		material:'grass',
		position: [0, -0.5, 0]
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
		color:0xffffcc,
		intensity:1
	}/*,{
		type:'light',
		lightType:'DirectionalLight',
		color:0xffffff,
		intensity:1,
		name:'sun',
		position: [0, 20, 0 ],
		shadowMapSize:[1024,1024],
		//shadowCamera:{left:-300,right:300,top:300,bottom:-300,near:2,far:500000}
		shadowCamera:{left:-14,right:14,top:14,bottom:-14,near:2,far:100}
	},{
		type:'light',
		lightType:'SpotLight',
		position: [0, 50, 0 ],
		shadowMapSize:[1024,1024],
		shadowCamera:{near:2,far:500}
	},{
		type: 'fog',
		color: 0x3b4c5a,
		//density:0.00025,
		near:1,
		far:40
	}*/,{	
		type: 'box',
		name:'test1',
		size:[10,1,10],
		mass:0,
		material:'grass',
		position: [0, 20, 0]
	},{
		type: 'text3D',
		text:'|VRWorld主场景|',
		colors:[0xFFFFFF,0x00EE00],
		size: 2,
		height: 1,
		curveSegments: 2,
		mass:0,
		group:2,
		roadblock:true,
		position: [-5, 2, 15],
		castShadow:true
	},{
		name:'handgun1',
		type: 'gun',
		meshName:'handgun',
		scale:[0.05,0.05,0.05],
		mass:0,
		muzzle:[0.45,0.15,0],	
		position: [-1, 1, -1],
		noPhy:true
	},{		
		type: 'hardbox',
		size:[4,10,4],
		mass:1000,
		breakable:true,
		breakOption:[ 250, 1, 2, 5 ],// breakOption: [ maxImpulse, maxRadial, maxRandom, levelOfSubdivision ]
		roadblock:true,
		material:'tower',
		rot:[0,0,0],
		positions: [[-8, 5, 0],[8, 5, 0]]
	},{		
		type: 'hardbox',
		size:[14,0.4,3],
		mass:100,
		breakable:true,		
		material:'bridge',
		position: [0, 10.2, 0]
	},{		
		type: 'hardbox',
		size:[2,4,0.3],
		mass:120,
		breakable:true,
		breakOption:[ 250, 1, 2, 5 ],
		roadblock:true,
		material:'stone',
		positions: [[0, 2, 8],[0, 2, 10],[0, 2, 12]],
		rot: [0,30,0],
	},{	
		name:'mountain1',
		type: 'convex',
		mass:100,
		breakable:true,
		breakOption:[ 250, 1, 2, 5 ],
		roadblock:true,
		material:'mountain',
		blockSize:[8,10,8],
		position: [5, 5, - 7],
		rot: [0,30,0],
		pointsfun: function(){
			var mountainPoints = [];
			var mountainHalfExtents = new THREE.Vector3( 4, 5, 4 );
			mountainPoints.push( new THREE.Vector3( mountainHalfExtents.x, - mountainHalfExtents.y, mountainHalfExtents.z ) );
			mountainPoints.push( new THREE.Vector3( - mountainHalfExtents.x, - mountainHalfExtents.y, mountainHalfExtents.z ) );
			mountainPoints.push( new THREE.Vector3( mountainHalfExtents.x, - mountainHalfExtents.y, - mountainHalfExtents.z ) );
			mountainPoints.push( new THREE.Vector3( - mountainHalfExtents.x, - mountainHalfExtents.y, - mountainHalfExtents.z ) );
			mountainPoints.push( new THREE.Vector3( 0, mountainHalfExtents.y, 0 ) );
			return mountainPoints;
		}
	},{
		type: 'avatar',
		ename: 'human1',
		cname: '老大',		
		position :[3,1,3],
		physicBody: true,
		debug: true,
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
		type: 'avatar',
		ename: 'human4',
		cname: '老四',
		position :[3,1,4],
		sounds:{
			data:{
				addbullet:{name:'addbullet',loop:false,refdistance:2},
				walk_f:{name:'avatar_walk_f',loop:false,refdistance:2},
				walk_b:{name:'avatar_walk_b',loop:false,refdistance:2},
				run:{name:'avatar_run',loop:false,refdistance:2}
			}
		},
		actions:[				
			{name:'idle',refBVH:'avatar_stand',speed:0.5},
			{name:'walk_f',refBVH:'avatar_female_walk',speed:1.5},
			{name:'walk_b',refBVH:'avatar_female_walk',reverse:true,speed:1.5},
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
		type: 'avatar',
		ename: 'human5',
		cname: '老五',		
		position :[3,1,5],
		physicBody: false,
		sounds:{
			data:{
				addbullet:{name:'addbullet',loop:false,refdistance:2},
				walk_f:{name:'avatar_walk_f',loop:false,refdistance:2},
				walk_b:{name:'avatar_walk_b',loop:false,refdistance:2},
				run:{name:'avatar_run',loop:false,refdistance:2}
			}
		},
		actions:[
			{name:'idle',refBVH:'avatar_holding_idle',speed:0.5},
			{name:'walk_f',refBVH:'avatar_female_walk',speed:1.5},
			{name:'walk_b',refBVH:'avatar_female_walk',reverse:true,speed:1.5},
			{name:'walk_cf',refBVH:'avatar_crouchwalk',speed:1.5},
			{name:'walk_cb',refBVH:'avatar_crouchwalk',reverse:true,speed:1.5},
			{name:'crouch',refBVH:'avatar_crouch',speed:1.5},
			{name:'run',refBVH:'avatar_run',speed:1.5},
			{name:'prejump',refBVH:'avatar_prejump',speed:0.5},
			{name:'jump',refBVH:'avatar_jump',speed:0.5},
			{name:'dead',refBVH:'avatar_dead',speed:0.5},
			{name:'aim_r_handgun',refBVH:'avatar_aim_R_handgun',speed:0.5,
					freezebones:['spine','chest1','shoulderL','shoulderR','upper_armL','forearmL','upper_armR','forearmR','handL','handR']}
	
		]
	},{
		type: 'avatar',
		ename: 'human6',
		cname: '老六',
		position :[3,1,6],
		physicBody: false,
		sounds:{
			data:{
				addbullet:{name:'addbullet',loop:false,refdistance:2},
				walk_f:{name:'avatar_walk_f',loop:false,refdistance:2},
				walk_b:{name:'avatar_walk_b',loop:false,refdistance:2},
				run:{name:'avatar_run',loop:false,refdistance:2}
			}
		},
		actions:[
			{name:'idle',refBVH:'avatar_holding_idle',speed:0.5},
			{name:'walk_f',refBVH:'avatar_female_walk',speed:1.5},
			{name:'walk_b',refBVH:'avatar_female_walk',reverse:true,speed:1.5},
			{name:'walk_cf',refBVH:'avatar_crouchwalk',speed:1.5},
			{name:'walk_cb',refBVH:'avatar_crouchwalk',reverse:true,speed:1.5},
			{name:'crouch',refBVH:'avatar_crouch',speed:1.5},
			{name:'run',refBVH:'avatar_run',speed:1.5},
			{name:'prejump',refBVH:'avatar_prejump',speed:0.5},
			{name:'jump',refBVH:'avatar_jump',speed:0.5},
			{name:'dead',refBVH:'avatar_dead',speed:0.5},
			{name:'aim_r_handgun',refBVH:'avatar_aim_R_handgun',speed:0.5,
					freezebones:['mixamorigSpine','mixamorigSpine1','mixamorigLeftShoulder','mixamorigRightShoulder','mixamorigLeftArm','mixamorigLeftForeArm','mixamorigRightArm','mixamorigRightForeArm','mixamorigLeftHand','mixamorigRightHand']}
		]
	},{
		type: 'avatar',
		ename: 'chr22',
		cname: 'chr22',
		position :[3,1,7],
		physicBody: false,
		sounds:{
			data:{
				addbullet:{name:'addbullet',loop:false,refdistance:2},
				walk_f:{name:'avatar_walk_f',loop:false,refdistance:2},
				walk_b:{name:'avatar_walk_b',loop:false,refdistance:2},
				run:{name:'avatar_run',loop:false,refdistance:2}
			}
		},
		actions:[
			{name:'idle',refBVH:'avatar_holding_idle',speed:0.5},
			{name:'walk_f',refBVH:'avatar_female_walk',speed:1.5},
			{name:'walk_b',refBVH:'avatar_female_walk',reverse:true,speed:1.5},
			{name:'walk_cf',refBVH:'avatar_crouchwalk',speed:1.5},
			{name:'walk_cb',refBVH:'avatar_crouchwalk',reverse:true,speed:1.5},
			{name:'crouch',refBVH:'avatar_crouch',speed:1.5},
			{name:'run',refBVH:'avatar_run',speed:1.5},
			{name:'prejump',refBVH:'avatar_prejump',speed:0.5},
			{name:'jump',refBVH:'avatar_jump',speed:0.5},
			{name:'dead',refBVH:'avatar_dead',speed:0.5},
			{name:'aim_r_handgun',refBVH:'avatar_aim_R_handgun',speed:0.5,
					freezebones:['mixamorigSpine','mixamorigSpine1','mixamorigLeftShoulder','mixamorigRightShoulder','mixamorigLeftArm','mixamorigLeftForeArm','mixamorigRightArm','mixamorigRightForeArm','mixamorigLeftHand','mixamorigRightHand']}
		]
	},{
		type: 'avatar',
		ename: 'mousey',
		cname: '小老鼠',
		position :[3,1,8],
		physicBody: false,
		sounds:{
			data:{
				addbullet:{name:'addbullet',loop:false,refdistance:2},
				walk_f:{name:'avatar_walk_f',loop:false,refdistance:2},
				walk_b:{name:'avatar_walk_b',loop:false,refdistance:2},
				run:{name:'avatar_run',loop:false,refdistance:2}
			}
		},
		actions:[
			{name:'idle',refBVH:'avatar_holding_idle',speed:0.5},
			{name:'walk_f',refBVH:'avatar_female_walk',speed:1.5},
			{name:'walk_b',refBVH:'avatar_female_walk',reverse:true,speed:1.5},
			{name:'walk_cf',refBVH:'avatar_crouchwalk',speed:1.5},
			{name:'walk_cb',refBVH:'avatar_crouchwalk',reverse:true,speed:1.5},
			{name:'crouch',refBVH:'avatar_crouch',speed:1.5},
			{name:'run',refBVH:'avatar_run',speed:1.5},
			{name:'prejump',refBVH:'avatar_prejump',speed:0.5},
			{name:'jump',refBVH:'avatar_jump',speed:0.5},
			{name:'dead',refBVH:'avatar_dead',speed:0.5},
			{name:'aim_r_handgun',refBVH:'avatar_aim_R_handgun',speed:0.5,
					freezebones:['mixamorigSpine','mixamorigSpine1','mixamorigLeftShoulder','mixamorigRightShoulder','mixamorigLeftArm','mixamorigLeftForeArm','mixamorigRightArm','mixamorigRightForeArm','mixamorigLeftHand','mixamorigRightHand']}
		]
	}]
}