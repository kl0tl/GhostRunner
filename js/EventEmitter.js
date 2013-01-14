!function () {

  function EventEmitter() {
    this._listeners = {};
    
    return this;
  }

  EventEmitter.prototype = {

    constructor: EventEmitter,
    
    tag: "EventEmitter",
    
    on: function on(event, callback) {
      if (this._listeners.hasOwnProperty(event)) {
        this._listeners[event].push(callback);
      } else {
        this._listeners[event] = [callback];
      }

      return this;
    },
    
    once: function once(event, callback) {
      if (!this._listeners.hasOwnProperty(event)) {
        this._listeners[event] = [];
      }
      
      this._listeners[event].push(function listener() {
        callback.apply(this, arguments);
        this.off(event, listener);
      });
      
      return this;
    },
    
    off: function off(event, callback) {
      if (!this._listeners.hasOwnProperty(event)) return this;
      
      var listeners = this._listeners[event];
      
      if (callback == null) {
        listeners[event].length = 0;
      } else {
        var i = listeners.length;
        while (i--) if (callback === listeners[i]) {
          listeners.splice(i, 1);
          return this;
        }
      }
      
      return this;
    },
    
    emit: function emit(event) {
      if (!this._listeners.hasOwnProperty(event)) return this;
      
      var listeners = this._listeners[event],
        args = Array.prototype.slice.call(arguments, 1);
        
      for (var i = 0, callback; callback = listeners[i]; i++) {
        callback.apply(this, args);
      }
      
      return this;
    },
    
    toString: function toString() {
      return "[EventEmitter]";
    }
    
  };

  EventEmitter.mixin = function mixin(o) {
    var properties = ["on", "off", "once", "emit"];
    
    o._listeners = {};
    
    for (var i = 0, p; p = properties[i]; i++) {
      o[p] = EventEmitter.prototype[p];
    }
    
    return o;
  };
  
  
  this.EventEmitter = EventEmitter;
  
}.call(this);