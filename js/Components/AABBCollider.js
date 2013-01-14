GameObject.defineComponent("AABBCollider", function () {

  var v1 = new Vector2;


  function AABBCollider(parent, options) {
    this._width = options.width || 1;
    this._height = options.height || 1;
    
    this.axes = [1, 0, 0, 1];
    this.halfExtents = new Vector2;
    
    this.boundingRadius = 0;
    
    this.scale = new Vector2(1, 1);
    
    this.offset = new Vector2(options.x || 0, options.y || 0);
    
    var position = new Vector2;
    Object.defineProperty(this, "position", {
      get: function get() {
        return position.copy(this.offset).multiply(this.scale).add(this.parent.position);
      }, enumerable: true
    });
    
    this.hovered = false;
    this.colliding = false;
    
    this.color = options.color || "#ff00ff";
    
    this.enabled = options.enabled == null ? true : !!options.enabled;
    this.enableEvents = options.enableEvents == null ? true : !!options.enableEvents;
    
    this.parent = parent;

    return this.rescale();
  }

  AABBCollider.prototype = {

    constructor: AABBCollider,
    
    tag: "AABBCollider",
    
    updateBoundingRadius: function updateBoundingRadius() {
      var w = this.halfExtents.x,
        h = this.halfExtents.y;
      
      this.boundingRadius = Math.sqrt(w * w + h * h);
      
      return this;
    },
    
    scaleTo: function scaleTo(x, y) {
      if (y == null) y = x;

      this.scale.set(x, y);
      
      return this.rescale();
    },
    
    resize: function resize(w, h) {
      this._width = w;
      this._height = h;

      return this.rescale();
    },

    rescale: function rescale() {
      this.halfExtents.set(
        Math.abs(this._width * 0.5 * this.scale.x * this.parent.scale.x),
        Math.abs(this._height * 0.5 * this.scale.y * this.parent.scale.y)
      );
      
      return this.updateBoundingRadius();
    },

    resetTransforms: function resetTransforms() {
      this.scale.set(1, 1);

      return this.rescale();
    },

    hover: function hover(x, y) {
      if (!this.enabled) return false;

      var position = this.position,
        w = this.halfExtents.x,
        h = this.halfExtents.y;
      
      if (x < position.x - w || x > position.x + w ||
        y < position.y - h || y > position.y + h) {
        if (this.hovered) {
          this.hovered = false;
          this.enableEvents && this.parent.emit("hover.exit", x, y);
        }
        
        return false;
      }
      
      if (this.hovered) {
        this.enableEvents && this.parent.emit("hover.stay", x, y);
      } else {
        this.hovered = true;
        this.enableEvents && this.parent.emit("hover.enter", x, y);
      }
      
      return true;
    },
    
    collision: function collision(other) {
      switch (other.tag) {
      case "CircleCollider":	
        return this.collisionWithCircle(other);
      
      case "AABBCollider":	
        return this.collisionWithAABB(other);
      
      case "OBBCollider":	
        return this.collisionWithOBB(other); 

      case "PolygonCollider":
        return this.collisionWithPolygon(other);
      }

      return false;
    },
    
    collisionWithCircle: function collisionWithCircle(other) {
      if (!this.enabled || !other.enabled) return false;
      
      var position = this.position,
        other_position = other.position,
        v = v1.copy(other_position).sub(position),
        radii = this.boundingRadius + other.boundingRadius;
      
      if (radii * radii < v.x * v.x + v.y * v.y) {
        if (this.colliding) {
          this.colliding = false;
          this.enableEvents && this.parent.emit("collision.exit", other, v.set(0, 0), 0);
        }
        
        return false;
      }
      
      var w = this.halfExtents.x, 
        h = this.halfExtents.y;

      if (v.x > w) position.x += w;
      else if (v.x < -w) position.x -= w;
      else position.x += v.x;

      if (v.y > h) position.y += h;
      else if (v.y < -h) position.y -= h;
      else position.y += v.y;
      
      position.sub(other_position);
      var sqrDistance = position.sqrMagnitude();
      
      if (sqrDistance < other.boundingRadius * other.boundingRadius) {
        v.multiplyScalar(1 / v.magnitude());

        if (this.colliding) {
          this.enableEvents && this.parent.emit("collision.stay", other, v, Math.sqrt(sqrDistance) - other.boundingRadius);
        } else {
          this.colliding = true;
          this.enableEvents && this.parent.emit("collision.enter", other, v, Math.sqrt(sqrDistance) - other.boundingRadius);
        }
        
        return true;
      }
      
      if (this.colliding) {
        this.colliding = false;
        this.enableEvents && this.parent.emit("collision.exit", other, v.set(0, 0), 0);
      }
      
      return false;
    },
    
    collisionWithAABB: function collisionWithAABB(other) {
      if (!this.enabled || !other.enabled) return this;
      
      var v = this.position.sub(other.position),
        overlapX = Math.abs(v.x) - (this.halfExtents.x + other.halfExtents.x),
        overlapY = Math.abs(v.y) - (this.halfExtents.y + other.halfExtents.y),
        collisionDepth = 0;
        
      if (0 > overlapX && 0 > overlapY) {
        if (overlapX > overlapY) {
          collisionDepth = overlapX;
          v.set(0 > v.x ? 1 : -1, 0);
        } else {
          collisionDepth = overlapY;
          v.set(0, 0 > v.y ? 1 : -1);
        }
      
        if (this.colliding) {
          this.enableEvents && this.parent.emit("collision.stay", other, v, collisionDepth);
        } else {
          this.colliding = true;
          this.enableEvents && this.parent.emit("collision.enter", other, v, collisionDepth);
        }
        
        return true;
      }
      
      if (this.colliding) {
        this.colliding = false;
        this.enableEvents && this.parent.emit("collision.exit", other, v.set(0, 0), collisionDepth);
      }
      
      return false;
    },
    
    collisionWithOBB: function collisionWithOBB(other) {
      if (!this.enabled || !other.enabled) return false;

      var position = this.position,
        other_position = other.position,
        radii = this.boundingRadius + other.boundingRadius;
      
      if (radii * radii < (position.x - other_position.x) * (position.x - other_position.x) + 
        (position.y - other_position.y) * (position.y - other_position.y)) {
        if (this.colliding) {
          this.colliding = false;
          this.enableEvents && this.parent.emit("collision.exit", other, position.set(0, 0), 0);
        }
        
        return false;
      }
      
      var axes = this.axes.concat(other.axes),
        axisDotOtherAxis;
        
      for (var i = 6, n; 0 < i; i -= 2) {
        for (n = i - 2; -1 < n; n -= 2) {
          axisDotOtherAxis = axes[i] * axes[n] + axes[i + 1] * axes [n + 1];
          
          if (-0.99999 >= axisDotOtherAxis || 0.99999 <= axisDotOtherAxis) {
            axes.splice(n, 2), i -= 2;
          }
        }
      }
      
      var abs = Math.abs, 
        l = axes.length,
        w = this.halfExtents.x,
        h = this.halfExtents.y,
        other_w = other.halfExtents.x,
        other_h = other.halfExtents.y,
        
        x, y, r, other_r, positionDotAxis, other_positionDotAxis,
        min, max, other_min, other_max,
        
        overlap,
        collisionDepth = this.boundingRadius,
        collisionNormal = v1;

      for (i = 0; i < l; i += 2) {
        x = axes[i], y = axes[i + 1];
      
        positionDotAxis = position.x * x + position.y * y;
        r = w * abs(x * this.axes[0] + y * this.axes[1]) + h * abs(x * this.axes[2] + y * this.axes[3]);
        
        min = positionDotAxis - r;
        max = positionDotAxis + r;
        
        other_positionDotAxis = other_position.x * x + other_position.y * y;
        other_r = other_w * abs(x * other.axes[0] + y * other.axes[1]) + other_h * abs(x * other.axes[2] + y * other.axes[3]);
        
        other_min = other_positionDotAxis - other_r;
        other_max = other_positionDotAxis + other_r;
        
        if (positionDotAxis + r < other_positionDotAxis - other_r || 
          other_positionDotAxis + other_r < positionDotAxis - r) {
          if (this.colliding) {
            this.colliding = false;
            this.enableEvents && this.parent.emit("collision.exit", other, collisionNormal.set(0, 0), 0);
          }
          
          return false;
        } else {
          overlap = min > other_min ? other_max - min : max - other_min;
          
          if (overlap < collisionDepth) {
            collisionDepth = overlap;
            collisionNormal.set(x, y);
          }
        }
      }

      if (0 < other_position.sub(position).dot(collisionNormal)) {
        collisionNormal.negate();
      }
      
      if (this.colliding) {
        this.enableEvents && this.parent.emit("collision.stay", other, collisionNormal, collisionDepth);
      } else  {
        this.colliding = true;
        this.enableEvents && this.parent.emit("collision.enter", other, collisionNormal, collisionDepth);
      }
      
      return true;
    },

    collisionWithPolygon: function collisionWithPolygon(other) {
      if (!this.enabled || !other.enabled) return false;
      
      var position = this.position,
        other_position = other.position,
        radii = this.boundingRadius + other.boundingRadius;
        
      if (radii * radii < (position.x - other_position.x) * (position.x - other_position.x) + 
        (position.y - other_position.y) * (position.y - other_position.y)) {
        if (this.colliding) {
          this.colliding = false;
          this.enableEvents && this.parent.emit("collision.exit", other, position.set(0, 0), 0);
        }
        
        return false;
      }
      
      var axes = this.axes.concat(other.normals),
        axisDotOtherAxis;
        
      for (var i = axes.length - 2, n; 0 < i; i -= 2) {
        for (n = i - 2; -1 < n; n -= 2) {
          axisDotOtherAxis = axes[i] * axes[n] + axes[i + 1] * axes [n + 1];
          
          if (-0.99999 >= axisDotOtherAxis || 0.99999 <= axisDotOtherAxis) {
            axes.splice(n, 2), i -= 2;
          }
        }
      }
      
      var l = axes.length,
        w = this.halfExtents.x,
        h = this.halfExtents.y,
        other_vertices = other.vertices,
        other_verticesLength = other_vertices.length,
        
        x, y, r, positionDotAxis, other_positionDotAxis,
        other_verticeDotAxis, min, max, other_min, other_max,
        
        overlap,
        collisionDepth = this.boundingRadius,
        collisionNormal = v1;
      
      for (i = 0; i < l; i += 2) {
        x = axes[i], y = axes[i + 1];

        positionDotAxis = position.x * x + position.y * y;
        r = w * Math.abs(x * this.axes[0] + y * this.axes[1]) + h * Math.abs(x * this.axes[2] + y * this.axes[3]);
        
        min = positionDotAxis - r;
        max = positionDotAxis + r;
        
        other_positionDotAxis = other_position.x * x + other_position.y * y;
        other_min = other_max = other_positionDotAxis + x * other_vertices[0] + y * other_vertices[1];
        
        for (n = 2; n < other_verticesLength; n += 2) {
          other_verticeDotAxis = other_positionDotAxis + x * other_vertices[n] + y * other_vertices[n + 1];
          
          if (other_min > other_verticeDotAxis) other_min = other_verticeDotAxis;
          else if (other_verticeDotAxis > other_max) other_max = other_verticeDotAxis;
        }
        
        if (max < other_min || other_max < min) {
          if (this.colliding) {
            this.colliding = false;
            this.enableEvents && this.parent.emit("collision.exit", other, collisionNormal.set(0, 0), 0);
          }
          
          return false;
        } else {
          overlap = min > other_min ? other_max - min : max - other_min;
          
          if (overlap < collisionDepth) {
            collisionDepth = overlap;
            collisionNormal.set(x, y);
          }
        }
      }

      if (0 < other_position.sub(position).dot(collisionNormal)) {
        collisionNormal.negate();
      }
      
      if (this.colliding) {
        this.enableEvents && this.parent.emit("collision.stay", other, collisionNormal, collisionDepth);
      } else {
        this.colliding = true;
        this.enableEvents && this.parent.emit("collision.enter", other, collisionNormal, collisionDepth);
      }
      
      return true;
    },
    
    drawAxes: function drawAxes(ctx, colorX, colorY) {
      var position = this.position,
        style = ctx.strokeStyle;
      
      ctx.strokeStyle = colorX || "#ff0000";
      
      ctx.beginPath();
      ctx.moveTo(position.x, position.y);
      ctx.lineTo(position.x + 15, position.y);
      ctx.stroke();
      
      ctx.strokeStyle = colorY || "#00ff00";
      
      ctx.beginPath();
      ctx.moveTo(position.x, position.y);
      ctx.lineTo(position.x, position.y + 15);
      ctx.stroke();
      
      ctx.strokeStyle = style;
      
      return this;
    },
    
    drawBoundingRadius: function drawBoundingRadius(ctx, color) {
      var position = this.position,
        style = ctx.strokeStyle;
      
      ctx.strokeStyle = color || this.color;
      
      ctx.beginPath();
      ctx.arc(position.x, position.y, this.boundingRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.strokeStyle = style;
      
      return this;
    },
    
    stroke: function stroke(ctx, color) {
      var position = this.position,
        w = this.halfExtents.x,
        h = this.halfExtents.y,
        style = ctx.strokeStyle;
    
      ctx.strokeStyle = color || this.color;
      
      ctx.strokeRect(position.x - w, position.y - h, w * 2, h * 2);
      
      ctx.strokeStyle = style;
      
      return this;
    },
    
    fill: function fill(ctx, color) {
      var position = this.position,
        w = this.halfExtents.x,
        h = this.halfExtents.y,
        style = ctx.fillStyle;
    
      ctx.fillStyle = color || this.color;
      
      ctx.fillRect(position.x - w, position.y - h, w * 2, h * 2);
      
      ctx.fillStyle = style;
      
      return this;
    },
    
    toString: function toString() {
      return "[AABBCollider]";
    }
    
  };
  
  
  function onScaleTo() {
    this.collider.rescale();
  }
  
  function onResetTransforms() {
    this.collider.resetTransforms();
  }
  
  function onRemove() {
    delete this.collider;
    
    this
      .off("scaleTo", onScaleTo)
      .off("resetTransforms", onResetTransforms)
      .off("removeComponent.AABBCollider", onRemove);
  }

  
  return function (options) {
    this.collider = new AABBCollider(this, options || {});

    this
      .on("scaleTo", onScaleTo)
      .on("resetTransforms", onResetTransforms)
      .on("removeComponent.AABBCollider", onRemove);
  };

});