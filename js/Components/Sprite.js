GameObject.defineComponent("Sprite", function () {

  function Sprite(parent, options) {
    if (!options.source) {
      var source = options.source = document.createElement("canvas"),
        ctx = source.getContext("2d");
      
      source.width = options.width || 1;
      source.height = options.height || 1;

      ctx.fillStyle = "#ff00ff";
      ctx.fillRect(0, 0, source.width, source.height);
    }
    
    this.source = null;
    this.buffer = document.createElement("canvas");
    
    this.width = this.height = 1;
    
    this.context = this.buffer.getContext("2d");

    this.scale = new Vector2(1, 1);

    var enableSmoothing = !!options.enableSmoothing,
			repeat = options.repeat || "no-repeat";

    Object.defineProperties(this, {
			"enableSmoothing": {
				get: function get() { 
					return enableSmoothing; 
				},
				set: function set(value) {
					value = !!value;
					
					if (value == enableSmoothing) return value;
					
					this.context.webkitImageSmoothingEnabled = this.context.mozImageSmoothingEnabled = enableSmoothing = value;

					this.context.clearRect(0, 0, this.width, this.height);
					this.context.drawImage(this.source, 0, 0);
					
					return value;
				}, 
				enumerable: true
			},
			
			"repeat": {
				get: function get() {
					return repeat;
				},
				set: function set(value) {
					if (value == repeat) return value;
					
					this._pattern = this.context.createPattern(this.source, repeat = value);
					this.update();
					
					return value;
				},
				enumerable: true
			}
		});

    this.enableSubPixelsRounding = options.enableSubPixelsRounding == null ? true : !!options.enableSubPixelsRounding;
		
    this.alpha = options.alpha == null ? 1 : options.alpha;
    
    this.display = options.display == null ? true : !!options.display;
		
    this.parent = parent;
		
		this._pattern = null;

    return this.loadSource(options.source);
  }

  Sprite.prototype = {

    constructor: Sprite,

    tag: "Sprite",
    
    loadSource: function loadSource(source) {
      this.source = source;
      this._pattern = this.context.createPattern(source, this.repeat);
			
      return this.rescale();
    },
    
    scaleTo: function scaleTo(x, y) {
      if (y == null) y = x;
      
      this.scale.set(x, y);
      
      return this.rescale();
    },
    
    rescale: function rescale() {
      this.width = this.buffer.width = Math.round(this.source.width * Math.abs(this.scale.x * this.parent.scale.x));
      this.height = this.buffer.height = Math.round(this.source.height * Math.abs(this.scale.y * this.parent.scale.y));
      
      return this.update();
    },
    
    resetTransforms: function resetTransforms() {
      this.scale.set(1, 1);

      return this.rescale();
    },
		
		update: function update() {
			var scaleX = this.scale.x * this.parent.scale.x,
        scaleY = this.scale.y * this.parent.scale.y;
			
			this.context.clearRect(0, 0, this.width, this.height);

			if ("no-repeat" == this.repeat) {
				this.context.setTransform(scaleX, 0, 0, scaleY, 0 > scaleX ? this.width : 0, 0 > scaleY ? this.height : 0);
				this.context.webkitImageSmoothingEnabled = this.context.mozImageSmoothingEnabled = this.enableSmoothing;
				this.context.drawImage(this.source, 0, 0);
			} else {
				var style = this.context.fillStyle,
					sx, sy, tx, ty;
				
				if (0 > scaleX) sx = -1, tx = this.width;
				else sx = 1, tx = 0;
				if (0 > scaleY) sy = -1, ty = this.height;
				else sy = 1, ty = 0;

				this.context.setTransform(sx, 0, 0, sy, tx, ty);
				
				this.context.fillStyle = this._pattern;
				this.context.fillRect(0, 0, this.width, this.height);
				this.context.fillStyle = style;
			}
			
			return this;
		},
		
    draw: function draw(ctx) {
      var position = this.parent.position,
        rotation = this.parent.rotation,
        r = this.enableSubPixelsRounding,
        w = this.width * 0.5, 
        h = this.height * 0.5;

      //var globalAlpha = ctx.globalAlpha;
      ctx.save();

      ctx.globalAlpha = this.alpha;

      if (rotation) {
        ctx.translate(position.x, position.y);
        ctx.rotate(rotation);
        ctx.translate(-position.x, -position.y);
				
				// ctx.transform(1, 0, 0, 1, position.x, position.y);
				// ctx.transform(Math.cos(rotation), Math.sin(rotation), -Math.sin(rotation), Math.cos(rotation), 0, 0)
				// ctx.transform(1, 0, 0, 1, -position.x, -position.y);
				
				// 1 0 position.x
				// 0 1 position.y
				
				// cos -sin 0
				// sin  cos 0
				
				// 1 0 -position.x
				// 0 1 -position.y
      }
      
      ctx.drawImage(this.buffer, r ? Math.round(position.x - w) : position.x - w, r ? Math.round(position.y - h) : position.y - h);

      //ctx.globalAlpha = globalAlpha;
      //rotation && ctx.rotate(-rotation);
			// rotation && ctx.transform(-cos, -sin, sin, -cos, 0, 0);
      ctx.restore();
      
      return this;
    },
    
		toString: function toString() {
      return "[Sprite]";
    }

  };


  function onDraw(ctx) {
    this.sprite.display && this.sprite.draw(ctx);
  }

  function onScaleTo() {
    this.sprite.rescale();
  }

  function onResetTransforms() {
    this.sprite.resetTransforms();
  }
  
  function onRemove() {
    delete this.sprite;
    
    this
      .off("draw", onDraw)
      .off("scaleTo", onScaleTo)
      .off("resetTransforms", onResetTransforms)
      .off("removeComponent.Sprite", onRemove);
  }


  return function (options) {
    this.sprite = new Sprite(this, options || {});
    
    this
      .on("draw", onDraw)
      .on("scaleTo", onScaleTo)
      .on("resetTransforms", onResetTransforms)
      .on("removeComponent.Sprite", onRemove);
  };

});