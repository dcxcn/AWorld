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

class WPhysic {
	constructor() {
		this.type = 'LZMA'; // LZMA / WASM / ASM

		this.worker = null;
		this.callback = null;
		this.blob = null;

		this.URL = window.URL || window.webkitURL;
		this.Time = typeof performance === 'undefined' ? Date : performance;
		this.t = { now: 0, delta: 0, then: 0, deltaTime: 0, inter: 0, tmp: 0, n: 0, timerate: 0, steptime: 0 };

		this.timer = null;

		this.isBuffer = false;
		this.isPause = false;
		this.stepNext = false;

		this.currentMode = '';
		this.oldMode = '';

		this.PI90 = Math.PI * 0.5;
		this.torad = Math.PI / 180;
		this.todeg = 180 / Math.PI;

		this.rigidBody = null;
		this.softBody = null;
		this.terrains = null;
		this.vehicles = null;
		this.character = null;
		this.collision = null;
		this.rayCaster = null;
		this.constraint = null;

		this.convexBreaker = null;
		this.ray = null;
		this.mouseMode = 'free';

		this.tmpRemove = [];
		this.tmpAdd = [];

		this.oldFollow = '';

		this.stats = { skip: 0, };

		this.isInternUpdate = false;
		//this.isRequestAnimationFrame = false;

		this.option = {

			worldscale: 1,
			gravity: [0, - 9.8, 0],
			fps: 60,

			substep: 2,
			broadphase: 2,
			soft: true,

			animFrame: true,
			fixed: true,
			jointDebug: false,

		};
		this.folder = './js/libs/';
	}

	message(e) {

		var data = e.data;
		if (data.Ar) root.Ar = data.Ar;
		if (data.flow) root.flow = data.flow;

		switch (data.m) {

			case 'initEngine': this.initEngine(); break;
			case 'start': this.start(); break;
			case 'step': this.step(data.fps, data.delta); break;

			case 'moveSolid': this.moveSolid(data.o); break;
			case 'ellipsoid': this.ellipsoidMesh(data.o); break;

			case 'makeBreak': this.makeBreak(data.o); break;

		}

	}
	init(Callback, Type, Option, Counts) {

		this.initArray(Counts);
		this.defaultRoot();

		Option = Option || {};

		this.callback = Callback;

		this.isInternUpdate = Option.use_intern_update || false;

		this.option = {

			fps: Option.fps || 60,
			worldscale: Option.worldscale || 1,
			gravity: Option.gravity || [0, - 9.8, 0],
			substep: Option.substep || 2,
			broadphase: Option.broadphase || 2,
			soft: Option.soft !== undefined ? Option.soft : true,
			//penetration: Option.penetration || 0.0399,

			fixed: Option.fixed !== undefined ? Option.fixed : true,
			animFrame: Option.animFrame !== undefined ? Option.animFrame : true,

			jointDebug: Option.jointDebug !== undefined ? Option.jointDebug : false,

			isInternUpdate: this.isInternUpdate,

		};

		this.t.timerate = (1 / this.option.fps) * 1000;
		//t.autoFps = option.autoFps;

		this.type = Type || 'LZMA';

		switch (this.type) {

			case 'min':
				this.load(this.folder + "ammo.hex", true);
				break;

			case 'LZMA': case 'lzma': case 'compact':
				this.load(this.folder + "ammo.hex");
				break;

			case 'WASM': case 'wasm':
				this.blob = document.location.href.replace(/\/[^/]*$/, "/") + this.folder + "ammo.wasm.js";
				this.startWorker();
				break;

			case 'BASIC': case 'basic':
				this.blob = document.location.href.replace(/\/[^/]*$/, "/") + this.folder + "ammo.js";
				this.startWorker();
				break;

		}

	}

	set(o) {

		o = o || this.option;
		this.t.timerate = o.fps !== undefined ? (1 / o.fps) * 1000 : this.t.timerate;
		//t.autoFps = o.autoFps !== undefined ? o.autoFps : false;

		this.option.fixed = o.fixed || false;
		this.option.animFrame = o.animFrame || false;
		this.option.jointDebug = o.jointDebug || false;

		o.isInternUpdate = this.isInternUpdate;

		root.constraintDebug = this.option.jointDebug;

		this.post('set', o);

	}

