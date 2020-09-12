{
	ename:window.world.currentSceneName,
	models:[{
		name:'street_all',
		url:'./assets/models/street/Streets_all.glb',
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
		meshName:'Street_4Way',
		roadblock:false,		
		positions:[[0,0,0]],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_Straight',
		roadblock:false,		
		positions:[[-20,0,0]],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_Ramp_Bridge001',
		roadblock:false,		
		positions:[[-40,0,0]],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_Bridge_Water',
		roadblock:false,		
		positions:[[-60,0,0]],
		rot:[0,90,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_Ramp_Bridge001',
		roadblock:false,		
		positions:[[-80,0,0]],
		rot:[0,180,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},/*{
		type: 'model',
		meshName:'Street_Curve',
		roadblock:false,		
		positions:[[-100,0,0]],
		rot:[0,0,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_RampElevated',
		roadblock:false,		
		positions:[[-100,0,20]],
		rot:[0,0,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_Elevated',
		roadblock:false,		
		positions:[[-100,0,40]],
		rot:[0,90,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_RampElevated',
		roadblock:false,		
		positions:[[-100,0,60]],
		rot:[0,180,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_3Way_2',
		roadblock:false,		
		positions:[[-100,0,80]],
		rot:[0,0,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_Deadend',
		roadblock:false,		
		positions:[[-120,0,80]],
		rot:[0,180,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_Straight',
		roadblock:false,		
		positions:[[-100,0,100]],
		rot:[0,90,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_Curve',
		roadblock:false,		
		positions:[[-100,0,120]],
		rot:[0,90,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_Ramp_Water001',
		roadblock:false,		
		positions:[[-80,0,120]],
		rot:[0,-90,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_Bridge_Water',
		roadblock:false,		
		positions:[[-60,0,120]],
		rot:[0,90,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_Bridge_Underpass',
		roadblock:false,		
		positions:[[-40,0,120]],
		rot:[0,90,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_Ramp_Bridge001',
		roadblock:false,		
		positions:[[-20,0,120]],
		rot:[0,0,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_Straight',
		roadblock:false,		
		positions:[[-40,0,100]],
		rot:[0,90,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_Curve',
		roadblock:false,		
		positions:[[-40,0,80]],
		rot:[0,0,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_Straight',
		roadblock:false,		
		positions:[[-20,0,80]],
		rot:[0,0,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_4Way_2',
		roadblock:false,		
		positions:[[0,0,80]],
		rot:[0,0,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_Straight',
		roadblock:false,		
		positions:[[0,0,60],[0,0,40]],
		rot:[0,90,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_3Way',
		roadblock:false,		
		positions:[[0,0,120]],
		rot:[0,-90,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_Straight',
		roadblock:false,		
		positions:[[0,0,100]],
		rot:[0,90,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},{
		type: 'model',
		meshName:'Street_Straight',
		roadblock:false,		
		positions:[[0,0,20],[0,0,-20]],
		rot:[0,90,0],
		mass:0,
		friction:0.5, 
		restitution:0.9,
		scale:[10,10,10]
	},*/{
		type: 'car',
		conFunc: function(){
			var _view = WEngine.view;
			var cars = [
				{ n:'001', name:'basicMoto',pos:[1,5,0], radius:0.43, deep:0.3, mass:600, massCenter:[0,-0.6,0],  wPos:[ 0.1, -0.02, 1.1 ], rot:[0,-90,0], size:[ 0.6, 0.5, 2 ] }
			];
			var makeCarConf = function (id, pos, shapeType) {
			
				var o = cars[id];
				o.type = 'car';				
				o.name = 'car_'+id || o.name;
				o.helper = true;
				o.debug = false;
				o.shapeType = shapeType || 'box';
				o.pos = pos || [0,0,0];
				o.rot = o.rot || [0,90,0];
				
				o.restitution = o.restitution || 0;
				o.linear = o.linear || 0;
				o.angular =  o.angular || 0;
				o.rolling = o.rolling || 0;
				o.limitAngular = [0.8,1,0.8];
				// 汽车设置
				o.mass = o.mass || 1300; // mass of vehicle in kg
				o.massCenter = o.massCenter || [0,0,0];//massCenter - local center of mass (best is on chassis bottom)
				o.engine = o.engine || 1000;// Maximum driving force of the vehicle
				o.acceleration = o.acceleration || 10;// engine increment
				// 悬架设置
				// Damping relaxation should be slightly larger than compression
				o.s_compression = o.s_compression || 2.3;// 0.1 to 0.3 are real values default 0.84 // 4.4
				o.s_damping = o.s_damping || 2.4;//2.4, // The damping coefficient for when the suspension is expanding. default : 0.88 // 2.3

				o.s_stiffness = o.s_stiffness || 20;// 10 = Offroad buggy, 50 = Sports car, 200 = F1 Car 
				o.s_force = o.s_force || 6000; // Maximum suspension force
					
				o.s_travel = o.s_travel || 5; // The maximum distance the suspension can be compressed in meter
				o.s_length = o.s_length || 0.2;//0.1, // The maximum length of the suspension in meter
				// 车轮 设置
				o.nWheel = 2;
				o.radius = o.radius || 0.36;//radius - wheels radius
				o.radiusBack = 0.39;// wheels radius
				o.deep = o.deep || 0.19;//deep -  wheels deep only for three cylinder
				o.wPos = o.wPos ||[ 0.1, -0.02, 1.1 ]; //wPos - wheels position on chassis
				o.decalYBack = 0.02;
				o.friction = o.friction || 0.6; // friction: The constant friction of the wheels on the surface.
				
				// For realistic TS It should be around 0.8. 
				// But may be greatly increased to improve controllability (1000 and more)
				// Set large (10000.0) for kart racers
				o.w_friction =  o.w_friction || 100;
				// roll: reduces torque from the wheels
				// reducing vehicle barrel chance
				// 0 - no torque, 1 - the actual physical behavior
				o.w_roll = o.w_roll || 0.3;

				return o;
			};
			var confAry=[];
			for (var i = 0; i < cars.length; i++){
				confAry.push(makeCarConf( i, [-25+(i*4), 4,0], 'box'));
			}
			return confAry;			
		}	
	}]
};