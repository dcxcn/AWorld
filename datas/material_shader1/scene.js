{
	ename:window.world.currentSceneName,
	models:[],
	materials:[{
		name:'custom1',
		type : 'shader',
		uniforms:{time: { value: 1.0 }},
		vertexShader:"varying vec2 vUv; "+
        "void main()"+
        "{"+
		"	vUv = uv;"+
		"	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );"+
		"	gl_Position = projectionMatrix * mvPosition;"+
        "} ",
		fragmentShader:"uniform float time; "+
        "varying vec2 vUv;"+
        "void main( void ) {"+
		"	vec2 position = - 1.0 + 2.0 * vUv;"+
		"	float red = abs( sin( position.x * position.y + time / 5.0 ) );"+
		"	float green = abs( sin( position.x * position.y + time / 4.0 ) );"+
		"	float blue = abs( sin( position.x * position.y + time / 3.0 ) );"+
		"	gl_FragColor = vec4( red, green, blue, 1.0 ); "+
		"} ",
		loop:function(delta){
			var uniforms1 = WEngine.getShaderUnforms("custom1");
			uniforms1.time.value += delta * 5;
		}
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