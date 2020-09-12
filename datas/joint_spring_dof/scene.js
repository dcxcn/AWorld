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
			map:{url:'land/grasslight-small.jpg',wrap:1,repeat:[15,15]}
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
		type:'box', 
		material:'grass',
		size:[10,2,60], 
		rot:[10,0,0], 
		pos:[0,-1.2,0], 
		friction:0.5 
	},{
		type: 'custom',
		customFunc: function(){
			var _physic = WEngine.physic;
			var num = 20;
			var mid = (num * 2.1) * 0.5;
			var py = 20;
			var down = true;
			var isDone = false;
			var x;

			for ( var i = 0; i < num; i++) {
				x = (i*2) - mid;
				_physic.add({ type:'box', name:'box' + i, mass: 1, pos:[x,py,0], size:[2], kinematic: i === 0 ? true : false, neverSleep:true });
			}
			
			for ( var i = 0; i < num-1; i++) {
				_physic.add({ 
					type:'joint_spring_dof', name:'joint'+i, b1:'box'+i, b2:'box'+(i+1), 
					pos1:[1,0,0], pos2:[-1,0,0], 
					axe1:[0,0,1], axe2:[0,0,1], 
					linLower:[0, 0, 0], linUpper:[0, 0, 0], 
					angLower:[-20, -20, -20], angUpper:[20, 20, 20],
					collision:false, 
					local:true 
				});
			}
			_physic.postUpdate =function () {

				    if( _physic.byName( 'box0' ) === null ) return;

					py = down ? py-0.1 : py+0.1;
					_physic.matrix( [{ name:'box0', pos:[ -mid, py, 0 ], noVelocity:true }] );

					if(py<5){ down = false }
					if(py>20){ down = true }
			}
		}
	}]
};