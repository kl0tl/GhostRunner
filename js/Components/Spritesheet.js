GameObject.defineComponent("Spritesheet", function () {

  function Spritesheet(parent, options) {
    this.source = null;
    
    this.frames = [];
    this.framesLength = 0;
    this.frameWidth = 1;
    this.frameHeight = 1;
    
    this.currentFrame = 0;
    
    this.animations = {};

    this.currentAnimation = null;

		
    this.parent = parent;
    
    this._lastAnimationName = "";
    this._lastFrame = 0;

    if (options.animations) this.addAnimations(options.animations);
    return this.loadSource(options.source, options.frameWidth, options.frameHeight, options.frames);
  }
  
  Spritesheet.prototype = {
    
    constructor: Spritesheet,
    
    tag: "Spritesheet",
    
    loadSource: function loadSource(source, frameWidth, frameHeight, framesLength) {
      this.source = source;
      
      this.framesLength = framesLength = framesLength || 1;

      this.frameWidth = frameWidth = frameWidth || 1;
      this.frameHeight = frameHeight = frameHeight || 1;
      
      var sourceWidth = source.width,
        doc = document, frame, i;
      
			this.frames.length = framesLength;

      for (i = 0; i < framesLength; i++) {
        frame = doc.createElement("canvas");
        
        frame.width = frameWidth;
        frame.height = frameHeight;
        
        frame.getContext("2d").drawImage(source,
          i % (sourceWidth / frameWidth) * frameWidth,
          Math.floor(i / (sourceWidth / frameWidth)) * frameHeight,
          frameWidth,
          frameHeight,
          0,
          0,
          frameWidth,
          frameHeight
        );
        
        this.frames[i] = frame;
      }
      
      return this;
    },
    
    getFrame: function getFrame(frame) {
      return this.frames[Math.round(frame)];
    },
    
    getCurrentFrame: function getCurrentFrame() {
      return this.frames[this.currentFrame];
    },
		
		getRandomFrame: function getRandomFrame() {
			return this.frames[Math.floor(Math.random() * this.framesLength)];
		},
    
    drawFrame: function drawFrame(ctx, frame, paddingX, paddingY) {
      if (!paddingX) paddingX = 0;
      if (!paddingY) paddingY = 0;
      
      var width = this.frameWidth - paddingX * 2,
        height = this.frameHeight - paddingY * 2;
      
      //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(this.getFrame(frame), paddingX, paddingY, width, height, paddingX, paddingY, width, height);
      
      return this;
    },
    
    drawCurrentFrame: function drawCurrentFrame(ctx) {
      var animation = this.currentAnimation,
        width = this.frameWidth,
        height = this.frameHeight,
        paddingX = 0, 
        paddingY = 0;

      if (animation) {
        width -= (paddingX = animation.padding.x) * 2;
        height -= (paddingY = animation.padding.y) * 2;
      }
      
      //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(this.getCurrentFrame(), paddingX, paddingY, width, height, paddingX, paddingY, width, height);
      
      return this;
    },
		
		drawRandomFrame: function drawRandomFrame(ctx, paddingX, paddingY) {
			if (!paddingX) paddingX = 0;
      if (!paddingY) paddingY = 0;
      
      var width = this.frameWidth - paddingX * 2,
        height = this.frameHeight - paddingY * 2;
				
			//ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(this.getRandomFrame(), paddingX, paddingY, width, height, paddingX, paddingY, width, height);
			
			return this;
		},
    
    addAnimations: function addAnimations(o) {
      var animations = this.animations;
      
      for (var key in o) if (!animations.hasOwnProperty(key)) {
        animations[key] = o[key];
      }
      
      return this;
    },
    
    startAnimation: function startAnimation(name) {
      if (!this.animations.hasOwnProperty(name)) return;
    
      if (this.currentAnimation) {
        if (this.currentAnimation.name === name || !this.currentAnimation.stoppable) return this;
        this.stopAnimation();
      }
      
      var animation = this.currentAnimation = new Animation(name, this, this.animations[name]);
      
      if (animation.useLastFrameFrom.hasOwnProperty(this._lastAnimationName) && 0 < this._lastFrame) {
        animation.time = this._lastFrame;
        if (animation.time >= animation.frameTime * animation.framesLength) {
          animation.time = 0;
        }
      }
      
      this._lastFrame = 0;
      
      return animation;
    },
    
    stopAnimation: function stopAnimation() {
      var animation = this.currentAnimation;
      
      if (!animation || !animation.stoppable) return this;
      
      if (animation.saveLastFrame) {
        this._lastFrame = animation.time;
      }
      
      this.currentAnimation = null;
      this._lastAnimationName = animation.name;
      
      animation.onStop && animation.onStop();
      
      return this;
    },
    
    toString: function toString() {
      return "[Spritesheet]";
    }
    
  };


  function Animation(name, spritesheet, options) {
    this.name = name;
    
    this.currentFrame = -1;

    this.frames = options.frames || [];
    this.framesLength = this.frames.length;
    
    this.padding = new Vector2(options.paddingX || 0, options.paddingY || 0);
    
    this.frameTime = options.frameTime || 0;
    
    this.time = 0;
    this.timeScale = 1;
    this.startTime = Date.now();
    
    this.loop = !!options.loop;
    this.bounce = !!options.bounce;
    
    this.useLastFrameFrom = options.useLastFrameFrom || {};
    this.saveLastFrame = !!options.saveLastFrame;
      
    this.stoppable = options.stoppable == null ? true : !!options.stoppable;   
      
    this.onStart = options.onStart;
    this.onEachFrame = options.onEachFrame;
    this.onStop = options.onStop;
    
    this.spritesheet = spritesheet;
    
    this._lastTime = this.startTime;
    this._pausedAt = 0;
    
    this._bouncing = false;
    this._startCallbackFired = false;

    return this;
  }

  Animation.prototype = {

    constructor: Animation,
    
    tag: "Animation",
    
    update: function update() {
      if (0 < this._pausedAt) return this;
      
      var now = Date.now(),
        currentFrame;
      
      if (!this._startCallbackFired) {
        this._startCallbackFired = true;
        this._lastTime = now;

        this.onStart && this.onStart();
      }
      
      this.time += (now - this._lastTime) * this.timeScale * (this._bouncing ? -1 : 1);
      this._lastTime = now;
      
      currentFrame = Math.floor(this.time / this.frameTime);
      
      if (0 < this.frameTime && currentFrame == this.currentFrame && 0 < this.time) {
        return this;
      } else if (!this._bouncing && this.time < this.frameTime * this.framesLength || this._bouncing && 0 < this.time) {
        this.currentFrame = currentFrame;
        this.spritesheet.currentFrame = this.frames[currentFrame];

        this.onEachFrame && this.onEachFrame(currentFrame);  
      } else {
        if (this.bounce && !this._bouncing) {
          this._bouncing = true;
          this.time = this.frameTime * (this.framesLength - 1);
        } else if (this.loop) {
          if (this._bouncing) {
            this.time = this.frameTime;
            this._bouncing = false;
          } else {
            this.time = 0;
          }
        } else {
          this.spritesheet.currentAnimation = null;
          this.onStop && this.onStop();
        }
      }

      return this;
    },

    goToFrame: function goToFrame(frame) {
      this.time = this.frameTime * Math.round(frame);
      
      return this;
    },
    
    goToRandomFrame: function goToRandomFrame() {
      this.time = this.frameTime * Math.round(Math.random() * this.framesLength);
      
      return this;
    },
    
    isPaused: function isPaused() {
      return 0 < this._pausedAt;
    },
    
    resume: function resume() {
      if (0 < this._pausedAt) {
        this._lastTime += Date.now() - this._pausedAt;
        this._pausedAt = 0;
      
				return true;
			}
      
      return false;
    },
    
    pause: function pause() {
      if (0 == this._pausedAt) {
        this._pausedAt = Date.now();
      
				return true;
			}
      
      return false;
    },
    
    toggle: function toggle() {
      !thiss.resume() && this.pause();

      return this;
    },
    
    rewind: function rewind() {
      this.time = 0;
      this.currentFrame = -1;
      this._lastTime = Date.now();
      this._startCallbackFired = false;

      return this;
    },
    
    toString: function toString() {
      return "[Animation]";
    }

  };
  
  
  function onRemove() {
    delete this.spritesheet;
    
    this.off("removeComponent.Spritesheet", onRemove);
  }
  
  
  return function (options) {
    this.spritesheet = new Spritesheet(this, options || {});
  
    this.on("removeComponent.Spritesheet", onRemove);
  };
  
});