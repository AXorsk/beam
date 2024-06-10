/* library head */
(function(target, name) {
	/* SmallPRNG library for JavaScript.
	 * Not special, not optimized, not perfect.
	 * It produces pseudo-random numbers by manipulating a context which was initialized with a seed.
	 */

	// maximum randval for .random([max/min [, max]])
	var RMAX = 0x7FFFFFFF;
	
	var floor = Math.floor,
			abs = Math.abs;
	 
	// 32-bits rotate
	var rot = function(x, k) {
		return (((x << k) & 0xffffffff) | (x >>> (32 - k)))>>>0;
	};
	
	// constructor for the context
	var SmallPRNG = function(seed) {
		this.a = 0xf1ea5eed;
		this.b = seed;
		this.c = seed;
		this.d = seed;
		this.s = 0;
	};
	
	// reseed the context
	SmallPRNG.prototype.seed = function(seed) {
		this.a = 0xf1ea5eed;
		this.b = seed;
		this.c = seed;
		this.d = seed;
		this.s = 0;
	};
	
	// reseed the context b, c and d fields
	SmallPRNG.prototype.seedAll = function(b, c, d) {
		this.a = 0xf1ea5eed;
		this.b = b;
		this.c = c;
		this.d = d;
		this.s = 0;
	};
	
	// get the next randval in the ctx
	SmallPRNG.prototype.randval = function() {
		// notice the >>>0, which is to get an unsigned integer.
		var e  = ((this.a - rot(this.b, 27)) & 0xffffffff)>>>0;
		this.a = ((this.b ^ rot(this.c, 17)) & 0xffffffff)>>>0;
		this.b = ((this.c + this.d) & 0xffffffff)>>>0;
		this.c = ((this.d + e) & 0xffffffff)>>>0;
		this.d = ((e + this.a) & 0xffffffff)>>>0;
		this.s++;
		return this.d;
	};
	
	// step `times' times in the CTX
	SmallPRNG.prototype.step = function(times) {
		times = (typeof(times) === "number" ? times : 1);
		if(times === 0) {
			times = 1;
		}
		
		for(var i = 0; i < times; i++) {
			var e  = ((this.a - rot(this.b, 27)) & 0xffffffff)>>>0;
			this.a = ((this.b ^ rot(this.c, 17)) & 0xffffffff)>>>0;
			this.b = ((this.c + this.d) & 0xffffffff)>>>0;
			this.c = ((this.d + e) & 0xffffffff)>>>0;
			this.d = ((e + this.a) & 0xffffffff)>>>0;
			this.s++;
		}
	};
	
	SmallPRNG.prototype.random = function() {
		var r = ((this.randval() % RMAX) / RMAX);
		switch(arguments.length) {
			// zero arguments, return the 0-1 random factor
			case 0: {
				return r;
			} break;
				
			// 1 argument (max val), return random between 1 and max
			case 1: {
				var u = arguments[0];
				if(u < 1) {
					console.log("upper limit invalid");
					return null;
				}
				
				return (floor(r * u) + 1);
				
			} break;
				
			// 2 arguments (min, max val), return random between min and max
			case 2: {
				var l = arguments[0];
				var u = arguments[1];
				
				if(l >= u) {
					console.log("upper limit invalid");
					return null;
				}
				
				return (floor(r * (u - l + 1)) + l);
			} break;
				
			default: {
				console.log("invalid amount of arguments");
			} break;
		}
		
		return null;
	};
	
	target[name] = SmallPRNG;
}(window, "SmallPRNG"));

