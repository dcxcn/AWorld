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
		type: 'text3D',
		text:'|物理布场景|',
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
		type: 'box',
		conFunc: function(){
			var confAry = [];
			var pos = new THREE.Vector3();
			// Wall
			var brickMass = 0.5;
			var brickLength = 1.2;
			var brickDepth = 0.6;
			var brickHeight = brickLength * 0.5;
			var numBricksLength = 6;
			var numBricksHeight = 8;
			var z0 = - numBricksLength * brickLength * 0.5;
			pos.set( 0, brickHeight * 0.5, z0 );
			for ( var j = 0; j < numBricksHeight; j ++ ) {

				var oddRow = ( j % 2 ) == 1;
				pos.z = z0;
				if ( oddRow ) {
					pos.z -= 0.25 * brickLength;
				}

				var nRow = oddRow? numBricksLength + 1 : numBricksLength;
				for ( var i = 0; i < nRow; i ++ ) {

					var brickLengthCurrent = brickLength;
					var brickMassCurrent = brickMass;
					if ( oddRow && ( i == 0 || i == nRow - 1 ) ) {
						brickLengthCurrent *= 0.5;
						brickMassCurrent *= 0.5;
					}
					
					confAry.push({
						type:'box',
						size:[brickDepth, brickHeight, brickLengthCurrent],
						pos:[pos.x,pos.y,pos.z],
						mass:brickLengthCurrent,
						name:Math.generateUUID(),
						friction:0.5, 
						restitution:0.9,
						material:'grass'
					});

					if ( oddRow && ( i == 0 || i == nRow - 2 ) ) {
						pos.z += 0.75 * brickLength;
					}
					else {
						pos.z += brickLength;
					}
				}
				pos.y += brickHeight;				
			}
			return confAry;
		}
	},{		
		type: 'box',
		name: 'base1',
		size:[1,0.2,1],
		mass:0,
		material:'grass',
		position: [-6, 0.1, -5]
	},{		
		type: 'box',
		name: 'pylon1',
		size:[0.4,6,0.4],
		mass:0,
		material:'grass',
		position: [-6, 3, -5]
	},{		
		type: 'box',
		name: 'arm1',
		size:[0.4,0.4,7.4],
		mass:2,
		material:'grass',
		position: [-6, 6.2, -1.5]
	},{		
		type: 'box',
		name: 'base2',
		size:[1,0.2,1],
		mass:0,
		material:'grass',
		position: [6, 0.1, -5]
	},{		
		type: 'box',
		name: 'pylon2',
		size:[0.4,6,0.4],
		mass:0,
		material:'grass',
		position: [6, 3, -5]
	},{		
		type: 'box',
		name: 'arm2',
		size:[0.4,0.4,7.4],
		mass:2,
		material:'grass',
		position: [6, 6.2, -1.5]
	},{		
		type: 'softCloth',
		name: 'cloth1',
		size:[4,3,5,5],
		corners:{enabled:false,pos00:[],pos01:[],pos10:[],pos11:[]},	
		mass:0.9,
		material:'cloth1',
		direction:{align:'V_C',face2:'X'},//V_T、V_B、V_C
		position: [-3, 3, 0]
	},{
		type: 'anchor',
		soft: 'cloth1',
		body: 'arm1',
		collision:false,
		influence:0.5,
		nodes:[0,10,20]		
	},{		
		type: 'softCloth',
		name: 'cloth2',
		size:[4,3,5,5],
		corners:{enabled:false,pos00:[],pos01:[],pos10:[],pos11:[]},	
		mass:0.9,
		material:'cloth1',
		direction:{align:'V_C',face2:'X'},//V_T、V_B、V_C
		position: [3, 3, 0]
	},{
		type: 'anchor',
		soft: 'cloth2',
		body: 'arm2',
		collision:false,
		influence:0.5,
		nodes:[0,10,20]		
	},{
		type: 'joint_hinge',
		name: 'joint_hinge_arm1',
		body1: 'pylon1',
		body2: 'arm1',
		pos1:[0, 3, 0],
		pos2:[0, -0.2, -3.5],
		axe1:[0, 1, 0],
		axe2:[0, 1, 0]
	},{
		type: 'joint_hinge',
		name: 'joint_hinge_arm2',
		body1: 'pylon2',
		body2: 'arm2',
		pos1:[0, 3, 0],
		pos2:[0, -0.2, -3.5],
		axe1:[0, 1, 0],
		axe2:[0, 1, 0]
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