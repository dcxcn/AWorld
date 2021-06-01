{
	ename:window.world.currentSceneName,
	uiControls:[{
		name:'_',
		type:'joystick',
		isFollow:false,
		debug:false
	}],
	models:[{
		name:'human4',
		url:'./assets/models/avatar/makehuman/human4/model.glb',
		isSet:false	
	}],
	materials:[],
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
		size: [20,0.1,16],
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
		show: true,
		uuid: "",
		name: 'wall',
		type: 'wall',
		thick: 0.2,
		length: 1,
		height: 2.4,
		style: {color: 0xffffff},
		skin: {
			 skin_up: {skinColor: 0xdddddd},
			 skin_down: {skinColor: 0xdddddd},
			 skin_fore: {skinColor: 0xb0cee0},
			 skin_behind: {skinColor: 0xb0cee0},
			 skin_left: {skinColor: 0xdeeeee},
			 skin_right: {skinColor: 0xb0cee0}
		},
		wallData: [{//wall1
		 uuid: "",
		 name: 'wall1',
		 thick: 0.2,
		 height: 2.4,
		 skin: {
			 skin_up: {skinColor: 0xdddddd},
			 skin_down: {skinColor: 0xdddddd},
			 skin_fore: {skinColor: 0xb0cee0},
			 skin_behind: {skinColor: 0xb0cee0},
			 skin_left: {skinColor: 0xdeeeee},
			 skin_right: {skinColor: 0xb0cee0}
		 },
		 path:[[-5,1.2,-3.5],[5,1.2,-3.5],[5,1.2,4.5],[-5,1.2,4.5],[-5,1.2,-3.5]],
		 rotation: [{ direction: 'x', degree: 0 }],//旋转 表示x方向0度  arb表示任意参数值[x,y,z,angle] 
		 childrens: [{
				  op: '-',
				  show: true,
				  uuid: "",
				  name: 'doorhole',
				  objType: 'doorhole',
				  thick: 0.2,
				  height: 2.2,
				  startDot: {x: -4.1,y: 1.1,z: -3.5},
				  endDot: {x: -1.9,y: 1.1,z: -3.5},
				  skin: {
					  skin_up: {skinColor: 0xffdddd},
					  skin_down: {skinColor: 0xdddddd},
					  skin_fore: {skinColor: 0xffdddd},
					  skin_behind: {skinColor: 0xffdddd},
					  skin_left: {skinColor: 0xffdddd},
					  skin_right: {skinColor: 0xffdddd}
				  }
			  },{
					 op: '-',
					 show: true,
					 uuid: "",
					 name: 'windowHole',
					 objType: 'windowHole',
					 thick: 0.2,
					 height: 1.6,
					 startDot: {x: -0.5,y: 1.3,z: -3.5},
					 endDot: {x: 4.5,y: 1.3,z: -3.5}
				 },{
					show: true,
					name: 'windowCaseBottom',
					uuid: "",
					objType: 'cube',
					thick: 0.3,
					height: 0.1,
					startDot: {x: -0.5,y: 0.5,z: -3.5},
					endDot: {x: 4.5,y: 0.5,z: -3.5},
					skin: {
						skin_up: {skinColor: 0xc0dee0},
						skin_down: {skinColor: 0xc0dee0},
						skin_fore: {skinColor: 0xc0dee0},
						skin_behind: {skinColor: 0xc0dee0},
						skin_left: {skinColor: 0xd0eef0},
						skin_right: {skinColor: 0xd0eef0}
					}
				},{
				  show: true,
				  uuid: "",
				  name: 'doorCaseRight',
				  objType: 'cube',
				  thick: 0.24,
				  height: 2.2,
				  startDot: {x: -4.1,y: 1.1,z: -3.5},
				  endDot: {x: -4.05,y: 1.1,z: -3.5},
				  skin: {
					  skin_up: {skinColor: 0xc0dee0},
					  skin_down: {skinColor: 0xc0dee0},
					  skin_fore: {skinColor: 0xc0dee0},
					  skin_behind: {skinColor: 0xc0dee0},
					  skin_left: {skinColor: 0xd0eef0},
					  skin_right: {skinColor: 0xd0eef0}
				  }
			  },{
				  show: true,
				  name: 'doorCaseLeft',
				  uuid: "",
				  objType: 'cube',
				  thick: 0.24,
				  height: 2.2,
				  startDot: {x: -1.9,y: 1.1,z: -3.5},
				  endDot: {x: -1.95,y: 1.1,z: -3.5},
				  skin: {
					  skin_up: {skinColor: 0xc0dee0},
					  skin_down: {skinColor: 0xc0dee0},
					  skin_fore: {skinColor: 0xc0dee0},
					  skin_behind: {skinColor: 0xc0dee0},
					  skin_left: {skinColor: 0xd0eef0},
					  skin_right: {skinColor: 0xd0eef0}
				  }
			  },{
				  show: true,
				  name: 'doorCaseTop',
				  uuid: "",
				  objType: 'cube',
				  thick: 0.24,
				  height: 0.05,
				  startDot: {x: -1.9,y: 2.2,z: -3.5},
				  endDot: {x: -4.1,y: 2.2,z: -3.5},
				  skin: {
					  skin_up: {skinColor: 0xc0dee0},
					  skin_down: {skinColor: 0xc0dee0},
					  skin_fore: {skinColor: 0xc0dee0},
					  skin_behind: {skinColor: 0xc0dee0},
					  skin_left: {skinColor: 0xd0eef0},
					  skin_right: {skinColor: 0xd0eef0}
				  }
			  },{
				  show: true,
				  name: 'doorCaseBottom',
				  uuid: "",
				  objType: 'cube',
				  thick: 0.24,
				  height: 0.05,
				  startDot: {x: -1.9,y: 0.05,z: -3.5},
				  endDot: {x: -4.1,y: 0.05,z: -3.5},
				  skin: {
					  skin_up: {skinColor: 0xc0dee0},
					  skin_down: {skinColor: 0xc0dee0},
					  skin_fore: {skinColor: 0xc0dee0},
					  skin_behind: {skinColor: 0xc0dee0},
					  skin_left: {skinColor: 0xd0eef0},
					  skin_right: {skinColor: 0xd0eef0}
				  }
			  },{
				  show: true,
				  name: 'doorLeft',
				  uuid: "",
				  objType: 'cube',
				  thick: 0.04,
				  height: 2.1,
				  mass:100,
				  startDot: {x: -1.96,y: 1.12,z: -3.5},
				  endDot: {x: -2.9,y: 1.12,z: -3.5},
				  skin: {
					  opacity: 0.1,
					  skin_up: {skinColor: 0x51443e},
					  skin_down: {skinColor: 0x51443e},
					  skin_fore: {skinColor: 0x51443e},
					  skin_behind: {skinColor: 0x51443e},
					  skin_left: {skinColor: 0x51443e,imgurl: "datacenterdemo/door_left.png"},
					  skin_right: {skinColor: 0x51443e,imgurl: "datacenterdemo/door_right.png"}
				  }
			  },{
				  show: true,
				  name: 'doorRight',
				  uuid: "",
				  objType: 'cube',
				  thick: 0.04,
				  height: 2.1,
				  mass:100,
				  startDot: {x: -3.1,y: 1.12,z: -3.5},
				  endDot: {x: -4.04,y: 1.12,z: -3.5},
				  skin: {
					  opacity: 0.1,
					  skin_up: {skinColor: 0x51443e},
					  skin_down: {skinColor: 0x51443e},
					  skin_fore: {skinColor: 0x51443e},
					  skin_behind: {skinColor: 0x51443e},
					  skin_left: {skinColor: 0x51443e,imgurl: "datacenterdemo/door_right.png"},
					  skin_right: {skinColor: 0x51443e,imgurl: "datacenterdemo/door_left.png"}
				  }
			  },{
				   show: true,
				   name: 'doorControl',
				   uuid: "",
				   objType: 'cube',
				   thick: 0.1,
				   height: 0.4,
				   startDot: {x: -1.2,y: 1.6,z: -3.65},
				   endDot: {x: -1.6,y: 1.6,z: -3.65},
				   skin: {
					   opacity: 0.1,
					   skin_up: {skinColor: 0x333333},
					   skin_down: {skinColor: 0x333333},
					   skin_fore: {skinColor: 0x333333},
					   skin_behind: {skinColor: 0x333333},
					   skin_left: {skinColor: 0x333333,imgurl: "datacenterdemo/doorControl.jpg"},
					   skin_right: {skinColor: 0x333333}
				   }
				}]
	}]
	},{
		show: true,
		name: 'windowGlass1',
		uuid: "",
		type: 'glasses',
		width: 5,
		height: 1.6,
		pic: "datacenterdemo/glass.png",
		transparent: true,
		opacity: 1,
		position: { x: 2, y: 1.3, z: -3.5 },
		rotation: { x: 0, y: 0 * Math.PI, z: 0 },
		blending: false,
	},{
		show: true,
		name: 'messagePanel',
		uuid: "",
		type: 'planex',
		width: 1,
		height: 1.6,
		pic: "datacenterdemo/message.jpg",
		transparent: true,
		opacity: 1,
		position: { x:-2.5, y: 1.5, z: 4.39 },
		rotation: { x: 0, y: Math.PI, z: 0 },
		blending: false,
	},{
		 show: true,
		 uuid: "",
		 name: 'aircondition',
		 type: 'cube',
		 size:[0.6,2.2,0.8],		
		 position:[-4.2,1.1,3.7],// position:[-4.2,1.1,3.7],
		 rot:[0,45,0],
		 style: {
			 skinColor: 0xfefefe,
			 skin: {
				 skin_fore: {
					 imgurl: "datacenterdemo/aircondition.jpg",
				 },
			 }
		 }
	 },{
		 show: true,
		 uuid: "",
		 name: 'television',
		 type: 'cube',
		 size: [0.1,1.2,1.8],
		 position: [-4.8,1.5,0],
		 style: {
			 skinColor: 0x555555,
			 skin: {
				 skin_fore: {
					 imgurl: "datacenterdemo/tv.jpg",
				 },
			 }
		 }
	 },{
		show:true,
		name: 'cabinet1_1',
		shellname:'cabinet1_1_shell',
		uuid: '',
		type: 'emptyCabinet',
		transparent:true,
		size:[0.66,2,0.70,0.02],
		position: [3,1.05,-1.8],
		doors: {
			doorType:'lr',// ud上下门 lr左右门 单门可以缺省
			doorSize: [0.01],
			doorname: ['cabinet1_1_door_01'],
			skins:[ {
				skinColor: 0x333333,
				skin_fore: {imgurl: "datacenterdemo/rack_door_back.jpg"},
				skin_behind: {imgurl: "datacenterdemo/rack_front_door.jpg"}
			}]
		},
		skin:{
			skinColor: 0xff0000,
			skin_up: {
				skin:{
					skinColor: 0xff0000,
					skin_up: { imgurl: "datacenterdemo/rack_door_back.jpg" },
					skin_down: { imgurl: "datacenterdemo/rack_door_back.jpg" },
					skin_fore: {skinColor: 0xff0000,imgurl: "datacenterdemo/rack_door_back.jpg"},
					skin_behind: {skinColor: 0xff0000,imgurl: "datacenterdemo/rack_door_back.jpg"},
					skin_left: { imgurl: "datacenterdemo/rack_door_back.jpg" },
					skin_right: { imgurl: "datacenterdemo/rack_door_back.jpg" },
				}
			},
			skin_down: {
				skin: {skinColor: 0x333333}
			},
			skin_left: {
				skin: {skinColor: 0x333333}
			},
			skin_right: {
				skin: {skinColor: 0x333333}
			},
			skin_behind: {
				skin: {skinColor: 0x333333}
			}
		}
	},{
		  show: true,
		  uuid: "",
		  name: 'equipment_card_1',
		  type: 'cube',
		  size: [0.6,0.1,0.65],
		  position: [-1,1.05,-1.8],
		  style: {
			  skinColor: 0xff0000,
			  skin: {
				  skin_up: {skinColor: 0xff0000,imgurl: "datacenterdemo/rack_inside.jpg"},
				  skin_down: {skinColor: 0xff0000,imgurl: "datacenterdemo/rack_inside.jpg"},
				  skin_fore: {skinColor: 0xff0000,imgurl: "datacenterdemo/rack_inside.jpg"},
				  skin_behind: {skinColor: 0xff0000,imgurl: "datacenterdemo/server2.jpg"},
				  skin_left: {skinColor: 0xff0000,imgurl: "datacenterdemo/rack_inside.jpg"},
				  skin_right: {skinColor: 0xff0000,imgurl: "datacenterdemo/rack_inside.jpg"}
			  }
		  }
	  },{
		  show: true,
		  uuid: "",
		  name: 'equipment_card_2',
		  type: 'cube',
		  size: [0.6,0.2,0.65],
		  position:[-1,1.2,-1.8],
		  style: {
			  skinColor: 0x92630b,
			  skin: {
				  skin_up: {skinColor: 0x92630b,imgurl: "datacenterdemo/rack_inside.jpg"},
				  skin_down: {skinColor: 0x92630b,imgurl: "datacenterdemo/rack_inside.jpg"},
				  skin_fore: {skinColor: 0x92630b,imgurl: "datacenterdemo/rack_inside.jpg"},
				  skin_behind: {skinColor: 0x92630b,imgurl: "datacenterdemo/server2.jpg"},
				  skin_left: {skinColor: 0x92630b,imgurl: "datacenterdemo/rack_inside.jpg"},
				  skin_right: {skinColor: 0x92630b,imgurl: "datacenterdemo/rack_inside.jpg"}
			  }
		  }
	  },{
		  show: true,
		  uuid: "",
		  name: 'equipment_card_3',
		  type: 'cube',
		  size: [0.6,0.3,0.65],
		  position: [-1,1.45,-1.8],
		  style: {
			  skinColor: 0x92630b,
			  skin: {
				  skin_up: {skinColor: 0x92630b,imgurl: "datacenterdemo/rack_inside.jpg"},
				  skin_down: {skinColor: 0x92630b,imgurl: "datacenterdemo/rack_inside.jpg"},
				  skin_fore: {skinColor: 0x92630b,imgurl: "datacenterdemo/rack_inside.jpg"},
				  skin_behind: {skinColor: 0x92630b,imgurl: "datacenterdemo/server3.png"},
				  skin_left: {skinColor: 0x92630b,imgurl: "datacenterdemo/rack_inside.jpg"},
				  skin_right: {skinColor: 0x92630b,imgurl: "datacenterdemo/rack_inside.jpg"}
			  }
		  }
	  },{
		  type:'cloneObj',
		  conFunc:function(){
			var confAry=[];
			for (var i = 1; i <=3;i++){ 
				for (var j = 1; j <=5; j++) {
					if (i != 1 || j != 1) {
						confAry.push({
							show: true,
							copyfrom: 'cabinet1_1',
							name: 'cabinet'+i+'_'+j,
							childrenname: ['cabinet' + i + '_' + j + '_shell', 'cabinet' + i + '_' + j + '_door_01'],
							uuid: '',
							objType: 'cloneObj',
							position: [-(i-1)*2+3, 1.05 , (j-1)*1-1.8 ],
							scale: { x: 1, y: 1, z: 1 }
						});
					}
				}
			}
			return confAry;
		  }
	  
	  },{
		type: 'joint_hinge',
		name: 'joint_hinge_doorLeft',
		body1: 'doorCaseBottom',
		body2: 'doorLeft',
		pos1:[0.98, 0.025, 0],
		pos2:[0.49, -1.051, 0],
		axe1:[0, 1, 0],
		axe2:[0, 1, 0],
		limit:[0,0],		
		lock:true
	},{
		type: 'joint_hinge',
		name: 'joint_hinge_doorRight',
		body1: 'doorCaseBottom',
		body2: 'doorRight',
		pos1:[-0.98,0.025, 0],
		pos2:[-0.49, -1.051, 0],
		axe1:[0, 1, 0],
		axe2:[0, 1, 0],
		limit:[0,0],
		lock:true
	},{
		type: 'avatar',
		ename: 'human4',
		cname: '管理员',
		position :[1,1,-6],
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
		
	}],
    events: {
		dbclick: [{
			obj_name: "doorControl",
			obj_uuid: "",
			obj_event: function (o) {
				var updateLockState = function(threeObj,lockState){	
					var hingeLimit=[0, 0, 0.9, 0.3, 0.1];				
					if (lockState){
						window.WEngine.options({
							name:'joint_hinge_'+threeObj.name,
							type:'joint_hinge',
							limit:("doorRight"==threeObj.name)?[-80, -79]:[80, 81]
						});
						threeObj.userData.lock=false;
					}else{
						window.WEngine.options({
							name:'joint_hinge_'+threeObj.name,
							type:'joint_hinge',
							limit:hingeLimit
						});	
						threeObj.userData.lock=true;
					}
				};
				var doorR = window.WEngine.byName("doorRight");
				var doorL = window.WEngine.byName("doorLeft");
				o.userData = o.userData||{};
				o.userData.lock = doorR.userData.lock && doorL.userData.lock;
				updateLockState(doorR,o.userData.lock);
				updateLockState(doorL,o.userData.lock);
			}
		},{
			obj_name: "doorRight",
			obj_uuid: "",
			obj_event: function (o) {
				var updateLockState = function(threeObj,lockState){	
					var hingeLimit=[0, 0, 0.9, 0.3, 0.1];				
					if (lockState){
						window.WEngine.options({
							name:'joint_hinge_'+threeObj.name,
							type:'joint_hinge',
							limit:("doorRight"==threeObj.name)?[-80, -79]:[80, 81]
						});
						threeObj.userData.lock=false;
					}else{
						window.WEngine.options({
							name:'joint_hinge_'+threeObj.name,
							type:'joint_hinge',
							limit:hingeLimit
						});	
						threeObj.userData.lock=true;
					}
				};
				var threeObj = window.WEngine.byName("doorRight");
				//var threeObj = o.parent;
				updateLockState(threeObj,threeObj.userData.lock);
			}
		},{
			obj_name: "doorLeft",
			obj_uuid: "",
			obj_event: function (o) {
				var updateLockState = function(threeObj,lockState){	
					var hingeLimit=[0, 0, 0.9, 0.3, 0.1];		
					//debugger;
					if (lockState){
						window.WEngine.options({
							name:'joint_hinge_'+threeObj.name,
							type:'joint_hinge',
							limit:("doorRight"==threeObj.name)?[-80, -79]:[80, 81]
						});
						threeObj.userData.lock=false;
					}else{
						window.WEngine.options({
							name:'joint_hinge_'+threeObj.name,
							type:'joint_hinge',
							limit:hingeLimit
						});	
						threeObj.userData.lock=true;
					}
				};
				var threeObj = window.WEngine.byName("doorLeft");
				//var threeObj = o.parent;
				updateLockState(threeObj,threeObj.userData.lock);
			}
		},{
			 obj_name: "cabinetdoor3_1",
			 obj_uuid: "",
			 obj_event: function (o) {
				 var opcabinetdoor = function(_obj) {
					var doorstate = "close";
					var tempobj = null;
					if (_obj.doorState != null && typeof (_obj.doorState) != 'undefined') {
						doorstate = _obj.doorState;
						tempobj = _obj.parent;
					} else {
						console.log("add parent");
						var _objparent = _obj.parent;
						tempobj = new THREE.Object3D();
						debugger;
						tempobj.position.set(_obj.position.x, _obj.position.y, _obj.position.z + _obj.geometry.parameters.depth / 2);
						_obj.position.set(0, 0, -_obj.geometry.parameters.depth / 2);
						tempobj.add(_obj);
						_objparent.add(tempobj);
					}
					_obj.doorState = (doorstate == "close" ? "open" : "close");
					new TWEEN.Tween(tempobj.rotation).to({
						y: (doorstate == "close" ? 0.5 * Math.PI : 0)
					}, 1000).start();
				};
				opcabinetdoor(o);
			 }
		 },{
			 findObject:function(_objname){//查找某一类符合名称的对象
				 if (_objname.indexOf("cabinet") >= 0 && _objname.indexOf("door") >= 0) {
					 return true;
				 } else {
					 return false;
				 }
			 },
			 obj_uuid: "",
			 obj_event: function (_obj) {
				var opcabinetdoor = function(_obj) {
					var doorstate = "close";
					var tempobj = null;
					if (_obj.doorState != null && typeof (_obj.doorState) != 'undefined') {
						doorstate = _obj.doorState;
						tempobj = _obj.parent;
					} else {
						console.log("add parent");
						var _objparent = _obj.parent;
						tempobj = new THREE.Object3D();
						tempobj.position.set(_obj.position.x, _obj.position.y, _obj.position.z + _obj.geometry.parameters.depth / 2);
						_obj.position.set(0, 0, -_obj.geometry.parameters.depth / 2);
						tempobj.add(_obj);
						_objparent.add(tempobj);
					}
					_obj.doorState = (doorstate == "close" ? "open" : "close");
					new TWEEN.Tween(tempobj.rotation).to({
						y: (doorstate == "close" ? 0.5 * Math.PI : 0)
					}, 1000).start();
				};
				 opcabinetdoor(_obj);
			 }
		 },{
			 findObject: function (_objname) {//查找某一类符合名称的对象
				 if (_objname.indexOf("equipment") >= 0 && _objname.indexOf("card") >= 0) {
					 return true;
				 } else {
					 return false;
				 }
			 },
			 obj_uuid: "",
			 obj_event: function (_obj) {
				 var cardstate = "in";
				 if (_obj.cardstate != null && typeof (_obj.cardstate) != 'undefined') {
					 cardstate = _obj.cardstate;
				 } else {
					 _obj.cardstate = "out";
				 }
				 new TWEEN.Tween(_obj.position).to({
					 x: (cardstate == "in" ? _obj.position.x - 0.5 : _obj.position.x + 0.5),
				 }, 1000).onComplete(function () { _obj.cardstate = cardstate == "in" ? "out" : "in"; }).start();
			 }
		 }
	],
	mouseDown: {
	},
	mouseUp: {
	},
	mouseMove: {
	}
	},btns: [{
                btnid: "btn_reset",
                btnTitle: "场景复位",
                btnimg: "datacenterdemo/reset.png",
                event: function () {
					alert("场景复位");
                }
            },{
                btnid: "btn_connection",
                btnTitle: "走线管理",
                btnimg: "datacenterdemo/connection.png",
                event: function () {
                }
            },{
                btnid: "btn_usage",
                btnTitle: "机柜利用率",
                btnimg: "datacenterdemo/usage.png",
                event: function () {
                }
            },{
                btnid: "btn_edit",
                btnTitle: "拖拽机柜",
                btnimg: "datacenterdemo/edit.png",
                event: function () {
                }
            },{
                btnid: "btn_alarm",
                btnTitle: "告警巡航",
                btnimg: "datacenterdemo/alarm.png",
                event: function () {
                    var mainCamera = msj3DObj.commonFunc.findObject("mainCamera");//主摄像机
                    var doorRight = msj3DObj.commonFunc.findObject("doorRight");
                    mainCamera.lookAt(doorRight.position);
                    new TWEEN.Tween(mainCamera.position).to({
                        x:-300, y:200, z:-700,
                    }, 5000).onComplete(function () {
                
                        openRightDoor(msj3DObj.commonFunc.findObject("doorRight"), function () {
                            var cabinet3_1 = msj3DObj.commonFunc.findObject("cabinet3_1");
                            mainCamera.lookAt(cabinet3_1.position);
                            new TWEEN.Tween(mainCamera.position).to({
                                x: -300, y: 150, z: -200,
                            }, 5000).onComplete(function () {
                               
                                mainCamera.lookAt(cabinet3_1.position);
                            }).start();
                        });
                    }).start();
                  
                  
                }
            }
        ]
};