// EventListener | CC0 | github.com/jonathantneal/EventListener
this.Element && Element.prototype.attachEvent && !Element.prototype.addEventListener && (function () {
	function addToPrototype(name, method) {
		Window.prototype[name] = HTMLDocument.prototype[name] = Element.prototype[name] = method;
	}

	// add
	addToPrototype("addEventListener", function (type, listener) {
		var
		target = this,
			listeners = target.addEventListener.listeners = target.addEventListener.listeners || {},
			typeListeners = listeners[type] = listeners[type] || [];

		// if no events exist, attach the listener
		if (!typeListeners.length) {
			target.attachEvent("on" + type, typeListeners.event = function (event) {
				var documentElement = target.document && target.document.documentElement || target.documentElement || { scrollLeft: 0, scrollTop: 0 };

				// polyfill w3c properties and methods
				event.currentTarget = target;
				event.pageX = event.clientX + documentElement.scrollLeft;
				event.pageY = event.clientY + documentElement.scrollTop;
				event.preventDefault = function () { event.returnValue = false };
				event.relatedTarget = event.fromElement || null;
				event.stopImmediatePropagation = function () { immediatePropagation = false; event.cancelBubble = true };
				event.stopPropagation = function () { event.cancelBubble = true };
				event.target = event.srcElement || target;
				event.timeStamp = +new Date;

				// create an cached list of the master events list (to protect this loop from breaking when an event is removed)
				for (var i = 0, typeListenersCache = [].concat(typeListeners), typeListenerCache, immediatePropagation = true; immediatePropagation && (typeListenerCache = typeListenersCache[i]); ++i) {
					// check to see if the cached event still exists in the master events list
					for (var ii = 0, typeListener; typeListener = typeListeners[ii]; ++ii) {
						if (typeListener == typeListenerCache) {
							typeListener.call(target, event);

							break;
						}
					}
				}
			});
		}

		// add the event to the master event list
		typeListeners.push(listener);
	});

	// remove
	addToPrototype("removeEventListener", function (type, listener) {
		var
		target = this,
			listeners = target.addEventListener.listeners = target.addEventListener.listeners || {},
			typeListeners = listeners[type] = listeners[type] || [];

		// remove the newest matching event from the master event list
		for (var i = typeListeners.length - 1, typeListener; typeListener = typeListeners[i]; --i) {
			if (typeListener == listener) {
				typeListeners.splice(i, 1);

				break;
			}
		}

		// if no events exist, detach the listener
		if (!typeListeners.length && typeListeners.event) {
			target.detachEvent("on" + type, typeListeners.event);
		}
	});

	// dispatch
	addToPrototype("dispatchEvent", function (eventObject) {
		var
		target = this,
			type = eventObject.type,
			listeners = target.addEventListener.listeners = target.addEventListener.listeners || {},
			typeListeners = listeners[type] = listeners[type] || [];

		try {
			return target.fireEvent("on" + type, eventObject);
		} catch (error) {
			if (typeListeners.event) {
				typeListeners.event(eventObject);
			}

			return;
		}
	});

	// CustomEvent
	Object.defineProperty(Window.prototype, "CustomEvent", {
		get: function () {
			var self = this;

			return function CustomEvent(type, eventInitDict) {
				var event = self.document.createEventObject(), key;

				event.type = type;
				for (key in eventInitDict) {
					if (key == 'cancelable'){
						event.returnValue = !eventInitDict.cancelable;
					} else if (key == 'bubbles'){
						event.cancelBubble = !eventInitDict.bubbles;
					} else if (key == 'detail'){
						event.detail = eventInitDict.detail;
					}
				}
				return event;
			};
		}
	});

	// ready
	function ready(event) {
		if (ready.interval && document.body) {
			ready.interval = clearInterval(ready.interval);

			document.dispatchEvent(new CustomEvent("DOMContentLoaded"));
		}
	}

	ready.interval = setInterval(ready, 1);

	window.addEventListener("load", ready);
})();

!this.CustomEvent && (function() {
	// CustomEvent for browsers which don't natively support the Constructor method
	window.CustomEvent = function CustomEvent(type, eventInitDict) {
		var event;
		eventInitDict = eventInitDict || {bubbles: false, cancelable: false, detail: undefined};

		try {
			event = document.createEvent('CustomEvent');
			event.initCustomEvent(type, eventInitDict.bubbles, eventInitDict.cancelable, eventInitDict.detail);
		} catch (error) {
			// for browsers which don't support CustomEvent at all, we use a regular event instead
			event = document.createEvent('Event');
			event.initEvent(type, eventInitDict.bubbles, eventInitDict.cancelable);
			event.detail = eventInitDict.detail;
		}

		return event;
	};
})();

;(function() {
	'use strict';

	// requestAnimationFrame polyfill
	window.requestAnimFrame = (function() {
		return window.requestAnimationFrame  ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
	})();  
	

	// Object.create polyfill
	if (!("create" in Object) || typeof(Object.create) !== "function") {
		Object.create = (function() {
			var Object = function() {};
			return function (prototype) {
				if (arguments.length > 1) {
					throw Error('Second argument not supported');
				}
				if (typeof prototype != 'object') {
					throw TypeError('Argument must be an object');
				}
				Object.prototype = prototype;
				var result = new Object();
				Object.prototype = null;
				return result;
			};
		})();
	}
}());

;(function() {
	'use strict';
	// Add a notImplemented method to Object, so that superclasses can call it to throw an error when
	// a method is called that is not implemented.
	/*
	if(!("notImplemented" in Object.prototype) || typeof(Object.prototype.notImplemented) !== "function") {
		var NotImplementedException = function NotImplementedException(message) {
			this.name = "NotImplementedException";
			this.message = message || "This method is not implemented."
		};

		Object.prototype.notImplemented = function(message) {
			throw new NotImplementedException(message);
		};
	}
	*/

	// The extend function, which is also wrapped in a method in Function.prototype
	function extend(original, ctor) {
		ctor.prototype = Object.create(original.prototype);
		ctor.parent = original;
		ctor.prototype.constructor = ctor;
		return ctor;
	};

	// A method for all Functions allowing simple extending
	if(!('extend' in Function.prototype) || typeof(Function.prototype.extend) !== "function") {
		Function.prototype.extend = function(ctor) {
			return extend(this, ctor);
		};
	}
}());

