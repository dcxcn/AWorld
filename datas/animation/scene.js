{
	ename:window.world.currentSceneName,
	models:[{
		name:'horse',
		url:'./assets/models/animal/Horse.gltf',
		isSet:false	
	}],
	materials:[{
		name:'ball',
		type : 'standard',
		color: 0xffffff,
		opacity: 1,
		metalness: 0.4,
		roughness: 0.5,
		transparent: false,
		map:{image:'ball/ball.jpg',wrap:1,repeat:[1,1]},
		normalMap:{image:'ball/ball_n.jpg',normalScale:[-1,-1]},
		combine:THREE.MixOperation
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
		intensity:0.8
	},{
        type:'terrainc', 
        position : [0,0,0], // terrain position
        size : [64,2,64], // terrain size in meter      
        complexity : 30, // complexity of noise
        flipEdge : false, // inverse the triangle
        hdt : 'PHY_FLOAT', // height data type PHY_FLOAT, PHY_UCHAR, PHY_SHORT
        friction: 0.6, 
        restitution: 0.0,
		sample:[32,32],
		heightMapUrl:'terrain/terrain2.png',
		colors:[
			{name:'water',color:0x0000FF,ratio:0.2},
			{name:'woodland',color:0x3F2A14,ratio:0.3},
			{name:'grass',color:0x00FF00,ratio:0.5},
			{name:'mountain',color:0x575757,ratio:0.9},
			{name:'snow',color:0xFFFFFF,ratio:1}
		]
    },{
		type: 'animal',
		modelName: 'horse',
		ename:'horse',
		cname: '老马',
		positions :[[3,5,3],[6,5,6]],		
		scale:[0.2,0.2,0.2],
		offset:[0,0.1,0],
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
			{name:'idle',clipName:'Idle'},
			{name:'walk_f',clipName:'Walk',duration:1.3},
			{name:'run',clipName:'Jump'},
			{name:'jump',clipName:'Jump'}
		]
		
	}]
}