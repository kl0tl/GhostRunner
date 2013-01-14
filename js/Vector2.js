!function () {

  function Vector2(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  Vector2.prototype = {

    constructor: Vector2,
    
    tag: "Vector2",
    
    set: function set(x, y) {
      this.x = x;
      this.y = y;
      
      return this;
    },
    
    copy: function copy(vector) {
      this.x = vector.x;
      this.y = vector.y;
      
      return this;
    },
    
    clone: function clone() {
      return new Vector2(this.x, this.y);
    },

    equals: function equals(vector) {
      var treshold = Vector2.precision,
        abs = Math.abs;
      
      if (abs(this.x) - abs(vector.x) < treshold) {
        return abs(this.y) - abs(vector.y) < treshold;
      } 
      
      return false;
    },
    
    add: function add(vector) {
      this.x += vector.x;
      this.y += vector.y;
      
      return this;
    },
    
    addScalar: function addScalar(scalar) {
      this.x += scalar;
      this.y += scalar;
      
      return this;
    },
    
    sub: function sub(vector) {
      this.x -= vector.x;
      this.y -= vector.y;
      
      return this;
    },
    
    subScalar: function subScalar(scalar) {
      this.x -= scalar;
      this.y -= scalar;
      
      return this;
    },
    
    multiply: function multiply(vector) {
      this.x *= vector.x;
      this.y *= vector.y;
      
      return this;
    },
    
    multiplyScalar: function multiplyScalar(scalar) {
      this.x *= scalar;
      this.y *= scalar;
      
      return this;
    },
    
    divide: function divide(vector) {
      this.x /= vector.x;
      this.y /= vector.y;
      
      return this;
    },
    
    divideScalar: function divideScalar(scalar) {
      scalar = 1 / scalar;
      
      this.x *= scalar;
      this.y *= scalar;
      
      return this;
    },
    
    negate: function negate() {
      this.x *= -1;
      this.y *= -1;
      
      return this;
    },
    
    dot: function dot(vector) {
      return this.x * vector.x + this.y * vector.y;
    },
    
    cross: function cross(vector) {
      //return this.x * vector.y - this.y * vector.x;
      return this.y * vector.x - this.x * vector.y;
    },
    
    magnitude: function magnitude() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    
    sqrMagnitude: function sqrMagnitude() {
      return this.x * this.x + this.y * this.y;
    },
    
    normalize: function normalize() {
      var im = 1 / Math.sqrt(this.x * this.x + this.y * this.y);
      
      this.x *= im;
      this.y *= im;
      
      return this;
    },
    
    normalized: function normalized() {
      var im = 1 / Math.sqrt(this.x * this.x + this.y * this.y);
      
      return new Vector2(this.x * im, this.y * im);
    },
    
    left: function left() {
      var im = 1 / Math.sqrt(this.x * this.x + this.y * this.y);
      
      return new Vector2(this.y * im, -this.x * im);
    },
    
    right: function right() {
      var im = 1 / Math.sqrt(this.x * this.x + this.y * this.y);
      
      return new Vector2(-this.y * im, this.x * im);
    },
    
    distanceTo: function distanceTo(vector) {
      var dx = this.x - vector.x, dy = this.y - vector.y;
      
      return Math.sqrt(dx * dx + dy * dy);
    },
    
    sqrDistanceTo: function sqrDistanceTo(vector) {
      var dx = this.x - vector.x, dy = this.y - vector.y;
      
      return dx * dx + dy * dy;
    },
    
    round: function round() {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      
      return this;
    },
    
    angle: function angle() {
      return Math.atan2(this.y, this.x);
    },
    
    absAngleTo: function absAngleTo(vector) {
      return Math.acos((this.x * vector.x + this.y * vector.y) / 
        (Math.sqrt(this.x * this.x + this.y * this.y) * Math.sqrt(vector.x * vector.x + vector.y * vector.y)));
    },
    
    angleTo: function angleTo(vector) {
      return Math.atan(this.y / this.x) - Math.atan(vector.y / vector.x);
    },
    
    rotate: function rotate(angle, vector) {
      if (vector == null) vector = Vector2.zero;
    
      var x = this.x - vector.x,
        y = this.y - vector.y,
        cos = Math.cos(angle),
        sin = Math.sin(angle);
      
      this.x = vector.x + (x * cos - y * sin);
      this.y = vector.y + (x * sin + y * cos);
      
      return this;
    },
    
    toArray: function toArray() {
      return [this.x, this.y];
    },
    
    toString: function toString() {
      return "[Vector2]";
    }

  };

  Vector2.precision = 1e-6; //0.000001

  Vector2.zero = new Vector2(0, 0);

  Vector2.left = new Vector2(-1, 0);

  Vector2.up = new Vector2(0, -1);

  Vector2.right = new Vector2(1, 0);

  Vector2.bottom = new Vector2(0, 1);

  Vector2.random = function random(m) {
    var v = new Vector2(Math.random(), Math.random());
    
    if (m == null) return v.multiplyScalar(1 / v.magnitude());
    return v.multiplyScalar(1 / v.magnitude() * m);
  };

  if ("function" == typeof Object.freeze) {
    Object.freeze(Vector2.left);
    Object.freeze(Vector2.up);
    Object.freeze(Vector2.right);
    Object.freeze(Vector2.bottom);
  }
  
  
  this.Vector2 = Vector2;
  
}.call(this);