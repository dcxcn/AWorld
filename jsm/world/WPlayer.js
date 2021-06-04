import { WEngine } from '../../jsm/world/WEngine.js';

window.AWEngine = new WEngine();
var startButton = document.getElementById('startButton');
startButton.addEventListener('click', function () {
	window.AWEngine.init({ rendererClearColor: window.AWEngine.colors.white });
});