
import * as THREE from '../../jsm/libs/three.module.js';
/**
 * Created by MuratCan on 4.9.2016.
 */
var HOLO = { Revision : 0 };
/**
 * Container for all animations.
 *
 * Created by MuratCan on 25.8.2016.
 */
HOLO.Animator = function () {
    this._animations = [];
};

HOLO.Animator.prototype = {
    constructor: HOLO.Animator,

    /**
     * Returns true if the animations array is empty.
     *
     * @returns {boolean}
     */
    get isEmpty() {
        return this._animations.length < 1;
    },

    /**
     * Adds given animation to the array.
     *
     * @param animation
     */
    add: function (animation) {
        this._animations.push(animation);
    },

    /**
     * Removes given animation from the array
     *
     * @param animation
     */
    remove: function (animation) {
        var index = this._animations.indexOf(animation);
        if (index > -1) this._animations.splice(index, 1);
    },

    /**
     * Clears all animations
     */
    clear: function () {
        this._animations = [];
    },

    /**
     * Checks if the given object is contained in the array.
     *
     * @param value
     * @returns {boolean}
     */
    contains: function (value) {
      return this._animations.indexOf(value) > -1;
    },

    /**
     * Animates all animations in the array.
     * If there is a finished animation, removes from the list.
     */
    animate: function () {
        for (var i = 0; i < this._animations.length; i++) {
            this._animations[i].animate();
            if (this._animations[i].finished)this.remove(this._animations[i]);
        }
    }
};
/**
 * Moves the camera to the given location and sets its newLookAt to specified location.
 *If given, it will also change camera's far.
 *
 * Created by MuratCan on 22.9.2016.
 */
HOLO.CameraAnimation = function (camera, newLocation, far, steps) {
    this._camera = camera;
    this._newLocation = newLocation;
    this._far = far;
    this._steps = steps;
    this._calc();
};

HOLO.CameraAnimation.prototype = {
    constructor: HOLO.CameraAnimation,

    /**
     * Returns true if the animation has been finished.
     *
     * @returns {boolean}
     */
    get finished() {
        return this._steps < 1;
    },

    /**
     * Calculates the units of change that the object is going to take in every step.(in every axis)
     *
     * @private
     */
    _calc: function () {
        this._changeX = (this._newLocation.x - this._camera.position.x) / this._steps;
        this._changeY = (this._newLocation.y - this._camera.position.y) / this._steps;
        this._changeZ = (this._newLocation.z - this._camera.position.z) / this._steps;
        this._changeFar = (this._far - this._camera.far) / this._steps;
    },

    /**
     * Changes the objects location by one step every time this function is called.
     * Decrements the step counter.
     *
     * @private
     */
    _lerp: function () {
        this._camera.position.x += this._changeX;
        this._camera.position.y += this._changeY;
        this._camera.position.z += this._changeZ;
        this._camera.far += this._changeFar;
    },

    /**
     * Function that is called by animator object.
     */
    animate: function () {
        this._lerp();
        this._steps -= 1;
    }
};
/**
 * Changes position of the given object to the newLocation in given steps.
 *
 * Created by MuratCan on 25.8.2016.
 */
HOLO.ChangeLocationAnimation = function (object, newLocation, steps) {
    this._object = object;
    this._steps = steps;
    if(newLocation.constructor === Array) this._calcSteps(new THREE.Vector3(newLocation[0], newLocation[1], newLocation[2]));
    else if(newLocation.isVector3) this._calcSteps(newLocation);
    else throw new Error( 'Object is not an array or vector: ');
};

