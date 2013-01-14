!function () {

  var GAMEOBJECTS = [],

    IDS = {},
    TAGS = {},
    
    UNIQUE_ID = 0,

    TAU = Math.PI * 2;
  
    
  function GameObject(selector, strict) {
    if (!(this instanceof GameObject)) {
      if (!arguments.length) return GAMEOBJECTS;
      if ("number" == typeof selector) return IDS[selector];

      return GameObject.findGameObjectByTag(selector, strict);
    }

    this.localPosition = new Vector2;
    var position = new Vector2;

    this.z = 0;

    this.scale = new Vector2(1, 1);

    this.localRotation = 0;

    this.axes = [1, 0, 0, 1];
    
    Object.defineProperties(this, {
      "position": {
        get: function get() {
          var p = position,
            parent = this.parent;

          p.copy(this.localPosition);	

          while (parent != null) {
            p.add(parent.localPosition);
            parent = parent.parent;
          }

          return p;
        }, enumerable: true
      },

      "rotation": {
        get: function get() {
          var r = this.localRotation,
            parent = this.parent;

          while (parent != null) {
            r += parent.localRotation;
            parent = parent.parent;
          }

          return r;
        }, enumerable: true
      }
    });

    this.parent = null;
    this.children = [];

    this.tag = "";
    this.id = UNIQUE_ID++;

    this.components = {};

    this._listeners = {};
    
    this._dead = false;
  };

  Object.defineProperty(GameObject, "count", {
    get: function get() { return GAMEOBJECTS.length; },
    enumerable: true
  });

  GameObject.updating = false;
  GameObject.drawing = false;

  GameObject.components = {};

  GameObject.autoSort = true;
  GameObject._sortNextFrame = false;	
  GameObject._sortFunction = function (a, b) {
    return a.z - b.z;
  };

  GameObject.getUniqueID = function getUniqueID() {
    return UNIQUE_ID++;
  };
  
  GameObject.create = function create(options, alive) {
    var gameObject = new GameObject();
    
    options && gameObject.set(options, true);

    if (false === alive) {
      gameObject._dead = true;
    } else {
      IDS[gameObject.id] = gameObject;
      GAMEOBJECTS.push(gameObject);
    }

    return gameObject;
  };
  
  GameObject.sort = function sort(f) {
    if ("function" == typeof f) {
      this._sortFunction = f;
    }

    if (this.updating || this.drawing) this._sortNextFrame = true;
    else GAMEOBJECTS.sort(this._sortFunction);

    return this;
  };

  GameObject.update = function update(dt) {
		if (dt == null) dt = 1;
	
    var gameObjects = GAMEOBJECTS;

    this.updating = true;

    if (this.autoSort || this._sortNextFrame) {
      gameObjects.sort(this._sortFunction);
      this._sortNextFrame = false;
    }

    for (var i = 0, gameObject; gameObject = gameObjects[i]; i++) {
      if (gameObject._dead) gameObjects.splice(i--, 1);
      else gameObject.emit("update", dt);
    }

    this.updating = false;

    return this;
  };

  GameObject.draw = function draw(ctx) {
    var gameObjects = GAMEOBJECTS;

    this.drawing = true;

    for (var i = 0, gameObject; gameObject = gameObjects[i]; i++) {
      gameObject.emit("draw", ctx);	
    }

    this.drawing = false;

    return this;
  };

  GameObject.findGameObjectById = function findGameObjectById(id) {
    return IDS[id];
  };

  GameObject.findGameObjectByTag = function findGameObjectByTag(tag, strict) {
    var tags = TAGS;

    if (false === strict) {
      for (var key in tags) if (-1 < key.indexOf(tag)) {
        return tags[key][0];
      }
    }

    if (tags[tag]) return tags[tag][0];
  };

  GameObject.findGameObjectsByTag = function findGameObjectsByTag(tag, strict) {
    var tags = TAGS,
      gameObjects = [];

    if (false === strict) {
      for (var key in tags) if (-1 < key.indexOf(tag)) {
        gameObjects.push.apply(gameObjects, tags[key]);
      }
    } else if (tags[tag]) {
      gameObjects.push.apply(gameObjects, tags[tag]);
    }
    
    return gameObjects;
  };

  GameObject.defineComponent = function defineComponent(name, component) {
    if (!this.components.hasOwnProperty(name)) {
      this.components[name] = component();
      return this.components[name];
    }
  };
  

  GameObject.prototype = this.EventEmitter.mixin({

    constructor: GameObject,
    
    set: function set(options, value) {
      if ("string" == typeof options) {
        this[options] = value;
      } else if (true === value) {
        var getter, setter;
        
        for (var key in options) {
          getter = options.__lookupGetter__(key);
          setter = options.__lookupSetter__(key);

          if (getter || setter) {
            getter && this.__defineGetter__(key, getter);
            setter && this.__defineSetter__(key, setter);
          } else {
            this[key] = options[key];
          }
        }
      } else {
        for (var key in options) {
          this[key] = options[key];
        }
      }
      
      return this.emit("set", options, value);
    },
    
    scaleTo: function scaleTo(x, y) {
      if (y == null) y = x;

      this.scale.set(x, y);

      return this.emit("scaleTo", x, y);
    },

    rotate: function rotate(theta) {
      this.localRotation = (this.localRotation + theta || 0) % TAU;

      var cos = Math.cos(this.rotation),
        sin = Math.sin(this.rotation);
        
      this.axes[0] = cos;
      this.axes[1] = sin;
      this.axes[2] = -sin;
      this.axes[3] = cos;
      
      return this.emit("rotate", theta);
    },

    resetTransforms: function resetTransforms() {
      this.axes[0] = 1;
      this.axes[1] = 0;
      this.axes[2] = 0;
      this.axes[3] = 1;
      
      this.localRotation = 0;

      this.scale.set(1, 1);

      return this.emit("resetTransforms");
    },

    translate: function translate(x, y) {
      var rotation = this.rotation;

      if (rotation) {
        var cos = this.axes[0],
          sin = this.axes[1];

        this.localPosition.x += cos * x - sin * y;
        this.localPosition.y += sin * x + cos * y;
      } else {
        this.localPosition.x += x;
        this.localPosition.y += y;
      }

      return this.emit("translate", x, y);
    },

    translateX: function translateX(x) {
      var rotation = this.rotation;

      if (rotation) {
        this.localPosition.x += this.axes[0] * x;
        this.localPosition.y += this.axes[1] * x;
      } else {
        this.localPosition.x += x;
      }

      return this.emit("translateX", x);
    },

    translateY: function translateY(y) {
      var rotation = this.rotation;

      if (rotation) {
        this.localPosition.x += this.axes[2] * y;
        this.localPosition.y += this.axes[3] * y;
      } else {
        this.localPosition.y += y;
      }

      return this.emit("translateY", y);
    },

    destroy: function destroy() {
      if (this._dead) return this;

      this._dead = true;

      delete IDS[this.id];
      if ("" != this.tag) {
        var tags = TAGS[this.tag],
          i = tags.length;

        while (i--) if (this === tags[i]) {
          tags.splice(i, 1);
          if (0 == tags.length) delete TAGS[this.tag];

          break;
        }	
      }

      return this.emit("destroy");
    },

    revive: function revive() {
      if (!this._dead) return this;

      this._dead = false;

      GAMEOBJECTS.push(this);

      IDS[this.id] = this;
      if ("" != this.tag) {
        if (TAGS[this.tag] == null) TAGS[this.tag] = [this];
        else TAGS[this.tag].push(this);
      }

      return this.emit("revive");
    },

    isAlive: function isAlive() {
      return !this._dead;
    },

    addComponent: function addComponent(component) {
      if (GameObject.components.hasOwnProperty(component)) {
        GameObject.components[component].apply(this, Array.prototype.slice.call(arguments, 1));
        this.components[component] = true;
      }

      return this.emit("addComponent", component);
    },

    addComponents: function addComponents(components) {
      var _components = GameObject.components,
        isArray = Array.isArray;

      for (var key in components) if (_components.hasOwnProperty(key)) {
        _components[key].apply(this, isArray(components[key]) ? components[key] : [components[key]]);
        this.components[key] = true;
      }

      return this.emit("addComponents", components);
    },

    hasComponent: function hasComponent(component) {
      return this.components.hasOwnProperty(component);
    },

    removeComponents: function removeComponents() {
      var components = this.components,
        _components = GameObject.components,
        removers = Array.prototype.slice.call(arguments);
        
      if (!removers.length) {
        for (var key in components) removers.push(key);
      }
      
      for (var i = 0, remover; remover = removers[i]; i++) {
        if (components.hasOwnProperty(remover)) {
          this.emit("removeComponent." + remover);
          delete components[remover];
        }
      }
      
      return this;
    },

    setTag: function setTag(tag) {
      if (this.tag) this.removeTag();


      if (TAGS[tag]) {
        var tags = TAGS[tag],
          i = tags.length;

        while (i--) if (tags[i] === this) {
          return this;
        }

        tags.push(this);
      } else {
        TAGS[tag] = [this];
      }

      this.tag = tag;

      return this.emit("setTag", tag);
    },

    removeTag: function removeTag() {
      var tags = TAGS[this.tag],
        i = tags.length;

      while (i--) if (this === tags[i]) {
        tags.splice(i, 1);
        if (!tags.length) delete tags[this.tag];

        break;
      }

      this.tag = "";

      return this.emit("removeTag");
    },

    addChild: function addChild(child) {
      var children = this.children,
        i = children.length;

      while (i--) if (child === children[i]) {
        return this;
      }

      children.push(child);

      if (child.parent) child.parent.removeChild(child);
      child.parent = this;

      return this.emit("addChild", child);
    },

    removeChild: function removeChild(child) {
      var children = this.children,
        i = children.length;

      while (i--) if (children[i] === child) {
        children.splice(i, 1);
        child.parent = null;
        
        return this.emit("removeChild", child);
      }
      
      return this;
    },
    
    toString: function toString() {
      return "[GameObject]";
    }

  });
  
  this.GameObject = GameObject;

}.call(this);