;(function(root) {
	'use strict';

	/* https://gist.githubusercontent.com/gre/1650294/raw/de846c55dc648df035af04b7d30b5cb9421d69d0/easing.js
	 * Easing Functions - inspired from http://gizma.com/easing/
	 * only considering the t value for the range [0, 1] => [0, 1]
	 */
	root.Easing = {
		// no easing, no acceleration
		linear: function (t) { return t },
		// accelerating from zero velocity
		easeInQuad: function (t) { return t*t },
		// decelerating to zero velocity
		easeOutQuad: function (t) { return t*(2-t) },
		// acceleration until halfway, then deceleration
		easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
		// accelerating from zero velocity 
		easeInCubic: function (t) { return t*t*t },
		// decelerating to zero velocity 
		easeOutCubic: function (t) { return (--t)*t*t+1 },
		// acceleration until halfway, then deceleration 
		easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
		// accelerating from zero velocity 
		easeInQuart: function (t) { return t*t*t*t },
		// decelerating to zero velocity 
		easeOutQuart: function (t) { return 1-(--t)*t*t*t },
		// acceleration until halfway, then deceleration
		easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
		// accelerating from zero velocity
		easeInQuint: function (t) { return t*t*t*t*t },
		// decelerating to zero velocity
		easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
		// acceleration until halfway, then deceleration 
		easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
	};
}(window));

;(function(root) {
	'use strict';

	if(!('Math' in root)) {
		root.Math = {};
	}

	if(!('Util' in root)) {
		root.Util = {};
	}

	var m = root.Math,
		u = root.Util;

	m.Tau = (m.PI * 2); // I respect Pi, but we often need Tau... 
	
	// map a value of range imin and imax to a range omin and omax.
	m.map = function map(value, imin, imax, omin, omax) {
		return ((value - imin) * (omax - omin) / (imax - imin) + omin);
	};
	
	// calculate the distance between two points
	m.dist = function dist(x1, y1, x2, y2) {
		var dx = (x1 - x2),
			dy = (y1 - y2);
		
		return Math.sqrt(dx * dx + dy * dy);
	};
	
	// test if and where two lines intersect. p0_x is the x-coordinate of point 1 of line 1, p1_x is point 2 of line 1, p2_x is point 1 of line 2 etc...
	m.lineIntersect = function(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
		if(!(that instanceof PointLine)) return null;

		var s1_x, s1_y, s2_x, s2_y, s, t;

		s1_x = p1_x - p0_x; s1_y = p1_y - p0_y;
		s2_x = p3_x - p2_x; s2_y = p3_y - p2_y;

		s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
		t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

		if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
			return {
				x: Math.floor(p0_x + (t * s1_x)),
				y: Math.floor(p0_y + (t * s1_y))
			};
		}

		return null;
	};
	
	// degrees to radians
	m.rad = function rad(deg) {
		return (deg * (Math.PI / 180));
	};

	// radians to degrees
	m.deg = function deg(rad) {
		return (rad * (180 / Math.PI));
	};
	
	// calculate the coordinates on the outer line of a circle, point is in degrees.
	m.pointOnCircle = function pointOnCircle(x, y, radius, point) {
		var xr = (x + (radius * Math.cos(m.rad(point))));
		var yr = (y + (radius * Math.sin(m.rad(point))));

		return {
			x: xr,
			y: yr
		};
	};

	/**
	  Calculate the next point on a straight line between to points,
	  where the point is determined by @arg p.
	  @arg x1 x-coord of start point
	  @arg y1 y-coord of start point
	  @arg x2 x-coord of end point
	  @arg y2 y-coord of end point
	  @arg p progress factor between 0 and 1 (a percentage)
	  @returns {Object} an object with x and y coordinates
	*/
	m.lineProgress = function lineProgress(x1, y1, x2, y2, p) {
		return {
			x: (x1 + (x2 - x1) * p),
			y: (y1 + (y2 - y1) * p)
		};
	};

	// random with minimum and maximum
	m.randInt = function randInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	// random with maximum
	m.mrandInt = function mrandInt(max) {
		return Math.floor(Math.random() * max);
	};

	// float random with minimum and maximum
	m.randFloat = function randFloat(min, max) {
		return (Math.random() * (max - min + 1)) + min;
	};

	// float random with maximum
	m.mrandFloat = function mrandFloat(max) {
		return (Math.random() * max);
	};
	
	// random -1 or 1.
	m.randSign = function randSign() {
		return (Math.random() > 0.5 ? -1 : 1);
	};
	
	/**
	 * scale a 2d size down according to a max width and height.
	 * @param   {Number} w  width of current size
	 * @param   {Number} h  height of current size
	 * @param   {Number} mw maximum width
	 * @param   {Number} mh maximum height
	 * @returns {Object} object containing scaled (and floored) width and height as `w' field and `h' field.
	 */
	m.scale = function scale(w, h, mw, mh) {
		var r, nw, nh;
		if(w > mw) {
			r  = (mw / w);
			nw = mw;
			nh = (r * h);
		}

		if(h > mh) {
			r  = (mh / h);
			nw = (r * w);
			nh = mh;
		}

		return {
			w: Math.floor(nw),
			h: Math.floor(nh)
		};
	};

	/**
	  Fit for easing functions with one argument `t' 
	  that accepts a time factor between 0 and 1 

	  @arg f easing function
	  @arg start start time in milliseconds
	  @arg duration duration in milliseconds
	  @returns {Number} the easer result. When the duration has passed, it always returns 1
	*/
	u.easer = function easer(f, start, duration) {
		var delta = (Date.now() - start),
			d = (delta / duration),
			e = f(d);

		if(delta >= duration) {
			e = 1;
		}

		return e;
	};

}(window));

