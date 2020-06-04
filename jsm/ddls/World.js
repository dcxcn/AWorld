import { DDLSObject } from './DDLSObject.js';
import { RectMesh } from './RectMesh.js';
import { PathFinder } from './PathFinder.js';
import { Heroe } from './Heroe.js';
var World = function(a, b) {
    this.w = a || 512;
    this.h = b || 512;
    this.mesh = RectMesh(this.w, this.h);
    this.pathFinder = new PathFinder;
    this.pathFinder.mesh = this.mesh;
    this.heroes = [];
    this.shapes = [];
    this.segments = [];
    this.objects = []
};
World.prototype = {
    update: function() {
        for (var a = this.heroes.length; a--;) this.heroes[a].update()
    },
    add: function(a) {
        this.mesh.insertObject(a);
        this.objects.push(a)
    },
    addObject: function(a) {
        a = a || {};
        var b = new DDLSObject;
        b.coordinates = a.coord || [-1, -1, 1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, 1, -1, -1];
        b.position(a.x || 1, a.y || 1);
        b.scale(a.w || 1, a.h || 1);
        b.pivot(a.px || 0, a.py || 0);
        b.rotation = a.r || 0;
        this.mesh.insertObject(b);
        this.objects.push(b);
        return b
    },
    reset: function(a, b) {
        this.mesh.dispose();
        a && (this.w = a);
        b && (this.h = b);
        this.mesh = RectMesh(this.w, this.h);
        this.pathFinder.mesh = this.mesh
    },
    rebuild: function() {
        this.mesh.clear(!0);
        this.mesh = RectMesh(this.w, this.h);
        this.pathFinder.mesh = this.mesh;
        for (var a = this.objects.length; a--;) this.objects[a]._constraintShape = null, this.mesh.insertObject(this.objects[a])
    },
    addHeroe: function(a) {
        a = new Heroe(a, this);
        this.heroes.push(a);
        return a
    }
};

export { World };