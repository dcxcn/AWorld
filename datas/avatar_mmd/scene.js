{
	ename:window.world.currentSceneName,
	models:[/*{
		name:'cctv_xkn',
		url:'./assets/models/avatar/mmd/CCTV新科娘/CCTV新科娘.pmx',
		type:'mmd',
		isSet:false	
	},{
		name:'miku',
		url:'./assets/models/avatar/mmd/miku/miku_v2.pmd',
		type:'mmd',
		isSet:false	
	},*/{
		name:'huowu',
		url:'./assets/models/avatar/mmd/Mai/Mai.pmx',
		type:'mmd',
		isSet:false	
	}/*,{
		name:'TdaZhiZi_Miniskirt',
		url:'./assets/models/avatar/mmd/TdaZhizi_Miniskirt/TdaZhizi_Miniskirt.pmx',
		type:'mmd',
		isSet:false	
	}*/],
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
		name:'vmd_walk',
		url:'./assets/models/avatar/mmd/vmds/walk/walk.vmd',
		type:'vmd'
	},{
		name:'vmd_run',
		url:'./assets/models/avatar/mmd/vmds/walk/run.vmd',
		type:'vmd'
	},{
		name:'dance_1',
		url:'./assets/models/avatar/mmd/vmds/wavefile_v2.vmd',
		type:'vmd'
	}],
	objects: [{	
		type: 'box',
		name:'pathfindzone1',
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
		color:0xcccccc,
		intensity:0.8
	}/*,{
		type: 'avatar_mmd',
		ename: 'miku',
		cname: '老大',
		position :[0,0,0],
		offset:[0,0.2,0],//0.2
		scale:0.1,
		useCharacter:true,
		physicBody: true,
		actions:[
			{name:'idle',refBVH:'avatar_holding_idle'},
			{name:'walk_f',refBVH:'avatar_female_walk'},
			{name:'walk_b',refBVH:'avatar_female_walk',reverse:true},
			{name:'walk_cf',refBVH:'avatar_crouchwalk'},
			{name:'walk_cb',refBVH:'avatar_crouchwalk',reverse:true},
			{name:'crouch',refBVH:'avatar_crouch'},
			{name:'run',refBVH:'avatar_run'},
			{name:'prejump',refBVH:'avatar_prejump'},
			{name:'jump',refBVH:'avatar_jump'},
			{name:'dead',refBVH:'avatar_dead'}
		]
	}*/,{
		type: 'avatar_mmd',
		ename: 'huowu',
		cname: '不知火舞',
		position :[7,0,7],
		offset:[0,0.2,0],//0.2
		scale:0.1,
		useCharacter:true,
		physicBody: true,
		usePhongMat:true,
		actions:[
			{name:'idle',refVMD:'dance_1'},
			{name:'walk_f',refBVH:'avatar_female_walk'},
			{name:'walk_b',refBVH:'avatar_female_walk',reverse:true},
			{name:'walk_cf',refBVH:'avatar_crouchwalk'},
			{name:'walk_cb',refBVH:'avatar_crouchwalk',reverse:true},
			{name:'crouch',refBVH:'avatar_crouch'},
			{name:'run',refBVH:'avatar_run'},
			{name:'prejump',refBVH:'avatar_prejump'},
			{name:'jump',refBVH:'avatar_jump'},
			{name:'dead',refBVH:'avatar_dead'}
		]
	}/*,{
		type: 'avatar_mmd',
		ename: 'TdaZhiZi_Miniskirt',
		cname: '老二',
		position :[5,0,5],
		offset:[0,0.2,0],
		scale:0.1,
		useCharacter:true,
		physicBody: true,
		usePhongMat:true,
		actions:[
			{name:'idle',refVMD:'dance_1'},
			{name:'walk_f',refBVH:'avatar_female_walk'},
			{name:'walk_b',refBVH:'avatar_female_walk',reverse:true},
			{name:'walk_cf',refBVH:'avatar_crouchwalk'},
			{name:'walk_cb',refBVH:'avatar_crouchwalk',reverse:true},
			{name:'crouch',refBVH:'avatar_crouch'},
			{name:'run',refBVH:'avatar_run'},
			{name:'prejump',refBVH:'avatar_prejump'},
			{name:'jump',refBVH:'avatar_jump'},
			{name:'dead',refBVH:'avatar_dead'}
		]
	},{
		type: 'avatar_mmd',
		ename: 'cctv_xkn',
		cname: 'CCTV新科娘',
		position :[3,0,3],
		offset:[0,0.2,0],
		scale:0.1,
		useCharacter:true,
		physicBody: true,
		usePhongMat:false,
		actions:[
			{name:'idle',refVMD:'dance_1'},
			{name:'walk_f',refBVH:'avatar_female_walk'},
			{name:'walk_b',refBVH:'avatar_female_walk',reverse:true},
			{name:'walk_cf',refBVH:'avatar_crouchwalk'},
			{name:'walk_cb',refBVH:'avatar_crouchwalk',reverse:true},
			{name:'crouch',refBVH:'avatar_crouch'},
			{name:'run',refBVH:'avatar_run'},
			{name:'prejump',refBVH:'avatar_prejump'},
			{name:'jump',refBVH:'avatar_jump'},
			{name:'dead',refBVH:'avatar_dead'}
		]
	}*//*,{
		type: 'mmd',
		ename: 'miku',
		cname: '老大',
		position :[3,0,1],
		offset:[0,0.1,0],
		scale:[0.1,0.1,0.1],
		usePhongMat:false,
		physicBody: false,
		ikHelper:false,
		physicsHelper:false,
		actions:[
			{name:'idle',refAction:'dance_1'}		
		]
	},{
		type: 'mmd',
		ename: 'TdaZhiZi_Miniskirt',
		cname: '老二',
		position :[3,0,5],
		offset:[0,0.1,0],
		scale:[0.1,0.1,0.1],
		usePhongMat:false,
		physicBody: true,
		ikHelper:false,
		physicsHelper:false,
		actions:[
			{name:'idle',refAction:'dance_1'}
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
			{name:'idle',refBVH:'avatar_holding_idle'},
			{name:'walk_f',refBVH:'avatar_female_walk'},
			{name:'walk_b',refBVH:'avatar_female_walk',reverse:true},
			{name:'walk_cf',refBVH:'avatar_crouchwalk'},
			{name:'walk_cb',refBVH:'avatar_crouchwalk',reverse:true},
			{name:'crouch',refBVH:'avatar_crouch'},
			{name:'run',refBVH:'avatar_run'},
			{name:'prejump',refBVH:'avatar_prejump'},
			{name:'jump',refBVH:'avatar_jump'},
			{name:'dead',refBVH:'avatar_dead'},
			{name:'aim_r_handgun',refBVH:'avatar_aim_R_handgun',
					freezebones:['mixamorigSpine','mixamorigSpine1','mixamorigLeftShoulder','mixamorigRightShoulder','mixamorigLeftArm','mixamorigLeftForeArm','mixamorigRightArm','mixamorigRightForeArm','mixamorigLeftHand','mixamorigRightHand']}
		]
	}*/]
}