HOLO.ChangeLocationAnimation.prototype = {
    constructor: HOLO.ChangeLocationAnimation,

    /**
     * Returns true if the animation has been finished.
     *
     * @returns {boolean}
     */
    get finished() {
        return this._steps < 1;
    },

    /**
     * Calculates the units of change that the object is going to take in every step.(in every axis)
     *
     * @param newLocation
     * @private
     */
    _calcSteps : function (newLocation) {
        this._changeX = (newLocation.x - this._object.position.x) / this._steps;
        this._changeY = (newLocation.y - this._object.position.y) / this._steps;
        this._changeZ = (newLocation.z - this._object.position.z) / this._steps;
    },

    /**
     * Changes the objects location by one step every time this function is called.
     * Decrements the step counter.
     *
     * @private
     */
    _lerp : function () {
        this._object.position.x += this._changeX;
        this._object.position.y += this._changeY;
        this._object.position.z += this._changeZ;
        this._steps -= 1;
    },

    /**
     * Function that is called by animator object.
     */
    animate: function () {
        this._lerp();
    }
};
/**
 * Changes rotation of the given object to the newLocation in given steps.
 *
 *  TODO Quaternion support will be added on later revisions.
 *
 * Created by MuratCan on 25.8.2016.
 */
HOLO.ChangeRotationAnimation = function (object, newRotation, steps) {
    this._object = object;
    this._steps = steps;
    if (newRotation.constructor === Array) this._calcSteps(new THREE.Vector3(newRotation[0], newRotation[1], newRotation[2]));
    else if (newRotation.isVector3) this._calcSteps(newRotation);
    else throw new Error('Object is not an array or vector: ');
}
;

HOLO.ChangeRotationAnimation.prototype = {
    constructor: HOLO.ChangeRotationAnimation,

    /**
     * Returns true if the animation has been finished.
     *
     * @returns {boolean}
     */
    get finished() {
        return this._steps < 1;
    },

    /**
     * Calculates the units of change that the object is going to take in every step.(in every axis)
     *
     * @param newRotation
     * @private
     */
    _calcSteps: function (newRotation) {
        this._changeX = (newRotation.x - this._object.rotation.x) / this._steps;
        this._changeY = (newRotation.y - this._object.rotation.y) / this._steps;
        this._changeZ = (newRotation.z - this._object.rotation.z) / this._steps;
    },

    /**
     * Changes the objects rotation by one step every time this function is called.
     * Decrements the step counter.
     *
     * @private
     */
    _lerp: function () {
        this._object.rotation.x += this._changeX;
        this._object.rotation.y += this._changeY;
        this._object.rotation.z += this._changeZ;
        this._steps -= 1;
    },

    /**
     * Function that is called by animator object.
     */
    animate: function () {
        this._lerp();
    }
};
/**
 * Changes scale of the given object to the newScale in given steps.
 *  TODO: Doesn't work, use morph target
 * Created by MuratCan on 25.8.2016.
 */
HOLO.ChangeScaleAnimation = function (object, newScale, steps) {
    this._object = object;
    this._steps = steps;
    if (newScale.constructor === Array)
        this._scale = new THREE.Vector3(newScale[0], newScale[1], newScale[2]);
    else if (newScale.isVector3)
        this._scale = newScale;
    else if (typeof newScale === "number")
        this._scale = new THREE.Vector3(newScale, newScale, newScale);
    else throw new Error('Object is not an array or vector: ');
    this._calcSteps(this._scale);
};

HOLO.ChangeScaleAnimation.prototype = {
    constructor: HOLO.ChangeScaleAnimation,

    /**
     * Returns true if the animation has been finished.
     *
     * @returns {boolean}
     */
    get finished() {
        return this._steps < 1;
    },


    /**
     * Calculates the units of change that the object is going to take in every step.(in every axis)
     *
     * @param newScale
     * @private
     */
    _calcSteps: function (newScale) {
        this._changeX = Math.abs( Math.sin( this._steps * newScale.x));
        this._changeY = Math.abs( Math.sin( this._steps * newScale.y));
        this._changeZ = Math.abs( Math.sin( this._steps * newScale.z));
    },

    /**
     * Changes the objects scale by one step every time this function is called.
     * Decrements the step counter.
     *
     * @private
     */
    _lerp: function () {
        this._object.scale.set(this._changeX, this._changeY, this._changeZ);
        this._steps -= 1;
    },

    /**
     * Function that is called by animator object.
     */
    animate: function () {
        this._lerp();
    }
};
/**
 * Created by MuratCan on 22.9.2016.
 */
