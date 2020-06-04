{
	ename:window.world.currentSceneName,
	models:[{
		name:'Island',
		url:'./assets/models/avatar/mmd/Island/Island.pmx',
		type:'mmd',
		isSet:false	
	},{
		name:'miku',
		url:'./assets/models/avatar/mmd/椛暗式-椿v1.3/椛暗式-椿v1.3.pmx',
		type:'mmd',
		isSet:false	
	},{
		name:'TdaZhiZi_Miniskirt',
		url:'./assets/models/avatar/mmd/TdaZhizi_Miniskirt/TdaZhizi_Miniskirt.pmx',
		type:'mmd',
		isSet:false	
	},{
		name:'77SITIYA',
		url:'./assets/models/avatar/mmd/椛暗式-湫v1.0/椛暗式-湫v1.0.pmx',
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
		name:'dance_1',
		url:'./assets/models/avatar/mmd/vmds/song_bhs/半壶纱.wav'
	}],
	actions:[{
		name:'dance_1',
		url:'./assets/models/avatar/mmd/vmds/song_bhs/dance+lip(TDA).vmd',
		type:'vmd'
	},{
		name:'camera_1',
		url:'./assets/models/avatar/mmd/vmds/song_bhs/camera.vmd',
		type:'vmd'	
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
		type: 'mmd_model',
		ename: 'Island',
		cname: '海岛',
		position :[0,0,0],
		offset:[0,0.1,0],
		scale:[0.1,0.1,0.1],
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
		//refCameraAction:{refVMD:'camera_1',positionScale:0.1,distanceScale:0.8},		
		physicBody: true,
		characters:[{
			ename: '77SITIYA',
			cname: '老三',
			position :[-1,0,5],
			offset:[0,0.1,0],
			scale:0.1,			
			usePhongMat:true,			
			ikHelper:false,
			physicsHelper:false
		},{
			ename: 'TdaZhiZi_Miniskirt',
			cname: '老二',
			position :[1,0,5],
			offset:[0,0.1,0],
			scale:0.1,			
			usePhongMat:true,			
			ikHelper:false,
			physicsHelper:false
		},{
			ename: 'miku',
			cname: '老大',
			position :[0,0,1],
			offset:[0,0.1,0],
			scale:0.1,			
			usePhongMat:true,			
			ikHelper:false,
			physicsHelper:false
		}]
	}]
}