/*
 * WEngine.js
 * 读取配置控制各个组件 
 */
import { WEBGL } from '../../jsm/libs/WebGL.js';

import * as THREE from '../../jsm/libs/three.module.js';
import {
	Lensflare,
	LensflareElement
} from "../../jsm/three/objects/Lensflare.js";
import { DDSLoader } from '../../jsm/three/loaders/DDSLoader.js';
import { WTextures } from '../../jsm/world/WTextures.js';
import { ConvexBufferGeometry } from '../../jsm/three/geometries/ConvexGeometry.js';
import { ThreeBSP } from '../../jsm/three/utils/ThreeBSP.js';
import { BufferGeometryUtils } from '../../jsm/three/utils/BufferGeometryUtils.js';
import { TerrainData } from '../../jsm/threex/math/TerrainData.js';
import { SimplexNoise } from '../../jsm/three/math/SimplexNoise.js';
import { ShaderExtras } from '../../jsm/threex/shaders/ShaderExtras.js';
import { SuperSky } from '../../jsm/threex/objects/SuperSky.js';
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

import { TWEEN }  from '../../jsm/libs/tween.module.min.js';
import { World as DDLSWorld }  from '../../jsm/ddls/World.js';
import { DDLSRender }  from '../../jsm/ddls/DDLSRender.js';

import { WGui }  from '../../jsm/world/WGui.js';
import { WView }  from '../../jsm/world/WView.js';
import { physic }  from '../../jsm/world/WPhysic.js';
import { WAvatar }  from '../../jsm/world/WAvatar.js';
import { WAnimal }  from '../../jsm/world/WAnimal.js';
import { WMMD }  from '../../jsm/world/WMMD.js';
import { WUser }  from '../../jsm/world/WUser.js';



window.THREE = THREE;
window.TWEEN = TWEEN;
window.world = window.world || {};
window.world.scenes = window.world.scenes || {};

