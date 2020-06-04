{
	ename:window.world.currentSceneName,
	models:[{
		name:'human4',
		url:'./assets/models/avatar/makehuman/human4/model.glb',
		isSet:false	
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
			name:'cloth1',
			type : 'Phong',
			color: 0xffffff,
			shininess: 0,
			specular: 0x000000,
			opacity: 1,
			side: THREE.DoubleSide,
			transparent: false,
			map:{url:'grid.png',wrap:1,repeat:[15,15]}
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
		size:[40,1,40],
		mass:0,
		material:'grass',
		position: [0, -0.5, 0]
	},{ 
		type:'box', 
		size:[10,1,4], 
		position:[3,1,0],
		rot:[0,0,30],
		material:'cloth1',
		mass:0 
	},{ 
        type:'softMesh',
        shape:new THREE.SphereBufferGeometry( 1.5, 20, 10 ),
		mass:20,
		material:'cloth1',
        position:[5,4.5,0],
        viterations: 40,
        piterations: 40,
        friction: 0.1,// friction
        damping: 0.01,// Damping
        pressure: 250,// Pressure

        // Stiffness
		stiffness: 0.9,
        klst: 0.9,
        kast: 0.9,
        margin:0.05
		
    },{ 
        type:'softMesh',
        shape:new THREE.BoxBufferGeometry( 1, 1, 5, 4, 4, 20 ),
		mass:15,
		material:'cloth1',
        position:[-2,5,0],
        viterations: 40,
        piterations: 40,
        //citerations:4,
        //diterations:0,

        friction: 0.1,// friction
        damping: 0.01,// Damping
        pressure: 120,// Pressure
		stiffness: 0.9,
        // Stiffness
        klst: 0.9,
        kast: 0.9,
        margin:0.05       
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
	}]
};