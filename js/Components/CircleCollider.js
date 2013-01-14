GameObject.defineComponent("CircleCollider", function () {

  var v1 = new Vector2;
 
 
  function CircleCollider(parent, options) {
    this._width = options.width || 1;
    this._height = options.height || 1;
    
    this.boundingRadius = 0;
    
    this.scale = 1;
    
    this.offset = new Vector2(options.x || 0, options.y || 0);
    
    var position = new Vector2;
    Object.defineProperty(this, "position", {
      get: function get() {
        return position.copy(this.offset).multiplyScalar(this.scale).add(this.parent.position);
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
  
  CircleCollider.prototype = {
    
    constructor: CircleCollider,
    
    tag: "CircleCollider",
    
    scaleTo: function scaleTo(s) {
      this.scale = s;
      
      return this.rescale();
    },
    
    resize: function resize(w, h) {
      this._width = w;
      this._height = h;
      
      return this.rescale();
    },
    
    rescale: function rescale() {
      var w = this._width * 0.5 * this.parent.scale.x,
        h = this._height * 0.5 * this.parent.scale.y;
      
      this.boundingRadius = Math.sqrt(w * w + h * h) * Math.abs(this.scale);
      
      return this;
    },
    
    resetTransforms: function resetTransforms() {
      this.scale = 1;
      
      return this.rescale();
    },
    
    hover: function hover(x, y) {
      if (!this.enabled) return false;
    
      var position = this.position;
      
      if ((position.x - x) * (position.x - x) + (position.y - y) * (position.y - y) < 
        this.boundingRadius * this.boundingRadius) {
        
        if (this.hovered) {
          this.enableEvents && this.parent.emit("hover.stay", x, y);
        } else {
          this.hovered = true;
          this.enableEvents && this.parent.emit("hover.enter", x, y)
        }
        
        return true;
      }
      
      if (this.hovered) {
        this.hovered = false;
        this.enableEvents && this.parent.emit("hover.exit", x, y);
      }
      
      return false;
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

      var axis = other.position.sub(this.position),
        distance = axis.magnitude(),
        radii = this.boundingRadius + other.boundingRadius;

      if (distance < radii) {
        axis.multiplyScalar(1 / distance);
        
        if (this.colliding) {
          this.enableEvents && this.parent.emit("collision.stay", other, axis, distance - radii);
        } else {
          this.colliding = true;
          this.enableEvents && this.parent.emit("collision.enter", other, axis, distance - radii);
        }
        
        return true;
      }
      
      if (this.colliding) {
        this.colliding = false;
        this.enableEvents && this.parent.emit("collision.exit", other, axis.set(0, 0), 0);
      }
      
      return false;
    },
    
    collisionWithAABB: function collisionWithAABB(other) {
      if (!this.enabled || !other.enabled) return false;
      
      var position = this.position,
        other_position = other.position,
        v = v1.copy(position).sub(other_position),
        radii = this.boundingRadius + other.boundingRadius;
      
      if (radii * radii < v.x * v.x + v.y * v.y) {
        if (this.colliding) {
          this.colliding = false;
          this.enableEvents && this.parent.emit("collision.exit", other, v.set(0, 0), 0);
        }
        
        return false;
      }
      
      var w = other.halfExtents.x,
        h = other.halfExtents.y;

      if (v.x > w) other_position.x += w;
      else if (v.x < -w) other_position.x -= w;
      else other_position.x += v.x;

      if (v.y > h) other_position.y += h;
      else if (v.y < -h) other_position.y -= h;
      else other_position.y += v.y;
      
      other_position.sub(position);
      var sqrDistance = other_position.sqrMagnitude();
      
      if (sqrDistance < this.boundingRadius * this.boundingRadius) {
        v.multiplyScalar(-1 / v.magnitude());
      
        if (this.colliding) {
          this.enableEvents && this.parent.emit("collision.stay", other, v, Math.sqrt(sqrDistance) - this.boundingRadius);
        } else {
          this.colliding = true;
          this.enableEvents && this.parent.emit("collision.enter", other, v, Math.sqrt(sqrDistance) - this.boundingRadius);
        }
        
        return true;
      }
      
      if (this.colliding) {
        this.colliding = false;
        this.enableEvents && this.parent.emit("collision.exit", other, v.set(0, 0), 0);
      }
      
      return false;
    },
    
    collisionWithOBB: function collisionWithOBB(other) {
      if (!this.enabled || !other.enabled) return false;
      
      var position = this.position,
        other_position = other.position,
        v = v1.copy(position).sub(other_position),
        radii = this.boundingRadius + other.boundingRadius;
        
      if (radii * radii < v.x * v.x + v.y * v.y) {
        if (this.colliding) {
          this.colliding = false;
          this.enableEvents && this.parent.emit("collision.exit", other, v.set(0, 0), 0);
        }
        
        return false;
      }
      
      var w = other.halfExtents.x,
        h = other.halfExtents.y,
        axes = other.axes, 
        vDotAxis = 0;
        
      vDotAxis = v.x * axes[0] + v.y * axes[1];
      if (vDotAxis > w) vDotAxis = w;
      else if (vDotAxis < -w) vDotAxis = -w;

      other_position.x += axes[0] * vDotAxis;
      other_position.y += axes[1] * vDotAxis;
    
      vDotAxis = v.x * axes[2] + v.y * axes[3];
      if (vDotAxis > h) vDotAxis = h;
      else if (vDotAxis < -h) vDotAxis = -h;

      other_position.x += axes[2] * vDotAxis;
      other_position.y += axes[3] * vDotAxis;
      
      other_position.sub(position);
      var sqrDistance = other_position.sqrMagnitude();
      
      if (sqrDistance < this.boundingRadius * this.boundingRadius) {
        v.multiplyScalar(-1 / v.magnitude());
        
        if (this.colliding) {
          this.enableEvents && this.parent.emit("collision.stay", other, v, Math.sqrt(sqrDistance) - this.boundingRadius);
        } else {
          this.colliding = true;
          this.enableEvents && this.parent.emit("collision.enter", other, v, Math.sqrt(sqrDistance) - this.boundingRadius);
        }
        
        return true;
      }
      
      if (this.colliding) {
        this.colliding = false;
        this.enableEvents && this.parent.emit("collision.exit", other, v.set(0, 0), 0);
      }
      
      return false;
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
      
      var other_vertices = other.vertices,
        other_verticesLength = other_vertices.length,
        minimumSqrDistance = Number.POSITIVE_INFINITY, 
        x, y, sqrDistance, closestVertice;
        
      for (var i = 0; i < other_verticesLength; i += 2) {
        x = position.x - (other_vertices[i] + other_position.x);
        y = position.y - (other_vertices[i + 1] + other_position.y);
        sqrDistance = x * x + y * y;

        if (sqrDistance < minimumSqrDistance) {
          minimumSqrDistance = sqrDistance;
          closestVertice = i;
        }
      }
      
      x = position.x - (other_vertices[closestVertice] + other_position.x);
      y = position.y - (other_vertices[closestVertice + 1] + other_position.y);
      
      var im = 1 / Math.sqrt(x * x + y * y),
        axes = other.normals.slice(),
        n, axisDotOtherAxis;
      
      axes.push(x *= im, y *= im);
      
      for (i = axes.length - 2; 0 < i; i -= 2) {
        for (n = i - 2; -1 < n; n -= 2) {
          axisDotOtherAxis = axes[i] * axes[n] + axes[i + 1] * axes [n + 1];
          
          if (-0.99999 >= axisDotOtherAxis || 0.99999 <= axisDotOtherAxis) {
            axes.splice(n, 2), i -= 2;
          }
        }
      }
      
      var l = axes.length,
        positionDotAxis, other_positionDotAxis,
        other_verticeDotAxis, min, max, other_min, other_max,
        
        overlap,
        collisionDepth = this.boundingRadius,
        collisionNormal = v1;
      
      for (i = 0; i < l; i += 2) {
        x = axes[i], y = axes[i + 1];
        
        positionDotAxis = position.x * x + position.y * y;
        min = positionDotAxis - this.boundingRadius;
        max = positionDotAxis + this.boundingRadius;
        
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
    
    stroke: function stroke(ctx, color) {
      var position = this.position,
        style = ctx.strokeStyle;
      
      ctx.strokeStyle = color || this.color;

      ctx.beginPath();
      ctx.arc(position.x, position.y, this.boundingRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.strokeStyle = style;
      
      return this;
    },
    
    fill: function fill(ctx, color) {
      var position = this.position,
        style = ctx.fillStyle;
      
      ctx.fillStyle = color || this.color;

      ctx.beginPath();
      ctx.arc(position.x, position.y, this.boundingRadius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = style;
      
      return this;
    },
    
    toString: function toString() {
      return "[CircleCollider]";
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
      .off("removeComponent.CircleCollider", onRemove);
  }
  
  
  return function (options) {
    this.collider = new CircleCollider(this, options || {});
    
    this
      .on("scaleTo", onScaleTo)
      .on("resetTransforms", onResetTransforms)
      .on("removeComponent.CircleCollider", onRemove);
  };
  
});