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
		name:'wavecolor1',
		type: 'Shader',
		side:THREE.DoubleSide,
		uniforms:{
			// global time value for animation
			iTime: {
				value: 0
			},
			lineCount: {
				value: 3
			}
		},
		vertexShaderSrc:"vs.glsl",
		fragmentShaderSrc:"fs.glsl",
		loop:function(delta){
			var uniforms1 = AWEngine.getShaderUnforms("wavecolor1");
			uniforms1.iTime.value += delta * 5;
		},
		debugParams:[{name:"iTime",min:0,max:10,step:0.01,value:5,f:function(val){
			var uniforms1 = AWEngine.getShaderUnforms("wavecolor1");
			uniforms1.iTime.value = val;
		}},{name:"lineCount",min:1,max:10,step:1,value:3,f:function(val){
			var uniforms1 = AWEngine.getShaderUnforms("wavecolor1");
			uniforms1.lineCount.value = val;
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
		type: 'hardbox',
		size:[4,10,4],
		mass:1000,
		breakable:true,
		breakOption:[ 250, 1, 2, 5 ],// breakOption: [ maxImpulse, maxRadial, maxRandom, levelOfSubdivision ]
		roadblock:true,
		material:'wavecolor1',
		rot:[0,0,0],
		positions: [[-8, 5, 0],[8, 5, 0]]
	},{
		type: 'planex',
		material:'wavecolor1',
		width: 15,
		height: 10,
		position: { x:0, y: 5, z: 0 },
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