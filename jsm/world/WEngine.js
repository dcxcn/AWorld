/*
 * WEngine.js
 * 读取配置控制各个组件 
 */
import { WEBGL } from '../../jsm/libs/WebGL.js';

import * as THREE from '../../jsm/libs/three.module.js';
import {
	Geometry,
} from "../../jsm/three/deprecated/Geometry.js";
import {
	Lensflare,
	LensflareElement
} from "../../jsm/three/objects/Lensflare.js";
import { DDSLoader } from '../../jsm/three/loaders/DDSLoader.js';
import { WTextures } from '../../jsm/world/WTextures.js';
import { ConvexGeometry } from '../../jsm/three/geometries/ConvexGeometry.js';
import { ThreeBSP } from '../../jsm/three/utils/ThreeBSP.js';
import { BufferGeometryUtils } from '../../jsm/three/utils/BufferGeometryUtils.js';
import { TerrainData } from '../../jsm/threex/math/TerrainData.js';
import { SimplexNoise } from '../../jsm/three/math/SimplexNoise.js';
import { ShaderExtras } from '../../jsm/threex/shaders/ShaderExtras.js';
import { Sky } from '../../jsm/three/objects/Sky.js';
import { Terrain } from '../../jsm/threex/objects/Terrain.js';
import { Water } from '../../jsm/three/objects/Water.js';
import { Water as Water2 } from '../../jsm/three/objects/Water2.js';
import { PlantTufts } from '../../jsm/threex/objects/PlantTufts.js';
import { MMDAnimationHelper } from '../../jsm/three/animation/MMDAnimationHelper.js';
import { CSS2DObject } from '../../jsm/three/renderers/CSS2DRenderer.js';
import {
	RollerCoasterGeometry,
	RollerCoasterShadowGeometry,
	RollerCoasterLiftersGeometry,
	TreesGeometry,
	SkyGeometry
} from '../../jsm/three/misc/RollerCoaster.js';

import { TWEEN } from '../../jsm/libs/tween.module.min.js';
import { World as DDLSWorld } from '../../jsm/ddls/World.js';
import { DDLSRender } from '../../jsm/ddls/DDLSRender.js';

import { WGui } from '../../jsm/world/WGui.js';
import { WView } from '../../jsm/world/WView.js';
import { WPhysic } from '../../jsm/world/WPhysic.js';
import { WAvatar } from '../../jsm/world/WAvatar.js';
import { WAnimal } from '../../jsm/world/WAnimal.js';
import { WMMD } from '../../jsm/world/WMMD.js';
import { WUser } from '../../jsm/world/WUser.js';



window.THREE = THREE;
window.TWEEN = TWEEN;
window.world = window.world || {};
window.world.scenes = window.world.scenes || {};


class WEngine extends THREE.EventDispatcher {


