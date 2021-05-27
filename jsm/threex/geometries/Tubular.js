import {
    Vector2,
    Vector3,
    Quaternion,
    CatmullRomCurve3,
    BufferGeometry,
    Uint32BufferAttribute,
    Uint16BufferAttribute,
    Float32BufferAttribute,
    Line,
    LineBasicMaterial

} from "../../libs/three.module.js";
import {
    Geometry,
} from "../../three/deprecated/Geometry.js";
/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Creates a tube which extrudes along a 3d spline.
 *
 */
class Tubular extends BufferGeometry {
    constructor(pp, tubularSegments, radius, radialSegments, closed, geoType, CurveType) {

        super();

        this.debug = false;

        this.type = 'Tubular';

        this.geoType = geoType || 'tube';

        this.tubularSegments = tubularSegments || 64;
        this.radius = radius || 1;
        this.radialSegments = radialSegments || 8;
        this.closed = closed || false;
        this.scalar = 1;

        //



        if (pp instanceof Array) this.positions = pp;
        else {

            this.positions = [];



            var start = new Vector3().fromArray(pp.start);
            var end = new Vector3().fromArray(pp.end);
            var mid = end.clone().sub(start);
            var lng = pp.numSegment - 1;

            this.positions.push(start);

            for (var i = 1; i < lng; i++) {

                this.positions.push(new Vector3((mid.x / lng) * i, (mid.y / lng) * i, (mid.z / lng) * i).add(start));

            }

            this.positions.push(end);



        }

        //

        this.rotations = [];
        for (var i = 1; i < this.positions.length + 1; i++) {
            this.rotations.push(new Quaternion());
        }

        //

        //this.path = new THREE.SplineCurve( this.positions );

        this.path = new CatmullRomCurve3(this.positions);
        // 'catmullrom', 'centripetal', 'chordal'
        //this.path.type = CurveType || 'catmullrom';
        //this.path.type = CurveType || 'catmullrom';
        this.path.type = 'catmullrom';
        this.path.closed = this.closed;

        //

        this.frames = this.path.computeFrenetFrames(this.tubularSegments, this.closed, this.rotations);

        // helper variables

        this.vertex = new Vector3();
        this.normal = new Vector3();
        this.uv = new Vector2();

        // buffer

        this.vertices = [];
        this.colors = [];
        this.normals = [];
        this.uvs = [];
        this.indices = [];

        // create buffer data

        this.generatePath();

        // build geometry

        this.setIndex(new (this.indices.length > 65535 ? Uint32BufferAttribute : Uint16BufferAttribute)(this.indices, 1));
        this.setAttribute('position', new Float32BufferAttribute(this.vertices, 3));
        this.setAttribute('color', new Float32BufferAttribute(this.colors, 3));
        this.setAttribute('normal', new Float32BufferAttribute(this.normals, 3));
        this.setAttribute('uv', new Float32BufferAttribute(this.uvs, 2));

    }

    addDebug(scene) {


        this.path.g = new Geometry();
        for (var i = 0; i < this.tubularSegments + 1; i++) {
            this.path.g.vertices.push(new Vector3());
        }
    
        this.path.mesh = new Line(this.path.g, new LineBasicMaterial({ color: 0xFF8800, linewidth: 1, depthTest: false, depthWrite: false, transparent: true }));
        scene.add(this.path.mesh);
    
        this.debug = true;
    
    }

    setTension(v) {

        this.path.tension = v;
    
    }