	load(link, isMin) {

		var physic = this;
		var xhr = new XMLHttpRequest();
		xhr.responseType = "arraybuffer";
		xhr.open('GET', link, true);

		xhr.onreadystatechange = function () {

			if (xhr.readyState === 4) {

				if (xhr.status === 200 || xhr.status === 0) {

					physic.blob = URL.createObjectURL(new Blob([LZMAdecompact(xhr.response)], { type: 'application/javascript' }));
					physic.startWorker(isMin);

				} else {

					console.error("Couldn't load [" + link + "] [" + xhr.status + "]");

				}

			}

		};

		xhr.send(null);

	}

	startWorker(isMin) {

		isMin = isMin || false;

		//this.blob = document.location.href.replace(/\/[^/]*$/,"/") + "./build/ammo.js" ;

		//this.worker = new Worker( this.folder + (isMin ? 'gun.min.js' : 'gun.js') );
		this.worker = new Worker(this.folder + 'ammowker.js');
		this.worker.postMessage = this.worker.webkitPostMessage || this.worker.postMessage;
		this.worker.onmessage = this.message.bind(this);

		// test transferrables
		var ab = new ArrayBuffer(1);
		this.worker.postMessage({ m: 'test', ab: ab }, [ab]);
		this.isBuffer = ab.byteLength ? false : true;

		if (this.isInternUpdate) this.isBuffer = false;

		// start physic worker
		this.post('init', { blob: this.blob, ArPos: root.ArPos, ArMax: root.ArMax, isBuffer: this.isBuffer, option: this.option });
		root.post = this.post.bind(this);

	}

	initArray(Counts) {

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
			root.ArLng[0],
			root.ArLng[0] + root.ArLng[1],
			root.ArLng[0] + root.ArLng[1] + root.ArLng[2],
			root.ArLng[0] + root.ArLng[1] + root.ArLng[2] + root.ArLng[3],
			root.ArLng[0] + root.ArLng[1] + root.ArLng[2] + root.ArLng[3] + root.ArLng[4],
		];