	constructor(o) {
		//===添加数学方法===开始========================================================================//
		Math.torad = Math.PI / 180;//0.0174532925199432957;
		Math.halfdegtorad = Math.PI / 360;
		Math.radtodeg = 180 / Math.PI;//57.295779513082320876;
		Math.Pi = 3.141592653589793;
		Math.TwoPI = 6.283185307179586;
		Math.PI90 = 1.570796326794896;
		Math.PI270 = 4.712388980384689;
		Math.lerp = function (a, b, percent) { return a + (b - a) * percent; };
		Math.rand = function (a, b) { return Math.lerp(a, b, Math.random()); };
		Math.randInt = function (a, b, n) { return Math.lerp(a, b, Math.random()).toFixed(n || 0) * 1; };
		Math.int = function (x) { return ~~x; };
		//生成uuid
		Math.generateUUID = function () {
			var d = new Date().getTime();
			var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = (d + Math.random() * 16) % 16 | 0;
				d = Math.floor(d / 16);
				return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
			});
			return uuid;
		};

		Math.vectorad = function (r) {

			var i = r.length;
			while (i--) r[i] *= Math.torad;
			return r;

		};
		Math.perlin = null;

		Math.noise = function (v, o) {

			if (Math.perlin === null) Math.perlin = new SimplexNoise();

			o = o || {};

			var level = o.level || [1, 0.2, 0.05];
			var frequency = o.frequency || [0.016, 0.05, 0.2];

			var i, f, c = 0, d = 0;

			for (i = 0; i < level.length; i++) {

				f = frequency[i];
				c += level[i] * (0.5 + Math.perlin.noise3d(v.x * f, v.y * f, v.z * f) * 0.5);
				d += level[i];

			}

			c /= d;

			return c;

		};

		//===添加数学方法===结束========================================================================//
		super();
		this.run = false;
		this.colors = {
			black: 0x000000,
			white: 0xffffff,
			darkGreen: 790292,
			green: 0x0fdb8c,
			brightGreen: 10813330,
			cyan: 0x38FDD9
		};
		this.ddlsOffset = new THREE.Vector3(0, 0, 0);
		this.moveObjNames = [];
		this.objects = [];
		this.compass = null;
		this.compassAngle = 0;
		this.bvhReader = null;
		this.currentFollow = null;
		this.isShadow = true;
		this.ddlsRender = null;
		this.enableWorldEvent = true;
		this.addMoveObjName = function (o) { this.moveObjNames.push(o); if (this.moveObjNames.length == 1) { this.follow(o); } };
		this.enableDDLSDebug = function (b) { this.ddlsRender.show(b); };

		this.follow = function (objName) {
			this.currentFollow = this.byName(objName);
		};
		this.createRandomColor = function () { return Math.floor(Math.random() * (1 << 24)); };
		this.toRad = function (r) { var i = r.length; while (i--) r[i] *= Math.torad; return r; };
		this.createColorMaterial = function (color) { color = color || this.createRandomColor(); return new THREE.MeshPhongMaterial({ color: color }); };


		//===world.core变量===开始
		this.mmdHelper = null;
		this.isMMDLoaded = false;
		this.isAmmoImport = false;
		this.isTouch = !!('ontouchstart' in window);
		this.clock = new THREE.Clock();
		this.urls = [];
		this.results = {};
		this.geo = {};
		this.sounds = {};
		this.actions = {};
		this.labels = [];
		this.extraGeo = [];
		this.lights = [];
		this.lightHelpers = [];
		this.heros = [];
		this.terrains = [];
		this.waters = [];
		this.cars = [];
		this.statics = [];
		this.keys = [];
		this.keys_tmp = [];
		this.terrainData = null;
		this.content = null;
		this.contentMesh = null;
		this.targetMouse = null;
		this.raycaster = null;
		this.raycaster_compass = null;
		this.mouse = null;
		this.mouseCoords = new THREE.Vector2();
		this.rayCallBack = null;
		this.isWithRay = false;
		this.zone = null;
		this.delta = null;
		this.driveSpeed = 0;
		this._font3d = null;
		this.gui = null;
		this.user = null;
		this.view = null;
		this.physic = null;
		this.phyinfo = null;
		this.showPhyinfo = false;
		this.ddlsworld = null;
		this.ddlsRender = null;
		this.ddlsObj = [];
		this.ddlsObject = [];
		this.ddlsHeros = [];
		this._animationFrameLoop = null;
		this.perlin = null;
		this.axisHelper = null;
		this.clickMeasureEnabled = false;
		this.sizeGroup = null;
		this.sizeDivs = [];
		this.load = 0;
		this.isLoading = false;
		this.loadingManager = new THREE.LoadingManager();
		this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
			this.gui.showProcess(itemsLoaded, itemsTotal, '请稍等,资源加载中...');
			console.log("url==" + url);
		};
		this.loadingManager.onLoad = () => {
			this.gui.hideProcess();
		};
		this.bvhFileLoader = new THREE.FileLoader(this.loadingManager);
		this.bvhFileLoader.setResponseType('arraybuffer');
		this.fileLoader = new THREE.FileLoader();
		this.audioLoader = new THREE.AudioLoader(this.loadingManager);
		this.fontLoader = new THREE.FontLoader(this.loadingManager);
		var _engine = this;
		//通用方法
		this.commonFunc = {
			//判断对象
			hasObj: function (_obj) {
				if (_obj != null && typeof (_obj) != 'undefined') {
					return true;
				} else {
					return false;
				}
			},
			//查找对象
			findObject: function (_objname) {
				console.log('findObject');
				var findedobj = null;
				_engine.objects.forEach(function (_obj, index) {
					if (_obj.name != null && _obj.name != '') {
						if (_obj.name == _objname) {
							findedobj = _obj;
							return true;
						}
					}
				});
				return findedobj;
			},
			cloneByName: function (_objname, newparam) {
				var fobj = _engine.commonFunc.findObject(_objname);
				var newobj = fobj.clone();
				if (newobj.children != null && newobj.children.length > 1) {
					newobj.children.forEach(function (obj, index) {
						obj.name = newparam.childrenname[index];
						_engine.objects.push(obj);
					});
				}
				newobj.name = newparam.name;
				newobj.uuid = newparam.uuid;
				var size = newobj.userData.size;
				delete newobj.userData;
				newobj.userData = { size: size };
				return newobj;
			},
			//复制对象
			cloneObj: function (_objname, newparam) {
				/*newparam
				{
				show: true,
				uuid:
				copyfrom: 'cabinet1_1',
				name:
				childrenname:[]
				objType: 'cloneObj',
				position:{x:y:z:}//相对复制品的
				scale:{x:1,y:1,z:1}
				 rotation: [{ direction: 'y', degree: 0.25*Math.PI}],//旋转     uuid:'',
				}
				*/
				var newobj = _engine.commonFunc.cloneByName(_objname, newparam);

				//位置
				if (_engine.commonFunc.hasObj(newparam.position)) {
					newobj.position.x = newparam.position.x;
					newobj.position.y = newparam.position.y;
					newobj.position.z = newparam.position.z;
				}
				//大小
				if (_engine.commonFunc.hasObj(newparam.scale)) {
					newobj.scale.x = newparam.scale.x;
					newobj.scale.y = newparam.scale.y;
					newobj.scale.z = newparam.scale.z;
				}
				//角度
				if (_engine.commonFunc.hasObj(newparam.rotation)) {
					newparam.rotation.forEach(function (rotation_obj, index) {
						switch (rotation_obj.direction) {
							case 'x':
								newobj.rotateX(rotation_obj.degree);
								break;
							case 'y':
								newobj.rotateY(rotation_obj.degree);
								break;
							case 'z':
								newobj.rotateZ(rotation_obj.degree);
								break;
							case 'arb':
								newobj.rotateOnAxis(new THREE.Vector3(rotation_obj.degree[0], rotation_obj.degree[1], rotation_obj.degree[2]), rotation_obj.degree[3]);
								break;
						}
					});
				}
				newobj.name = newparam.name;
				newobj.uuid = newparam.uuid;
				return newobj;
			},

			//添加图片标识
			addIdentification: function (_objname, _obj) {
				/*
			  {
				name:'test',
					size:{x:20,y:20},
			position:{x:0,y:100,z:0},
			imgurl: '../datacenterdemo/res/connection.png'
			}
				*/

				var _fobj = _engine.commonFunc.findObject(_objname);
				var texture = WTextures.make({ url: _obj.imgurl, name: _obj.name });
				var spriteMaterial = new THREE.SpriteMaterial({ map: texture, useScreenCoordinates: false });
				var sprite = new THREE.Sprite(spriteMaterial);
				sprite.name = _obj.name;
				sprite.position.x = _fobj.position.x + _obj.position.x;
				sprite.position.y = _fobj.position.y + _obj.position.y;
				sprite.position.z = _fobj.position.z + _obj.position.z;
				if (_engine.commonFunc.hasObj(_obj.size)) {
					sprite.scale.set(_obj.size.x, _obj.size.y);
				} else {
					sprite.scale.set(1, 1);
				}
				_engine.addObject(sprite);
			},
			//添加文字
			makeTextSprite: function (_objname, parameters) {

				if (parameters === undefined) parameters = {};
				var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
				var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
				var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
				var textColor = parameters.hasOwnProperty("textColor") ? parameters["textColor"] : { r: 0, g: 0, b: 0, a: 1.0 };
				var message = parameters.hasOwnProperty("message") ? parameters["message"] : "不知道";
				var x = parameters.hasOwnProperty("position") ? parameters["position"].x : 0;
				var y = parameters.hasOwnProperty("position") ? parameters["position"].y : 0;
				var z = parameters.hasOwnProperty("position") ? parameters["position"].z : 0;
				var canvas = document.createElement('canvas');
				var cxt = canvas.getContext('2d');
				cxt.font = "Bold " + fontsize + "px " + fontface;
				var metrics = cxt.measureText(message);
				canvas.width = metrics.width;
				canvas.height = fontsize + 2 * borderThickness;
				cxt.lineWidth = borderThickness;

				cxt.fillStyle = "rgba(" + textColor.r + ", " + textColor.g + ", " + textColor.b + ", 1.0)";
				cxt.fillText(message, borderThickness, fontsize + borderThickness);
				var texture = new THREE.Texture(canvas);
				texture.needsUpdate = true;
				var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
				var sprite = new THREE.Sprite(spriteMaterial);

				var _fobj = _engine.commonFunc.findObject(_objname);
				if (_fobj != null && parameters.parent == null) {
					sprite.position.x = _fobj.position.x + x;
					sprite.position.y = _fobj.position.y + y;
					sprite.position.z = _fobj.position.z + z;
				} else {
					sprite.position.x = x;
					sprite.position.y = y;
					sprite.position.z = z;
				}

				sprite.name = parameters.name;
				sprite.scale.set(canvas.width * 0.01, canvas.height * 0.01, 1);
				if (parameters.parent) {
					parameters.parent.add(sprite);
				} else {
					_engine.addObject(sprite);
				}

			}
		};
		//===world.core变量===结束
		//===用到了定义的变量
		//场景

		this.scene = {
			loopFunctions: [],
			update: function (delta) {
				// 有单独渲染的物体 如 水，风，火
				var i = _engine.scene.loopFunctions.length;
				while (i--) {
					_engine.scene.loopFunctions[i](delta);
				}
				i = null;
			},
			load: function (sceneName) {
				window.world.currentSceneName = sceneName;
				_engine.loadSceneData(window.world.currentSceneName, function () {
					_engine.destroy();
				});
			},
			removePlayer: function (humanID) {

			},
			reversUV: function (geometry) {
				var uv = geometry.attributes.uv.array;
				var i = uv.length * 0.25;
				while (i--) uv[i * 2] *= -1;
				geometry.attributes.uv.needsUpdate = true;
			},
			loadModels: function (curScene, callBack) {
				//解析模型
				var pAry = [];
				if (curScene.hasOwnProperty("models")) {
					var i = curScene.models.length;
					while (i--) {
						pAry.push(new Promise(function (resolve, reject) {
							_engine.view.load(curScene.models[i], function (model, co) {
								console.log('load model ' + co.url + ' ok');
								resolve('load models ok');
							});
						}));
					}

				}
				Promise.all(pAry).then(function (results) {
					callBack(results);
				});
			},
			loadMaterials: function (curScene, callBack) {
				//解析材质
				var pAry = [];	
				if (curScene.hasOwnProperty("materials")) {
					var i = curScene.materials.length;
					while (i--) {
						pAry.push(new Promise(function (resolve, reject) {
							var mo = curScene.materials[i];
							var mo_type = mo.type;
							var mo_name = mo.name;
							var mo_loop = mo.loop;
							var mo_debugParams = mo.debugParams;
							_engine.preLoadGlslFiles(mo, function () {
								_engine.view.material(mo);
								if (mo_loop) {
									_engine.scene.loopFunctions.push(mo_loop);
								}
								if ((mo_type == "Shader" || mo_type == "RawShader") && mo_debugParams) {
									//展示shader 调试组
									_engine.gui.addDebugTempGroup("着色器-" + mo_name, mo_debugParams);
								}
								resolve('load materials ok');
							});


						}));
					}
				}
				Promise.all(pAry).then(function (results) {
					callBack(results);
				});
			},
			loadSounds: function (curScene, callBack) {
				//解析声音
				var pAry = [];
				if (curScene.hasOwnProperty("sounds")) {
					var k = curScene.sounds.length;
					while (k--) {
						var conf = curScene.sounds[k];
						pAry.push(new Promise(function (resolve, reject) {
							_engine.loadSound(conf, function (bf, cf) {
								resolve('load sound ' + cf.name + ' ok');
							});
						}));
					}
				}
				Promise.all(pAry).then(function (results) {
					callBack(results);
				});
			},
			loadActions: function (curScene, callBack) {
				//解析动作库
				var pAry = [];
				if (curScene.hasOwnProperty("actions")) {
					var j = curScene.actions.length;
					while (j--) {
						var conf = curScene.actions[j];
						pAry.push(new Promise(function (resolve, reject) {
							_engine.loadAction(conf, function (cf) {
								resolve('load action ' + cf.name + ' ok');
							})

						}));
					}
				}
				Promise.all(pAry).then(function (results) {
					callBack(results);
				});
			},

			create: function () {
				_engine.debugTell("创建场景...");
				//坐标轴帮助
				_engine.axisHelper = new THREE.AxesHelper(100);
				_engine.axisHelper.visible = false;
				_engine.statics.push(_engine.axisHelper);
				_engine.view.addVisual(_engine.axisHelper);

				//创建场景
				//加载场景总文件
				var curScene = null;
				var temfun = function () {
					if (curScene.hasOwnProperty("clearColor")) {
						_engine.view.setClearColor(curScene.clearColor);
					}
					if (curScene.hasOwnProperty("arSceneScale")) {
						_engine.view.setARSceneScale(curScene.arSceneScale);
					}
					//解析界面组件
					if (curScene.hasOwnProperty("uiControls")) {
						var i = curScene.uiControls.length;
						while (i--) { _engine.gui.addControl(curScene.uiControls[i]); }
					}
					_engine.scene.loadModels(curScene, function () {
						_engine.scene.loadMaterials(curScene, function () {
							_engine.scene.loadSounds(curScene, function () {
								_engine.scene.loadActions(curScene, function () {
									//解析三维物体
									_engine.createSceneObject();
									//解析场景逻辑
									_engine.loadSceneLogic();

									_engine.showTerrain(true);
									//this.addHeroLabel();
									_engine.showHero(true);
									_engine.start();
								});
							});
						});
					});
				};
				if (!window.world.scenes.hasOwnProperty(window.world.currentSceneName)) {
					_engine.loadSceneData(window.world.currentSceneName, function () {
						curScene = window.world.scenes[window.world.currentSceneName];
						temfun();
					});
				} else {
					curScene = window.world.scenes[window.world.currentSceneName];
					temfun();
				}
			}
		};
	}


	debugTell(s) {
		this.gui.log(s);
	}

	statusTell(s) {
		this.gui.tell(s);
	}

	showDebugPanel = function (v) {
		this.gui.showDebugPanel(v)
	}

	getKeys() {
		var _engine = this;
		this.keys_tmp = [];
		this.moveObjNames.forEach(function (b, id) {
			if (_engine.currentFollow && b == _engine.currentFollow.name) {
				_engine.keys_tmp.push(_engine.user.key);
			} else {
				_engine.keys_tmp.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
			}
		});
		this.keys = this.keys_tmp;

	}

	showAmmoSkeleton(b) {
		var i = this.heros.length;
		while (i--) {
			if (this.heros[i].userData.avatar.physicSkeleton) {
				this.heros[i].userData.avatar.physicSkeleton.showPhyBones(b);
			}
		}
	}

	playSounds(b) {
		var i = this.objects.length;
		while (i--) {
			var o = this.objects[i];
			if (o.userData.hasOwnProperty('audios') && o.userData.hasOwnProperty('defaudio')) {
				o.userData.audios[o.userData.defaudio].play();
			}
		}
	}

	showHeroCapsule(b) {
		var i = this.heros.length;
		while (i--) {
			if (this.heros[i].userData.capsule) {
				this.heros[i].userData.capsule.visible = b;
			}
		}
	}

	showHero(v) {
		var i = this.heros.length;
		while (i--) { this.heros[i].visible = v; }
	}

	updateHero(delta) {
		var i = this.heros.length;
		while (i--) { this.heros[i].userData.avatar.update(delta); }
	}

	changeHero() {
		var newindex;
		if (this.view.camera == this.view.cameraInObj) {
			this.view.camera = this.view.cameraFree;
			newindex = 0;
			this.follow(this.moveObjNames[newindex]);
		} else {
			if (this.currentFollow != null) {
				var curIdx = this.moveObjNames.indexOf(this.currentFollow.name);
				newindex = curIdx + 1;
				if (newindex >= this.moveObjNames.length) {
					if (this.view.cameraInObj.parent != null) {
						this.view.camera = this.view.cameraInObj;
						this.currentFollow = null;
					} else {
						newindex = 0;
						this.follow(this.moveObjNames[newindex]);
					}
				} else {
					this.follow(this.moveObjNames[newindex]);
				}
			} else {
				this.view.camera = this.view.cameraInObj;
				this.currentFollow = null;
			}
		}
	}

	showTerrain(v) {
		var i = this.terrains.length;
		while (i--) { this.terrains[i].visible = v; }
	}

	showAxisHelper(v) {
		if (axisHelper) { axisHelper.visible = v; }
	}

	enableClickMeasure(b) {
		if (b == false) {
			if (this.sizeGroup != null) {
				for (var i = this.sizeDivs.length - 1; i >= 0; i--) {
					if (this.sizeDivs[i].parentNode) {
						this.sizeDivs[i].parentNode.removeChild(this.sizeDivs[i]);
					}
				}
				this.sizeDivs = [];
				for (var i = 0; i < this.sizeGroup.children.length; i++) {
					this.sizeGroup.remove(this.sizeGroup.children[i]);
				}


				this.sizeGroup.parent.remove(this.sizeGroup);
				this.sizeGroup = null;
			}
		}
		this.clickMeasureEnabled = b;
	}

	showPhysicInfo(v) {
		this.showPhyinfo = v;
	}

	getBBoxGeometry(obj) {
		var box = new THREE.Box3().setFromObject(obj);
		var width = box.max.x - box.min.x;
		var height = box.max.y - box.min.y;
		var depth = box.max.z - box.min.z;
		//得到group立方体边界的宽高和深度，根据这些值，生成一个立方几何体
		var bbox = new THREE.BoxGeometry(width, height, depth);
		return bbox;

	}

	getGeo() {
		return this.geo;
	}

	generateTexture(maxH, data, width, height, colors) {

		var canvas, canvasScaled, context, image, imageData, vector3, sun, shade;

		vector3 = new THREE.Vector3(0, 0, 0);

		sun = this.sunLight.position.clone();
		sun.normalize();

		canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		context = canvas.getContext('2d');
		context.fillStyle = '#000';
		context.fillRect(0, 0, width, height);

		image = context.getImageData(0, 0, canvas.width, canvas.height);
		imageData = image.data;
		for (var i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
			vector3.x = (data[j - 2] ? data[j - 2] : data[j]) - (data[j + 2] ? data[j + 2] : data[j]);
			vector3.y = 2;
			vector3.z = (data[j - width * 2] ? data[j - width * 2] : data[j]) - (data[j + width * 2] ? data[j + width * 2] : data[j]);
			vector3.normalize();
			shade = vector3.dot(sun);

			var curXS = data[j] / maxH;
			var curColorVal = 0x000000;
			for (var c = 0; c < colors.length; c++) {
				if (curXS <= colors[c].ratio) {
					curColorVal = colors[c].color;
					break;
				}
			}
			var tmColor = new THREE.Color(255, 255, 255);
			tmColor.setHex(curColorVal);

			imageData[i] = tmColor.r * 255 * shade;
			imageData[i + 1] = tmColor.g * 255 * shade;
			imageData[i + 2] = tmColor.b * 255 * shade;

			//imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
			//imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
			//imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );

		}

		context.putImageData(image, 0, 0);

		// Scaled 4x

		canvasScaled = document.createElement('canvas');
		canvasScaled.width = width * 4;
		canvasScaled.height = height * 4;

		context = canvasScaled.getContext('2d');
		context.scale(4, 4);
		context.drawImage(canvas, 0, 0);

		image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
		imageData = image.data;

		for (var i = 0, l = imageData.length; i < l; i += 4) {

			var v = ~ ~(Math.random() * 5);

			imageData[i] += v;
			imageData[i + 1] += v;
			imageData[i + 2] += v;

		}

		context.putImageData(image, 0, 0);

		return canvasScaled;

	}

	create_terrainc(curO) {
		var _engine = this;
		var o = {
			type: 'terrain',
			name: curO.name,
			pos: curO.position,
			size: curO.size,
			sample: curO.sample,
			complexity: curO.complexity,
			flipEdge: curO.flipEdge,
			hdt: curO.hdt,
			friction: curO.friction,
			restitution: curO.restitution,
			group: curO.group || 1
		};
		var i, x, y, n, c;

		o.sample = o.sample == undefined ? [64, 64] : o.sample;
		o.size = o.size == undefined ? [100, 10, 100] : o.size;
		o.pos = o.pos == undefined ? [0, 0, 0] : o.pos;

		o.lng = o.sample[0] * o.sample[1];
		o.hdata = new Float32Array(o.lng);
		var colors = new Float32Array(o.lng * 3);
		var g = new THREE.PlaneBufferGeometry(o.size[0], o.size[2], o.sample[0] - 1, o.sample[1] - 1);
		g.rotateX(-Math.PI90);
		var vertices = g.attributes.position.array;
		//===========================高度图测试==========================================================

		WTextures.make({
			url: curO.heightMapUrl, name: curO.name + '_hmap', onLoad: function (heightTexture) {
				var image = heightTexture.image;
				var scaleX = o.size[0];
				var scaleY = o.size[2];
				var scaleZ = o.size[1];
				var widthSegments = o.sample[0];
				var heightSegments = o.sample[1];
				var canvas = document.createElement('canvas');
				canvas.width = image.width;
				canvas.height = image.height;
				var context = canvas.getContext('2d');
				context.drawImage(image, 0, 0);
				var imageD = context.getImageData(0, 0, image.width, image.height);
				var pix = imageD.data;
				var j = 0;
				for (var i = 0, n = pix.length; i < n; i += (4)) {
					var all = pix[i] + pix[i + 1] + pix[i + 2];
					vertices[j * 3 + 1] = o.hdata[j++] = all / 3 / 255 * scaleZ;
					//o.hdata[j++] = all/ 3/ 255 * scaleZ;			
				}
				var terrainPos = new THREE.Vector3(o.pos[0], o.pos[1], o.pos[2]);
				//type:hdata,hmap,harray
				//var terrainSource = {type:'hmap',data:image};
				var terrainSource = { type: 'hdata', data: o.hdata };
				_engine.terrainData = new TerrainData(terrainPos, o.size[0], o.size[2], scaleZ, terrainSource, 1, o.sample[0], o.sample[1]);
				if (curO.hasOwnProperty("onTerrainObjects")) {
					_engine.createOnTerrainObjects(curO, terrainPos, terrainData);
				}

				//terrainData 测试 碰撞测试
				/*var s, x, y,z;
				for(var i = 0; i<100; i++){
					x = Math.rand(-800, 800);
					z = Math.rand(500, 2000);
					s = Math.rand(50, 100);
					y = terrainData.getHeightAt(x,z)+s/2;
					console.log("x="+x+" y="+y+" z="+z);
					this.add({ type:'box', size:[s,s,s],group:64, pos:[x,y,z], mass:0});
				}*/
				//=============================================
				/*
				o.dpos = o.dpos == undefined ? [0,0,0] : o.dpos;
				o.complexity = o.complexity == undefined ? 30 : o.complexity;
				if( !perlin ) perlin = new Perlin();
		
				var sc = 1 / o.complexity;
				var r = 1 / o.div[0];
				var rx = (o.div[0] - 1) / o.size[0];
				var rz = (o.div[1] - 1) / o.size[2];
				i = o.lng;
				while(i--){
					n = i * 3;
					x = i % o.div[0];
					y = ~~ ( i * r );
					c = 0.5 + ( perlin.noise( (x+(o.dpos[0]*rx))*sc, (y+(o.dpos[2]*rz))*sc ) * 0.5); // from 0 to 1
					//o.hdata[ i ] = c * o.size[ 1 ]; // final h size
					o.hdata[ i ] = 0.5;
					vertices[ n + 1 ] = o.hdata[i];
					colors[ n ] = c;
					colors[ n + 1 ] = c;
					colors[ n + 2 ] = c;
				}*/

				//g.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
				//g.computeBoundingSphere();
				//g.computeVertexNormals();


				var texture = new THREE.CanvasTexture(_engine.generateTexture(o.size[1], o.hdata, o.sample[0], o.sample[1], curO.colors));
				texture.wrapS = THREE.ClampToEdgeWrapping;
				texture.wrapT = THREE.ClampToEdgeWrapping;
				_engine.extraGeo.push(g);
				var terrainMaterial = new THREE.MeshPhongMaterial({ map: texture });
				BufferGeometryUtils.computeTangents(g);
				var mesh = new THREE.Mesh(g, terrainMaterial);
				mesh.userData = { maxH: o.size[1], hdata: o.hdata, width: o.sample[0], height: o.sample[1], colors: curO.colors };
				mesh.updateMaterial = function (m) {
					this.material.map.image = _engine.generateTexture(this.userData.maxH,
						this.userData.hdata,
						this.userData.width,
						this.userData.height,
						this.userData.colors);
					this.material.map.needsUpdate = true;
				};
				//==========================================================================


				//var mesh = new THREE.Mesh( g, mat['basic'] );
				mesh.position.set(o.pos[0], o.pos[1], o.pos[2]);
				//mesh.visible = false;
				mesh.castShadow = false;
				mesh.receiveShadow = true;
				_engine.terrains.push(mesh);
				o.mesh = mesh;
				_engine.add(o);

			}
		});
	};

	//添加对象
	addObject(_obj, bAddVisual) {
		this.objects.push(_obj);
		if (bAddVisual) this.view.addVisual(_obj);
	}


	//创建二维平面-长方形
	createPlaneGeometry(_obj) {
		//_obj={           
		//    width:0,
		//    height:0,
		//    pic:"",
		//    transparent:true,
		//    opacity:1
		//    blending:false,
		//position: { x:,y:,z:},
		//rotation: { x:,y:,z:},
		//}
		var tmMat = null;
		if (_obj.material) {
			tmMat = this.view.getMaterial(_obj.material);
		} else {
			if (typeof _obj.pic == "string") {//传入的材质是图片路径，使用 textureloader加载图片作为材质
				var texture = WTextures.make({ url: _obj.pic, name: _obj.name });
			} else {
				var texture = new THREE.CanvasTexture(_obj.pic)
			}
			var MaterParam = {//材质的参数
				map: texture,
				side: THREE.FrontSide,
				//blending: THREE.AdditiveBlending,
				transparent: _obj.transparent,
				//needsUpdate:true,
				//premultipliedAlpha: true,
				opacity: _obj.opacity
			}
			if (_obj.blending) {
				MaterParam.blending = THREE.AdditiveBlending//使用饱和度叠加渲染
			}
			tmMat = new THREE.MeshBasicMaterial(MaterParam);
		}


		var plane = new THREE.Mesh(new THREE.PlaneGeometry(_obj.width, _obj.height, 1, 1), tmMat);
		plane.position.x = _obj.position.x;
		plane.position.y = _obj.position.y;
		plane.position.z = _obj.position.z;
		plane.rotation.x = _obj.rotation.x;
		plane.rotation.y = _obj.rotation.y;
		plane.rotation.z = _obj.rotation.z;
		return plane;
	}
	//创建玻璃
	createGlasses(_obj) {
		var tmpobj = this.createPlaneGeometry(_obj);
		this.addObject(tmpobj);
		_obj.rotation.y = Math.PI + _obj.rotation.y;
		var tmpobj2 = this.createPlaneGeometry(_obj);
		this.addObject(tmpobj2, true);
	};


	//挖洞
	createHole(_obj, bSetPos) {

		var _commonThick = 0.4;//墙体厚度
		var _commonLength = 1;//墙体长度
		var _commonHeight = 3;//墙体高度
		var _commonSkin = 0x98750f;
		//建立墙面
		var wallLength = _commonLength;
		var wallWidth = _obj.thick || _commonThick;
		var positionX = ((_obj.startDot.x || 0) + (_obj.endDot.x || 0)) / 2;
		var positionY = ((_obj.startDot.y || 0) + (_obj.endDot.y || 0)) / 2;
		var positionZ = ((_obj.startDot.z || 0) + (_obj.endDot.z || 0)) / 2;
		//z相同 表示x方向为长度
		if (_obj.startDot.z == _obj.endDot.z) {
			wallLength = Math.abs(_obj.startDot.x - _obj.endDot.x);
			wallWidth = _obj.thick || _commonThick;
		} else if (_obj.startDot.x == _obj.endDot.x) {
			wallLength = _obj.thick || _commonThick;
			wallWidth = Math.abs(_obj.startDot.z - _obj.endDot.z);
		}
		var cubeobj = {
			size: [wallLength, (_obj.height || _commonHeight), wallWidth],
			rotation: _obj.rotation,
			position: [positionX, positionY, positionZ],
			uuid: _obj.uuid,
			name: _obj.name,
			style: {
				skinColor: _commonSkin,
				skin: _obj.skin
			}
		}
		var _cube = this.createCube(cubeobj, bSetPos);
		_cube.userData = { size: cubeobj.size, position: cubeobj.position };
		return _cube;
	}

	//模型合并 使用ThreeBSP插件mergeOP计算方式 -表示减去 +表示加上 
	mergeModel(mergeOP, _fobj, _sobj, exparam) {

		var fobjBSP = new ThreeBSP(_fobj);
		var sobjBSP = new ThreeBSP(_sobj);
		var resultBSP = null;
		if (mergeOP == '-') {
			resultBSP = fobjBSP.subtract(sobjBSP);
		} else if (mergeOP == '+') {
			resultBSP = fobjBSP.union(sobjBSP);
		} else if (mergeOP == '#') {
			_sobj.updateMatrix();
			var g1 = new Geometry().fromBufferGeometry(_fobj.geometry);
			var g2 = new Geometry().fromBufferGeometry(_sobj.geometry);
			g1.merge(g2, _sobj.matrix);
			_fobj.geometry = g1.toBufferGeometry();
			return _fobj;
		} else if (mergeOP == '&') {//交集
			resultBSP = fobjBSP.intersect(sobjBSP);
		} else {
			return _fobj;
		}

		var tmMat = null;
		if (exparam) {
			if (exparam.matname) {
				tmMat = this.view.getMaterial(exparam.matname);
			} else {
				tmMat = new THREE.MeshPhongMaterial(exparam.style);
			}
		}


		var result = resultBSP.toMesh(tmMat);
		result.material.flatShading = true;
		result.geometry.computeFaceNormals();
		result.geometry.computeVertexNormals();
		result.uuid = _fobj.uuid + mergeOP + _sobj.uuid;
		result.name = _fobj.name + mergeOP + _sobj.name;
		result.material.needsUpdate = true;
		result.geometry.buffersNeedUpdate = true;
		result.geometry.uvsNeedUpdate = true;
		/*if(exparam){		
				var wallpath = exparam.path;
			var skin = exparam.skin;
			for (var i = 0; i < result.geometry.faces.length; i++) {
				var curFace = result.geometry.faces[i];
				if(wallpath){
					var inSideWall = false;
					var va = result.geometry.vertices[curFace.a];
					var vb = result.geometry.vertices[curFace.b];
					var vc = result.geometry.vertices[curFace.c];
					var polypath = [];
					for(var j=0,jl=wallpath.length;j<jl;j++){
					  polypath.push({x:wallpath[j][0],y:wallpath[j][0]});
					}
					inSideWall = this.PointInPoly({x:va.x,y:va.z},polypath) && this.PointInPoly({x:vb.x,y:vb.z},polypath) && this.PointInPoly({x:vc.x,y:vc.z},polypath);
					if(inSideWall){
					   curFace.color.setHex(skin.skin_behind.skinColor);	
					}else{
					  if(curFace.normal.y=1){
						  curFace.color.setHex(skin.skin_up.skinColor);
					  }else if(curFace.normal.y=-1){
						  curFace.color.setHex(skin.skin_down.skinColor);
					  }else{
						  curFace.color.setHex(skin.skin_fore.skinColor);	
					  }
					}
				}
			}
		}*/

		result.castShadow = true;
		result.receiveShadow = true;
		return result;
	}

	PointInPoly(pt, poly) {
		for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
			((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && (c = !c);
		return c;
	}

	//创建盒子体
	createCube(_obj, bSetPos) {
		var _width = _obj.size[0] || 1000;//默认1000
		var _depth = _obj.size[2] || _width;
		var _height = _obj.size[1] || 10;
		var _x = _obj.position[0] || 0, _y = _obj.position[1] || 0, _z = _obj.position[2] || 0;
		var skinColor = _obj.style.skinColor || 0x98750f;
		var cubeGeometry = new Geometry().fromBufferGeometry(new THREE.BoxGeometry(_width, _height, _depth, 1, 1, 1));

		//六面颜色
		for (var i = 0; i < cubeGeometry.faces.length; i += 2) {
			var hex = skinColor || Math.random() * 0x531844;
			cubeGeometry.faces[i].color.setHex(hex);
			cubeGeometry.faces[i + 1].color.setHex(hex);
		}
		//六面纹理
		var skin_up_obj = {
			vertexColors: THREE.FaceColors
		}
		var skin_down_obj = skin_up_obj,
			skin_fore_obj = skin_up_obj,
			skin_behind_obj = skin_up_obj,
			skin_left_obj = skin_up_obj,
			skin_right_obj = skin_up_obj;
		var skin_opacity = 1;
		if (_obj.style != null && typeof (_obj.style) != 'undefined'
			&& _obj.style.skin != null && typeof (_obj.style.skin) != 'undefined') {
			//透明度
			if (_obj.style.skin.opacity != null && typeof (_obj.style.skin.opacity) != 'undefined') {
				skin_opacity = _obj.style.skin.opacity;
				console.log(skin_opacity)
			}
			//上
			skin_up_obj = this.createSkinOptionOnj(_width, _depth, _obj.style.skin.skin_up, cubeGeometry, 4);
			//下
			skin_down_obj = this.createSkinOptionOnj(_width, _depth, _obj.style.skin.skin_down, cubeGeometry, 6);
			//前
			skin_fore_obj = this.createSkinOptionOnj(_width, _height, _obj.style.skin.skin_fore, cubeGeometry, 0);
			//后
			skin_behind_obj = this.createSkinOptionOnj(_width, _height, _obj.style.skin.skin_behind, cubeGeometry, 2);
			//左
			skin_left_obj = this.createSkinOptionOnj(_depth, _height, _obj.style.skin.skin_left, cubeGeometry, 8);
			//右
			skin_right_obj = this.createSkinOptionOnj(_depth, _height, _obj.style.skin.skin_right, cubeGeometry, 10);
		}
		var cubeMaterialArray = [];
		cubeMaterialArray.push(new THREE.MeshLambertMaterial(skin_fore_obj));
		cubeMaterialArray.push(new THREE.MeshLambertMaterial(skin_behind_obj));
		cubeMaterialArray.push(new THREE.MeshLambertMaterial(skin_up_obj));
		cubeMaterialArray.push(new THREE.MeshLambertMaterial(skin_down_obj));
		cubeMaterialArray.push(new THREE.MeshLambertMaterial(skin_right_obj));
		cubeMaterialArray.push(new THREE.MeshLambertMaterial(skin_left_obj));
		var bfGeo = cubeGeometry.toBufferGeometry();
		bfGeo.parameters = {
			width: _width,
			height: _height,
			depth: _depth,
			widthSegments: 1,
			heightSegments: 1,
			depthSegments: 1
		};
		var cube = new THREE.Mesh(bfGeo, cubeMaterialArray);
		cube.castShadow = true;
		cube.receiveShadow = true;
		cube.uuid = _obj.uuid;
		cube.name = _obj.name;
		bSetPos && cube.position.set(_x, _y, _z);
		if (_obj.rotation != null && typeof (_obj.rotation) != 'undefined' && _obj.rotation.length > 0) {
			_obj.rotation.forEach(function (rotation_obj, index) {
				switch (rotation_obj.direction) {
					case 'x':
						cube.rotateX(rotation_obj.degree);
						break;
					case 'y':
						cube.rotateY(rotation_obj.degree);
						break;
					case 'z':
						cube.rotateZ(rotation_obj.degree);
						break;
					case 'arb':
						cube.rotateOnAxis(new THREE.Vector3(rotation_obj.degree[0], rotation_obj.degree[1], rotation_obj.degree[2]), rotation_obj.degree[3]);
						break;
				}
			});
		}

		return cube;
	}



	//创建空柜子
	createEmptyCabinet(_obj) {
		/* 参数demo
		{
		show:true,
		name: 'test',
		uuid: 'test',
	   rotation: [{ direction: 'y', degree: 0.25*Math.PI}],//旋转     uuid:'',
		objType: 'emptyCabinet',
		transparent:true,
		size:{length:50,width:60,height:200, thick:2},
		position: { x: -220, y: 105, z: -150 },
		doors: {
			doorType:'lr',// ud门 lr左右门
			doorSize:[1],
			skins:[ {
				skinColor: 0x333333,
				skin_fore: {
					imgurl: "../datacenterdemo/res/rack_door_back.jpg",
				},
				skin_behind: {
					imgurl: "../datacenterdemo/res/rack_front_door.jpg",
				}
			}]
		},
		skin:{
				skinColor: 0xdddddd,
			    
					skin:{
								skinColor: 0xdddddd,
								skin_up: { imgurl: "../datacenterdemo/res/rack_door_back.jpg" },
								skin_down: { imgurl: "../datacenterdemo/res/rack_door_back.jpg" },
								skin_fore: { imgurl: "../datacenterdemo/res/rack_door_back.jpg" },
								skin_behind: { imgurl: "../datacenterdemo/res/rack_door_back.jpg" },
								skin_left: { imgurl: "../datacenterdemo/res/rack_door_back.jpg" },
								skin_right: { imgurl: "../datacenterdemo/res/rack_door_back.jpg" },
					}
		    
			}
	  }
		*/
		var bLength = _obj.size[0], bHeight = _obj.size[1], bWidth = _obj.size[2], bThick = _obj.size[3];
		//创建五个面
		//上
		var upobj = {
			show: true,
			uuid: "",
			name: '',
			objType: 'cube',
			size: [(bLength + 0.01), (bThick + 0.01), bWidth],
			position: [0.01, (bHeight / 2 - bThick / 2), 0],
			style: {
				skinColor: _obj.skin.skinColor,
				skin: _obj.skin.skin_up.skin
			}
		}
		var upcube = this.createCube(upobj, true);
		//左
		var leftobj = {
			show: true,
			uuid: "",
			name: '',
			objType: 'cube',
			size: [bLength, bHeight, bThick],
			position: [0, -(bHeight / 2 - bThick / 2), (0 - (bWidth / 2 - bThick / 2) - 0.01)],
			style: {
				skinColor: _obj.skin.skinColor,
				skin: _obj.skin.skin_left.skin
			}
		}
		var leftcube = this.createCube(leftobj, true);
		var Cabinet = this.mergeModel('#', upcube, leftcube);
		//右
		var Rightobj = {
			show: true,
			uuid: "",
			name: '',
			objType: 'cube',
			size: [bLength, bHeight, bThick],
			position: [0, -(bHeight / 2 - bThick / 2), ((bWidth / 2 - bThick / 2) + 0.01)],
			style: {
				skinColor: _obj.skin.skinColor,
				skin: _obj.skin.skin_right.skin
			}
		}
		var Rightcube = this.createCube(Rightobj, true);
		Cabinet = this.mergeModel('#', Cabinet, Rightcube);
		//后
		var Behidobj = {
			show: true,
			uuid: "",
			name: '',
			objType: 'cube',
			size: [bThick, bHeight, bWidth],
			position: [((bLength / 2 - bThick / 2) + 0.01), -(bHeight / 2 - bThick / 2), 0],
			style: {
				skinColor: _obj.skin.skinColor,
				skin: _obj.skin.skin_behind.skin
			}
		}
		var Behindcube = this.createCube(Behidobj, true);
		Cabinet = this.mergeModel('#', Cabinet, Behindcube);
		//下
		var Downobj = {
			show: true,
			uuid: "",
			name: '',
			objType: 'cube',
			size: [(bLength + 0.01), bThick, bWidth],
			position: [-0.01, (-(bHeight - bThick) - 0.01), 0],
			style: {
				skinColor: _obj.skin.skinColor,
				skin: _obj.skin.skin_down.skin
			}
		}
		var Downcube = this.createCube(Downobj, true);
		Cabinet = this.mergeModel('#', Cabinet, Downcube);
		var tempobj = new THREE.Group();
		tempobj.add(Cabinet);
		tempobj.name = _obj.name;
		tempobj.uuid = _obj.uuid;
		Cabinet.name = _obj.shellname,
			this.objects.push(Cabinet);
		//tempobj.position = Cabinet.position;
		//tempobj.position = Cabinet.position;
		//门
		if (_obj.doors != null && typeof (_obj.doors) != 'undefined') {
			var doors = _obj.doors;
			if (doors.skins.length == 1) {//单门
				var singledoorobj = {
					show: true,
					uuid: "",
					name: _obj.doors.doorname[0],
					objType: 'cube',
					size: [bThick, bHeight, bWidth],
					position: [(- bLength / 2 - bThick / 2), 0, 0],
					style: {
						skinColor: _obj.doors.skins[0].skinColor,
						skin: _obj.doors.skins[0]
					}
				}
				var singledoorcube = this.createCube(singledoorobj, true);
				this.objects.push(singledoorcube);
				tempobj.add(singledoorcube);
			} else if (doors.skins.length > 1) {//多门


			}

		}

		if (_obj.rotation != null && typeof (_obj.rotation) != 'undefined' && _obj.rotation.length > 0) {
			_obj.rotation.forEach(function (rotation_obj, index) {
				switch (rotation_obj.direction) {
					case 'x':
						tempobj.rotateX(rotation_obj.degree);
						break;
					case 'y':
						tempobj.rotateY(rotation_obj.degree);
						break;
					case 'z':
						tempobj.rotateZ(rotation_obj.degree);
						break;
					case 'arb':
						tempobj.rotateOnAxis(new THREE.Vector3(rotation_obj.degree[0], rotation_obj.degree[1], rotation_obj.degree[2]), rotation_obj.degree[3]);
						break;
				}
			});
		}
		return tempobj;
	}

	//创建皮肤参数对象
	createSkinOptionOnj(flength, fwidth, _obj, _cube, _cubefacenub) {
		if (this.commonFunc.hasObj(_obj)) {
			if (this.commonFunc.hasObj(_obj.imgurl)) {
				return { map: this.createSkin(flength, fwidth, _obj), transparent: true };
			} else {
				if (this.commonFunc.hasObj(_obj.skinColor)) {
					_cube.faces[_cubefacenub].color.setHex(_obj.skinColor);
					_cube.faces[_cubefacenub + 1].color.setHex(_obj.skinColor);
				}
				return { vertexColors: THREE.FaceColors };
			}
		} else {
			return { vertexColors: THREE.FaceColors };
		}
	};

	//创建皮肤
	createSkin(flength, fwidth, _obj) {
		var imgwidth = 128, imgheight = 128;
		if (_obj.width != null && typeof (_obj.width) != 'undefined') {
			imgwidth = _obj.width;
		}
		if (_obj.height != null && typeof (_obj.height) != 'undefined') {
			imgheight = _obj.height;
		}
		var texture = WTextures.make({ url: _obj.imgurl, name: _obj.name });
		var _repeat = false;
		if (_obj.repeatx != null && typeof (_obj.repeatx) != 'undefined' && _obj.repeatx == true) {
			texture.wrapS = THREE.RepeatWrapping;
			_repeat = true;
		}
		if (_obj.repeaty != null && typeof (_obj.repeaty) != 'undefined' && _obj.repeaty == true) {
			texture.wrapT = THREE.RepeatWrapping;
			_repeat = true;
		}
		if (_repeat) {
			texture.repeat.set(flength / imgheight, fwidth / imgheight);
		}
		return texture;
	}




	//=============================================================================================
	//=============================================================================================
	has(name) {
		return this.physic.has(name);
	}
	byName(name) {
		return this.physic.byName(name);
	}
	add(o) {
		//对配置进行修补
		o.mass = o.mass == undefined ? 0 : o.mass;
		o.type = o.type == undefined ? 'box' : o.type;
		if (o.mass == 0 && o.type != 'character') o.group = 2;
		if (o.position) {
			o.pos = o.position;
			delete (o.position);
		}
		o.pos = o.pos == undefined ? [0, 0, 0] : o.pos;
		if (o.name != 'pathfindzone') {
			if (o.pos) { o.pos = this.offsetPos(o.pos); } else { o.pos = this.offsetPos([0, 0, 0]); }
		}
		var rot = o.rot = o.rot == undefined ? [0, 0, 0] : o.rot;
		var hasBlockSize = (o.size == undefined && o.blockSize == undefined) ? false : true;
		o.size = o.size == undefined ? [1, 1, 1] : o.size;
		if (o.size.length == 1) {
			o.size[1] = o.size[0];
		} else if (o.size.length == 2) { o.size[2] = o.size[0]; }

		if (o.geoSize) {
			if (o.geoSize.length == 1) { o.geoSize[1] = o.geoSize[0]; }
			if (o.geoSize.length == 2) { o.geoSize[2] = o.geoSize[0]; }
		}
		//解析材质
		var material;
		if (o.flag === 2) {
			material = this.view.getMaterial('kinect');
		} else if (o.material !== undefined) {
			if (o.material.constructor === String) {
				if ("random" == o.material) {
					material = this.createColorMaterial();
				} else {
					material = this.view.getMaterial(o.material);
				}
			}
			else {
				material = o.material;
			}

		} else {

			if (o.mass === 0 && !o.kinematic) material = this.view.getMaterial('static');
			else material = this.view.getMaterial('move');
			if (o.kinematic) material = this.view.getMaterial('kinematic');
		}
		o.material = material;

		var viewO = this.physic.add(o);
		if (o.roadblock) {
			var blockSize = o.blockSize == undefined ? o.size : o.blockSize;
			if (hasBlockSize) {
				this.ddlsObj[this.ddlsObj.length] = this.ddlsworld.addObject({ x: o.pos[0], y: o.pos[2], w: blockSize[0] * 0.5, h: blockSize[2] * 0.5, r: rot[1] });
			} else {
				var box = new THREE.Box3().setFromObject(viewO);
				this.ddlsObj[this.ddlsObj.length] = this.ddlsworld.addObject({ x: o.pos[0], y: o.pos[2], w: (box.max.x - box.min.x) * 0.5, h: (box.max.z - box.min.z) * 0.5, r: rot[1] });
			}
		}
		return viewO;
	}
	addGroup(oAry) {
		for (var i = 0; i < oAry.length; i++) {
			if (oAry[i].name != 'pathfindzone') {
				if (oAry[i].pos) { oAry[i].pos = this.offsetPos(oAry[i].pos); } else { oAry[i].pos = this.offsetPos([0, 0, 0]); }
			}
		}
		this.physic.addGroup(oAry);
	}
	options(o, direct) {
		this.physic.options(o, direct);
	}
	offsetPos(pos) {
		return [pos[0] + this.ddlsOffset.x, pos[1] + this.ddlsOffset.y, pos[2] + this.ddlsOffset.z];
	}
	//=====================================================
	//创建区域开始
	//=====================================================
	create_custom(curO) {
		curO.customFunc();
	}
	create_superSky(curO) {
		var sky;
		var sets_S = {
			t: 0,
			fog: 0,
			cloud_size: .45,
			cloud_covr: .3,
			cloud_dens: 40,

			inclination: 45,//倾斜度
			azimuth: 90,//地平经度
			hour: 12,

		};
		var onSkyReady = function () {
			sky.setData(sets_S);
			var t = terrains.length;
			while (t--) {
				terrains[t].material.envMap = sky.envMap;
				terrains[t].borderMaterial.envMap = sky.envMap;
			}
			var w = waters.length;
			while (w--) {
				waters[w].material.uniforms.sunDirection.value.copy(sky.day > 0 ? sky.sunPosition : sky.moonPosition);
				waters[w].material.uniforms.sunColor.value = sky.day > 0 ? sky.sun.color : sky.moon.color;
			}
		};
		sky = new SuperSky({ scene: this.view.scene, renderer: this.view.renderer, size: 100, callback: onSkyReady });

		this.view.addVisual(sky);
		statics.push(sky);
	}
	create_sky(curO) {
		var sky = new Sky();
		sky.scale.setScalar(450000);
		this.sky = sky;
		this.view.scene.add(sky);
		var sunSphere = new THREE.Mesh(
			new THREE.SphereBufferGeometry(20000, 16, 8),
			new THREE.MeshBasicMaterial({ color: 0xffffff })
		);
		sunSphere.position.y = - 700000;
		sunSphere.visible = curO.sunVisible;
		this.sunSphere = sunSphere;
		this.view.scene.add(sunSphere);
		this.statics.push(sunSphere);
		var uniforms = sky.material.uniforms;

		uniforms['turbidity'].value = 10;
		uniforms['rayleigh'].value = 2;
		uniforms['luminance'].value = 1;
		uniforms['mieCoefficient'].value = 0.005;
		uniforms['mieDirectionalG'].value = 0.8;

		//===
		this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
		this.sunLight.castShadow = true;
		this.sunLight.shadow.camera.near = curO.shadowCamera.near;
		this.sunLight.shadow.camera.far = curO.shadowCamera.far;
		this.sunLight.shadow.camera.left = curO.shadowCamera.left;
		this.sunLight.shadow.camera.right = curO.shadowCamera.right;
		this.sunLight.shadow.camera.top = curO.shadowCamera.top;
		this.sunLight.shadow.camera.bottom = curO.shadowCamera.bottom;

		this.sunLight.shadow.mapSize.x = curO.shadowMapSize[0];
		this.sunLight.shadow.mapSize.y = curO.shadowMapSize[1];
		this.sunLight.shadow.bias = -0.003;
		this.sunLight.position.y = -curO.distance;
		this.sunLight.distance = curO.distance;
		if (this.has('pathfindzone')) {
			this.sunLight.target = this.byName('pathfindzone');
		} else {
			this.sunLight.target.position.set(0, 0, 0);
		}



		/*var textureFlare3 = WTextures.make({url:"sky/lensflare3.png",name:'lensflare3'});
		var lensflare = new Lensflare();
		lensflare.addElement( new LensflareElement( WTextures.make({url:"sky/lensflare0.png",name:'lensflare0'}), 100*0.1, 0, this.sunLight.color ) );
		lensflare.addElement( new LensflareElement( textureFlare3, 60, 0.6, this.sunLight.color ) );
		lensflare.addElement( new LensflareElement( textureFlare3, 70, 0.7, this.sunLight.color ) );
		lensflare.addElement( new LensflareElement( textureFlare3, 120, 0.9, this.sunLight.color ) );
		lensflare.addElement( new LensflareElement( textureFlare3, 70, 1, this.sunLight.color ) );
		this.sunLight.add(lensflare);*/

		this.view.addVisual(this.sunLight);

		var dirLightHeper = new THREE.DirectionalLightHelper(this.sunLight, 10);
		dirLightHeper.visible = false;

		this.lightHelpers.push(dirLightHeper);
		this.view.addVisual(dirLightHeper);

		this.objects.push(this.sunSphere);
		this.objects.push(this.sunLight);
		this.objects.push(dirLightHeper);

		this.setHour(curO.hour);
	}
	create_compass(curO) {
		var _engine = this;
		WTextures.make({
			url: curO.texture.url, name: curO.name, onLoad: function (texture) {
				var spriteMaterial = new THREE.SpriteMaterial({ map: texture, opacity: 1 });
				_engine.compass = new THREE.Sprite(spriteMaterial);
				var width = spriteMaterial.map.image.width;
				var height = spriteMaterial.map.image.height;
				_engine.compass.scale.set(width, height, 1);
				_engine.compass.position.set((-window.innerWidth / 2) + width / 2, (window.innerHeight / 2) - height / 2, 0);
				_engine.view.sceneRenderHUDSprite.add(_engine.compass);

				var renderFunction = function () {
					spriteMaterial.rotation = _engine.compassAngle;
				};
				_engine.scene.loopFunctions.push(renderFunction);
			}
		});
	}
	create_fog(curO) {
		this.view.addFog(curO);
	}
	create_snow(curO) {
		var particles, snowGeometry, materials = [], parameters, i, h, color, sprite, size;
		snowGeometry = new THREE.Geometry();
		var sprite1 = WTextures.make({ url: 'sprites/snowflake1.png', name: 'snowflake1' });
		var sprite2 = WTextures.make({ url: 'sprites/snowflake2.png', name: 'snowflake2' });
		var sprite3 = WTextures.make({ url: 'sprites/snowflake3.png', name: 'snowflake3' });
		var sprite4 = WTextures.make({ url: 'sprites/snowflake4.png', name: 'snowflake4' });
		var sprite5 = WTextures.make({ url: 'sprites/snowflake5.png', name: 'snowflake5' });

		for (i = 0; i < 10000; i++) {

			var vertex = new THREE.Vector3();
			vertex.x = Math.random() * curO.size[0] - curO.size[0] * 0.5;
			vertex.y = Math.random() * curO.size[1] - curO.size[1] * 0.5;
			vertex.z = Math.random() * curO.size[2] - curO.size[2] * 0.5;

			snowGeometry.vertices.push(vertex);

		}
		var scale = 0.01;
		parameters = [
			[[1.0, 0.2, 0.5], sprite2, 20 * scale],
			[[0.95, 0.1, 0.5], sprite3, 15 * scale],
			[[0.90, 0.05, 0.5], sprite1, 10 * scale],
			[[0.85, 0, 0.5], sprite5, 8 * scale],
			[[0.80, 0, 0.5], sprite4, 5 * scale]
		];

		for (i = 0; i < parameters.length; i++) {

			color = parameters[i][0];
			sprite = parameters[i][1];
			size = parameters[i][2];

			materials[i] = new THREE.PointsMaterial({ size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true });
			materials[i].color.setHSL(color[0], color[1], color[2]);

			particles = new THREE.Points(snowGeometry, materials[i]);

			particles.rotation.x = Math.random() * 6;
			particles.rotation.y = Math.random() * 6;
			particles.rotation.z = Math.random() * 6;

			this.view.addVisual(particles);
			statics.push(particles);
		}

		var renderFunction = function () {
			var time = Date.now() * 0.00005;
			for (i = 0; i < this.view.scene.children.length; i++) {
				var object = this.view.scene.children[i];
				if (object instanceof THREE.Points) {
					object.rotation.y = time * (i < 4 ? i + 1 : - (i + 1));
				}
			}
			for (i = 0; i < materials.length; i++) {
				color = parameters[i][0];
				h = (360 * (color[0] + time) % 360) / 360;
				materials[i].color.setHSL(h, color[1], color[2]);
			}
		};
		this.scene.loopFunctions.push(renderFunction);
	}
	create_terrain(curO) {
		var o = {
			type: curO.type,
			terrainType: curO.terrainType,
			name: curO.name,
			pos: curO.position, // terrain position
			size: curO.size, // terrain size in meter
			sample: curO.sample, // number of subdivision
			frequency: curO.frequency, // frequency of noise
			level: curO.level, // influence of octave
			expo: curO.expo || 0,
			hdt: curO.hdt || 'PHY_FLOAT', // height data type PHY_FLOAT, PHY_UCHAR, PHY_SHORT
			friction: curO.friction || 0.5,
			bounce: curO.bounce || 0.0,
			water: curO.water || false,
			border: curO.border || true,
			bottom: curO.bottom || true,
			heightMapUrl: curO.heightMapUrl,
			maxSpeed: curO.maxSpeed || 0.02
		};
		var _engine = this;
		o.physicsUpdate = function (name, heightData, terrainMesh) {
			var terrainPos = new THREE.Vector3(o.pos[0], o.pos[1], o.pos[2]);
			var terrainSource = { type: 'hdata', data: heightData };
			_engine.terrainData = new TerrainData(terrainPos, o.size[0], o.size[2], o.size[1], terrainSource, 1, o.sample[0], o.sample[1]);
			if (curO.hasOwnProperty("onTerrainObjects")) {
				_engine.createOnTerrainObjects(curO, terrainPos, _engine.terrainData);
			}
		};
		var terrainO = this.add(o);
		this.terrains.push(terrainO);
	}
	create_water(curO) {
		var waterGeometry = new THREE.PlaneBufferGeometry(curO.size[0], curO.size[1]);

		if (curO.waterType == 'ocean') {
			var sets_W = {
				textureWidth: 512,
				textureHeight: 512,
				waterNormals: this.view.texture({ url: 'water/waternormals.jpg', name: 'waternormals', repeat: [2, 2], anisotropy: 16 }),
				alpha: 0.5,
				sunDirection: this.sunLight.position.clone().normalize(),
				sunColor: 0xffffff,
				waterColor: 0x001e0f,
				distortionScale: 3.7,
				fog: this.view.scene.fog !== undefined
			};
			var water = new Water(waterGeometry, sets_W);
			water.rotation.x = - Math.PI / 2;
			water.position.set(curO.position[0], curO.position[1], curO.position[2]);
			water.position.add(this.ddlsOffset);
			water.castShadow = true;
			water.receiveShadow = true;
			this.view.addVisual(water);
			waters.push(water);
			statics.push(water);
			var renderFunction = function () {
				water.material.uniforms['time'].value += 1.0 / 60.0;
			};
			this.scene.loopFunctions.push(renderFunction);
		} else if (curO.waterType == 'water') {
			var params = {
				color: '#ffffff',
				scale: 4,
				flowX: 1,
				flowY: 1
			};
			//1024
			var water2 = new Water2(waterGeometry, {
				color: params.color,
				scale: params.scale,
				flowDirection: new THREE.Vector2(params.flowX, params.flowY),
				textureWidth: 512,
				textureHeight: 512
			});
			water2.rotation.x = - Math.PI / 2;
			water2.position.set(curO.position[0], curO.position[1], curO.position[2]);
			water2.position.add(this.ddlsOffset);
			water2.castShadow = true;
			water2.receiveShadow = true;

			this.view.addVisual(water2);
			this.waters.push(water2);
			this.statics.push(water2);
		}
	}
	create_rollercoaster(curO) {
		var PI2 = Math.PI * 2;
		var curve = (function () {
			var vector = new THREE.Vector3();
			return {
				getPointAt: curO.getPointAt,
				getTangentAt: function (t) {
					var delta = 0.0001;
					var t1 = Math.max(0, t - delta);
					var t2 = Math.min(1, t + delta);
					return vector.copy(this.getPointAt(t2)).sub(this.getPointAt(t1)).normalize();
				}
			};

		})();

		var geometry = new RollerCoasterGeometry(curve, curO.segments[0]);
		var material = new THREE.MeshStandardMaterial({
			roughness: 0.1,
			metalness: 0,
			vertexColors: THREE.VertexColors
		});
		var mesh = new THREE.Mesh(geometry, material);
		mesh.castShadow = true;
		this.view.addVisual(mesh);
		statics.push(mesh);
		if (curO.haslifter) {
			var geometry = new RollerCoasterLiftersGeometry(curve, curO.segments[1], curO.nolifter);
			var material = new THREE.MeshStandardMaterial({
				roughness: 0.1,
				metalness: 0
			});
			var mesh = new THREE.Mesh(geometry, material);
			mesh.position.y = 0.1;
			mesh.castShadow = true;
			this.view.addVisual(mesh);
			statics.push(mesh);
		}

		var train = new THREE.Object3D();
		train.halfExtent = { x: 0, y: 0, z: 0 };
		//this.view.camera.rotation.y = Math.PI;
		train.add(this.view.cameraInObj);
		this.view.addVisual(train);
		statics.push(train);
		var position = new THREE.Vector3();
		var tangent = new THREE.Vector3();

		var lookAt = new THREE.Vector3();

		var velocity = 0;
		var progress = 0;

		var renderFunction = function (delta) {
			var delta2 = delta * driveSpeed;

			//

			progress += velocity * delta2;
			progress = progress % 1;

			position.copy(curve.getPointAt(progress));
			position.y += 3 * 0.1;

			train.position.copy(position);

			tangent.copy(curve.getTangentAt(progress));

			velocity -= tangent.y * 0.0000015 * delta2;
			velocity = Math.max(velocity, 0.00004);

			train.lookAt(lookAt.copy(position).sub(tangent));
		};
		this.scene.loopFunctions.push(renderFunction);
	}
	create_plane(curO) {
		this.add({
			type: 'plane',
			name: curO.name || Math.generateUUID(),
			mass: curO.mass,
			pos: curO.position,
			rot: curO.rot,
			group: curO.group || 1,
			friction: 0.5,
			restitution: 0.9
		}); // infinie plane	
	}
	create_hardbox(curO) {
		if (curO.hasOwnProperty("conFunc")) {
			var confs = curO.conFunc();
			for (var i = 0, il = confs.length; i < il; i++) {
				this.add(confs[i]);
			}
		} else {
			if (curO.hasOwnProperty("positions")) {
				for (var i = 0, il = curO.positions.length; i < il; i++) {
					var rot = curO.rot || [0, 0, 0];
					this.add({
						type: curO.type,
						name: Math.generateUUID(),
						roadblock: curO.roadblock,
						size: curO.size,
						mass: curO.mass,
						pos: curO.positions[i],
						sounds: curO.sounds || null,
						rot: [rot[0], rot[1], rot[2]],
						group: curO.group || 1,
						breakable: curO.breakable || false,
						breakOption: curO.breakOption !== undefined ? curO.breakOption : [250, 1, 2, 1],
						friction: 0.5,
						restitution: 0.9,
						material: curO.material
					});
				}
			} else {
				this.add({
					type: curO.type,
					name: curO.name || Math.generateUUID(),
					roadblock: curO.roadblock,
					size: curO.size,
					mass: curO.mass,
					pos: curO.position,
					sounds: curO.sounds || null,
					rot: curO.rot,
					group: curO.group || 1,
					breakable: curO.breakable || false,
					breakOption: curO.breakOption !== undefined ? curO.breakOption : [250, 1, 2, 1],
					friction: 0.5,
					restitution: 0.9,
					material: curO.material
				});
			}
		}
	}
	create_box(curO) {
		this.create_hardbox(curO);
	}
	create_sphere(curO) {
		this.add({
			type: 'sphere',
			name: curO.name || Math.generateUUID(),
			roadblock: curO.roadblock,
			size: [curO.radius],
			mass: curO.mass,
			pos: curO.position,
			sounds: curO.sounds || null,
			group: curO.group || 1,
			state: 4,
			friction: 0.4,
			restitution: 0.9,
			material: curO.material
		});
	}
	create_capsule(curO) {
		this.add({
			type: 'capsule',
			name: curO.name || Math.generateUUID(),
			roadblock: curO.roadblock,
			size: [curO.radius],
			mass: curO.mass,
			pos: curO.position,
			sounds: curO.sounds || null,
			group: curO.group || 1,
			state: 4,
			friction: 0.4,
			restitution: 0.9,
			material: curO.material
		});
	}
	create_convex(curO) {
		this.add({
			type: 'convex',
			name: curO.name || Math.generateUUID(),
			roadblock: curO.roadblock,
			blockSize: curO.blockSize,
			v: curO.pointsfun(),
			shape: new ConvexGeometry(curO.pointsfun()),
			mass: curO.mass,
			pos: curO.position,
			rot: curO.rot,
			group: curO.group || 1,
			breakable: curO.breakable || false,
			state: 4,
			friction: 0.4,
			restitution: 0.9,
			material: curO.material
		});
	}
	getMeshAndGeo(curO) {
		var curMesh;
		if (curO.modelName) {
			curMesh = this.view.getModel(curO.modelName);
		} else {
			curMesh = this.view.getMesh(curO.meshName);
		}
		var curGeo;
		if (curMesh == null) {
			alert("模型:" + curO.meshName + "找不到！");
			return;
		} else if (curMesh.isMesh) {
			curGeo = curMesh.geometry;
		} else {
			var _engine = this;
			var geos = [];
			curMesh.traverse(function (child) {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;
					child.material.alphaTest = 0.1;
					child.material.envMap = _engine.view.getEnvmap();
					child.material.envMapIntensity = 1.5;
					//console.log(child);
					//console.log(child.material.alphaTest);	
					var cloneGeo = child.geometry.clone();
					//有的模型本身scale 不是[1,1,1]
					cloneGeo.applyMatrix4(new THREE.Matrix4().makeScale(child.scale.x, child.scale.y, child.scale.z));
					//cloneGeo.applyMatrix4( new THREE.Matrix4().makeTranslation( child.position.x, child.position.y, child.position.z ) );
					//有的模型本身有rotation
					cloneGeo.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(child.quaternion));
					geos.push(cloneGeo);
				}
			});
			curGeo = BufferGeometryUtils.mergeBufferGeometries(geos, true);
			//BufferGeometryUtils.computeTangents(curGeo);
		}
		return { mesh: curMesh, geo: curGeo };
	}
	create_model(curO) {
		var modelInfo = this.getMeshAndGeo(curO);
		var curMesh = modelInfo.mesh;
		var curGeo = modelInfo.geo;
		if (curO.hasOwnProperty("positions")) {
			for (var i = 0; i < curO.positions.length; i++) {
				var cloneMesh = curMesh.clone();
				var cloneGeo = curGeo.clone();
				//有的模型本身scale 不是[1,1,1]
				cloneGeo.applyMatrix4(new THREE.Matrix4().makeScale(cloneMesh.scale.x, cloneMesh.scale.y, cloneMesh.scale.z));
				//有的模型本身有rotation
				cloneGeo.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(cloneMesh.quaternion));
				if (curO.scale) {
					cloneMesh.scale.fromArray([cloneMesh.scale.x * curO.scale[0], cloneMesh.scale.y * curO.scale[1], cloneMesh.scale.z * curO.scale[2]]);
					cloneGeo.applyMatrix4(new THREE.Matrix4().makeScale(curO.scale[0], curO.scale[1], curO.scale[2]));
				}
				curO.rot = curO.rot || [0, 0, 0];
				var curRot = [curO.rot[0], curO.rot[1], curO.rot[2]];
				var o = {
					type: 'mesh',
					name: Math.generateUUID(),
					roadblock: curO.roadblock,
					shape: cloneGeo,
					mass: curO.mass,
					pos: curO.positions[i],
					rot: curRot,
					friction: 0.4,
					receiveShadow: curO.receiveShadow,
					castShadow: curO.castShadow
				};
				if (!curO.debug) {
					o.mesh = cloneMesh;
				}
				this.add(o);
			}

		} else {
			var cloneMesh = curMesh.clone();
			var cloneGeo = curGeo.clone();
			//有的模型本身scale 不是[1,1,1]
			cloneGeo.applyMatrix4(new THREE.Matrix4().makeScale(cloneMesh.scale.x, cloneMesh.scale.y, cloneMesh.scale.z));
			//有的模型本身有rotation
			cloneGeo.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(cloneMesh.quaternion));
			if (curO.scale) {
				cloneMesh.scale.fromArray([cloneMesh.scale.x * curO.scale[0], cloneMesh.scale.y * curO.scale[1], cloneMesh.scale.z * curO.scale[2]]);
				cloneGeo.applyMatrix4(new THREE.Matrix4().makeScale(curO.scale[0], curO.scale[1], curO.scale[2]));
			}
			var o = {
				type: 'mesh',
				name: curO.name || Math.generateUUID(),
				roadblock: curO.roadblock,
				shape: cloneGeo,
				mass: curO.mass,
				pos: curO.position,
				rot: curO.rot,
				friction: 0.4,
				receiveShadow: curO.receiveShadow,
				castShadow: curO.castShadow
			};
			if (!curO.debug) {
				o.mesh = cloneMesh;
			}
			this.add(o);
		}
	}
	create_gun(curO) {
		var mesh = this.view.getMesh(curO.meshName).clone();
		var geo = this.view.getGeometry(curO.meshName).clone();
		if (curO.scale) {
			mesh.scale.fromArray(curO.scale);
			geo.applyMatrix4(new THREE.Matrix4().makeScale(curO.scale[0], curO.scale[1], curO.scale[2]));
		}

		var addO = this.add({
			type: 'mesh',
			mesh: mesh,
			geoSize: curO.geoSize,
			name: curO.name || Math.generateUUID(),
			roadblock: curO.roadblock,
			shape: geo,
			mass: curO.mass,
			pos: curO.position,
			rot: curO.rot,
			friction: 0.4,
			receiveShadow: curO.receiveShadow,
			castShadow: curO.castShadow
		});

		var muzzlePt = new THREE.Group();
		muzzlePt.position.set(curO.muzzle[0], curO.muzzle[1], curO.muzzle[2]);
		addO.add(muzzlePt);
		var muzzleBackPt = new THREE.Group();
		muzzleBackPt.position.set(curO.muzzle[0] - 0.1, curO.muzzle[1], curO.muzzle[2]);
		addO.add(muzzleBackPt);
		addO.userData.muzzle = muzzlePt;
		addO.userData.muzzleBack = muzzleBackPt;
	}
	create_softRope(curO) {
		this.add(curO);
	}
	create_softCloth(curO) {
		this.add(curO);
	}
	create_softMesh(curO) {
		this.add(curO);
	}
	create_anchor(curO) {
		this.physic.anchor(curO);
	}
	create_joint_hinge(curO) {
		var hinge = this.add(curO);
		var object2 = this.byName(curO.body2);
		object2.userData.lock = curO.lock;
	}
	create_car(curO) {
		var confs = curO.conFunc(this);
		for (var i = 0, il = confs.length; i < il; i++) {
			var carO = this.add(confs[i]);
			this.addMoveObjName(carO.name);
		}
	}
	create_text3D(curO) {
		var _engine =this;
		var createText3D = function (co) {
			var geometry = new THREE.TextGeometry(co.text, {
				size: co.size,
				height: co.height,
				curveSegments: co.curveSegments,
				font: _engine.font3d
			});
			var materials = [
				new THREE.MeshBasicMaterial({ color: co.colors[0], side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ color: co.colors[1], side: THREE.DoubleSide })
			];
			_engine.centerPosition(geometry, [1, 1, 1]);
			var pos = [co.position[0] + _engine.ddlsOffset.x, co.position[1] + _engine.ddlsOffset.y, co.position[2] + _engine.ddlsOffset.z];

			_engine.physic.add({
				type: 'mesh',
				name: co.name || Math.generateUUID(),
				roadblock: co.roadblock,
				shape: geometry,
				material: materials,
				mass: co.mass,
				pos: pos,
				rot: co.rot,
				friction: 0.4,
				receiveShadow: co.receiveShadow,
				castShadow: co.castShadow
			});
		};
		if (this.font3d) {
			createText3D(curO);
		} else {
			this.fontLoader.load('./assets/fonts/REEJI-JinGang-ExtraBoldGB1.0_Regular.json', function (response) {
				_engine.font3d = response;
				createText3D(curO);
			});
		}
	}
	create_cube(curO) {
		var _tempObj = this.createCube(curO, false);
		this.objects.push(_tempObj);
		var addO = this.add({
			type: 'box',
			name: curO.name || Math.generateUUID(),
			size: curO.size,
			mass: 0,
			pos: curO.position,
			rot: curO.rot,
			mesh: _tempObj,
			group: curO.group || 1,
			breakable: curO.breakable || false,
			friction: 0.5,
			restitution: 0.9,
			material: curO.material
		});
	}
	create_floor(curO) {
		var _tempObj = this.createCube(curO, false);
		this.objects.push(_tempObj);
		var addO = this.add({
			type: 'box',
			name: curO.name || Math.generateUUID(),
			size: curO.size,
			mass: 0,
			pos: curO.position,
			rot: curO.rot,
			mesh: _tempObj,
			group: curO.group || 1,
			breakable: curO.breakable || false,
			friction: 0.5,
			restitution: 0.9
		});
	}
	create_wall(_obj) {
		var _commonThick = _obj.thick || 40;//墙体厚度
		var _commonLength = _obj.length || 100;//墙体厚度
		var _commonHeight = _obj.height || 300;//强体高度
		var _commonSkin = _obj.style.color || 0x98750f;
		var _engine = this;
		//建立墙体
		_obj.wallData.forEach(function (wallobj, index) {
			var wallLength = _commonLength;
			var wallWidth = wallobj.thick || _commonThick;
			var wallpath = wallobj.path;
			var curWall = null;
			for (var i = 0, il = wallpath.length; i < il - 1; i++) {
				//取出两个点构建墙面
				var startDot = wallpath[i];
				var endDot = wallpath[i + 1];
				//计算这一段的位置
				var positionX = ((startDot[0] || 0) + (endDot[0] || 0)) / 2;
				var positionY = ((startDot[1] || 0) + (endDot[1] || 0)) / 2;
				var positionZ = ((startDot[2] || 0) + (endDot[2] || 0)) / 2;
				//z相同 表示x方向为长度
				if (startDot[2] == endDot[2]) {
					wallLength = Math.abs(startDot[0] - endDot[0]) + wallobj.thick;
					wallWidth = wallobj.thick || _commonThick;
				} else if (startDot[0] == endDot[0]) {
					wallLength = wallobj.thick || _commonThick;
					wallWidth = Math.abs(startDot[2] - endDot[2]) + wallobj.thick;
				}
				var _cube = _engine.createCube({
					size: [wallLength, (wallobj.height || _commonHeight), wallWidth],
					position: [positionX, positionY, positionZ],
					uuid: wallobj.uuid,
					name: wallobj.name,
					style: {
						skinColor: _commonSkin,
						skin: wallobj.skin
					}
				}, true);
				if (curWall == null) {
					curWall = _cube;
				} else {
					curWall = _engine.mergeModel('+', curWall, _cube, { matname: _obj.matname, skincolor: _commonSkin, path: wallpath, skin: _obj.skin });
				}

			}
			//加其它部分
			if (_engine.commonFunc.hasObj(wallobj.childrens) && wallobj.childrens.length > 0) {
				wallobj.childrens.forEach(function (walchildobj, index) {
					var _newobj = null;
					if (walchildobj.op) {
						_newobj = _engine.createHole(walchildobj, true);
						curWall = _engine.mergeModel(walchildobj.op, curWall, _newobj, { matname: _obj.matname, skincolor: _commonSkin });
					} else {
						_newobj = _engine.createHole(walchildobj, false);
						// 加入门
						_engine.physic.add({
							type: 'box',
							mesh: _newobj,
							name: walchildobj.name || Math.generateUUID(),
							size: _newobj.userData.size,
							mass: walchildobj.mass || 0,
							pos: _newobj.userData.position,
							group: 1,
							breakable: false,
							friction: walchildobj.friction || 0.5,
							restitution: walchildobj.restitution || 0.9,
							material: 'basic'
						});
					}

				});
			}
			//curWall.geometry = curWall.geometry.toBufferGeometry();
			_engine.physic.add({
				type: 'mesh',
				shape: curWall.geometry,
				mesh: curWall,
				name: wallobj.name,
				mass: 0,
				pos: [curWall.position.x, curWall.position.y, curWall.position.z],
				group: 1,
				breakable: false,
				friction: 0.5,
				restitution: 0.9
			});
		});
	}

	create_planex(curO) {
		var _tempObj = this.createPlaneGeometry(curO);
		this.addObject(_tempObj, true);
	}
	create_glasses(curO) {
		this.createGlasses(curO);
	}
	create_emptyCabinet(curO) {
		var _tempObj = this.createEmptyCabinet(curO);
		_tempObj.userData = { size: curO.size };
		this.addObject(_tempObj);
		this.add({
			type: 'box',
			name: curO.name || Math.generateUUID(),
			size: curO.size,
			mass: 0,
			pos: curO.position,
			rot: curO.rot,
			mesh: _tempObj,
			group: curO.group || 1,
			breakable: curO.breakable || false,
			friction: 0.5,
			restitution: 0.9,
			material: curO.material
		});
	}
	create_cloneObj(curO) {
		if (curO.hasOwnProperty("conFunc")) {
			var confs = curO.conFunc(this);
			for (var i = 0, il = confs.length; i < il; i++) {
				var curConf = confs[i];
				var _tempObj = this.commonFunc.cloneByName(confs[i].copyfrom, curConf);

				this.add({
					type: 'box',
					name: curConf.name || Math.generateUUID(),
					size: _tempObj.userData.size,
					mass: 0,
					pos: curConf.position,
					rot: curConf.rot,
					mesh: _tempObj,
					group: curConf.group || 1,
					breakable: curConf.breakable || false,
					friction: 0.5,
					restitution: 0.9,
					material: curConf.material
				});
			}
		} else {
			var _tempObj = this.commonFunc.cloneByName(curO.copyfrom, curO);
			this.add({
				type: 'box',
				name: curO.name || Math.generateUUID(),
				size: _tempObj.userData.size,
				mass: 0,
				pos: curO.position,
				rot: curO.rot,
				mesh: _tempObj,
				group: curO.group || 1,
				breakable: curO.breakable || false,
				friction: 0.5,
				restitution: 0.9,
				material: curO.material
			});
		}
	}
	/*this.create_group(curO){
		var gp = new THREE.Group();
		var geos = [];
		for(var i=0;i<curO.objects.length;i++){
			var co = curO.objects[i];
			var modelInfo = this.getMeshAndGeo(co);
			var curMesh = modelInfo.mesh;
			var curGeo = modelInfo.geo;
			
			
			if(co.hasOwnProperty("positions")){
				for(var j=0; j<co.positions.length; j++){
					var cloneMesh = curMesh.clone();
					var cloneGeo = curGeo.clone();
					//有的模型本身scale 不是[1,1,1]
					cloneGeo.applyMatrix4( new THREE.Matrix4().makeScale( cloneMesh.scale.x, cloneMesh.scale.y, cloneMesh.scale.z ) );
					//有的模型本身有rotation
					cloneGeo.applyMatrix4( new THREE.Matrix4().makeRotationFromQuaternion( cloneMesh.quaternion ) );
					if ( co.scale ) {
						cloneMesh.scale.fromArray( [cloneMesh.scale.x*co.scale[0],cloneMesh.scale.y*co.scale[1],cloneMesh.scale.z*co.scale[2]]);
						cloneGeo.applyMatrix4( new THREE.Matrix4().makeScale( co.scale[ 0 ], co.scale[ 1 ], co.scale[ 2 ] ) );
					}
					if( co.rot ){
						cloneMesh.rotateOnAxis(new THREE.Vector3(co.rot[0], co.rot[1], co.rot[2]));
						cloneGeo.applyMatrix4( new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler().fromArray(this.toRad(co.rot))));
					}	
					curGeo.applyMatrix4( new THREE.Matrix4().makeTranslation( co.positions[j][0],co.positions[j][1],co.positions[j][2] ) );
					geos.push(curGeo);
					curMesh.position.set(co.positions[j][0],co.positions[j][1],co.positions[j][2]);
					gp.add(cloneMesh);
				}
				
			}else{
				var cloneMesh = curMesh.clone();
				var cloneGeo = curGeo.clone();
				//有的模型本身scale 不是[1,1,1]
				cloneGeo.applyMatrix4( new THREE.Matrix4().makeScale( cloneMesh.scale.x, cloneMesh.scale.y, cloneMesh.scale.z ) );
				//有的模型本身有rotation
				cloneGeo.applyMatrix4( new THREE.Matrix4().makeRotationFromQuaternion( cloneMesh.quaternion ) );
				if ( co.scale ) {
					cloneMesh.scale.fromArray( [cloneMesh.scale.x*co.scale[0],cloneMesh.scale.y*co.scale[1],cloneMesh.scale.z*co.scale[2]]);
					cloneGeo.applyMatrix4( new THREE.Matrix4().makeScale( co.scale[ 0 ], co.scale[ 1 ], co.scale[ 2 ] ) );
				}
				if( co.rot ){
					cloneMesh.rotateOnAxis(new THREE.Vector3(co.rot[0], co.rot[1], co.rot[2]));
					cloneGeo.applyMatrix4( new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler().fromArray(this.toRad(co.rot))));
				}	
				curGeo.applyMatrix4( new THREE.Matrix4().makeTranslation( co.position[0], co.position[1],co.position[2] ) );
				geos.push(curGeo);
				cloneMesh.position.set(co.position[0],co.position[1],co.position[2]);
				gp.add(cloneMesh);
			}
		

		}
		var gpGeo = BufferGeometryUtils.mergeBufferGeometries(geos,true);
		curO.rot = curO.rot||[0,0,0];
		var curRot = [curO.rot[0],curO.rot[1],curO.rot[2]];
		var o ={ 
			type:'mesh',
			name:Math.generateUUID(),							
			shape:gpGeo,
			mass:curO.mass,
			pos:curO.position,
			rot:curRot,							
			friction:0.4,
			receiveShadow:curO.receiveShadow,
			castShadow:curO.castShadow};
		if(!curO.debug){
			o.mesh = gp;
		}
		this.add(o);
	};*/
	//=====================================================
	//创建区域结束
	//=====================================================
	//创建物体
	createObject(curO) {
		if (curO.name == 'pathfindzone') {
			this.ddlsworld.reset(curO.size[0], curO.size[2]);
			//自动计算X,Z
			this.ddlsOffset.set(curO.size[0] * 0.5, 0, curO.size[2] * 0.5);
			curO.position = [curO.position[0] + curO.size[0] * 0.5, curO.position[1], curO.position[2] + curO.size[2] * 0.5];
		}
		this['create_' + curO.type](curO);
	}

	createOnTerrainObjects(curO, terrainPos, terrainData) {
		var vertexShader = ShaderExtras["png"].vertexShader;
		var fragmentShader = ShaderExtras["png"].fragmentShader;

		for (var i = 0, il = curO.onTerrainObjects.length; i < il; i++) {
			var curConf = curO.onTerrainObjects[i];
			switch (curConf.type) {
				case 'plant':
					var positions = null;
					if (curConf.hasOwnProperty("tuft")) {
						var nTufts = curConf.tuft;
						positions = new Array(nTufts);
						for (var j = 0; j < nTufts; j++) {
							var position = new THREE.Vector3();
							position.x = (Math.random() > 0.5) ? Math.random() * curConf.randompos.max[1] : Math.random() * curConf.randompos.max[0];
							if (position.x <= curConf.randompos.min[0] || position.x >= curConf.randompos.min[1]) {
								position.z = (Math.random() - 0.5) * 2 * curConf.randompos.max[3];
							} else {
								position.z = (Math.random() > 0.5) ? Math.random() * (curConf.randompos.max[3] - curConf.randompos.min[3]) + curConf.randompos.min[3] : Math.random() * (curConf.randompos.max[2] - curConf.randompos.min[2]) + curConf.randompos.min[2];
							}
							position.x += terrainPos.x;
							position.z += terrainPos.z;
							position.y = terrainData.getHeightAt(position.x, position.z, true);
							positions[j] = position;
						}
					} else if (curConf.hasOwnProperty("positions")) {
						var positionsConf = curConf.positions;
						positions = new Array(positionsConf.length);
						for (var j = 0, jl = positionsConf.length; j < jl; j++) {
							var position = new THREE.Vector3();
							position.x = positionsConf[j][0] + terrainPos.x;
							position.z = positionsConf[j][2] + terrainPos.z;
							position.y = terrainData.getHeightAt(position.x, position.z, true) + positionsConf[j][1];
							positions[j] = position;
						}
					}
					var texture = null;
					texture = WTextures.make({ url: curConf.image, name: curConf.name });
					//texture.anisotropy = 16;
					var material = new THREE.MeshPhongMaterial({
						specular: 0x030303,
						map: texture,
						alphaTest: 0.5
					});
					var gsmesh = PlantTufts.create(positions, curConf.size, material);
					gsmesh.castShadow = true;
					var uniforms = { texture: { value: texture } };
					gsmesh.customDepthMaterial = new THREE.ShaderMaterial({
						uniforms: uniforms,
						vertexShader: vertexShader,
						fragmentShader: fragmentShader
					});
					this.view.addVisual(gsmesh);
					break;
				case 'custom':
					curConf.customFunc(terrainPos, terrainData);
					break;
			}

		}
	}
	switchLightHelper(v) {
		for (var i = 0; i != lightHelpers.length; i++) {
			lightHelpers[i].visible = v;
		}
	}
	switchLightHelper(v) {
		for (var i = 0; i != lightHelpers.length; i++) {
			lightHelpers[i].visible = v;
		}
	}
	//创建光源
	create_light(curO) {
		if (curO.lightType == 'AmbientLight') {
			var lt = new THREE.AmbientLight(curO.color, curO.intensity);
			this.view.scene.add(lt);
			this.objects.push(lt);
		} else if (curO.lightType == 'DirectionalLight') {
			var lt = new THREE.DirectionalLight(curO.color, curO.intensity);
			lt.castShadow = true;
			lt.shadow.camera.near = curO.shadowCamera.near;
			lt.shadow.camera.far = curO.shadowCamera.far;
			lt.shadow.camera.left = curO.shadowCamera.left;
			lt.shadow.camera.right = curO.shadowCamera.right;
			lt.shadow.camera.top = curO.shadowCamera.top;
			lt.shadow.camera.bottom = curO.shadowCamera.bottom;

			lt.shadow.mapSize.x = curO.shadowMapSize[0];
			lt.shadow.mapSize.y = curO.shadowMapSize[1];
			lt.shadow.bias = -0.003;
			lt.position.set(curO.position[0], curO.position[1], curO.position[2]);
			lt.position.add(this.ddlsOffset)
			lt.target.position.set(20, 2, 20);
			this.view.addVisual(lt);
			this.sunLight = lt;
			var dirLightHeper = new THREE.DirectionalLightHelper(lt, 10);
			dirLightHeper.visible = false;
			lightHelpers.push(dirLightHeper);
			this.view.addVisual(dirLightHeper);

			this.objects.push(lt);
			this.objects.push(dirLightHeper);
		} else if (curO.lightType == 'SpotLight') {
			var lt = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 5, 0.3);
			lt.position.set(curO.position[0], curO.position[1], curO.position[2]);
			lt.target.position.set(0, 0, 0);

			lt.castShadow = true;
			lt.shadow.camera.near = curO.shadowCamera.near;
			lt.shadow.camera.far = curO.shadowCamera.far;
			lt.shadow.bias = 0.0001;

			lt.shadow.mapSize.width = curO.shadowMapSize[0];
			lt.shadow.mapSize.height = curO.shadowMapSize[1];
			var lightHelper = new THREE.SpotLightHelper(lt);
			lightHelper.visible = false;
			lightHelpers.push(lightHelper);
			this.view.addVisual(lt);
			this.view.addVisual(lightHelper);
			this.objects.push(lt);
			this.objects.push(lightHelper);
		}
	}

	setHour(h) {
		if (this.sky) {

			var inclinationA = (h * 15) - 90;
			var inclinationB = (inclinationA - 270) / 360.00 + (inclinationA + 90) / 360.00;

			var parameters = {
				distance: 400,//400
				azimuth: 0.25//curO.azimuth//0.205
			};
			var theta = Math.PI * (inclinationB - 0.5);
			var phi = 2 * Math.PI * (parameters.azimuth - 0.5);

			this.sunSphere.position.x = parameters.distance * Math.cos(phi);
			this.sunSphere.position.y = parameters.distance * Math.sin(phi) * Math.sin(theta);
			this.sunSphere.position.z = parameters.distance * Math.sin(phi) * Math.cos(theta);

			this.sky.material.uniforms['sunPosition'].value.copy(this.sunSphere.position);

			if (this.sunLight) {
				this.sunLight.position.x = this.sunLight.distance * Math.cos(phi);
				this.sunLight.position.y = this.sunLight.distance * Math.sin(phi) * Math.sin(theta);
				this.sunLight.position.z = this.sunLight.distance * Math.sin(phi) * Math.cos(theta);
				this.sunLight.position.add(this.ddlsOffset);
			}
			this.updateMaterialsBySky();
		}
	}
	updateMaterialsBySky() {
		this.view.setEnvMapRenderTarget(this.sky);
		var t = this.terrains.length;
		while (t--) {
			if (this.terrains[t].updateMaterial) {
				this.terrains[t].updateMaterial();
			}
			this.terrains[t].material.envMap = this.view.getEnvmap();
			//terrains[t].borderMaterial.envMap = this.view.getEnvmap();
		}
		var w = this.waters.length;
		while (w--) {
			if (this.waters[w].material.uniforms['sunDirection'])
				this.waters[w].material.uniforms['sunDirection'].value.copy(this.sunLight.position).normalize();
		}
	}
	//创建玩家
	create_avatar(curO) {
		var curAvatar = new WAvatar(curO);
		var o = {
			type: 'character',
			ename: curO.ename,
			debug: true,
			avatar: curAvatar,
			size: curO.size || curAvatar.size,
			pos: curO.position,
			group: 1,
			quat: [0, 0, 0]
		};
		this.add(o);

		if (curO.hasOwnProperty("sounds")) {
			this.addSound(this.view.audioListener, curAvatar.model.parent, curO.sounds);
		}
		this.heros.push(curAvatar.model.parent);
		this.addMoveObjName(curO.ename);
		this.labels.push(curAvatar.addNameLabel());

		var h = this.ddlsworld.addHeroe({ x: o.pos[0], y: o.pos[2], r: o.size[0], speed: 1 / 35 });
		h.mesh = curAvatar.model.parent;
		h.mesh.userData.index = this.ddlsHeros.length;
		h.mesh.userData.findPath = false;
		h.mesh.userData.findPathCallBack = function () { };
		this.ddlsHeros.push(h);
	}
	//创建动物
	create_animal(curO) {
		var _engine = this;
		var doCreate = function (co, pos, idx) {
			var curAnimal = new WAnimal(co);
			var o = {
				type: 'character',
				ename: co.ename + idx,
				debug: true,
				avatar: curAnimal,
				size: co.size || curAnimal.size,
				pos: pos,
				group: 1,
				quat: [0, 0, 0]
			};
			_engine.add(o);

			if (co.hasOwnProperty("sounds")) {
				_engine.addSound(_engine.view.audioListener, curAnimal.model.parent, co.sounds);
			}
			_engine.heros.push(curAnimal.model.parent);
			_engine.addMoveObjName(o.ename);
			_engine.labels.push(curAnimal.addNameLabel());

			var h = _engine.ddlsworld.addHeroe({ x: o.pos[0], y: o.pos[2], r: o.size[0], speed: 1 / 35 });
			h.mesh = curAnimal.model.parent;
			h.mesh.userData.index = _engine.ddlsHeros.length;
			h.mesh.userData.findPath = false;
			h.mesh.userData.findPathCallBack = function () { };
			_engine.ddlsHeros.push(h);
		};
		if (curO.positions) {
			for (var i = 0; i < curO.positions.length; i++) {
				doCreate(curO, curO.positions[i], i);
			}
		} else {
			doCreate(curO, curO.position, 1);
		}

	}
	create_avatar_mmd(curO) {
		var curMmd = new WMMD(curO);
		if (curO.useCharacter) {
			var o = {
				type: 'character',
				ename: curO.ename,
				debug: true,
				avatar: curMmd,
				size: curO.size || curMmd.size,
				pos: curO.position,
				group: 16,
				quat: [0, 0, 0]
			};
			var body = this.add(o);
			if (curO.physicBody) {
				curMmd.initPhysicSkeleton();
			}
			if (curO.hasOwnProperty("sounds")) {
				this.addSound(this.view.audioListener, curMmd.mmd.parent, curO.sounds);
			}
			this.heros.push(curMmd.model.parent);
			this.addMoveObjName(curO.ename);
			this.labels.push(curMmd.addNameLabel());

			var h = this.ddlsworld.addHeroe({ x: o.pos[0], y: o.pos[2], r: o.size[0], speed: 1 / 35 });
			h.mesh = curMmd.model.parent;
			h.mesh.userData.index = this.ddlsHeros.length;
			h.mesh.userData.findPath = false;
			h.mesh.userData.findPathCallBack = function () { };
			this.ddlsHeros.push(h);
		} else {
			curMmd.model.position.set(0, 0, 0);
			this.view.scene.add(curMmd.model);
			if (curO.physicBody) {
				curMmd.initPhysicSkeleton();
			}
			this.scene.loopFunctions.push(function (delta) { curMmd.playAction('idle'); curMmd.update(delta); });

		}

	}
	doCreate_mmd_chars(curO) {
		if (curO.refCameraAction) {
			var cameraAnimation = this.view.getMMDAnimation(curO.refCameraAction, this.view.camera);
			mmdHelper.add(this.view.camera, {
				animation: cameraAnimation
			});
		}
		for (var i = 0; i < curO.characters.length; i++) {
			this.doCreate_mmd_char(curO, curO.characters[i]);
		}
		isMMDLoaded = true;
	}
	doCreate_mmd_char(co, chr) {
		var _engine = this;
		var mesh = this.view.getModel(chr.ename);
		mesh.traverse(function (child) {
			if (child.isMesh) {
				child.castShadow = true;
				child.material.alphaTest = 0.1;
			}
		});
		function makePhongMaterials(materials) {
			var array = [];
			for (var i = 0, il = materials.length; i < il; i++) {
				var m = new THREE.MeshPhongMaterial();
				m.copy(materials[i]);
				m.needsUpdate = true;
				m.envMap = _engine.view.getEnvmap();
				array.push(m);
			}
			return array;
		}
		if (chr.usePhongMat) mesh.material = makePhongMaterials(mesh.material);
		mesh.position.set(chr.position[0], chr.position[1], chr.position[2]);
		if (chr.scale) mesh.scale.fromArray([chr.scale, chr.scale, chr.scale]);
		this.view.addVisual(mesh);

		var mmdAnimation =  _engine.view.getMMDAnimation(co.refAction, mesh);
		mmdHelper.add(mesh, {
			animation: mmdAnimation,
			physics: co.physicBody
		});
		if (chr.ikHelper) {
			var ikHelper = mmdHelper.objects.get(mesh).ikSolver.createHelper();
			ikHelper.visible = true;
			_engine.view.addVisual(ikHelper);
		}

		if (co.physicBody && chr.physicsHelper) {
			var physicsHelper = mmdHelper.objects.get(mesh).physics.createHelper();
			physicsHelper.visible = true;
			this.view.addVisual(physicsHelper);
		}
	}
	create_mmd(curO) {
		if (mmdHelper == null) {
			mmdHelper = new MMDAnimationHelper({ afterglow: 2.0 });
			this.scene.loopFunctions.push(function (delta) { if (isMMDLoaded) mmdHelper.update(delta); });
		}
		var audio = new THREE.Audio(this.view.audioListener).setBuffer(sounds[curO.refSound].buffer);
		var audioParams = { delayTime: 160 * 1 / 30 };
		mmdHelper.add(audio, audioParams);
		if (curO.physicBody && isAmmoImport == false) {
			this.importScript('./js/libs/ammo.js', function (url, co) {
				Ammo().then(function (AmmoLib) {
					Ammo = AmmoLib;
					isAmmoImport = true;
					this.doCreate_mmd_chars(co);
				});
			}, curO);
		} else {
			this.doCreate_mmd_chars(curO);
		}

	}
	create_mmd_model(curO) {
		var _engine = this;
		var mesh = this.view.getModel(curO.ename);
		mesh.traverse(function (child) {
			if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
				child.material.alphaTest = 0.1;
			}
		});
		function makePhongMaterials(materials) {
			var array = [];
			for (var i = 0, il = materials.length; i < il; i++) {
				var m = new THREE.MeshPhongMaterial();
				m.copy(materials[i]);
				m.needsUpdate = true;
				m.envMap = _engine.view.getEnvmap();
				array.push(m);
			}
			return array;
		}
		if (curO.usePhongMat) mesh.material = makePhongMaterials(mesh.material);
		mesh.position.set(curO.position[0], curO.position[1], curO.position[2]);
		if (curO.scale) mesh.scale.fromArray(curO.scale);
		this.view.addVisual(mesh);
	}
	loadGlsl_vs(mo, callBack) {
		var url = './datas/' + window.world.currentSceneName + '/' + mo.vertexShaderSrc;
		this.fileLoader.load(url, function (data) {
			mo.vertexShader = data;
			callBack();
		});
	}
	loadGlsl_fs(mo, callBack) {
		var url = './datas/' + window.world.currentSceneName + '/' + mo.fragmentShaderSrc;
		this.fileLoader.load(url, function (data) {
			mo.fragmentShader = data;
			callBack(mo.name);
		});
	}
	preLoadGlslFiles(mo, callBack) {
		var pAry = [];
		var _engine = this;
		if (mo.vertexShaderSrc) {
			pAry.push(new Promise(function (resolve, reject) {
				_engine.loadGlsl_vs(mo, function (name) {
					resolve('load ' + name + ' shader vs ok');
				});
			}));
		}
		if (mo.fragmentShaderSrc) {
			pAry.push(new Promise(function (resolve, reject) {
				_engine.loadGlsl_fs(mo, function (name) {
					resolve('load ' + name + ' shader fs  ok');
				});
			}));
		}

		Promise.all(pAry).then(function () {
			callBack();
		});
	}
	getShaderUnforms(name) {
		return this.view.getShaderUnforms(name);
	}
	loadSceneFile(sceneName, callback) {
		var url = './datas/' + sceneName + '/scene.js';
		this.fileLoader.load(url, function (data) {
			window.world = window.world || {};
			window.world.scenes = window.world.scenes || {};
			eval('window.world.scenes[sceneName]=' + data);
			callback();
		});

	}
	loadLogicFile(sceneName, callback) {
		var url = './datas/' + sceneName + '/logic.js';
		this.fileLoader.load(url, function (data) {
			window.world = window.world || {};
			window.world.logics = window.world.logics || {};
			eval('window.world.logics[sceneName]=' + data);
			callback(sceneName);
		});
	}
	loadSceneData(sceneName, callBack) {
		var pAry = [];
		var _engine = this;
		pAry.push(new Promise(function (resolve, reject) {
			_engine.loadSceneFile(sceneName, function (sName) {
				resolve('load scene ' + sName + ' ok');
			});
		}));
		pAry.push(new Promise(function (resolve, reject) {
			_engine.loadLogicFile(sceneName, function (sName) {
				resolve('load scene ' + sName + ' ok');
			});
		}));
		Promise.all(pAry).then(function () {
			callBack();
		});
	}

	createSceneObject() {
		var curScene = window.world.scenes[window.world.currentSceneName];
		//解析三维物体
		for (var i = 0, il = curScene.objects.length; i < il; i++) {
			this.createObject(curScene.objects[i]);
		}
		//事件对象列表
		this.eventList = curScene.events;
		//加控制按钮
		this.gui.addBtns(curScene.btns);
	}

	loadSceneLogic() {
		var slogics = window.world.logics[window.world.currentSceneName];
		for (var i = 0; i < slogics.length; i++) {
			var lc = slogics[i];
			if (this.has(lc.name) == false) continue;
			var body = this.byName(lc.name);
			var cmds = lc.logic();
			body.userData.cmds = cmds;
			body.userData.cmdIndex = 0;
			var curDdlsHero = this.ddlsHeros[body.userData.index];
			var cmdExe = function () {
				var curCmd = cmds[body.userData.cmdIndex];
				if (curCmd.type == 'move' && !body.userData.findPath) {
					curDdlsHero.isSelected = true;
					body.userData.findPath = true;
					body.userData.findPathCallBack = function () {
						body.userData.cmdIndex = body.userData.cmdIndex + 1 > body.userData.cmds.length - 1 ? 0 : body.userData.cmdIndex + 1;
						body.userData.findPathCallBack = function () { };
					};
					body.userData.actionName = curCmd.action;
					console.log("go to " + curCmd.pos[0] + "---" + curCmd.pos[1] + '   ' + body.userData.findPath);
					curDdlsHero.setTarget(curCmd.pos[0], curCmd.pos[1]);

				}
				else if (curCmd.type == 'play' && body.userData.actionName != curCmd.action) {
					body.userData.actionName = curCmd.action;
					body.userData.avatar.logicPlay = true;
					body.userData.avatar.doAction(curCmd.action);
					//body.userData.cmdIndex=body.userData.cmdIndex+1>body.userData.cmds.length-1?0:body.userData.cmdIndex+1;
					setTimeout(function () {
						body.userData.avatar.logicPlay = false;
						body.userData.cmdIndex = body.userData.cmdIndex + 1 > body.userData.cmds.length - 1 ? 0 : body.userData.cmdIndex + 1;
					}, curCmd.interval);
				}
			};

			this.scene.loopFunctions.push(cmdExe);
		}
	}
	enableHoloEffect(b, s) {
		this.view.enableHoloEffect(b, s);
	}
	enableAREffect(b) {
		this.view.enableAREffect(b);
	}
	enableVREffect(b) {
		this.view.enableVREffect(b);
	}
	enableWebVREffect(b) {
		this.view.enableWebVREffect(b);
	}
	centerPosition(geo, conf) {
		geo.computeBoundingBox();
		var translateX = conf[0] == 1 ? -((geo.boundingBox.getSize(new THREE.Vector3()).x / 2) + geo.boundingBox.min.x) : 0;
		var translateY = conf[1] == 1 ? -((geo.boundingBox.getSize(new THREE.Vector3()).y / 2) + geo.boundingBox.min.y) : 0;
		var translateZ = conf[2] == 1 ? -((geo.boundingBox.getSize(new THREE.Vector3()).z / 2) + geo.boundingBox.min.z) : 0;
		geo.applyMatrix4(new THREE.Matrix4().makeTranslation(translateX, translateY, translateZ));
	}
	getDDLSPosition(pos) {
		return pos.add(this.ddlsOffset);
	}
	loadAction(conf, callback) {
		var _engine = this;
		if (conf.type && conf.type == 'vmd') {
			this.view.loadVMD(conf, callback);
		} else {
			this.bvhFileLoader.load(conf.url, function (buffer) {
				var text = "";
				var raw = new Uint8Array(buffer);
				for (var i = 0; i < raw.length; ++i) {
					text += String.fromCharCode(raw[i]);
				}
				_engine.actions[conf.name] = { type: conf.type || 'common', data: text };
				callback(conf);
			});
		}

	}
	getActionData(name) {
		return this.actions[name];
	}
	loadSound(conf, callBack, mesh, k) {
		var _engine = this;
		if (this.sounds[conf.name] && this.sounds[conf.name].buffer) {
			callBack(this.sounds[conf.name].buffer, conf, mesh, k);
		} else {
			this.audioLoader.load(conf.url, function (buffer) {
				_engine.sounds[conf.name] = { name: conf.name };
				_engine.sounds[conf.name].buffer = buffer;
				callBack(buffer, conf, mesh, k);
			});
		}

	}
	addSound(listener, mesh, sO) {
		if (listener == null || sO == null) return;
		mesh.userData.audios = {};
		for (var k in sO.data) {
			var conf = sO.data[k];
			this.loadSound(conf, function (buffer, cf, curMesh, tK) {
				var audio = new THREE.PositionalAudio(listener);
				audio.setBuffer(buffer);
				audio.setRefDistance(cf.refdistance);
				audio.setLoop(cf.loop);
				curMesh.userData.audios[tK] = audio;
				curMesh.userData.defaudio = sO.defsound;
				curMesh.add(audio);
			}, mesh, k);

		}
	}
	playSound(mesh, sName) {
		if (mesh.userData.hasOwnProperty('audios') && mesh.userData.audios.hasOwnProperty(sName)) {
			var audio = mesh.userData.audios[sName];
			//console.log('sName=='+sName);
			if (!audio.isPlaying) audio.play();
		}
	}
	stopPlaySound(mesh, sName) {
		if (mesh.userData.hasOwnProperty('audios') && mesh.userData.audios.hasOwnProperty(sName)) {
			mesh.userData.audios[sName].stop();
		}
	}

	avatarFire(ammoMass, throwPos, throwDir) {
		if (this.currentFollow == null) return;
		this.currentFollow.userData = this.currentFollow.userData || {};
		this.currentFollow.userData.weapon = this.currentFollow.userData.weapon || {};
		this.currentFollow.userData.weapon.ammo = this.currentFollow.userData.weapon.ammo || 0;
		if (this.currentFollow.userData.weapon.ammo > 0) {

			var ballMass = ammoMass;
			var ballRadius = 0.05;

			//var ball = new THREE.Mesh( new THREE.SphereGeometry( ballRadius, 14, 10 ),  this.view.getMaterial('solid') );
			//ball.castShadow = true;
			//ball.receiveShadow = true;
			//加声音
			//
			//this.addSound(this.view.audioListener,ball,fireSound);
			//ball.userData = ball.userData||{};
			//ball.userData.damage = 10;
			//ball.userData.damageUUID = Math.generateUUID();
			var matSolid = this.view.getMaterial('solid');
			matSolid.name = 'solid';
			//debugger;
			var ball = this.physic.add({
				type: 'sphere',
				size: [ballRadius],
				material: matSolid,
				mass: ballMass,
				pos: [throwPos.x, throwPos.y, throwPos.z],
				quat: [0, 0, 0, 1],
				linearVelocity: [throwDir.x, throwDir.y, throwDir.z]
			});
			var fireSound = { data: { fire: { name: 'gun01', loop: false, refdistance: 2 } } };
			this.addSound(this.view.audioListener, ball, fireSound);
			//var ballBody = _physic.createRigidBody( ball, ballShape, ballMass, throwPos, quat ,null, null, null, 2);
			//ballBody.setLinearVelocity( new Ammo.btVector3( throwDir.x, throwDir.y, throwDir.z ) );
			this.playSound(ball, 'fire');
			this.currentFollow.userData.weapon.ammo--;
			//ball=null;ballMass=null;ballRadius=null;throwPos=null;
		}
	}
	play(b) {
		if (b) {
			this.view.restartRender();
		} else {
			this.view.pauseRender();
		}
		this.run = b;
	}

	initEvents() {

		var _engine = this;
		var mouseDown = function (evt) {
			_engine.mouseCoords.set(
				(evt.clientX / window.innerWidth) * 2 - 1,
				- (evt.clientY / window.innerHeight) * 2 + 1
			);
			_engine.raycaster.setFromCamera(_engine.mouseCoords, _engine.view.camera);
			//=======鼠标左键
			if (evt.button == 0) {
				if (_engine.isTouch) return;
				var throwPos = new THREE.Vector3();
				throwPos.copy(_engine.raycaster.ray.direction);
				throwPos.add(_engine.raycaster.ray.origin);

				var throwDir = new THREE.Vector3();
				throwDir.copy(_engine.raycaster.ray.direction);
				throwDir.multiplyScalar(50);
				_engine.avatarFire(20, throwPos, throwDir);
			} else if (evt.button == 1) {
				_engine.view.updateSunLightSize(_engine.view.cameraControls.getRadius());
			}
			//=========鼠标右键
			else if (evt.button == 2 && _engine.has('pathfindzone')) {
				var pathfindzone = _engine.byName('pathfindzone');
				if (pathfindzone.isGroup) pathfindzone = pathfindzone.children[0];
				var inter = raycaster.intersectObject(pathfindzone);
				if (inter.length > 0) {
					var p = inter[0].point;
					var curDdlsHero = this.ddlsHeros[_engine.currentFollow.userData.index];
					curDdlsHero.isSelected = true;
					console.log('go to x=' + p.x + ' z=' + p.z);
					_engine.currentFollow.userData.findPath = true;
					_engine.currentFollow.userData.findPathCallBack = function () { };
					curDdlsHero.setTarget(p.x, p.z);
				}
				inter = null;
			}
			//=====================触发配置的事件=======	
			//debugger;
			var intersects = _engine.raycaster.intersectObjects(_engine.view.objects_raycaster);
			if (intersects.length > 0) {
				_engine.SELECTED = intersects[0].object;
				if (_engine.clickMeasureEnabled) _engine.showSize(_engine.SELECTED);
				if (_engine.eventList != null && _engine.eventList.dbclick != null && _engine.eventList.dbclick.length > 0) {
					_engine.eventList.dbclick.forEach(function (_obj, index) {
						if ("string" == typeof (_obj.obj_name)) {
							if (_obj.obj_name == _engine.SELECTED.name) {
								_obj.obj_event(_engine.SELECTED);
							}
						} else if (_obj.findObject != null || 'function' == typeof (_obj.findObject)) {
							if (_obj.findObject(_engine.SELECTED.name)) {
								_obj.obj_event(_engine.SELECTED);
							}
						}
					});
				}
			}
			evt.preventDefault();

		};
		document.addEventListener('mousedown', mouseDown, false);

		this.user.addEventListener('onKeyDown', function (evt) {
			if (evt.keyCode == 9) {
				_engine.changeHero();
			} else if (evt.keyCode == 87) {
				_engine.driveSpeed++;
			} else if (evt.keyCode == 83) {
				_engine.driveSpeed--;
			} else if (evt.keyCode == 81) {
				_engine.driveSpeed = 0;
			} else if (evt.keyCode == 82) {
				if (_engine.currentFollow != null) {
					_engine.currentFollow.userData = _engine.currentFollow.userData || {};
					_engine.currentFollow.userData.weapon = _engine.currentFollow.userData.weapon || {};
					_engine.currentFollow.userData.weapon.ammo = _engine.currentFollow.userData.weapon.ammo || 0;
					_engine.currentFollow.userData.weapon.ammo++;
					//加声音
					_engine.playSound(_engine.currentFollow, 'addbullet');
				}
			} else if (evt.keyCode == 70) {
				var throwPos = _engine.currentFollow.userData.avatar.getThrowPos();
				var throwDir = _engine.currentFollow.userData.avatar.getThrowDir();
				_engine.avatarFire(20, throwPos, throwDir);
			}
			if (_engine.view.camera == _engine.view.cameraInObj) {
				if (evt.keyCode == 65) {
					_engine.view.camera.rotation.y = 0;
				} else if (evt.keyCode == 68) {
					_engine.view.camera.rotation.y = Math.PI;
				} else if (evt.keyCode == 37) {
					_engine.view.camera.rotation.y += Math.PI * 0.01;
				} else if (evt.keyCode == 39) {
					_engine.view.camera.rotation.y -= Math.PI * 0.01;
				} else if (evt.keyCode == 38) {
					_engine.view.camera.rotation.x += Math.PI * 0.01;
				} else if (evt.keyCode == 40) {
					_engine.view.camera.rotation.x -= Math.PI * 0.01;
				}
			}

		});
	}
	showSize(model) {
		var box = new THREE.Box3().setFromObject(model);
		var box3X = box.max.x - box.min.x;
		var box3Y = box.max.y - box.min.y;
		var box3Z = box.max.z - box.min.z;
		var xL = box3X * 1.01;
		var yL = box3Y * 1.01;
		var zL = box3Z * 1.01;
		var geometry = new THREE.BoxGeometry(xL, yL, zL);
		var material = new THREE.MeshPhongMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.2,
		});
		if (this.sizeGroup != null) {
			for (var i = this.sizeDivs.length - 1; i >= 0; i--) {
				if (this.sizeDivs[i].parentNode) {
					this.sizeDivs[i].parentNode.removeChild(this.sizeDivs[i]);
				}
			}
			this.sizeDivs = [];
			for (var i = 0; i < this.sizeGroup.children.length; i++) {
				this.sizeGroup.remove(this.sizeGroup.children[i]);
			}


			this.sizeGroup.parent.remove(this.sizeGroup);
			this.sizeGroup = null;
		}
		this.sizeGroup = new THREE.Group();
		var mesh = new THREE.Mesh(geometry, material);
		this.sizeGroup.add(mesh);
		var border = new THREE.BoxHelper(mesh, 0x0ed5c7);
		this.sizeGroup.add(border);

		var sizeLineX = this.makeSizeLine(xL);
		sizeLineX.position.y = yL / 2 + .5;
		sizeLineX.position.z = -zL / 2;
		this.sizeGroup.add(sizeLineX);
		var sizeLineY = this.makeSizeLine(yL);
		sizeLineY.rotateZ(Math.PI / 2);
		sizeLineY.position.x = xL / 2 + .5;
		sizeLineY.position.z = -zL / 2;
		this.sizeGroup.add(sizeLineY);
		var sizeLineZ = this.makeSizeLine(zL);
		sizeLineZ.rotateY(Math.PI / 2);
		sizeLineZ.position.x = xL / 2;
		sizeLineZ.position.y = -yL / 2 - .5;
		this.sizeGroup.add(sizeLineZ);
		this.makeSizeLabel(this.sizeGroup, box3X, sizeLineX.position);
		this.makeSizeLabel(this.sizeGroup, box3Y, sizeLineY.position);
		this.makeSizeLabel(this.sizeGroup, box3Z, sizeLineZ.position);
		this.sizeGroup.position.copy(model.position);
		model.parent.add(this.sizeGroup);
	}
	makeSizeLine(length) {
		var w = 10;
		var p10 = new THREE.Vector3(-length / 2, 0, 0);
		var p11 = new THREE.Vector3(-length / 2, w / 2, 0);
		var p12 = new THREE.Vector3(-length / 2, -w / 2, 0);
		var p20 = p10.clone().negate();
		var p21 = p11.clone().negate();
		var p22 = p12.clone().negate();
		var LineGroup = new THREE.Group();
		var lengthLine = createLine([p10, p20]);
		var leftLine = createLine([p11, p12]);
		var rightLine = createLine([p21, p22]);
		var p13 = new THREE.Vector3(-length / 2 + .2, .2, 0);
		var p14 = new THREE.Vector3(-length / 2 + .2, -.2, 0);
		var p23 = p13.clone().negate();
		var p24 = p14.clone().negate();
		var leftRowLine = createLine([p13, p10, p14]);
		var rightRowLine = createLine([p23, p20, p24]);
		LineGroup.add(lengthLine, leftLine, rightLine, leftRowLine, rightRowLine);
		return LineGroup;
		function createLine(pointArr) {
			var material = new THREE.LineBasicMaterial({
				color: 0xffffff
			});
			var geometry = new THREE.BufferGeometry().setFromPoints( pointArr );
			var line = new THREE.Line( geometry, material );
			return line;
		}
	}
	makeSizeLabel(p, length, pos) {
		var sizeDiv = document.createElement('div');
		sizeDiv.className = 'label';
		sizeDiv.textContent = length.toFixed(3) + " m";
		sizeDiv.style.color = "#0ed5c7";
		sizeDiv.style.padding = "5px 10px";
		this.sizeDivs.push(sizeDiv);
		var sizeLabel = new CSS2DObject(sizeDiv);
		sizeLabel.position.copy(pos);
		p.add(sizeLabel);
		return sizeLabel;

	}
	updateCompassAngle() {
		var centerCoords = new THREE.Vector2();
		centerCoords.set(
			(window.innerWidth / 2 / window.innerWidth) * 2 - 1,
			- (window.innerHeight / 2 / window.innerHeight) * 2 + 1
		);
		this.raycaster_compass.setFromCamera(centerCoords, this.view.camera);
		var dir = new THREE.Vector3();
		dir.copy(this.raycaster_compass.ray.direction);
		var up = new THREE.Vector3(0, 1, 0);
		var north = new THREE.Vector3(1, 0, 0);
		var dirOnPlane = dir.projectOnPlane(up);
		var isEastside = (dirOnPlane.clone().cross(up).angleTo(north) > Math.PI / 2) ? true : false;
		var angleToNorth = dirOnPlane.angleTo(north);
		this.compassAngle = (isEastside) ? angleToNorth : Math.PI * 2 - angleToNorth;
	}
	init(options) {
		var overlay = document.getElementById('overlay');
		overlay.remove();
		if (WEBGL.isWebGLAvailable() === false) {
			document.body.appendChild(WEBGL.getWebGLErrorMessage());

		}
		document.oncontextmenu = function () { return false; };

		this.initComponents(options);
		this.content = new THREE.Group();
		this.view.addVisual(this.content);
		this.contentMesh = new THREE.Group();
		this.view.addVisual(this.contentMesh);

		this.raycaster = new THREE.Raycaster();
		this.raycaster_compass = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
		//this.initDefGeosAndMats();
		this.initEvents();
	}
	destroy() {
		// 暂停动画帧循环
		this.play(false);
		this.physic.reset(true);
		this.reset();
		this.gui.reset();
		this.view.reset();
		// 重新创建场景和角色
		this.scene.create();
	}
	reset() {

		//this.removeRay();
		if (this.view.cameraInObj.parent != null) {
			this.view.cameraInObj.parent.remove(this.view.cameraInObj);
			this.view.cameraInObj.parent = null;
		}

		if (this.compass != null) {
			this.view.sceneRenderHUDSprite.remove(this.compass);
			this.compasscompass = null;
		}
		var tmpI = this.labels.length;
		while (tmpI--) {
			this.labels[tmpI].parent.remove(this.labels[tmpI]);
		}
		this.labels = [];
		this.sunLight = null;
		this.sunSphere = null;
		this.sky = null;
		this.currentFollow = null;
		this.ddlsOffset = new THREE.Vector3(0, 0, 0);
		this.load = 0;
		if (this.mmdHelper != null) {
			for (var i = 0; i < this.mmdHelper.meshes.length; i++) {
				this.mmdHelper.remove(this.mmdHelper.meshes[i]);
			}
			if (this.mmdHelper.camera != null) this.mmdHelper.remove(this.mmdHelper.camera);
			if (this.mmdHelper.audio != null) {
				this.mmdHelper.audio.stop();
				this.mmdHelper.remove(this.mmdHelper.audio);
			}
			this.mmdHelper = null;
		}
		this.geo = {};
		this.sounds = {};
		this.extraGeo = [];
		this.heros = [];
		this.terrains = [];
		this.waters = [];
		this.moveObjNames = [];

		this.statics = [];
		this.ddlsObj = [];
		this.ddlsObject = [];
		this.ddlsHeros = [];
		this.ddlsworld.reset();
		this.terrainData = null;
		this.driveSpeed = 0;
		this.scene.loopFunctions = [];
	}
	start() {
		console.log("开始世界循环");
		// 开始世界循环
		this.view.restartRender();
		this.physic.start();
		this.playSounds(true);
		this.gui.showBtns();
		this.debugTell("");
	}

	importScript(url, callback, params) {
		this.fileLoader.load(url, function (data) {
			//eval(data);
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.text = data;
			document.body.appendChild(script);
			callback(url, params);
		});
	}
	importScripts(urls, callBack) {
		var pAry = [];
		var fLoader = new THREE.FileLoader();
		var _self = this;
		for (var i = 0; i < urls.length; i++) {
			pAry.push(new Promise(function (resolve, reject) {
				_self.importScript(urls[i], function (url) {
					resolve('load ' + url + ' ok');
				});
			}));
		}
		Promise.all(pAry).then(function (results) { callBack(); });
	}
	initComponents(options) {
		var _engine = this;
		this.loadingManager.addHandler(/\.dds$/i, new DDSLoader());
		this.gui = new WGui();
		this.gui.init();
		this.user = new WUser();
		this.debugTell("初始化三维引擎...");
		this.view = new WView(this.loadingManager);
		this.physic = new WPhysic();
		this.ddlsworld = new DDLSWorld(10, 10);

		this.view.init(options);
		this.view.update = 	function(delta) {
			_engine.getKeys();
			_engine.scene.update(delta);
			TWEEN.update();
			_engine.updateHero(delta);
			_engine.ddlsRender.update();
			//if(this.currentFollow!=null){
			//this.currentFollow.userData.findPath && _ddlsRender.update();
			//this.sunLight.position.set( this.currentFollow.position.x-this.sunLight.position.y*10/18, this.sunLight.position.y, this.currentFollow.position.z-this.sunLight.position.y*5/18 );
			//if(this.sunLight!=null) this.sunLight.target= this.currentFollow;
			//}
			for (var i = 0; i != _engine.lightHelpers.length; i++) {
				_engine.lightHelpers[i].visible && _engine.lightHelpers[i].update();
			}
			_engine.updateCompassAngle();
		};
		this.ddlsRender = new DDLSRender(this.ddlsworld, this.view.scene);
		this.user.init();

		this.debugTell("初始化物理引擎...");
		var _self = this;
		this.physic.init(function () {
			_self.physic.setView(_self.view);
			_self.view.unPause = function () { _physic.start() };
			_self.physic.tell = function () {

				if (_self.showPhyinfo) {
					_self.phyinfo = _self.physic.info();
					_self.gui.tell(' ammo ' + _self.physic.getFps()
						+ '\n solids ' + _self.phyinfo.solids + ' / bodys ' + _self.phyinfo.bodys
						+ '\n softs ' + _self.phyinfo.softs + ' / terrains ' + _self.phyinfo.terrains
						+ '\n cars ' + _self.phyinfo.cars + ' / rays ' + _self.phyinfo.rays
						+ '\n pairs ' + _self.phyinfo.pairs + ' / joints ' + _self.phyinfo.joints
					);
				} else {
					_self.gui.tell('');
				}
			};
			/*_physic.set({
				jointDebug: true,
				gravity:[0,-9.8,0],
			});*/
			_self.physic.getKey = function () { return _self.keys };
			_self.importScripts(['./datas/world.scenes.js'], function () {
				_self.gui.initUI_scenes();
				_self.gui.addExtraOption(_self.physic.setMode.bind(_self.physic));
				_self.scene.create();
			});

		}, "min");
	}

}
export { WEngine }