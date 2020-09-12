{
	ename:window.world.currentSceneName,
	models:[],
	materials:[{
		name:'rs_grass',
		type : 'RawShader',
		uniforms:{
			map: {
				value: WTextures.make({url:"plant/grass1.png",name:"grass1"})
			},
			alphaMap: {
				value:  WTextures.make({url:"plant/grass2.png",name:"grass2"})
			},
			time: {
				type: 'float',
				value: 0
			},
			blade_h:{
				type: 'float',
				value: 1
			}
		},
		vertexShaderSrc:"vs.glsl",
		fragmentShaderSrc:"fs.glsl",
		loop:function(delta){
			var uniforms1 = WEngine.getShaderUnforms("rs_grass");
			uniforms1.time.value += 1 / 100;
		},
		debugParams:[{name:"time",min:0,max:10,value:5,f:function(val){
			var uniforms1 = WEngine.getShaderUnforms("rs_grass");
			uniforms1.time.value = val;
		}},{name:"blade_h",min:0.1,max:3,value:1,f:function(val){
			var uniforms1 = WEngine.getShaderUnforms("rs_grass");
			uniforms1.blade_h.value = val;
		}}
		]
	}],
	sounds:[],
	objects: [{		
		type: 'custom',
		name: 'grassLand',
		customFunc:function(){
			function getYPosition(x, z) {
				
				return 1;
			};
			function multiplyQuaternions(q1, q2) {
				x = q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x;
				y = -q1.x * q2.z + q1.y * q2.w + q1.z * q2.x + q1.w * q2.y;
				z = q1.x * q2.y - q1.y * q2.x + q1.z * q2.w + q1.w * q2.z;
				w = -q1.x * q2.x - q1.y * q2.y - q1.z * q2.z + q1.w * q2.w;
				return new THREE.Vector4(x, y, z, w);
			}
			
			var joints = 5;
			var w_ = 0.12;
			var h_ = 1;
			var instances = 50000;
			//Patch side length
			var width = 120;
			var base_geometry = new THREE.PlaneBufferGeometry(w_, h_, 1, joints);
			base_geometry.translate(0, h_ / 2, 0);

			var instanced_geometry = new THREE.InstancedBufferGeometry();

			//----------ATTRIBUTES----------//
			instanced_geometry.index = base_geometry.index;
			instanced_geometry.attributes.position = base_geometry.attributes.position;
			instanced_geometry.attributes.uv = base_geometry.attributes.uv;

			// Each instance has its own data for position, rotation and scale
			var offsets = [];
			var orientations = [];
			var stretches = [];
			var halfRootAngleSin = [];
			var halfRootAngleCos = [];

			//Temp variables
			var quaternion_0 = new THREE.Vector4();
			var quaternion_1 = new THREE.Vector4();
			var x, y, z, w;

			//The min and max angle for the growth direction (in radians)
			var min = -0.5;
			var max = 0.5;

			//For each instance of the grass blade
			for (var i = 0; i < instances; i++) {
				//Offset of the roots
				x = Math.random() * width - width / 2;
				z = Math.random() * width - width / 2;
				y = getYPosition(x, z);
				offsets.push(x, y, z);

				//Define random growth directions
				//Rotate around Y
				var angle = Math.PI - Math.random() * (2 * Math.PI);
				halfRootAngleSin.push(Math.sin(0.5 * angle));
				halfRootAngleCos.push(Math.cos(0.5 * angle));

				var RotationAxis = new THREE.Vector3(0, 1, 0);
				var x = RotationAxis.x * Math.sin(angle / 2.0);
				var y = RotationAxis.y * Math.sin(angle / 2.0);
				var z = RotationAxis.z * Math.sin(angle / 2.0);
				var w = Math.cos(angle / 2.0);
				quaternion_0.set(x, y, z, w).normalize();

				//Rotate around X
				angle = Math.random() * (max - min) + min;
				RotationAxis = new THREE.Vector3(1, 0, 0);
				x = RotationAxis.x * Math.sin(angle / 2.0);
				y = RotationAxis.y * Math.sin(angle / 2.0);
				z = RotationAxis.z * Math.sin(angle / 2.0);
				w = Math.cos(angle / 2.0);
				quaternion_1.set(x, y, z, w).normalize();

				//Combine rotations to a single quaternion
				quaternion_0 = multiplyQuaternions(quaternion_0, quaternion_1);

				//Rotate around Z
				angle = Math.random() * (max - min) + min;
				RotationAxis = new THREE.Vector3(0, 0, 1);
				x = RotationAxis.x * Math.sin(angle / 2.0);
				y = RotationAxis.y * Math.sin(angle / 2.0);
				z = RotationAxis.z * Math.sin(angle / 2.0);
				w = Math.cos(angle / 2.0);
				quaternion_1.set(x, y, z, w).normalize();

				//Combine rotations to a single quaternion
				quaternion_0 = multiplyQuaternions(quaternion_0, quaternion_1);

				orientations.push(quaternion_0.x, quaternion_0.y, quaternion_0.z, quaternion_0.w);

				//Define variety in height
				if (i < instances / 3) {
					stretches.push(Math.random() * 1.8);
				} else {
					stretches.push(Math.random());
				}
			}

			var offsetAttribute = new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3);
			var stretchAttribute = new THREE.InstancedBufferAttribute(new Float32Array(stretches), 1);
			var halfRootAngleSinAttribute = new THREE.InstancedBufferAttribute(new Float32Array(halfRootAngleSin), 1);
			var halfRootAngleCosAttribute = new THREE.InstancedBufferAttribute(new Float32Array(halfRootAngleCos), 1);
			var orientationAttribute = new THREE.InstancedBufferAttribute(new Float32Array(orientations), 4);

			instanced_geometry.setAttribute('offset', offsetAttribute);
			instanced_geometry.setAttribute('orientation', orientationAttribute);
			instanced_geometry.setAttribute('stretch', stretchAttribute);
			instanced_geometry.setAttribute('halfRootAngleSin', halfRootAngleSinAttribute);
			instanced_geometry.setAttribute('halfRootAngleCos', halfRootAngleCosAttribute);
			var mat = WEngine.view.getMaterial("rs_grass");
			var mesh = new THREE.Mesh(instanced_geometry, mat);
			WEngine.view.addVisual(mesh);		

		}
		
	},{
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
		intensity:0.8
	}]
}