		root.ArMax = root.ArLng[0] + root.ArLng[1] + root.ArLng[2] + root.ArLng[3] + root.ArLng[4] + root.ArLng[5];

	}

	initEngine() {

		URL.revokeObjectURL(this.blob);
		this.blob = null;

		this.initObject();

		console.log('WPhysic ' + REVISION + ' | ' + (this.isBuffer ? 'buffer' : 'no buffer') + ' | ' + this.type);

		if (this.callback) this.callback();

	}

	start(noAutoUpdate) {

		if (this.isPause) return;

		this.stop();

		//console.log('start', t.timerate );

		this.stepNext = true;

		// create tranfere array if buffer
		if (this.isBuffer) root.Ar = new Float32Array(root.ArMax);

		//physic.sendData( 0 );

		this.t.then = this.Time.now();



		if (!noAutoUpdate && !this.isInternUpdate) {

			this.timer = this.option.animFrame ? requestAnimationFrame(this.sendData.bind(this)) : setInterval(function () { this.sendData.bind(this)() }, this.t.timerate);

			//console.log( option.animFrame )

		}

		if (!noAutoUpdate && this.isInternUpdate) { //physic.sendStep();
			var key = this.getKey();
			this.worker.postMessage({ m: 'internStep', o: { steptime: this.t.steptime, key: key }, flow: root.flow, Ar: root.Ar });
		}

		// test ray
		this.setMode(this.oldMode);

	}

	prevUpdate() { }
	postUpdate() { }
	pastUpdate() { }

	update() {

		this.postUpdate(this.t.delta);

		this.rigidBody.step(root.Ar, root.ArPos[0]);
		this.collision.step(root.Ar, root.ArPos[1]);
		this.character.step(root.Ar, root.ArPos[2]);
		this.vehicles.step(root.Ar, root.ArPos[3]);
		this.softBody.step(root.Ar, root.ArPos[4]);
		this.constraint.step(root.Ar, root.ArPos[5]);

		this.terrains.step();

		this.rayCaster.step();

		this.pastUpdate(this.t.delta);

	}
	step(fps, delta) {


		//t.now = Time.now();

		//var start = Time.now();


		if (this.isInternUpdate) {
			this.t.fps = fps;
			this.t.delta = delta
		} else {
			//t.now = Time.now();
			if (this.t.now - 1000 > this.t.tmp) { this.t.tmp = this.t.now; this.t.fps = this.t.n; this.t.n = 0; } this.t.n++; // FPS
		}





		this.tell();

		this.update();


		//if ( root.controler ) root.controler.follow();


		this.stepRemove();
		this.stepAdd();



		//t.steptime = (Time.now() - t.now) * 0.001; // millisecond


		this.stepNext = true;


		if (this.isInternUpdate) { this.sendStep(); }



	}

	sendData(stamp) {

		if (this.isInternUpdate) return;

		if (root.refView) if (root.refView.pause) { this.stop(); return; }

		if (this.option.animFrame) {

			this.timer = requestAnimationFrame(this.sendData.bind(this));
			//if ( !stepNext ) return;
			this.t.now = stamp === undefined ? this.Time.now() : stamp;
			this.t.deltaTime = this.t.now - this.t.then;
			this.t.delta = this.t.deltaTime * 0.001;

			if (this.t.deltaTime > this.t.timerate) {

				this.t.then = this.t.now - (this.t.deltaTime % this.t.timerate);

				this.sendStep();

			}


		} else {

			if (!this.stepNext) { this.stats.skip++; return; }

			//t.delta = ( t.now - Time.now() ) * 0.001;

			this.t.delta = (this.t.now - this.t.then) * 0.001;
			this.t.then = this.t.now;

			//t.now = Time.now();
			//t.delta = ( t.now - t.then ) * 0.001;

			//t.delta -= t.steptime;

			//console.log(t.delta)
			//t.then = t.now;
			//

			this.sendStep();

		}


	}

	sendStep() {

		if (!this.stepNext) return;

		this.t.now = this.Time.now();
		//t.delta = ( t.now - t.then ) * 0.001;
		//t.then = t.now;

		this.prevUpdate(this.t.delta);

		var key = this.getKey();

		// timeStep < maxSubSteps * fixedTimeStep if you don't want to lose time.

		if (this.isInternUpdate) {

			if (this.isBuffer) this.worker.postMessage({ m: 'internStep', o: { steptime: this.t.steptime, key: key }, flow: root.flow, Ar: root.Ar }, [root.Ar.buffer]);
			//else worker.postMessage( { m: 'internStep', o: {  steptime:t.steptime, key:key }, flow: root.flow, Ar: root.Ar } );

		} else {

			if (this.isBuffer) this.worker.postMessage({ m: 'step', o: { delta: this.t.delta, key: key }, flow: root.flow, Ar: root.Ar }, [root.Ar.buffer]);
			else this.worker.postMessage({ m: 'step', o: { delta: this.t.delta, key: key }, flow: root.flow, Ar: root.Ar });

		}



		this.stepNext = false;

	}

	simpleStep(delta) {

		var key = this.getKey();
		this.worker.postMessage({ m: 'step', o: { delta: delta, key: key } });

	}
	/////////

	stepRemove() {

		if (this.tmpRemove.length === 0) return;
		this.post('setRemove', this.tmpRemove);
		while (this.tmpRemove.length > 0) this.remove(this.tmpRemove.pop(), true);

	}

	stepAdd() {

		if (this.tmpAdd.length === 0) return;
		//this.post( 'setAdd', tmpAdd );
		while (this.tmpAdd.length > 0) this.add(this.tmpAdd.shift());

	}

	setView(v) {
		root.refView = v;
		root.mat = Object.assign({}, root.mat, v.getMat());
		root.geo = Object.assign({}, root.geo, v.getGeo());//v.getGeo();
		root.container = v.getContent();
		root.controler = v.getControler();

		root.isRefView = true;

		//if( isInternUpdate ) root.refView.updateIntern = physic.update;

	}

	getFps() { return this.t.fps; }
	getDelta() { return this.t.delta; }
	getIsFixed() { return this.option.fixed; }
	getKey() { return [0, 0, 0, 0, 0, 0, 0, 0]; }

	tell() { }
	log() { }
	post(m, o) {

		this.worker.postMessage({ m: m, o: o });

	}

	reset(full) {

		this.stats.skip = 0;

		//console.log('reset', full);

		this.postUpdate = function () { }
		this.pastUpdate = function () { }
		this.prevUpdate = function () { }

		this.isPause = false;

		this.oldMode = this.currentMode;
		this.setMode('');

		this.stop();

		// remove all mesh
		this.clear();

		// remove tmp material
		while (root.tmpMat.length > 0) root.tmpMat.pop().dispose();

		this.tmpRemove = [];
		this.tmpAdd = [];
		this.oldFollow = '';

		if (root.refView) root.refView.reset(full);

		// clear physic object;
		this.post('reset', { full: full });

	}

	pause() {

		this.isPause = true;

	}

	play() {

		if (!this.isPause) return
		this.isPause = false;
		this.start();

	}

	stop() {

		if (this.timer === null) return;

		if (this.option.animFrame) window.cancelAnimationFrame(this.timer);
		else clearInterval(this.timer);

		this.timer = null;

	}

	destroy() {

		this.worker.terminate();
		this.worker = undefined;

	}
	////////////////////////////

	addMat(m) {

		root.tmpMat.push(m);

	}

	ellipsoidMesh(o) {

		softBody.createEllipsoid(o);

	}

	updateTmpMat(envmap, hdr) {

		var i = root.tmpMat.length, m;
		while (i--) {

			m = root.tmpMat[i];
			if (m.envMap !== undefined) {

				if (m.type === 'MeshStandardMaterial') m.envMap = envmap;
				else m.envMap = hdr ? null : envmap;
				m.needsUpdate = true;

			}

		}

	}

	setVehicle(o) {

		root.flow.vehicle.push(o);

	}

	drive(name) {

		this.post('setDrive', name);

	}

	move(name) {

		this.post('setMove', name);

	}

	//-----------------------------
	//
	//  DIRECT
	//
	//-----------------------------

	// if( o.constructor !== Array ) o = [ o ];

	forces(o, direct) {

		direct = direct || false;
		this.post(direct ? 'directForces' : 'setForces', o);

	}

	options(o, direct) {

		direct = direct || false;
		this.post(direct ? 'directOptions' : 'setOptions', o);

	}

	matrix(o, direct) {

		direct = direct || false;
		this.post(direct ? 'directMatrix' : 'setMatrix', o);

	}

	//-----------------------------
	//
	//  FLOW
	//
	//-----------------------------

	clearFlow() {

		root.flow = { ray: [], terrain: [], vehicle: [] };
		//root.flow = { matrix:{}, force:{}, option:{}, ray:[], terrain:[], vehicle:[] };

	}

	anchor(o) {

		this.post('addAnchor', o);

	}

	break(o) {

		this.post('addBreakable', o);

	}

	moveSolid(o) {

		if (!map.has(o.name)) return;
		var b = map.get(o.name);
		if (o.pos !== undefined) b.position.fromArray(o.pos);
		if (o.quat !== undefined) b.quaternion.fromArray(o.quat);

	}

	getBodys() {

		return rigidBody.bodys;

	}

	initObject() {

		this.rigidBody = new RigidBody();
		this.softBody = new SoftBody();
		this.terrains = new Terrain();
		this.vehicles = new Vehicle();
		this.character = new Character();
		this.collision = new Collision();
		this.rayCaster = new RayCaster();
		this.constraint = new Constraint();

	}

	//-----------------------------
	//
	//  CLEAR
	//
	//-----------------------------

	clear() {

		this.clearFlow();

		this.rigidBody.clear();
		this.collision.clear();
		this.terrains.clear();
		this.vehicles.clear();
		this.character.clear();
		this.softBody.clear();
		this.rayCaster.clear();
		this.constraint.clear();

		while (root.extraGeo.length > 0) root.extraGeo.pop().dispose();

	}

	//-----------------------------
	//
	//  REMOVE
	//
	//-----------------------------

	remove(name, phy) {

		// remove physics 
		if (!phy) this.post('remove', name);

		//if ( ! map.has( name ) ) return;
		var b = this.byName(name);
		if (b === null) return;

		switch (b.type) {

			case 'solid': case 'body':
				this.rigidBody.remove(name);
				break;

			case 'soft':
				this.softBody.remove(name);
				break;

			case 'terrain':
				this.terrains.remove(name);
				break;

			case 'collision':
				this.collision.remove(name);
				break;

			case 'ray':
				this.rayCaster.remove(name);
				break;

			case 'constraint':
				this.constraint.remove(name);
				break;

		}

	}
	//---------------------------------------
	//
	//---------------------------------------
	info() {
		return {
			solids: this.rigidBody.solids.length,
			bodys: this.rigidBody.bodys.length,
			softs: this.softBody.softs.length,
			terrains: this.terrains.terrains.length,
			cars: this.vehicles.cars.length,
			rays: this.rayCaster.rays.length,
			pairs: this.collision.pairs.length,
			joints: this.constraint.joints.length
		};
	}
	removes(o) {

		this.tmpRemove = this.tmpRemove.concat(o);

	}

	removesDirect(o) {

		this.post('directRemoves', o);

	}
	//-----------------------------
	//
	//  FIND OBJECT
	//
	//-----------------------------

	byName(name) {

		if (!map.has(name)) { this.tell('no find object !!'); return null; }
		else return map.get(name);

	}

	has(name) {
		return map.has(name);
	}

	//-----------------------------
	//
	//  ADD
	//
	//-----------------------------

	addGroup(list) {

		tmpAdd = tmpAdd.concat(list);

	}

	add(o) {

		o = o || {};
		var type = o.type === undefined ? 'box' : o.type;
		var prev = type.substring(0, 4);

		if (prev === 'join') return this.constraint.add(o);
		else if (prev === 'soft') return this.softBody.add(o);
		else if (type === 'terrain') return this.terrains.add(o);
		else if (type === 'character') return this.character.add(o);
		else if (type === 'collision') return this.collision.add(o);
		else if (type === 'car') return this.vehicles.add(o);
		else if (type === 'ray') return this.rayCaster.add(o);
		else return this.rigidBody.add(o);

	}

	defaultRoot() {

		// geometry

		var geo = {
			circle: new THREE.CircleBufferGeometry(1, 6),
			plane: new THREE.PlaneBufferGeometry(1, 1, 1, 1),
			box: new THREE.BoxBufferGeometry(1, 1, 1),
			hardbox: new THREE.BoxBufferGeometry(1, 1, 1),
			cone: new THREE.CylinderBufferGeometry(0, 1, 0.5),
			wheel: new THREE.CylinderBufferGeometry(1, 1, 1, 18),
			sphere: new THREE.SphereBufferGeometry(1, 16, 12),
			highsphere: new THREE.SphereBufferGeometry(1, 32, 24),
			cylinder: new THREE.CylinderBufferGeometry(1, 1, 1, 12, 1),
			hardcylinder: new THREE.CylinderBufferGeometry(1, 1, 1, 12, 1),
			joint: new THREE.ConeBufferGeometry(0.1, 0.2, 4),
		};

		geo.circle.rotateX(- this.PI90);
		geo.plane.rotateX(- this.PI90);
		geo.wheel.rotateZ(- this.PI90);

		geo.joint.translate(0, 0.1, 0);
		geo.joint.rotateZ(-Math.PI * 0.5);

		root.geo = geo;

		// material

		var wire = false;
		var shadowSide = false;

		root.mat = {

			hide: new THREE.MeshBasicMaterial({ name: 'debug', color: 0x000000, depthTest: false, depthWrite: false, visible: false }),

			move: new THREE.MeshLambertMaterial({ color: 0xCCCCCC, name: 'move', wireframe: wire, shadowSide: shadowSide }),
			speed: new THREE.MeshLambertMaterial({ color: 0xFFCC33, name: 'speed', wireframe: wire, shadowSide: shadowSide }),
			sleep: new THREE.MeshLambertMaterial({ color: 0x33CCFF, name: 'sleep', wireframe: wire, shadowSide: shadowSide }),
			static: new THREE.MeshLambertMaterial({ color: 0x333333, name: 'static', wireframe: wire, shadowSide: shadowSide, transparent: true, opacity: 0.3, depthTest: true, depthWrite: false }),
			kinematic: new THREE.MeshLambertMaterial({ color: 0x88FF33, name: 'kinematic', wireframe: wire, shadowSide: shadowSide }),
			soft: new THREE.MeshLambertMaterial({ name: 'soft', vertexColors: THREE.VertexColors, shadowSide: shadowSide }),

			debug: new THREE.MeshBasicMaterial({ name: 'debug', color: 0x00FF00, depthTest: false, depthWrite: false, wireframe: true, shadowSide: shadowSide }),


			jointLine: new THREE.LineBasicMaterial({ name: 'jointLine', vertexColors: THREE.VertexColors, depthTest: false, depthWrite: false, transparent: true }),
			jointP1: new THREE.MeshBasicMaterial({ name: 'jointP1', color: 0x00FF00, depthTest: false, depthWrite: true, wireframe: true }),
			jointP2: new THREE.MeshBasicMaterial({ name: 'jointP2', color: 0xFFFF00, depthTest: false, depthWrite: true, wireframe: true }),

		};

		root.container = new THREE.Group();

		root.destroy = function (b) {

			var m;
			while (b.children.length > 0) {
				m = b.children.pop();
				while (m.children.length > 0) m.remove(m.children.pop());
				b.remove(m);
			}

			if (b.parent) b.parent.remove(b);

		}

	}

	getContainer() {

		return root.container;

	}

	//-----------------------------
	//
	//  BREAKABLE
	//
	//-----------------------------

	makeBreak(o) {

		var name = o.name;
		if (!map.has(name)) return;

		if (this.convexBreaker === null) this.convexBreaker = new ConvexObjectBreaker();

		var mesh = map.get(name);

		mesh.userData.velocity = mesh.userData.velocity || new THREE.Vector3();
		mesh.userData.angularVelocity = mesh.userData.angularVelocity || new THREE.Vector3();
		// breakOption: [ maxImpulse, maxRadial, maxRandom, levelOfSubdivision ]
		var breakOption = o.breakOption;

		var debris = this.convexBreaker.subdivideByImpact(mesh, new THREE.Vector3().fromArray(o.pos), new THREE.Vector3().fromArray(o.normal), breakOption[1], breakOption[2]); // , 1.5 ??
		// remove one level
		breakOption[3] -= 1;


		// remove original object
		this.tmpRemove.push(name);

		var i = debris.length;
		while (i--) this.tmpAdd.push(this.addDebris(name, i, debris[i], breakOption));

		//while ( i -- ) this.addDebris( name, i, debris[ i ], breakOption );

	}

	addDebris(name, id, mesh, breakOption) {

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
		if (breakOption[3] > 0) {

			o.breakable = true;
			o.breakOption = breakOption;

		}

		//this.add( o );

		return o;

	}


	//-----------------------------
	//
	// EXTRA MODE
	//
	//-----------------------------

	setMode(mode) {
		console.log('mode===' + mode);
		if (mode !== this.currentMode) {

			if (this.currentMode === 'picker') this.removeRayCamera();
			if (this.currentMode === 'shoot') this.removeShootCamera();
			if (this.currentMode === 'lock') this.removeLockCamera();

		}

		this.currentMode = mode;

		if (this.currentMode === 'picker') this.addRayCamera();
		if (this.currentMode === 'shoot') this.addShootCamera();
		if (this.currentMode === 'lock') this.addLockCamera();

	}

	// CAMERA LOCK

	addLockCamera() {

	}

	removeLockCamera() {

	}

	// CAMERA SHOOT

	addShootCamera() {

	}

	removeShootCamera() {

	}

	// CAMERA RAY

	addRayCamera() {

		if (!root.refView) return;
		//debugger;
		this.ray = this.add({ name: 'cameraRay', type: 'ray', callback: this.onRay.bind(this), mask: 1, visible: false });// only move body
		root.refView.activeRay(this.updateRayCamera.bind(this), false);

	}

	removeRayCamera() {

		if (!root.refView) return;
		this.remove('cameraRay');
		root.refView.removeRay();
		this.log();

	}

	updateRayCamera(offset) {
		//console.log('mouseMode=='+mouseMode);
		//ray.setFromCamera( refView.getMouse(), refView.getCamera() );
		if (this.mouseMode === 'drag') this.matrix([{ name: 'dragger', pos: offset.toArray(), keepRot: true }]);

	}

	onRay(o) {
		var mouse = root.refView.getMouse();
		var control = root.refView.getControls();
		var name = o.name === undefined ? '' : o.name;
		//console.log('o.name=='+o.name);
		this.ray.setFromCamera(mouse, control.object);

		if (mouse.z === 0) {

			if (this.mouseMode === 'drag') {
				control.enableRotate = true;
				this.removeConnector();
			}

			this.mouseMode = 'free';

		} else {

			if (this.mouseMode === 'free') {

				if (name) {

					if (this.mouseMode !== 'drag') {
						root.refView.setDragPlane(o.point);
						control.enableRotate = false;
						this.addConnector(o);
						this.mouseMode = 'drag';

					}

				} else {

					this.mouseMode = 'rotate';

				}

			}

			/*if ( mouseMode === 'drag' ){

				physic.matrix( [{ name:'dragger', pos: root.refView.getOffset().toArray() }] );

			}*/

		}

		// debug
		this.log(this.mouseMode + '   ' + name);

	}

	addConnector(o) {

		//if ( ! map.has( o.name ) ) { console.log('no find !!'); return;}
		//var mesh = map.get( o.name );

		var mesh = this.byName(o.name);
		if (mesh === null) return;

		// reste follow on drag
		this.testCurrentFollow(o.name);


		var p0 = new THREE.Vector3().fromArray(o.point);
		var qB = mesh.quaternion.toArray();
		var pos = this.getLocalPoint(p0, mesh).toArray();

		this.add({
			name: 'dragger',
			type: 'sphere',
			size: [0.2],
			pos: o.point,
			quat: qB,
			mass: 0,
			kinematic: true,
			group: 32,
			mask: 32,
		});

		this.add({
			name: 'connector',
			type: 'joint_fixe',
			b1: 'dragger', b2: o.name,
			pos1: [0, 0, 0], pos2: pos,
			collision: false
		});
	}

	removeConnector() {

		this.remove('dragger');
		this.remove('connector');

		if (this.oldFollow !== '') this.setCurrentFollow(this.oldFollow);

	}

	getLocalPoint(vector, mesh) {

		mesh.updateMatrix();
		//mesh.updateMatrixWorld(true);
		var m1 = new THREE.Matrix4();
		var s = new THREE.Vector3(1, 1, 1);
		var m0 = new THREE.Matrix4().compose(mesh.position, mesh.quaternion, s);
		m1.copy(m0).invert();
		return vector.applyMatrix4(m1);

	}

	setCurrentFollow(name, o) {

		if (!root.refView) return;
		var target = this.byName(name);
		if (target !== null) root.refView.getControls().initFollow(target, o);
		else root.refView.getControls().resetFollow();
		this.oldFollow = '';

	}


	testCurrentFollow(name) {

		this.oldFollow = '';
		if (!root.refView) return;
		if (!root.refView.getControls().followTarget) return;
		if (root.refView.getControls().followTarget.name === name) {
			root.refView.getControls().resetFollow();
			this.oldFollow = name;
		}

	}

}
export { WPhysic };