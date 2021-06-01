import { Gui, add } from '../../jsm/libs/uil.module.js';
import { ThreeBSP } from '../three/utils/ThreeBSP.js';

class WGui {

	constructor(o) {

		// Constants
		this.version = 'V210601';	
		this.isTouch = !!('ontouchstart' in window);
		this.isPointer = window.PointerEvent ? true : false;
		this.isMSPointer = window.MSPointerEvent ? true : false;

		this.isFollow = false;
		this.ui = null;
		this.canvas = null;
		this.ctx = null;
		this.content = null;
		this.buttons = [];
		this.current = 0;
		this.modeCallBack = function () { };
		this.fullSc;
		this.miniDebug;
		this.miniDebugS;
		this.title;
		this.subtitle;
		this.subtitleS;
		this.selectColor = '#DE5825';
		this.space = 10;//16;

		this.bottomRight;
		this.bottomLeft;
		this.extra01;
		this.extra02;
		this.unselectable = '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select: none;';
		this.inbox = 'box-sizing:border-box; -moz-box-sizing:border-box; -webkit-box-sizing:border-box;';
		this.joystickLeft;
		this.left = 0;

		this.styles = {

			content: this.unselectable + 'position:absolute; background:none; pointer-events:none; top:0;  height:100%;',

			separator: this.inbox + 'position:absolute; background:none; pointer-events:auto; display:block; border-left:1px solid #3f3f3f; border-right:1px solid #3f3f3f; top:0px; width:10px; height:100%; color: rgba(255, 255, 255, 0.2); cursor: e-resize;',

			buttonStyle: 'padding:0 0; width:70px; height:30px; font-size: 16px; font-weight: 900; letter-spacing: 1px; text-align: center; pointer-events:auto; cursor:pointer; display: inline-block; margin-left:' + this.space + 'px; border-radius:6px;line-height: 30px; text-shadow: 1px 1px #000000;',//

			menuButton: 'font-size: 13px; pointer-events:auto; cursor: pointer; text-align: left; display: inline-block; width:120px; padding:2px 3px; text-shadow: 1px 1px #000000;',
			menuRubric: 'vertical-align: top; pointer-events:none; font-size: 12px; height: 12px; padding: 2px 0px; margin : 2px 0px; width:calc(100% - 40px); display: block; text-align: left; border-bottom: 1px dashed #626262; color:#626262;',

			codeContent: 'position:absolute; background:none; pointer-events:none; display:block; left:0px; top:45px; width:100%; background:none; height:calc(100% - 45px);',
			menuCode: 'position:absolute; top:0px; left:0px; width:100%; height:40px; background:none; border-bottom:1px solid #3f3f3f; box-sizing:border-box;',
			buttonCode: 'pointer-events:auto; cursor:pointer; border-top-left-radius:6px; border-top-right-radius:6px; height: 35px; font-size: 14px; font-weight: 500; text-align: center; padding:10px 10px; margin-left:5px; margin-top:5px; border:1px solid #3f3f3f; border-bottom:none; display:inline-block; box-sizing:border-box;',
			saveButton: 'position:absolute; width:30px; height:30px; right:5px; top:5px; border-radius:6px; pointer-events:auto; cursor:pointer; ',

		};
		this.events = {
			touch: {
				start: 'touchstart',
				move: 'touchmove',
				end: 'touchend'
			},
			mouse: {
				start: 'mousedown',
				move: 'mousemove',
				end: 'mouseup'
			},
			pointer: {
				start: 'pointerdown',
				move: 'pointermove',
				end: 'pointerup'
			},
			MSPointer: {
				start: 'MSPointerDown',
				move: 'MSPointerMove',
				end: 'MSPointerUp'
			}
		};
		this.toBind = null;
		this.secondBind = {};
		if (this.isPointer) {
			this.toBind = this.events.pointer;
		} else if (this.isMSPointer) {
			this.toBind = this.events.MSPointer;
		} else if (this.isTouch) {
			this.toBind = this.events.touch;
			this.secondBind = this.events.mouse;
		} else {
			this.toBind = this.events.mouse;
		}

		this.isFullScreen = false;
		this.extraMode = '';
		this.debugTempGroups = [];
		this.progressC = null;
		this.progressbar = null;
		this.bar = null;
		this.message = null;
		///////////////////////
		///      UTILS      ///
		///////////////////////

		var u = this.u = {};
		u.distance = function (p1, p2) {
			var dx = p2.x - p1.x;
			var dy = p2.y - p1.y;

			return Math.sqrt((dx * dx) + (dy * dy));
		};

		u.angle = function (p1, p2) {
			var dx = p2.x - p1.x;
			var dy = p2.y - p1.y;

			return u.degrees(Math.atan2(dy, dx));
		};

		u.findCoord = function (p, d, a) {
			var b = { x: 0, y: 0 };
			a = u.radians(a);
			b.x = p.x - d * Math.cos(a);
			b.y = p.y - d * Math.sin(a);
			return b;
		};

		u.radians = function (a) {
			return a * (Math.PI / 180);
		};

		u.degrees = function (a) {
			return a * (180 / Math.PI);
		};

		u.bindEvt = function (el, type, handler) {
			if (el.addEventListener) {
				el.addEventListener(type, handler, false);
			} else if (el.attachEvent) {
				el.attachEvent(type, handler);
			}
		};

		u.unbindEvt = function (el, type, handler) {
			if (el.removeEventListener) {
				el.removeEventListener(type, handler);
			} else if (el.detachEvent) {
				el.detachEvent(type, handler);
			}
		};

		u.trigger = function (el, type, data) {
			var evt = new CustomEvent(type, data);
			el.dispatchEvent(evt);
		};

		u.prepareEvent = function (evt) {
			evt.preventDefault();
			return evt.type.match(/^touch/) ? evt.changedTouches : evt;
		};

		u.getScroll = function () {
			var x = (window.pageXOffset !== undefined) ?
				window.pageXOffset :
				(document.documentElement || document.body.parentNode || document.body)
					.scrollLeft;

			var y = (window.pageYOffset !== undefined) ?
				window.pageYOffset :
				(document.documentElement || document.body.parentNode || document.body)
					.scrollTop;
			return {
				x: x,
				y: y
			};
		};

		u.applyPosition = function (el, pos) {
			if (pos.x && pos.y) {
				el.style.left = pos.x + 'px';
				el.style.top = pos.y + 'px';
			} else if (pos.top || pos.right || pos.bottom || pos.left) {
				el.style.top = pos.top;
				el.style.right = pos.right;
				el.style.bottom = pos.bottom;
				el.style.left = pos.left;
			}
		};

		u.getTransitionStyle = function (property, values, time) {
			var obj = u.configStylePropertyObject(property);
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					if (typeof values === 'string') {
						obj[i] = values + ' ' + time;
					} else {
						var st = '';
						for (var j = 0, max = values.length; j < max; j += 1) {
							st += values[j] + ' ' + time + ', ';
						}
						obj[i] = st.slice(0, -2);
					}
				}
			}
			return obj;
		};

		u.getVendorStyle = function (property, value) {
			var obj = u.configStylePropertyObject(property);
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					obj[i] = value;
				}
			}
			return obj;
		};

		u.configStylePropertyObject = function (prop) {
			var obj = {};
			obj[prop] = '';
			var vendors = ['webkit', 'Moz', 'o'];
			vendors.forEach(function (vendor) {
				obj[vendor + prop.charAt(0).toUpperCase() + prop.slice(1)] = '';
			});
			return obj;
		};

		u.extend = function (objA, objB) {
			for (var i in objB) {
				if (objB.hasOwnProperty(i)) {
					objA[i] = objB[i];
				}
			}
			return objA;
		};

		// Overwrite only what's already present
		u.safeExtend = function (objA, objB) {
			var obj = {};
			for (var i in objA) {
				if (objA.hasOwnProperty(i) && objB.hasOwnProperty(i)) {
					obj[i] = objB[i];
				} else if (objA.hasOwnProperty(i)) {
					obj[i] = objA[i];
				}
			}
			return obj;
		};

		// Map for array or unique item.
		u.map = function (ar, fn) {
			if (ar.length) {
				for (var i = 0, max = ar.length; i < max; i += 1) {
					fn(ar[i]);
				}
			} else {
				fn(ar);
			}
		};
	}



	heroVisibility() {
		if (window.WEngine.currentFollow.userData.avatar.model.visible) { window.WEngine.currentFollow.userData.avatar.model.visible = false; }
		else { window.WEngine.currentFollow.userData.avatar.model.visible = true; }
	}
	heroFollowBehind(b) {
		this.isFollow = b;
		window.WEngine.view.setCameraFollowBehind(b);
	}
	helperVisibility() {
		if (window.WEngine.currentFollow.userData.avatar.helper == null) window.WEngine.currentFollow.userData.avatar.addHelper();
		else window.WEngine.currentFollow.userData.avatar.removeHelper();

	}
	enableDDLSDebug(b) {
		window.WEngine.enableDDLSDebug(b);
	}
	setHour(h) {
		window.WEngine.setHour(h);
	}
	switchLightHelper(v) {
		window.WEngine.switchLightHelper(v);
	}
	axisHelperVisibility(v) {
		window.WEngine.showAxisHelper(v);
	}
	enableClickMeasure(b) {
		window.WEngine.enableClickMeasure(b);
	}
	showShadow(v) {
		window.WEngine.view.showShadow(v);
	}
	enableTestBvhData(b) {
		window.WEngine.currentFollow.userData.avatar.enableTestBvhData(b);
	}
	mode(mode) {
		console.log('mode==' + mode);
	}

	update() {
		this.ui.update();
	}


	init() {

		this.ui = new Gui({ size: 250, color: 'no', height: 30 });


		this.content = document.createElement('div');
		this.content.style.cssText = 'position: absolute; bottom:10px; left:0px; pointer-events:none; width:100%; height:30px; display:none';
		document.body.appendChild(this.content);
		this.canvas = document.createElement('canvas');
		this.canvas.width = 100;
		this.canvas.height = 40;

		this.canvas.style.cssText = 'position: absolute; top:0; left:0; pointer-events:none; width:100px; height:30px; opacity:0.8; ';
		this.ctx = this.canvas.getContext("2d");

		this.bottomRight = document.createElement('div');
		this.bottomRight.style.cssText = this.unselectable + 'position:absolute; right:0; bottom:0;';
		document.body.appendChild(this.bottomRight);

		this.bottomLeft = document.createElement('div');
		this.bottomLeft.style.cssText = this.unselectable + 'position:absolute; left:0; bottom:0;';
		document.body.appendChild(this.bottomLeft);


		// mini debug

		this.miniDebugS = document.createElement('div');
		this.miniDebugS.style.cssText = this.unselectable + 'width:150px; font-size: 10px; position:absolute;  bottom:' + ((this.space) - 1) + 'px; color:#000000; text-align:left; left:' + ((this.space * 2) + 1) + 'px';
		this.bottomLeft.appendChild(this.miniDebugS);


		this.miniDebug = document.createElement('div');
		this.miniDebug.style.cssText = this.unselectable + 'width:150px; font-size: 10px; position:absolute; bottom:' + this.space + 'px; color:' + this.selectColor + '; text-align:left; left:' + ((this.space * 2) + 50) + 'px';
		this.bottomLeft.appendChild(this.miniDebug);

		// title

		this.title = document.createElement('div');
		this.title.style.cssText = this.unselectable + 'position:absolute; font-size: 14px;  bottom: ' + (this.space + 14) + 'px; color:#888988; text-shadow: 1px 1px #000000; text-align:right; right:' + (this.space + 40) + 'px';
		this.bottomRight.appendChild(this.title);

		// subtitle

		this.subtitleS = document.createElement('div');
		this.subtitleS.style.cssText = this.unselectable + 'width:150px; font-size: 10px; position:absolute;  bottom:' + ((this.space) - 1) + 'px; color:#000000; text-align:right; right:' + (this.space + 40 - 1) + 'px';
		this.bottomRight.appendChild(this.subtitleS);

		this.subtitle = document.createElement('div');
		this.subtitle.style.cssText = this.unselectable + 'width:150px; font-size: 10px; position:absolute; bottom:' + this.space + 'px; color:#787978; text-align:right; right:' + (this.space + 40) + 'px';
		this.bottomRight.appendChild(this.subtitle);

		// processbar
		this.progressC = document.createElement('div');
		this.progressC.className = 'progress';

		this.progressbar = document.createElement('div');
		this.message = document.createElement('span');
		this.progressbar.appendChild(this.message);

		this.bar_background = document.createElement('div');
		this.bar_background.className = "progressbar shadow";


		this.bar = document.createElement('div');
		this.bar.className = "bar shadow";
		this.bar_background.appendChild(this.bar);

		this.progressbar.appendChild(this.bar_background);
		this.progressC.appendChild(this.progressbar);
		document.body.appendChild(this.progressC);
		this.hideProcess();
		this.basicMenu();
	}
	showProcess(itemsLoaded, itemsTotal, msg) {
		var barW = 250;
		barW = Math.floor(barW * itemsLoaded / itemsTotal);
		this.bar.style.width = barW + "px";
		this.message.style.display = "block";
		this.progressbar.style.display = "block";
		this.message.innerHTML = msg;
	}
	hideProcess() {
		this.message.style.display = "none";
		this.progressbar.style.display = "none";
	}
	showDebugPanel(v) {
		this.ui.hide(!v);
		this.ui.update();
	}

	resize(w) {

	}

	addDebugTempGroup(name, debugParams) {
		var g = this.ui.add('group', { name: name, bg: 'rgba(120,100,80,0.8)' });
		for (var i = 0; i < debugParams.length; i++) {
			var dpO = debugParams[i];
			g.add('slide', { name: dpO.name, min: dpO.min, max: dpO.max, value: dpO.value, step: dpO.step, precision: 2, mode: 1 }).onChange(dpO.f);
		}
		this.debugTempGroups.push(g);
	}
	removeDebugTempGroups() {
		for (var i = 0; i < this.debugTempGroups.length; i++) {
			this.ui.remove(this.debugTempGroups[i]);
		}
		this.debugTempGroups = [];
	}
	icon(type, color, w, ww) {

		w = w || 40;
		var h = w;
		ww = ww || 40;
		color = color || '#DEDEDE';
		var viewBox = '0 0 ' + ww + ' ' + ww;
		var extra = '';

		if (type === '3TH') {
			viewBox = '0 0 100 50';
			w = 60;//60;
			h = 30;//30;
			extra = "<filter id='f1' x='0' y='0' width='200%' height='200%'><feOffset result='offOut' in='SourceAlpha' dx='1' dy='1' /><feGaussianBlur result='blurOut' in='offOut' stdDeviation='1' /><feBlend in='SourceGraphic' in2='blurOut' mode='normal' /></filter>"
		}

		var t = ["<svg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' style='pointer-events:none;' preserveAspectRatio='xMinYMax meet' x='0px' y='0px' width='" + w + "px' height='" + h + "px' viewBox='" + viewBox + "'>" + extra + "<g>"];
		switch (type) {
			case 'save':
				t[1] = "<path stroke='" + color + "' stroke-width='4' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 26.125 17 L 20 22.95 14.05 17 M 20 9.95 L 20 22.95'/>";
				t[1] += "<path stroke='" + color + "' stroke-width='2.5' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 32.6 23 L 32.6 25.5 Q 32.6 28.5 29.6 28.5 L 10.6 28.5 Q 7.6 28.5 7.6 25.5 L 7.6 23'/>";
				break;
			case 'scrIn':
				t[1] = "<path fill='rgba(0,0,0,0.5)' stroke='none' d='M 3 20 L 1 20 1 30 11 30 11 28 3 28 3 20 M 11 3 L 11 1 1 1 1 11 3 11 3 3 11 3 M 30 11 L 30 1 20 1 20 3 28 3 28 11 30 11 M 30 20 L 28 20 28 28 20 28 20 30 30 30 30 20 M 24 22 L 24 9 7 9 7 22 24 22 M 22 11 L 22 20 9 20 9 11 22 11 Z'/>";
				t[1] += "<path fill='" + color + "' stroke='none' d='M 23 21 L 23 8 6 8 6 21 23 21 M 21 10 L 21 19 8 19 8 10 21 10 M 2 19 L 0 19 0 29 10 29 10 27 2 27 2 19 M 10 2 L 10 0 0 0 0 10 2 10 2 2 10 2 M 29 19 L 27 19 27 27 19 27 19 29 29 29 29 19 M 27 10 L 29 10 29 0 19 0 19 2 27 2 27 10 Z'/>";
				break;
			case 'scrOut':
				t[1] = "<path fill='rgba(0,0,0,0.5)' stroke='none' d='M 30 1 L 1 1 1 30 30 30 30 1 M 3 3 L 28 3 28 28 3 28 3 3 M 9 17 L 7 17 7 22 12 22 12 20 9 20 9 17 M 12 11 L 12 9 7 9 7 14 9 14 9 11 12 11 M 22 14 L 24 14 24 9 19 9 19 11 22 11 22 14 M 24 17 L 22 17 22 20 19 20 19 22 24 22 24 17 Z'/>";
				t[1] += "<path fill='" + color + "' stroke='none' d='M 29 0 L 0 0 0 29 29 29 29 0 M 27 27 L 2 27 2 2 27 2 27 27 M 8 16 L 6 16 6 21 11 21 11 19 8 19 8 16 M 11 10 L 11 8 6 8 6 13 8 13 8 10 11 10 M 21 16 L 21 19 18 19 18 21 23 21 23 16 21 16 M 21 10 L 21 13 23 13 23 8 18 8 18 10 21 10 Z'/>";
				break;

			case 'shoot':
				t[1] = "<path fill='rgba(0,0,0,0.5)' stroke='none' d='M 12.1 11.1 Q 11.9 11.55 10.7 11.9 9.5 12.2 10.4 13.15 12.45 14.3 12 14.8 11.55 15 11.15 15.4 10.15 16.4 10.15 17.85 10.15 19.3 11.15 20.3 12.15 21.3 13.6 21.3 L 17.3 21.3 Q 21.1 21.1 21.45 16.25 21.85 14.05 19.7 14.65 17.35 15.5 16.5 14.35 16.6 14.3 16.65 14.2 17.5 13.4 17.5 12.25 17.5 11.05 16.65 10.25 15.85 9.45 14.7 9.45 13.5 9.45 12.7 10.25 12.35 10.6 12.15 11.1 L 12.1 11.1 M 3 18 L 3 24 7 28 13 28 13 26 8 26 5 23 5 18 3 18 M 13 5 L 13 3 7 3 3 7 3 13 5 13 5 8 8 5 13 5 M 28 18 L 26 18 26 23 23 26 18 26 18 28 24 28 28 24 28 18 M 23 5 L 26 8 26 13 28 13 28 7 24 3 18 3 18 5 23 5 M 14.5 25 L 14.5 30 16.5 30 16.5 25 14.5 25 M 1 14.5 L 1 16.5 6 16.5 6 14.5 1 14.5 M 16.5 6 L 16.5 1 14.5 1 14.5 6 16.5 6 M 30 14.5 L 25 14.5 25 16.5 30 16.5 30 14.5 Z'/>";
				t[1] += "<path fill='" + color + "' stroke='none' d='M 11.1 10.05 L 11.1 10.1 Q 10.9 10.57 9.7 10.85 8.5 11.2 9.4 12.15 11.48 13.3 10.95 13.75 10.53 14 10.15 14.4 9.15 15.4 9.15 16.85 9.15 18.3 10.15 19.3 11.15 20.3 12.6 20.3 L 16.3 20.3 Q 20.1 20.1 20.45 15.25 20.8625 13 18.7 13.65 16.36 14.5 15.5 13.35 15.57 13.27 15.65 13.2 16.5 12.4 16.5 11.25 16.5 10.05 15.65 9.25 14.85 8.45 13.7 8.45 12.5 8.45 11.7 9.25 11.33 9.61 11.1 10.05 M 2 17 L 2 23 6 27 12 27 12 25 7 25 4 22 4 17 2 17 M 12 4 L 12 2 6 2 2 6 2 12 4 12 4 7 7 4 12 4 M 27 17 L 25 17 25 22 22 25 17 25 17 27 23 27 27 23 27 17 M 22 4 L 25 7 25 12 27 12 27 6 23 2 17 2 17 4 22 4 M 5 15.5 L 5 13.5 0 13.5 0 15.5 5 15.5 M 15.5 24 L 13.5 24 13.5 29 15.5 29 15.5 24 M 15.5 5 L 15.5 0 13.5 0 13.5 5 15.5 5 M 24 13.5 L 24 15.5 29 15.5 29 13.5 24 13.5 Z'/>";
				break;

			case 'picker':
				t[1] = "<path fill='rgba(0,0,0,0.5)' stroke='none' d='M 7.15 14.25 L 5.75 12.85 2.95 15.65 4.35 17.05 7.15 14.25 M 5 9 L 1 9 1 11 5 11 5 9 M 4.35 2.95 L 2.95 4.35 5.75 7.15 7.15 5.75 4.35 2.95 M 14.25 7.15 L 17.05 4.35 15.65 2.95 12.85 5.75 14.25 7.15 M 11 5 L 11 1 9 1 9 5 11 5 M 22.9 19.9 L 28 17 10 10 17 28 19.9 22.9 26 29 29 26 22.9 19.9 M 19 20 L 17 24 13 13 24 17 20 19 27 26 26 27 19 20 Z'/>";
				t[1] += "<path fill='" + color + "' stroke='none' d='M 3.35 16.05 L 6.15 13.25 4.75 11.85 1.95 14.65 3.35 16.05 M 4 10 L 4 8 0 8 0 10 4 10 M 3.35 1.95 L 1.95 3.35 4.75 6.15 6.15 4.75 3.35 1.95 M 8 4 L 10 4 10 0 8 0 8 4 M 16.05 3.35 L 14.65 1.95 11.85 4.75 13.25 6.15 16.05 3.35 M 21.9 18.9 L 27 16 9 9 16 27 18.9 21.9 25 28 28 25 21.9 18.9 M 18 19 L 16 23 12 12 23 16 19 18 26 25 25 26 18 19 Z'/>";
				break;
		}
		t[2] = "</g></svg>";
		return t.join("\n");

	}

	roundRect(x, y, width, height, radius, fill, stroke) {
		if (typeof stroke == "undefined") { stroke = true; }
		if (typeof radius === "undefined") { radius = 5; }
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
		ctx.fill();
	}
	log(str) {

		this.miniDebug.textContent = str;
		this.miniDebugS.textContent = str;

	}

	tell(str) {

		this.subtitle.textContent = str;
		this.subtitleS.textContent = str;

	}
	basicMenu() {
		this.ui.clear();
		this.ui.add('title', { name: '调试面板【'+THREE.REVISION+'】', prefix: this.version, h: 20, r: 10 });
		this.ui.add('fps', { height: 30 });
		this.ui.add('button', { name: '隐藏', p: 70, h: 30, r: 10 }).onChange(function () { this.ui.hide(true); });
		this.ui.add('bool', { name: '显示坐标轴', p: 70, h: 20, value: false }).onChange(this.axisHelperVisibility);
		this.ui.add('bool', { name: '点击测量', p: 70, h: 20, value: false }).onChange(this.enableClickMeasure);
		this.ui.add('slide', { name: '24时间轴', min: 0, max: 24, value: 12, step: 0.01, precision: 2, mode: 1 }).onChange(this.setHour);
		this.ui.add('bool', { name: '光源调试', p: 70, h: 20, value: false }).onChange(this.switchLightHelper);
		this.ui.add('bool', { name: '显示影子', p: 70, h: 20, value: true }).onChange(this.showShadow);
		this.ui.add('bool', { name: '角色可见', p: 70, h: 20, value: true, inh: 16 }).onChange(this.heroVisibility);
		this.ui.add('bool', { name: '角色尾随', p: 70, h: 20, value: false, inh: 16 }).onChange(this.heroFollowBehind);
		this.ui.add('bool', { name: '寻路调试', p: 70, h: 20, value: false, bg: 'rgba(0,255,0,0.8)' }).onChange(this.enableDDLSDebug);
		this.ui.add('bool', { name: '骨骼调试', p: 70, h: 20, value: false, inh: 16 }).onChange(this.helperVisibility);
		this.initUI_Effect();
		this.initUI_Physics();
		this.initUI_BVH();
		this.initUI_HOLO(this.ui);
		this.initFullBtn();
		this.addExtraOption(this.mode);


	}
	initFullBtn() {
		this.fullSc = document.createElement('div');
		this.fullSc.style.cssText = 'position:absolute; width:30px; height:30px; right:10px; bottom:10px; pointer-events:auto; cursor:pointer; '
		this.fullSc.innerHTML = this.icon('scrIn', '#787978', 30, 30);
		this.bottomRight.appendChild(this.fullSc);
		var _gui = this;


		var toggleFullScreen = function () {
			if (!_gui.isFullScreen) {
				if ("fullscreenEnabled" in document || "webkitFullscreenEnabled" in document || "mozFullScreenEnabled" in document || "msFullscreenEnabled" in document) {
					if (document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled) {

						var element = document.body;
						if ("requestFullscreen" in element) element.requestFullscreen();
						else if ("webkitRequestFullscreen" in element) element.webkitRequestFullscreen();
						else if ("mozRequestFullScreen" in element) element.mozRequestFullScreen();
						else if ("msRequestFullscreen" in element) element.msRequestFullscreen();
					}
				}

			} else {
				if ("exitFullscreen" in document) document.exitFullscreen();
				else if ("webkitExitFullscreen" in document) document.webkitExitFullscreen();
				else if ("mozCancelFullScreen" in document) document.mozCancelFullScreen();
				else if ("msExitFullscreen" in document) document.msExitFullscreen();
			}
		};
		this.fullSc.addEventListener('click', toggleFullScreen, false);
		this.fullSc.addEventListener('mouseover', function () { this.innerHTML = _gui.icon(!_gui.isFullScreen ? 'scrIn' : 'scrOut', this.selectColor, 30, 30); }, false);
		this.fullSc.addEventListener('mouseout', function () { this.innerHTML = _gui.icon(!_gui.isFullScreen ? 'scrIn' : 'scrOut', '#787978', 30, 30); }, false);

		var screenChange = function () {

			_gui.isFullScreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement ? true : false;
			this.fullSc.innerHTML = _gui.icon(!_gui.isFullScreen ? 'scrIn' : 'scrOut', '#787978', 30, 30);

		};
		document.addEventListener("fullscreenchange", this.screenChange, false);
		document.addEventListener("webkitfullscreenchange", this.screenChange, false);
		document.addEventListener("mozfullscreenchange", this.screenChange, false);
		document.addEventListener("MSFullscreenChange", this.screenChange, false);
	}

	addExtraOption(callback) {
		var _gui = this;
		this.modeCallBack = callback;

		this.extra01 = document.createElement('div');
		this.extra01.style.cssText = 'position:absolute; width:30px; height:30px; right:10px; bottom:50px; pointer-events:auto; cursor:pointer; '
		this.extra01.innerHTML = _gui.icon('shoot', '#383938', 30, 30);
		this.bottomRight.appendChild(this.extra01);

		this.extra02 = document.createElement('div');
		this.extra02.style.cssText = 'position:absolute; width:30px; height:30px; right:10px; bottom:90px; pointer-events:auto; cursor:pointer; '
		this.extra02.innerHTML = _gui.icon('picker', '#383938', 30, 30);
		this.bottomRight.appendChild(this.extra02);

		this.extra01.addEventListener('click', function () { _gui.toggleExtraMode('shoot') }, false);
		this.extra01.addEventListener('mouseover', function () { this.innerHTML = _gui.icon('shoot', _gui.selectColor, 30, 30); }, false);
		this.extra01.addEventListener('mouseout', function () { this.innerHTML = _gui.icon('shoot', _gui.extraMode === 'shoot' ? '#787978' : '#383938', 30, 30); }, false);

		this.extra02.addEventListener('click', function () { _gui.toggleExtraMode('picker'); }, false);
		this.extra02.addEventListener('mouseover', function () { this.innerHTML = _gui.icon('picker', _gui.selectColor, 30, 30); }, false);
		this.extra02.addEventListener('mouseout', function () { this.innerHTML = _gui.icon('picker', _gui.extraMode === 'picker' ? '#787978' : '#383938', 30, 30); }, false);

	}
	toggleExtraMode(mode) {

		if (mode !== this.extraMode) this.extraMode = mode;
		else this.extraMode = '';
		this.extra01.innerHTML = this.icon('shoot', this.extraMode === 'shoot' ? '#787978' : '#383938', 30, 30);
		this.extra02.innerHTML = this.icon('picker', this.extraMode === 'picker' ? '#787978' : '#383938', 30, 30);

		this.modeCallBack(this.extraMode);

	}
	initPauseBtn() {

	}
	initUI_scenes() {
		var sceneMap = {};
		var sceneList = [];
		var changeScene = function (v) { window.WEngine.scene.load(sceneMap[v]) };
		var defCName;
		window.world.scenes.forEach(function (scene, id) {
			sceneList.push(scene.cname);
			sceneMap[scene.cname] = scene.ename;
			if (scene.ename == window.world.currentSceneName) defCName = scene.cname;
		})
		add('list', {
			target: document.body,
			pos: { left: '120px', top: 'auto', bottom: '10px' },
			name: '场景切换',
			list: sceneList,
			value: defCName,
			p: 40,
			height: 30,
			simple: true, side: 'up', type: 'html',
			callback: changeScene
		});
	}
	initUI_Effect() {
		var g = this.ui.add('group', { name: '特效', bg: 'rgba(120,80,80,0.8)' });
		g.add('bool', { name: '描边效果', p: 70, h: 20, inh: 16, value: false }).onChange(function (b) { window.WEngine.view.enableOutlineEffect(b); });
	}
	initUI_Physics() {
		var g = this.ui.add('group', { name: '物理引擎', bg: 'rgba(120,80,80,0.8)' });
		g.add('bool', { name: '人物胶囊', p: 70, h: 20, inh: 16, value: false }).onChange(function (v) { window.WEngine.showHeroCapsule(v); });
		g.add('bool', { name: '骨架', p: 70, h: 20, inh: 16, value: false }).onChange(function (v) { window.WEngine.showAmmoSkeleton(v); });
		g.add('bool', { name: '信息', p: 70, h: 20, inh: 16, value: false }).onChange(function (v) { window.WEngine.showPhysicInfo(v); });
	}

	initUI_BVH() {
		var g = this.ui.add('group', { name: 'BVH', bg: 'rgba(120,120,80,0.8)' });
		var c = g.add('bool', { name: '测试动作', p: 70, h: 20, value: false }).onChange(function (b) { enableTestBvhData(b); });
		g.add('button', { name: 'LOAD', p: 4, h: 30, r: 10, loader: true, drag: true }).onChange(function (result, fname) {
			if (!c.value) {
				c.value = true; c.update();
			}
			window.WEngine.currentFollow.userData.avatar.loadAndPlayBvhData(result, fname);
		});
		g.add('slide', { name: 'speed', min: 0, max: 1.5, value: 1, precision: 2, fontColor: '#D4B87B', stype: 1, bColor: '#999' }).onChange(function (v) { window.WEngine.currentFollow.userData.avatar.setBvhPlaySpeed(v) });
	}

	initUI_HOLO(ui) {
		var g = this.ui.add('group', { name: '全息显示', bg: 'rgba(120,100,80,0.8)' });
		var s4 = g.add('bool', { name: '开启四面', p: 70, h: 20, value: false }).onChange(function (b) { s3.value = false; s3.update(); window.WEngine.enableHoloEffect(b, 4); });
		var s3 = g.add('bool', { name: '开启三面', p: 70, h: 20, value: false }).onChange(function (b) { s4.value = false; s4.update(); window.WEngine.enableHoloEffect(b, 3); });
	}
	reset() {
		this.removeJoystick();
		this.clearBtns();
		this.removeDebugTempGroups();
	}

	addControl(c, user) {
		switch (c.type) {
			case 'joystick':
				this.addJoystick(c);
				break;
			case 'toggleButton':
				this.addToggleButton(c);
				break;
		}
	}

	addBtns(btnobjs) {
		var _gui = this;
		if (btnobjs != null && btnobjs.length > 0) {
			btnobjs.forEach(function (btnobj, index) {
				var b = document.createElement('div');
				b.style.cssText = 'color:#CCC; margin-left:5px; margin-right:5px; padding-top:10px; position:relative; pointer-events:auto; width:100px; height:20px; display:inline-block; text-align:center; font-size: 14px; cursor:pointer; letter-spacing: 1px;';
				var img = document.createElement('img');
				img.src = './assets/textures/' + btnobj.btnimg;
				img.title = btnobj.btnTitle;
				img.id = btnobj.btnid;
				img.onclick = btnobj.event;
				b.appendChild(img);
				_gui.content.appendChild(b);
			});
			var btns = [];
			var i = btns.length;
			var temfun = function (curBtn) {
				var btn = document.getElementById('btn' + curBtn);
				u.bindEvt(btn, toBind.start, function () {
					window.WEngine.user.keyboard.setKeyFromBtns({ key: curBtn, type: 'down' });
				});
				u.bindEvt(btn, toBind.end, function () {
					window.WEngine.user.keyboard.setKeyFromBtns({ key: curBtn, type: 'up' });
				});
			}
			while (i--) {
				temfun(btns[i]);
			}
		}
	}

	clearBtns() {
		while (this.content.firstChild != null) {
			this.content.removeChild(this.content.firstChild);
		}
		this.content.style.display = 'none';
	}

	showBtns() {
		this.content.style.display = 'block';
	}
	addToggleButton(c) {
		var b;
		var myCallBack = function () {
			c.callback(b.selected);
			b.selected = !b.selected;
			b.label(b.selected ? c.labels.sel : c.labels.def);
		};
		b = add('button', { target: document.body, callback: myCallBack, name: c.labels.def, w: c.w, h: c.h, pos: c.pos, simple: true });
		b.selected = false;

	}
	//-------------------------------------
	//
	//   JOYSTICK
	//
	//-------------------------------------
	joyMove(t) {
		if (this.isFollow) {
			window.WEngine.user.key[0] = t[0];
			window.WEngine.user.key[1] = t[1];
		} else {
			window.WEngine.user.key[1] = -Math.sqrt(t[0] * t[0] + t[1] * t[1]);
			if (Math.abs(t[0]) > 0.5 || Math.abs(t[1]) > 0.5) {
				window.WEngine.user.key[7] = 1;
			} else {
				window.WEngine.user.key[7] = 0;
			}
			if (t[0] != 0 && t[1] != 0 && window.WEngine.currentFollow) {
				window.WEngine.options({
					name: window.WEngine.currentFollow.name,
					type: 'character',
					angle: Math.atan2(t[0], t[1]) - window.WEngine.compassAngle - Math.Pi / 2
				});
			}
		}
	}
	addJoystick(c) {
		this.isFollow = c.isFollow;
		this.joystickLeft = add('joystick', { type: 'joystick', target: document.body, pos: { left: (this.left + 70) + 'px', top: 'auto', bottom: '10px' }, name: c.name || 'MOVE', w: 150, multiplicator: 1, precision: 2, fontColor: '#308AFF', mode: 1 }).onChange(this.joyMove).listen();
		if (!c.debug) {
			this.joystickLeft.c[2].style.display = 'none';//隐藏XY坐标
		}
	}

	removeJoystick = function () {
		if (this.joystickLeft != null) {
			this.joystickLeft.clear()
			this.joystickLeft = null;
		}
	}

};
export { WGui };