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
			type: 'plant',
			name: 'grass01',
			image: 'plant/grass01.png',
			size:[0.1,0.1],
			randompos:{max:[-16,16,-16,16],min:[-10,10,-10,10]},
			tuft: 1600			
		},{
			type: 'plant',
			name: 'grass02',
			image: 'plant/grass02.png',
			size:[0.2,0.2],
			randompos:{max:[-16,16,-16,16],min:[-10,10,-10,10]},
			tuft: 3000			
		},{
			type: 'plant',
			name: 'flowers01',
			image: 'plant/flowers01.png',
			size:[0.3,0.3],
			randompos:{max:[-16,16,-16,16],min:[-10,10,-10,10]},
			tuft: 300			
		},{
			type: 'plant',
			name: 'flowers02',
			image: 'plant/flowers02.png',
			size:[0.5,0.5],
			randompos:{max:[-16,16,-16,16],min:[-10,10,-10,10]},
			tuft: 100			
		},{
			type: 'plant',
			name: 'tree01',
			image: 'plant/tree01.png',
			size:[3,3],		
			positions: [[-2, -0.15, -2],[-4, -0.15, -4],
			[-2, -0.15, 2],[-4, -0.15, 4],
			[2, -0.15, -2],[4, -0.15, -4],
			[2, -0.15, 2],[4, -0.15, 4],[0, -0.15, -4],[4, -0.15, 0]]			
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