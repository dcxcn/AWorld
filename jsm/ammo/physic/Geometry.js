/*global THREE*/
import { ConvexHull } from './ConvexHull.js';
import { BufferGeometryUtils } from '../../three/utils/BufferGeometryUtils.js';
import {
    BufferAttribute,
	BufferGeometry,
	Matrix4,
	SphereGeometry,
	CylinderGeometry,
	Float32BufferAttribute
} from "../../libs/three.module.js";
import {
	Geometry,
    DirectGeometry
} from "../../three/deprecated/Geometry.js";
export function geometryInfo( g, type ) {

        var verticesOnly = false;
        var facesOnly = false;

        if(type == 'mesh') facesOnly = true;
        if(type == 'convex') verticesOnly = true;

        var i, j, n, p, n2;

        var tmpGeo ;
		var totalVertices;
		var numVertices;
		var numFaces
		if(g instanceof BufferGeometry){
			tmpGeo = new Geometry().fromBufferGeometry( g );
			tmpGeo.mergeVertices();
			totalVertices = g.attributes.position.array.length/3;
			numVertices = tmpGeo.vertices.length;
			numFaces = tmpGeo.faces.length;
		}else{
			tmpGeo = g.clone();
			numVertices = tmpGeo.vertices.length;
			totalVertices = numVertices;
			numFaces = tmpGeo.faces.length;
		}


        g.realVertices = new Float32Array( numVertices * 3 );
        g.realIndices = new ( numFaces * 3 > 65535 ? Uint32Array : Uint16Array )( numFaces * 3 );

        i = numVertices;
        while(i--){
            p = tmpGeo.vertices[ i ];
            n = i * 3;
            g.realVertices[ n ] = p.x;
            g.realVertices[ n + 1 ] = p.y;
            g.realVertices[ n + 2 ] = p.z;
        }

        if(verticesOnly){ 
            tmpGeo.dispose();
            return g.realVertices;
        }

        i = numFaces;
        while(i--){
            p = tmpGeo.faces[ i ];
            n = i * 3;
            g.realIndices[ n ] = p.a;
            g.realIndices[ n + 1 ] = p.b;
            g.realIndices[ n + 2 ] = p.c;
        }

        tmpGeo.dispose();

        //g.realIndices = g.getIndex();
        //g.setIndex(g.realIndices);

        if(facesOnly){ 
            var faces = [];
            i = g.realIndices.length;
            while(i--){
                n = i * 3;
                p = g.realIndices[i]*3;
                faces[n] = g.realVertices[ p ];
                faces[n+1] = g.realVertices[ p+1 ];
                faces[n+2] = g.realVertices[ p+2 ];
            }
            return faces;
        }

        // find same point
        var ar = [];
        var pos = g.attributes.position.array;
        i = numVertices;
        while(i--){
            n = i*3;
            ar[i] = [];
            j = totalVertices;
            while(j--){
                n2 = j*3;
                if( pos[n2] == g.realVertices[n] && pos[n2+1] == g.realVertices[n+1] && pos[n2+2] == g.realVertices[n+2] ) ar[i].push(j);
            }
        }

        // generate same point index
        var pPoint = new ( numVertices > 65535 ? Uint32Array : Uint16Array )( numVertices );
        var lPoint = new ( totalVertices > 65535 ? Uint32Array : Uint16Array )( totalVertices );

        p = 0;
        for(i=0; i<numVertices; i++){
            n = ar[i].length;
            pPoint[i] = p;
            j = n;
            while(j--){ lPoint[p+j] = ar[i][j]; }
            p += n;
        }

        g.numFaces = numFaces;
        g.numVertices = numVertices;
        g.maxi = totalVertices;
        g.pPoint = pPoint;
        g.lPoint = lPoint;

}



