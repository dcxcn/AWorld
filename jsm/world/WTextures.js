import {	
	TextureLoader,
	RepeatWrapping,
	ClampToEdgeWrapping,
	MirroredRepeatWrapping,
	sRGBEncoding
} from "../libs/three.module.js";
import { DDSLoader } from '../../jsm/three/loaders/DDSLoader.js';
var WTextures = ( function () {

var data = new Map();
var pathTexture = './assets/textures/';
var textureLoader = new TextureLoader();
var ddsLoader = new DDSLoader();
var id = 0;

var textures = {

	get: function ( name ){ 

        return data.has( name ) ? data.get( name ) : null;

    },

	reset: function (){

		data.forEach( function ( value, key ) { if( value.isTmp ){ value.dispose(); data.delete( key );} } );

    },

    clear: function (){

    	id = 0;
    	data.forEach( function ( value, key ) { value.dispose(); } );
        data.clear(); 

    },

    add: function ( name, txt, isTmp ) {

    	txt.isTmp = isTmp !== undefined ? isTmp : true;
    	data.set( name, txt );

    },

	make: function ( o ){
		var loader;
		if(o.url.indexOf("dds")!=-1){
			 loader = ddsLoader;
		}else{
			 loader = textureLoader;
		}
		var name, tx = null;

		if( o.url !== undefined ) name = o.url.substring( o.url.lastIndexOf('/')+1, o.url.lastIndexOf('.') );
		else if( o.name !== undefined ) name = o.name;
		else name = 'txt' + id++;

		// avoid duplication
        if( data.has( name ) ){
			if(o.onLoad){
				o.onLoad(data.get( name ));
			}
			return data.get( name );
		}

        if( o.url !== undefined ) {
        	if(o.onLoad){
				tx = loader.load( pathTexture + o.url,o.onLoad);
			}else{
				tx = loader.load( pathTexture + o.url);
			}
        	
        	tx.flipY = o.flip !== undefined ? o.flip : true;

			if( o.repeat !== undefined ){ 
				tx.repeat.fromArray( o.repeat );
				if(o.repeat[0]>1) tx.wrapS = RepeatWrapping;
				if(o.repeat[1]>1) tx.wrapT = RepeatWrapping;
			}
			if(o.wrap == 1){			
				tx.wrapS = tx.wrapT = RepeatWrapping;
			}else if(o.wrap == 2){
				tx.wrapS = tx.wrapT = ClampToEdgeWrapping;
			}else if(o == 3){
				tx.wrapS = tx.wrapT = MirroredRepeatWrapping;
			}
			if( o.anisotropy !== undefined ) tx.anisotropy = o.anisotropy;

			// clear on reset
            tx.isTmp = o.isTmp !== undefined ? o.isTmp : true;
            tx.encoding = sRGBEncoding;

			tx.name = name;

			// add to data
			this.add( name, tx );

			return tx;

        }

	}

}

return textures;

})();

export { WTextures };