/**
 * Focuses to the given object
 *
 *  TODO: Optimize
 *
 * Created by MuratCan on 22.9.2016.
 */
HOLO.FocusAnimation = function (scene, object, camera, steps, lookAt) {
    this._scene = scene;
    this._object = object;
    this._camera = camera;
    this._steps = steps;
    this._lookAt = lookAt || false;
};

HOLO.FocusAnimation.prototype = {
    constructor: HOLO.FocusAnimation,

    /**
     * Returns true if the animation has been finished.
     *
     * @returns {boolean}
     */
    get finished() {
        return this._steps < 1;
    },

    /**
     * Calculates the units of change that the object is going to take in every step.(in every axis)
     *
     * @private
     */
    _calc: function () {
        var x = this._object.position.x + this._scene.position.x;
        var y = this._object.position.y + this._scene.position.y;
        var z = this._object.position.z + this._scene.position.z;
        this._changeX = (0 - x) / this._steps;
        this._changeY = (0 - y) / this._steps;
        this._changeZ = ((this._camera.position.z - (this._camera.far / 2)) - z) / this._steps;
    },

    /**
     * Changes the objects location by one step every time this function is called.
     * Decrements the step counter.
     *
     * @private
     */
    _lerp: function () {
        this._scene.position.x += this._changeX;
        this._scene.position.y += this._changeY;
        this._scene.position.z += this._changeZ;
    },

    /**
     * Function that is called by animator object.
     */
    animate: function () {
        this._calc();
        this._lerp();
        this._steps -= 1;
        if(this._lookAt && this._steps === 0) this._object.lookAt(this._camera.position);
    }
};
/**
 * Changes rotation of the given object until it is stopped manually.
 *
 *  TODO: Quaternion support will be added on later revisions.
 *
 * Created by MuratCan on 25.8.2016.
 */
HOLO.RotationAnimation = function (object, alpha, rotationVector) {
    this._object = object;
    this._steps = 2;
    this.alpha = alpha;
    this.rotationVector = rotationVector;
}
;

HOLO.RotationAnimation.prototype = {
    constructor: HOLO.RotationAnimation,

    get alpha() {
        return this._alpha;
    },

    set alpha(value) {
        if (value !== undefined && typeof value !== "number") throw new Error('Alpha is not a float value.');
        else this._alpha = value || 1;
    },

    get rotationVector() {
        return this._rotationVector;
    },

    set rotationVector(value) {
        if (value.constructor === Array) this._rotationVector = new THREE.Vector3(value[0], value[1], value[2]);
        else if (value.isVector3) {
            this._rotationVector = value;
        }
        else throw new Error('Object is not an array or vector: ');
    },

    /**
     * Returns true if the animation has been finished.
     *
     * @returns {boolean}
     */
    get finished() {
        return this._steps < 1;
    },

    /**
     * Starts animation if stopped.
     */
    start: function () {
        this._steps = 2;
    },

    /**
     * Pauses the animation
     */
    pause: function () {
        this._steps = 1;
    },

    /**
     * Stops the animation.
     */
    stop: function () {
        this._steps = 0;
    },

    /**
     * Changes the objects rotation by one step every time this function is called.
     * Decrements the step counter.
     *
     * @private
     */
    _lerp: function () {
        this._object.rotation.x += this._rotationVector.x * this._alpha;
        this._object.rotation.y += this._rotationVector.y * this._alpha;
        this._object.rotation.z += this._rotationVector.z * this._alpha;
    },

    /**
     * Function that is called by animator object.
     */
    animate: function () {
        if(this._steps > 1) this._lerp();
    }
};
/**
 * Creates four displays for four sided hologram pyramid.
 *
 * Created by MuratCan on 4.9.2016.
 */
