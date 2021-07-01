{
	ename:window.world.currentSceneName,
	models:[],
	materials:[{
		name:'custom1',
		type : 'Shader',
		uniforms:{time: { value: 1.0 }},
		vertexShaderSrc:"vs.glsl",
		fragmentShaderSrc:"fs.glsl",
		loop:function(delta){
			//var uniforms1 = AWEngine.getShaderUnforms("custom1");
			//uniforms1.time.value += delta * 5;
		},
		debugParams:[{name:"time",min:0,max:10,step:0.01,value:5,f:function(val){
			var uniforms1 = AWEngine.getShaderUnforms("custom1");
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
		material:'custom1',
		position: [0, -0.2, 0]
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