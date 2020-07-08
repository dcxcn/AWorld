{
	ename:window.world.currentSceneName,
	uiControls:[{
		name:'_',
		type:'joystick',
		isFollow:true,
		debug:false
	}],
	models:[],
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
			name:'cloth',
			type : 'Phong',
			color: 0xffffff,
			shininess: 0,
			specular: 0x000000,
			opacity: 1,
			side: THREE.DoubleSide,
			transparent: false,
			map:{url:'grid.png',wrap:1,repeat:[15,15]}
		},{
		name:'ball',
		type : 'Standard',
		color: 0xffffff,
		opacity: 1,
		metalness: 0.4,
		roughness: 0.5,
		transparent: false,
		map:{url:'ball/ball.jpg',wrap:1,repeat:[1,1]},
		normalMap:{url:'ball/ball_n.jpg',normalScale:[-1,-1]}
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
		intensity:0.4
	},{
		type: 'compass',
		texture:{url:'sprites/compass.png'}
	},{		
		type: 'box',
		size:[400,1,400],
		mass:0,
		material:'grass',
		position: [0, -0.5, 0]
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
		type: 'car',
		conFunc: function(pWEngine){
			var _view = pWEngine.view;
			var cars = [
				{ n:'001', name:'basicMoto', radius:0.43, deep:0.3, mass:600, massCenter:[0,-0.6,0],  wPos:[ 0.1, -0.02, 1.1 ], rot:[0,90,0], size:[ 0.6, 0.5, 2 ] }
			];
			var makeCarConf = function (id, pos, shapeType) {
			
				var o = cars[id];
				o.type = 'car';				
				o.name = 'car_'+id;
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