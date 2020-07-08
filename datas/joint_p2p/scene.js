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
		type:'plane', 
		friction:0.5, 
		restitution:0.5 
	},{
		type: 'custom',
		customFunc: function(pWEngine){
			var _view = pWEngine.view;
			var _physic = pWEngine.physic;
			var mat = _view.material({ name:'mobil',
				color:0xcbad7b,
				roughness: 0.4,
				metalness: 0.5
			});
			var i, x, y, z, s;
			var geo = _view.getGeo();
			
			for( i = 0; i < 250; i++){

				x = Math.sin(i*0.025) * 40;
				y = 60 + Math.sin(i*0.5) * 15;
				z = Math.cos(i*0.025) * 40;

				_physic.add({ type:'sphere', size:[1], pos:[x, y, z], mass:0.25, state:4, name:i });

				if(i>0) _physic.add({ type:'joint_p2p', b1:(i-1), b2:i, pos1:[0,-1,0], pos2:[0,1,0], collision:true });

			}

			_physic.add({ type:'joint_p2p', b1:0, b2:249, pos1:[0,-2,0], pos2:[0,2,0], collision:true });


			for( i = 0; i<40; i++ ){
				x = Math.rand(-50, 50);
				z = Math.rand(-50, 50);
				s = Math.rand(5, 15);
				_physic.add({ type:'box', geometry:geo.dice, geoSize:[s], size:[s], pos:[x,s*0.5,z], mass:s });
			}
		}
	}]
};