export function processGeometry( bufGeometry ) {

	// Ony consider the position values when merging the vertices
	var posOnlyBufGeometry = new THREE.BufferGeometry();
	posOnlyBufGeometry.setAttribute( 'position', bufGeometry.getAttribute( 'position' ) );
	posOnlyBufGeometry.setIndex( bufGeometry.getIndex() );

	// Merge the vertices so the triangle soup is converted to indexed triangles
	var indexedBufferGeom = BufferGeometryUtils.mergeVertices( posOnlyBufGeometry );

	// Create index arrays mapping the indexed vertices to bufGeometry vertices
	mapIndices( bufGeometry, indexedBufferGeom );

}
function isEqual( x1, y1, z1, x2, y2, z2 ) {

	var delta = 0.000001;
	return Math.abs( x2 - x1 ) < delta &&
			Math.abs( y2 - y1 ) < delta &&
			Math.abs( z2 - z1 ) < delta;

}

function mapIndices( bufGeometry, indexedBufferGeom ) {

	// Creates ammoVertices, ammoIndices and ammoIndexAssociation in bufGeometry

	var vertices = bufGeometry.attributes.position.array;
	var idxVertices = indexedBufferGeom.attributes.position.array;
	var indices = indexedBufferGeom.index.array;

	var numIdxVertices = idxVertices.length / 3;
	var numVertices = vertices.length / 3;

	bufGeometry.ammoVertices = idxVertices;
	bufGeometry.ammoIndices = indices;
	bufGeometry.ammoIndexAssociation = [];

	for ( var i = 0; i < numIdxVertices; i ++ ) {

		var association = [];
		bufGeometry.ammoIndexAssociation.push( association );

		var i3 = i * 3;

		for ( var j = 0; j < numVertices; j ++ ) {

			var j3 = j * 3;
			if ( isEqual( idxVertices[ i3 ], idxVertices[ i3 + 1 ], idxVertices[ i3 + 2 ],
				vertices[ j3 ], vertices[ j3 + 1 ], vertices[ j3 + 2 ] ) ) {

				association.push( j3 );

			}

		}

	}

}

/**
* CAPSULE GEOMETRY
*/

class Capsule extends BufferGeometry{
		