;(function(root) {
	'use strict';

	/**
	 * ensure hexadecimal value s is two characters wide
	 * @param   {String} s the hexadecimal representation of a byte, generally coming from {@link padHex2 padHex2}
	 * @returns {String} always returns 2 bytes (two hexadecimal characters)
	 */
	var padHexSame = function(s) {
		if(s.length !== 2) {
			return s+s;
		}

		return s;
	};

	// simple pattern to match hexadecimal color values
	var HEX_PATTERN  = /\#([0-9a-f]{1,2})([0-9a-f]{1,2})([0-9a-f]{1,2})/i;

	/**
	 * Construct a new RGBA color object
	 * @param {Number} r     red-value
	 * @param {Number} g     green-value
	 * @param {Number} b     blue-value
	 * @param {Number} [a=1] alpha channel
	 */
	var RGBA = function(r, g, b, a) {
		a = a || 1;

		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	};

	/**
	 * Convert the current RGBA object to a CSS rgba color value
	 * @returns {String} css 3.0 compatible rgba color value
	 */
	RGBA.prototype.toString = function() {
		return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.a + ')';
	};

	/**
	 * Convert a hexadecimal color value to an RGBA object
	 * @param   {String} hex hexadecimal color value in the format #00ff00 or #0f0
	 * @returns {Object} RGBA color object
	 */
	RGBA.fromHex = function(hex) {
		if(typeof(hex) !== 'string') throw new TypeError("hexadecimal color must be a string");
		if(hex.length !== 4 && hex.length !== 7) {
			throw new TypeError("invalid hexadecimal format");
		}
		var color = new RGBA();
		var match = hex.match(HEX_PATTERN);
		if(match) {
			color.r = parseInt(padHexSame(match[1]), 16);
			color.g = parseInt(padHexSame(match[2]), 16);
			color.b = parseInt(padHexSame(match[3]), 16);
			color.a = 1;
		} else {
			throw new TypeError("invalid hexadecimal format");
		}

		return color;
	};
	
	/**
	 * calculate random RGB color
	 * @param   {Number} min minimum value for r, g and b
	 * @param   {Number} max maximum value for r, g and b
	 * @returns {RGB}    an RGB color instance
	 */
	RGBA.random = function(min, max) {
		return new RGBA(Math.randInt(min, max), Math.randInt(min, max), Math.randInt(min, max), 1);
	};

	/** 
	 * calculate and advanced random color
	 * @param   {Object} rmm random min/max description object
	 * @returns {RGB}    an RGB color instance
	 */
	RGBA.randomEx = function(rmm) {
		return new RGBA(
			Math.randInt(rmm.rmin, rmm.rmax),
			Math.randInt(rmm.gmin, rmm.gmax),
			Math.randInt(rmm.bmin, rmm.bmax),
			1
		);
	};
	

	// RGB color object
	var RGB = function(r, g, b) {
		this.r = r;
		this.g = g;
		this.b = b;
	};

	RGB.prototype.toString = function() {
		return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
	};
	
	/**
	 * Convert a hexadecimal color value to an RGBA object
	 * @param   {String} hex hexadecimal color value in the format #00ff00 or #0f0
	 * @returns {Object} RGBA color object
	 */
	RGB.fromHex = function(hex) {
		if(typeof(hex) !== 'string') throw new TypeError("hexadecimal color must be a string");
		if(hex.length !== 4 && hex.length !== 7) {
			throw new TypeError("invalid hexadecimal format");
		}
		var color = new RGB();
		var match = hex.match(HEX_PATTERN);
		if(match) {
			color.r = parseInt(padHexSame(match[1]), 16);
			color.g = parseInt(padHexSame(match[2]), 16);
			color.b = parseInt(padHexSame(match[3]), 16);
		} else {
			throw new TypeError("invalid hexadecimal format");
		}

		return color;
	};

	/**
	 * calculate random RGB color
	 * @param   {Number} min minimum value for r, g and b
	 * @param   {Number} max maximum value for r, g and b
	 * @returns {RGB}    an RGB color instance
	 */
	RGB.random = function(min, max) {
		return new RGB(Math.randInt(min, max), Math.randInt(min, max), Math.randInt(min, max));
	};

	/** 
	 * calculate and advanced random color
	 * @param   {Object} rmm random min/max description object
	 * @returns {RGB}    an RGB color instance
	 */
	RGB.randomEx = function(rmm) {
		return new RGB(
			Math.randInt(rmm.rmin, rmm.rmax),
			Math.randInt(rmm.gmin, rmm.gmax),
			Math.randInt(rmm.bmin, rmm.bmax)
		);
	};

	root.RGBA = RGBA;
	root.RGB = RGB;
}(window));

