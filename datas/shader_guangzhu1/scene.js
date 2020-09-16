{
	ename:window.world.currentSceneName,
	models:[],
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
		name:'guangzhu1',
		type : 'Shader',
		uniforms:{
			// controls how fast the ray attenuates when the camera comes closer
			attenuation: {
				value: 10
			},
			// controls the speed of the animation
			speed: {
				value: 2
			},
			// the color of the ray
			color: {
				value: new THREE.Color( 0xdadc9f )
			},
			// the visual representation of the ray highly depends on the used texture
			texture: {
				value: WTextures.make({url:"effect/light_1.png",name:"light_1"})
			},
			// global time value for animation
			time: {
				value: 0
			},
			// individual time offset so rays are animated differently if necessary
			timeOffset: {
				value: 0
			}
		},
		vertexShaderSrc:"vs.glsl",
		fragmentShaderSrc:"fs.glsl",
		loop:function(delta){
			//var uniforms1 = WEngine.getShaderUnforms("custom1");
			//uniforms1.time.value += delta * 5;
		},
		debugParams:[{name:"time",min:0,max:10,value:5,f:function(val){
			var uniforms1 = WEngine.getShaderUnforms("guangzhu1");
			uniforms1.time.value = val;
		}}
		]
	}],
	sounds:[],
	objects: [{		
		type: 'box',
		name: 'pathfindzone1',
		size:[30,0.4,30],		
		mass:0,
		material:'grass',
		position: [0, -0.2, 0]
	},{
		type: 'planex',
		material:'guangzhu1',
		width: 1,
		height: 1.6,
		position: { x:-2.5, y: 1.5, z: 4.39 },
		rotation: { x: 0, y: Math.PI, z: 0 },
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