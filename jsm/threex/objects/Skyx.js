/**
 * @author zz85 / https://github.com/zz85
 *
 * Based on "A Practical Analytic Model for Daylight"
 * aka The Preetham Model, the de facto standard analytic skydome model
 * http://www.cs.utah.edu/~shirley/papers/sunsky/sunsky.pdf
 *
 * First implemented by Simon Wallner
 * http://www.simonwallner.at/projects/atmospheric-scattering
 *
 * Improved by Martin Upitis
 * http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR
 *
 * Three.js integration by zz85 http://twitter.com/blurspline
*/


import {
	BoxBufferGeometry,
	UniformsUtils,
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
function Skyx (o) {

	var shader = Skyx.SkyShader;

	var material = new ShaderMaterial( {
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: UniformsUtils.clone( shader.uniforms ),
		side: BackSide
	} );

	Mesh.call( this, new BoxBufferGeometry( 1, 1, 1 ), material );
	this.setting = {
		t:0,
		fog:0,
		cloud_size: .45,
		cloud_covr: .3,
		cloud_dens: 40,
		azimuth: 90,
		hour:12
	};

	this.textureLoader = new TextureLoader();
	this.scene = o.scene;
	this.renderer = o.renderer;
	this.camera = o.camera;
	this.size = o.size;
	this.torad = 0.0174532925199432957;
	
		// Add Sun Helper
				this.sunSphere = new THREE.Mesh(
					new THREE.SphereBufferGeometry( 20000, 16, 8 ),
					new THREE.MeshBasicMaterial( { color: 0xffffff } )
				);
				this.sunSphere.position.y = - 700000;
				this.sunSphere.visible = true;
				this.scene.add( this.sunSphere );
				this.distance = 400000;
				
	this.addLight();
	this.update();
	
	

				

	
};

Skyx.prototype = Object.assign(Object.create( Mesh.prototype) ,{
		constructor: Skyx,
		setHour: function ( h,_callBack ) {

			this.setting.hour = h;
			console.log('hour==='+this.setting.hour);
			this.update();
			_callBack();

		},	
		setData: function ( d,_callBack ) {

			this.setting = d;
			this.update();
			_callBack();

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
	update: function () {

		var uniforms = this.material.uniforms;

		uniforms[ 'turbidity' ].value = 10;
		uniforms[ 'rayleigh' ].value = 2;
		uniforms[ 'luminance' ].value = 1;
		uniforms[ 'mieCoefficient' ].value = 0.005;
		uniforms[ 'mieDirectionalG' ].value = 0.8;

		var setting = this.setting;
		//0-24
		//-90  - 270
		setting.inclination = (setting.hour*15)-90;
		console.log('setting.inclination=='+setting.inclination);
		var parameters = {
			distance: 400000,
			inclination: setting.inclination,
			azimuth: 0.205
		};

		/*var theta = Math.PI * ( parameters.inclination - 0.5 );
		var phi = 2 * Math.PI * ( parameters.azimuth - 0.5 );

		this.sun.position.x = parameters.distance * Math.cos( phi );
		this.sun.position.y = parameters.distance * Math.sin( phi ) * Math.sin( theta );
		this.sun.position.z = parameters.distance * Math.sin( phi ) * Math.cos( theta );
			
		return;	*/		
		//this.sunSph.radius = 400;
        this.sunSph.phi = (setting.inclination-90) * this.torad;
        this.sunSph.theta = (setting.azimuth-90) * this.torad;
        this.sun.position.setFromSpherical( this.sunSph );

		//this.moonSph.radius = 400;
        this.moonSph.phi = (setting.inclination+90) * this.torad;
        this.moonSph.theta = (setting.azimuth-90) * this.torad;
        this.moon.position.setFromSpherical( this.moonSph )

        this.sunPosition = this.sun.position.clone().normalize();
        this.moonPosition = this.moon.position.clone().normalize();
		
		
		
		
		var inclination = (setting.inclination-270)/360.00  +(setting.inclination+90)/270.00;
		console.log('inclination=='+inclination);
		var effectController = {
			turbidity: 10,
			rayleigh: 2,
			mieCoefficient: 0.005,
			mieDirectionalG: 0.8,
			luminance: 1,			
			azimuth: 0.25, // Facing front,
			sun: true
		};
		var theta = Math.PI * ( inclination - 0.5 );
		var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

		//var phi = this.sunSph.theta;
		//var theta = this.sunSph.phi;
		this.sunSphere.position.x = this.distance * Math.cos( phi );
		this.sunSphere.position.y = this.distance * Math.sin( phi ) * Math.sin( theta );
		this.sunSphere.position.z = this.distance * Math.sin( phi ) * Math.cos( theta );

		this.sunSphere.visible = true;

		uniforms[ "sunPosition" ].value.copy( this.sunSphere.position );
					
					
		//uniforms[ 'sunPosition' ].value.copy( this.sun.position );
        // sun color formule
        var n = this.k(new Vector3(0, .99, 0), this.sunPosition), a = this.z(n, new Vector3(1.8, 1.8, 1.8), .028, this.sunPosition);
        a.r = a.r > 1.0 ? 1.0:a.r;
        a.g = a.g > 1.0 ? 1.0:a.g;
        a.b = a.b > 1.0 ? 1.0:a.b;

        this.day = a.r;

        this.sun.color.setRGB(a.r, a.g, a.b);
        //this.sunMaterial.color.copy( this.sun.color )

        //this.sun.intensity = a.r;//强度
		this.sun.intensity = 1;
        var ma = 1 - a.r;
        var mg = 1 - a.g;
        var mb = 1 - a.b;
        this.moon.intensity = ma*0.35;
        this.moon.color.setRGB(ma, mg, mb);

		this.needsUpdate = true;

		if( !this.visible ) this.visible = true;
		console.log('sun position---'+this.sun.position.x+'    '+this.sun.position.y+'  '+this.sun.position.z);
		console.log('moon position---'+this.moon.position.x+'    '+this.moon.position.y+'  '+this.moon.position.z);
		//this.renderer.render(this.scene, this.camera);
		//this.material.needsUpdate = true;

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
    }
});

Skyx.SkyShader = {

	uniforms: {
		"luminance": { value: 1 },
		"turbidity": { value: 2 },
		"rayleigh": { value: 1 },
		"mieCoefficient": { value: 0.005 },
		"mieDirectionalG": { value: 0.8 },
		"sunPosition": { value: new Vector3() },
		"up": { value: new Vector3( 0, 1, 0 ) }
	},

	vertexShader: [
		'uniform vec3 sunPosition;',
		'uniform float rayleigh;',
		'uniform float turbidity;',
		'uniform float mieCoefficient;',
		'uniform vec3 up;',

		'varying vec3 vWorldPosition;',
		'varying vec3 vSunDirection;',
		'varying float vSunfade;',
		'varying vec3 vBetaR;',
		'varying vec3 vBetaM;',
		'varying float vSunE;',

		// constants for atmospheric scattering
		'const float e = 2.71828182845904523536028747135266249775724709369995957;',
		'const float pi = 3.141592653589793238462643383279502884197169;',

		// wavelength of used primaries, according to preetham
		'const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );',
		// this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
		// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
		'const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );',

		// mie stuff
		// K coefficient for the primaries
		'const float v = 4.0;',
		'const vec3 K = vec3( 0.686, 0.678, 0.666 );',
		// MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
		'const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );',

		// earth shadow hack
		// cutoffAngle = pi / 1.95;
		'const float cutoffAngle = 1.6110731556870734;',
		'const float steepness = 1.5;',
		'const float EE = 1000.0;',

		'float sunIntensity( float zenithAngleCos ) {',
		'	zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );',
		'	return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );',
		'}',

		'vec3 totalMie( float T ) {',
		'	float c = ( 0.2 * T ) * 10E-18;',
		'	return 0.434 * c * MieConst;',
		'}',

		'void main() {',

		'	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
		'	vWorldPosition = worldPosition.xyz;',

		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'	gl_Position.z = gl_Position.w;', // set z to camera.far

		'	vSunDirection = normalize( sunPosition );',

		'	vSunE = sunIntensity( dot( vSunDirection, up ) );',

		'	vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );',

		'	float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );',

		// extinction (absorbtion + out scattering)
		// rayleigh coefficients
		'	vBetaR = totalRayleigh * rayleighCoefficient;',

		// mie coefficients
		'	vBetaM = totalMie( turbidity ) * mieCoefficient;',

		'}'
	].join( '\n' ),

	fragmentShader: [
		'varying vec3 vWorldPosition;',
		'varying vec3 vSunDirection;',
		'varying float vSunfade;',
		'varying vec3 vBetaR;',
		'varying vec3 vBetaM;',
		'varying float vSunE;',

		'uniform float luminance;',
		'uniform float mieDirectionalG;',
		'uniform vec3 up;',

		'const vec3 cameraPos = vec3( 0.0, 0.0, 0.0 );',

		// constants for atmospheric scattering
		'const float pi = 3.141592653589793238462643383279502884197169;',

		'const float n = 1.0003;', // refractive index of air
		'const float N = 2.545E25;', // number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)

		// optical length at zenith for molecules
		'const float rayleighZenithLength = 8.4E3;',
		'const float mieZenithLength = 1.25E3;',
		// 66 arc seconds -> degrees, and the cosine of that
		'const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;',

		// 3.0 / ( 16.0 * pi )
		'const float THREE_OVER_SIXTEENPI = 0.05968310365946075;',
		// 1.0 / ( 4.0 * pi )
		'const float ONE_OVER_FOURPI = 0.07957747154594767;',

		'float rayleighPhase( float cosTheta ) {',
		'	return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );',
		'}',

		'float hgPhase( float cosTheta, float g ) {',
		'	float g2 = pow( g, 2.0 );',
		'	float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );',
		'	return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );',
		'}',

		// Filmic ToneMapping http://filmicgames.com/archives/75
		'const float A = 0.15;',
		'const float B = 0.50;',
		'const float C = 0.10;',
		'const float D = 0.20;',
		'const float E = 0.02;',
		'const float F = 0.30;',

		'const float whiteScale = 1.0748724675633854;', // 1.0 / Uncharted2Tonemap(1000.0)

		'vec3 Uncharted2Tonemap( vec3 x ) {',
		'	return ( ( x * ( A * x + C * B ) + D * E ) / ( x * ( A * x + B ) + D * F ) ) - E / F;',
		'}',


		'void main() {',
		// optical length
		// cutoff angle at 90 to avoid singularity in next formula.
		'	float zenithAngle = acos( max( 0.0, dot( up, normalize( vWorldPosition - cameraPos ) ) ) );',
		'	float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );',
		'	float sR = rayleighZenithLength * inverse;',
		'	float sM = mieZenithLength * inverse;',

		// combined extinction factor
		'	vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );',

		// in scattering
		'	float cosTheta = dot( normalize( vWorldPosition - cameraPos ), vSunDirection );',

		'	float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );',
		'	vec3 betaRTheta = vBetaR * rPhase;',

		'	float mPhase = hgPhase( cosTheta, mieDirectionalG );',
		'	vec3 betaMTheta = vBetaM * mPhase;',

		'	vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );',
		'	Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );',

		// nightsky
		'	vec3 direction = normalize( vWorldPosition - cameraPos );',
		'	float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]',
		'	float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]',
		'	vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );',
		'	vec3 L0 = vec3( 0.1 ) * Fex;',

		// composition + solar disc
		'	float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );',
		'	L0 += ( vSunE * 19000.0 * Fex ) * sundisk;',

		'	vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );',

		'	vec3 curr = Uncharted2Tonemap( ( log2( 2.0 / pow( luminance, 4.0 ) ) ) * texColor );',
		'	vec3 color = curr * whiteScale;',

		'	vec3 retColor = pow( color, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );',

		'	gl_FragColor = vec4( retColor, 1.0 );',

		'}'
	].join( '\n' )

};

export { Skyx };