/* main body */
+(function (root) {
	"use strict";
	var Vector3D = function Vector3D(x, y, z) {
			this.set(x, y, z);
		},
		v3dp = Vector3D.prototype;

	v3dp.dot2d = function (x, y) {
		return this.x * x + this.y * y;
	};

	v3dp.dot3d = function (x, y, z) {
		return this.x * x + this.y * y + this.z * z;
	};

	v3dp.set = function (x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;

		return this;
	};

	v3dp.add = function (other) {
		if (typeof other === "number") {
			(this.x += other), (this.y += other), (this.z += other);
			return this;
		}
		(this.x += other.x), (this.y += other.y), (this.z += other.z);
		return this;
	};

	v3dp.sub = function (other) {
		if (typeof other === "number") {
			(this.x -= other), (this.y -= other), (this.z -= other);
			return this;
		}
		(this.x -= other.x), (this.y -= other.y), (this.z -= other.z);
		return this;
	};

	v3dp.mul = function (other) {
		if (typeof other === "number") {
			(this.x *= other), (this.y *= other), (this.z *= other);
			return this;
		}
		(this.x *= other.x), (this.y *= other.y), (this.z *= other.z);
		return this;
	};

	v3dp.div = function (other) {
		if (typeof other === "number") {
			(this.x /= other), (this.y /= other), (this.z /= other);
			return this;
		}
		(this.x /= other.x), (this.y /= other.y), (this.z /= other.z);
		return this;
	};

	v3dp.move = function (dest) {
		if (dest instanceof Vector3D) {
			(dest.x = this.x), (dest.y = this.y), (dest.z = this.z);
		}
		return this;
	};

	v3dp.within2d = function (bounds) {
		return this.x >= 0 && this.x < bounds.x && this.y >= 0 && this.y < bounds.y;
	};

	v3dp.wrap2d = function (bounds) {
		if (this.x > bounds.x) {
			this.x = 0;
			return true;
		}

		if (this.x < 0) {
			this.x = bounds.x;
			return true;
		}

		if (this.y > bounds.y) {
			this.y = 0;
			return true;
		}

		if (this.y < 0) {
			this.y = bounds.y;
			return true;
		}
	};

	v3dp.eq = function (other) {
		return (
			other instanceof Vector3D &&
			this.x === other.x &&
			this.y === other.y &&
			this.z === other.z
		);
	};

	v3dp.distance = function (other) {
		var dx = this.x - other.x,
			dy = this.y - other.y;

		return Math.sqrt(dx * dx + dy * dy);
	};

	v3dp.clone = function () {
		return new Vector3D(this.x, this.y, this.z);
	};

	root.Vector3D = Vector3D;
})(window);

