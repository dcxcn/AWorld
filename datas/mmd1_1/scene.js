{
	ename:window.world.currentSceneName,
	models:[{
		name:'Island',
		url:'./assets/models/mmd/Island/Island.pmx',
		type:'mmd',
		isSet:false	
	},{
		name:'miku',
		url:'./assets/models/mmd/miku/miku_v2.pmd',
		type:'mmd',
		isSet:false	
	},{
		name:'TdaZhiZi_Miniskirt',
		url:'./assets/models/mmd/TdaZhizi_Miniskirt/TdaZhizi_Miniskirt.pmx',
		type:'mmd',
		isSet:false	
	},{
		name:'TDA Miku Hatsune Lace',
		url:'./assets/models/mmd/TDA Miku Hatsune Lace/TDA Miku Hatsune Lace.pmx',
		type:'mmd',
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
	},{
		name:'dance_1',
		url:'./assets/models/mmd/audios/wavefile_short.mp3'
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
	},{
		name:'vmd_idle',
		url:'./assets/models/mmd/vmds/test.vmd',
		type:'vmd'
	},{
		name:'vmd_walk',
		url:'./assets/models/mmd/vmds/walk/walk.vmd',
		type:'vmd'
	},{
		name:'vmd_run',
		url:'./assets/models/mmd/vmds/walk/run.vmd',
		type:'vmd'
	},{
		name:'dance_1',
		url:'./assets/models/mmd/vmds/wavefile_v2.vmd',
		type:'vmd'
	},{
		name:'camera_1',
		url:'./assets/models/mmd/vmds/wavefile_camera.vmd',
		type:'vmd'	
	}],
	objects: [{
		type: 'sky',
		distance: 400,
		azimuth: 0.205,
		hour:12,
		shadowMapSize:[1024,1024],
		shadowCamera:{left:-200,right:200,top:200,bottom:-200,near:0,far:1000},
	},{
		type:'light',
		lightType:'AmbientLight',
		color:0xcccccc,
		intensity:0.8
	},{
		type: 'mmd_model',
		ename: 'Island',
		cname: '海岛',
		position :[0,0,0],
		offset:[0,0.1,0],
		scale:[1,1,1],
		usePhongMat:true	
	},{
		type: 'water',
		waterType: 'ocean',
		size:[1000,1000],
		position: [0, -0.8, 0]
	},{
		type: 'mmd',
		refSound:'dance_1',
		refAction:{refVMD:'dance_1'},
		refCameraAction:{refVMD:'camera_1',positionScale:2,distanceScale:8},		
		physicBody: true,
		characters:[{
			ename: 'TDA Miku Hatsune Lace',
			cname: '老三',
			position :[10,0,50],
			offset:[0,1,0],
			scale:[1,1,1],			
			usePhongMat:true,			
			ikHelper:false,
			physicsHelper:false
		},{
			ename: 'TdaZhiZi_Miniskirt',
			cname: '老二',
			position :[30,0,50],
			offset:[0,1,0],
			scale:[1,1,1],			
			usePhongMat:true,			
			ikHelper:false,
			physicsHelper:false
		},{
			ename: 'miku',
			cname: '老大',
			position :[30,0,10],
			offset:[0,1,0],
			scale:[1,1,1],			
			usePhongMat:true,			
			ikHelper:false,
			physicsHelper:false
		}]
	}]
}