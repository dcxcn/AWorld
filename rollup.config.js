import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
var isProd = true;
var isES5 = true;
export default [{
    input: 'jsm/ammo/worker/engine.js',
    output: {
        file: 'js/libs/ammowker.js',
		name: 'ammowker',
        format: 'umd'
    },
	plugins: [
		isES5 && babel(),
		isProd && uglify({
		  compress: {
			pure_getters: true,
			unsafe      : true,
			unsafe_comps: true
		  }
		})
	]
},{
    input: 'jsm/world/WEngine.js',
    output: {
        file: 'js/aworld.js',
		name: 'aworld',
        format: 'umd'
    },
	plugins: [
		isES5 && babel(),
		isProd && uglify({
		  compress: {
			pure_getters: true,
			unsafe      : false,
			unsafe_comps: false
		  }
		})
	]
}];