HOLO.FourSidedDisplay = function (renderer) {
    this.reflectFromAbove = true;
    this.renderer = renderer;
    this._cameraF = new THREE.PerspectiveCamera();
    this._cameraB = new THREE.PerspectiveCamera();
    this._cameraL = new THREE.PerspectiveCamera();
    this._cameraR = new THREE.PerspectiveCamera();
    this._position = new THREE.Vector3();
    this._quaternion = new THREE.Quaternion();
    this._scale = new THREE.Vector3();
    this.renderer.autoClear = false;
};

HOLO.FourSidedDisplay.prototype = {
    constructor: HOLO.FourSidedDisplay,

    get reflectFromAbove() {
        return this._reflectFromAbove;
    },

    set reflectFromAbove(val) {
        if (typeof val === "boolean") this._reflectFromAbove = val;
        else throw new Error("Value is not boolean");
    },

    get renderer() {
        return this._renderer;
    },

    set renderer(val) {
        this._renderer = val;
    },

    /**
     * Sets the size of width and height parameters according to four sided display.
     *
     * @param width
     * @param height
     */
    setSize: function (width, height) {
        if (width < height) {
            this._startX = 0;
            this._startY = (height - width) / 2;
            this._width = width / 3;
            this._height = width / 3;
        } else {
            this._startX = (width - height) / 2;
            this._startY = 0;
            this._width = height / 3;
            this._height = height / 3;
        }
        this._renderer.setSize(width, height);
    },

    /**
     * Render function called in the render loop.
     *
     * @param scene
     * @param camera
     */
    render: function (scene, camera) {
        this.cameraDistance = window.WEngine.view.cameraControls.getRadius();
        this._setCameras(camera);
        this._setScissors(scene);
    },

    /**
     * Sets four cameras to their places taking the front camera as reference.
     *
     * @param camera
     * @private
     */
    _setCameras: function (camera) {
        if (camera.parent === null) camera.updateMatrixWorld();
        camera.matrixWorld.decompose(this._position, this._quaternion, this._scale);

        //Calculating the positions of the cameras
        var _center = new THREE.Vector3(0, 0, -this.cameraDistance)
            .applyQuaternion(this._quaternion)
            .round()
            .add(this._position);
        var _back = new THREE.Vector3(0, 0, -this.cameraDistance)
            .applyQuaternion(this._quaternion)
            .round()
            .add(_center);
        var _left = new THREE.Vector3(-this.cameraDistance, 0, 0)
            .applyQuaternion(this._quaternion)
            .round()
            .add(_center);
        var _right = new THREE.Vector3(this.cameraDistance, 0, 0)
            .applyQuaternion(this._quaternion)
            .round()
            .add(_center);

        //Setting rotation quaternions
        var _rotateX_90 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        var _rotateX_180 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
        var _rotateY_90 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        var _rotateY_M90 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);

        //Calculating the rotations of the cameras
        var _quatR = new THREE.Quaternion().copy(this._quaternion).multiply(_rotateX_90).multiply(_rotateY_90); // Right cam
        var _quatB = new THREE.Quaternion().copy(this._quaternion).multiply(_rotateX_180); // Back cam
        var _quatL = new THREE.Quaternion().copy(this._quaternion).multiply(_rotateX_90).multiply(_rotateY_M90); // Left cam

        //Front camera
        this._cameraF.position.copy(this._position);
        this._cameraF.quaternion.copy(this._quaternion);
        this._cameraF.far = camera.far;

        //Right camera
        this._cameraR.position.copy(_right);
        this._cameraR.quaternion.copy(_quatR);
        this._cameraR.far = camera.far;

        //Back camera
        this._cameraB.position.copy(_back);
        this._cameraB.quaternion.copy(_quatB);
        this._cameraB.far = camera.far;

        //Left camera
        this._cameraL.position.copy(_left);
        this._cameraL.quaternion.copy(_quatL);
        this._cameraL.far = camera.far;
    },

    /**
     * Sets scissors for four displays.
     *
     * @private
     */
    _setScissors: function (scene) {
        this.renderer.clear();
        this.renderer.setScissorTest(true);

        //Upper rectangle
        this.renderer.setScissor(this._startX + this._width, this._startY + (2 * this._height), this._width, this._height);
        this.renderer.setViewport(this._startX + this._width, this._startY + (2 * this._height), this._width, this._height);

        if (this.reflectFromAbove) this.renderer.render(scene, this._cameraB);
        else this.renderer.render(scene, this._cameraF);

        //Lower rectangle
        this.renderer.setScissor(this._startX + this._width, this._startY, this._width, this._height);
        this.renderer.setViewport(this._startX + this._width, this._startY, this._width, this._height);

        if (this.reflectFromAbove) this.renderer.render(scene, this._cameraF);
        else this.renderer.render(scene, this._cameraB);

        //Left rectangle
        this.renderer.setScissor(this._startX, this._startY + this._height, this._width, this._height);
        this.renderer.setViewport(this._startX, this._startY + this._height, this._width, this._height);

        if (this.reflectFromAbove) this.renderer.render(scene, this._cameraR);
        else this.renderer.render(scene, this._cameraL);

        //Right rectangle
        this.renderer.setScissor(this._startX + (2 * this._width), this._startY + this._height, this._width, this._height);
        this.renderer.setViewport(this._startX + (2 * this._width), this._startY + this._height, this._width, this._height);

        if (this.reflectFromAbove) this.renderer.render(scene, this._cameraL);
        else this.renderer.render(scene, this._cameraR);

        this.renderer.setScissorTest(false);
    }
};

