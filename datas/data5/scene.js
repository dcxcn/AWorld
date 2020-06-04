{
	ename:window.world.currentSceneName,
	models:[{
		name:'human4',
		url:'./assets/models/human4/human4.glb',
		isSet:false	
	}],
	materials:[],
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
		color:0xffffff,
		intensity:0.8
	},{
		type: 'snow',
		size : [100,100,100]
	},{ 
        type:'terrainc', 
        position : [0,0,0], // terrain position
        size : [64,5,64], // terrain size in meter      
        complexity : 30, // complexity of noise
        flipEdge : false, // inverse the triangle
        hdt : 'PHY_FLOAT', // height data type PHY_FLOAT, PHY_UCHAR, PHY_SHORT
        friction: 0.6, 
        restitution: 0.0,
		sample:[32,32],
		heightMapUrl:'terrain/terrain1.png',
		colors:[
			{name:'water',color:0x0000FF,ratio:0.2},
			{name:'woodland',color:0x3F2A14,ratio:0.3},
			{name:'grass',color:0x00FF00,ratio:0.5},
			{name:'mountain',color:0x575757,ratio:0.9},
			{name:'snow',color:0xFFFFFF,ratio:1}
		],
		onTerrainObjects:[{
			type: 'plant',
			name: 'grass01',
			image: 'grass01.png',
			size:[0.1,0.1],
			randompos:{max:[-16,16,-16,16],min:[-10,10,-10,10]},
			tuft: 1600			
		},{
			type: 'plant',
			name: 'grass02',
			image: 'grass02.png',
			size:[0.2,0.2],
			randompos:{max:[-16,16,-16,16],min:[-10,10,-10,10]},
			tuft: 3000			
		},{
			type: 'plant',
			name: 'flowers01',
			image: 'flowers01.png',
			size:[0.3,0.3],
			randompos:{max:[-16,16,-16,16],min:[-10,10,-10,10]},
			tuft: 300			
		},{
			type: 'plant',
			name: 'flowers02',
			image: 'flowers02.png',
			size:[0.5,0.5],
			randompos:{max:[-16,16,-16,16],min:[-10,10,-10,10]},
			tuft: 100			
		},{
			type: 'plant',
			name: 'tree01',
			image: 'tree01.png',
			size:[3,3],		
			positions: [[-2, -0.15, -2],[-4, -0.15, -4],
			[-2, -0.15, 2],[-4, -0.15, 4],
			[2, -0.15, -2],[4, -0.15, -4],
			[2, -0.15, 2],[4, -0.15, 4],[0, -0.15, -4],[4, -0.15, 0]]			
		}]
    },{
		type: 'rollercoaster',
		segments : [400,400],
		haslifter : true,
		nolifter : function( i ){
			if( i>=398 && i<=400) return true;
			if( i>=0 && i<=2) return true;
			if(i>285 && i<290) return true;
			if(i>=165 && i<=170) return true;
			if(i>=32 && i<=35) return true;
			if(i>=38 && i<=40) return true;
			return false;
		},
		getPointAt:function ( t ) {
			t *= Math.PI;
			var x = Math.sin(t * 4) * Math.cos(t * 6) * 32*0.5;
			var y = Math.cos(t * 8) * 2 + Math.cos(t * 5 * Math.sin(t)) * 4 + 10;
			var z = Math.sin(t * 3) * Math.sin(t * 2) * 32*0.5;
			return new THREE.Vector3( x, y, z );
		}	
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