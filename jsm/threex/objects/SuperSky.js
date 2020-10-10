import {
	Scene,
	TextureLoader,
	SphereBufferGeometry,
	ShaderMaterial,
	Mesh,
	RepeatWrapping,
	SpriteMaterial,
	AdditiveBlending,
	Sprite,
	DirectionalLight,
	HemisphereLight,
	Spherical,
	Vector3,
	Color,
	BackSide,
	IcosahedronGeometry,
	CubeCamera,
	LinearMipMapLinearFilter,
	RGBAFormat
} from "../../libs/three.module.js";
import {
	Lensflare,
	LensflareElement
} from "../../three/objects/Lensflare.js";
function SuperSky ( o ) {

	this.skyResolution = 512;

	this.size = o.size || 10000;
	this.callback = o.callback || function(){};

	this.setting = {

		t:0,
		fog:0,
		cloud_size: .45,
		cloud_covr: .3,
		cloud_dens: 40,

		inclination: 45,
		azimuth: 90,
		hour:12,

	}

	this.scene = o.scene;
	this.renderer = o.renderer;

	this.sceneSky = new Scene();

	this.urls = ['./glsl/base_vs.glsl', './glsl/dome_fs.glsl', './glsl/sky_fs.glsl'];
	//this.urls = [];
	this.shaders = {};
	this.textureLoader = new TextureLoader();

	this.geometry = new SphereBufferGeometry( this.size, 30, 15 );
	this.material = new ShaderMaterial();

	Mesh.call( this, this.geometry, this.material );

	this.visible = false;
	this.castShadow = false;
    this.receiveShadow = false;
    this.needsUpdate = false;
    this.torad = 0.0174532925199432957; 

    this.addLight();
    this.load();

}