/**
 * Created by MuratCan on 4.9.2016.
 */
HOLO.ThreeSidedDisplay = function (renderer) {
    this.cameraDistance = 1000;
    this.reflectFromAbove = true;

    var _width, _height, _startX, _startY;

    var _cameraF = new THREE.PerspectiveCamera(),
        _cameraL = new THREE.PerspectiveCamera(),
        _cameraR = new THREE.PerspectiveCamera();
    var _position = new THREE.Vector3();
    var _quaternion = new THREE.Quaternion();
    var _scale = new THREE.Vector3();

    renderer.autoClear = false;

    this.setSize = function (width, height) {
        if (width < height) {
            _width = width / 2;
            _height = width / 2;
            _startX = 0;
            _startY = (height - (3 * _height)) / 2;
        } else {
            _height = height / 2;
            _width = height / 2;
            _startX = (width - (3 * _width)) / 2;
            _startY = 0;
        }
        renderer.setSize(width, height);
    };

    this.render = function (scene, camera) {
        this.cameraDistance = window.WEngine.view.cameraControls.getRadius();
        scene.updateMatrixWorld();
        this._setCameras(camera);
        this._setScissors(scene);
    };

    this._setCameras = function (camera) {
        if (camera.parent === null) camera.updateMatrixWorld();
        camera.matrixWorld.decompose(_position, _quaternion, _scale);

        var _center = new THREE.Vector3(0, 0, -this.cameraDistance).applyQuaternion(_quaternion).round().add(_position);
        var _left = new THREE.Vector3(-this.cameraDistance, 0, 0).applyQuaternion(_quaternion).round().add(_center);
        var _right = new THREE.Vector3(this.cameraDistance, 0, 0).applyQuaternion(_quaternion).round().add(_center);

        var _rotateX_90 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), Math.PI / 2);
        var _rotateY_90 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI / 2);
        var _rotateY_M90 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), - Math.PI / 2);
        var _rotateZ_180 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI);

        var _quatR = new THREE.Quaternion().copy(_quaternion).multiply(_rotateX_90).multiply(_rotateY_90);
        var _quatL = new THREE.Quaternion().copy(_quaternion).multiply(_rotateX_90).multiply(_rotateY_M90);

        _cameraF.position.copy(_position);
        if(this.reflectFromAbove) _cameraF.quaternion.copy(_quaternion.multiply(_rotateZ_180));
        else _cameraF.quaternion.copy(_quaternion);
        _cameraF.far = camera.far;

        _cameraR.position.copy(_right);
        _cameraR.quaternion.copy(_quatR);
        _cameraR.far = camera.far;

        _cameraL.position.copy(_left);
        _cameraL.quaternion.copy(_quatL);
        _cameraL.far = camera.far;
    };

    this._setScissors = function (scene) {
        renderer.clear();
        renderer.setScissorTest(true);

        if (this.reflectFromAbove) {
            renderer.setScissor(_startX + _width, _startY + _height, _width, _height);
            renderer.setViewport(_startX + _width, _startY + _height, _width, _height);
            renderer.render(scene, _cameraF);

            renderer.setScissor(_startX, _startY, _width, _height);
            renderer.setViewport(_startX, _startY, _width, _height);
            renderer.render(scene, _cameraR);

            renderer.setScissor(_startX + (2 * _width), _startY, _width, _height);
            renderer.setViewport(_startX + (2 * _width), _startY, _width, _height);
            renderer.render(scene, _cameraL);

        } else {
            renderer.setScissor(_startX + _height, _startY, _width, _height);
            renderer.setViewport(_startX + _height, _startY, _width, _height);
            renderer.render(scene, _cameraF);

            renderer.setScissor(_startX, _startY + _height, _height, _width);
            renderer.setViewport(_startX, _startY + _height, _height, _width);
            renderer.render(scene, _cameraL);

            renderer.setScissor(_startX + _height + _width, _startY + _height, _height, _width);
            renderer.setViewport(_startX + _height + _width, _startY + _height, _height, _width);
            renderer.render(scene, _cameraR);
        }

        renderer.setScissorTest(false);
    };
};

