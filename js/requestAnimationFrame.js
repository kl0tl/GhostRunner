!function () {
    var lastTime = 0,
		vendors = ["ms", "moz", "webkit", "o"];
		
    for (var i = 0; i < 4 && !this.requestAnimationFrame; i++) {
		this.requestAnimationFrame = this[vendors[i] + "RequestAnimationFrame"];
		this.cancelAnimationFrame = this[vendors[i] + "CancelAnimationFrame"]
			|| this[vendors[i] + "CancelRequestAnimationFrame"];
    }
 
    this.requestAnimationFrame || (this.requestAnimationFrame = function requestAnimationFrame(callback) {
		var now = +new Date,
			timeToCall = Math.max(0, 16 - (now - lastTime));
		
		lastTime = now + timeToCall;
		
		return setTimeout(function () { callback(now + timeToCall); }, timeToCall);
	});
	
	this.window.cancelAnimationFrame || (this.cancelAnimationFrame = function cancelAnimationFrame(id) {
		clearTimeout(id);
	});
}.call(window);