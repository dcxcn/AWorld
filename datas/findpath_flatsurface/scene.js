{
	ename:window.world.currentSceneName,
	models:[{
		name:'human4',
		url:'./assets/models/avatar/makehuman/human4/model.glb',
		isSet:false	
	},{
		name:'houses',
		url:'./assets/models/scene/houses/houses.glb',
		type:'gltf',
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
			map:{url:'land/grasslight-small.jpg',wrap:1,repeat:[150,150]}
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
		type: 'sky',
		distance: 40,
		azimuth: 0.205,
		hour:12,
		shadowMapSize:[1024,1024],
		shadowCamera:{left:-20,right:20,top:20,bottom:-20,near:0,far:100},
	},{
		type:'light',
		lightType:'AmbientLight',
		color:0xcccccc,
		intensity:0.7
	},{
		type: 'compass',
		texture:{url:'sprites/compass.png'}
	},{		
		type: 'box',
		name: 'pathfindzone',
		size:[400,1,400],
		mass:0,
		material:'grass',
		position: [0, -0.5, 0]
	},{
		type: 'model',
		meshName:'predio001',
		roadblock:true,		
		position:[0,0,0],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		scale:[5,5,5]
	},{
		type: 'model',
		meshName:'hospital001',
		roadblock:true,		
		position:[0,0,50],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		scale:[5,5,5]
	},{
		type: 'model',
		meshName:'prefeitura001',
		roadblock:true,		
		position:[0,0,100],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		scale:[5,5,5]
	},{
		type: 'model',
		meshName:'casa001',
		roadblock:true,		
		positions:[[20,0,100],[-20,0,100],[0,0,130]],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		scale:[5,5,5]
	},{
		type: 'model',
		meshName:'shop001',
		roadblock:true,		
		positions:[[0,0,160]],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		scale:[5,5,5]
	},{
		type: 'model',
		meshName:'casa_02001',
		roadblock:true,		
		positions:[[0,0,180]],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		scale:[5,5,5]
	},{
		type: 'model',
		meshName:'escola001',
		roadblock:true,		
		positions:[[50,0,0]],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		scale:[5,5,5]
	},{
		type: 'model',
		meshName:'cinema001',
		roadblock:true,		
		positions:[[50,0,50]],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		scale:[5,5,5]
	},{
		type: 'model',
		meshName:'office_center001',
		roadblock:true,		
		positions:[[50,0,100]],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		scale:[5,5,5]
	},{
		type: 'model',
		meshName:'hotel001',
		roadblock:true,		
		positions:[[50,0,150]],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		scale:[5,5,5]
	},{
		type: 'model',
		meshName:'restaurant_01001',
		roadblock:true,		
		positions:[[-50,0,170]],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		scale:[5,5,5]
	},{
		type: 'model',
		meshName:'restaurant_02001',
		roadblock:true,		
		positions:[[50,0,170]],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		scale:[5,5,5]
	},{
		type: 'model',
		meshName:'24_horas001',
		roadblock:true,		
		positions:[[100,0,0]],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		scale:[5,5,5]
	},{
		type: 'model',
		meshName:'casa_andar_2001',
		roadblock:true,		
		positions:[[100,0,50]],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		scale:[5,5,5]
	},{
		type: 'box',
		roadblock:true,
		size:[2, 6, 2],
		position:[40,3,40],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		material:'random'
	},{
		type: 'box',
		roadblock:true,
		size:[2, 4, 2],
		position:[80,2,80],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		material:'random'
	},{
		type: 'box',
		roadblock:true,
		size:[2, 6, 2],
		position:[80,3,40],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		material:'random'
	},{
		type: 'box',
		roadblock:true,
		size:[2, 6, 2],
		position:[-150,3,-150],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		material:'random'
	},{
		type: 'box',
		roadblock:true,
		size:[2, 6, 2],
		position:[150,3,150],
		mass:0,
		name:Math.generateUUID(),
		friction:0.5, 
		restitution:0.9,
		material:'random'
	},{
		type: 'avatar',
		ename: 'human4',
		cname: '老四',
		position :[-30,1,40],
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
	}]
};