{
	ename:window.world.currentSceneName,
	models:[{
		name:'human4',
		url:'./assets/models/avatar/makehuman/human4/model.glb',
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
		type: 'rollercoaster',
		segments : [300,300],
		haslifter : true,
		nolifter : function( i ){
			return false;
		},
		getPointAt:function ( t ) {
			if( t<=1){
				var a = 20*(1-t); // radius
				var b = 15; // height
				var t2 = 2 * Math.PI * t * b / 4;
				var x = Math.cos( t2 ) * a;
				var z = Math.sin( t2 ) * a;
				var y = b * t+t*1+5;
				return new THREE.Vector3( x, y, z );
			}
		}	
	},{
		type: 'avatar',
		ename: 'human4',
		cname: '老四',
		position :[3,2,4],
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