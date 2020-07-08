{
	ename:window.world.currentSceneName,
	models:[{
		name:'cars',
		url:'assets/models/car/cars.glb',
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
			name:'move',
			type : 'Phong',
			color: 0xeeeeee,
			shininess: 0,
			specular: 0x000000,
			opacity: 1
		},{
			name:'cars',
			type : 'Base',
			color: 0xffffff,
			shininess: 0,
			specular: 0x000000,
			opacity: 1,
			side: THREE.DoubleSide,
			transparent: true,
			map:{url:'cars/cars.png',flipY:false}
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
		size:[100,1,100],
		mass:0,
		material:'grass',
		position: [0, -0.5, 0]
	},/*{
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
	},*/{
		type: 'car',
		conFunc:function(pWEngine){
			var _view = pWEngine.view;
			var cars = [
				{ n:'001', name:'fordM'  , radius:0.36, nw:4, w:'1', mass:1109,  wPos:[0.76, 0, 1.46] },
				{ n:'002', name:'vaz'    , radius:0.36, nw:4, w:'1', mass:1003,  wPos:[0.72, 0, 1.31] },
				{ n:'003', name:'coupe'  , radius:0.36, nw:4, w:'1', mass:900,   wPos:[0.96, 0, 1.49] },
				{ n:'004', name:'c4'     , radius:0.40, nw:4, w:'2', mass:1181,  wPos:[0.93, 0, 1.65] },
				{ n:'005', name:'ben'    , radius:0.40, nw:4, w:'2', mass:1256,  wPos:[0.88, 0, 1.58] },
				{ n:'006', name:'taxi'   , radius:0.40, nw:4, w:'2', mass:1156,  wPos:[0.90, 0, 1.49] },
				{ n:'007', name:'207'    , radius:0.40, nw:4, w:'2', mass:1156,  wPos:[0.94, 0, 1.60] },
				{ n:'008', name:'police' , radius:0.40, nw:4, w:'2', mass:1400,  wPos:[0.96, 0, 1.67] },
				{ n:'009', name:'van1'   , radius:0.46, nw:4, w:'3', mass:2000,  wPos:[1.14, 0, 1.95] },
				{ n:'010', name:'van2'   , radius:0.40, nw:4, w:'2', mass:2400,  wPos:[0.89, 0, 2.10] },
				{ n:'011', name:'van3'   , radius:0.46, nw:4, w:'3', mass:2400,  wPos:[0.90, 0, 1.83, 0, 0.26] },
				{ n:'012', name:'truck1' , radius:0.57, nw:6, w:'4', mass:10000, wPos:[1.00, 0, 2.58, 1.23, 0.18] },
				{ n:'013', name:'truck2' , radius:0.57, nw:6, w:'4', mass:14000, wPos:[1.17, 0, 3.64, 2.37] },
				{ n:'014', name:'bus'    , radius:0.64, nw:4, w:'5', mass:11450, wPos:[1.25, 0, 2.49] }		
			];
			var makeCarConf = function ( id, pos, shapeType ) {
				var o = cars[id];
				o.type = 'car';
				o.shapeType = shapeType || 'box';
				
				o.pos = pos || [0,0,0];
				var mat =  _view.getMat();	
				var shape = _view.getGeometry('shape'+o.n );
				var chassis = _view.getGeometry('mcar'+o.n );
				var down = _view.getGeometry('down'+o.n );
				var inside = _view.getGeometry('inside'+o.n );
				var yy = shape.boundingBox.min.y;

				var carMat = _view.material({
        
					name:'extra',
					roughness: 0.2,
					metalness: 0.8,
					map:{ url:'cars/cars.png'},
					transparent:true,
					side: 'Double',
					premultipliedAlpha: true
				});
				
				o.material = carMat;			
				if( inside ) o.geometry = _view.mergeGeometry([chassis, down, inside]);
				else o.geometry = _view.mergeGeometry([chassis, down]);

				o.wheelMaterial = carMat;//_view.getMat().cars;

				// The maximum length of the suspension (metres)
				o.s_length = 0.1;//o.radius;// * 0.5;
				//The maximum distance the suspension can be compressed in Cm 
				//o.s_travel = (o.radius*2)*100;
				o.mass = o.mass / 5;
				// Maximum suspension force
				o.s_force = o.mass*10;


				o.s_compression = 0.84;
				o.s_damping = 0.88;
				o.s_stiffness = 40;

				o.wPos[1] = o.radius;//*2;
				
				o.shape = shape;
				//o.mesh = mesh;
				o.wheel = _view.getGeometry( 'w00' + o.w );
				o.nWheel = o.nw;

				//o.name = 'car_'+ id;

				o.helper = true;
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