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
		type:'box', 
		material:'grass',
		size:[10,2,60], 
		rot:[10,0,0], 
		pos:[0,-1.2,0], 
		friction:0.5 
	},{
		type: 'custom',
		customFunc: function(){
			var _view = WEngine.view;
			var _physic = WEngine.physic;
			var ballMat = _view.material({
				name:'bball',
				roughness: 0.4,
				metalness: 0.7,
				map: { url:'bball/bball.jpg',  repeat:[2,1], flip:false },
				normalMap: { url: 'bball/bball_n.jpg', repeat:[2,1], flip:false },
			});
			
			var ball = WEngine.add({ type:'highsphere', name:'ball', size:[5], pos:[0,10,-25], mass:2, friction:0.5, material:ballMat });

			var i = 20;
			while(i--){
				_physic.add({ type:'ray', pos:[(i*0.5)-4.5,20,0], start:[0,0,5], end:[0,-20, 0], callback:function( o ){
					//console.log( o.name )
				}});
			}
			_physic.postUpdate =function () {

				if(ball.position.y<-10) _physic.matrix( [{ name:'ball', pos: [ Math.rand(-4,4),10,-25 ], rot:[Math.randInt(-180,180),0,Math.randInt(-180,180)], noVelocity:true }] );


			}
		}
	}]
};