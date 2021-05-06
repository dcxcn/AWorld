/*
 * THREE.js 模块
 *
 * 主要的 THREE.js 设置 包括 相机, 渲染器 
 */
import * as THREE from '../../jsm/libs/three.module.js';
import { StereoEffect }  from '../../jsm/three/effects/StereoEffect.js';
import { OutlineEffect }  from '../../jsm/three/effects/OutlineEffect.js';
import { OrbitControls } from '../../jsm/three/controls/OrbitControls.js';
import { CSS2DRenderer } from '../../jsm/three/renderers/CSS2DRenderer.js';
import { HOLO } from '../../jsm/libs/holo.module.js';
import { WTextures } from '../../jsm/world/WTextures.js';
import { WMaterials } from '../../jsm/world/WMaterials.js';
import { SkeletonUtils } from '../../jsm/three/utils/SkeletonUtils.js';
import { GLTFLoader } from '../../jsm/three/loaders/GLTFLoader.js';
import { DRACOLoader } from '../../jsm/three/loaders/DRACOLoader.js';
import { DDSLoader } from '../../jsm/three/loaders/DDSLoader.js';
import { MMDLoader } from '../../jsm/three/loaders/MMDLoader.js';
import { GeometryTools } from '../../jsm/threex/geometries/GeometryTools.js';
import { FBXLoader } from '../../jsm/three/loaders/FBXLoader.js';

