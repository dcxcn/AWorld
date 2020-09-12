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
		customFunc: function(){
			var _view = WEngine.view;
			var _physic = WEngine.physic;
			var mat = _view.material({ name:'mobil',
				color:0xcbad7b,
				roughness: 0.4,
				metalness: 0.5
			});
			var s = (6*0.5) - 0.3; 
			var tableShape = [
				{ type:'box', pos:[0,0,0], size:[ 6,0.5,6 ] },
				{ type:'box', pos:[s,-2.25,s], size:[ 0.6,4,0.6 ] },
				{ type:'box', pos:[-s,-2.25,s], size:[ 0.6,4,0.6 ] },
				{ type:'box', pos:[s,-2.25,-s], size:[ 0.6,4,0.6 ] },
				{ type:'box', pos:[-s,-2.25,-s], size:[ 0.6,4,0.6 ] },
			]

			var chairShape = [
				{ type:'box', pos:[0,0,0], size:[ 3,0.5,3 ] },
				{ type:'box', pos:[1.2,-1.6,1.2], size:[ 0.4,3,0.4 ] },
				{ type:'box', pos:[-1.2,-1.6,1.2], size:[ 0.4,3,0.4 ] },
				{ type:'box', pos:[1.2,-1.6,-1.2], size:[ 0.4,3,0.4 ] },
				{ type:'box', pos:[-1.2,-1.6,-1.2], size:[ 0.4,3,0.4 ] },
				{ type:'box', pos:[1.2,1.6,-1.2], size:[ 0.4,3,0.4 ] },
				{ type:'box', pos:[-1.2,1.6,-1.2], size:[ 0.4,3,0.4 ] },
				{ type:'box', pos:[0,2.5,-1.2], size:[ 2.3,1,0.3 ] },
			]

			var i = 200, t;
			while(i--){

				t = Math.randInt(0,5);

				_physic.add({
					type:'compound',
					mass:1,
					pos:[Math.rand(-5,5),(i+1)*6,Math.rand(-5,5)],
					shapes:t===5 ? tableShape : chairShape,
					friction:0.5, 
					restitution:0.5,
					material:mat
				})
			}
		}
	}]
};