+(function (root) {
	"use strict";
	// a simple non-optimized Perlin Simplex Noise. I wrote this
	// to understand Simplex Noise a bit more.

	// fully self-contained state, so you can influence the outcome
	// of each simplex noise state
	var Perlin = function Perlin() {
			this.grad3 = [
				new Vector3D(1, 1, 0),
				new Vector3D(-1, 1, 0),
				new Vector3D(1, -1, 0),
				new Vector3D(-1, -1, 0),
				new Vector3D(1, 0, 1),
				new Vector3D(-1, 0, 1),
				new Vector3D(1, 0, -1),
				new Vector3D(-1, 0, -1),
				new Vector3D(0, 1, 1),
				new Vector3D(0, -1, 1),
				new Vector3D(0, 1, -1),
				new Vector3D(0, -1, -1)
			];

			this.p = [
				0x97,
				0xa0,
				0x89,
				0x5b,
				0x5a,
				0x0f,
				0x83,
				0x0d,
				0xc9,
				0x5f,
				0x60,
				0x35,
				0xc2,
				0xe9,
				0x07,
				0xe1,
				0x8c,
				0x24,
				0x67,
				0x1e,
				0x45,
				0x8e,
				0x08,
				0x63,
				0x25,
				0xf0,
				0x15,
				0x0a,
				0x17,
				0xbe,
				0x06,
				0x94,
				0xf7,
				0x78,
				0xea,
				0x4b,
				0x00,
				0x1a,
				0xc5,
				0x3e,
				0x5e,
				0xfc,
				0xdb,
				0xcb,
				0x75,
				0x23,
				0x0b,
				0x20,
				0x39,
				0xb1,
				0x21,
				0x58,
				0xed,
				0x95,
				0x38,
				0x57,
				0xae,
				0x14,
				0x7d,
				0x88,
				0xab,
				0xa8,
				0x44,
				0xaf,
				0x4a,
				0xa5,
				0x47,
				0x86,
				0x8b,
				0x30,
				0x1b,
				0xa6,
				0x4d,
				0x92,
				0x9e,
				0xe7,
				0x53,
				0x6f,
				0xe5,
				0x7a,
				0x3c,
				0xd3,
				0x85,
				0xe6,
				0xdc,
				0x69,
				0x5c,
				0x29,
				0x37,
				0x2e,
				0xf5,
				0x28,
				0xf4,
				0x66,
				0x8f,
				0x36,
				0x41,
				0x19,
				0x3f,
				0xa1,
				0x01,
				0xd8,
				0x50,
				0x49,
				0xd1,
				0x4c,
				0x84,
				0xbb,
				0xd0,
				0x59,
				0x12,
				0xa9,
				0xc8,
				0xc4,
				0x87,
				0x82,
				0x74,
				0xbc,
				0x9f,
				0x56,
				0xa4,
				0x64,
				0x6d,
				0xc6,
				0xad,
				0xba,
				0x03,
				0x40,
				0x34,
				0xd9,
				0xe2,
				0xfa,
				0x7c,
				0x7b,
				0x05,
				0xca,
				0x26,
				0x93,
				0x76,
				0x7e,
				0xff,
				0x52,
				0x55,
				0xd4,
				0xcf,
				0xce,
				0x3b,
				0xe3,
				0x2f,
				0x10,
				0x3a,
				0x11,
				0xb6,
				0xbd,
				0x1c,
				0x2a,
				0xdf,
				0xb7,
				0xaa,
				0xd5,
				0x77,
				0xf8,
				0x98,
				0x02,
				0x2c,
				0x9a,
				0xa3,
				0x46,
				0xdd,
				0x99,
				0x65,
				0x9b,
				0xa7,
				0x2b,
				0xac,
				0x09,
				0x81,
				0x16,
				0x27,
				0xfd,
				0x13,
				0x62,
				0x6c,
				0x6e,
				0x4f,
				0x71,
				0xe0,
				0xe8,
				0xb2,
				0xb9,
				0x70,
				0x68,
				0xda,
				0xf6,
				0x61,
				0xe4,
				0xfb,
				0x22,
				0xf2,
				0xc1,
				0xee,
				0xd2,
				0x90,
				0x0c,
				0xbf,
				0xb3,
				0xa2,
				0xf1,
				0x51,
				0x33,
				0x91,
				0xeb,
				0xf9,
				0x0e,
				0xef,
				0x6b,
				0x31,
				0xc0,
				0xd6,
				0x1f,
				0xb5,
				0xc7,
				0x6a,
				0x9d,
				0xb8,
				0x54,
				0xcc,
				0xb0,
				0x73,
				0x79,
				0x32,
				0x2d,
				0x7f,
				0x04,
				0x96,
				0xfe,
				0x8a,
				0xec,
				0xcd,
				0x5d,
				0xde,
				0x72,
				0x43,
				0x1d,
				0x18,
				0x48,
				0xf3,
				0x8d,
				0x80,
				0xc3,
				0x4e,
				0x42,
				0xd7,
				0x3d,
				0x9c,
				0xb4
			];

			this.permutation = new Array(512);
			this.gradP = new Array(512);

			// skew and unskew factors for 2D or 3D, can be modified per state!
			this.F2 = 0.5 * (Math.sqrt(3) - 1);
			this.G2 = (3 - Math.sqrt(3)) / 6;
			this.F3 = 1 / 3;
			this.G3 = 1 / 6;
		},
		pp = Perlin.prototype;

	pp.init = function (prng) {
		if (typeof prng !== "function") {
			throw new TypeError(
				"prng needs to be a function returning an int between 0 and 255"
			);
		}

		for (var i = 0; i < 256; i += 1) {
			var randval = this.p[i] ^ prng();
			this.permutation[i] = this.permutation[i + 256] = randval;
			this.gradP[i] = this.gradP[i + 256] = this.grad3[
				randval % this.grad3.length
			];
		}
	};

	// I removed the pp.simplex2d function, because I don't need it in this project
	// pp.simplex2d = function(x, y) {};

	pp.simplex3d = function (x, y, z) {
		var n0,
			n1,
			n2,
			n3,
			i1,
			j1,
			k1,
			i2,
			j2,
			k2,
			x1,
			y1,
			z1,
			x2,
			y2,
			z2,
			x3,
			y3,
			z3,
			gi0,
			gi1,
			gi2,
			gi3,
			t0,
			t1,
			t2,
			t3,
			s = (x + y + z) * this.F3,
			i = Math.floor(x + s),
			j = Math.floor(y + s),
			k = Math.floor(z + s),
			t = (i + j + k) * this.G3,
			x0 = x - i + t,
			y0 = y - j + t,
			z0 = z - k + t;

		if (x0 >= y0) {
			if (y0 >= z0) {
				i1 = 1;
				j1 = 0;
				k1 = 0;
				i2 = 1;
				j2 = 1;
				k2 = 0;
			} else if (x0 >= z0) {
				i1 = 1;
				j1 = 0;
				k1 = 0;
				i2 = 1;
				j2 = 0;
				k2 = 1;
			} else {
				i1 = 0;
				j1 = 0;
				k1 = 1;
				i2 = 1;
				j2 = 0;
				k2 = 1;
			}
		} else {
			if (y0 < z0) {
				i1 = 0;
				j1 = 0;
				k1 = 1;
				i2 = 0;
				j2 = 1;
				k2 = 1;
			} else if (x0 < z0) {
				i1 = 0;
				j1 = 1;
				k1 = 0;
				i2 = 0;
				j2 = 1;
				k2 = 1;
			} else {
				i1 = 0;
				j1 = 1;
				k1 = 0;
				i2 = 1;
				j2 = 1;
				k2 = 0;
			}
		}

		(x1 = x0 - i1 + this.G3),
			(y1 = y0 - j1 + this.G3),
			(z1 = z0 - k1 + this.G3);
		(x2 = x0 - i2 + 2 * this.G3),
			(y2 = y0 - j2 + 2 * this.G3),
			(z2 = z0 - k2 + 2 * this.G3);
		(x3 = x0 - 1 + 3 * this.G3),
			(y3 = y0 - 1 + 3 * this.G3),
			(z3 = z0 - 1 + 3 * this.G3);

		(i &= 255), (j &= 255), (k &= 255);

		gi0 = this.gradP[i + this.permutation[j + this.permutation[k]]];
		gi1 = this.gradP[
			i + i1 + this.permutation[j + j1 + this.permutation[k + k1]]
		];
		gi2 = this.gradP[
			i + i2 + this.permutation[j + j2 + this.permutation[k + k2]]
		];
		gi3 = this.gradP[i + 1 + this.permutation[j + 1 + this.permutation[k + 1]]];

		t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
		t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
		t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
		t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
		n0 = t0 < 0 ? 0 : ((t0 *= t0), t0 * t0 * gi0.dot3d(x0, y0, z0));
		n1 = t1 < 0 ? 0 : ((t1 *= t1), t1 * t1 * gi1.dot3d(x1, y1, z1));
		n2 = t2 < 0 ? 0 : ((t2 *= t2), t2 * t2 * gi2.dot3d(x2, y2, z2));
		n3 = t3 < 0 ? 0 : ((t3 *= t3), t3 * t3 * gi3.dot3d(x3, y3, z3));

		return 32 * (n0 + n1 + n2 + n3);
	};

	root.Perlin = Perlin;
})(window);