window.WEngine = (function () {
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
	Math.randInt = function (a, b, n) { return Math.lerp(a, b, Math.random()).toFixed(n || 0)*1; };
	Math.int = function(x) { return ~~x; };
	//生成uuid
	Math.generateUUID=function() {
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x7|0x8)).toString(16);
		});
		return uuid;
	};
	
	Math.vectorad = function ( r ) {

		var i = r.length;
		while(i--) r[i] *= Math.torad;
		return r;

	};
	Math.perlin = null;

	Math.noise = function ( v, o ) {

		if( Math.perlin === null ) Math.perlin = new SimplexNoise();

		o = o || {};

		var level = o.level || [1,0.2,0.05];
		var frequency  = o.frequency  || [0.016,0.05,0.2];

		var i, f, c=0, d=0;

		for(i=0; i<level.length; i++){

			f = frequency [i];
			c += level[i] * ( 0.5 + Math.perlin.noise3d( v.x*f, v.y*f, v.z*f ) * 0.5 );
			d += level[i];

		}

		c/=d;

		return c;

	};
	//===添加数学方法===结束========================================================================//
	var _engine = Object.assign( Object.create( THREE.EventDispatcher.prototype), {
		run:false,
		colors: {
			black: 0x000000,
			white: 0xffffff,
			darkGreen: 790292,
			green: 0x0fdb8c,
			brightGreen: 10813330,
			cyan: 0x38FDD9		
		},
		ddlsOffset:new THREE.Vector3(0,0,0),		
		moveObjNames:[],
		objects :[],
		compass : null,
		compassAngle:0,
		bvhReader : null,		
		currentFollow : null,
		isShadow : true,
		ddlsRender : null,
		enableWorldEvent:true,
		addMoveObjName:function(o){_engine.moveObjNames.push(o);if(_engine.moveObjNames.length==1){_engine.follow(o);}},
		enableDDLSDebug : function(b){_engine.ddlsRender.show(b);},
		debugTell : function(s){_engine.gui.log(s);},
		statusTell : function (s) {_engine.gui.tell(s);},
		showDebugPanel : function(v){_engine.gui.showDebugPanel(v)},
		follow : function(objName){
			this.currentFollow = _engine.byName(objName);
			//_physic.move(objName);
			//if(window.AudioContext || window.webkitAudioContext)this.currentFollow.add(_engine.player.listener);
		},
		createRandomColor : function() {return Math.floor( Math.random() * ( 1 << 24 ) );},
		toRad : function ( r ) {var i = r.length;while(i--) r[i] *= Math.torad;return r;},
		createColorMaterial : function( color ) {color = color || this.createRandomColor();return new THREE.MeshPhongMaterial( { color: color } );}
	});
	//===world.core变量===开始
	var mmdHelper;
	var isMMDLoaded = false;
	var isAmmoImport = false;
	var isTouch = !!('ontouchstart' in window);
	var clock = new THREE.Clock();
	var urls = [];
	var results = {};
    var geo = {};
	var sounds = {};
	var actions = {};
	var labels = [];
	var extraGeo = [];
	var lights = [];
	var lightHelpers = [];
	var heros = [];
	var terrains = [];
	var waters = [];
	var cars = [];
    var statics = [];
	var keys = [];
	var keys_tmp = [];
	var terrainData = null;
    var content,contentMesh;
    var targetMouse;
    var raycaster,raycaster_compass;
    var mouse;
    var mouseCoords = new THREE.Vector2();
    var rayCallBack;
    var isWithRay = false;
    var zone;
	var delta;
	var driveSpeed = 0;
	var _font3d;
	var _gui;
	var _user;
	var _view;
	var _physic;
	var _phyinfo;
	var showPhyinfo = false;
	var _ddlsworld,_ddlsRender;
	var ddlsObj=[];
	var ddlsObject=[];
	var ddlsHeros=[];	
	var _animationFrameLoop;
	var perlin = null;
	var axisHelper = null;
	var clickMeasureEnabled = false;
	var sizeGroup = null;
	var sizeDivs=[];
	var tmpI=0;
	var load = 0;
	var isLoading = false;
	var loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {	
		_gui.showProcess(itemsLoaded,itemsTotal,'请稍等,资源加载中...');
		console.log("url=="+url);
	};
	loadingManager.onLoad = ()=>{
		_gui.hideProcess();
	};
	var bvhFileLoader = new THREE.FileLoader( loadingManager );
	bvhFileLoader.setResponseType( 'arraybuffer' );
	var fileLoader = new THREE.FileLoader();
	var audioLoader = new THREE.AudioLoader(loadingManager);
	var fontLoader = new THREE.FontLoader(loadingManager);
	//===world.core变量===结束
	//===用到了定义的变量
	_engine.getKeys = function(){
		keys_tmp = [];
		_engine.moveObjNames.forEach( function( b, id ) {
			if(_engine.currentFollow && b == _engine.currentFollow.name){
				keys_tmp.push(_user.key);
			}else{
				keys_tmp.push([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
			}			
		});
		keys = keys_tmp;
		
	};
    _engine.showAmmoSkeleton = function( b ){
        var i = heros.length;
        while(i--){
			if(heros[i].userData.avatar.physicSkeleton){
				heros[i].userData.avatar.physicSkeleton.showPhyBones(b);
			}
        }
    };
	_engine.playSounds = function(b){
		var i=_engine.objects.length;
		 while( i--){ 
			var o = _engine.objects[i];
			if(o.userData.hasOwnProperty('audios') && o.userData.hasOwnProperty('defaudio') ){
				o.userData.audios[o.userData.defaudio].play();
			}
		}    
	};
	_engine.showHeroCapsule = function( b ){
        var i = heros.length;
        while(i--){
			if(heros[i].userData.capsule){
				heros[i].userData.capsule.visible = b;
			}			
		}
	};
	_engine.showHero = function( v ){
        var i = heros.length;
        while(i--){heros[i].visible = v;}
	};
	_engine.updateHero = function( delta ){
        var i = heros.length;
        while(i--){heros[i].userData.avatar.update(delta);}
	};
	_engine.changeHero=function(){
		var newindex;
		if(_view.camera == _view.cameraInObj){
			_view.camera = _view.cameraFree;
			newindex = 0;
			_engine.follow(_engine.moveObjNames[newindex]);
		}else{
			if( _engine.currentFollow!=null){
				var curIdx =  _engine.moveObjNames.indexOf( _engine.currentFollow.name);
				newindex = curIdx+1;
				if(newindex >= _engine.moveObjNames.length){
					if(_view.cameraInObj.parent != null){
						_view.camera = _view.cameraInObj;
						_engine.currentFollow = null;
					}else{
						newindex = 0;
						_engine.follow(_engine.moveObjNames[newindex]);
					}
				}else{
					_engine.follow(_engine.moveObjNames[newindex]);
				}
			}else{
				_view.camera = _view.cameraInObj;
				_engine.currentFollow = null;
			}
		}
	};
	_engine.showTerrain = function( v ){
        var i = terrains.length;
        while(i--){terrains[i].visible = v;}
	};
	_engine.showAxisHelper = function( v ){
		if(axisHelper){axisHelper.visible = v;}
	};
	_engine.enableClickMeasure = function( b ){
		if(b==false){
			if(sizeGroup != null){
				for(var i=sizeDivs.length-1;i>=0;i--){
					if(sizeDivs[i].parentNode){
						sizeDivs[i].parentNode.removeChild(sizeDivs[i]);
					}
				}
				sizeDivs=[];
				for(var i=0;i<sizeGroup.children.length;i++){
					sizeGroup.remove(sizeGroup.children[i]);
				}

				
				sizeGroup.parent.remove(sizeGroup);
				sizeGroup = null;
			}
		}
		clickMeasureEnabled = b;
	};
	_engine.showPhysicInfo = function(v){
		showPhyinfo = v;
	};
	_engine.getBBoxGeometry = function(obj){
		var box = new THREE.Box3().setFromObject(obj);
		var width = box.max.x - box.min.x;
		var height = box.max.y - box.min.y;
		var depth = box.max.z - box.min.z;
		//得到group立方体边界的宽高和深度，根据这些值，生成一个立方几何体
		var bbox = new THREE.BoxGeometry(width, height, depth);
		return bbox;
		
	};
     _engine.getGeo = function () {

        return geo;

    };

	_engine.generateTexture = function(maxH, data, width, height, colors ) {

		var canvas, canvasScaled, context, image, imageData, vector3, sun, shade;

		vector3 = new THREE.Vector3( 0, 0, 0 );

		sun = _engine.sunLight.position.clone();
		sun.normalize();

		canvas = document.createElement( 'canvas' );
		canvas.width = width;
		canvas.height = height;

		context = canvas.getContext( '2d' );
		context.fillStyle = '#000';
		context.fillRect( 0, 0, width, height );

		image = context.getImageData( 0, 0, canvas.width, canvas.height );
		imageData = image.data;
		for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {
			vector3.x = (data[ j - 2 ]?data[ j - 2 ]:data[ j ]) - (data[ j + 2 ]?data[ j + 2 ]:data[ j ]);
			vector3.y = 2;
			vector3.z = (data[ j - width * 2 ]?data[ j - width * 2 ]:data[ j ]) - (data[ j + width * 2 ]?data[ j + width * 2] : data[ j ]);
			vector3.normalize();
			shade = vector3.dot( sun );
			
			var curXS = data[j]/maxH;
			var curColorVal = 0x000000;
			for(var c=0;c<colors.length;c++){
				if(curXS <= colors[c].ratio){
				  curColorVal = colors[c].color;
				  break;
				}
			}
			var tmColor = new THREE.Color(255,255,255);
			tmColor.setHex(curColorVal);

			imageData[ i ] = tmColor.r*255*shade;
			imageData[ i + 1 ] =  tmColor.g*255*shade;
			imageData[ i + 2 ] = tmColor.b*255*shade;

			//imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
			//imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
			//imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );

		}
		
		context.putImageData( image, 0, 0 );

		// Scaled 4x

		canvasScaled = document.createElement( 'canvas' );
		canvasScaled.width = width * 4;
		canvasScaled.height = height * 4;

		context = canvasScaled.getContext( '2d' );
		context.scale( 4, 4 );
		context.drawImage( canvas, 0, 0 );

		image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
		imageData = image.data;

		for ( var i = 0, l = imageData.length; i < l; i += 4 ) {

			var v = ~ ~ ( Math.random() * 5 );

			imageData[ i ] += v;
			imageData[ i + 1 ] += v;
			imageData[ i + 2 ] += v;

		}

		context.putImageData( image, 0, 0 );

		return canvasScaled;

	};
    _engine.create_terrainc = function ( curO ) {

		var o={
			type:'terrain', 
			name:curO.name, 
			pos : curO.position, 
			size :curO.size,
			sample:curO.sample,
			complexity : curO.complexity,
			flipEdge : curO.flipEdge, 
			hdt : curO.hdt, 
			friction: curO.friction, 
			restitution:curO.restitution,
			group:curO.group||1};
        var i, x, y, n, c;

        o.sample = o.sample == undefined ? [64,64] : o.sample;
        o.size = o.size == undefined ? [100,10,100] : o.size;
        o.pos = o.pos == undefined ? [0,0,0] : o.pos;

        o.lng = o.sample[0] * o.sample[1];
        o.hdata =  new Float32Array( o.lng );
        var colors = new Float32Array( o.lng * 3 );
        var g = new THREE.PlaneBufferGeometry( o.size[0], o.size[2], o.sample[0] - 1, o.sample[1] - 1 );
        g.rotateX( -Math.PI90 );
        var vertices = g.attributes.position.array;
		//===========================高度图测试==========================================================

		WTextures.make({url:curO.heightMapUrl,name:curO.name+'_hmap',onLoad:function(heightTexture){
		var image = heightTexture.image;			
		var scaleX=o.size[0];
		var scaleY=o.size[2];
		var scaleZ=o.size[1];
		var widthSegments = o.sample[0];
		var heightSegments = o.sample[1];
		var canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		var context = canvas.getContext('2d');
		context.drawImage(image, 0, 0);
		var imageD= context.getImageData(0, 0, image.width, image.height);		
		var pix = imageD.data;
		var j=0;
		for (var i = 0, n = pix.length; i < n; i += (4)) {
			var all = pix[i]+pix[i+1]+pix[i+2];
			vertices[j*3+1] = o.hdata[j++] = all/ 3/ 255 * scaleZ;	
			//o.hdata[j++] = all/ 3/ 255 * scaleZ;			
		}
		var terrainPos =  new THREE.Vector3(o.pos[0],o.pos[1],o.pos[2]);
		//type:hdata,hmap,harray
		//var terrainSource = {type:'hmap',data:image};
		var terrainSource = {type:'hdata',data:o.hdata};
		terrainData = new TerrainData(terrainPos,o.size[0], o.size[2],scaleZ,terrainSource,1, o.sample[0], o.sample[1]);
		if(curO.hasOwnProperty("onTerrainObjects")){
			_engine.createOnTerrainObjects(curO,terrainPos,terrainData);
		}

		//terrainData 测试 碰撞测试
		/*var s, x, y,z;
		for(var i = 0; i<100; i++){
			x = Math.rand(-800, 800);
			z = Math.rand(500, 2000);
			s = Math.rand(50, 100);
			y = terrainData.getHeightAt(x,z)+s/2;
			console.log("x="+x+" y="+y+" z="+z);
			_engine.add({ type:'box', size:[s,s,s],group:64, pos:[x,y,z], mass:0});
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


		var texture = new THREE.CanvasTexture( _engine.generateTexture(o.size[1], o.hdata, o.sample[0], o.sample[1],curO.colors ) );
		texture.wrapS = THREE.ClampToEdgeWrapping;
		texture.wrapT = THREE.ClampToEdgeWrapping;		
        extraGeo.push( g );
		var terrainMaterial = new THREE.MeshPhongMaterial( { map: texture } );
		BufferGeometryUtils.computeTangents( g );
		var mesh = new THREE.Mesh( g, terrainMaterial );
		mesh.userData = {maxH:o.size[1],hdata: o.hdata,width:o.sample[0],height: o.sample[1],colors:curO.colors};
		mesh.updateMaterial = function(m){
			this.material.map.image = _engine.generateTexture(this.userData.maxH,
			this.userData.hdata, 
			this.userData.width, 
			this.userData.height,
			this.userData.colors);	
			this.material.map.needsUpdate = true;				
		};
		//==========================================================================
        
		
		//var mesh = new THREE.Mesh( g, mat['basic'] );
        mesh.position.set( o.pos[0], o.pos[1], o.pos[2] );
		//mesh.visible = false;
        mesh.castShadow = false;	
		mesh.receiveShadow = true;
        terrains.push( mesh );
		o.mesh = mesh;
        _engine.add(  o );

		}});	
    };

	//添加对象
	_engine.addObject = function (_obj,bAddVisual) {
	  _engine.objects.push(_obj);
	  if(bAddVisual) _view.addVisual(_obj);
	};


	 //创建二维平面-长方形
	_engine.createPlaneGeometry = function (_obj) {
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

	  if (typeof _obj.pic == "string") {//传入的材质是图片路径，使用 textureloader加载图片作为材质
		  var texture = WTextures.make({url:_obj.pic,name:_obj.name});
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
	  var tmMat = new THREE.MeshBasicMaterial(MaterParam);

	  var plane = new THREE.Mesh(new THREE.PlaneGeometry(_obj.width, _obj.height, 1, 1),tmMat);
	  plane.position.x = _obj.position.x;
	  plane.position.y = _obj.position.y;
	  plane.position.z = _obj.position.z;
	  plane.rotation.x = _obj.rotation.x;
	  plane.rotation.y = _obj.rotation.y;
	  plane.rotation.z = _obj.rotation.z;
	  return plane;
	};
	 //创建玻璃
	_engine.createGlasses = function (_obj) {
	  var tmpobj = _engine.createPlaneGeometry( _obj);
	  _engine.addObject(tmpobj);
	  _obj.rotation.y = Math.PI + _obj.rotation.y;
	  var tmpobj2 = _engine.createPlaneGeometry( _obj);
	  _engine.addObject(tmpobj2,true);
	};

	
  //挖洞
	_engine.createHole = function (_obj,bSetPos) {

	  var _commonThick =  0.4;//墙体厚度
	  var _commonLength =  1;//墙体长度
	  var _commonHeight =  3;//墙体高度
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
			  size: [wallLength,(_obj.height || _commonHeight),wallWidth],
			  rotation: _obj.rotation,
			  position:[positionX,positionY,positionZ],
			  uuid: _obj.uuid,
			  name: _obj.name,
			  style: {
				  skinColor: _commonSkin,
				  skin: _obj.skin
			  }
		  }
		  var _cube = _engine.createCube(cubeobj,bSetPos);
		  _cube.userData = {size:cubeobj.size,position:cubeobj.position};
		  return _cube;
	};

	//模型合并 使用ThreeBSP插件mergeOP计算方式 -表示减去 +表示加上 
	_engine.mergeModel = function ( mergeOP, _fobj, _sobj,exparam) {

	  var fobjBSP = new ThreeBSP(_fobj);
	  var sobjBSP = new ThreeBSP(_sobj);
	  var resultBSP = null; 
	  if (mergeOP == '-') {
		  resultBSP = fobjBSP.subtract(sobjBSP);
	  } else if (mergeOP == '+') {
		  resultBSP = fobjBSP.union(sobjBSP);
	  } else if (mergeOP == '#') {
		  _sobj.updateMatrix();
		  _fobj.geometry.merge(_sobj.geometry, _sobj.matrix);
		  return _fobj;
	  } else if (mergeOP == '&') {//交集
		  resultBSP = fobjBSP.intersect(sobjBSP);
	  } else {
		  return _fobj;
	  }

	  var tmMat = null;
	  if(exparam.matname){
		  tmMat = _view.getMaterial(exparam.matname);
	  }else{
		  tmMat = new THREE.MeshPhongMaterial(exparam.style);
	  }
	  
	  var result = resultBSP.toMesh(tmMat);
	  result.material.flatShading = true;
	  result.geometry.computeFaceNormals();
	  result.geometry.computeVertexNormals();
	  result.uuid= _fobj.uuid+mergeOP+_sobj.uuid;
	  result.name=_fobj.name+mergeOP+_sobj.name;
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
				  inSideWall = _engine.PointInPoly({x:va.x,y:va.z},polypath) && _engine.PointInPoly({x:vb.x,y:vb.z},polypath) && _engine.PointInPoly({x:vc.x,y:vc.z},polypath);
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
	};
	_engine.PointInPoly = function(pt, poly) {
		for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && (c = !c);
		return c;
	};

//创建盒子体
	_engine.createCube = function (_obj,bSetPos) {
	  var _width = _obj.size[0] || 1000;//默认1000
	  var _depth = _obj.size[2] || _width;
	  var _height = _obj.size[1] || 10;
	  var _x = _obj.position[0] || 0, _y = _obj.position[1] || 0, _z = _obj.position[2] || 0;
	  var skinColor = _obj.style.skinColor || 0x98750f;
	  var cubeGeometry = new THREE.CubeGeometry(_width, _height, _depth, 0, 0, 1);

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
		  skin_up_obj = _engine.createSkinOptionOnj(_width, _depth, _obj.style.skin.skin_up, cubeGeometry, 4);
		  //下
		  skin_down_obj = _engine.createSkinOptionOnj(_width, _depth, _obj.style.skin.skin_down, cubeGeometry, 6);
		  //前
		  skin_fore_obj = _engine.createSkinOptionOnj(_width, _height, _obj.style.skin.skin_fore, cubeGeometry, 0);
		  //后
		  skin_behind_obj = _engine.createSkinOptionOnj(_width, _height, _obj.style.skin.skin_behind, cubeGeometry, 2);
		  //左
		  skin_left_obj = _engine.createSkinOptionOnj(_depth, _height, _obj.style.skin.skin_left, cubeGeometry, 8);
		  //右
		  skin_right_obj = _engine.createSkinOptionOnj(_depth, _height, _obj.style.skin.skin_right, cubeGeometry, 10);
	  }
	  var cubeMaterialArray = [];
	  cubeMaterialArray.push(new THREE.MeshLambertMaterial(skin_fore_obj));
	  cubeMaterialArray.push(new THREE.MeshLambertMaterial(skin_behind_obj));
	  cubeMaterialArray.push(new THREE.MeshLambertMaterial(skin_up_obj));
	  cubeMaterialArray.push(new THREE.MeshLambertMaterial(skin_down_obj));
	  cubeMaterialArray.push(new THREE.MeshLambertMaterial(skin_right_obj));
	  cubeMaterialArray.push(new THREE.MeshLambertMaterial(skin_left_obj));

	  var cube = new THREE.Mesh(cubeGeometry, cubeMaterialArray);
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
	};



//创建空柜子
	_engine.createEmptyCabinet = function ( _obj) {
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
	  var bLength = _obj.size[0],bHeight = _obj.size[1],bWidth =  _obj.size[2],bThick = _obj.size[3];
	  //创建五个面
	  //上
	  var upobj= {
		  show: true,
		  uuid: "",
		  name: '',
		  objType: 'cube',
		  size: [(bLength+0.01),(bThick + 0.01),bWidth],
		  position:[0.01,(bHeight/2-bThick/2),0],
		  style: {
			  skinColor: _obj.skin.skinColor,
			  skin: _obj.skin.skin_up.skin
		  }
	  }
	  var upcube = _engine.createCube(upobj,true);
	  //左
	  var leftobj = {
		  show: true,
		  uuid: "",
		  name: '',
		  objType: 'cube',
		  size: [bLength,bHeight,bThick],
		  position:[0,-(bHeight / 2 - bThick / 2),(0 - (bWidth / 2 - bThick / 2) - 0.01)],
		  style: {
			  skinColor: _obj.skin.skinColor,
			  skin: _obj.skin.skin_left.skin
		  }
	  }
	  var leftcube = _engine.createCube(leftobj,true);
	  var Cabinet = _engine.mergeModel( '#', upcube, leftcube);
	  //右
	  var Rightobj = {
		  show: true,
		  uuid: "",
		  name: '',
		  objType: 'cube',
		  size: [bLength,bHeight,bThick],
		  position:[0,-(bHeight / 2 - bThick / 2),((bWidth / 2 - bThick / 2)+0.01)],
		  style: {
			  skinColor: _obj.skin.skinColor,
			  skin: _obj.skin.skin_right.skin
		  }
	  }
	  var Rightcube = _engine.createCube(Rightobj,true);
	  Cabinet = _engine.mergeModel('#', Cabinet, Rightcube);
	  //后
	  var Behidobj = {
		  show: true,
		  uuid: "",
		  name: '',
		  objType: 'cube',
		  size: [bThick,bHeight,bWidth],
		  position:[((bLength / 2 - bThick / 2)+0.01),-(bHeight / 2 - bThick / 2),0],
		  style: {
			  skinColor: _obj.skin.skinColor,
			 skin: _obj.skin.skin_behind.skin
		  }
	  }
	  var Behindcube = _engine.createCube( Behidobj,true);
	  Cabinet = _engine.mergeModel( '#', Cabinet, Behindcube);
	  //下
	  var Downobj = {
		  show: true,
		  uuid: "",
		  name: '',
		  objType: 'cube',
		  size: [(bLength+0.01),bThick,bWidth],
		  position:[-0.01,(-(bHeight- bThick)-0.01),0],
		  style: {
			  skinColor: _obj.skin.skinColor,
			  skin: _obj.skin.skin_down.skin
		  }
	  }
	  var Downcube = _engine.createCube( Downobj,true);
	  Cabinet = _engine.mergeModel( '#', Cabinet, Downcube);
	 
	  var tempobj = new THREE.Group();
	  tempobj.add(Cabinet);
	  tempobj.name = _obj.name;
	  tempobj.uuid = _obj.uuid;
	  Cabinet.name = _obj.shellname,
	  _engine.objects.push(Cabinet);
	  //tempobj.position = Cabinet.position;
	  //tempobj.position = Cabinet.position;
	  //门
	  if (_obj.doors != null && typeof (_obj.doors) != 'undefined') {
		  var doors = _obj.doors;
		  if (doors.skins.length == 1) {//单门
			  var singledoorobj = {
				  show: true,
				  uuid:"",
				  name: _obj.doors.doorname[0],
				  objType: 'cube',
				  size: [bThick,bHeight,bWidth],
				  position:[( - bLength / 2 - bThick / 2),0,0],
				  style: {
					  skinColor: _obj.doors.skins[0].skinColor,
					  skin: _obj.doors.skins[0]
				  }
			  }
			  var singledoorcube = _engine.createCube(singledoorobj,true);
			  _engine.objects.push(singledoorcube);
			  tempobj.add(singledoorcube);
		  } else if (doors.skins.length > 1) {//多门


		  }

	  }

	  if (_obj.rotation != null && typeof (_obj.rotation) != 'undefined' && _obj.rotation.length > 0) {
		  _obj.rotation.forEach( function (rotation_obj, index) {
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
	};

	//创建皮肤参数对象
	_engine.createSkinOptionOnj = function (flength, fwidth, _obj, _cube, _cubefacenub) {
	  if (_engine.commonFunc.hasObj(_obj)) {
		  if (_engine.commonFunc.hasObj(_obj.imgurl)) {
			  return {map: _engine.createSkin(flength, fwidth, _obj),transparent:true};
		  } else {
			  if (_engine.commonFunc.hasObj(_obj.skinColor)) {
				  _cube.faces[_cubefacenub].color.setHex(_obj.skinColor);
				  _cube.faces[_cubefacenub + 1].color.setHex(_obj.skinColor);
			  }
			  return {vertexColors: THREE.FaceColors};
		  }
	  } else {
		  return {vertexColors: THREE.FaceColors};
	  }
	};

 //创建皮肤
	_engine.createSkin = function (flength,fwidth,_obj) {
	  var imgwidth = 128,imgheight=128;
	  if (_obj.width != null&& typeof (_obj.width) != 'undefined') {
		  imgwidth = _obj.width;
	  }
	  if (_obj.height != null && typeof (_obj.height) != 'undefined') {
		  imgheight = _obj.height;
	  }
	  var texture = WTextures.make({url:_obj.imgurl,name:_obj.name});
	  var _repeat = false;
	  if (_obj.repeatx != null && typeof (_obj.repeatx) != 'undefined' && _obj.repeatx==true) {
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
	};



//通用方法
	_engine.commonFunc={
	  //判断对象
	  hasObj: function (_obj) {
		  if (_obj != null && typeof (_obj) != 'undefined') {
			  return true;
		  }else{
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
	  cloneByName: function(_objname,newparam){
		  var fobj = _engine.commonFunc.findObject(_objname);
		  var newobj = fobj.clone();		
		  if (newobj.children != null && newobj.children.length > 1) {
			  newobj.children.forEach(function (obj,index) {
				  obj.name = newparam.childrenname[index];
				  _engine.objects.push(obj);
			  });
		  }
		  newobj.name = newparam.name;
		  newobj.uuid = newparam.uuid;
		  var size = newobj.userData.size;
		  delete newobj.userData;
		  newobj.userData={size: size};
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
		  var newobj = _engine.commonFunc.cloneByName(_objname,newparam);

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
			  newparam.rotation.forEach( function (rotation_obj,index) {
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
		  var texture = WTextures.make({url:_obj.imgurl,name:_obj.name});
		  var spriteMaterial = new THREE.SpriteMaterial({ map: texture, useScreenCoordinates: false });
		  var sprite = new THREE.Sprite(spriteMaterial);
		  sprite.name = _obj.name;
		  sprite.position.x = _fobj.position.x + _obj.position.x;
		  sprite.position.y = _fobj.position.y + _obj.position.y;
		  sprite.position.z = _fobj.position.z + _obj.position.z;
		  if (_engine.commonFunc.hasObj(_obj.size)) {
			  sprite.scale.set(_obj.size.x, _obj.size.y);
		  } else {
			  sprite.scale.set(1,1);
		  }
		  _engine.addObject(sprite);
	  },
	  //添加文字
	  makeTextSprite: function (_objname, parameters)
	  {
		  
		 if ( parameters === undefined ) parameters = {};
		  var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
		  var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
		  var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
		  var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };
		  var message = parameters.hasOwnProperty("message") ? parameters["message"] : "不知道";
		  var x = parameters.hasOwnProperty("position") ? parameters["position"].x : 0;
		  var y = parameters.hasOwnProperty("position") ? parameters["position"].y : 0;
		  var z = parameters.hasOwnProperty("position") ? parameters["position"].z : 0;
		  var canvas = document.createElement('canvas');
		  var cxt = canvas.getContext('2d');
		  cxt.font = "Bold " + fontsize + "px " + fontface;
		  var metrics = cxt.measureText( message );
		  canvas.width = metrics.width;
		  canvas.height = fontsize+2*borderThickness;
		  cxt.lineWidth = borderThickness;

		  cxt.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";		  
		  cxt.fillText(message, borderThickness, fontsize + borderThickness);
		  var texture = new THREE.Texture(canvas);
		  texture.needsUpdate = true;
		  var spriteMaterial = new THREE.SpriteMaterial( { map: texture} );
		  var sprite = new THREE.Sprite(spriteMaterial);

		  var _fobj = _engine.commonFunc.findObject(_objname);
		  if(_fobj != null && parameters.parent==null){
			  	sprite.position.x =_fobj.position.x + x;
				sprite.position.y = _fobj.position.y + y;
				sprite.position.z = _fobj.position.z + z;
		  }else{
				sprite.position.x = x;
				sprite.position.y = y;
				sprite.position.z = z;
		  }

		  sprite.name = parameters.name;
		  sprite.scale.set(canvas.width*0.01, canvas.height*0.01,1);
		  if(parameters.parent){
			  parameters.parent.add(sprite);
		  }else{
			  _engine.addObject(sprite);
		  }
		  
		}
	};
	//=============================================================================================
	//=============================================================================================
	_engine.has = function( name ){
		return _physic.has( name );
	};
	_engine.byName = function( name ){
		return _physic.byName( name );
	};
	_engine.add = function(o){
		//对配置进行修补
        o.mass = o.mass == undefined ? 0 : o.mass;
        o.type = o.type == undefined ? 'box' : o.type;
		if(o.mass == 0 && o.type != 'character') o.group = 2;
		if(o.position){
			o.pos = o.position;
			delete (o.position);
		}		
        o.pos = o.pos == undefined ? [0,0,0] : o.pos;
		if(o.name!='pathfindzone'){
			if(o.pos){o.pos = _engine.offsetPos(o.pos);}else{o.pos = _engine.offsetPos([0,0,0]);} 
		}
		var rot = o.rot = o.rot == undefined ? [0,0,0] : o.rot;
		var hasBlockSize =  ( o.size == undefined && o.blockSize == undefined )? false : true;
		o.size = o.size == undefined ? [1,1,1] : o.size;
        if(o.size.length == 1){ 
			o.size[1] = o.size[0]; 
		}else if(o.size.length == 2){ o.size[2] = o.size[0]; }

        if(o.geoSize){
            if(o.geoSize.length == 1){ o.geoSize[1] = o.geoSize[0]; }
            if(o.geoSize.length == 2){ o.geoSize[2] = o.geoSize[0]; }
        }    	
		//解析材质
        var material;
		if( o.flag === 2 ){
			material = _view.getMaterial('kinect');
		}else if(o.material !== undefined) {
			if ( o.material.constructor === String ) {				
				if("random" == o.material){
					material = _engine.createColorMaterial();
				}else{
					material = _view.getMaterial(o.material);
				}
			}
	    	else {
				material = o.material;
			}			

		}else{ 
		
			if ( o.mass === 0 && ! o.kinematic ) material = _view.getMaterial('static');
	    	else material = _view.getMaterial('move');
	    	if ( o.kinematic ) material = _view.getMaterial('kinematic');
		}
		o.material = material;
		
		var viewO = _physic.add(o);
		if(o.roadblock){
			var blockSize = o.blockSize == undefined ? o.size : o.blockSize;
			if(hasBlockSize){
				ddlsObj[ddlsObj.length] = _ddlsworld.addObject({ x:o.pos[0], y:o.pos[2], w:blockSize[0]*0.5, h:blockSize[2]*0.5, r:rot[1]});
			}else{
				var box = new THREE.Box3().setFromObject(viewO);
				ddlsObj[ddlsObj.length] = _ddlsworld.addObject({ x:o.pos[0], y:o.pos[2], w:(box.max.x - box.min.x)*0.5, h:(box.max.z - box.min.z)*0.5, r:rot[1]});
			}		
		}	
		return viewO;
	};
	_engine.addGroup = function(oAry){
		for(var i=0;i<oAry.length;i++){
			if(oAry[i].name!='pathfindzone'){
				if(oAry[i].pos){oAry[i].pos = _engine.offsetPos(oAry[i].pos);}else{oAry[i].pos = _engine.offsetPos([0,0,0]);} 
			}
		}
		_physic.addGroup(oAry);
	};
	_engine.options = function(o, direct){
		_physic.options(o, direct);
	};
	_engine.offsetPos = function(pos){
		return [pos[0]+_engine.ddlsOffset.x,pos[1]+_engine.ddlsOffset.y,pos[2]+_engine.ddlsOffset.z];
	};
	//=====================================================
	//创建区域开始
	//=====================================================
	_engine.create_custom = function(curO){
		curO.customFunc(_engine);
	};
	_engine.create_superSky = function(curO){
		var sky;
		var sets_S = {
			t:0,
			fog:0,
			cloud_size: .45,
			cloud_covr: .3,
			cloud_dens: 40,

			inclination: 45,//倾斜度
			azimuth: 90,//地平经度
			hour:12,

		};
		var onSkyReady = function () {
			sky.setData(sets_S);
			var t = terrains.length;
			while(t--){
				terrains[t].material.envMap = sky.envMap;
				terrains[t].borderMaterial.envMap = sky.envMap;
			}
			var w = waters.length;
			while(w--){
				waters[w].material.uniforms.sunDirection.value.copy(  sky.day > 0 ? sky.sunPosition : sky.moonPosition );
				waters[w].material.uniforms.sunColor.value = sky.day > 0 ? sky.sun.color : sky.moon.color;
			}
		};
		sky = new SuperSky({ scene:_view.scene, renderer:_view.renderer, size:100, callback:onSkyReady });
		
		_view.addVisual( sky );
		statics.push( sky );
	};
	_engine.create_sky = function(curO){
		var sky = new Sky();
		sky.scale.setScalar( 450000 );
		_engine.sky = sky;
		var sunSphere = new THREE.Mesh(
			new THREE.SphereBufferGeometry( 20000, 16, 8 ),
			new THREE.MeshBasicMaterial( { color: 0xffffff } )
		);
		sunSphere.position.y = - 700000;
		sunSphere.visible = curO.sunVisible;
		_engine.sunSphere = sunSphere;
		_view.scene.add( sunSphere );
		statics.push( sunSphere );
		var uniforms = sky.material.uniforms;

		uniforms[ 'turbidity' ].value = 10;
		uniforms[ 'rayleigh' ].value = 2;
		uniforms[ 'luminance' ].value = 1;
		uniforms[ 'mieCoefficient' ].value = 0.005;
		uniforms[ 'mieDirectionalG' ].value = 0.8;

		//===
		this.sunLight = new THREE.DirectionalLight( 0xffffff, 1 );
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
		if(_engine.has( 'pathfindzone' )){
			this.sunLight.target = _engine.byName('pathfindzone');
		}else{
			this.sunLight.target.position.set(0,0,0);
		}
		
		
		
		/*var textureFlare3 = WTextures.make({url:"sky/lensflare3.png",name:'lensflare3'});
		var lensflare = new Lensflare();
		lensflare.addElement( new LensflareElement( WTextures.make({url:"sky/lensflare0.png",name:'lensflare0'}), 100*0.1, 0, this.sunLight.color ) );
		lensflare.addElement( new LensflareElement( textureFlare3, 60, 0.6, this.sunLight.color ) );
		lensflare.addElement( new LensflareElement( textureFlare3, 70, 0.7, this.sunLight.color ) );
		lensflare.addElement( new LensflareElement( textureFlare3, 120, 0.9, this.sunLight.color ) );
		lensflare.addElement( new LensflareElement( textureFlare3, 70, 1, this.sunLight.color ) );
		this.sunLight.add(lensflare);*/
		
		_view.addVisual( this.sunLight );

		var dirLightHeper = new THREE.DirectionalLightHelper( this.sunLight, 10 );			
		dirLightHeper.visible = false;				

		lightHelpers.push(dirLightHeper);
		_view.addVisual( dirLightHeper );
		
		_engine.objects.push(this.sunSphere);
		_engine.objects.push(this.sunLight);
		_engine.objects.push(dirLightHeper);

		_engine.setHour(curO.hour);
	};
	_engine.create_compass = function(curO){
		WTextures.make({url:curO.texture.url,name:curO.name,onLoad:function(texture){
			var spriteMaterial = new THREE.SpriteMaterial({ map : texture, opacity:1  });
			_engine.compass  = new THREE.Sprite(spriteMaterial);
			var width = spriteMaterial.map.image.width;
			var height = spriteMaterial.map.image.height;
			_engine.compass.scale.set( width, height, 1 );
			_engine.compass.position.set((-window.innerWidth / 2)+width/2,(window.innerHeight/2)-height/2,0);
			_view.sceneRenderHUDSprite.add(_engine.compass );			
			
			var renderFunction = function(){	
				spriteMaterial.rotation = _engine.compassAngle;												
			};
			_engine.scene.loopFunctions.push(renderFunction);
		}});
	};
	_engine.create_fog = function(curO){
		_view.addFog(curO);
	};
	_engine.create_snow = function(curO){
		var particles, snowGeometry, materials = [], parameters, i, h, color, sprite, size;
		snowGeometry = new THREE.Geometry();
		var sprite1 = WTextures.make({url:'sprites/snowflake1.png',name:'snowflake1'});
		var sprite2 = WTextures.make({url:'sprites/snowflake2.png',name:'snowflake2'});
		var sprite3 = WTextures.make({url:'sprites/snowflake3.png',name:'snowflake3'});
		var sprite4 = WTextures.make({url:'sprites/snowflake4.png',name:'snowflake4'});
		var sprite5 = WTextures.make({url:'sprites/snowflake5.png',name:'snowflake5'});

		for ( i = 0; i < 10000; i ++ ) {

			var vertex = new THREE.Vector3();
			vertex.x = Math.random() * curO.size[0] - curO.size[0]*0.5;
			vertex.y = Math.random() * curO.size[1] - curO.size[1]*0.5;
			vertex.z = Math.random() * curO.size[2] - curO.size[2]*0.5;

			snowGeometry.vertices.push( vertex );

		}
		var scale = 0.01;
		parameters = [
			[ [1.0, 0.2, 0.5], sprite2, 20*scale ],
			[ [0.95, 0.1, 0.5], sprite3, 15*scale ],
			[ [0.90, 0.05, 0.5], sprite1, 10*scale ],
			[ [0.85, 0, 0.5], sprite5, 8*scale ],
			[ [0.80, 0, 0.5], sprite4, 5*scale ]
		];

		for ( i = 0; i < parameters.length; i ++ ) {

			color  = parameters[i][0];
			sprite = parameters[i][1];
			size   = parameters[i][2];

			materials[i] = new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent : true } );
			materials[i].color.setHSL( color[0], color[1], color[2] );

			particles = new THREE.Points( snowGeometry, materials[i] );

			particles.rotation.x = Math.random() * 6;
			particles.rotation.y = Math.random() * 6;
			particles.rotation.z = Math.random() * 6;

			_view.addVisual( particles );
			statics.push( particles );
		}

		var renderFunction = function(){
			var time = Date.now() * 0.00005;
			for ( i = 0; i < _view.scene.children.length; i ++ ) {
				var object = _view.scene.children[ i ];
				if ( object instanceof THREE.Points ) {
					object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );
				}
			}
			for ( i = 0; i < materials.length; i ++ ) {
				color = parameters[i][0];
				h = ( 360 * ( color[0] + time ) % 360 ) / 360;
				materials[i].color.setHSL( h, color[1], color[2] );
			}
		};
		_engine.scene.loopFunctions.push(renderFunction);
	};
	_engine.create_terrain = function(curO){
		var o = { 
			type:curO.type,
			terrainType:curO.terrainType,
			name:curO.name, 
			pos :curO.position, // terrain position
			size : curO.size, // terrain size in meter
			sample : curO.sample, // number of subdivision
			frequency : curO.frequency, // frequency of noise
			level : curO.level, // influence of octave
			expo: curO.expo ||0,
			hdt : curO.hdt ||'PHY_FLOAT', // height data type PHY_FLOAT, PHY_UCHAR, PHY_SHORT
			friction: curO.friction || 0.5, 
			bounce: curO.bounce || 0.0,
			water: curO.water || false,
			border: curO.border || true,
			bottom: curO.bottom || true,
			heightMapUrl:curO.heightMapUrl,
			maxSpeed: curO.maxSpeed || 0.02
		};
		o.physicsUpdate = function(name ,heightData,terrainMesh){
			var terrainPos =  new THREE.Vector3(o.pos[0],o.pos[1],o.pos[2]);	
			var terrainSource = {type:'hdata',data:heightData};
			terrainData = new TerrainData(terrainPos,o.size[0], o.size[2],o.size[1],terrainSource,1, o.sample[0], o.sample[1]);
			if(curO.hasOwnProperty("onTerrainObjects")){
				_engine.createOnTerrainObjects(curO,terrainPos,terrainData);
			}
		};
		var terrainO = _engine.add( o );
		terrains.push( terrainO );		
	};
	_engine.create_water = function( curO ){
		var waterGeometry = new THREE.PlaneBufferGeometry( curO.size[0], curO.size[1] );
			
		if(curO.waterType == 'ocean'){
			var sets_W = {
				textureWidth: 512,
				textureHeight: 512,
				waterNormals: _view.texture({url:'water/waternormals.jpg', name:'waternormals',repeat:[2,2],anisotropy:16}),
				alpha: 0.5,
				sunDirection: _engine.sunLight.position.clone().normalize(),
				sunColor: 0xffffff,
				waterColor: 0x001e0f,
				distortionScale: 3.7,
				fog: _view.scene.fog !== undefined
			};
			var water = new Water(waterGeometry, sets_W );
			water.rotation.x = - Math.PI / 2;
			water.position.set( curO.position[0], curO.position[1], curO.position[2] );
			water.position.add(_engine.ddlsOffset);
			water.castShadow = true;
			water.receiveShadow = true;
			_view.addVisual(water);
			waters.push( water );
			statics.push( water );				
			var renderFunction = function(){					
				water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
			};
			_engine.scene.loopFunctions.push(renderFunction);
		}else if(curO.waterType == 'water'){
			var params = {
				color: '#ffffff',
				scale: 4,
				flowX: 1,
				flowY: 1
			};
			//1024
			var water2 = new Water2( waterGeometry, {
				color: params.color,
				scale: params.scale,
				flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
				textureWidth: 512,
				textureHeight: 512
			} );
			water2.rotation.x = - Math.PI / 2;
			water2.position.set( curO.position[0], curO.position[1], curO.position[2] );
			water2.position.add(_engine.ddlsOffset);
			water2.castShadow = true;
			water2.receiveShadow = true;

			_view.addVisual( water2 );
			waters.push( water2 );
			statics.push( water2 );
		}
	};
	_engine.create_rollercoaster = function( curO ){
		var PI2 = Math.PI * 2;
		var curve = ( function () {
			var vector = new THREE.Vector3();
			return {
				getPointAt: curO.getPointAt,
				getTangentAt: function ( t ) {
					var delta = 0.0001;
					var t1 = Math.max( 0, t - delta );
					var t2 = Math.min( 1, t + delta );
					return vector.copy( this.getPointAt ( t2 ) ).sub( this.getPointAt( t1 ) ).normalize();
				}
			};

		} )();

		var geometry = new RollerCoasterGeometry( curve, curO.segments[0]);
		var material = new THREE.MeshStandardMaterial( {
			roughness: 0.1,
			metalness: 0,
			vertexColors: THREE.VertexColors
		} );
		var mesh = new THREE.Mesh( geometry, material );
		mesh.castShadow = true;
		_view.addVisual( mesh );
		statics.push( mesh );
		if(curO.haslifter){
			var geometry = new RollerCoasterLiftersGeometry( curve, curO.segments[1] ,curO.nolifter);
			var material = new THREE.MeshStandardMaterial( {
				roughness: 0.1,
				metalness: 0
			} );
			var mesh = new THREE.Mesh( geometry, material );
			mesh.position.y = 0.1;
			mesh.castShadow = true;
			_view.addVisual( mesh );
			statics.push( mesh );
		}

		var train = new THREE.Object3D();
		train.halfExtent={x:0,y:0,z:0};
		//_view.camera.rotation.y = Math.PI;
		train.add( _view.cameraInObj);
		_view.addVisual( train );
		statics.push( train );
		var position = new THREE.Vector3();
		var tangent = new THREE.Vector3();

		var lookAt = new THREE.Vector3();

		var velocity = 0;
		var progress = 0;

		var renderFunction = function(delta){
			var delta2 = delta * driveSpeed;
			
			//

			progress += velocity * delta2;
			progress = progress % 1;

			position.copy( curve.getPointAt( progress ) );
			position.y += 3*0.1;

			train.position.copy( position );

			tangent.copy( curve.getTangentAt( progress ) );

			velocity -= tangent.y * 0.0000015 * delta2;
			velocity = Math.max( velocity, 0.00004 );

			train.lookAt( lookAt.copy( position ).sub( tangent ) );
		};
		_engine.scene.loopFunctions.push(renderFunction);
	};
	_engine.create_plane = function( curO ){
		_engine.add({ 
			type:'plane', 
			name:curO.name||Math.generateUUID(),
			mass:curO.mass,
			pos : curO.position, 
			rot : curO.rot, 
			group:curO.group||1, 
			friction:0.5, 
			restitution:0.9 }); // infinie plane	
	};
	_engine.create_box = _engine.create_hardbox  = function(curO){
		if(curO.hasOwnProperty("conFunc")){
			var confs = curO.conFunc(_engine);
			for(var i=0,il=confs.length; i<il; i++){								
				_engine.add(confs[i]);
			}
		}else{
			if(curO.hasOwnProperty("positions")){
				for(var i=0,il=curO.positions.length; i<il; i++){
					var rot = curO.rot || [0,0,0];
					_engine.add({ 
						type:curO.type,								 
						name:Math.generateUUID(),
						roadblock:curO.roadblock,
						size:curO.size,
						mass:curO.mass,								
						pos:curO.positions[i],
						sounds:curO.sounds||null,
						rot : [rot[0],rot[1],rot[2]],								 
						group:curO.group||1, 
						breakable:curO.breakable||false,
						breakOption:curO.breakOption !== undefined ? curO.breakOption : [ 250, 1, 2, 1 ],							
						friction:0.5, 
						restitution:0.9,
						material:curO.material});
				}
			}else{
				_engine.add({ 
					type:curO.type,
					name:curO.name||Math.generateUUID(),
					roadblock:curO.roadblock,
					size:curO.size, 
					mass:curO.mass, 
					pos:curO.position,
					sounds:curO.sounds||null,
					rot : curO.rot,
					group:curO.group||1, 
					breakable:curO.breakable||false,
					breakOption:curO.breakOption !== undefined ? curO.breakOption : [ 250, 1, 2, 1 ],							
					friction:0.5, 
					restitution:0.9,
					material:curO.material});
			}
		}
	};
	_engine.create_sphere  = function(curO){
		_engine.add({ 
			type:'sphere',
			name:curO.name||Math.generateUUID(),
			roadblock:curO.roadblock,
			size:[curO.radius], 
			mass:curO.mass,
			pos:curO.position,
			sounds:curO.sounds||null,
			group:curO.group||1, 
			state:4, 
			friction:0.4, 
			restitution:0.9,
			material:curO.material});
	};
	_engine.create_convex  = function(curO){
		_engine.add({ 
			type:'convex',
			name:curO.name||Math.generateUUID(),
			roadblock:curO.roadblock,
			blockSize:curO.blockSize,
			v:curO.pointsfun(),
			shape:new ConvexBufferGeometry( curO.pointsfun() ),
			mass:curO.mass,
			pos:curO.position,
			rot:curO.rot,
			group:curO.group||1, 
			breakable:curO.breakable||false, 
			state:4, 
			friction:0.4, 
			restitution:0.9,
			material:curO.material});
	};
	_engine.getMeshAndGeo = function(curO){
		var curMesh;
		if(curO.modelName){
			curMesh = _view.getModel(curO.modelName);
		}else{
			curMesh = _view.getMesh(curO.meshName);
		}				
		var curGeo;
		if(curMesh==null){
			alert("模型:"+curO.meshName+"找不到！");
			return;
		}else if(curMesh.isMesh){
			curGeo = curMesh.geometry;
		}else{
			var geos=[];
			curMesh.traverse(function (child) {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;							
					child.material.alphaTest=0.1;
					child.material.envMap = _view.getEnvmap();
					child.material.envMapIntensity = 1.5;
					//console.log(child);
					//console.log(child.material.alphaTest);	
					var cloneGeo = child.geometry.clone();
					//有的模型本身scale 不是[1,1,1]
					cloneGeo.applyMatrix4( new THREE.Matrix4().makeScale( child.scale.x, child.scale.y, child.scale.z ) );
					//cloneGeo.applyMatrix4( new THREE.Matrix4().makeTranslation( child.position.x, child.position.y, child.position.z ) );
					//有的模型本身有rotation
					cloneGeo.applyMatrix4( new THREE.Matrix4().makeRotationFromQuaternion( child.quaternion ) );
					geos.push(cloneGeo);							
				}
			});
			curGeo = BufferGeometryUtils.mergeBufferGeometries(geos,true);
			//BufferGeometryUtils.computeTangents(curGeo);
		}				
		return {mesh:curMesh,geo:curGeo};
	};
	_engine.create_model = function(curO){
		var modelInfo = _engine.getMeshAndGeo(curO);
		var curMesh = modelInfo.mesh;
		var curGeo = modelInfo.geo;
		if(curO.hasOwnProperty("positions")){
			for(var i=0; i<curO.positions.length; i++){
				var cloneMesh = curMesh.clone();
				var cloneGeo = curGeo.clone();
				//有的模型本身scale 不是[1,1,1]
				cloneGeo.applyMatrix4( new THREE.Matrix4().makeScale( cloneMesh.scale.x, cloneMesh.scale.y, cloneMesh.scale.z ) );
				//有的模型本身有rotation
				cloneGeo.applyMatrix4( new THREE.Matrix4().makeRotationFromQuaternion( cloneMesh.quaternion ) );
				if ( curO.scale ) {
					cloneMesh.scale.fromArray( [cloneMesh.scale.x*curO.scale[0],cloneMesh.scale.y*curO.scale[1],cloneMesh.scale.z*curO.scale[2]]);
					cloneGeo.applyMatrix4( new THREE.Matrix4().makeScale( curO.scale[ 0 ], curO.scale[ 1 ], curO.scale[ 2 ] ) );
				}
				curO.rot = curO.rot||[0,0,0];
				var curRot = [curO.rot[0],curO.rot[1],curO.rot[2]];
				var o ={ 
					type:'mesh',
					name:Math.generateUUID(),
					roadblock:curO.roadblock,							
					shape:cloneGeo,
					mass:curO.mass,
					pos:curO.positions[i],
					rot:curRot,							
					friction:0.4,
					receiveShadow:curO.receiveShadow,
					castShadow:curO.castShadow};
				if(!curO.debug){
					o.mesh = cloneMesh;
				}
				_engine.add(o);
			}
			
		}else{		
			var cloneMesh = curMesh.clone();
			var cloneGeo = curGeo.clone();
			//有的模型本身scale 不是[1,1,1]
			cloneGeo.applyMatrix4( new THREE.Matrix4().makeScale( cloneMesh.scale.x, cloneMesh.scale.y, cloneMesh.scale.z ) );
			//有的模型本身有rotation
			cloneGeo.applyMatrix4( new THREE.Matrix4().makeRotationFromQuaternion( cloneMesh.quaternion ) );
			if ( curO.scale ) {
				cloneMesh.scale.fromArray( [cloneMesh.scale.x*curO.scale[0],cloneMesh.scale.y*curO.scale[1],cloneMesh.scale.z*curO.scale[2]]);
				cloneGeo.applyMatrix4( new THREE.Matrix4().makeScale( curO.scale[ 0 ], curO.scale[ 1 ], curO.scale[ 2 ] ) );
			}						
			var o = { 
				type:'mesh',
				name:curO.name||Math.generateUUID(),
				roadblock:curO.roadblock,						
				shape:cloneGeo,
				mass:curO.mass,
				pos:curO.position,							
				rot:curO.rot,
				friction:0.4,								
				receiveShadow:curO.receiveShadow,
				castShadow:curO.castShadow};
			if(!curO.debug){
				o.mesh = cloneMesh;
			}
			_engine.add(o);
		}	
	};
	_engine.create_gun = function(curO){
		var mesh = _view.getMesh(curO.meshName).clone();
		var geo = _view.getGeometry(curO.meshName).clone();
		if ( curO.scale ) {
			mesh.scale.fromArray( curO.scale );
			geo.applyMatrix4( new THREE.Matrix4().makeScale( curO.scale[ 0 ], curO.scale[ 1 ], curO.scale[ 2 ] ) );
		}
	
		var addO = _engine.add({ 
			type:'mesh',
			mesh:mesh,
			geoSize:curO.geoSize,
			name:curO.name||Math.generateUUID(),
			roadblock:curO.roadblock,
			shape:geo,
			mass:curO.mass,
			pos:curO.position,							
			rot:curO.rot,
			friction:0.4,								
			receiveShadow:curO.receiveShadow,
			castShadow:curO.castShadow});						
		
		var muzzlePt = new THREE.Group();
		muzzlePt.position.set(curO.muzzle[0],curO.muzzle[1],curO.muzzle[2]);					
		addO.add(muzzlePt);
		var muzzleBackPt = new THREE.Group();
		muzzleBackPt.position.set(curO.muzzle[0]-0.1,curO.muzzle[1],curO.muzzle[2]);					
		addO.add(muzzleBackPt);
		addO.userData.muzzle = muzzlePt;
		addO.userData.muzzleBack = muzzleBackPt;
	};
	_engine.create_softRope = _engine.create_softCloth = _engine.create_softMesh = function(curO){
		_engine.add(curO);
	};
	_engine.create_anchor = function(curO){
		_physic.anchor(curO);
	};
	_engine.create_joint_hinge = function(curO){
		var hinge = _engine.add(curO);
		var object2 = _engine.byName(curO.body2);
		object2.userData.lock = curO.lock;
	};
	_engine.create_car = function(curO){
		var confs = curO.conFunc(_engine);		
		for(var i=0,il=confs.length; i<il; i++){								
			var carO = _engine.add(confs[i]);
			_engine.addMoveObjName(carO.name);						
		}
	};
	_engine.create_text3D = function(curO){
		var createText3D = function(co){
			var geometry = new THREE.TextGeometry( co.text, {
				size: co.size,
				height: co.height,
				curveSegments: co.curveSegments,
				font: _engine.font3d
			});
			var materials =  [
				new THREE.MeshBasicMaterial( { color: co.colors[0], side: THREE.DoubleSide } ),
				new THREE.MeshBasicMaterial( { color: co.colors[1], side: THREE.DoubleSide } )
			];
			_engine.centerPosition(geometry,[1,1,1]);
			var pos = [co.position[0]+_engine.ddlsOffset.x,co.position[1]+_engine.ddlsOffset.y,co.position[2]+_engine.ddlsOffset.z];

			_physic.add({ 
				type:'mesh',
				name:co.name||Math.generateUUID(),
				roadblock:co.roadblock,
				shape:geometry,
				material:materials,
				mass:co.mass,
				pos:pos,							
				rot:co.rot,
				friction:0.4,								
				receiveShadow:co.receiveShadow,
				castShadow:co.castShadow});
		};
		if(_engine.font3d){
			createText3D(curO);
		}else{			
			fontLoader.load( './assets/fonts/REEJI-JinGang-ExtraBoldGB1.0_Regular.json', function ( response ) {
				_engine.font3d = response;
				createText3D(curO);
			});
		}
	};
	_engine.create_cube = function(curO){
		var _tempObj = _engine.createCube(curO,false);
		_engine.objects.push(_tempObj);
		var addO = _engine.add({ 
			type:'box',								 
			name:curO.name||Math.generateUUID(),
			size:curO.size,
			mass:0,								
			pos:curO.position,
			rot:curO.rot,
			mesh:_tempObj,
			group:curO.group||1, 
			breakable:curO.breakable||false, 
			friction:0.5,
			restitution:0.9,
			material:curO.material});	
	};
	_engine.create_floor = function(curO){
		var _tempObj = _engine.createCube(curO,false);
		_engine.objects.push(_tempObj);
		 var addO = _engine.add({ 
			type:'box',								 
			name:curO.name||Math.generateUUID(),
			size:curO.size,
			mass:0,								
			pos:curO.position,
			rot:curO.rot,
			mesh:_tempObj,
			group:curO.group||1, 
			breakable:curO.breakable||false, 
			friction:0.5, 
			restitution:0.9});
	};
	_engine.create_wall = function ( _obj) {
		var _commonThick = _obj.thick || 40;//墙体厚度
		var _commonLength = _obj.length || 100;//墙体厚度
		var _commonHeight = _obj.height || 300;//强体高度
		var _commonSkin = _obj.style.color || 0x98750f;
		//建立墙体
		_obj.wallData.forEach( function( wallobj, index ) {
			var wallLength = _commonLength;
			var wallWidth = wallobj.thick||_commonThick;
			var wallpath = wallobj.path;
			var curWall = null;
			for(var i = 0,il = wallpath.length; i<il-1; i++){
				//取出两个点构建墙面
				var startDot = wallpath[i];
				var endDot  = wallpath[i+1];
				//计算这一段的位置
				var positionX = ((startDot[0] || 0) + (endDot[0] || 0)) / 2;
				var positionY = ((startDot[1] || 0) + (endDot[1] || 0)) / 2;
				var positionZ = ((startDot[2] || 0) + (endDot[2] || 0)) / 2;
				//z相同 表示x方向为长度
				if (startDot[2] == endDot[2]) {
				  wallLength = Math.abs(startDot[0] - endDot[0])+wallobj.thick;
				  wallWidth = wallobj.thick || _commonThick;
				} else if (startDot[0] == endDot[0]) {
				  wallLength = wallobj.thick || _commonThick;
				  wallWidth = Math.abs(startDot[2] - endDot[2])+wallobj.thick;
				}
				var _cube = _engine.createCube({
				  size: [wallLength,(wallobj.height || _commonHeight),wallWidth],
				  position: [positionX,positionY,positionZ],
				  uuid: wallobj.uuid,
				  name:wallobj.name,
				  style: {
					  skinColor: _commonSkin,
					  skin:wallobj.skin 
				  }
				},true);
				if(curWall==null){
				  curWall = _cube;
				}else{
				  curWall = _engine.mergeModel('+', curWall, _cube, {matname:_obj.matname,skincolor:_commonSkin,path:wallpath, skin:_obj.skin});
				}

			}
			//加其它部分
			if (_engine.commonFunc.hasObj(wallobj.childrens) && wallobj.childrens.length > 0) {
			  wallobj.childrens.forEach(function (walchildobj, index) {
				  var _newobj = null;			  
				  if(walchildobj.op){
					  _newobj = _engine.createHole(walchildobj,true);
					  curWall = _engine.mergeModel(walchildobj.op, curWall, _newobj, {matname:_obj.matname,skincolor:_commonSkin});
				  }else{
					  _newobj = _engine.createHole(walchildobj,false);
					  // 加入门
					  _physic.add({ 
						type:'box',	
						mesh:_newobj,
						name:walchildobj.name||Math.generateUUID(),
						size:_newobj.userData.size,
						mass:walchildobj.mass||0,								
						pos:_newobj.userData.position,
						group:1, 
						breakable:false, 
						friction:walchildobj.friction||0.5,
						restitution:walchildobj.restitution||0.9,
						material:'basic'});
				  }

			  });
			}
			curWall.geometry = new THREE.BufferGeometry().fromGeometry(curWall.geometry );
			_physic.add({ 
					type:'mesh',
					shape:curWall.geometry,
					mesh:curWall,
					name:wallobj.name,
					mass:0,								
					pos:[curWall.position.x,curWall.position.y,curWall.position.z],								 
					group:1, 
					breakable:false, 
					friction:0.5, 
					restitution:0.9});
		});
	};

	_engine.create_planex = function(curO){
		var _tempObj = _engine.createPlaneGeometry(curO);
		_engine.addObject(_tempObj,true);
	};
	_engine.create_glasses = function(curO){
		_engine.createGlasses(curO);
	};
	_engine.create_emptyCabinet = function(curO){
		var _tempObj = _engine.createEmptyCabinet(curO);				
		_tempObj.userData={size:curO.size};
		_engine.addObject(_tempObj);
		_engine.add({ 
			type:'box',								 
			name:curO.name||Math.generateUUID(),
			size:curO.size,
			mass:0,								
			pos:curO.position,
			rot:curO.rot,
			mesh:_tempObj,
			group:curO.group||1, 
			breakable:curO.breakable||false, 
			friction:0.5,
			restitution:0.9,
			material:curO.material});
	};
	_engine.create_cloneObj = function(curO){
		if(curO.hasOwnProperty("conFunc")){
			var confs = curO.conFunc(_engine);
			for(var i=0,il=confs.length; i<il; i++){
				var curConf = confs[i];
				var _tempObj = _engine.commonFunc.cloneByName(confs[i].copyfrom,curConf);
				
				_engine.add({ 
					type:'box',								 
					name:curConf.name||Math.generateUUID(),
					size:_tempObj.userData.size,
					mass:0,								
					pos:curConf.position,
					rot:curConf.rot,
					mesh:_tempObj,
					group:curConf.group||1, 
					breakable:curConf.breakable||false, 
					friction:0.5,
					restitution:0.9,
					material:curConf.material});
			}
		}else{
			var _tempObj = _engine.commonFunc.cloneByName(curO.copyfrom,curO);
			_engine.add({ 
					type:'box',								 
					name:curO.name||Math.generateUUID(),
					size:_tempObj.userData.size,
					mass:0,								
					pos:curO.position,
					rot:curO.rot,
					mesh:_tempObj,
					group:curO.group||1, 
					breakable:curO.breakable||false, 
					friction:0.5,
					restitution:0.9,
					material:curO.material});
		}
	};
	/*_engine.create_group = function(curO){
		var gp = new THREE.Group();
		var geos = [];
		for(var i=0;i<curO.objects.length;i++){
			var co = curO.objects[i];
			var modelInfo = _engine.getMeshAndGeo(co);
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
						cloneGeo.applyMatrix4( new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler().fromArray(_engine.toRad(co.rot))));
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
					cloneGeo.applyMatrix4( new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler().fromArray(_engine.toRad(co.rot))));
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
		_engine.add(o);
	};*/
	//=====================================================
	//创建区域结束
	//=====================================================
	//创建物体
	_engine.createObject = function(curO){
		if(curO.name=='pathfindzone'){
			_ddlsworld.reset(curO.size[0],curO.size[2]);
			//自动计算X,Z
			_engine.ddlsOffset.set(curO.size[0]*0.5,0, curO.size[2]*0.5);
			curO.position=[curO.position[0]+curO.size[0]*0.5,curO.position[1],curO.position[2]+curO.size[2]*0.5];
		}
		_engine['create_'+curO.type](curO);
	};

	_engine.createOnTerrainObjects = function(curO,terrainPos,terrainData){
		var vertexShader = ShaderExtras["png"].vertexShader;
		var fragmentShader = ShaderExtras["png"].fragmentShader;

		for(var i = 0,il = curO.onTerrainObjects.length; i < il ;i++){
			var curConf = curO.onTerrainObjects[i];
			switch(curConf.type){
			case 'plant':
				var positions = null;
				if(curConf.hasOwnProperty("tuft")){
					var nTufts	= curConf.tuft;
					positions	= new Array(nTufts);
					for(var j = 0; j < nTufts; j++){
						var position	= new THREE.Vector3();
						position.x = (Math.random()>0.5)?Math.random()*curConf.randompos.max[1]:Math.random()*curConf.randompos.max[0];
						if(position.x <= curConf.randompos.min[0]||position.x >= curConf.randompos.min[1]){
							position.z = (Math.random()-0.5)*2*curConf.randompos.max[3];
						}else{
							position.z = (Math.random()>0.5)?Math.random()*(curConf.randompos.max[3]-curConf.randompos.min[3])+curConf.randompos.min[3]:Math.random()*(curConf.randompos.max[2]-curConf.randompos.min[2])+curConf.randompos.min[2];
						}
						position.x+=terrainPos.x;
						position.z+=terrainPos.z;
						position.y = terrainData.getHeightAt(position.x, position.z, true);
						positions[j] = position;
					}	
				}else if(curConf.hasOwnProperty("positions")){
					var positionsConf = curConf.positions;
					positions	= new Array(positionsConf.length);
					for(var j = 0,jl=positionsConf.length; j < jl; j++){
						var position	= new THREE.Vector3();
						position.x = positionsConf[j][0]+terrainPos.x;										
						position.z = positionsConf[j][2]+terrainPos.z;
						position.y = terrainData.getHeightAt(position.x, position.z, true)+positionsConf[j][1];
						positions[j] = position;
					}
				}
				var texture = null;
				texture = WTextures.make({url:curConf.image,name:curConf.name});
				//texture.anisotropy = 16;
				var material	= new THREE.MeshPhongMaterial({
					specular: 0x030303,
					map		: texture,
					alphaTest	: 0.5
				});
				var gsmesh = PlantTufts.create(positions,curConf.size,material);
				gsmesh.castShadow = true;
				var uniforms = { texture:  { value: texture } };
				gsmesh.customDepthMaterial = new THREE.ShaderMaterial( {
					uniforms: uniforms,
					vertexShader: vertexShader,
					fragmentShader: fragmentShader
				} );					
				_view.addVisual(gsmesh);
				break;
			}
		}	
	};
	_engine.switchLightHelper = function(v){
		for(var i=0;i!=lightHelpers.length;i++){
			lightHelpers[i].visible=v;
		}
	};	
	_engine.switchLightHelper = function(v){
		for(var i=0;i!=lightHelpers.length;i++){
			lightHelpers[i].visible=v;
		}
	};
	//创建光源
	_engine.create_light = function(curO){
		if(curO.lightType=='AmbientLight'){
			var lt = new THREE.AmbientLight(curO.color,curO.intensity);			
			_view.scene.add(lt);
			_engine.objects.push(lt);
		}else if(curO.lightType=='DirectionalLight'){
			var lt = new THREE.DirectionalLight(curO.color,curO.intensity);
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
			lt.position.set( curO.position[0], curO.position[1], curO.position[2] );
			lt.position.add(_engine.ddlsOffset)
			lt.target.position.set( 20, 2, 20 );
			_view.addVisual( lt );
			_engine.sunLight = lt;
			var dirLightHeper = new THREE.DirectionalLightHelper( lt, 10 );			
			dirLightHeper.visible = false;		
			lightHelpers.push(dirLightHeper);
			_view.addVisual( dirLightHeper );
			
			_engine.objects.push(lt);
			_engine.objects.push(dirLightHeper);	
		}else if(curO.lightType=='SpotLight'){
			var lt = new THREE.SpotLight( 0xffffff, 1, 0, Math.PI / 5, 0.3 );
			lt.position.set( curO.position[0], curO.position[1], curO.position[2] );
			lt.target.position.set( 0, 0, 0 );

			lt.castShadow = true;
			lt.shadow.camera.near = curO.shadowCamera.near;
			lt.shadow.camera.far = curO.shadowCamera.far;
			lt.shadow.bias = 0.0001;

			lt.shadow.mapSize.width = curO.shadowMapSize[0];
			lt.shadow.mapSize.height = curO.shadowMapSize[1];
			var lightHelper = new THREE.SpotLightHelper( lt );
			lightHelper.visible = false;
			lightHelpers.push(lightHelper);
			_view.addVisual( lt );			
			_view.addVisual( lightHelper );
			_engine.objects.push(lt);
			_engine.objects.push(lightHelper);	
		}
	};
	
	_engine.setHour = function(h){
		if(_engine.sky){
			
			var inclinationA = (h*15)-90;
			var inclinationB = (inclinationA-270)/360.00  +(inclinationA+90)/360.00;
			
			var parameters = {
				distance: 400,//400
				azimuth: 0.25//curO.azimuth//0.205
			};
			var theta = Math.PI * ( inclinationB - 0.5 );
			var phi = 2 * Math.PI * ( parameters.azimuth - 0.5 );

			_engine.sunSphere.position.x = parameters.distance * Math.cos( phi );
			_engine.sunSphere.position.y = parameters.distance * Math.sin( phi ) * Math.sin( theta );
			_engine.sunSphere.position.z = parameters.distance * Math.sin( phi ) * Math.cos( theta );

			_engine.sky.material.uniforms[ 'sunPosition' ].value.copy( _engine.sunSphere.position );
			
			if(_engine.sunLight){
				_engine.sunLight.position.x = _engine.sunLight.distance* Math.cos( phi );
				_engine.sunLight.position.y = _engine.sunLight.distance * Math.sin( phi ) * Math.sin( theta );
				_engine.sunLight.position.z = _engine.sunLight.distance * Math.sin( phi ) * Math.cos( theta );
				_engine.sunLight.position.add(_engine.ddlsOffset);
			}		
			_engine.updateMaterialsBySky();
		}
	};
	_engine.updateMaterialsBySky = function(){
		_view.setEnvMapRenderTarget(_engine.sky);
		var t = terrains.length;
		while(t--){
			if(terrains[t].updateMaterial){
				terrains[t].updateMaterial();
			}
			terrains[t].material.envMap = _view.getEnvmap();
			//terrains[t].borderMaterial.envMap = _view.getEnvmap();
		}
		var w = waters.length;
		while(w--){
			if(waters[w].material.uniforms[ 'sunDirection' ])
			waters[w].material.uniforms[ 'sunDirection' ].value.copy( _engine.sunLight.position ).normalize();		
		}		
	};
	//创建玩家
	_engine.create_avatar = function(curO){
		var curAvatar = new WAvatar(curO);
		var o = {
			type:'character',
			ename:curO.ename,
			debug:true,
			avatar:curAvatar,
			size:curO.size || curAvatar.size,
			pos:curO.position,
			group:1,
			quat:[0,0,0]
		};
		_engine.add(o);

		if(curO.hasOwnProperty("sounds")){									
			_engine.addSound(_view.audioListener,curAvatar.model.parent,curO.sounds);
		}
		heros.push(curAvatar.model.parent);
		_engine.addMoveObjName(curO.ename);
		labels.push(curAvatar.addNameLabel());
		
		var h = _ddlsworld.addHeroe({x:o.pos[0], y:o.pos[2], r: o.size[0], speed:1/35});
		h.mesh = curAvatar.model.parent;
		h.mesh.userData.index = ddlsHeros.length;
		h.mesh.userData.findPath = false;
		h.mesh.userData.findPathCallBack = function(){};
		ddlsHeros.push(h);
	};
	//创建动物
	_engine.create_animal = function(curO){
		var doCreate = function(co,pos,idx){
			var curAnimal = new WAnimal(co);
			var o = {
				type:'character',
				ename:co.ename+idx,
				debug:true,
				avatar:curAnimal,
				size:co.size || curAnimal.size,
				pos:pos,
				group:1,
				quat:[0,0,0]
			};
			_engine.add(o);

			if(co.hasOwnProperty("sounds")){									
				_engine.addSound(_view.audioListener,curAnimal.model.parent,co.sounds);
			}
			heros.push(curAnimal.model.parent);
			_engine.addMoveObjName(o.ename);
			labels.push(curAnimal.addNameLabel());
			
			var h = _ddlsworld.addHeroe({x:o.pos[0], y:o.pos[2], r: o.size[0], speed:1/35});
			h.mesh = curAnimal.model.parent;
			h.mesh.userData.index = ddlsHeros.length;
			h.mesh.userData.findPath = false;
			h.mesh.userData.findPathCallBack = function(){};
			ddlsHeros.push(h);
		};
		if(curO.positions){
			for(var i=0;i<curO.positions.length;i++){
				doCreate(curO,curO.positions[i],i);
			}
		}else{
			doCreate(curO,curO.position,1);
		}
		
	};
	_engine.create_avatar_mmd = function(curO){
		var curMmd = new WMMD(curO);
		if(curO.useCharacter){
			var o = {
				type:'character',
				ename:curO.ename,
				debug:true,
				avatar:curMmd,
				size:curO.size || curMmd.size,
				pos:curO.position,
				group:16,
				quat:[0,0,0]
			};
			var body = _engine.add(o);
			if(curO.physicBody){
				curMmd.initPhysicSkeleton();
			}
			if(curO.hasOwnProperty("sounds")){									
				_engine.addSound(_view.audioListener,curMmd.mmd.parent,curO.sounds);
			}
			heros.push(curMmd.model.parent);
			_engine.addMoveObjName(curO.ename);
			labels.push(curMmd.addNameLabel());
			
			var h = _ddlsworld.addHeroe({x:o.pos[0], y:o.pos[2], r: o.size[0], speed:1/35});
			h.mesh = curMmd.model.parent;
			h.mesh.userData.index = ddlsHeros.length;
			h.mesh.userData.findPath = false;
			h.mesh.userData.findPathCallBack = function(){};
			ddlsHeros.push(h);
		}else{
			curMmd.model.position.set(0,0,0);
			_view.scene.add(curMmd.model);
			if(curO.physicBody){
				curMmd.initPhysicSkeleton();
			}
			_engine.scene.loopFunctions.push(function(delta){curMmd.playAction('idle');curMmd.update(delta);});

		}

	};
	_engine.doCreate_mmd_chars = function(curO){
		if(curO.refCameraAction){
			var cameraAnimation = _view.getMMDAnimation(curO.refCameraAction,_view.camera);
			mmdHelper.add( _view.camera, {
				animation: cameraAnimation
			});	
		}
		for(var i=0;i<curO.characters.length;i++){
			_engine.doCreate_mmd_char(curO,curO.characters[i]);
		}
		isMMDLoaded = true;
	};
	_engine.doCreate_mmd_char = function(co,chr){
		var mesh = _view.getModel(chr.ename);
		mesh.traverse(function (child) {
			if (child.isMesh) {
				child.castShadow = true;                       
				child.material.alphaTest=0.1;						
			}
		});
		function makePhongMaterials( materials ) {
			var array = [];
			for ( var i = 0, il = materials.length; i < il; i ++ ) {
				var m = new THREE.MeshPhongMaterial();
				m.copy( materials[ i ] );
				m.needsUpdate = true;
				m.envMap = _view.getEnvmap();
				array.push( m );
			}
			return array;
		}
		if(chr.usePhongMat)mesh.material = makePhongMaterials(mesh.material);		
		mesh.position.set(chr.position[0],chr.position[1],chr.position[2]);
		if(chr.scale) mesh.scale.fromArray( [chr.scale,chr.scale,chr.scale]);
		_view.addVisual( mesh );
	
		var mmdAnimation = _view.getMMDAnimation(co.refAction,mesh);
		mmdHelper.add( mesh, {
			animation: mmdAnimation,
			physics: co.physicBody
		} );
		if(chr.ikHelper){
			var ikHelper = mmdHelper.objects.get( mesh ).ikSolver.createHelper();
			ikHelper.visible = true;
			_view.addVisual( ikHelper );
		}

		if(co.physicBody && chr.physicsHelper){
			var physicsHelper = mmdHelper.objects.get( mesh ).physics.createHelper();
			physicsHelper.visible = true;
			_view.addVisual( physicsHelper );
		}
	};
	_engine.create_mmd = function(curO){
		if(mmdHelper==null){
			mmdHelper  = new MMDAnimationHelper( {afterglow: 2.0} );
			_engine.scene.loopFunctions.push(function(delta){if(isMMDLoaded)mmdHelper.update(delta);});
		}
		var audio = new THREE.Audio( _view.audioListener ).setBuffer( sounds[curO.refSound].buffer );
		var audioParams = { delayTime: 160 * 1 / 30 };
		mmdHelper.add( audio, audioParams );
		if(curO.physicBody && isAmmoImport==false){
			_engine.importScript('./js/libs/ammo.js',function(url,co){
				Ammo().then(function(AmmoLib){						
					Ammo = AmmoLib;
					isAmmoImport = true;					
					_engine.doCreate_mmd_chars(co);
				});						
			},curO);
		}else{
			_engine.doCreate_mmd_chars(curO);
		}

	};
	_engine.create_mmd_model = function(curO){
		var mesh = _view.getModel(curO.ename);
		mesh.traverse(function (child) {
			if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;				
				child.material.alphaTest=0.1;						
			}
		});
		function makePhongMaterials( materials ) {
			var array = [];
			for ( var i = 0, il = materials.length; i < il; i ++ ) {
				var m = new THREE.MeshPhongMaterial();
				m.copy( materials[ i ] );
				m.needsUpdate = true;
				m.envMap = _view.getEnvmap();
				array.push( m );
			}
			return array;
		}
		if(curO.usePhongMat)mesh.material = makePhongMaterials(mesh.material);		
		mesh.position.set(curO.position[0],curO.position[1],curO.position[2]);
		if(curO.scale) mesh.scale.fromArray( curO.scale);
		_view.addVisual( mesh );
	};
	_engine.loadSceneFile = function(sceneName,callback){
		var url = './datas/'+sceneName+'/scene.js';
		fileLoader.load(url,function(data){
			window.world = window.world || {};
			window.world.scenes = window.world.scenes || {};
			eval('window.world.scenes[sceneName]='+data);
			callback();
		});
		
	};
	_engine.loadLogicFile = function(sceneName,callback){
		var url = './datas/'+sceneName+'/logic.js';
		fileLoader.load(url,function(data){
			window.world = window.world || {};
			window.world.logics = window.world.logics || {};
			eval('window.world.logics[sceneName]='+data);
			callback(sceneName);
		});
	};
	_engine.loadSceneData = function(sceneName,callBack){
		var pAry=[];
		pAry.push(new Promise(function(resolve, reject){
			_engine.loadSceneFile(sceneName,function(sName){					
				resolve('load scene '+sName+' ok');
			});
		}));
		pAry.push(new Promise(function(resolve, reject){
			_engine.loadLogicFile(sceneName,function(sName){					
				resolve('load scene '+sName+' ok');
			});
		}));
		Promise.all(pAry).then(function(){
			callBack();
		});
	};
	//场景
	_engine.scene={
			loopFunctions:[],
			update : function(delta){
				// 有单独渲染的物体 如 水，风，火
				var i=_engine.scene.loopFunctions.length;
				while(i--){
					_engine.scene.loopFunctions[i](delta);
				}
				i=null;
			},
			load: function(sceneName){
				window.world.currentSceneName = sceneName;
				_engine.loadSceneData(window.world.currentSceneName,function(){
					_engine.destroy();
				});
			},
			removePlayer:function(humanID){

			},			
			reversUV:function( geometry ){
				var uv = geometry.attributes.uv.array;
				var i = uv.length * 0.25;
				while( i-- ) uv[i*2]*=-1;
				geometry.attributes.uv.needsUpdate = true;
			},
			loadModels:function(curScene,callBack){
				//解析模型
				var pAry=[];
				if(curScene.hasOwnProperty("models")){
					var i=curScene.models.length;						
					while(i--){
						pAry.push(new Promise(function(resolve, reject){
							_view.load(curScene.models[i],function(model,co) {
								console.log('load model '+co.url+' ok');
								resolve('load models ok');
							});
						}));
					}

				}
				Promise.all(pAry).then(function(results){
					callBack(results);
				});
			},
			loadMaterials:function(curScene,callBack){				
				//解析材质
				var pAry=[];
				if(curScene.hasOwnProperty("materials")){
					var i=curScene.materials.length;
					while(i--){
						pAry.push(new Promise(function(resolve, reject){
							_view.material(curScene.materials[i]);
							resolve('load materials ok');
						}));							
					}
				}
				Promise.all(pAry).then(function(results){
					callBack(results);
				});
			},
			loadSounds:function(curScene,callBack){
				//解析声音
				var pAry=[];
				if(curScene.hasOwnProperty("sounds")){
					var k = curScene.sounds.length;
					while(k--){
						var conf = curScene.sounds[k];
						pAry.push(new Promise(function(resolve, reject){
							_engine.loadSound(conf,function(bf,cf){
								resolve('load sound '+cf.name+' ok');	
							});								
						}));
					}
				}
				Promise.all(pAry).then(function(results){
					callBack(results);
				});
			},
			loadActions:function(curScene,callBack){
				//解析动作库
				var pAry=[];
				if(curScene.hasOwnProperty("actions")){
					var j=curScene.actions.length;
					while(j--){
						var conf = curScene.actions[j];
						pAry.push(new Promise(function(resolve, reject){
							_engine.loadAction(conf,function(cf){
								resolve('load action '+cf.name+' ok');
							})							
							
						}));
					}
				}
				Promise.all(pAry).then(function(results){
					callBack(results);
				});
			},

			create: function() {
				_engine.debugTell("创建场景...");
				//坐标轴帮助
				axisHelper = new THREE.AxesHelper(100);
				axisHelper.visible = false;
				statics.push(axisHelper);
				_view.addVisual(axisHelper);
				
				//创建场景
				//加载场景总文件
				var curScene = null;
				var temfun = function(){
					if(curScene.hasOwnProperty("clearColor")){
						_view.setClearColor(curScene.clearColor);
					}
					if(curScene.hasOwnProperty("arSceneScale")){
                    	_view.setARSceneScale(curScene.arSceneScale);
                    }
					//解析界面组件
					if(curScene.hasOwnProperty("uiControls")){
						var i=curScene.uiControls.length;
						while(i--){_gui.addControl(curScene.uiControls[i]);}
					}
					_engine.scene.loadModels(curScene,function(){
						_engine.scene.loadMaterials(curScene,function(){
							_engine.scene.loadSounds(curScene,function(){
								_engine.scene.loadActions(curScene,function(){
									//解析三维物体
									_engine.createSceneObject();
									//解析场景逻辑
									_engine.loadSceneLogic();
									
									_engine.showTerrain(true);
									//_engine.addHeroLabel();
									_engine.showHero(true);
									_engine.start();
								});
							});
						});
					});
				};
				if(!window.world.scenes.hasOwnProperty(window.world.currentSceneName)){					
					_engine.loadSceneData(window.world.currentSceneName,function(){
						curScene = window.world.scenes[window.world.currentSceneName];							
						temfun();
					});
				}else{
					curScene = window.world.scenes[window.world.currentSceneName];
					temfun();
				}	
			}
	};
	_engine.createSceneObject = function(){
		var curScene = window.world.scenes[window.world.currentSceneName];
		//解析三维物体
		for( var i=0,il=curScene.objects.length; i < il; i++ ){
			_engine.createObject(curScene.objects[i]);						
		}
		//事件对象列表
		_engine.eventList = curScene.events;
		//加控制按钮
		_engine.gui.addBtns(curScene.btns);
	};
	_engine.loadSceneLogic = function(){
		var slogics = window.world.logics[window.world.currentSceneName];
		for(var i=0;i<slogics.length;i++){
			var lc = slogics[i];
			if(_engine.has(lc.name)==false) continue;
			var body  = _engine.byName(lc.name);
			var cmds = lc.logic();
			body.userData.cmds = cmds;
			body.userData.cmdIndex = 0;
			var curDdlsHero = ddlsHeros[body.userData.index];
			var cmdExe =function(){
				var curCmd = cmds[body.userData.cmdIndex];
				if(curCmd.type=='move' && !body.userData.findPath){
					curDdlsHero.isSelected = true;
					body.userData.findPath = true;
					body.userData.findPathCallBack = function(){
						body.userData.cmdIndex=body.userData.cmdIndex+1>body.userData.cmds.length-1?0:body.userData.cmdIndex+1;						
						body.userData.findPathCallBack = function(){};
					};
					body.userData.actionName = curCmd.action;
					console.log("go to "+curCmd.pos[0]+"---"+curCmd.pos[1]+'   '+body.userData.findPath);
					curDdlsHero.setTarget( curCmd.pos[0],   curCmd.pos[1]);	
					
				}
				else if(curCmd.type=='play' && body.userData.actionName!=curCmd.action){
					body.userData.actionName = curCmd.action;
					body.userData.avatar.logicPlay = true;
					body.userData.avatar.doAction(curCmd.action);					
					//body.userData.cmdIndex=body.userData.cmdIndex+1>body.userData.cmds.length-1?0:body.userData.cmdIndex+1;
					setTimeout(function(){
						body.userData.avatar.logicPlay = false;
						body.userData.cmdIndex=body.userData.cmdIndex+1>body.userData.cmds.length-1?0:body.userData.cmdIndex+1;
					},curCmd.interval);
				}
			};

			_engine.scene.loopFunctions.push(cmdExe);
		}
	};
	_engine.enableHoloEffect = function(b,s){
		_view.enableHoloEffect(b,s);
	};
	_engine.enableAREffect = function(b){
		_view.enableAREffect(b);
	};
	_engine.enableVREffect = function(b){
		_view.enableVREffect(b);
	};
	_engine.enableWebVREffect = function(b){
		_view.enableWebVREffect(b);
	};
	_engine.centerPosition = function(geo,conf){
		geo.computeBoundingBox();
		var translateX = conf[0]==1?-((geo.boundingBox.getSize(new THREE.Vector3()).x / 2) + geo.boundingBox.min.x):0;
		var translateY = conf[1]==1?-((geo.boundingBox.getSize(new THREE.Vector3()).y / 2) + geo.boundingBox.min.y):0;
		var translateZ = conf[2]==1?-((geo.boundingBox.getSize(new THREE.Vector3()).z / 2) + geo.boundingBox.min.z):0;
		geo.applyMatrix4(new THREE.Matrix4().makeTranslation(translateX, translateY, translateZ));
	};
	_engine.getDDLSPosition = function(pos){
		return pos.add(_engine.ddlsOffset);
	};
	_engine.loadAction = function(conf,callback){
		if(conf.type&&conf.type=='vmd'){
			_view.loadVMD(conf,callback);
		}else{
			bvhFileLoader.load( conf.url, function( buffer ) {				
				var text = "";
				var raw = new Uint8Array( buffer );
				for ( var i = 0; i < raw.length; ++ i ) {
					text += String.fromCharCode( raw[ i ] );
				}			
				actions[conf.name] = {type:conf.type||'common',data:text};
				callback(conf);
			});
		}

	};
	_engine.getActionData = function(name){
		return actions[name];
	};
	_engine.loadSound = function(conf,callBack,mesh,k){
		if(sounds[conf.name] && sounds[conf.name].buffer){
			callBack(sounds[conf.name].buffer,conf,mesh,k);
		}else{
			audioLoader.load( conf.url,function(buffer){
				sounds[conf.name] = {name:conf.name};
				sounds[conf.name].buffer = buffer;
				callBack(buffer,conf,mesh,k);
			});
		}

	};
	_engine.addSound = function(listener,mesh,sO) {
		if (listener == null || sO == null) return;
		mesh.userData.audios = {};
		for(var k in sO.data){
			var conf = sO.data[k];
			_engine.loadSound(conf,function(buffer,cf,curMesh,tK){
				var audio = new THREE.PositionalAudio( listener );
				audio.setBuffer( buffer );
				audio.setRefDistance( cf.refdistance );
				audio.setLoop(cf.loop);		
				curMesh.userData.audios[tK] = audio;
				curMesh.userData.defaudio = sO.defsound;
				curMesh.add(audio);
			},mesh,k);
			
		}
	};
	_engine.playSound = function(mesh,sName){
		if(mesh.userData.hasOwnProperty('audios') && mesh.userData.audios.hasOwnProperty(sName)){
			var audio = mesh.userData.audios[sName];
			//console.log('sName=='+sName);
			//if(!audio.isPlaying)audio.play();
		}
	};
	_engine.stopPlaySound = function(mesh,sName){		
		if(mesh.userData.hasOwnProperty('audios') && mesh.userData.audios.hasOwnProperty(sName)){
			//mesh.userData.audios[sName].stop();
		}
	};

	_engine.avatarFire = function(ammoMass,throwPos,throwDir){
		if(_engine.currentFollow == null) return;
		_engine.currentFollow.userData=_engine.currentFollow.userData||{};
		_engine.currentFollow.userData.weapon = _engine.currentFollow.userData.weapon||{};
		_engine.currentFollow.userData.weapon.ammo = _engine.currentFollow.userData.weapon.ammo||0;
		if(_engine.currentFollow.userData.weapon.ammo>0){

			var ballMass = ammoMass;
			var ballRadius = 0.05;

			//var ball = new THREE.Mesh( new THREE.SphereGeometry( ballRadius, 14, 10 ),  _view.getMaterial('solid') );
			//ball.castShadow = true;
			//ball.receiveShadow = true;
			//加声音
			//
			//_engine.addSound(_engine.player.listener,ball,fireSound);
			//ball.userData = ball.userData||{};
			//ball.userData.damage = 10;
			//ball.userData.damageUUID = Math.generateUUID();
			var matSolid = _view.getMaterial('solid');
			matSolid.name = 'solid';
			//debugger;
			var ball = _physic.add({
				type: 'sphere',
				size:[ballRadius],
				material:matSolid,
				mass:ballMass,
				pos:[throwPos.x,throwPos.y,throwPos.z],
				quat:[0, 0, 0, 1],
				linearVelocity:[ throwDir.x, throwDir.y, throwDir.z]
			});
			var fireSound={data:{fire:{name:'gun01',loop:false,refdistance:2}}};
			_engine.addSound(_engine.player.listener,ball,fireSound);
			//var ballBody = _physic.createRigidBody( ball, ballShape, ballMass, throwPos, quat ,null, null, null, 2);
			//ballBody.setLinearVelocity( new Ammo.btVector3( throwDir.x, throwDir.y, throwDir.z ) );
			_engine.playSound(ball,'fire');
			_engine.currentFollow.userData.weapon.ammo--;
			//ball=null;ballMass=null;ballRadius=null;throwPos=null;
		}
	};
	_engine.play = function(b){
		if(b){			
			_view.restartRender();			
		}else{
			_view.pauseRender();
		}
		_engine.run = b;
	};

	_engine.initEvents = function(){
	

		var mouseDown = function(evt) {
			mouseCoords.set(
				( evt.clientX / window.innerWidth ) * 2 - 1,
				- ( evt.clientY / window.innerHeight ) * 2 + 1
			);				
			raycaster.setFromCamera( mouseCoords, _view.camera );
			//=======鼠标左键
			if(evt.button==0){
				if(isTouch) return;
				var throwPos = new THREE.Vector3();
				throwPos.copy( raycaster.ray.direction );
				throwPos.add( raycaster.ray.origin );

				var throwDir = new THREE.Vector3();
				throwDir.copy( raycaster.ray.direction );
				throwDir.multiplyScalar( 50 );
				_engine.avatarFire(20,throwPos,throwDir);
			}else if(evt.button==1){
				_view.updateSunLightSize(_view.cameraControls.getRadius());
			}			
			//=========鼠标右键
			else if(evt.button==2 && _engine.has('pathfindzone')){
				var pathfindzone = _engine.byName('pathfindzone');
				if(pathfindzone.isGroup) pathfindzone = pathfindzone.children[0];
				var inter = raycaster.intersectObject( pathfindzone );
				if ( inter.length > 0 ) {
					var p = inter[ 0 ].point;
					var curDdlsHero = ddlsHeros[_engine.currentFollow.userData.index];
					curDdlsHero.isSelected = true;
					console.log('go to x='+p.x+' z='+p.z);
					_engine.currentFollow.userData.findPath = true;
					_engine.currentFollow.userData.findPathCallBack=function(){};
					curDdlsHero.setTarget( p.x,  p.z);					
				}
				inter=null;
			}
			//=====================触发配置的事件=======	
			//debugger;
			var intersects = raycaster.intersectObjects(_view.objects_raycaster);
			if (intersects.length > 0) {
			  _engine.SELECTED = intersects[0].object;
			  if(clickMeasureEnabled)_engine.showSize(_engine.SELECTED);
			  if (_engine.eventList != null && _engine.eventList.dbclick != null && _engine.eventList.dbclick.length > 0) {
				  _engine.eventList.dbclick.forEach( function ( _obj, index) {
					  if ("string" == typeof (_obj.obj_name)) {
						  if (_obj.obj_name == _engine.SELECTED.name) {
							  _obj.obj_event(_engine.SELECTED);
						  }
					  } else if (_obj.findObject!=null||'function' == typeof (_obj.findObject)) {
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

		_user.addEventListener('onKeyDown',function(evt){
			if(evt.keyCode == 9){
				_engine.changeHero();
			}else if(evt.keyCode == 87){
				driveSpeed++;
			}else if(evt.keyCode == 83){
				driveSpeed--;
			}else if(evt.keyCode == 81){
				driveSpeed=0;
			}else if(evt.keyCode == 82){
				if(_engine.currentFollow != null){
					_engine.currentFollow.userData=_engine.currentFollow.userData||{};
					_engine.currentFollow.userData.weapon = _engine.currentFollow.userData.weapon||{};
					_engine.currentFollow.userData.weapon.ammo = _engine.currentFollow.userData.weapon.ammo||0;
					_engine.currentFollow.userData.weapon.ammo++;
					//加声音
					_engine.playSound(_engine.currentFollow,'addbullet');
				}
			}else if(evt.keyCode == 70){
				var throwPos = _engine.currentFollow.userData.avatar.getThrowPos();
				var throwDir = _engine.currentFollow.userData.avatar.getThrowDir();				
				_engine.avatarFire(20,throwPos,throwDir);
			}
			if(_view.camera==_view.cameraInObj){
				if(evt.keyCode == 65){
					_view.camera.rotation.y = 0;
				}else if(evt.keyCode == 68){
					_view.camera.rotation.y = Math.PI;
				}else if(evt.keyCode == 37){
					_view.camera.rotation.y += Math.PI*0.01;
				}else if(evt.keyCode == 39){
					_view.camera.rotation.y -= Math.PI*0.01;
				}else if(evt.keyCode == 38){
					_view.camera.rotation.x += Math.PI*0.01;
				}else if(evt.keyCode == 40){
					_view.camera.rotation.x -= Math.PI*0.01;
				}
			}

		});
	};
	_engine.showSize = function(model){
		var box = new THREE.Box3().setFromObject(model);
		var box3X = box.max.x - box.min.x;
		var box3Y = box.max.y - box.min.y;
		var box3Z = box.max.z - box.min.z;
		var xL = box3X*1.01;
		var yL = box3Y*1.01;
		var zL = box3Z*1.01;
		var geometry = new THREE.BoxGeometry(xL,yL,zL);
		var material = new THREE.MeshPhongMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.2,
		});
		if(sizeGroup != null){
			for(var i=sizeDivs.length-1;i>=0;i--){
				if(sizeDivs[i].parentNode){
					sizeDivs[i].parentNode.removeChild(sizeDivs[i]);
				}
			}
			sizeDivs=[];
			for(var i=0;i<sizeGroup.children.length;i++){
				sizeGroup.remove(sizeGroup.children[i]);
			}

			
			sizeGroup.parent.remove(sizeGroup);
			sizeGroup = null;
		}
		sizeGroup = new THREE.Group();
		var mesh = new THREE.Mesh(geometry,material);
		sizeGroup.add(mesh);
		var border = new THREE.BoxHelper(mesh,0x0ed5c7);
		sizeGroup.add(border);
		
		var sizeLineX = _engine.makeSizeLine(xL);
		sizeLineX.position.y = yL / 2 + .5;
		sizeLineX.position.z = -zL / 2;
		sizeGroup.add(sizeLineX);		
		var sizeLineY = _engine.makeSizeLine(yL);
		sizeLineY.rotateZ(Math.PI / 2);
		sizeLineY.position.x = xL / 2 + .5;
		sizeLineY.position.z = -zL / 2;
		sizeGroup.add(sizeLineY);
		var sizeLineZ = _engine.makeSizeLine(zL);
		sizeLineZ.rotateY(Math.PI / 2);
		sizeLineZ.position.x = xL / 2;
		sizeLineZ.position.y = -yL / 2 - .5;
		sizeGroup.add(sizeLineZ);
		_engine.makeSizeLabel(sizeGroup,box3X,sizeLineX.position);
		_engine.makeSizeLabel(sizeGroup,box3Y,sizeLineY.position);
		_engine.makeSizeLabel(sizeGroup,box3Z,sizeLineZ.position);
		sizeGroup.position.copy(model.position);
		model.parent.add(sizeGroup);
	};
	_engine.makeSizeLine = function(length) {
		var w = 10;
		var p10 = new THREE.Vector3(-length / 2,0,0);
		var p11 = new THREE.Vector3(-length / 2,w / 2,0);
		var p12 = new THREE.Vector3(-length / 2,-w / 2,0);
		var p20 = p10.clone().negate();
		var p21 = p11.clone().negate();
		var p22 = p12.clone().negate();
		var LineGroup = new THREE.Group();
		var lengthLine = createLine([p10, p20]);
		var leftLine = createLine([p11, p12]);
		var rightLine = createLine([p21, p22]);
		var p13 = new THREE.Vector3(-length / 2 + .2,.2,0);
		var p14 = new THREE.Vector3(-length / 2 + .2,-.2,0);
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
			var geometry = new THREE.Geometry();
			geometry.vertices = pointArr;
			var line = new THREE.Line(geometry,material);
			return line;
		}
	};
	_engine.makeSizeLabel = function(p,length, pos){			
		var sizeDiv = document.createElement( 'div' );		
		sizeDiv.className = 'label';
		sizeDiv.textContent = length.toFixed(3)+" m" ;
		sizeDiv.style.color = "#0ed5c7";
		sizeDiv.style.padding = "5px 10px";
		sizeDivs.push(sizeDiv);
		var sizeLabel = new CSS2DObject( sizeDiv );
		sizeLabel.position.copy(pos);
		p.add( sizeLabel );
		return sizeLabel;
	
	};
	_engine.updateCompassAngle = function(){
		var centerCoords = new THREE.Vector2();
		centerCoords.set(
			( window.innerWidth / 2/ window.innerWidth ) * 2 - 1,
			- ( window.innerHeight/2 / window.innerHeight ) * 2 + 1
		);
		raycaster_compass.setFromCamera( centerCoords, _view.camera );
		var dir = new THREE.Vector3();
		dir.copy( raycaster_compass.ray.direction );
		var up = new THREE.Vector3(0,1,0);
		var north = new THREE.Vector3(1,0,0);
		var dirOnPlane = dir.projectOnPlane(up);
		var isEastside = (dirOnPlane.clone().cross(up).angleTo(north) > Math.PI/2) ? true : false;
		var angleToNorth = dirOnPlane.angleTo(north);
		_engine.compassAngle = (isEastside) ? angleToNorth : Math.PI*2 - angleToNorth;													
	};
	_engine.init=function(options) {
		var overlay = document.getElementById( 'overlay' );
		overlay.remove();
		if ( WEBGL.isWebGLAvailable() === false ){			
			document.body.appendChild( WEBGL.getWebGLErrorMessage() );
			
		}
		document.oncontextmenu = function(){return false;};

		_engine.initComponents(options);
		content = new THREE.Group();
		_view.addVisual( content );
		contentMesh = new THREE.Group();
		_view.addVisual( contentMesh );

		raycaster = new THREE.Raycaster();
		raycaster_compass = new THREE.Raycaster();
		mouse = new THREE.Vector2();
		//_engine.initDefGeosAndMats();
		_engine.initEvents();
	};
	_engine.destroy=function() {
		// 暂停动画帧循环
		_engine.play(false);
		_physic.reset(true);
		_engine.reset();
		_gui.reset();
		_view.reset();
		// 重新创建场景和角色
		_engine.scene.create();
	};
	_engine.reset = function () {
		
        //_engine.removeRay();
		if(_view.cameraInObj.parent!=null){
			_view.cameraInObj.parent.remove(_view.cameraInObj);
			_view.cameraInObj.parent=null;
		}
    
		if(_engine.compass!=null){
			_view.sceneRenderHUDSprite.remove(_engine.compass);
			_engine.compasscompass = null;
		}
		tmpI = labels.length;
		while(tmpI--){
			labels[tmpI].parent.remove(labels[tmpI]);
		}
		labels = [];
		_engine.sunLight = null;
		_engine.sunSphere = null;
		_engine.sky = null;
		_engine.currentFollow =null;
		_engine.ddlsOffset=new THREE.Vector3(0,0,0);		
		load=0;
		if(mmdHelper!=null){
			for(var i=0;i<mmdHelper.meshes.length;i++){
				mmdHelper.remove(mmdHelper.meshes[i]);
			}
			if(mmdHelper.camera != null) mmdHelper.remove( mmdHelper.camera );
			if(mmdHelper.audio != null){
				mmdHelper.audio.stop();
				mmdHelper.remove( mmdHelper.audio );
			} 
			mmdHelper = null;
		}		
		geo = {};
		sounds = {};
		extraGeo = [];
		heros = [];
		terrains = [];
		waters = [];
		_engine.moveObjNames = [];	

		statics = [];
		ddlsObj=[];
		ddlsObject=[];
		ddlsHeros=[];
		_ddlsworld.reset();
		terrainData = null;
		driveSpeed = 0;
		_engine.scene.loopFunctions=[];
    };
	_engine.start = function(){
		console.log("开始世界循环");
		// 开始世界循环
		_view.restartRender();
		_physic.start();
		_engine.playSounds(true);
		_engine.gui.showBtns();
		_engine.debugTell("");
	};
	_engine.update = function(delta){
		_engine.getKeys();
		_engine.scene.update(delta);
		TWEEN.update();
		_engine.updateHero(delta);
		 _ddlsRender.update();
		//if(_engine.currentFollow!=null){
			//_engine.currentFollow.userData.findPath && _ddlsRender.update();
			//_engine.sunLight.position.set( _engine.currentFollow.position.x-_engine.sunLight.position.y*10/18, _engine.sunLight.position.y, _engine.currentFollow.position.z-_engine.sunLight.position.y*5/18 );
			//if(_engine.sunLight!=null) _engine.sunLight.target= _engine.currentFollow;
		//}
		for(var i=0;i!=lightHelpers.length;i++){
			lightHelpers[i].visible && lightHelpers[i].update();
		}
		_engine.updateCompassAngle();
	};
	_engine.importScript = function(url,callback,params){
		fileLoader.load( url, function( data ) {
			//eval(data);
			var script = document.createElement('script');
            script.type = 'text/javascript';
            script.text = data;
            document.body.appendChild(script);
			callback(url,params);
		});
	};
	_engine.importScripts = function(urls,callBack){
		var pAry=[];
		var fLoader = new THREE.FileLoader();
		for(var i=0;i<urls.length;i++){
			pAry.push(new Promise(function(resolve, reject){
				_engine.importScript(urls[i],function(url){					
					resolve('load '+url+' ok');
				});
			}));
		}
		Promise.all(pAry).then(function(results){callBack();});
	};
	_engine.initComponents= function (options) {
		loadingManager.addHandler( /\.dds$/i, new DDSLoader() );
		_engine.gui = _gui = WGui();_gui.init();
		_engine.user = _user = WUser();
		_engine.debugTell("初始化三维引擎...");
		_engine.view = _view = WView(loadingManager);
		_engine.physic = _physic = physic;
		_engine.ddlsworld = _ddlsworld = new DDLSWorld(10,10);

		_view.init(options);
		_view.update = _engine.update;
		_engine.ddlsRender = _ddlsRender = new DDLSRender(_ddlsworld,_view.scene);
		_user.init();	

		_engine.debugTell("初始化物理引擎...");	
		
		_physic.init(function(){
			_physic.setView(_view);
			_view.unPause = function(){_physic.start()};
			_physic.tell = function () { 
				
				if(showPhyinfo){
					_phyinfo = _physic.info();
					_gui.tell(' ammo ' + _physic.getFps() 
					+'\n solids '+_phyinfo.solids +' / bodys '+_phyinfo.bodys
					+'\n softs '+_phyinfo.softs +' / terrains '+_phyinfo.terrains
					+'\n cars '+_phyinfo.cars +' / rays '+_phyinfo.rays
					+'\n pairs '+_phyinfo.pairs +' / joints '+_phyinfo.joints
					); 
				}else{
					_gui.tell('');
				}
			};
			/*_physic.set({
				jointDebug: true,
				gravity:[0,-9.8,0],
			});*/
			_physic.getKey =  function(){ return keys};	
			_engine.importScripts(['./datas/world.scenes.js'],function(){
				_gui.initUI_scenes();
				_gui.addExtraOption( _physic.setMode );
				_engine.scene.create();
			});	
			
		},"min");
	};
	return _engine;
})();

var startButton = document.getElementById( 'startButton' );
startButton.addEventListener( 'click', function (){
	window.WEngine.init({rendererClearColor: window.WEngine.colors.white});
});
