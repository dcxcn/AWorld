{
	ename:window.world.currentSceneName,
	uiControls:[{
		name:'_',
		type:'joystick',
		isFollow:true,
		debug:false
	}],
	models:[{
		name:'buggy',
		url:'assets/models/car/buggy.glb',
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
		color:0xffffff,
		intensity:0.8
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
				{ n:'001', name:'buggy', radius:0.43, deep:0.3, mass:1300, massCenter:[0,0,0],  wPos:[ 0.838, 0.43, 1.37 ], rot:[0,0,0], size:[ 1.5, 0.4, 3.6 ] }
			];
			var makeCarConf = function (id, pos, shapeType) {
				
				//材质
				var mat={};
				mat['glass'] = _view.material({name:'glass',roughness: 0.0,metalness: 1.0,	color: 0xeeefff,transparent:true,opacity:0.3,premultipliedAlpha: true});
				mat['body'] = _view.material({name:'body',	roughness: 0.2,	metalness: 0.8,	envMapIntensity: 1.25, map: { url:'buggy/body.jpg'},premultipliedAlpha: true});
				mat['extra'] = _view.material({name:'extra', roughness: 0.4, metalness: 0.6, map: { url:'buggy/extra.jpg' }, normalMap: { url:'buggy/extra_n.jpg' }});
				mat['pilote'] = _view.material({name:'pilote',roughness: 0.4, metalness: 0.6, map: { url:'buggy/pilote.jpg' }});
				mat['wheel'] = _view.material({name:'wheel',roughness: 0.4,	metalness: 0.6,	map: { url:'buggy/wheel_c.jpg' },normalMap: { url:'buggy/wheel_n.jpg' }});
				mat['pneu'] = _view.material({name:'pneu',roughness: 0.7,metalness: 0.5,map: { url:'buggy/wheel_c.jpg' },normalMap: { url:'buggy/wheel_n.jpg' },
					normalScale: [ 2, 2 ],envMapIntensity: 0.6});
				mat['susp'] = _view.material({name:'susp',roughness: 0.6,metalness: 0.4,map: { url:'buggy/suspension.jpg' }});
				mat['suspM'] = _view.material({name:'suspM',roughness: 0.6,metalness: 0.4,map: { url:'buggy/suspension.jpg' },morphTargets:true});
				mat['brake'] = _view.material({name:'brake',	transparent:true, opacity:0.2, color: 0xdd3f03});
				mat['cshadow'] = _view.material({name:'cshadow',transparent:true, opacity:0.0, color: 0xdd3f03,	depthTest:false, depthWrite:false});
				//
				var mesh = _view.getMesh(  'h_chassis' );
				var wheel = _view.getMesh(  'h_wheel' );
				var susp = _view.getMesh(  'h_susp_base' );
				var brake = _view.getMesh(  'h_brake' );
				var steeringWheel;

				brake.material = mat.wheel;
				brake.receiveShadow = false;
				brake.castShadow = false;

				brake.children[0].material = mat.brake;
				brake.children[0].receiveShadow = false;
				brake.children[0].castShadow = false;
				//

				susp.material = mat.susp;
				susp.receiveShadow = false;
				susp.castShadow = false;

				susp.children[0].material = mat.suspM;
				susp.children[0].receiveShadow = false;
				susp.children[0].castShadow = false;

				mesh.material = mat.body;
				//mesh.receiveShadow = false;
				//mesh.castShadow = false;

				var k = mesh.children.length, m;

				while(k--){

					m = mesh.children[k];
					if( m.name === 'h_glasses' ) m.material = mat.glass;
					else if( m.name === 'h_pilote' ) m.material = mat.pilote;
					else if( m.name === 'h_steering_wheel' || m.name === 'h_sit_R' || m.name === 'h_sit_L' 
					|| m.name === 'h_extra' || m.name === 'h_pot' || m.name === 'h_license') m.material = mat.extra;
					else m.material = mat.body;

					if( m.name === 'h_steering_wheel' ) steeringWheel = m;

					m.castShadow = true;//false;
					m.receiveShadow = true;//false;

					if( m.name === 'h_shadow' ){  m.visible = false; m.material = mat.cshadow; m.castShadow = true; m.receiveShadow = false; }

				}
				k = wheel.children.length;
				while(k--){
					m = wheel.children[k];						
					//if( m.name === 'h_pneu' ) m.material = mat.pneu; else m.material = mat.wheel;
					m.castShadow = true;
					m.receiveShadow = true;
				}
				//var mm = _view.getMesh( 'h_shape' );
				//_view.addVisual( new THREE.Mesh(  _view.getGeometry( 'h_shape' ), _view.getMaterial('move')));
				//wheel.position.set(0,2,0);
				//_view.addVisual(wheel);
				//return;
					
					
					
					
				var o = cars[id];
				o.type = 'car';				
				o.name = 'car_'+id;
				o.helper = true;
				o.debug = false;					
				o.shape = _view.getGeometry( 'h_shape' );
				o.shapeType = shapeType || 'box';
				o.mesh = mesh;
				o.meshWheel = wheel;
				o.meshSusp = susp;
				o.meshBrake = brake;
				o.meshSteeringWheel = steeringWheel;
				o.extraWeels = true;
				o.wheelMaterial = mat.wheel;
				o.pos = pos || [0,0,0];
				o.rot = o.rot || [0,0,0];
				
				o.restitution = o.restitution || 0;
				o.linear = o.linear || 0;
				o.angular =  o.angular || 0;
				// 汽车设置
				o.mass = o.mass || 1300; // mass of vehicle in kg
				o.massCenter = o.massCenter || [0,0,0];//massCenter - local center of mass (best is on chassis bottom)
				o.engine = o.engine || 2000;// Maximum driving force of the vehicle
				o.acceleration = o.acceleration || 50;// engine increment
				// 悬架设置
				// Damping relaxation should be slightly larger than compression
				o.s_compression = o.s_compression || 2.3;// 0.1 to 0.3 are real values default 0.84 // 4.4
				o.s_damping = o.s_damping || 2.4;//2.4, // The damping coefficient for when the suspension is expanding. default : 0.88 // 2.3

				o.s_stiffness = o.s_stiffness || 15;// 10 = Offroad buggy, 50 = Sports car, 200 = F1 Car 
				o.s_force = o.s_force || 16000; // Maximum suspension force
					
				o.s_travel = o.s_travel || 0.4; // The maximum distance the suspension can be compressed in meter
				o.s_length = o.s_length || 0.2;//0.1, // The maximum length of the suspension in meter
				// 车轮 设置
				o.radius = o.radius || 0.43;//radius - wheels radius
				o.deep = o.deep || 0.3;//deep -  wheels deep only for three cylinder
				o.wPos = o.wPos ||[ 0.838, 0.43, 1.37 ]; //wPos - wheels position on chassis
				o.friction = o.friction || 0.6; // friction: The constant friction of the wheels on the surface.
				
				// For realistic TS It should be around 0.8. 
				// But may be greatly increased to improve controllability (1000 and more)
				// Set large (10000.0) for kart racers
				o.w_friction =  o.w_friction || 10;
				// roll: reduces torque from the wheels
				// reducing vehicle barrel chance
				// 0 - no torque, 1 - the actual physical behavior
				o.w_roll = o.w_roll || 0.1;

				return o;
			};
			var confAry=[];
			for (var i = 0; i < cars.length; i++){
				confAry.push(makeCarConf( i, [-25+(i*4), 0,0], 'convex'));
			}
			return confAry;
		}	
	}]
};