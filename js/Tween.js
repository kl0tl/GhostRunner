!function () {

  var TWEENS = [];

  function Tween(options) {
    if (!options) options = {};

    this.from = options.from;
    this.to = options.to;

    this.values = {};

    this.duration = options.duration || 1000;

    this.time = 0;
    this.timeScale = 1;

    this.easing = options.easing == null ? "linear" : options.easing;
    
    this.onStart = options.onStart;
    this.onUpdate = options.onUpdate;
    this.onStop = options.onStop;

    this._chained = [];
    
    this._lastTime = 0;
    this._pausedAt = 0;

    return this;
  }

  Tween.prototype = {

    constructor: Tween,

    tag: "Tween",
    
    start: function start() {
      var value;

      this.time = this._pausedAt = 0;
      this._lastTime = Date.now();

      for (var property in this.from) {
        value = this.from[property];
        if (value == null) continue;

        this.values[property] = value;
      }

      TWEENS.push(this);

      return this;
    },

    update: function update() {
      if (0 < this._pausedAt) return this;

      var now = Date.now();

      if (0 == this.time && this.onStart) this.onStart();

      this.time += (now - this._lastTime) * this.timeScale;
      this._lastTime = now;

      if (this.time > this.duration) {
        this.time = this.duration;
      }

      if ("linear" == this.easing) e = this.time / this.duration || 0;
      else e = Tween.easing[this.easing](this.time, this.duration) || 0;

      for (var property in this.to) {
        this.values[property] = this.from[property] + (this.to[property] - this.from[property]) * e;
      }
      
      tween.onUpdate && tween.onUpdate(e, this.values);

      if (tween.time == tween.duration) tween.stop();

      return this;
    },

    stop: function stop() {
      Tween.remove(this);
      this.onStop && this.onStop();

      for (var i = 0, tween; tween = this._chained[i]; i++) {
        tween.start();
      }

      return this;
    },

    isPaused: function isPaused() {
      return 0 < this._pausedAt;
    },
    
    resume: function resume() {
      if (0 < this._pausedAt) {
        this._lastTime += Date.now() - this._pausedAt;
        this._pausedAt = 0;
      }
      
      return this;
    },

    pause: function pause() {
      if (0 == this._pausedAt) {
        this._pausedAt = Date.now();
      }

      return this;
    },

    toggle: function toggle() {
      if (0 == this._pausedAt) {
        this._pausedAt = Date.now();
      } else {
        this._lastTime += Date.now() - this._pausedAt;
        this._pausedAt = 0;
      }

      return this;
    },

    chain: function chain() {
      this._chained.push.apply(this._chained, arguments);

      return this;
    },

    toString: function toString() {
      return "[Tween]";
    }

  };

  Tween.easing = easing = {
    // Linear easing
    // @params:
    //		t	> current time
    //		d	> duration
    linear: function linear(t, d) { return t / d; },
    
    
    // Math.pow based easing
    // @params:
    //		t	> current time
    //		d	> duration
    //		e	> level of the easing (6 by default)
    getEaseInPow: function getEaseInPow(e) {
      if (!e) e = 6;

      return function (t, d) {
        return M.pow(t / d, e);
      };
    },
    getEaseOutPow: function getEaseOutPow(e) {
      if (!e) e = 6;

      return function (t, d) {
        return 1 - M.pow(1 - t / d, e);
      };
    },
    getEaseInOutPow: function getInEaseOutPow(e) {
      if (!e) e = 6;

      return function (t, d) {
        var m = 0 == e % 2 ? 1 : - 1;
        if (1 > (t /= d / 2)) return 0.5 * M.pow(t, e);
        return m * 0.5 * (M.pow(t - 2, e) + 2 * m);
      };
    },

    // Quadratic easing
    // @params:
    //		t	> current time
    //		d	> duration
    easeInQuad: function easeInQuad(t, d) { return M.pow(t / d, 2); },
    easeOutQuad: function easeOutQuad(t, d) { return 1 - M.pow(1 - t / d, 2); },
    easeInOutQuad: function easeInOutQuad(t, d) {
      if ((t /= d / 2) < 1) return 0.5 * t * t;
      return -0.5 * (--t * (t - 2) - 1);
    },

    // Cubic easing
    // @params:
    //		t	> current time
    //		d	> duration
    easeInCubic: function easeInCubic(t, d) { return M.pow(t / d, 3); },
    easeOutCubic: function easeOutCubic(t, d) { return 1 - M.pow(1 - t / d, 3); },
    easeInOutCubic: function easeInOutCubic(t, d) {
      if ((t /= d / 2) < 1) return 0.5 * M.pow(t, 3);
      return 0.5 * (M.pow(t - 2, 3) + 2);
    },

    // Quartic easing
    // @params:
    //		t	> current time
    //		d	> duration
    easeInQuartic: function easeInQuartic(t, d) { return M.pow(t / d, 4); },
    easeOutQuartic: function easeOutQuartic(t, d) { return 1 - M.pow(1 - t / d, 4); },
    easeInOutQuartic: function easeInOutQuartic(t, d) {
      if ((t /= d / 2) < 1) return 0.5 * M.pow(t, 4);
      return -0.5 * (M.pow(t - 2, 4) - 2);
    },

    // Quintic easing
    // @params:
    //		t	> current time
    //		d	> duration
    easeInQuintic: function easeInQuintic(t, d) { return M.pow(t / d, 5); },
    easeOutQuintic: function easeOutQuintic(t, d) { return 1 - M.pow(1 - t / d, 5); },
    easeInOutQuintic: function easeInOutQuintic(t, d) {
      if ((t /= d / 2) < 1) return 0.5 * M.pow(t, 5);
      return 0.5 * (M.pow(t - 2, 5) + 2);
    },


    // Sinusoidal easing
    // @params:
    //		t	> current time
    //		d	> duration
    easeInSine: function easeInSine(t, d) { return 1 - M.cos(t / d * halfPI); },
    easeOutSine: function easeOutSine(t, d) { return M.sin(t / d * halfPI); },
    easeInOutSine: function easeInOutSine(t, d) { return 0.5 * (1 - M.cos(PI * t / d)); },


    // Exponential easing
    // @params:
    //		t	> current time
    //		d	> duration
    easeInExpo: function easeInExpo(t, d) { return M.pow(2, 10 * (t / d - 1)); },
    easeOutExpo: function easeOutExpo(t, d) { return M.pow(2, -10 * t / d) + 1; },
    easeInOutExpo: function easeInOutExpo(t, d) {
      if ((t /= d / 2) < 1) return 0.5 * M.pow(2, 10 * (t - 1));
      return 0.5 * (-M.pow(2, -10 * --t) + 2);
    },


    // Circular easing
    // @params:
    //		t	> current time
    //		d	> duration
    easeInCirc: function easeInCirc(t, d) { return 1 - M.sqrt(1 - (t /= d) * t); },
    easeOutCirc: function easeOutCirc(t, d) { return M.sqrt(1 - (t = t / d - 1) * t); },
    easeInOutCirc: function easeInOutCirc(t, d) {
      if ((t /= d / 2) < 1) return 0.5 * (1  - M.sqrt(1 - t * t));
      return 0.5 * (M.sqrt(1 - (t -= 2) * t) + 1);
    },


    // Back easing
    // @params:
    //		t	> current time
    //		d	> duration
    //		s 	>  amout of overshoot (facultative, 1.70158 by default)
    getEaseInBack: function getEaseInBack(s) {
      if (s == null) s = 1.70158;
      
      return function (t, d) {
        return (t /= d) * t * ((s + 1) * t - s);
      };
    },
    getEaseOutBack: function getEaseOutBack(s) {
      if (s == null) s = 1.70158;
      
      return function (t, d) {
        return (t = t / d - 1) * t * ((s + 1) * t + s) + 1;
      };
    },
    getEaseInOutBack: function getEaseInOutBack(s) {
      if (s == null) s = 1.70158;
      
      return function (t, d) {
        if (1 > (t /= d / 2)) return 0.5 * (t * t * (((s *= 1.525) + 1) * t - s));
        return 0.5 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);
      }
    },


    // Bounce easing
    // @params:
    //		t	> current time
    //		d	> duration
    easeInBounce: function easeInBounce(t, d) { 
    // return 1 - easing.easeOutBounce(d - t, d);

      t = d - t;
      if ((t /= d) < 1 / 2.75) {
        return 1 - 7.5625 * t * t; 
      } else if (t < 2 / 2.75) {
        return 1 - (7.5625 * (t -= 1.5 / 2.75) * t + 0.75);
      } else if (t < 2.5 / 2.75) {
        return 1 - (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375);
      } else {
        return 1 - (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
      }
    },
    easeOutBounce: function easeOutBounce(t, d) {
      if ((t /= d) < 1 / 2.75) {
        return 7.5625 * t * t; 
      } else if (t < 2 / 2.75) {
        return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      } else if (t < 2.5 / 2.75) {
        return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      } else {
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
      }
    },
    easeInOutBounce: function easeInOutBounce(t, d) {
    // if (t < d / 2) return easing.easeInBounce(t * 2, d) * 0.5;
    // return easing.easeOutBounce(t * 2 - d, d) * 0.5 + 0.5;

      if (t < d / 2) {
        t *= 2;
        t = d - t;
        if ((t /= d) < 1 / 2.75) {
          return (1 - 7.5625 * t * t) * 0.5; 
        } else if (t < 2 / 2.75) {
          return (1 - (7.5625 * (t -= 1.5 / 2.75) * t + 0.75)) * 0.5;
        } else if (t < 2.5 / 2.75) {
          return (1 - (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375)) * 0.5;
        } else {
          return (1 - (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375)) * 0.5;
        }
      } else {
        t = t * 2 - d;
        if ((t /= d) < 1 / 2.75) {
          return 7.5625 * t * t * 0.5 + 0.5; 
        } else if (t < 2 / 2.75) {
          return (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) * 0.5 + 0.5;
        } else if (t < 2.5 / 2.75) {
          return (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) * 0.5 + 0.5;
        } else {
          return (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) * 0.5 + 0.5;
        }
      }
    },

    // Elastic easing
    // @params:
    //		t	> current time
    //		d	> duration
    //		a	> amplitue (facultative)
    //		p	> period (facultative)
    getEaseInElastic: function getEaseInElastic(a, p) {
      return function (t, d) {
        var s;
        if (0 == t) return 0; if (1 == (t /= d)) return 1; if (!p) p = d * 0.3;
        if (!a || 1 > a) { a = 1; s = p / 4; }
        else s = p / 2 * PI * M.asin(1 / a);
        return -a * M.pow(2, 10 * (t -= 1)) * M.sin((t * d - s) * 2 * PI / p); 
      };
    },
    getEaseOutElastic: function getEaseOutElastic(a, p) {
      return function (t, d) {
        var s;
        if (0 == t) return 0; if (1 == (t /= d)) return 1; if (!p) p = d * 0.3;
        if (!a || 1 > a) { a = 1; s = p / 4; }
        else s = p / 2 * PI * M.asin(1 / a);
        return a * M.pow(2, -10 * t) * M.sin((t * d - s) * 2 * PI / p) + 1;
      };
    },
    getEaseInOutElastic: function getEaseInOutElastic(a, p) {
      return function (t, d) {
        var s;
        if (0 == t) return 0; if (2 == (t /= d / 2)) return 1; if (!p) p = d * 0.3 * 1.5;
        if (!a || 1 > a) { a = 1; s = p / 4; }
        else s = p / 2 * PI * M.asin(1 / 4);
        if (1 > t) return -0.5 * a * M.pow(2, 10 * (t -= 1)) * M.sin((t * d - s) * 2 * PI / p);
        return a * M.pow(2, -10 * (t -= 1)) * M.sin((t * d - s) * 2 * PI / p) * 0.5 + 1;
      };
    }
  };

  Tween.easing.easeInBack = Tween.easing.getEaseInBack();
  Tween.easing.easeOutBack = Tween.easing.getEaseOutBack();
  Tween.easing.easeInOutBack = Tween.easing.getEaseInOutBack();

  Tween.easing.easeInElastic = Tween.easing.getEaseInElastic();
  Tween.easing.easeOutElastic = Tween.easing.getEaseOutElastic();
  Tween.easing.easeInOutElastic = Tween.easing.getEaseInOutElastic();


  Tween.update = function update() {
    var tweens = TWEENS,
      now = Date.now(), 
      e, property, n, next, value;

    for (var i = 0, tween; tween = tweens[i]; i++) {
      if (0 < tween._pausedAt) continue;

      if (0 == tween.time && tween.onStart) tween.onStart();

      tween.time += (now - tween._lastTime) * tween.timeScale;
      tween._lastTime = now;

      if (tween.time > tween.duration) {
        tween.time = tween.duration;
      }

      if ("linear" == tween.easing) e = tween.time / tween.duration || 0;
      else e = Tween.easing[tween.easing](tween.time, tween.duration) || 0;

      for (property in tween.to) {
        tween.values[property] = tween.from[property] + (tween.to[property] - tween.from[property]) * e;
      }

      tween.onUpdate && tween.onUpdate(e, tween.values);

      if (tween.time == tween.duration) {
        tweens.splice(i--, 1);	
        tween.onStop && tween.onStop();

        for (n = 0; next = tween._chained[n]; n++) {
          next.time = 0;
          next._lastTime = now;

          for (property in next.from) {
            value = next.from[property];
            if (value == null) continue;

            next.values[property] = value;
          }

          tweens.push(next);
        }
      }
    }

    return this;
  };

  Tween.remove = function remove() {
    if (0 == arguments.length) {
      TWEENS.length = 0;
    } else {			
      var tweens = TWEENS,
        length = tweens.length,
        removers = Array.prototype.slice.call(arguments);

      for (var i = 0, n, tween; tween = removers[i]; i++) {
        n = length;
        while (n--) if (tween === tweens[n]) {
          tweens.splice(n, 1);
          break;
        }
      }
    }

    return this;
  };


  this.Tween = Tween;

}.call(this);