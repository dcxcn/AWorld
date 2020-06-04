{
	ename:window.world.currentSceneName,
	models:[{
		name:'human4',
		url:'./assets/models/human4/model.glb',
		isSet:false	
	}],
	materials:[{
			name:'grass',
			type : 'phong',
			color: 0xffffff,
			shininess: 0,
			specular: 0x000000,
			opacity: 1,
			transparent: false,
			map:{image:'./assets/textures/land/grasslight-small.jpg',wrap:1,repeat:[15,15]},
			combine:THREE.MixOperation
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
		color:0xcccccc,
		intensity:0.7
	},{
		type: 'compass',
		texture:{url:'sprites/compass.png'}
	},{
		show: true,
		uuid: "",
		name: 'floor1',
		type: 'floor',
		size: [400,0.1,400],
		position: [0,0,0],
		style: {
			skinColor: 0x8ac9e2,
			skin: {
				skin_up: {
					skinColor: 0x98750f,
					imgurl: "datacenterdemo/floor.jpg",
					repeatx: true,
					repeaty: true,
					width: 1.28,
					height: 1.28
				},
				skin_down: {
					skinColor: 0x8ac9e2,
				},
				skin_fore: {
					skinColor: 0x8ac9e2,
				}
			}
		}
	},{
		type: 'box',
		conFunc: function(pWEngine){
			var _view = pWEngine.view;
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
	
			var o = { radius:9, height:20, detail:15, pos:[0,0,0], mass:0.4 };
			var confAry = [];
			var pos = new THREE.Vector3();
			// Wall

			var tx, ty, tz;
			var detail =  o.detail === "undefined" ? 10 : o.detail;
			var mass =  o.mass === "undefined" ? 1 : o.mass;

			if(o.pos instanceof Array){
				tx = o.pos[0] || 0;
				ty = o.pos[1] || 0;
				tz = o.pos[2] || 0;
			} else {
				tx = ty = tz = 0;
			}

			var px, py, pz, angle, rad;
			var radius = o.radius || 1;
			var height = o.height || 1;
			var sx = o.thickness || 1, sy = o.sy || 1, sz = radius * 5 / detail;

			for(var j = 0; j < height; j++){
				for(var i = 0; i < detail; i++){

					rad = radius;
					angle = (Math.PI * 2 / detail * (i + (j & 1) * 0.5));
					px = tx + Math.cos(angle) * rad;
					py = (ty + (sy) + j * sy) - (sy*0.5);
					pz = tz + -Math.sin(angle) * rad;

					confAry.push({

						type:"box",
						material:glass,
						size:[sx,sy,sz],
						pos:[px,py,pz],
						rot:[0,angle*(180 / Math.PI),0],
						mass:mass,
						restitution:0.1, 
						friction:0.5,
						//interval:0,
						state:2,

					});
				}
			}
			return confAry;
		}
	},{
		type: 'avatar',
		ename: 'human4',
		cname: '老四',
		position :[3,1,4],
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