

/*
 * 事件处理类
 *
 * 基本的键盘输入控制系统
 */
import { EventDispatcher } from '../../jsm/libs/three.module.js';
class WUser extends EventDispatcher {
	// key map
	// 0 : axe L | left:right  -1>1
	// 1 : axe L | top:down    -1>1
	// 2 : axe R | left:right  -1>1
	// 3 : axe R | top:down    -1>1
	// 4 : bouton A             0-1  jump / space
	// 5 : bouton B             0-1  roulade / shift ctrl
	// 6 : bouton X             0-1  arme principale
	// 7 : bouton Y             0-1  arme secondaire
	// 8 : gachette L up        0-1  
	// 9 : gachette R up        0-1
	// 10 : gachette L down     0>1
	// 11 : gachette R down     0>1
	// 12 : bouton setup        0-1
	// 13 : bouton menu         0-1
	// 14 : axe button left     0-1
	// 15 : axe button right    0-1
	// 16 : Xcross axe top      0-1
	// 17 : Xcross axe down     0-1
	// 18 : Xcross axe left     0-1
	// 19 : Xcross axe right    0-1

	// 20 : Keyboard or Gamepad    0-1
	//var key = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];//new Float32Array( 20 );

	constructor() {
		super();
		var _user = this;
		// 属性
		this.key = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.keyboard = {
			// 玩家控制键
			keyCodes: {
				16: "shift",
				17: "ctrl",
				32: "space",
				65: "a",
				68: "d",
				83: "s",
				87: "w",
				67: 'c',
				70: 'f',
				72: 'h',
				90: "z",
				88: "x",
				81: "q",
				82: "r"
			},
			// 这个对象保存按键的实时状态
			pressed: {
				// 按键状态
			},

			// 方法
			onKeyDown: function (event) {
				var key = _user.key;
				// 设置按键状态为TRUE
				_user.keyboard.pressed[_user.keyboard.keyCodes[event.keyCode]] = true;
				if (_user.keyboard.pressed["ctrl"] && _user.keyboard.pressed["shift"] && _user.keyboard.pressed["d"]) {
					window.WEngine.showDebugPanel(true);
					event.preventDefault();
					return;
				}
				switch (event.keyCode) {
					// axe L
					case 65: key[0] = -1; break;//key[0]<=-1 ? -1:key[0]-= 0.1; break; // left, A, Q
					case 68: key[0] = key[0] = 1; break; // right, D
					case 87: key[1] = key[1] = -1; break; // up, W
					case 83: key[1] = key[1] = 1; break; // down, S
					// axe R
					case 37: key[2] = -1; break; // left
					case 39: key[2] = 1; break; // right
					case 38: key[3] = -1; break; // up
					case 40: key[3] = 1; break; // down
					case 81: key[4] = -1; break; //Q
					case 69: key[4] = 1; break; //E
					case 67: key[5] = 1; break; //C           
					case 32: key[6] = 1; break; // space
					case 16: key[7] = 1; break; // shift

					case 71: window.WEngine.sh_grid(); break; // G
					case 72: key[9] = 1; break;//H
				}
				// 触法一般的 onKeyDown 事件
				_user.dispatchEvent({ type: 'onKeyDown', keyCode: event.keyCode });
				event.preventDefault();
			},
			onKeyUp: function (event) {
				var key = _user.key;
				// 设置按键状态为FALSE
				_user.keyboard.pressed[_user.keyboard.keyCodes[event.keyCode]] = false;
				switch (event.keyCode) {
					// axe L
					case 65: key[0] = key[0] < 0 ? 0 : key[0]; break; // left, A, Q
					case 68: key[0] = key[0] > 0 ? 0 : key[0]; break; // right, D
					case 87: case 90: key[1] = key[1] < 0 ? 0 : key[1]; break; // up, W, Z
					case 83: key[1] = key[1] > 0 ? 0 : key[1]; break; // down, S
					// axe R
					case 37: key[2] = key[2] < 0 ? 0 : key[2]; break; // left
					case 39: key[2] = key[2] > 0 ? 0 : key[2]; break; // right
					case 38: key[3] = key[3] < 0 ? 0 : key[3]; break; // up
					case 40: key[3] = key[3] > 0 ? 0 : key[3]; break; // down
					case 81: key[4] = key[4] < 0 ? 0 : key[4]; break; //Q
					case 69: key[4] = key[4] > 0 ? 0 : key[4]; break; //E




					case 17: case 67: key[5] = 0; break; // ctrl, C
					case 32: key[6] = 0; break; // space
					case 16: key[7] = 0; break; // shift
					case 72: key[9] = 0; break;//H
				}
			},
			getKey: function () {
				//console.log('key=='+key);
				return _user.key;
			},
			setKeyFromBtns: function (evt) {
				var kc = -1;
				var cc = evt.key + ':' + evt.type;
				if (cc == 'A:down') {
					key[6] = 1;
				} else if (cc == 'B:down') {
					kc = 82;
				} else if (cc == 'C:down') {
					kc = 70;
				} else if (cc == 'D:down') {
					key[9] = 1;
				} else if (cc == 'A:up') {
					key[6] = 0;
				} else if (cc == 'B:up') {
					kc = 82;
				} else if (cc == 'C:up') {
					kc = 70;
				} else if (cc == 'D:up') {
					key[9] = 0;
				} else if (cc == 'Play:down') {

				} else if (cc == 'Play:up') {
					if (window.WEngine.run) {
						window.WEngine.play(false);
					} else {
						window.WEngine.play(true);
					}
				}
				if (evt.type == 'down') {
					_user.dispatchEvent({ type: 'onKeyDown', keyCode: kc });
				} else {
					_user.dispatchEvent({ type: 'onKeyUp', keyCode: kc });
				}

			}
		};
		this.mouse = {
			mouseDown: false,
			mouseWheelDown: false,
			onPointerDownPointerX: 0,
			onPointerDownPointerY: 0,
			onMouseDown: function (event) {
				_user.mouse.onPointerDownPointerX = event.clientX;
				_user.mouse.onPointerDownPointerY = event.clientY;
				_user.mouse.mouseDown = true;
				if (event.button == 1) {
					_user.mouse.mouseWheelDown = true;
				}
			},
			onMouseUp: function (event) {
				_user.mouse.mouseDown = false;
				if (event.button == 1) {
					_user.mouse.mouseWheelDown = false;
				}
			},
			onMouseMove: function (event) {
				if (_user.mouse.mouseWheelDown) {
					var offsetX = _user.mouse.onPointerDownPointerX - event.clientX;
					var offsetY = event.clientY - _user.mouse.onPointerDownPointerY;
					_user.dispatchEvent({ type: 'updateCameraOffsetV', offset: (offsetX + offsetY) / 2 * 0.1 });
					event.preventDefault();
				}
			},
			onMousewheel: function (event) {
				var wheelDelta = event.wheelDelta || event.wheelDeltaY;
				var dir = wheelDelta > 0 ? 'Up' : 'Down', vel = Math.abs(wheelDelta);
				_user.dispatchEvent({ type: 'mousewheel', dir: dir, vel: vel });
				event.preventDefault();
			}
		};
	}
	// 方法
	init() {
		//添加监听
		document.addEventListener("keydown", this.keyboard.onKeyDown, false);
		document.addEventListener("keyup", this.keyboard.onKeyUp, false);
		document.addEventListener("mousewheel", this.mouse.onMousewheel, false);
		document.addEventListener("mousedown", this.mouse.onMouseDown, false);
		document.addEventListener("mouseup", this.mouse.onMouseUp, false);
		document.addEventListener("mousemove", this.mouse.onMouseMove, false);
	}
	onKeyDown() {
		// 默认没有
	}


};
export { WUser };