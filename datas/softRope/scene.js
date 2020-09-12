{
	ename:window.world.currentSceneName,
	materials:[{
			name:'grass',
			type : 'Phong',
			color: 0xffffff,
			shininess: 0,
			specular: 0x000000,
			opacity: 1,
			transparent: false,
			map:{url:'land/grasslight-small.jpg',wrap:1,repeat:[15,15]},
			combine:THREE.MixOperation
		}],
	sounds:[],
	actions:[],
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
		type: 'custom',
		customFunc: function(){
			var _view = WEngine.view;
			var _physic = WEngine.physic;
			var glass = _view.material({
				name:'glass',
				color: 0x3366ff,
				transparent:true,
				metalness:1,
				roughness:0,
				opacity:0.5,
				depthWrite: false,
				premultipliedAlpha:true,
				//side: THREE.DoubleSide,
			});
			var z = 0;
			
			for( var i = 0; i < 20; i++){

				z = -20 + i*2;

				WEngine.add({ 
					type:'softRope',
					material:glass,
					name:'rope'+i, 
					radius:0.5,
					mass:1,
					state:4, 
					start:[-40,10,z],
					end:[40,10,z], 
					numSegment:20,
					viterations:10,
					piterations:10,
					citerations:4,
					diterations:0,
					fixed: 1+2,
					margin:0.5,// memorry bug !!!
				});
			}

			var i = 10;
			while(i--){
				WEngine.add({ type:'sphere',material:glass, size:[Math.rand(2,4)], pos:[Math.rand(-30,30), 30+(i*3), Math.rand(-10,10)], mass:0.2});
			}

			_physic.postUpdate =function () {

				var r = [];
				// get list of rigidbody
				var bodys = _physic.getBodys();

				bodys.forEach( function ( b, id ) {

					if( b.position.y < -3 ){
						r.push( { name:b.name, pos:[ Math.rand(-30,30), 50, Math.rand(-10,10)], noVelocity:true } );
					}

				});

				// apply new matrix to bodys
				_physic.matrix( r );

			}
		}
	}]
};