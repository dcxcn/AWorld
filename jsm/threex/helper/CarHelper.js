import {
	BufferGeometry,
	BufferAttribute,
	LineBasicMaterial,
	VertexColors,
	LineSegments,
} from "../../libs/three.module.js";
class CarHelper extends LineSegments {


    constructor( p, center, deep ) {
        super();
        var s = 0.2;
        var d = -deep * 0.6;

        this.py = p[1] - center[1];

        var vertices = new Float32Array( [
            -s, 0, 0,  s, 0, 0,
            0, 0, 0,  0, s*2, 0,
            0, 0, -s,  0, 0, s,

            p[0]-d, this.py, p[2],    p[0]-d, this.py+1, p[2],
            -p[0]+d, this.py, p[2],   -p[0]+d, this.py+1, p[2],
            -p[0]+d, this.py,-p[2],   -p[0]+d, this.py+1, -p[2],
            p[0]-d, this.py, -p[2],    p[0]-d, this.py+1, -p[2],

            p[0]-d, this.py, p[2], -p[0]+d, this.py, p[2],
            p[0]-d, this.py, -p[2], -p[0]+d, this.py, -p[2],
        ] );

        var colors = new Float32Array( [
            1, 1, 0,  1, 1, 0,
            1, 1, 0,  0, 1, 0,
            1, 1, 0,  1, 1, 0,

            1,1,0,    1,1,0,
            1,1,0,    1,1,0,
            1,1,0,    1,1,0,
            1,1,0,    1,1,0,

            1,1,0,    1,1,0,
            1,1,0,    1,1,0,
        ] );

        this.geometry = new BufferGeometry();
        this.geometry.setAttribute( 'position', new BufferAttribute( vertices, 3 ) );
        this.geometry.setAttribute( 'color', new BufferAttribute( colors, 3 ) );

        this.positions = this.geometry.attributes.position.array;

        this.material = new LineBasicMaterial( { vertexColors: VertexColors, name:'helper' } );

        
    }

    dispose() {

        this.geometry.dispose();
        this.material.dispose();
    
    };
    
    updateSuspension( s0, s1, s2, s3 ) {
    
        this.positions[22] = this.py-s0;
        this.positions[28] = this.py-s1;
        this.positions[34] = this.py-s2;
        this.positions[40] = this.py-s3;
    
        this.geometry.attributes.position.needsUpdate = true;
    
    };

};



export { CarHelper };