var touchMode = 0;

(function (root) {
	"use strict";

	function Move(that, event) {
		if (event.pageX == null && event.clientX != null) {
			var eventDoc = (event.target && event.target.ownerDocument) || document;
			var doc = eventDoc.documentElement;
			var body = eventDoc.body;
			event.pageX =
				event.clientX +
				((doc && doc.scrollLeft) || (body && body.scrollLeft) || 0) -
				((doc && doc.clientLeft) || (body && body.clientLeft) || 0);
			event.pageY =
				event.clientY +
				((doc && doc.scrollTop) || (body && body.scrollTop) || 0) -
				((doc && doc.clientTop) || (body && body.clientTop) || 0);
		}

		that.position.x = event.pageX;
		that.position.y = event.pageY;
	}

	var MouseMonitor = function (element) {
		this.position = new Vector3D(0, 0, 0);
		this.state = { left: false, middle: false, right: false };
		this.element = element;

		var that = this;
		element.addEventListener("mousemove", function (event) {
			event = event || window.event;
			Move(that, event);

			return event.preventDefault();
		});
		element.addEventListener("contextmenu", function (event) {
			return event.preventDefault();
		});
		element.addEventListener("mousedown", function (event) {
			if (event.which === 1) that.state.left = true;
			if (event.which === 2) that.state.middle = true;
			if (event.which === 3) that.state.right = true;

			return event.preventDefault();
		});
		element.addEventListener("mouseup", function (event) {
			that.state.left = that.state.middle = that.state.right = false;

			return event.preventDefault();
		});

		element.addEventListener("touchmove", function (event) {
			event = event || window.event;
			Move(that, event.touches[0]);

			return event.preventDefault();
		});
		element.addEventListener("touchstart", function (event) {
			if (touchMode === 0) that.state.left = true;
			if (touchMode === 1) that.state.right = true;
			if (touchMode === 2) that.state.middle = true;

			return event.preventDefault();
		});
		element.addEventListener("touchend", function (event) {
			that.state.left = that.state.middle = that.state.right = false;

			return event.preventDefault();
		});
	};

	root.MouseMonitor = MouseMonitor;
})(window);