    generateSegment(i) {

        // point position 0 - 1
        var point = i / this.tubularSegments;
    
    
        //var sy = this.pathScale.getPointAt( i / this.tubularSegments ).y;
        var scale = this.scalar;
        if (this.geoType === 'sphere') scale = Math.sqrt(Math.pow(0.5, 2) - Math.pow(point - 0.5, 2)) * 2
    
        // we use getPointAt to sample evenly distributed points from the given path
    
        var n = (i * 3) * (this.radialSegments + 1), n2;
    
        var P = this.path.getPointAt(point);
    
        if (this.debug) this.path.g.vertices[i].copy(P);
    
        // retrieve corresponding normal and binormal
    
        var N = this.frames.normals[i];
        var B = this.frames.binormals[i];
    
        //var B = new THREE.Vector3( 0, 1, 0 );
    
        //console.log(N, B)
    
        //var T = this.frames.tangents[ i ];//this.path.getTangentAt( point );
        //var N = T.clone().applyAxisAngle( new THREE.Vector3(1,0,0), Math.PI/2 ).normalize();
        //var B = T.clone().cross(N).normalize();//applyAxisAngle( new THREE.Vector3(0,0,1), Math.PI/2 );
    
        // generate normals and vertices for the current segment
    
        var left = true, side = 1;
    
        for (var j = 0; j <= this.radialSegments; j++) {
    
            var v = (j / this.radialSegments) * Math.PI * 2;
            if (this.radialSegments === 1) {
                v = 0;
            }
    
            n2 = j * 3;
    
            var sin = Math.sin(v);
            var cos = - Math.cos(v);
    
    
    
            //sin = this.unwarpRad(sin);
            //cos = this.unwarpRad(cos);
    
            //N.cross( dir );
            //N.unproject(camera );//applyAxisAngle( new THREE.Vector3(0,0,1), Math.PI);
            //B.unproject(camera);//.applyAxisAngle( new THREE.Vector3(0,0,1), Math.PI);
            //N.applyAxisAngle( new THREE.Vector3(0,1,0), Math.PI);
    
            // normal
    
    
    
            /*if(this.radialSegments===1){
                if(left){this.normal.set(0,0,1); left = false}
                else {this.normal.set(0,0,-1); left = true}
            }*/
    
    
            if (this.radialSegments === 1) {
                if (left) { side = 0.5; left = false }
                else { side = -0.5; left = true }
    
                this.normal.copy(N).negate().projectOnPlane(new Vector3(0, 1, 0))
    
    
    
            } else {
                this.normal.x = (cos * N.x + sin * B.x);
                this.normal.y = (cos * N.y + sin * B.y);
                this.normal.z = (cos * N.z + sin * B.z);
            }
    
    
    
            //this.normal.multiplyScalar(scale);
    
    
    
            this.normal.normalize();
    
            /*this.normals[n + n2] =  this.normal.x * scale;
            this.normals[n + n2 +1] =  this.normal.y * scale;
            this.normals[n + n2 +2] =  this.normal.z * scale;
    
            // vertex
    
            this.vertices[n + n2] =  P.x + this.radius * this.normal.x * scale;
            this.vertices[n + n2 +1] =  P.y + this.radius * this.normal.y * scale;
            this.vertices[n + n2 +2] =  P.z + this.radius * this.normal.z * scale;
            */
    
            //if(this.vertices[n + n2]){
    
    
    
    
            this.normals[n + n2] = this.normal.x;
            this.normals[n + n2 + 1] = this.normal.y;
            this.normals[n + n2 + 2] = this.normal.z;
    
            this.normal.multiplyScalar(scale);
    
            // vertex
    
            this.vertices[n + n2] = P.x + this.radius * this.normal.x * side;
            this.vertices[n + n2 + 1] = P.y + this.radius * this.normal.y * side;
            this.vertices[n + n2 + 2] = P.z + this.radius * this.normal.z * side;
    
            /*if(this.radialSegments===1){
                this.vertices[n + n2] =  P.x + this.radius * this.normal.x * side;
                this.vertices[n + n2 +1] =  P.y //+ this.radius  * side;
                this.vertices[n + n2 +2] =  P.z //+ this.radius  * side;
            }*/
    
    
    
            /*if(this.radialSegments===1){
                this.vertices[n + n2] =  P.x + this.radius * 0.5;
                this.vertices[n + n2 +1] =  P.y + this.radius * this.normal.y;
                this.vertices[n + n2 +2] =  P.z + this.radius * this.normal.z;
            }*/
    
            // color
    
            this.colors[n + n2] = Math.abs(this.normal.x);
            this.colors[n + n2 + 1] = Math.abs(this.normal.y);
            this.colors[n + n2 + 2] = Math.abs(this.normal.z);
    
            if (this.radialSegments === 1) {
    
                this.normals[n + n2] = 0;
                this.normals[n + n2 + 1] = 1;
                this.normals[n + n2 + 2] = 0;
            }
            //} //else {
            //console.log(n+n2)
            //}
    
        }
    
    }

    generateIndicesAndUv() {

        for (var i = 0; i <= this.tubularSegments; i++) {
    
            for (var j = 0; j <= this.radialSegments; j++) {
    
                if (j > 0 && i > 0) {
    
                    var a = (this.radialSegments + 1) * (i - 1) + (j - 1);
                    var b = (this.radialSegments + 1) * i + (j - 1);
                    var c = (this.radialSegments + 1) * i + j;
                    var d = (this.radialSegments + 1) * (i - 1) + j;
    
                    // faces
    
                    this.indices.push(a, b, d);
                    this.indices.push(b, c, d);
                }
    
                // uv
    
                //this.uv.x = i / this.tubularSegments;
                //this.uv.y = j / this.radialSegments;
    
                this.uv.x = j / this.radialSegments;
                this.uv.y = i / this.tubularSegments;
    
    
                this.uvs.push(this.uv.x, this.uv.y);
                //this.uvs.push( this.uv.y, this.uv.x );
    
            }
    
        }
    
    }