/**
 *  TODO
 * Created by MuratCan on 14.9.2016.
 */
HOLO.ModelLoader = function () {
};

HOLO.ModelLoader.prototype = {
    constructor: HOLO.ModelLoader
};

/**
 * Created by MuratCan on 7.9.2016.
 */
HOLO.Cube = function (width, height, depth, color, transparent, oppacity) {
    THREE.Group.call(this);
    this.type = 'Group';
    this._inside = [];
    this.autoScale = true;

    this._width = width || 200;
    this._height = height || 200;
    this._depth = depth || 200;
    this._color = color || 0x66ff33;
    this._transparent = transparent || true;
    this._oppacity = oppacity || 0.5;

    this._cubeGeometry = new THREE.CubeGeometry(this._width, this._height, this._depth);
    this._cubeMaterials = [
        new THREE.MeshBasicMaterial({
            color: this._color,
            transparent: this._transparent,
            opacity: this._oppacity,
            side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({
            color: this._color,
            transparent: this._transparent,
            opacity: this._oppacity,
            side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({
            color: this._color,
            transparent: this._transparent,
            opacity: this._oppacity,
            side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({
            color: this._color,
            transparent: this._transparent,
            opacity: this._oppacity,
            side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({
            color: this._color,
            transparent: this._transparent,
            opacity: this._oppacity,
            side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({
            color: this._color,
            transparent: this._transparent,
            opacity: this._oppacity,
            side: THREE.DoubleSide
        })
    ];
    this._cubeFaceMaterial = new THREE.MeshFaceMaterial(this._cubeMaterials);
    this._cubeMesh = new THREE.Mesh(this._cubeGeometry, this._cubeFaceMaterial);
    this.add(this._cubeMesh);
    this._cubeGeometry.computeBoundingBox();
    this.boundingBox = this._cubeGeometry.boundingBox;
};

HOLO.Cube.prototype = Object.assign(Object.create(THREE.Group.prototype), {
    constructor: HOLO.Cube,

    addToCube: function (object) {
        if (this.autoScale) {
            this._fit(object);
            this._inside.push(object);
            if (this._inside.length > 1) {
                this.children = this.children.slice(0, 1);
                this._computeSpacing();
                var totalY = 0;
                for (var i = 0; i < this._inside.length; i++) {
                    this._inside[i].computeBoundingBox();
                    totalY += this._inside[i].boundingBox.max.y;
                }
                var scale = this._objectSpace / totalY;
                var start = +this.boundingBox.max.y / 2;
                var temp;
                for (var i = 0; i < this._inside.length; i++) {
                    temp = this._inside[i].clone();
                    if (totalY > this.boundingBox.max.y) temp.scale.set(scale, scale, scale);
                    temp.position.set(0, start, 0);
                    this.add(temp);
                    temp.computeBoundingBox();
                    start -= (temp.boundingBox.max.y + this._singleSpacing);
                }
            }
            else this.add(object);
        }
        else this.add(object);
    },

    removeFromCube: function (object) {
        var index = this.children.indexOf(object);
        if (index > -1) {
            this.children.splice(index, 1);
        }
    },

    _fit: function (object) {
        object.computeBoundingBox();
        var scale;
        if (object.boundingBox.max.x > this.boundingBox.max.x) {
            scale = this.boundingBox.max.x / object.boundingBox.max.x;
            object.scale.set(scale, scale, scale);
        }
        if (object.boundingBox.max.y > this.boundingBox.max.y) {
            scale = this.boundingBox.max.y / object.boundingBox.max.y;
            object.scale.set(scale, scale, scale);
        }
        if (object.boundingBox.max.z > this.boundingBox.max.z) {
            scale = this.boundingBox.max.z / object.boundingBox.max.z;
            object.scale.set(scale, scale, scale);
        }
    },

    _computeSpacing: function () {
        this._totalSpacing = this.boundingBox.max.y / this._inside.length + 1;
        this._singleSpacing = this._totalSpacing / this._inside.length - 1;
        this._objectSpace = this.boundingBox.max.y - this._totalSpacing;
    },

    set color(newColor) {
        for (var i = 0; i < this._cubeGeometry.faces.length; i++) {
            this._cubeGeometry.faces[i].color = newColor;
        }
        this._cubeGeometry.colorsNeedUpdate = true;
    },
    get color() {
        return new THREE.Color(this._color);
    }
});
/**
 * Created by MuratCan on 7.9.2016.
 */

//Constructor
HOLO.Model = function (geometry, material) {
    THREE.Mesh.call(this, geometry, material);
    this.type = 'Mesh';
};

//Prototypes
HOLO.Model.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {
    constructor: HOLO.Model,

    computeBoundingBox: function () {
        this.geometry.computeBoundingBox();
        this.boundingBox = this.geometry.boundingBox;
    }
});
/**
 * Created by MuratCan on 11.9.2016.
 *
 */
HOLO.Text = function (font, text, size, height, curveSegments) {
    this._font = font;
    this._text = text || 'HoloJen';
    this._textSize = size || 80;
    this._textHeight = height || 20;
    this._curveSegments = curveSegments || 2;

    this._textGeometry = new THREE.TextGeometry(this._text, {
        font: this._font,
        size: this._textSize,
        height: this._textHeight,
        curveSegments: this._curveSegments
    });
    this._textGeometry.center();

    this._textMaterial = new THREE.MultiMaterial([
        new THREE.MeshBasicMaterial({color: 0x4a5c66, overdraw: 0.5}),
        new THREE.MeshBasicMaterial({color: 0xffffff, overdraw: 0.5})
    ]);
    THREE.Mesh.call(this, this._textGeometry, this._textMaterial);
    this.type = "Mesh";
};

HOLO.Text.prototype = Object.assign(Object.create(THREE.Mesh.prototype), {
    constructor: HOLO.Text,

    computeBoundingBox: function () {
        this._textGeometry.computeBoundingBox();
        this.boundingBox = this._textGeometry.boundingBox;
    },

    clone: function () {
        return new this.constructor(this._font, this._text).copy( this );
    }
});

export { HOLO };