+(function (root) {
	"use strict";

	var Particle = function Particle(generator, bounds, rctx, mon) {
			this.p = new Vector3D(); // position
			this.t = new Vector3D(); // trail to
			this.v = new Vector3D(); // velocity
			this.g = generator; // simplex noise generator
			this.b = bounds; // window bounds for wrapping
			this.r = rctx; // random context
			this.m = mon; // mouse position monitor

			this.reset();
		},
		pp = Particle.prototype;

	pp.reset = function () {
		// new random position
		this.p.x = this.t.x = Math.floor(this.r.random() * this.b.x);
		this.p.y = this.t.y = Math.floor(this.r.random() * this.b.y);

		// reset velocity
		this.v.set(1, 1, 0);

		// iteration and life
		this.i = 0;
		this.l = this.r.random(1000, 10000); // life time before particle respawns
	};

	pp.step = function () {
		if (this.i++ > this.l) {
			this.reset();
		}

		var xx = this.p.x / 200,
			yy = this.p.y / 200,
			zz = Date.now() / 5000,
			a = this.r.random() * Math.Tau,
			rnd = this.r.random() / 4;

		// calculate the new velocity based on the noise
		// random velocity in a random direction
		this.v.x += rnd * Math.sin(a) + this.g.simplex3d(xx, yy, -zz); // sin or cos, no matter
		this.v.y += rnd * Math.cos(a) + this.g.simplex3d(xx, yy, zz); // opposite zz's matters

		if (this.m.state.left) {
			// add a difference between mouse pos and particle pos (a fraction of it) to the velocity.
			this.v.add(this.m.position.clone().sub(this.p).mul(0.00085));
		}

		// repulse the particles if the right mouse button is down and the distance between
		// the mouse and particle is below an arbitrary value between 200 and 250.
		if (
			this.m.state.right &&
			this.p.distance(this.m.position) < this.r.random(200, 250)
		) {
			this.v.add(this.p.clone().sub(this.m.position).mul(0.02));
		}

		// time dilation field, stuff moves at 10% here, depending on distance
		if (this.m.state.middle) {
			var d = this.p.distance(this.m.position),
				l = this.r.random(200, 250);

			if (d < l) {
				this.v.mul(d / l);
			}
		}

		// keep a copy of the current position, for a nice line between then and now and add velocity
		this.p.move(this.t).add(this.v.mul(0.94)); // slow down the velocity slightly

		// wrap around the edges
		if (this.p.wrap2d(this.b)) {
			this.p.move(this.t);
		}
	};

	// plot the line, but do not stroke yet.
	pp.render = function (context) {
		context.moveTo(this.t.x, this.t.y);
		context.lineTo(this.p.x, this.p.y);
	};

	root.Particle = Particle;
})(window);

window.addEventListener("load", function () {
	var rctx = new SmallPRNG(+new Date()), // random generator, see ref
		p = new Perlin(), // simplex noise generator
		canvas = document.getElementById("beam"),
		context = canvas.getContext("2d"),
		monitor = new MouseMonitor(canvas),
		gui = new dat.GUI(),
		hue = 0,
		particles = [],
		resize,
		width,
		height,
		bounds = new Vector3D(0, 0, 0),
		settings = {
			particleNum: 5000,
			fadeOverlay: true,
			rotateColor: false,
			staticColor: "#9a1aff"
		},
		buttons = {
			change: function () {
				touchMode = (touchMode + 1) % 3;
			}
		}

	// dat.gui stuff, 2 folders with a few properties
	var f1 = gui.addFolder("Particles"),
		f2 = gui.addFolder("Colors");
		f3 = gui.addFolder("Effects");

	f1.add(settings, "particleNum", 1000, 20000)
		.step(10)
		.name("Particles")
		.onChange(function () {
			if (settings.particleNum < particles.length) {
				var toDelete = particles.length - settings.particleNum;
				particles.splice(particles.length - toDelete, toDelete);
			} else {
				for (var i = particles.length; i < settings.particleNum; i += 1) {
					particles.push(new Particle(p, bounds, rctx, monitor));
				}
			}
		});

	f2.add(settings, "fadeOverlay")
		.name("Fade Clear")
		.onChange(function () {
			if (settings.fadeOverlay) {
				resize();
			}
		});

	f2.add(settings, "rotateColor").name("Rotate Color");
	f2.addColor(settings, "staticColor").name("Static Color");

	f3.add(buttons, "change").name("Change Mode");

	f1.open();
	f2.open();
	f3.open();
	gui.close();

	// seed perlin with random bytes from SmallPRNG
	p.init(function () {
		// called for each permutation (256 times)
		return rctx.random(0, 255);
	});

	resize = function () {
		// resize the canvas
		canvas.width = width = bounds.x = window.innerWidth;
		canvas.height = height = bounds.y = window.innerHeight;

		// remove this and see weird gorgeous stuffs, the history of particles.
		context.fillStyle = "#ffffff";
		context.fillRect(0, 0, width, height);
	};
	resize();

	window.addEventListener("resize", resize);

	// generate a few particles
	for (var i = 0; i < settings.particleNum; i += 1) {
		particles.push(new Particle(p, bounds, rctx, monitor));
	}

	+(function render() {
		requestAnimFrame(render);

		context.beginPath();
		// render each particle and trail
		for (var i = 0; i < particles.length; i += 1) {
			particles[i].step(), particles[i].render(context);
		}

		context.globalCompositeOperation = "source-over";
		if (settings.fadeOverlay) {
			context.fillStyle = "rgba(0, 0, 0, .085)";
		} else {
			context.fillStyle = "rgba(0, 0, 0, 1)";
		}
		context.fillRect(0, 0, width, height);

		context.globalCompositeOperation = "lighter";
		if (settings.rotateColor) {
			context.strokeStyle = "hsla(" + hue + ", 75%, 50%, .55)";
		} else {
			context.strokeStyle = settings.staticColor;
		}
		context.stroke();
		context.closePath();

		hue = (hue + 0.5) % 360;
	})();
});