/*
 * THREE.js 模块
 *
 * 主要的 THREE.js 设置 包括 相机, 渲染器 
 */
import * as THREE from '../../jsm/libs/three.module.js';
import { StereoEffect } from '../../jsm/three/effects/StereoEffect.js';
import { OutlineEffect } from '../../jsm/three/effects/OutlineEffect.js';
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

class WView {

	constructor(loadingManager) {
		this.isMobile = false;
		this.isGl2 = false;
		this.container = null;
		this.canvas = null;
		this.cam = {};
		this.geo = {};
		this.mesh = {};
		this.modelsCache = [];
		this.vmdCache = [];
		this.sunLightHelper;
		this.cameraHUDSprite;
		this.isShadow = false;
		this.renderType = 1;
		this.cameraOrtho;
		this.sceneRenderTarget;
		this.quadTarget;

		this.delta = 0;
		this.fps = 0;
		this.isFog = false;
		this.fog = null;

		this.bg = 0x222322;
		this.alpha = 1;
		this.mouse = null;
		this.offset = null;

		this.ray = null;
		this.dragPlane = null;
		this.isRay = false;
		this.isPause = false;
		this.isRenderPause = true;

		this.cameraFollowBehind = false;
		this.clock = new THREE.Clock();
		this.gltfLoader = new GLTFLoader(loadingManager);
		this.dracoLoader = new DRACOLoader();
		this.dracoLoader.setDecoderPath('./js/libs/draco/gltf/');
		this.gltfLoader.setDRACOLoader(this.dracoLoader);
		//gltfLoader.setDDSLoader(new DDSLoader());
		this.fbxLoader = new FBXLoader(loadingManager);
		this.mmdLoader = new MMDLoader(loadingManager);


		this.pause = false;
		this.objects = [];
		this.objects_raycaster = [];
		// 相机大小约束限制窗口如用户界面
		this.cameraSizeConstraint = null;
		// 场景, 相机 和 渲染器
		this.camera = null;
		this.cameraFree = null;
		this.cameraInObj = null;
		this.arCamera = null;
		this.cameraControls = null;
		this.deviceOrientationControls = null;
		this.vrControls = null;
		this.scene = null;
		this.renderer = null;
		this.labelRenderer = null;
		this.sceneRoot = null;
		this.markerRoot = null;
		this.markerScale = null;
		this.outlineEffect = null;
		this.vrEffect = null;
		this.stereoEffect = null;
		this.effect3 = null;
		this.effect4 = null;
		this.sceneRenderHUDSprite = null;
		this.arSceneScale = 1;
		this.arToolkitSource = null;
		this.arToolkitContext = null;
		this.sunLight = null;
		//角色光源
		this.playerLight = null;
		this.vsize = null;
		// 相机视场默认设置
		this.fov = 45;
		this.fogDepth = .0001;
		this.fogDepthDefault = .0001;
		this.fogDepthMaximum = .0016;
		this.iflag_sto = null;
		this.audioListener = null;

	}

