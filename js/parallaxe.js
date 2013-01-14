
// useless shit, cf ligne 59 pour les trucs intéressants
var canvas, ctx, stats;

var WIDTH = 800, HEIGHT = 600;

AssetsManager.root("images/");

AssetsManager.load([
		"layers.background.png"
	, "layers.level.png"
	, "layers.foreground1.png"
	, "layers.foreground2.png"
] , function () {
	canvas = document.createElement("canvas");
	ctx = canvas.getContext("2d");
	
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	
	canvas.id = "main-canvas";
	canvas.classList.add("center");

	document.body.appendChild(canvas);

	stats = new Stats;
	stats.setMode(0);

	// définition de la camera, accessible via GameObject("Camera")
	// GameObject("Camera").target = GameObject("Lutin")
	// GameObject("Camera").follow = true
	// GameObject("Camera").lockAxisY = true
	//on règle la vélocité des layers par rapport à celle du lutin et NORMALEMENT on a une camera qui se déplace avec du parallaxe sur les layers
	var camera = GameObject.create({
		// gameObject que doit suivre la camera
			target: null
		// indique si la camera doit suivre les mouvements de la target
		, follow: true
		// si true lock les mouvements de la camera sur l'axe x
		, lockAxisX: false
		// si true lock les mouvements de la camera sur l'axe y
		, lockAxisY: true
		// vitesse de déplacement de la camera sur les axes x et y (useless ?)
		, velocity: new Vector2()
		// background de la camera
		, background: AssetsManager.get("background.png")
		
		// gameObjects visibles dans le viewport définis par la position et les dimensions du collider de la camera
		, _visibleGameObjects: []
		// layers affichés par dessus le background de la camera
		, _layers: []

		// actualise et retourne l'array _visibleGameObjects
		, findVisibleGameObjects: function () {
			var gameObjects = GameObject()
				, cameraPosition = this.collider.position
				, cameraWidth = this.collider.halfExtents.x * 2
				, cameraHeight = this.collider.halfExtents.y * 2;

			this._visibleGameObjects.length = 0;

			for (var i = 0, g; g = gameObjects[i]; i += 1) {
				if (this === g) continue;
				if (g.collider) {
					if (this.collider.collision(g.collider)) {
						this._visibleGameObjects.push(g);
					}
				} else {
					if (g.position.x < cameraPosition.x) continue;
					if (g.position.x > cameraPosition.x + cameraWidth) continue;
					if (g.position.y < cameraPosition.y) continue;
					if (g.position.y > cameraPosition.y + cameraHeight) continue;
					this._visibleGameObjects.push(g);
				}
			}

			return this._visibleGameObjects;
		}
		// useless
		, getLayer: function (index) {
			return this._layers[index];
		}
		// push un nouveau layer dans l'array _layers
		, addLayer: function (source, velocityX, velocityY) {
			var layer = {
					source: source
				, position: new Vector2()
				, velocity: new Vector2(velocityX, velocityY)
			};
			
			this._layers.push(layer);
			
			return layer;
		}
		// useless
		, removeLayer: function (index) {
			return this._layers.splice(index, 1);
		}
	}).setTag("Camera")
		.addComponent("AABBCollider", {width: WIDTH, height: HEIGHT})
		.on("update", function (dt) {
			// actualise l'array _visiblesGameObjects
			this.findVisibleGameObjects();
			
			// actualise la position de la camera en fonction de la position de la target et des axes lockés si la camera est en mode follow
			if (this.target && this.follow) {
				if (!this.lockAxisX) this.localPosition.x = this.target.position.x;
				if (!this.lockAxisY) this.localPosition.y = this.target.position.y;
			}
			
			// actualise la position de la camera en fonction de sa vélocité et des axes lockés 
			if (!this.lockAxisX) this.localPosition.x += this.velocity.x * dt;
			if (!this.lockAxisY) this.localPosition.y += this.velocity.y * dt;
			
			// actualise la position des layers en fonction de leur vélocité
			for (var i = 0, layer; layer = this._layers[i]; i += 1) {
				layer.position.x += layer.velocity.x * dt;
				layer.position.y += layer.velocity.y * dt;
			}
		})
		.on("draw", function (ctx) {
			var cameraPosition = this.collider.position
				, cameraWidth = this.collider.halfExtents.x * 2
				, cameraHeight = this.collider.halfExtents.y * 2
				, layerX, layerY, layerWidth, layerHeight, destinationX, destinationY;
			
			// dessine la partie du background visible par le viewport définis par la position et les dimensions du collider de la camera
			if (this.background) ctx.drawImage(this.background, cameraPosition.x, cameraPosition.y, cameraWidth, cameraHeight, 0, 0, cameraWidth, cameraHeight);
			
			// dessine les layers en les répétant en x et en y pour couvrir toute la surface visible par le viewport de la camera
			for (var i = 0, layer; layer = this._layers[i]; i += 1) {
				layerWidth = layer.source.width;
				layerHeight = layer.source.height;
				
				if (0 < (layerX = layer.position.x)) layerX = layerX - Math.ceil(layerX / layerWidth) * layerWidth;
				else layerX = layerX - Math.ceil(layerX / layerWidth) * layerWidth;
				
				if (0 < (layerY = layer.position.y)) layerY = layerY - Math.ceil(layerY / layerHeight) * layerHeight;
				else layerY = layerY - Math.ceil(layerY / layerHeight) * layerHeight;
				
				destinationX = layerX;
				while (destinationX < cameraWidth) {
					destinationY = layerY;
					while (destinationY < cameraHeight) {
						ctx.drawImage(layer.source, destinationX, destinationY);
						destinationY += layerHeight;
					}
					destinationX += layerWidth;
				}
			}
		});

	// ajout des layers et de leur vélocité
	camera.addLayer(AssetsManager.get("layers.background.png"), -2.5, 0);
	//camera.addLayer(AssetsManager.get("layers.level.png"), 5, 0);
	//camera.addLayer(AssetsManager.get("layers.foreground1.png"), 10, 0);
	camera.addLayer(AssetsManager.get("layers.foreground2.png"), -10, 0);

	// useless shit again
	requestAnimationFrame(loop);
});

function render(ctx) {
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
	GameObject.draw(ctx);
}

function loop() {
	requestAnimationFrame(loop);
	
	GameObject.update();
	render(ctx);
	
	stats.update();
}