    constructor( radius, height, radialSegs, heightSegs) {
        super();
        this.type = 'Capsule';

        radius = radius || 1;
        height = height || 1;

        var pi = Math.PI;

        radialSegs = Math.floor( radialSegs ) || 12;
        var sHeight = Math.floor( radialSegs * 0.5 );

        heightSegs = Math.floor( heightSegs ) || 1;
        var o0 = Math.PI * 2;
        var o1 = Math.PI * 0.5;
        var g = new Geometry();
        var m0 = new Geometry().fromBufferGeometry(new CylinderGeometry( radius, radius, height, radialSegs, heightSegs, true ));

        var mr = new Matrix4();
        var m1 = new Geometry().fromBufferGeometry(new SphereGeometry( radius, radialSegs, sHeight, 0, o0, 0, o1));
        var m2 = new Geometry().fromBufferGeometry(new SphereGeometry( radius, radialSegs, sHeight, 0, o0, o1, o1));
        var mtx0 = new Matrix4().makeTranslation( 0,0,0 );
        if(radialSegs===6) mtx0.makeRotationY( 30 * THREE.Math.DEG2RAD );
        //if(radialSegs===6) mtx0.makeRotationY( 30 * THREE.Math.DEG2RAD );
        var mtx1 = new Matrix4().makeTranslation(0, height*0.5,0);
        var mtx2 = new Matrix4().makeTranslation(0, -height*0.5,0);
        mr.makeRotationZ( pi );
        g.merge( m0, mtx0.multiply(mr) );
        g.merge( m1, mtx1);
        g.merge( m2, mtx2);

        g.mergeVertices();
        g.computeVertexNormals();

        m0.dispose();
        m1.dispose();
        m2.dispose();
        

        const geometry = new DirectGeometry().fromGeometry( g );


		const positions = new Float32Array( geometry.vertices.length * 3 );
		this.setAttribute( 'position', new BufferAttribute( positions, 3 ).copyVector3sArray( geometry.vertices ) );

		if ( geometry.normals.length > 0 ) {

			const normals = new Float32Array( geometry.normals.length * 3 );
			this.setAttribute( 'normal', new BufferAttribute( normals, 3 ).copyVector3sArray( geometry.normals ) );

		}

		if ( geometry.colors.length > 0 ) {

			const colors = new Float32Array( geometry.colors.length * 3 );
			this.setAttribute( 'color', new BufferAttribute( colors, 3 ).copyColorsArray( geometry.colors ) );

		}

		if ( geometry.uvs.length > 0 ) {

			const uvs = new Float32Array( geometry.uvs.length * 2 );
			this.setAttribute( 'uv', new BufferAttribute( uvs, 2 ).copyVector2sArray( geometry.uvs ) );

		}

		if ( geometry.uvs2.length > 0 ) {

			const uvs2 = new Float32Array( geometry.uvs2.length * 2 );
			this.setAttribute( 'uv2', new BufferAttribute( uvs2, 2 ).copyVector2sArray( geometry.uvs2 ) );

		}

		// groups

		this.groups = geometry.groups;

		// morphs

		for ( const name in geometry.morphTargets ) {

			const array = [];
			const morphTargets = geometry.morphTargets[ name ];

			for ( let i = 0, l = morphTargets.length; i < l; i ++ ) {

				const morphTarget = morphTargets[ i ];

				const attribute = new Float32BufferAttribute( morphTarget.data.length * 3, 3 );
				attribute.name = morphTarget.name;

				array.push( attribute.copyVector3sArray( morphTarget.data ) );

			}

			this.morphAttributes[ name ] = array;

		}

		// skinning

		if ( geometry.skinIndices.length > 0 ) {

			const skinIndices = new Float32BufferAttribute( geometry.skinIndices.length * 4, 4 );
			this.setAttribute( 'skinIndex', skinIndices.copyVector4sArray( geometry.skinIndices ) );

		}

		if ( geometry.skinWeights.length > 0 ) {

			const skinWeights = new Float32BufferAttribute( geometry.skinWeights.length * 4, 4 );
			this.setAttribute( 'skinWeight', skinWeights.copyVector4sArray( geometry.skinWeights ) );

		}

		//

		if ( geometry.boundingSphere !== null ) {

			this.boundingSphere = geometry.boundingSphere.clone();

		}

		if ( geometry.boundingBox !== null ) {

			this.boundingBox = geometry.boundingBox.clone();

		}
    }

}

export { Capsule };

/**
* CONVEX GEOMETRY
*/

function ConvexGeometry( points ) {

	Geometry.call( this );

	this.fromBufferGeometry( new ConvexBufferGeometry( points ) );
	this.mergeVertices();

}

ConvexGeometry.prototype = Object.create( Geometry.prototype );
ConvexGeometry.prototype.constructor = ConvexGeometry;

export { ConvexGeometry };

/**
* CONVEXBUFFER GEOMETRY
*/

function ConvexBufferGeometry( points ) {

	BufferGeometry.call( this );

	// buffers

	var vertices = [];
	var normals = [];

	// execute QuickHull

	var quickHull = new ConvexHull().setFromPoints( points );


	// generate vertices and normals

	var faces = quickHull.faces;

	for ( var i = 0; i < faces.length; i ++ ) {

		var face = faces[ i ];
		var edge = face.edge;

		// we move along a doubly-connected edge list to access all face points (see HalfEdge docs)

		do {

			var point = edge.head().point;

			vertices.push( point.x, point.y, point.z );
			normals.push( face.normal.x, face.normal.y, face.normal.z );

			edge = edge.next;

		} while ( edge !== face.edge );

	}

	// build geometry

	this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );

}

ConvexBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
ConvexBufferGeometry.prototype.constructor = ConvexBufferGeometry;

export { ConvexBufferGeometry };