var WView = function(loadingManager) {
	var isMobile = false;
	var isGl2 = false;
	var container = null;
	var canvas = null;
	var cam={};
	var geo = {};
	var mesh = {};
	var modelsCache = [];
	var vmdCache = [];
	var sunLightHelper;
	var cameraHUDSprite;
	var isShadow = false;
	var renderType = 1;
	var cameraOrtho,sceneRenderTarget,quadTarget;
	
	var delta = 0;
	var fps = 0;
	var isFog = false;
	var fog = null;
	
	var bg = 0x222322;
	var alpha = 1;
	var mouse = null;
	var offset = null;

	var ray = null;
	var dragPlane = null;
	var isRay = false;
	var isPause = false;
	var isRenderPause = true;

	var cameraFollowBehind = false;
	var clock = new THREE.Clock();
	var gltfLoader = new GLTFLoader(loadingManager);
	var dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath( './js/libs/draco/gltf/' );
	gltfLoader.setDRACOLoader( dracoLoader );
	//gltfLoader.setDDSLoader(new DDSLoader());
	var fbxLoader = new FBXLoader(loadingManager);
	var mmdLoader = new MMDLoader(loadingManager);
	var setup =function (_self) {
		// 设置主场景
		_self.scene = new THREE.Scene();
		_self.sceneRoot = new THREE.Group();
        _self.markerRoot = new THREE.Group();
        _self.markerScale = new THREE.Group();
        _self.markerRoot.add(_self.markerScale);
		_self.scene.add(_self.sceneRoot);
        _self.scene.add(_self.markerRoot);
		
		_self.camera = _self.cameraFree  = new THREE.PerspectiveCamera(_self.fov, (window.innerWidth - _self.cameraSizeConstraint.width) / (window.innerHeight - _self.cameraSizeConstraint.height), 0.1,1000);
		_self.cameraInObj = new THREE.PerspectiveCamera(_self.fov, (window.innerWidth - _self.cameraSizeConstraint.width) / (window.innerHeight - _self.cameraSizeConstraint.height), 0.1, 1000);

		_self.controls = null;
		_self.camera.position.x = -12;
 		_self.camera.position.y = 7;
 		_self.camera.position.z =  4;
		_self.arCamera = new THREE.PerspectiveCamera(_self.fov, (window.innerWidth - _self.cameraSizeConstraint.width) / (window.innerHeight - _self.cameraSizeConstraint.height), 0.1, 1000);
		_self.scene.add(_self.arCamera);
		
		_self.setAudioListenerParent(_self.camera);
		if(false){
			_self.camera.position.set(0,3,15);
			_self.cameraControls = new THREE.TrackballControls( _self.camera );
			_self.cameraControls.rotateSpeed = 1.0;
			_self.cameraControls.zoomSpeed = 1.2;
			_self.cameraControls.panSpeed = 0.8;
			_self.cameraControls.noZoom = false;
			_self.cameraControls.noPan = false;
			_self.cameraControls.staticMoving = true;
			_self.cameraControls.dynamicDampingFactor = 0.3;
			_self.cameraControls.keys = [ 65, 83, 68 ];
		}else{
			_self.cameraControls = new OrbitControls( _self.camera, canvas);
			_self.cameraControls.screenSpacePanning = true;
			//_self.cameraControls.enableDamping = true;
		}
		var cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 128, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );
		_self.cubeCamera = new THREE.CubeCamera( 0.1, 1, cubeRenderTarget );
		_self.scene.background = _self.cubeCamera.renderTarget;
		//VR
		/*_self.deviceOrientationControls = new THREE.DeviceOrientationControls(_self.camera, true);
		function setOrientationControls(e) {
		  if (!e.alpha) {
			return;
		  }
		  _self.deviceOrientationControls.connect();
		  _self.deviceOrientationControls.update();
		  window.removeEventListener('deviceorientation', setOrientationControls, true);
		}
		window.addEventListener('deviceorientation', setOrientationControls, true);
		_self.vrControls = new THREE.VRControls( _self.camera );*/
		
	};
	
	var _view = {
		pause:false,
		objects:[],
		objects_raycaster:[],
		// 相机大小约束限制窗口如用户界面
		cameraSizeConstraint: null,
		// 场景, 相机 和 渲染器
		camera: null,
		cameraFree: null,
		cameraInObj: null,
		arCamera: null,
		cameraControls:null,
		deviceOrientationControls:null,
		vrControls:null,
		scene: null,
		renderer: null,
		labelRenderer: null,
		sceneRoot:null,
		markerRoot:null,
		markerScale:null,
		outlineEffect:null,
		vrEffect:null,
		stereoEffect:null,
		effect3:null,
		effect4:null,
		sceneRenderHUDSprite: null,
		arSceneScale:1,
		arToolkitSource:null,
		arToolkitContext:null,
		sunLight: null,
		//角色光源
		playerLight: null,
		vsize:null,
		// 相机视场默认设置
		fov: 45,
		fogDepth: .0001,
        fogDepthDefault: .0001,
        fogDepthMaximum: .0016,		
		iflag_sto:null,
		audioListener:null,
		init: function(options) {
			var SCREEN_WIDTH = window.innerWidth;
			var SCREEN_HEIGHT = window.innerHeight;
			
			        // 1 CANVAS / CONTAINER

			isMobile = this.getMobile();			
			container = document.createElement( 'div' );
			document.body.insertBefore(container,document.body.firstChild);			
			canvas = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' );
			canvas.style.cssText = 'position:absolute; top:0; left:0; pointer-events:auto;'//' image-rendering: pixelated;'

			if( !isMobile ){
				//document.oncontextmenu = function(e){ e.preventDefault(); };
				canvas.ondrop = function(e) { e.preventDefault(); };
			}
			//设置相机大小
			this.cameraSizeConstraint = {
				width: options && options.cameraSizeConstraint && options.cameraSizeConstraint.width || 0,
				height: options && options.cameraSizeConstraint && options.cameraSizeConstraint.height || 0
			};
			this.vsize = new THREE.Vector3(SCREEN_WIDTH, SCREEN_HEIGHT, 0);
			this.vsize.z = this.vsize.x / this.vsize.y;

			// SCENE (RENDER TARGET)			
			this.sceneRenderHUDSprite = new THREE.Scene();
			cameraHUDSprite = new THREE.OrthographicCamera( SCREEN_WIDTH / - 2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_HEIGHT / - 2, 1, 10 );
			cameraHUDSprite.position.z = 10;

			sceneRenderTarget = new THREE.Scene();
			cameraOrtho = new THREE.OrthographicCamera( SCREEN_WIDTH / - 2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_HEIGHT / - 2, -10000, 10000 );
			cameraOrtho.position.z = 100;

			sceneRenderTarget.add( cameraOrtho );
			var plane = new THREE.PlaneBufferGeometry( SCREEN_WIDTH, SCREEN_HEIGHT );
			quadTarget = new THREE.Mesh( plane, new THREE.MeshBasicMaterial( { color: 0x000000 } ) );
			quadTarget.position.z = -500;
			sceneRenderTarget.add( quadTarget );
			

			// 定义默认的 WebGL 渲染器
			var forceGL1 = options.forceGL1==undefined? true : options.forceGL1;
			this.renderer = new THREE.WebGLRenderer( this.getContext( forceGL1 ));
			this.renderer.setPixelRatio( window.devicePixelRatio );
			this.renderer.setSize( window.innerWidth, window.innerHeight );
			
			//this.renderer.outputEncoding = THREE.sRGBEncoding;
			this.renderer.shadowMap.enabled = true;
			this.renderer.autoClear = false;
			
			this.renderer.setClearColor( bg, alpha );
			
			this.labelRenderer = new CSS2DRenderer();
			this.labelRenderer.setSize( window.innerWidth, window.innerHeight );
			this.labelRenderer.domElement.style.position = 'absolute';
			this.labelRenderer.domElement.style.top = 0;
			
			
			mouse = new THREE.Vector3();
			offset = new THREE.Vector3();			
			//container.appendChild( this.renderer.domElement );
						
			container.appendChild( this.labelRenderer.domElement );
			container.appendChild( canvas );
			container.focus();
			
			this.audioListener = new THREE.AudioListener();
			// 基本场景和灯光设置
			setup(this);			

			this.showShadow(true);
			this.outlineEffect = new OutlineEffect(this.renderer);
			this.outlineEffect.setSize( window.innerWidth, window.innerHeight );
			this.outlineEffect.enabled = false;
			this.stereoEffect = new StereoEffect(this.renderer);
			this.effect3 = new HOLO.ThreeSidedDisplay(this.renderer);
			this.effect4 = new HOLO.FourSidedDisplay(this.renderer);
			this.effect3.setSize(window.innerWidth, window.innerHeight);
			this.effect4.setSize(window.innerWidth, window.innerHeight);
			//this.vrEffect = new THREE.VREffect( this.renderer );

			this.onWindowResize();
			window.addEventListener("resize", this.onWindowResize, false);
		},	
		//--------------------------------------
		//
		//   LOAD MODEL
		//
		//--------------------------------------		
		load : function( conf, callback ){
			conf.type = conf.type || 'gltf';
			var callback_load = callback || function(){};
			switch(conf.type){
				case 'gltf':
				this.load_gltf( conf, callback_load);
				break;
				case 'fbx':
				this.load_fbx( conf, callback_load);
				break;
				case 'mmd':
				this.load_mmd( conf, callback_load);
				break;
			}
		},
	    load_gltf : function ( conf, callback_load ) {
			console.log('load modeFile---'+conf.url);
			var _self = this;
			if(modelsCache[conf.name]){				
				var modelO = SkeletonUtils.clone(modelsCache[conf.name].model);
				if(conf.isSet)_self.loadMeshes(modelO);
				callback_load(modelO,conf);
			}else{
				gltfLoader.load(conf.url, function(gltf) {
					const animsByName = {};
					gltf.animations.forEach((clip) => {
						animsByName[clip.name] = clip;
					});
					modelsCache[conf.name] = {animations:animsByName,type:'gltf',gltf:gltf,model:gltf.scene};	
					var modelO = SkeletonUtils.clone(modelsCache[conf.name].model);
					_self.loadMeshes(modelO);
					callback_load(modelO,conf);
				});
			}
		},
		load_fbx : function ( conf, callback_load ) {
			console.log('load modeFile---'+conf.url);
			var _self = this;
			if(modelsCache[conf.name]){				
				var modelO = SkeletonUtils.clone(modelsCache[conf.name].model);
				if(conf.isSet)_self.loadMeshes(modelO);
				callback_load(modelO,conf);
			}else{
				fbxLoader.load(conf.url, function(fbx) {
					const animsByName = {};
					fbx.animations.forEach((clip) => {
						animsByName[clip.name] = clip;
					});
					modelsCache[conf.name] = {animations:animsByName,type:'fbx',model:fbx};	
					var modelO = SkeletonUtils.clone(modelsCache[conf.name].model);
					_self.loadMeshes(modelO);					
					callback_load(modelO,conf);
				});
			}
		},
		load_mmd : function ( conf, callback_load ) {
			console.log('load modeFile---'+conf.url);
			var _self = this;
			if(modelsCache[conf.name]){				
				var modelO = SkeletonUtils.clone(modelsCache[conf.name].model);
				if(conf.isSet)_self.loadMeshes(modelO);				
				callback_load(modelO,conf);
			}else{
				mmdLoader.load(conf.url, function(mmd) {
					modelsCache[conf.name] = {animations:[],type:'mmd',model:mmd};	
					var modelO = SkeletonUtils.clone(modelsCache[conf.name].model);
					if(conf.isSet)_self.loadMeshes(modelO);				
					callback_load(modelO,conf);
				});
			}
		},
		loadMeshes : function(modelO){
			var _self = this;
			modelO.traverse( function ( child ) {

				if ( child.isMesh ) {
					mesh[child.name]=child;
					var mtx0 = new THREE.Matrix4().makeTranslation( child.position[0],child.position[1],child.position[2] );
					mtx0.makeRotationFromQuaternion( child.quaternion );
					var g = child.geometry.clone();
					g.applyMatrix4(mtx0);
					geo[child.name] = g;
				}else if ( child.isGroup ){
					mesh[child.name]=child;
				}
			} );

		},
		loadVMD : function(conf,callback_load){
			console.log('load VMDFile---'+conf.url);
			var _self = this;
			if(vmdCache[conf.name]){				
				var animationO = vmdCache[conf.name];				
				callback_load(animationO,conf);
			}else{
				mmdLoader.loadVMD(conf.url, function(vmd) {
					vmdCache[conf.name] = vmd;
					callback_load(vmd,conf);
				});
			}
		},
		getModel: function( name ){
			var model = SkeletonUtils.clone(modelsCache[name].model);
			model.modelType = modelsCache[name].type;
			return model;
		},
		getAnimations : function( name ){
			return modelsCache[name].animations;
		},
		getMMDAnimation : function( conf, object){	
			if(object.isCamera){
				var camVmd = vmdCache[conf.refVMD];
				var cameras = camVmd.cameras;
				for ( var i = 0, il = cameras.length; i < il; i ++ ) {

					var motion = cameras[ i ];						
					var pos = motion.position;
					motion.position = [pos[0]*conf.positionScale,pos[1]*conf.positionScale,pos[2]*conf.positionScale];
					//var rot = motion.rotation;
					var distance = motion.distance;
					motion.distance = distance*conf.distanceScale;
				}
				return mmdLoader.animationBuilder.buildCameraAnimation( camVmd );
			}else{
				return mmdLoader.animationBuilder.build( vmdCache[conf.refVMD], object )
			}
		},
		getMesh : function( name ){
			if(mesh[name]){
				return mesh[name].clone();
			}else{
				return null;
			}
			
		},
		getGeometry : function( name ){
			return geo[name];
		},
		destroy: function() {
			while( this.objects.length > 0 ){ 
				var p = this.objects.pop();
				if(p.userData.hasOwnProperty('audio')){
					p.userData.audio.stop();
					p.remove(p.userData.audio);
				}				
				this.removeVisual( p); 
			} 
			this.objects=[];		
		},
		setAudioListenerParent:function(pObj){
			pObj.add(this.audioListener);
		},
		addVisual:function(o){
			this.objects.push(o);
			this.addSubObjects(o);
			if(renderType==6){
				this.markerScale.add(o);
			}else{
				this.sceneRoot.add(o);
			}
		},
		addSubObjects:function(o){
			if(o.children.length>0){
				for(var i=0;i<o.children.length;i++){
					if(o.children[i].isGroup){
						this.addSubObjects(o.children[i]);
					}else{
						this.objects_raycaster.push(o.children[i]);
					}
				}
			}else{
				this.objects_raycaster.push(o);
			}
		},
		removeVisual:function(o){
			if(renderType==6){
				this.markerScale.remove(o);
			}else{
				if(o.parent){
					o.parent.remove(o);
				}
				//this.sceneRoot.remove(o);
			}
		},
		getVisualObjects:function(){
			
			return  root.viewObjects;
			
		},
		initDefGeosAndMats : function(){
			geo['box'] =  new THREE.BoxBufferGeometry(1,1,1);
			geo['sphere'] = new THREE.SphereBufferGeometry( 1, 12, 10 );
			geo['cylinder'] =  new THREE.BufferGeometry().fromGeometry( new THREE.CylinderGeometry( 1,1,1,12,1 ) );
			geo['cone'] =  new THREE.BufferGeometry().fromGeometry( new THREE.CylinderGeometry( 0,1,0.5 ) );
			geo['wheel'] =  new THREE.BufferGeometry().fromGeometry( new THREE.CylinderGeometry( 1,1,1, 18 ) );
			geo['wheel'].rotateZ( -Math.PI90 );


		},
		getContent:  function () { 
			return this.sceneRoot; 
		},
		getGeo: function () { 
			return geo; 
		},
		getMat: function () {
			return WMaterials.getMat(); 
		},
		getControler: function () { return this.cameraControls; },
		reset:function(){
			this.removeFog();		
			delta=0;
			fps=0;
			geo = {};
			mesh = {};
			this.pause = false;
			this.objects=[];
			this.objects_raycaster=[];
			setup(this);
		},
		updateSunLightSize: function(camDistance){
			/*this.sunLight.position.y = camDistance*2;
			var lightSize = camDistance*2;
			if(lightSize<=15) return;
			this.sunLight.shadow.camera.far = lightSize*2;
			this.sunLight.shadow.camera.left = -lightSize;
			this.sunLight.shadow.camera.right = lightSize;
			this.sunLight.shadow.camera.top = lightSize;
			this.sunLight.shadow.camera.bottom = -lightSize;			
			this.sunLight.position.set( 0, lightSize-1, 0 );
			if(this.iflag_sto != null){
				clearTimeout(this.iflag_sto);
				this.iflag_sto = null;
			}			
			this.iflag_sto = setTimeout(function(){
				_view.sunLight.shadow.camera.updateProjectionMatrix();
				sunLightHelper.update();
			},1000);	*/		
		},
		showShadow: function(v){
			if(v==false){
				this.renderer.shadowMap.enabled = isShadow = false;				
			}else{ 
				this.renderer.shadowMap.enabled = isShadow = true;				
			}			
			//this.sunLight.castShadow = isShadow;
			//window.WEngine.updateMaterials();
		},
		setCameraFollowBehind:function(b){
			cameraFollowBehind = b;
		},
		getMobile: function () {
			var n = navigator.userAgent;
			if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i) || n.match(/Windows Phone/i)) return true;
			else return false;
		},
		setBg: function ( c, Alpha ) { bg = c; alpha = Alpha !== undefined ? Alpha : alpha; },
		getContext: function ( force ) {

			var gl;

			var o = { 
				antialias: isMobile ? false : true, 
				alpha: alpha === 1 ? false: true, 
				stencil:false, depth:true, precision: "highp", 
				premultipliedAlpha:true, 
				preserveDrawingBuffer:false,
				//xrCompatible: true,
			}

			if( !force ){
				gl = canvas.getContext( 'webgl2', o );
				if ( !gl ) gl = canvas.getContext( 'experimental-webgl2', o );
				isGl2 = !!gl;
			}

			if( !isGl2 ) {
				//delete( option.xrCompatible );
				gl = canvas.getContext( 'webgl', o );
				if (!gl) gl = canvas.getContext( 'experimental-webgl', o );
			}

			o.canvas = canvas;
			o.context = gl;
			return o;

		},
		
		//-----------------------------
		//
		// FOG
		//
		//-----------------------------

		getWithFog: function (){
			
			return isFog;

		},

		addFog: function ( o ) {
			
			if( isFog ) return;

			o = o || {};

			fog = o.density !== undefined ? new THREE.FogExp2( o.color || 0x3b4c5a, o.density ) : new THREE.Fog( o.color || 0x3b4c5a, o.near || 1, o.far || 300 );
			this.scene.fog = fog;
			isFog = true;

		},

		setFogColor: function ( color ) {
			
			if( !isFog ) return;
			fog.color = color;

		},

		removeFog: function () {
			
			if( !isFog ) return;
			fog = null;
			this.scene.fog = null;
			isFog = false;

		},
		//-----------------------------
		//
		// RAYCAST
		//
		//-----------------------------

		activeRay: function ( callback, debug, size ) {

			if( isRay ) return;			
			ray = new THREE.Raycaster();

			dragPlane = new THREE.Mesh( 
				debug ?  new THREE.PlaneBufferGeometry( 1, 1, 4, 4 ) : new THREE.PlaneBufferGeometry( 1, 1, 1, 1 ),  
				new THREE.MeshBasicMaterial({ color:0x00ff00, transparent:true, opacity:debug ? 0.3 : 0, depthTest:false, depthWrite:false, wireframe: debug ? true : false })
			);

			dragPlane.castShadow = false;
			dragPlane.receiveShadow = false;
			this.setDragPlane( null, size );
			this.addVisual( dragPlane );

			this.fray = function(e){ this.rayTest(e); }.bind( this );
			this.mDown = function(e){ this.rayTest(e); mouse.z = 1; }.bind( this );
			this.mUp = function(e){ mouse.z = 0; }.bind( this );

			canvas.addEventListener( 'mousemove', this.fray, false );
			canvas.addEventListener( 'mousedown', this.mDown, false );
			document.addEventListener( 'mouseup', this.mUp, false );

			this.rayCallBack = callback;
			isRay = true;

		},

		removeRay: function () {

			if( !isRay ) return;

			canvas.removeEventListener( 'mousemove', this.fray, false );
			canvas.removeEventListener( 'mousedown', this.mDown, false );
			document.removeEventListener( 'mouseup', this.mUp, false );

			this.rayCallBack = function(){};

			this.removeVisual( dragPlane );

			isRay = false;
			offset.set( 0,0,0 );

		},

		rayTest: function ( e ) {

			mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
			
			//console.log('mouse='+mouse.x+' '+mouse.y+' '+mouse.z);
			ray.setFromCamera( mouse, this.camera );
			//var intersects = this.ray.intersectObjects( this.content.children, true );
			var intersects = ray.intersectObject( dragPlane );
			if ( intersects.length ){
				offset.copy( intersects[0].point );
				this.rayCallBack( offset );
			}

		},

		setDragPlane: function ( pos, size ) {

			size = size || 200;
			dragPlane.scale.set( 1, 1, 1 ).multiplyScalar( size );
			if( pos ){
				dragPlane.position.fromArray( pos );
				dragPlane.rotation.set( 0, this.cameraControls.getAzimuthalAngle(), 0 );
				//this.dragPlane.lookAt( this.camera.position );
			} else {
				dragPlane.position.set( 0, 0, 0 );
				dragPlane.rotation.set( -Math.PI90, 0, 0 );
			}

		},
		getMouse: function () { return mouse; },
		getControls: function () { return this.cameraControls; },
		//--------------------------------------
		//
		//   SRC UTILS ViewUtils
		//
		//--------------------------------------
		addUV2: function ( m ) {
			GeometryTools.addUV2( m.geometry );
		},

		mergeGeometry: function(m){
			return GeometryTools.mergeGeometryArray( m );
		},

		mergeMesh: function(m){
			return GeometryTools.mergeGeometryArray( m );
		},

		prepaGeometry: function ( g, type ) {
			return GeometryTools.prepaGeometry( g, type );
		},

		getGeomtryInfo: function ( o ) {
			return GeometryTools.getGeomtryInfo( o );
		},
	
		//-----------------------------
		//
		//  TEXTURES
		//  need textures.js
		//
		//-----------------------------

		texture: function ( o ) {

			return WTextures.make( o );

		},

		getTexture: function ( name ){

			return WTextures.get( name );

		},


		//-----------------------------
		//
		//  MATERIALS
		//  need materials.js
		//
		//-----------------------------

		material: function ( o ){

			return WMaterials.make( o );

		},

		getMaterial: function ( name ){

			return WMaterials.get( name );

		},

		getShaderUnforms: function( name ){
			return WMaterials.getShaderUnforms(name);
		},

		updateEnvmap:function(){
			WMaterials.updateEnvmap(this.envMap);
		},
		
		setEnvMapRenderTarget:function(renderTarget){
			this.envMapRenderTarget = renderTarget;
			this.cubeCamera.update( this.renderer, this.envMapRenderTarget );
			this.envMap = this.cubeCamera.renderTarget.texture;
			this.envMap.minFilter = THREE.LinearMipMapLinearFilter;
			this.envMap.format = THREE.RGBAFormat;
			this.updateEnvmap();
		},
		getEnvmap: function () { 
			if(this.envMapRenderTarget){
				this.cubeCamera.update( this.renderer, this.envMapRenderTarget );
				this.envMap = this.cubeCamera.renderTarget.texture;
				this.envMap.minFilter = THREE.LinearMipMapLinearFilter;
				this.envMap.format = THREE.RGBAFormat;
			}else{
				this.envMap = new THREE.Texture();
			}			
			return this.envMap; 
		},
		setClearColor: function(cc){
			this.renderer.setClearColor(cc,0);
		},
		getFps: function(){
			return fps;
		},
		unPause: function(){},
		pauseRender: function () { _view.pause = isRenderPause = true;},
		restartRender: function () { if(isRenderPause){ _view.pause = isRenderPause = false; _view.render(0); } },
		render: function(stamp) {
			if( !isRenderPause ) window.requestAnimationFrame( _view.render );			
			delta = clock.getDelta();			
			if( _view.pause ) isPause = true;
			if( isPause && !_view.pause ){ isPause = false; _view.unPause(); }
		
			_view.update( delta );
			// 更新主场景
			if(renderType==1){
				_view.renderer.clear();
				_view.controlUpdate(delta);
				_view.outlineEffect.render(_view.scene,_view.camera);
				//_view.renderer.render(_view.scene, _view.camera);
				_view.labelRenderer.render(_view.scene, _view.camera);								
				_view.renderer.clearDepth();
				_view.renderer.render( _view.sceneRenderHUDSprite, cameraHUDSprite);
				
							

			}else if(renderType==2){
				_view.deviceOrientationControls.update(delta);
				_view.stereoEffect.render(_view.scene,_view.camera);
			}else if(renderType==3){
				_view.controlUpdate(delta);
				_view.effect3.render(_view.scene, _view.camera);
			}else if(renderType==4){
				_view.controlUpdate(delta);
				_view.effect4.render(_view.scene, _view.camera);
			}else if(renderType==5){
				_view.vrControls.update();
				_view.stereoEffect.render(_view.scene,_view.camera);
			}		
		},
		update:function(){delta},
		onWindowResize: function() {
			//保持屏幕大小当窗口大小改变
			_view.cameraInObj.aspect = _view.cameraFree.aspect = (window.innerWidth - _view.cameraSizeConstraint.width) / (window.innerHeight - _view.cameraSizeConstraint.height);
			_view.cameraFree.updateProjectionMatrix();
			_view.cameraInObj.updateProjectionMatrix();

			cameraHUDSprite.left = - window.innerWidth / 2;
			cameraHUDSprite.right = window.innerWidth / 2;
			cameraHUDSprite.top = window.innerHeight / 2;
			cameraHUDSprite.bottom = - window.innerHeight / 2;
			cameraHUDSprite.updateProjectionMatrix();
			if(window.WEngine.compass)
				window.WEngine.compass.position.set((-window.innerWidth / 2)+window.WEngine.compass.material.map.image.width/2,(window.innerHeight/2)-window.WEngine.compass.material.map.image.height/2,0);
			_view.renderer.setSize((window.innerWidth - _view.cameraSizeConstraint.width), (window.innerHeight - _view.cameraSizeConstraint.height));
			_view.labelRenderer.setSize((window.innerWidth - _view.cameraSizeConstraint.width), (window.innerHeight - _view.cameraSizeConstraint.height));
			_view.outlineEffect.setSize( window.innerWidth, window.innerHeight );
			_view.stereoEffect.setSize(window.innerWidth, window.innerHeight);
			_view.effect3.setSize(window.innerWidth, window.innerHeight);
			_view.effect4.setSize(window.innerWidth, window.innerHeight);
			//_view.vrEffect.setSize(window.innerWidth, window.innerHeight);

		},
		createModel: function(geometry, materials, scale, isGeometry, isSkinnedMesh) {
			var model = {};
			materials.forEach( function ( material ) {
				material.opacity= 1;
				material.alphaTest = 0.5;
			});
			// 给创建的网格分配材质
			if(isSkinnedMesh){
				model.mesh = new THREE.SkinnedMesh(geometry, materials);
			}else{
				geometry.applyMatrix( new THREE.Matrix4().makeScale( scale, scale, scale ));
				//var bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry); 
				//model.mesh = new THREE.Mesh(bufferGeometry, materials);
				
				model.mesh = new THREE.Mesh(geometry, materials);
			}
			return model;
		},
		orbit: function( h, v, d ){
			var offset = new THREE.Vector3();        
			var phi = v;
			var theta = h;
			offset.x =  d * Math.sin(phi) * Math.sin(theta);
			offset.y =  d * Math.cos(phi);
			offset.z =  d * Math.sin(phi) * Math.cos(theta);
			//console.log("phi=="+phi+"  theta="+theta+"  x=="+offset.x+" y=="+offset.y+" z=="+offset.z);
			var p = new THREE.Vector3();
			p.copy( this.cameraControls.target ).add( offset );        
			return p;
		},
		/*moveCamera: function ( h, v, d, target ) {
			var dest = this.orbit( (h+180) * Math.torad, (v-90) * Math.torad, d );
			new TWEEN.Tween( this.camera.position ).to( { x: dest.x, y: dest.y, z: dest.z }, 400 )
						.easing( TWEEN.Easing.Quadratic.Out )
						.start();
			new TWEEN.Tween( this.cameraControls.target ).to( { x: target[0], y: target[1], z: target[2] }, 400 )
						.easing( TWEEN.Easing.Quadratic.Out )
						.onUpdate( function(){ this.cameraControls.update(); } )
						.start();        
		},*/
		setControle: function( b ){
			if( this.cameraControls.enableRotate === b ) return;        
			this.cameraControls.enableRotate = b;
			this.cameraControls.enableZoom = b;
			this.cameraControls.enablePan = b;
		},
		controlUpdate: function(delta){		
			if( window.WEngine.currentFollow === null ) return;

			//this.setControle( true );		
			cam.theta = this.cameraControls.getAzimuthalAngle() + Math.Pi;
			cam.phi = -this.cameraControls.getPolarAngle();
			cam.radius = this.cameraControls.getRadius();

			if(!cam.oTheta){
				cam.oTheta = cam.theta;
			}
			if(!cam.oRadius){
				cam.oRadius = cam.radius;
			}
			if(!cam.oPhi){
				cam.oPhi = cam.phi;
			}
			if(cameraFollowBehind){
				var matrix = new THREE.Matrix4();
				matrix.extractRotation( window.WEngine.currentFollow.matrix );
				var front = new THREE.Vector3( 0, 0, 1 );
				front.applyMatrix4( matrix );						
				cam.theta = Math.atan2( front.x, front.z );	
				this.camera.position.lerp( this.orbit( cam.theta, cam.oPhi, cam.oRadius ), 0.3 );				
			}else{
				cam.oRadius = cam.radius;
				cam.oPhi = cam.phi;	
				cam.oTheta = cam.theta;	
			}	
			this.cameraControls.target.copy( window.WEngine.currentFollow.position );
			this.cameraControls.update(delta);
		},
		enableOutlineEffect: function(b){
			this.outlineEffect.enabled = b;
		},
		enableHoloEffect: function(b,sideNum){
			if(b){
				renderType = sideNum; 
			}else{
				renderType = 1;
			}
			this.onWindowResize();
		},
		enableVREffect: function(b){
			if(b){
				renderType = 2; 
			}else{
				renderType = 1;
			}
			this.onWindowResize();
		},
		enableWebVREffect: function(b){
			if(b){
				renderType = 5; 
			}else{
				renderType = 1;
			}
			this.onWindowResize();
		},
		copy2AR:function(){
			this.markerScale.add(this.sceneRoot);
		},
		copy2Normal:function(){
			this.scene.add(this.sceneRoot);
		},
		setARSceneScale:function(s){
			this.arSceneScale = s;
			this.markerScale.scale.set(1,1,1).multiplyScalar(s);
		},
		initAR: function(){
			if( this.arToolkitSource.ready) return;			
			this.arToolkitSource.init(function onReady(){
				_view.arToolkitSource.onResize(_view.renderer.domElement);		
			});
			this.arToolkitContext.init(function onCompleted(){
				_view.arCamera.projectionMatrix.copy( _view.arToolkitContext.getProjectionMatrix() );
			});
		},
		enableAREffect: function(b){
			if(b){
				renderType = 6;
				this.initAR();
				this.copy2AR();				
			}else{
				renderType = 1;
				this.copy2Normal();
			}
			this.onWindowResize();
		},
	};

	return _view;
};
export {WView};