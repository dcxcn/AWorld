/*global THREE*/
import { RigidBody } from '../ammo/physic/RigidBody.js';
import { Constraint } from '../ammo/physic/Constraint.js'
import { SoftBody } from '../ammo/physic/SoftBody.js';
import { Terrain } from '../ammo/physic/Terrain.js';
import { Vehicle } from '../ammo/physic/Vehicle.js';
import { Character } from '../ammo/physic/Character.js';
import { Collision } from '../ammo/physic/Collision.js';
import { RayCaster } from '../ammo/physic/RayCaster.js';
import { ConvexObjectBreaker } from '../../jsm/three/misc/ConvexObjectBreaker.js';
import { LZMAdecompact } from '../ammo/physic/lzma.js';
import { root, map, REVISION } from '../ammo/physic/root.js';

/**   _  _____ _   _
*    | ||_   _| |_| |
*    | |_ | | |  _  |
*    |___||_| |_| |_|
*    @author lth / https://github.com/lo-th/
*    Shoutgun Ammo worker launcher
*    update by dcxcn
*/

export var physic = ( function () {

	'use strict';

	var type = 'LZMA'; // LZMA / WASM / ASM

	var worker, callback, blob = null;

	var URL = window.URL || window.webkitURL;
	var Time = typeof performance === 'undefined' ? Date : performance;
	var t = { now: 0, delta: 0, then: 0, deltaTime:0, inter: 0, tmp: 0, n: 0, timerate: 0, steptime: 0 };

	var timer = null;

	var isBuffer = false;
	var isPause = false;
	var stepNext = false;

	var currentMode = '';
	var oldMode = '';

	var PI90 = Math.PI * 0.5;
	var torad = Math.PI / 180;
	var todeg = 180 / Math.PI;

	var rigidBody, softBody, terrains, vehicles, character, collision, rayCaster, constraint;

	var convexBreaker = null;
	var ray = null;
	var mouseMode = 'free';

	var tmpRemove = [];
	var tmpAdd = [];

	var oldFollow = '';

	var stats = { skip : 0, };

	var isInternUpdate = false;
	//var isRequestAnimationFrame = false;

	var option = {

		worldscale: 1,
		gravity: [ 0, - 9.8, 0 ],
		fps: 60,

		substep: 2,
		broadphase: 2,
		soft: true,

		animFrame : true,
		fixed: true,
		jointDebug: false,

	};

	return {

		folder: './js/libs/',

		message: function ( e ) {

			var data = e.data;
			if ( data.Ar ) root.Ar = data.Ar;
			if ( data.flow ) root.flow = data.flow;

			switch ( data.m ) {

				case 'initEngine': physic.initEngine(); break;
				case 'start': physic.start(); break;
				case 'step': physic.step(data.fps, data.delta); break;

				case 'moveSolid': physic.moveSolid( data.o ); break;
				case 'ellipsoid': physic.ellipsoidMesh( data.o ); break;

				case 'makeBreak': physic.makeBreak( data.o ); break;

			}

		},

		init: function ( Callback, Type, Option, Counts ) {

			this.initArray( Counts );
			this.defaultRoot();

			Option = Option || {};

			callback = Callback;

			isInternUpdate = Option.use_intern_update || false;

			option = {

				fps: Option.fps || 60,
				worldscale: Option.worldscale || 1,
				gravity: Option.gravity || [ 0, - 9.8, 0 ],
				substep: Option.substep || 2,
				broadphase: Option.broadphase || 2,
				soft: Option.soft !== undefined ? Option.soft : true,
				//penetration: Option.penetration || 0.0399,

				fixed: Option.fixed !== undefined ? Option.fixed : true,
				animFrame: Option.animFrame !== undefined ? Option.animFrame : true,

				jointDebug : Option.jointDebug !== undefined ? Option.jointDebug : false,

				isInternUpdate: isInternUpdate,

			};

			t.timerate = ( 1 / option.fps ) * 1000;
			//t.autoFps = option.autoFps;

			type = Type || 'LZMA';

			switch( type ) {

				case 'min' : 
				    physic.load( physic.folder + "ammo.hex", true );
				break;

				case 'LZMA' : case 'lzma' : case 'compact' :
				    physic.load( physic.folder + "ammo.hex" );
				break;

				case 'WASM': case 'wasm':
				    blob = document.location.href.replace( /\/[^/]*$/, "/" ) + physic.folder + "ammo.wasm.js";
				    physic.startWorker();
				break;

				case 'BASIC': case 'basic':
				    blob = document.location.href.replace( /\/[^/]*$/, "/" ) + physic.folder + "ammo.js";
				    physic.startWorker();
				break;

			}

		},

		set: function ( o ) {

			o = o || option;
			t.timerate = o.fps !== undefined ? ( 1 / o.fps ) * 1000 : t.timerate;
			//t.autoFps = o.autoFps !== undefined ? o.autoFps : false;

			option.fixed = o.fixed || false;
			option.animFrame = o.animFrame || false;
			option.jointDebug = o.jointDebug || false;

			o.isInternUpdate = isInternUpdate;

			root.constraintDebug = option.jointDebug;

			this.post( 'set', o );

		},

		load: function ( link, isMin ) {

			var xhr = new XMLHttpRequest();
			xhr.responseType = "arraybuffer";
			xhr.open( 'GET', link, true );

			xhr.onreadystatechange = function () {

				if ( xhr.readyState === 4 ) {

					if ( xhr.status === 200 || xhr.status === 0 ) {

						blob = URL.createObjectURL( new Blob( [ LZMAdecompact( xhr.response ) ], { type: 'application/javascript' } ) );
						physic.startWorker( isMin );

					} else {

						console.error( "Couldn't load [" + link + "] [" + xhr.status + "]" );

					}

				}

			};

			xhr.send( null );

		},

		startWorker: function ( isMin ) {

			isMin = isMin || false;

			//blob = document.location.href.replace(/\/[^/]*$/,"/") + "./build/ammo.js" ;

			//worker = new Worker( physic.folder + (isMin ? 'gun.min.js' : 'gun.js') );
			worker = new Worker( physic.folder + 'ammowker.js');
			worker.postMessage = worker.webkitPostMessage || worker.postMessage;
			worker.onmessage = physic.message;

			// test transferrables
			var ab = new ArrayBuffer( 1 );
			worker.postMessage( { m: 'test', ab: ab }, [ ab ] );
			isBuffer = ab.byteLength ? false : true;

			if( isInternUpdate ) isBuffer = false;

			// start physic worker
			physic.post( 'init', { blob: blob, ArPos: root.ArPos, ArMax: root.ArMax, isBuffer: isBuffer, option: option } );
			root.post = physic.post;

		},

		initArray: function ( Counts ) {

			Counts = Counts || {};

			var counts = {
				maxBody: Counts.maxBody || 1400,
				maxContact: Counts.maxContact || 200,
				maxCharacter: Counts.maxCharacter || 10,
				maxCar: Counts.maxCar || 14,
				maxSoftPoint: Counts.maxSoftPoint || 8192,
				maxJoint: Counts.maxJoint || 1000,
			};

			root.ArLng = [
				counts.maxBody * 8, // rigidbody
				counts.maxContact, // contact
				counts.maxCharacter * 8, // hero
				counts.maxCar * 64, // cars
				counts.maxSoftPoint * 3, // soft point
				counts.maxJoint * 14, // joint point
			];

			root.ArPos = [
				0,
				root.ArLng[ 0 ],
				root.ArLng[ 0 ] + root.ArLng[ 1 ],
				root.ArLng[ 0 ] + root.ArLng[ 1 ] + root.ArLng[ 2 ],
				root.ArLng[ 0 ] + root.ArLng[ 1 ] + root.ArLng[ 2 ] + root.ArLng[ 3 ],
				root.ArLng[ 0 ] + root.ArLng[ 1 ] + root.ArLng[ 2 ] + root.ArLng[ 3 ] + root.ArLng[ 4 ],
			];

			root.ArMax = root.ArLng[ 0 ] + root.ArLng[ 1 ] + root.ArLng[ 2 ] + root.ArLng[ 3 ] + root.ArLng[ 4 ] + root.ArLng[ 5 ];

		},

		initEngine: function () {

			URL.revokeObjectURL( blob );
			blob = null;

			this.initObject();

			console.log( 'WPhysic ' + REVISION + ' | '+ ( isBuffer ? 'buffer' : 'no buffer' ) + ' | ' + type );

			if ( callback ) callback();

		},

		start: function ( noAutoUpdate ) {

			if( isPause ) return;

			physic.stop();

			//console.log('start', t.timerate );

			stepNext = true;

			// create tranfere array if buffer
			if ( isBuffer ) root.Ar = new Float32Array( root.ArMax );

			//physic.sendData( 0 );

			t.then = Time.now();



			if( !noAutoUpdate && !isInternUpdate ){

				timer = option.animFrame ? requestAnimationFrame( physic.sendData ) : setInterval(  function(){ physic.sendData() }, t.timerate );

				//console.log( option.animFrame )

			}

			if( !noAutoUpdate && isInternUpdate ){ //physic.sendStep();
				var key = physic.getKey();
				worker.postMessage( { m: 'internStep', o: {  steptime:t.steptime, key:key }, flow: root.flow, Ar: root.Ar } );
			}

			// test ray
			physic.setMode( oldMode );

		},

		prevUpdate: function () {},
		postUpdate: function () {},
		pastUpdate: function () {},

		update: function () {

			physic.postUpdate( t.delta );

			rigidBody.step( root.Ar, root.ArPos[ 0 ] );
			collision.step( root.Ar, root.ArPos[ 1 ] );
			character.step( root.Ar, root.ArPos[ 2 ] );
			vehicles.step( root.Ar, root.ArPos[ 3 ] );
			softBody.step( root.Ar, root.ArPos[ 4 ] );
			constraint.step( root.Ar, root.ArPos[ 5 ] );

			terrains.step();

			rayCaster.step();

			physic.pastUpdate( t.delta );

		},

		step: function ( fps, delta ) {


			//t.now = Time.now();

			//var start = Time.now();


			if( isInternUpdate ){
				t.fps = fps;
				t.delta = delta 
			} else {
			    //t.now = Time.now();
				if ( t.now - 1000 > t.tmp ) { t.tmp = t.now; t.fps = t.n; t.n = 0; } t.n ++; // FPS
			}

			

			

			physic.tell();

			physic.update();
			

			//if ( root.controler ) root.controler.follow();
			
			
			physic.stepRemove();
        	physic.stepAdd();



        	//t.steptime = (Time.now() - t.now) * 0.001; // millisecond

        	
            stepNext = true;


			if( isInternUpdate ){ physic.sendStep(); }

			

		},

		sendData: function ( stamp ) {

			if( isInternUpdate ) return;

			if ( root.refView ) if ( root.refView.pause ) { physic.stop(); return; }
        	
        	if( option.animFrame ){

        		timer = requestAnimationFrame( physic.sendData );
        		//if ( !stepNext ) return;
        		t.now = stamp === undefined ? Time.now() : stamp;
        		t.deltaTime = t.now - t.then;
        		t.delta = t.deltaTime * 0.001;

        		if ( t.deltaTime > t.timerate ){

        			t.then = t.now - ( t.deltaTime % t.timerate );
        				
        			physic.sendStep();
        			
        		}
        		

        	} else {

        		if ( !stepNext ){ stats.skip++; return; }

        		//t.delta = ( t.now - Time.now() ) * 0.001;

        		t.delta = ( t.now - t.then ) * 0.001;
        		t.then = t.now;

        		//t.now = Time.now();
			    //t.delta = ( t.now - t.then ) * 0.001;

			    //t.delta -= t.steptime;

			    //console.log(t.delta)
        	    //t.then = t.now;
        	    //

        	    physic.sendStep();

        	}


		},

		sendStep: function () {

			if ( !stepNext ) return;

			t.now = Time.now();
			//t.delta = ( t.now - t.then ) * 0.001;
			//t.then = t.now;

			physic.prevUpdate( t.delta );

			var key = physic.getKey();

        	// timeStep < maxSubSteps * fixedTimeStep if you don't want to lose time.

        	if( isInternUpdate ) {

        		if ( isBuffer ) worker.postMessage( { m: 'internStep', o: { steptime:t.steptime,  key:key }, flow: root.flow, Ar: root.Ar }, [ root.Ar.buffer ] );
			    //else worker.postMessage( { m: 'internStep', o: {  steptime:t.steptime, key:key }, flow: root.flow, Ar: root.Ar } );

        	} else {

        		if ( isBuffer ) worker.postMessage( { m: 'step', o: { delta: t.delta, key:key }, flow: root.flow, Ar: root.Ar }, [ root.Ar.buffer ] );
			    else worker.postMessage( { m: 'step', o: { delta: t.delta, key:key }, flow: root.flow, Ar: root.Ar } );

        	}

        	

			stepNext = false;

		},

		simpleStep: function (delta) {

			var key = physic.getKey();
			worker.postMessage( { m: 'step', o: { delta: delta, key:key } } );

		},

		

		/////////

		stepRemove: function () {

			if( tmpRemove.length === 0 ) return;
			this.post( 'setRemove', tmpRemove );
			while ( tmpRemove.length > 0 ) this.remove( tmpRemove.pop(), true );

		},

		stepAdd: function () {

			if( tmpAdd.length === 0 ) return;
			//this.post( 'setAdd', tmpAdd );
			while ( tmpAdd.length > 0 ) this.add( tmpAdd.shift() );

		},

		setView: function ( v ) {
			root.refView = v;
			root.mat = Object.assign( {}, root.mat, v.getMat() );
			root.geo = Object.assign( {}, root.geo, v.getGeo() );//v.getGeo();
			root.container = v.getContent();
			root.controler = v.getControler();

			root.isRefView = true;

			//if( isInternUpdate ) root.refView.updateIntern = physic.update;

		},

		getFps: function () { return t.fps; },
		getDelta: function () { return t.delta; },
		getIsFixed: function () { return option.fixed; },
		getKey: function () { return [ 0, 0, 0, 0, 0, 0, 0, 0 ]; },

		tell: function () {},
		log: function () {},


		

		post: function ( m, o ) {

			worker.postMessage( { m:m, o:o } );

		},

		reset: function ( full ) {

			stats.skip = 0;

			//console.log('reset', full);

			physic.postUpdate = function(){}
			physic.pastUpdate = function(){}
			physic.prevUpdate = function(){}

			isPause = false;

			oldMode = currentMode;
			physic.setMode( '' );

			physic.stop();

			// remove all mesh
			physic.clear();

			// remove tmp material
			while ( root.tmpMat.length > 0 ) root.tmpMat.pop().dispose();

			tmpRemove = [];
			tmpAdd = [];
			oldFollow = '';

			if ( root.refView ) root.refView.reset( full );

			// clear physic object;
			physic.post( 'reset', { full: full } );

		},

		pause: function () {

			isPause = true;

		},

		play: function () {

			if( !isPause ) return
			isPause = false;
			physic.start();
			
		}, 

		stop: function () {

			if ( timer === null ) return;

			if( option.animFrame ) window.cancelAnimationFrame( timer );
			else clearInterval( timer );
			
			timer = null;

		},

		destroy: function () {

			worker.terminate();
			worker = undefined;

		},



		////////////////////////////

		addMat: function ( m ) {

			root.tmpMat.push( m );

		},

		ellipsoidMesh: function ( o ) {

			softBody.createEllipsoid( o );

		},

		updateTmpMat: function ( envmap, hdr ) {

			var i = root.tmpMat.length, m;
			while ( i -- ) {

				m = root.tmpMat[ i ];
				if ( m.envMap !== undefined ) {

					if ( m.type === 'MeshStandardMaterial' ) m.envMap = envmap;
					else m.envMap = hdr ? null : envmap;
					m.needsUpdate = true;

				}

			}

		},

		setVehicle: function ( o ) {

			root.flow.vehicle.push( o );

		},

		drive: function ( name ) {

			this.post( 'setDrive', name );

		},

		move: function ( name ) {

			this.post( 'setMove', name );

		},

		//-----------------------------
		//
		//  DIRECT
		//
		//-----------------------------

		// if( o.constructor !== Array ) o = [ o ];

		forces: function ( o, direct ) {

			direct = direct || false;
			physic.post( direct ? 'directForces' : 'setForces', o );

		},

		options: function ( o, direct ) {

			direct = direct || false;
			physic.post( direct ? 'directOptions' : 'setOptions', o );

		},

		matrix: function ( o, direct ) {

			direct = direct || false;
			physic.post( direct ? 'directMatrix' : 'setMatrix', o );

		},

		//-----------------------------
		//
		//  FLOW
		//
		//-----------------------------

		clearFlow: function () {

			root.flow = { ray:[], terrain:[], vehicle:[] };
			//root.flow = { matrix:{}, force:{}, option:{}, ray:[], terrain:[], vehicle:[] };

		},

		anchor: function ( o ) {

			this.post( 'addAnchor', o );

		},

		break: function ( o ) {

			this.post( 'addBreakable', o );

		},

		moveSolid: function ( o ) {

			if ( ! map.has( o.name ) ) return;
			var b = map.get( o.name );
			if ( o.pos !== undefined ) b.position.fromArray( o.pos );
			if ( o.quat !== undefined ) b.quaternion.fromArray( o.quat );

		},

		getBodys: function () {

			return rigidBody.bodys;

		},

		initObject: function () {

			rigidBody = new RigidBody();
			softBody = new SoftBody();
			terrains = new Terrain();
			vehicles = new Vehicle();
			character = new Character();
			collision = new Collision();
			rayCaster = new RayCaster();
			constraint = new Constraint();

		},

		//-----------------------------
		//
		//  CLEAR
		//
		//-----------------------------

		clear: function () {

			physic.clearFlow();

			rigidBody.clear();
			collision.clear();
			terrains.clear();
			vehicles.clear();
			character.clear();
			softBody.clear();
			rayCaster.clear();
			constraint.clear();

			while ( root.extraGeo.length > 0 ) root.extraGeo.pop().dispose();

		},

		//-----------------------------
		//
		//  REMOVE
		//
		//-----------------------------

		remove: function ( name, phy ) {

		    // remove physics 
			if( !phy ) this.post( 'remove', name );

			//if ( ! map.has( name ) ) return;
			var b = physic.byName( name );
			if( b === null ) return;

			switch( b.type ){

				case 'solid': case 'body' :
				    rigidBody.remove( name );
				break;

				case 'soft' :
				    softBody.remove( name );
				break;

				case 'terrain' :
				    terrains.remove( name );
				break;

				case 'collision' :
				    collision.remove( name );
				break;

				case 'ray' :
				    rayCaster.remove( name );
				break;

				case 'constraint':
				    constraint.remove( name );
				break;

			}

		},
		//---------------------------------------
		//
		//---------------------------------------
		info:function(){
			return {
				solids:rigidBody.solids.length,
				bodys:rigidBody.bodys.length,
				softs:softBody.softs.length,
				terrains:terrains.terrains.length,
				cars:vehicles.cars.length,				
				rays:rayCaster.rays.length,
				pairs:collision.pairs.length,
				joints:constraint.joints.length
			};
		},
		removes: function ( o ) {

			tmpRemove = tmpRemove.concat( o );

		},

		removesDirect: function ( o ) {

			this.post( 'directRemoves', o );

		},

		//-----------------------------
		//
		//  FIND OBJECT
		//
		//-----------------------------

		byName: function ( name ) {

			if ( ! map.has( name ) ) { physic.tell('no find object !!' ); return null; }
			else return map.get( name );

		},
		
		has: function( name ){
			return map.has( name );
		},
		
		//-----------------------------
		//
		//  ADD
		//
		//-----------------------------

		addGroup: function ( list ) {

			tmpAdd = tmpAdd.concat( list );

		},

		add: function ( o ) {

			o = o || {};
			var type = o.type === undefined ? 'box' : o.type;
			var prev = type.substring( 0, 4 );

			if ( prev === 'join' ) return constraint.add( o );
			else if ( prev === 'soft' ) return softBody.add( o );
			else if ( type === 'terrain' ) return terrains.add( o );
			else if ( type === 'character' ) return character.add( o );
			else if ( type === 'collision' ) return collision.add( o );
			else if ( type === 'car' ) return vehicles.add( o );
			else if ( type === 'ray' ) return rayCaster.add( o );
			else return rigidBody.add( o );

		},

		defaultRoot: function () {

			// geometry

			var geo = {
				circle: new THREE.CircleBufferGeometry( 1, 6 ),
				plane: new THREE.PlaneBufferGeometry( 1, 1, 1, 1 ),
				box: new THREE.BoxBufferGeometry( 1, 1, 1 ),
				hardbox: new THREE.BoxBufferGeometry( 1, 1, 1 ),
				cone: new THREE.CylinderBufferGeometry( 0, 1, 0.5 ),
				wheel: new THREE.CylinderBufferGeometry( 1, 1, 1, 18 ),
				sphere: new THREE.SphereBufferGeometry( 1, 16, 12 ),
				highsphere: new THREE.SphereBufferGeometry( 1, 32, 24 ),
				cylinder: new THREE.CylinderBufferGeometry( 1, 1, 1, 12, 1 ),
				hardcylinder: new THREE.CylinderBufferGeometry( 1, 1, 1, 12, 1 ),
				joint: new THREE.ConeBufferGeometry( 0.1,0.2, 4 ),
			};

			geo.circle.rotateX( - PI90 );
			geo.plane.rotateX( - PI90 );
			geo.wheel.rotateZ( - PI90 );

			 geo.joint.translate( 0, 0.1, 0 );
			 geo.joint.rotateZ( -Math.PI*0.5 );

			root.geo = geo;

			// material

			var wire = false;
			var shadowSide = false;
			
			root.mat = {

				hide: new THREE.MeshBasicMaterial({ name: 'debug', color:0x000000, depthTest:false, depthWrite:false, visible:false }),

				move: new THREE.MeshLambertMaterial( { color: 0xCCCCCC, name: 'move', wireframe: wire, shadowSide:shadowSide } ),
				speed: new THREE.MeshLambertMaterial( { color: 0xFFCC33, name: 'speed', wireframe: wire, shadowSide:shadowSide } ),
				sleep: new THREE.MeshLambertMaterial( { color: 0x33CCFF, name: 'sleep', wireframe: wire, shadowSide:shadowSide } ),
				static: new THREE.MeshLambertMaterial( { color: 0x333333, name: 'static', wireframe: wire, shadowSide:shadowSide, transparent:true, opacity:0.3, depthTest:true, depthWrite:false } ),
				kinematic: new THREE.MeshLambertMaterial( { color: 0x88FF33, name: 'kinematic', wireframe: wire, shadowSide:shadowSide } ),
				soft: new THREE.MeshLambertMaterial({ name: 'soft', vertexColors:THREE.VertexColors, shadowSide:shadowSide }),

				debug: new THREE.MeshBasicMaterial({ name: 'debug', color:0x00FF00, depthTest:false, depthWrite:false, wireframe:true, shadowSide:shadowSide }),


				jointLine: new THREE.LineBasicMaterial( { name: 'jointLine', vertexColors: THREE.VertexColors, depthTest: false, depthWrite: false, transparent: true }),
				jointP1: new THREE.MeshBasicMaterial({ name: 'jointP1', color:0x00FF00, depthTest:false, depthWrite:true, wireframe:true }),
				jointP2: new THREE.MeshBasicMaterial({ name: 'jointP2', color:0xFFFF00, depthTest:false, depthWrite:true, wireframe:true }),

			};

			root.container = new THREE.Group();

			root.destroy = function ( b ) {

		        var m;
		        while( b.children.length > 0 ) {
		            m = b.children.pop();
		            while( m.children.length > 0 ) m.remove( m.children.pop() );
		            b.remove( m );
		        }

		        if ( b.parent ) b.parent.remove( b );

		    }

		},

		getContainer: function () {

			return root.container;

		},

		//-----------------------------
		//
		//  BREAKABLE
		//
		//-----------------------------

		makeBreak: function ( o ) {

			var name = o.name;
			if ( ! map.has( name ) ) return;

			if ( convexBreaker === null ) convexBreaker = new ConvexObjectBreaker();

			var mesh = map.get( name );

			mesh.userData.velocity = mesh.userData.velocity||new THREE.Vector3();
			mesh.userData.angularVelocity = mesh.userData.angularVelocity||new THREE.Vector3();
			// breakOption: [ maxImpulse, maxRadial, maxRandom, levelOfSubdivision ]
			var breakOption = o.breakOption;

			var debris = convexBreaker.subdivideByImpact( mesh, new THREE.Vector3().fromArray(o.pos), new THREE.Vector3().fromArray(o.normal), breakOption[ 1 ], breakOption[ 2 ] ); // , 1.5 ??
			// remove one level
			breakOption[ 3 ] -= 1;
			
			
			// remove original object
			tmpRemove.push( name );

			var i = debris.length;
			while ( i -- ) tmpAdd.push( this.addDebris( name, i, debris[ i ], breakOption ) );

			//while ( i -- ) this.addDebris( name, i, debris[ i ], breakOption );

		},

		addDebris: function ( name, id, mesh, breakOption ) {

			var o = {
				name: name + '_debris' + id,
				material: mesh.material,
				type: 'convex',
				shape: mesh.geometry,
				//size: mesh.scale.toArray(),
				pos: mesh.position.toArray(),
				quat: mesh.quaternion.toArray(),
				mass: mesh.userData.mass,
				linearVelocity: mesh.userData.velocity.toArray(),
				angularVelocity: mesh.userData.angularVelocity.toArray(),
				margin: 0.05,
			};

			// if levelOfSubdivision > 0 make debris breakable !!
			if ( breakOption[ 3 ] > 0 ) {

				o.breakable = true;
				o.breakOption = breakOption;

			}

			//this.add( o );

			return o;

		},

		//-----------------------------
		//
		// EXTRA MODE
		//
		//-----------------------------

		setMode: function ( mode ) {
			console.log('mode==='+mode);
			if ( mode !== currentMode ) {

				if ( currentMode === 'picker' ) physic.removeRayCamera();
				if ( currentMode === 'shoot' ) physic.removeShootCamera();
				if ( currentMode === 'lock' ) physic.removeLockCamera();

			}

			currentMode = mode;

			if ( currentMode === 'picker' ) physic.addRayCamera();
			if ( currentMode === 'shoot' ) physic.addShootCamera();
			if ( currentMode === 'lock' ) physic.addLockCamera();

		},

		// CAMERA LOCK

		addLockCamera: function () {

		},

		removeLockCamera: function () {

		},

		// CAMERA SHOOT

		addShootCamera: function () {

		},

		removeShootCamera: function () {

		},

		// CAMERA RAY

		addRayCamera: function () {

			if ( ! root.refView ) return;
			//debugger;
			ray = physic.add( { name: 'cameraRay', type: 'ray', callback: physic.onRay, mask: 1, visible: false } );// only move body
			root.refView.activeRay( physic.updateRayCamera, false );

		},

		removeRayCamera: function () {

			if ( ! root.refView ) return;
			physic.remove( 'cameraRay' );
			root.refView.removeRay();
			physic.log();

		},

		updateRayCamera: function ( offset ) {
			//console.log('mouseMode=='+mouseMode);
			//ray.setFromCamera( refView.getMouse(), refView.getCamera() );
			if ( mouseMode === 'drag' ) physic.matrix( [{ name:'dragger', pos: offset.toArray(), keepRot:true }] );

		},

		onRay: function ( o ) {
			var mouse = root.refView.getMouse();
			var control = root.refView.getControls();
			var name = o.name === undefined ? '' : o.name;
			//console.log('o.name=='+o.name);
			ray.setFromCamera( mouse, control.object );

			if ( mouse.z === 0 ) {

				if ( mouseMode === 'drag' ){ 
					control.enableRotate = true;
					physic.removeConnector();
				}

				mouseMode = 'free';

			} else {

				if ( mouseMode === 'free' ) {

					if ( name ) {

						if( mouseMode !== 'drag' ){							
							root.refView.setDragPlane( o.point );
						    control.enableRotate = false;
						    physic.addConnector( o );
						    mouseMode = 'drag';

						} 

					} else {

						mouseMode = 'rotate';

					}

				}

				/*if ( mouseMode === 'drag' ){

					physic.matrix( [{ name:'dragger', pos: root.refView.getOffset().toArray() }] );

				}*/

			}

			// debug
			physic.log( mouseMode + '   ' + name );

		},

		addConnector: function ( o ) {

			//if ( ! map.has( o.name ) ) { console.log('no find !!'); return;}
			//var mesh = map.get( o.name );

			var mesh = physic.byName( o.name );
			if( mesh === null ) return;

			// reste follow on drag
			physic.testCurrentFollow( o.name );  


			var p0 = new THREE.Vector3().fromArray( o.point );
			var qB = mesh.quaternion.toArray();
			var pos = physic.getLocalPoint( p0, mesh ).toArray();

			physic.add({ 
				name:'dragger', 
				type:'sphere', 
				size:[0.2], 
				pos:o.point,
				quat: qB, 
				mass:0, 
				kinematic: true,
				group:32,
				mask:32, 
			});

			physic.add({ 
				name:'connector', 
				type:'joint_fixe', 
				b1:'dragger', b2:o.name, 
				pos1:[0,0,0], pos2:pos,
				collision:false 
			});
		},

		removeConnector: function () {

			physic.remove( 'dragger' );
			physic.remove( 'connector' );

			if( oldFollow !== '' ) physic.setCurrentFollow( oldFollow );

		},

		getLocalPoint: function (vector, mesh) {
			
			mesh.updateMatrix();
			//mesh.updateMatrixWorld(true);
			var m1 = new THREE.Matrix4();
			var s = new THREE.Vector3(1,1,1);
			var m0 = new THREE.Matrix4().compose( mesh.position, mesh.quaternion, s );
			m1.copy( m0 ).invert();
			return vector.applyMatrix4( m1 );

		},

		setCurrentFollow: function ( name, o ) {

			if( !root.refView ) return;
			var target = physic.byName( name );
            if( target !== null ) root.refView.getControls().initFollow( target, o );
            else root.refView.getControls().resetFollow();
            oldFollow = '';

		},


		testCurrentFollow: function ( name ) {

			oldFollow = '';
			if( !root.refView ) return;
			if( !root.refView.getControls().followTarget ) return;
			if( root.refView.getControls().followTarget.name === name ){ 
				root.refView.getControls().resetFollow();
				oldFollow = name;
			}

		},



	};

} )();
