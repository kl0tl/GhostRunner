!function () {
	
	var GAMESCENES = {},
	
		CURRENT_SCENE = null,
		NEXT_SCENE = null,
		
		LAST_TIME = 0,
		PAUSE = false,
		
		count = 0,
		
		hidden, visibilityChange;

	if (document.hidden != null) {
		hidden = "hidden";
		visibilityChange = "visibilitychange";
	} else if (document.webkitHidden != null) {
		hidden = "webkitHidden";
		visibilityChange = "webkitvisibilitychange";
	} else if (document.mozHidden != null) {
		hidden = "mozHidden";
		visibilityChange = "mozvisibilitychange";
	} else if (document.msHidden != null) {
		hidden = "msHidden";
		visibilityChange = "msvisibilitychange";
	}
	
	document.addEventListener(visibilityChange, function onVisibilityChange() {
		if (!document[hidden]) LAST_TIME = Date.now();
      CURRENT_SCENE && CURRENT_SCENE.onVisibilityChange && CURRENT_SCENE.onVisibilityChange(!document[hidden]);
	}, false);
	
	
	function GameScene() {}
  
  GameScene.prototype = {
    
    constructor: GameScene,
    
    tag: "GameScene",
    
		startTime: 0,
		timeScale: 1,
	
		init: function init() { 
      return this; 
    },
		destroy: function destroy() {
      return this;
    },
		
		inputs: function inputs() {
      return this;
    },
		update: function update(deltaTime) {
      return this.inputs(deltaTime);
    },
		render: function render() {
      return this;
    },
		
		pause: function pause() {
      if (!PAUSE) {
        PAUSE = true;
        this.onPause && this.onPause();
      }
      
      return this;
    },
		resume: function resume() {
      if (PAUSE) {
        PAUSE = false;
        LAST_TIME = Date.now();
        this.onResume && this.onResume();
      }
      
      return this;
    },
		toggle: function toggle() {
      if (PAUSE) {
        PAUSE = false;
        LAST_TIME = Date.now();
        this.onResume && this.onResume();
      } else {
        PAUSE = true;
        this.onPause && this.onPause();
      }
      
      return this;
    },
		
		onPause: null,
    onResume: null,
    onVisibilityChange: null,
    
    toString: function toString() {
      return "[GameScene]";
    }

	};
	
	Object.defineProperty(GameScene, "count", {
		get: function get() { return count; },
		enumerable: true
	});
  
  GameScene.mixin = function mixin(o) {
    var properties = ["tag", "startTime", "timeScale", "init", "destroy", "inputs", "update", "render", "pause", "resume", "toggle", "onPause", "onResume", "onVisibilityChange", "toString"];
  
    for (var i = 0, p; p = properties[i]; i++) {
      o[p] = GameScene.prototype[p];
    }
    
    return o;
  };
	
	GameScene.add = function add(scenes) {
    for (var key in scenes) if (!GAMESCENES[key]) {
			scenes[key].name = key;
			GAMESCENES[key] = scenes[key];
			
			count += 1;
		}
		
		return this;
	};
	
	GameScene.remove = function remove() {
		var gamescenes = GAMESCENES,
			keys = Array.prototype.slice.call(arguments);
			
		for (var i = 0, key; key = keys[i]; i++) if (gamescenes[key]) {
			delete gamescenes[key];
			count -= 1;
		}
		
		return this;
	};
	
	GameScene.has = function has(key) {
		return !!GAMESCENES[key];
	};
	
	GameScene.get = function get(key) {
		return GAMESCENES[key];
	};
	
	GameScene.isCurrentScene = function isCurrentScene(key) {
		return GAMESCENES[key] === CURRENT_SCENE;
	};
	
	GameScene.getCurrentScene = function getCurrentScene() {
		return CURRENT_SCENE;
	};
	
	GameScene.setCurrentScene = function setCurrentScene(key) {
		if (GAMESCENES[key]) {
			if (CURRENT_SCENE) {
        NEXT_SCENE = key;
			} else {
				CURRENT_SCENE = GAMESCENES[key];
				
				CURRENT_SCENE.startTime = LAST_TIME = Date.now();
				CURRENT_SCENE.init();
			}
		}
		
		return this;
	};
	
	GameScene.loop = function loop(ctx) {
		var scene = CURRENT_SCENE,
			now = Date.now();
		
		if (NEXT_SCENE) {
			scene.destroy();
			scene.startTime = 0;
			
			scene = CURRENT_SCENE = GAMESCENES[NEXT_SCENE];
			NEXT_SCENE = null;
			
			scene.startTime = LAST_TIME = now;
			scene.init();
		}
		
		if (!PAUSE) {
			scene.update((now - LAST_TIME) * scene.timeScale);
			scene.render(ctx);

			LAST_TIME = now;
		}
		
	};

	
	this.GameScene = GameScene;
	
}.call(this);