    generatePath (path) {

        for (var i = 0; i <= this.tubularSegments; i++) {
    
            this.generateSegment(i);
    
        }
    
        // if the geometry is not closed, generate the last row of vertices and normals
        // at the regular position on the given path
        //
        // if the geometry is closed, duplicate the first row of vertices and normals (uvs will differ)
    
        //this.generateSegment( ( this.closed === false ) ? this.tubularSegments : 0 );
        //this.generateSegment( this.tubularSegments );
    
        //console.log(( this.closed === false ) ? this.tubularSegments : 0 )
    
        // uvs are generated in a separate function.
        // this makes it easy compute correct values for closed geometries
    
        this.generateIndicesAndUv();
    
    }

    updatePath (F) {

        //this.path = path;
        var full = F === undefined ? true : false;
    
        //if( full ) 
        this.frames = this.path.computeFrenetFrames(this.tubularSegments, this.closed, this.rotations);
    
        this.normals = this.attributes.normal.array;
        this.vertices = this.attributes.position.array;
        this.colors = this.attributes.color.array;
    
    
        for (var i = 0; i <= this.tubularSegments; i++) {
    
            this.generateSegment(i);
    
        }
    
        //this.generateSegment( this.tubularSegments );
    
        // if the geometry is not closed, generate the last row of vertices and normals
        // at the regular position on the given path
        //
        // if the geometry is closed, duplicate the first row of vertices and normals (uvs will differ)
    
        //this.generateSegment( ( this.closed === false ) ? this.tubularSegments : 0 );
        //console.log(( this.closed === false ) ? this.tubularSegments : 0 )
    
        this.attributes.color.needsUpdate = true;
        this.attributes.position.needsUpdate = true;
        this.attributes.normal.needsUpdate = true;
    
        this.attributes.uv.needsUpdate = true;
    
    
        if (this.debug) this.path.g.verticesNeedUpdate = true;
    
        if (this.geoType === 'sphere') this.computeVertexNormals();
    
        //this.updateUV()
        //this.updateIndices()
    
        this.computeBoundingSphere();
    
    
    }

    updateUV() {

        this.uvs = this.attributes.uv.array;
    
        var n, n2;
    
        for (var i = 0; i <= this.tubularSegments; i++) {
    
            n = (i * 2) * (this.radialSegments + 1);
    
            for (var j = 0; j <= this.radialSegments; j++) {
    
                n2 = j * 2;
    
                this.uv.x = i / this.tubularSegments;
                this.uv.y = j / this.radialSegments;
    
                this.uvs[n + n2] = this.uv.x
                this.uvs[n + n2 + 1] = this.uv.y;
    
            }
    
        }
    
        this.attributes.uv.needsUpdate = true;
    
    }

    updateIndices() {

        this.indices = [];
    
        var n2, n;
    
        for (var i = 0; i <= this.tubularSegments; i++) {
    
            n = (i * 2) * (this.radialSegments + 1);
    
            for (var j = 0; j <= this.radialSegments; j++) {
    
                if (j > 0 && i > 0) {
    
                    var a = (this.radialSegments + 1) * (i - 1) + (j - 1);
                    var b = (this.radialSegments + 1) * i + (j - 1);
                    var c = (this.radialSegments + 1) * i + j;
                    var d = (this.radialSegments + 1) * (i - 1) + j;
    
                    // faces
    
                    this.indices.push(a, b, d);
                    this.indices.push(b, c, d);
                }
    
                // uv
    
                this.uv.x = i / this.tubularSegments;
                this.uv.y = j / this.radialSegments;
    
                this.uvs[n + n2] = this.uv.y
                this.uvs[n + n2 + 1] = this.uv.x;
    
                n2 = j * 2;
    
                //this.uv.x = i / this.tubularSegments;
                //this.uv.y = j / this.radialSegments;
    
                //this.uvs.push( this.uv.x, this.uv.y );
                //this.uvs.push( this.uv.y, this.uv.x );
    
            }
    
        }
    
    }
}
export { Tubular };