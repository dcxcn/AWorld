/*global THREE*/
import { root, map } from './root.js';
import { Capsule } from './Geometry.js';
/**   _   _____ _   _
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_|
*    @author lo.th / https://github.com/lo-th
*
*    SHOT - CHARACTER
*/

function Character() {

	this.ID = 0;
	this.heroes = [];

}

Object.assign( Character.prototype, {

	step: function ( AR, N ) {

		var n;

		this.heroes.forEach( function ( b, id ) {

			n = N + ( id * 8 );
	        //var s = AR[ n ] * 3.33;
			var onGround = AR[ n ] ;
			//console.log('onGround==='+onGround);
	        //b.userData.speed = s * 100;
			//b.userData.speed = s ;
	        b.position.fromArray( AR, n + 1 );
	        b.quaternion.fromArray( AR, n + 4 );

			//root.flow.key
			var key = root.flow.key[id];
			//console.log('phy character key=='+key);		

			if(onGround==1){
				b.userData.avatar.isJumping = false;	
			}
			if(key && !b.userData.findPath){
				if( key[6] == 1 && b.userData.avatar.canJump && onGround==1){				
					b.userData.avatar.playAction("prejump");				
				}else if(key[6] == 0 && (b.userData.avatar.curActionName=='prejump')){
					b.userData.avatar.playAction("jump");
					b.userData.avatar.canJump = false;	
					b.userData.avatar.isJumping = true;				
				}else if( onGround==0){
					b.userData.avatar.playAction("jump");
				}else if(key[1]<0)  {//key[1]==-1
					if(key[7]==1) {
						b.userData.avatar.playAction("run");
					}else if(key[5]== 1)  {
						b.userData.avatar.playAction("walk_cf"); 
					}else{
						b.userData.avatar.playAction("walk_f");
					}

				}else if(key[1]>0)  {//key[1]== 1
					if(key[5]== 1)  {
						b.userData.avatar.playAction("walk_cb"); 
					}else{
						b.userData.avatar.playAction("walk_b");
					}		   
				}else if(key[5]== 1)  {
					b.userData.avatar.playAction("crouch"); 
				}else if(key[9]== 1)  {
					b.userData.avatar.addHandGun();
					b.userData.avatar.playAction("aim_r_handgun"); 
				}else{
					if(b.userData.avatar.life>0){
						b.userData.avatar.playAction("idle");
						b.userData.avatar.canJump = true;							
						
					}else{
						b.userData.avatar.playAction("dead");
					}		
				}
			}

		} );

	},
	step1: function ( AR, N ) {

		var n;

		this.heroes.forEach( function ( b, id ) {

			n = N + ( id * 8 );
	        var s = AR[ n ] * 3.33;
	        //b.userData.speed = s * 100;
			b.userData.speed = s ;
	        b.position.fromArray( AR, n + 1 );
	        b.quaternion.fromArray( AR, n + 4 );

	        if ( b.skin ) {

	            if ( s === 0 ) b.skin.play( 0, 0.3 );
	            else {

	                b.skin.play( 1, 0.3 );
	                b.skin.setTimeScale( s );

	            }

	            //console.log(s)

	        }

		} );

	},
	clear: function () {

		while ( this.heroes.length > 0 ) this.destroy( this.heroes.pop() );
		this.ID = 0;

	},

	destroy: function ( b ) {

		if ( b.parent ) b.parent.remove( b );
		map.delete( b.name );

	},

	remove: function ( name ) {

		if ( ! map.has( name ) ) return;
		var b = map.get( name );

		var n = this.heroes.indexOf( b );
		if ( n !== - 1 ) {

			this.heroes.splice( n, 1 );
			this.destroy( b );

		}

	},
	add: function ( o ){
		var name = o.ename !== undefined ? o.ename : o.type + this.ID ++;
		 o.name = name;
		// delete old if same name
		this.remove( name );

		o.scale  = o.scale || 1;

		o.size = o.size !== undefined ? o.size : [ 0.25, 2 ];
		var g = new Capsule( o.size[ 0 ], o.size[ 1 ], 6 );

	    var mesh = new THREE.Group();//o.mesh || new THREE.Mesh( g );
		mesh.ename = name;	
	    if ( o.debug ) {

	        var mm = new THREE.Mesh( g, root.mat.debug );
	        root.extraGeo.push( g );
			mm.visible = false;
	        mesh.add( mm );
			mesh.userData.capsule = mm;

	    }
		if(o.avatar){
			mesh.add( o.avatar.model );
			mesh.userData.avatar = o.avatar;
			delete (o.avatar);
		}
		mesh.userData.speed = 0;
	    mesh.userData.type = 'hero';
	    //mesh.userData.id = this.heros.length;

	     // copy rotation quaternion
	    mesh.position.fromArray( o.pos );
	    mesh.quaternion.fromArray( o.quat );



	    mesh.castShadow = true;
	    mesh.receiveShadow = true;
	    mesh.name = name;

	    if ( o.material ) delete ( o.material );
	    if ( o.mesh ) delete ( o.mesh );
	    if ( o.scale ) delete ( o.scale );
	    


	    root.addViewObject( mesh );
		this.heroes.push( mesh );

		map.set( name, mesh );
		root.post( 'add', o );

		return mesh;
	},
	add1: function ( o ) {


		var name = o.ename !== undefined ? o.ename : o.type + this.ID ++;
		 o.name = name;
		// delete old if same name
		this.remove( name );

		o.scale  = o.scale || 1;

		o.size = o.size !== undefined ? o.size : [ 0.25, 2 ];

		
	    /*if ( o.size.length == 1 ) {

			o.size[ 1 ] = o.size[ 0 ];

		}
	    if ( o.size.length == 2 ) {

			o.size[ 2 ] = o.size[ 0 ];

		}*/

		if ( o.mesh ) {

			var gm = o.mesh.geometry;
	    	var h = (Math.abs(gm.boundingBox.max.y)+Math.abs(gm.boundingBox.min.y))*o.scale;
	    	var py = -(Math.abs(gm.boundingBox.max.y)-Math.abs(gm.boundingBox.min.y))*o.scale*0.5; // ?
	        o.size[ 1 ] = h;

	    }

	    // The total height is height+2*radius, so the height is just the height between the center of each 'sphere' of the capsule caps
	    o.size[ 1 ] = o.size[ 1 ] - ( o.size[ 0 ]*2 );

	    o.pos = o.pos === undefined ? [ 0, 0, 0 ] : o.pos;
	    o.rot = o.rot == undefined ? [ 0, 0, 0 ] : Math.vectorad( o.rot );
	    o.quat = new THREE.Quaternion().setFromEuler( new THREE.Euler().fromArray( o.rot ) ).toArray();

	    var material;
	    if ( o.material !== undefined ) {

	    	if ( o.material.constructor === String ) material = root.mat[ o.material ];
	    	else material = o.material;

		} else {

	    	material = root.mat.hero;

		}
		
	    var g = new Capsule( o.size[ 0 ], o.size[ 1 ], 6 );

	    var mesh = new THREE.Group();//o.mesh || new THREE.Mesh( g );

	    if ( o.debug ) {

	        var mm = new THREE.Mesh( g, root.mat.debug );
	        root.extraGeo.push( g );
	        mesh.add( mm );

	    }


	    if ( o.mesh ) {

	        var model = o.mesh;
	        model.material = material;
	        model.scale.multiplyScalar( o.scale );
	        model.position.set( 0, py, 0 );

	        model.setTimeScale( 0.5 );
	        model.play( 0 );

	        mesh.add( model );
	        mesh.skin = model;

	        



	        //this.extraGeo.push( mesh.skin.geometry );

	    } else {

	        var mx = new THREE.Mesh( g, material );
	        root.extraGeo.push( g );
	        mesh.add( mx );

	    }





	    mesh.userData.speed = 0;
	    mesh.userData.type = 'hero';
	    //mesh.userData.id = this.heros.length;

	     // copy rotation quaternion
	    mesh.position.fromArray( o.pos );
	    mesh.quaternion.fromArray( o.quat );



	    mesh.castShadow = true;
	    mesh.receiveShadow = true;
	    mesh.name = name;

	    if ( o.material ) delete ( o.material );
	    if ( o.mesh ) delete ( o.mesh );
	    if ( o.scale ) delete ( o.scale );
	    


	    root.container.add( mesh );
		this.heroes.push( mesh );

		map.set( name, mesh );

		root.post( 'add', o );

		return mesh;

	},

	/////



} );


export { Character };
