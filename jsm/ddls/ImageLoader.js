import { Log } from './utils.js';
import { Dictionary } from './Dictionary.js';
var ImageLoader = function(a, b) {
    this.images = new Dictionary(2);
    this.loaded = b;
    this.count = a.length;
    for (var c = 0; c < a.length;) {
        var d = a[c];
        ++c;
        this.load(d)
    }
};
ImageLoader.prototype = {
    load: function(a) {
        var b;
        b = window.document.createElement("img");
        b.style.cssText = "position:absolute;";
        b.onload = function() {
            this.store(b, a.split("/").pop())
        }.bind(this);
        b.src = a
    },
    store: function(a, b) {
        this.count--;
        Log("store " + b + " " + this.count);
        this.images.set(b, a);
        0 == this.count && this.loaded()
    }
};