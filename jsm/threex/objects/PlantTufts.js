import {
	PlaneGeometry,
	Matrix4,
	Vector3,
	BufferGeometry,
	Mesh
} from "../../libs/three.module.js";
import {
	Geometry,
} from "../../three/deprecated/Geometry.js";
var PlantTufts	= {};
PlantTufts.create = function(positions,size,material){
	var geometry =  new Geometry().fromBufferGeometry(new PlaneGeometry(size[0], size[1]));
	//geometry.applyMatrix4( new Matrix4().makeTranslation( 0, geometry.height/2, 0 ) );


	geometry.faces.forEach(function(face){
		face.vertexNormals.forEach(function(normal){
			normal.set(0.0,1.0,0.0).normalize();
		});
	})

	var mergedGeo	= new Geometry();
	for(var i = 0; i < positions.length; i++){
		var position	= positions[i];		
		var baseAngle	= Math.PI*2*Math.random();

		var nPlanes	= 2;
		for(var j = 0; j < nPlanes; j++){
			var angle	= baseAngle+j*Math.PI/nPlanes;
			//debugger;
			var curGeo = geometry.clone();
			curGeo.applyMatrix4(new Matrix4().makeRotationAxis(new Vector3(0, 1, 0), angle));
			curGeo.applyMatrix4(new Matrix4().makeTranslation(position.x, position.y+size[1]/2, position.z));
			mergedGeo.merge(curGeo);

			var curGeo2 = geometry.clone();
			curGeo2.applyMatrix4(new Matrix4().makeRotationAxis(new Vector3(0, 1, 0), angle+Math.PI));
			curGeo2.applyMatrix4(new Matrix4().makeTranslation(position.x, position.y+size[1]/2, position.z));
			mergedGeo.merge(curGeo2);
		}
	}

	var mesh = new Mesh(mergedGeo.toBufferGeometry(), material);
	return mesh;
}
export {PlantTufts};