SuperSky.prototype = Object.assign( Object.create( Mesh.prototype ), {

    constructor: SuperSky,

    load: function  () {
		if( this.urls.length === 0 ){ 

		    // load noise map
			this.noiseMap = this.textureLoader.load( "./assets/textures/sky/noise.png", function ( texture ) { texture.wrapS = texture.wrapT = RepeatWrapping; texture.flipY = false; this.init(); }.bind(this) )

		} else{ 
			this.loadShader( this.urls.shift() );
		}
	},

    loadShader : function  ( link ) {

		var name = link.substring( link.lastIndexOf('/')+1, link.lastIndexOf('.') );
		var xhr = new XMLHttpRequest();
        xhr.open('GET', link, true );

        xhr.onreadystatechange = function () {

	    if ( xhr.readyState === 2 ) { 
	        } else if ( xhr.readyState === 3 ) { //  progress
	        } else if ( xhr.readyState === 4 ) {
	            if ( xhr.status === 200 || xhr.status === 0 ){ 
	            	this.shaders[name] = xhr.response;
	            	this.load();
	            }
	            else console.error( "Couldn't load ["+ name + "] [" + xhr.status + "]" );
	        }
	    }.bind(this);

        xhr.send( null );

	},

	addLight: function () {

		this.sunMaterial = new SpriteMaterial( { map: this.textureLoader.load("./assets/textures/sky/lensflare1.png"), blending:AdditiveBlending, opacity:0.5 } );
		var sunSprite = new Sprite( this.sunMaterial );
		sunSprite.scale.set( 40, 40, 1 );
				
		this.sun = new DirectionalLight( 0xffffff, 0.8);
		this.sun.add( sunSprite );

    	var d = 20;
		this.sun.shadow.camera.left = - d;
		this.sun.shadow.camera.right = d;
		this.sun.shadow.camera.top = d;
		this.sun.shadow.camera.bottom = - d;
		this.sun.shadow.camera.near = 900;
		this.sun.shadow.camera.far = 1200;


        this.sun.shadow.mapSize.width = 512;
        this.sun.shadow.mapSize.height = 512;
        this.sun.shadow.bias = 0.001;
        this.sun.castShadow = true;

        this.moonMaterial = new SpriteMaterial( { map: this.textureLoader.load("./assets/textures/sky/lensflare2.png"), opacity:0.3 } );
		var moonSprite = new Sprite( this.moonMaterial );
		moonSprite.scale.set( 70, 70, 1 );

    	this.moon = new DirectionalLight( 0xffffff, 0.8 );//new PointLight( 0x909090, 0.5, 10000, 2 );
    	this.moon.add( moonSprite )

    	var d = new HemisphereLight(0, 0x3b4c5a, 0.1);

    	this.scene.add( this.sun );
    	this.scene.add( this.moon );
    	this.scene.add( d );

    	this.sunSph = new Spherical(this.size-this.size*0.1);
		this.moonSph = new Spherical(this.size-this.size*0.1);

		this.sunPosition = new Vector3();
		this.moonPosition = new Vector3();

		var textureFlare3 = this.textureLoader.load("./assets/textures/sky/lensflare3.png")
		this.lensflare = new Lensflare();
		this.lensflare.addElement( new LensflareElement( this.textureLoader.load("./assets/textures/sky/lensflare0.png"), this.size*0.1, 0, this.sun.color ) );
		this.lensflare.addElement( new LensflareElement( textureFlare3, 60, 0.6, this.sun.color ) );
		this.lensflare.addElement( new LensflareElement( textureFlare3, 70, 0.7, this.sun.color ) );
		this.lensflare.addElement( new LensflareElement( textureFlare3, 120, 0.9, this.sun.color ) );
		this.lensflare.addElement( new LensflareElement( textureFlare3, 70, 1, this.sun.color ) );
		this.sun.add(this.lensflare);

	},

	init: function (){

		this.materialSky = new ShaderMaterial( {

			uniforms: {
				lightdir: { value: this.sunPosition },
				noiseMap: { value: this.noiseMap },
                cloud_size: { value: this.setting.cloud_size },
                cloud_covr: { value: this.setting.cloud_covr },
                cloud_dens: { value: this.setting.cloud_dens },
                cloudColor: { value: new Color(0xFFFFFF) },
                groundColor: { value: new Color(0x3b4c5a) },
                fogColor: { value: new Color(0xff0000) },
                fog: { value: this.setting.fog },
                t: { value: this.setting.t }
			},
			vertexShader: this.shaders['base_vs'],
			fragmentShader: this.shaders['sky_fs'],
			depthWrite: false,
			depthTest: false,
			side:BackSide,
			
		});
		
		var t = new IcosahedronGeometry( 1, 1 );
		var cmesh = new Mesh( t, this.materialSky );
		this.sceneSky.add( cmesh );

		this.cubeCamera = new CubeCamera( 0.5, 2, this.skyResolution );
		this.sceneSky.add( this.cubeCamera );
		this.envMap = this.cubeCamera.renderTarget.texture;
		this.envMap.minFilter = LinearMipMapLinearFilter;
		this.envMap.format = RGBAFormat;

		//this.render();

		this.material = new ShaderMaterial( {

			uniforms: {
				lightdir: { value: this.sunPosition },
				lunardir: { value: new Vector3(0, -.2, 1) },
				tCube: { value: this.envMap },
                tDome: { value: this.textureLoader.load( "./assets/textures/sky/milkyway.png" ) },
			},
			vertexShader: this.shaders['base_vs'],
			fragmentShader: this.shaders['dome_fs'],
			side:BackSide,
			
		});

		this.material.needsUpdate = true;


		

		this.update();

		this.callback();

	},

	k: function (e, t) {
        var n = t.dot(t),
            a = 2 * t.dot(e),
            o = e.dot(e) - 1,
            r = a * a - 4 * n * o,
            i = Math.sqrt(r),
            l = (-a - i) / 2,
            s = o / l;
        return s
    },

    z: function (e, t, n, a) {
        var o = new Vector3(.188, .458, .682),
            r = a.y >= 0 ? 1 : 0;
        return this.r = (t.x - t.x * Math.pow(o.x, n / e)) * r, this.g = (t.y - t.y * Math.pow(o.y, n / e)) * r, this.b = (t.z - t.z * Math.pow(o.z, n / e)) * r, this
    },

    setData: function ( d ) {

        this.setting = d;
        this.update();

    },

	update: function () {

		var setting = this.setting;

		setting.inclination = (setting.hour*15)-90;

        this.sunSph.phi = (setting.inclination-90) * this.torad;
        this.sunSph.theta = (setting.azimuth-90) * this.torad;
        this.sun.position.setFromSpherical( this.sunSph );

        this.moonSph.phi = (setting.inclination+90) * this.torad;
        this.moonSph.theta = (setting.azimuth-90) * this.torad;
        this.moon.position.setFromSpherical( this.moonSph )

        this.sunPosition = this.sun.position.clone().normalize();
        this.moonPosition = this.sun.position.clone().normalize();

        // sun color formule
        var n = this.k(new Vector3(0, .99, 0), this.sunPosition), a = this.z(n, new Vector3(1.8, 1.8, 1.8), .028, this.sunPosition);
        a.r = a.r > 1.0 ? 1.0:a.r;
        a.g = a.g > 1.0 ? 1.0:a.g;
        a.b = a.b > 1.0 ? 1.0:a.b;

        this.day = a.r;

        this.sun.color.setRGB(a.r, a.g, a.b);
        this.sunMaterial.color.copy( this.sun.color )

        //this.sun.intensity = a.r;//强度
		this.sun.intensity = 1;
        var ma = 1 - a.r;
        var mg = 1 - a.g;
        var mb = 1 - a.b;
        this.moon.intensity = ma*0.35;
        this.moon.color.setRGB(ma, mg, mb);
        this.moonMaterial.color.copy( this.moon.color );

		this.materialSky.uniforms.t.value = setting.t;
		this.materialSky.uniforms.fog.value = setting.fog;
		this.materialSky.uniforms.cloud_size.value = setting.cloud_size;
		this.materialSky.uniforms.cloud_covr.value = setting.cloud_covr;
		this.materialSky.uniforms.cloud_dens.value = setting.cloud_dens;
		this.materialSky.uniforms.lightdir.value = this.sunPosition;
		this.material.uniforms.lightdir.value = this.sunPosition;

		this.needsUpdate = true;

		if( !this.visible ) this.visible = true;
		console.log('sun position---'+this.sun.position.x+'    '+this.sun.position.y+'  '+this.sun.position.z);
		console.log('moon position---'+this.moon.position.x+'    '+this.moon.position.y+'  '+this.moon.position.z);
		//this.render()

	},

	render: function () {

		this.cubeCamera.update( this.renderer, this.sceneSky );
		this.needsUpdate = false;

	},





});

export { SuperSky };