	init(options) {
		var SCREEN_WIDTH = window.innerWidth;
		var SCREEN_HEIGHT = window.innerHeight;

		// 1 CANVAS / CONTAINER

		this.isMobile = this.getMobile();
		this.container = document.createElement('div');
		document.body.insertBefore(this.container, document.body.firstChild);
		this.canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
		this.canvas.style.cssText = 'position:absolute; top:0; left:0; pointer-events:auto;'//' image-rendering: pixelated;'

		if (!this.isMobile) {
			//document.oncontextmenu = function(e){ e.preventDefault(); };
			this.canvas.ondrop = function (e) { e.preventDefault(); };
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
		this.cameraHUDSprite = new THREE.OrthographicCamera(SCREEN_WIDTH / - 2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_HEIGHT / - 2, 1, 10);
		this.cameraHUDSprite.position.z = 10;

		this.sceneRenderTarget = new THREE.Scene();
		this.cameraOrtho = new THREE.OrthographicCamera(SCREEN_WIDTH / - 2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_HEIGHT / - 2, -10000, 10000);
		this.cameraOrtho.position.z = 100;

		this.sceneRenderTarget.add(this.cameraOrtho);
		var plane = new THREE.PlaneBufferGeometry(SCREEN_WIDTH, SCREEN_HEIGHT);
		this.quadTarget = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ color: 0x000000 }));
		this.quadTarget.position.z = -500;
		this.sceneRenderTarget.add(this.quadTarget);


		// 定义默认的 WebGL 渲染器
		var forceGL1 = options.forceGL1 == undefined ? true : options.forceGL1;
		this.renderer = new THREE.WebGLRenderer(this.getContext(forceGL1));
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		//this.renderer.outputEncoding = THREE.sRGBEncoding;
		this.renderer.shadowMap.enabled = true;
		this.renderer.autoClear = false;

		this.renderer.setClearColor(this.bg, this.alpha);

		this.labelRenderer = new CSS2DRenderer();
		this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
		this.labelRenderer.domElement.style.position = 'absolute';
		this.labelRenderer.domElement.style.top = 0;


		this.mouse = new THREE.Vector3();
		this.offset = new THREE.Vector3();
		//container.appendChild( this.renderer.domElement );

		this.container.appendChild(this.labelRenderer.domElement);
		this.container.appendChild(this.canvas);
		this.container.focus();

		this.audioListener = new THREE.AudioListener();
		this.setup();
		this.showShadow(true);
		this.outlineEffect = new OutlineEffect(this.renderer);
		this.outlineEffect.setSize(window.innerWidth, window.innerHeight);
		this.outlineEffect.enabled = false;
		this.stereoEffect = new StereoEffect(this.renderer);
		this.effect3 = new HOLO.ThreeSidedDisplay(this.renderer);
		this.effect4 = new HOLO.FourSidedDisplay(this.renderer);
		this.effect3.setSize(window.innerWidth, window.innerHeight);
		this.effect4.setSize(window.innerWidth, window.innerHeight);
		//this.vrEffect = new THREE.VREffect( this.renderer );

		this.onWindowResize();
		window.addEventListener("resize", this.onWindowResize.bind(this), false);
	}

	setup() {
		// 基本场景和灯光设置====start====
		// 设置主场景
		this.scene = new THREE.Scene();
		this.sceneRoot = new THREE.Group();
		this.markerRoot = new THREE.Group();
		this.markerScale = new THREE.Group();
		this.markerRoot.add(this.markerScale);
		this.scene.add(this.sceneRoot);
		this.scene.add(this.markerRoot);

		this.camera = this.cameraFree = new THREE.PerspectiveCamera(this.fov, (window.innerWidth - this.cameraSizeConstraint.width) / (window.innerHeight - this.cameraSizeConstraint.height), 0.1, 1000);
		this.cameraInObj = new THREE.PerspectiveCamera(this.fov, (window.innerWidth - this.cameraSizeConstraint.width) / (window.innerHeight - this.cameraSizeConstraint.height), 0.1, 1000);

		this.controls = null;
		this.camera.position.x = -12;
		this.camera.position.y = 7;
		this.camera.position.z = 4;
		this.arCamera = new THREE.PerspectiveCamera(this.fov, (window.innerWidth - this.cameraSizeConstraint.width) / (window.innerHeight - this.cameraSizeConstraint.height), 0.1, 1000);
		this.scene.add(this.arCamera);

		this.setAudioListenerParent(this.camera);
		if (false) {
			this.camera.position.set(0, 3, 15);
			this.cameraControls = new THREE.TrackballControls(this.camera);
			this.cameraControls.rotateSpeed = 1.0;
			this.cameraControls.zoomSpeed = 1.2;
			this.cameraControls.panSpeed = 0.8;
			this.cameraControls.noZoom = false;
			this.cameraControls.noPan = false;
			this.cameraControls.staticMoving = true;
			this.cameraControls.dynamicDampingFactor = 0.3;
			this.cameraControls.keys = [65, 83, 68];
		} else {
			this.cameraControls = new OrbitControls(this.camera, this.canvas);
			this.cameraControls.screenSpacePanning = true;
			//this.cameraControls.enableDamping = true;
		}
		var cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
		this.cubeCamera = new THREE.CubeCamera(0.1, 1, cubeRenderTarget);
		this.scene.background = this.cubeCamera.renderTarget;
		//VR
		/*this.deviceOrientationControls = new THREE.DeviceOrientationControls(this.camera, true);
		function setOrientationControls(e) {
			if (!e.alpha) {
			return;
			}
			this.deviceOrientationControls.connect();
			this.deviceOrientationControls.update();
			window.removeEventListener('deviceorientation', setOrientationControls, true);
		}
		window.addEventListener('deviceorientation', setOrientationControls, true);
		this.vrControls = new THREE.VRControls( this.camera );*/
		// 基本场景和灯光设置====end====
	}
	//--------------------------------------
	//
	//   LOAD MODEL
	//
	//--------------------------------------		
	load(conf, callback) {
		conf.type = conf.type || 'gltf';
		var callback_load = callback || function () { };
		switch (conf.type) {
			case 'gltf':
				this.load_gltf(conf, callback_load);
				break;
			case 'fbx':
				this.load_fbx(conf, callback_load);
				break;
			case 'mmd':
				this.load_mmd(conf, callback_load);
				break;
		}
	}
	load_gltf(conf, callback_load) {
		console.log('load modeFile---' + conf.url);
		var _self = this;
		if (this.modelsCache[conf.name]) {
			var modelO = SkeletonUtils.clone(this.modelsCache[conf.name].model);
			if (conf.isSet) _self.loadMeshes(modelO);
			callback_load(modelO, conf);
		} else {
			this.gltfLoader.load(conf.url, function (gltf) {
				const animsByName = {};
				gltf.animations.forEach((clip) => {
					animsByName[clip.name] = clip;
				});
				_self.modelsCache[conf.name] = { animations: animsByName, type: 'gltf', gltf: gltf, model: gltf.scene };
				var modelO = SkeletonUtils.clone(_self.modelsCache[conf.name].model);
				_self.loadMeshes(modelO);
				callback_load(modelO, conf);
			});
		}
	}
	load_fbx(conf, callback_load) {
		console.log('load modeFile---' + conf.url);
		var _self = this;
		if (this.modelsCache[conf.name]) {
			var modelO = SkeletonUtils.clone(this.modelsCache[conf.name].model);
			if (conf.isSet) _self.loadMeshes(modelO);
			callback_load(modelO, conf);
		} else {
			this.fbxLoader.load(conf.url, function (fbx) {
				const animsByName = {};
				fbx.animations.forEach((clip) => {
					animsByName[clip.name] = clip;
				});
				_self.modelsCache[conf.name] = { animations: animsByName, type: 'fbx', model: fbx };
				var modelO = SkeletonUtils.clone(_self.modelsCache[conf.name].model);
				_self.loadMeshes(modelO);
				callback_load(modelO, conf);
			});
		}
	}
	load_mmd(conf, callback_load) {
		console.log('load modeFile---' + conf.url);
		var _self = this;
		if (this.modelsCache[conf.name]) {
			var modelO = SkeletonUtils.clone(this.modelsCache[conf.name].model);
			if (conf.isSet) _self.loadMeshes(modelO);
			callback_load(modelO, conf);
		} else {
			this.mmdLoader.load(conf.url, function (mmd) {
				_self.modelsCache[conf.name] = { animations: [], type: 'mmd', model: mmd };
				var modelO = SkeletonUtils.clone(_self.modelsCache[conf.name].model);
				if (conf.isSet) _self.loadMeshes(modelO);
				callback_load(modelO, conf);
			});
		}
	}
	loadMeshes(modelO) {
		var _self = this;
		modelO.traverse(function (child) {

			if (child.isMesh) {
				_self.mesh[child.name] = child;
				var mtx0 = new THREE.Matrix4().makeTranslation(child.position[0], child.position[1], child.position[2]);
				mtx0.makeRotationFromQuaternion(child.quaternion);
				var g = child.geometry.clone();
				g.applyMatrix4(mtx0);
				_self.geo[child.name] = g;
			} else if (child.isGroup) {
				_self.mesh[child.name] = child;
			}
		});

	}
	loadVMD(conf, callback_load) {
		console.log('load VMDFile---' + conf.url);
		var _self = this;
		if (this.vmdCache[conf.name]) {
			var animationO = this.vmdCache[conf.name];
			callback_load(animationO, conf);
		} else {
			this.mmdLoader.loadVMD(conf.url, function (vmd) {
				_self.vmdCache[conf.name] = vmd;
				callback_load(vmd, conf);
			});
		}
	}
	getModel(name) {
		var model = SkeletonUtils.clone(this.modelsCache[name].model);
		model.modelType = this.modelsCache[name].type;
		return model;
	}
	getAnimations(name) {
		return this.modelsCache[name].animations;
	}
	getMMDAnimation(conf, object) {
		if (object.isCamera) {
			var camVmd = this.vmdCache[conf.refVMD];
			var cameras = camVmd.cameras;
			for (var i = 0, il = cameras.length; i < il; i++) {

				var motion = cameras[i];
				var pos = motion.position;
				motion.position = [pos[0] * conf.positionScale, pos[1] * conf.positionScale, pos[2] * conf.positionScale];
				//var rot = motion.rotation;
				var distance = motion.distance;
				motion.distance = distance * conf.distanceScale;
			}
			return this.mmdLoader.animationBuilder.buildCameraAnimation(camVmd);
		} else {
			return this.mmdLoader.animationBuilder.build(this.vmdCache[conf.refVMD], object)
		}
	}
	getMesh(name) {
		if (this.mesh[name]) {
			return this.mesh[name].clone();
		} else {
			return null;
		}

	}
	getGeometry(name) {
		return this.geo[name];
	}
	destroy() {
		while (this.objects.length > 0) {
			var p = this.objects.pop();
			if (p.userData.hasOwnProperty('audio')) {
				p.userData.audio.stop();
				p.remove(p.userData.audio);
			}
			this.removeVisual(p);
		}
		this.objects = [];
	}
	setAudioListenerParent(pObj) {
		pObj.add(this.audioListener);
	}
	addVisual(o) {
		this.objects.push(o);
		this.addSubObjects(o);
		if (this.renderType == 6) {
			this.markerScale.add(o);
		} else {
			this.sceneRoot.add(o);
		}
	}
	addSubObjects(o) {
		if (o.children.length > 0) {
			for (var i = 0; i < o.children.length; i++) {
				if (o.children[i].isGroup) {
					this.addSubObjects(o.children[i]);
				} else {
					this.objects_raycaster.push(o.children[i]);
				}
			}
		} else {
			this.objects_raycaster.push(o);
		}
	}
	removeVisual(o) {
		if (this.renderType == 6) {
			this.markerScale.remove(o);
		} else {
			if (o.parent) {
				o.parent.remove(o);
			}
			//this.sceneRoot.remove(o);
		}
	}
	getVisualObjects() {

		return this.root.viewObjects;

	}
	initDefGeosAndMats() {
		this.geo['box'] = new THREE.BoxBufferGeometry(1, 1, 1);
		this.geo['sphere'] = new THREE.SphereBufferGeometry(1, 12, 10);
		this.geo['cylinder'] = new THREE.BufferGeometry().fromGeometry(new THREE.CylinderGeometry(1, 1, 1, 12, 1));
		this.geo['cone'] = new THREE.BufferGeometry().fromGeometry(new THREE.CylinderGeometry(0, 1, 0.5));
		this.geo['wheel'] = new THREE.BufferGeometry().fromGeometry(new THREE.CylinderGeometry(1, 1, 1, 18));
		this.geo['wheel'].rotateZ(-Math.PI90);


	}
	getContent() {
		return this.sceneRoot;
	}
	getGeo() {
		return this.geo;
	}
	getMat() {
		return WMaterials.getMat();
	}
	getControler() { return this.cameraControls; }
	reset() {
		this.removeFog();
		this.delta = 0;
		this.fps = 0;
		this.geo = {};
		this.mesh = {};
		this.pause = false;
		this.objects = [];
		this.objects_raycaster = [];
		this.setup();
	}
	updateSunLightSize(camDistance) {
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
			this.sunLight.shadow.camera.updateProjectionMatrix();
			sunLightHelper.update();
		},1000);	*/
	}
	showShadow(v) {
		if (v == false) {
			this.renderer.shadowMap.enabled = this.isShadow = false;
		} else {
			this.renderer.shadowMap.enabled = this.isShadow = true;
		}
		//this.sunLight.castShadow = isShadow;
		//window.AWEngine.updateMaterials();
	}
	setCameraFollowBehind(b) {
		this.cameraFollowBehind = b;
	}
	getMobile() {
		var n = navigator.userAgent;
		if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i) || n.match(/Windows Phone/i)) return true;
		else return false;
	}
	setBg(c, Alpha) { bg = c; alpha = Alpha !== undefined ? Alpha : alpha; }
	getContext(force) {

		var gl;

		var o = {
			antialias: this.isMobile ? false : true,
			alpha: this.alpha === 1 ? false : true,
			stencil: false, depth: true, precision: "highp",
			premultipliedAlpha: true,
			preserveDrawingBuffer: false,
			//xrCompatible: true,
		}

		if (!force) {
			gl = canvas.getContext('webgl2', o);
			if (!gl) gl = canvas.getContext('experimental-webgl2', o);
			isGl2 = !!gl;
		}

		if (!this.isGl2) {
			//delete( option.xrCompatible );
			gl = this.canvas.getContext('webgl', o);
			if (!gl) gl = this.canvas.getContext('experimental-webgl', o);
		}

		o.canvas = this.canvas;
		o.context = gl;
		return o;

	}

	//-----------------------------
	//
	// FOG
	//
	//-----------------------------

	getWithFog() {

		return isFog;

	}

	addFog(o) {

		if (isFog) return;

		o = o || {};

		this.fog = o.density !== undefined ? new THREE.FogExp2(o.color || 0x3b4c5a, o.density) : new THREE.Fog(o.color || 0x3b4c5a, o.near || 1, o.far || 300);
		this.scene.fog = this.fog;
		this.isFog = true;

	}

	setFogColor(color) {

		if (!this.isFog) return;
		this.fog.color = color;

	}

	removeFog() {

		if (!this.isFog) return;
		this.fog = null;
		this.scene.fog = null;
		this.isFog = false;

	}
	//-----------------------------
	//
	// RAYCAST
	//
	//-----------------------------

	activeRay(callback, debug, size) {

		if (this.isRay) return;
		this.ray = new THREE.Raycaster();

		this.dragPlane = new THREE.Mesh(
			debug ? new THREE.PlaneBufferGeometry(1, 1, 4, 4) : new THREE.PlaneBufferGeometry(1, 1, 1, 1),
			new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: debug ? 0.3 : 0, depthTest: false, depthWrite: false, wireframe: debug ? true : false })
		);

		this.dragPlane.castShadow = false;
		this.dragPlane.receiveShadow = false;
		this.setDragPlane(null, size);
		this.addVisual(this.dragPlane);

		this.fray = function (e) { this.rayTest(e); }.bind(this);
		this.mDown = function (e) { this.rayTest(e); this.mouse.z = 1; }.bind(this);
		this.mUp = function (e) { this.mouse.z = 0; }.bind(this);

		this.canvas.addEventListener('mousemove', this.fray, false);
		this.canvas.addEventListener('mousedown', this.mDown, false);
		document.addEventListener('mouseup', this.mUp, false);

		this.rayCallBack = callback;
		this.isRay = true;

	}

	removeRay() {

		if (!this.isRay) return;

		this.canvas.removeEventListener('mousemove', this.fray, false);
		this.canvas.removeEventListener('mousedown', this.mDown, false);
		document.removeEventListener('mouseup', this.mUp, false);

		this.rayCallBack = function () { };

		this.removeVisual(this.dragPlane);

		this.isRay = false;
		this.offset.set(0, 0, 0);

	}

	rayTest(e) {

		this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
		this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;

		//console.log('mouse='+mouse.x+' '+mouse.y+' '+mouse.z);
		this.ray.setFromCamera(this.mouse, this.camera);
		//var intersects = this.ray.intersectObjects( this.content.children, true );
		var intersects = this.ray.intersectObject(this.dragPlane);
		if (intersects.length) {
			this.offset.copy(intersects[0].point);
			this.rayCallBack(this.offset);
		}

	}

	setDragPlane(pos, size) {

		size = size || 200;
		this.dragPlane.scale.set(1, 1, 1).multiplyScalar(size);
		if (pos) {
			this.dragPlane.position.fromArray(pos);
			this.dragPlane.rotation.set(0, this.cameraControls.getAzimuthalAngle(), 0);
			//this.dragPlane.lookAt( this.camera.position );
		} else {
			this.dragPlane.position.set(0, 0, 0);
			this.dragPlane.rotation.set(-Math.PI90, 0, 0);
		}

	}
	getMouse() { return this.mouse; }
	getControls() { return this.cameraControls; }
	//--------------------------------------
	//
	//   SRC UTILS ViewUtils
	//
	//--------------------------------------
	addUV2(m) {
		GeometryTools.addUV2(m.geometry);
	}

	mergeGeometry(m) {
		return GeometryTools.mergeGeometryArray(m);
	}

	mergeMesh(m) {
		return GeometryTools.mergeGeometryArray(m);
	}

	prepaGeometry(g, type) {
		return GeometryTools.prepaGeometry(g, type);
	}

	getGeomtryInfo(o) {
		return GeometryTools.getGeomtryInfo(o);
	}

	//-----------------------------
	//
	//  TEXTURES
	//  need textures.js
	//
	//-----------------------------

	texture(o) {

		return WTextures.make(o);

	}

	getTexture(name) {

		return WTextures.get(name);

	}


	//-----------------------------
	//
	//  MATERIALS
	//  need materials.js
	//
	//-----------------------------

	material(o) {

		return WMaterials.make(o);

	}

	getMaterial(name) {

		return WMaterials.get(name);

	}

	getShaderUnforms(name) {
		return WMaterials.getShaderUnforms(name);
	}

	updateEnvmap() {
		WMaterials.updateEnvmap(this.envMap);
	}

	setEnvMapRenderTarget(renderTarget) {
		this.envMapRenderTarget = renderTarget;
		this.cubeCamera.update(this.renderer, this.envMapRenderTarget);
		this.envMap = this.cubeCamera.renderTarget.texture;
		this.envMap.minFilter = THREE.LinearMipMapLinearFilter;
		this.envMap.format = THREE.RGBAFormat;
		this.updateEnvmap();
	}
	getEnvmap() {
		if (this.envMapRenderTarget) {
			this.cubeCamera.update(this.renderer, this.envMapRenderTarget);
			this.envMap = this.cubeCamera.renderTarget.texture;
			this.envMap.minFilter = THREE.LinearMipMapLinearFilter;
			this.envMap.format = THREE.RGBAFormat;
		} else {
			this.envMap = new THREE.Texture();
		}
		return this.envMap;
	}
	setClearColor(cc) {
		this.renderer.setClearColor(cc, 0);
	}
	getFps() {
		return fps;
	}
	unPause() { }
	pauseRender() {
		this.pause = this.isRenderPause = true;
	}
	restartRender() {
		if (this.isRenderPause) {
			this.pause = this.isRenderPause = false; this.render(0);
		}
	}

	render(stamp) {
		if (!this.isRenderPause) window.requestAnimationFrame(this.render.bind(this));
		this.delta = this.clock.getDelta();
		if (this.pause) this.isPause = true;
		if (this.isPause && !this.pause) { this.isPause = false; this.unPause(); }

		this.update(this.delta);
		// 更新主场景
		if (this.renderType == 1) {
			this.renderer.clear();
			this.controlUpdate(this.delta);
			this.outlineEffect.render(this.scene, this.camera);
			//this.renderer.render(this.scene, this.camera);
			this.labelRenderer.render(this.scene, this.camera);
			this.renderer.clearDepth();
			this.renderer.render(this.sceneRenderHUDSprite, this.cameraHUDSprite);



		} else if (this.renderType == 2) {
			this.deviceOrientationControls.update(this.delta);
			this.stereoEffect.render(this.scene, this.camera);
		} else if (this.renderType == 3) {
			this.controlUpdate(this.delta);
			this.effect3.render(this.scene, this.camera);
		} else if (this.renderType == 4) {
			this.controlUpdate(this.delta);
			this.effect4.render(this.scene, this.camera);
		} else if (this.renderType == 5) {
			this.vrControls.update();
			this.stereoEffect.render(this.scene, this.camera);
		}
	}
	update() { }
	onWindowResize() {
		//保持屏幕大小当窗口大小改变
		this.cameraInObj.aspect = this.cameraFree.aspect = (window.innerWidth - this.cameraSizeConstraint.width) / (window.innerHeight - this.cameraSizeConstraint.height);
		this.cameraFree.updateProjectionMatrix();
		this.cameraInObj.updateProjectionMatrix();

		this.cameraHUDSprite.left = - window.innerWidth / 2;
		this.cameraHUDSprite.right = window.innerWidth / 2;
		this.cameraHUDSprite.top = window.innerHeight / 2;
		this.cameraHUDSprite.bottom = - window.innerHeight / 2;
		this.cameraHUDSprite.updateProjectionMatrix();
		if (window.AWEngine.compass)
			window.AWEngine.compass.position.set((-window.innerWidth / 2) + window.AWEngine.compass.material.map.image.width / 2, (window.innerHeight / 2) - window.AWEngine.compass.material.map.image.height / 2, 0);
		this.renderer.setSize((window.innerWidth - this.cameraSizeConstraint.width), (window.innerHeight - this.cameraSizeConstraint.height));
		this.labelRenderer.setSize((window.innerWidth - this.cameraSizeConstraint.width), (window.innerHeight - this.cameraSizeConstraint.height));
		this.outlineEffect.setSize(window.innerWidth, window.innerHeight);
		this.stereoEffect.setSize(window.innerWidth, window.innerHeight);
		this.effect3.setSize(window.innerWidth, window.innerHeight);
		this.effect4.setSize(window.innerWidth, window.innerHeight);
		//this.vrEffect.setSize(window.innerWidth, window.innerHeight);

	}
	createModel(geometry, materials, scale, isGeometry, isSkinnedMesh) {
		var model = {};
		materials.forEach(function (material) {
			material.opacity = 1;
			material.alphaTest = 0.5;
		});
		// 给创建的网格分配材质
		if (isSkinnedMesh) {
			model.mesh = new THREE.SkinnedMesh(geometry, materials);
		} else {
			geometry.applyMatrix(new THREE.Matrix4().makeScale(scale, scale, scale));
			//var bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry); 
			//model.mesh = new THREE.Mesh(bufferGeometry, materials);

			model.mesh = new THREE.Mesh(geometry, materials);
		}
		return model;
	}
	orbit(h, v, d) {
		var offset = new THREE.Vector3();
		var phi = v;
		var theta = h;
		offset.x = d * Math.sin(phi) * Math.sin(theta);
		offset.y = d * Math.cos(phi);
		offset.z = d * Math.sin(phi) * Math.cos(theta);
		//console.log("phi=="+phi+"  theta="+theta+"  x=="+offset.x+" y=="+offset.y+" z=="+offset.z);
		var p = new THREE.Vector3();
		p.copy(this.cameraControls.target).add(offset);
		return p;
	}
	/*moveCamera ( h, v, d, target ) {
		var dest = this.orbit( (h+180) * Math.torad, (v-90) * Math.torad, d );
		new TWEEN.Tween( this.camera.position ).to( { x: dest.x, y: dest.y, z: dest.z }, 400 )
					.easing( TWEEN.Easing.Quadratic.Out )
					.start();
		new TWEEN.Tween( this.cameraControls.target ).to( { x: target[0], y: target[1], z: target[2] }, 400 )
					.easing( TWEEN.Easing.Quadratic.Out )
					.onUpdate( function(){ this.cameraControls.update(); } )
					.start();        
	},*/
	setControle(b) {
		if (this.cameraControls.enableRotate === b) return;
		this.cameraControls.enableRotate = b;
		this.cameraControls.enableZoom = b;
		this.cameraControls.enablePan = b;
	}
	controlUpdate(delta) {
		if (window.AWEngine.currentFollow === null) return;

		//this.setControle( true );		
		this.cam.theta = this.cameraControls.getAzimuthalAngle() + Math.Pi;
		this.cam.phi = -this.cameraControls.getPolarAngle();
		this.cam.radius = this.cameraControls.getRadius();

		if (!this.cam.oTheta) {
			this.cam.oTheta = this.cam.theta;
		}
		if (!this.cam.oRadius) {
			this.cam.oRadius = this.cam.radius;
		}
		if (!this.cam.oPhi) {
			this.cam.oPhi = this.cam.phi;
		}
		if (this.cameraFollowBehind) {
			var matrix = new THREE.Matrix4();
			matrix.extractRotation(window.AWEngine.currentFollow.matrix);
			var front = new THREE.Vector3(0, 0, 1);
			front.applyMatrix4(matrix);
			this.cam.theta = Math.atan2(front.x, front.z);
			this.camera.position.lerp(this.orbit(this.cam.theta, this.cam.oPhi, this.cam.oRadius), 0.3);
		} else {
			this.cam.oRadius = this.cam.radius;
			this.cam.oPhi = this.cam.phi;
			this.cam.oTheta = this.cam.theta;
		}
		this.cameraControls.target.copy(window.AWEngine.currentFollow.position);
		this.cameraControls.update(delta);
	}
	enableOutlineEffect(b) {
		this.outlineEffect.enabled = b;
	}
	enableHoloEffect(b, sideNum) {
		if (b) {
			this.renderType = sideNum;
		} else {
			this.renderType = 1;
		}
		this.onWindowResize();
	}
	enableVREffect(b) {
		if (b) {
			this.renderType = 2;
		} else {
			this.renderType = 1;
		}
		this.onWindowResize();
	}
	enableWebVREffect(b) {
		if (b) {
			this.renderType = 5;
		} else {
			this.renderType = 1;
		}
		this.onWindowResize();
	}
	copy2AR() {
		this.markerScale.add(this.sceneRoot);
	}
	copy2Normal() {
		this.scene.add(this.sceneRoot);
	}
	setARSceneScale(s) {
		this.arSceneScale = s;
		this.markerScale.scale.set(1, 1, 1).multiplyScalar(s);
	}
	initAR() {
		if (this.arToolkitSource.ready) return;
		this.arToolkitSource.init(function onReady() {
			this.arToolkitSource.onResize(this.renderer.domElement);
		});
		this.arToolkitContext.init(function onCompleted() {
			this.arCamera.projectionMatrix.copy(this.arToolkitContext.getProjectionMatrix());
		});
	}
	enableAREffect(b) {
		if (b) {
			renderType = 6;
			this.initAR();
			this.copy2AR();
		} else {
			renderType = 1;
			this.copy2Normal();
		}
		this.onWindowResize();
	}

};
export { WView };