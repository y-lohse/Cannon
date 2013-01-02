Cannon.registerPackage('Misc');

Cannon.Misc.Color = Cannon.ClassFactory.extend({
	/**
	polymorphic function. Accepts 4 numbers for rgba, 3 numbers for rgb, or a string. The string can be a css value, either rbga(); rgb() or ahexadecimal value
	*/
	__construct: function()
	{
		this.r = 0;
		this.g = 0;
		this.b = 0;
		this.a = 1;
		
		if (arguments.length == 4)
		{
			//rgba
			this.__fromRGBA(arguments[0], arguments[1], arguments[2], arguments[3]);
		}
		else if (arguments.length == 3)
		{
			//rgb
			this.__fromRGBA(arguments[0], arguments[1], arguments[2], 255);
		}
		else
		{
			//can be a lot of things.
			var col = arguments[0];
			if (Cannon.Utils.isString(col)) this.__fromString(col);
			else Cannon.Logger.log('Cannon.Color created with invalid arguments', Cannon.Logger.Warning);
		}
	},
	/**
	@private
	Returns the given number forced between 0 and 255
	@param (Integer) n
	@type Integer
	*/
	__colorify: function(n)
	{
		return (n >= 0 && n <= 255) ? parseInt(n) : Math.min(255, Math.max(0, parseInt(n)));
	},
	/**
	@private
	Returns the given number forced between 0 and 1
	@param (Float) n
	@type Float
	*/
	__alphaify: function(n)
	{
		return (n >= 0 && n <= 1) ? parseFloat(n) : Math.min(1, Math.max(0, parseFloat(n)));
	},
	/**
	@private
	Creates the rgba color based on the four params
	*/
	__fromRGBA: function(r, g, b, a)
	{
		this.r = this.__colorify(r);
		this.g = this.__colorify(g);
		this.b = this.__colorify(b);
		this.a = this.__alphaify(a);
	},
	/**
	@private
	Parses a string to extract a color out of it
	*/
	__fromString: function(s)
	{
		//parsing the color from the string
		if (s.match(/^rgba\([0-9]{1,3}[ ]*,[ ]*[0-9]{1,3}[ ]*,[ ]*[0-9]{1,3}[ ]*,[ ]*[0-9.]+\)$/))
		{
			var rgba = s.substring(5, s.length-1).split(',');
			this.__fromRGBA(rgba[0], rgba[1], rgba[2], rgba[3]);
		}
		else if (s.match(/^rgb\(([\d ]{1,3},){2}[\d ]{1,3}\)$/))
		{
			var rgb = s.substring(4, s.length-1).split(',');
			this.__fromRGBA(rgb[0], rgb[1], rgb[2], 1);
		}
		else if (s.match(/^#[\x00-\xFF]{3,6}$/))
		{
			if (s.length == 7)
			{
				this.r = this.__colorify(Cannon.Math.Utils.hexToDec(s.substring(1,3)));
				this.g = this.__colorify(Cannon.Math.Utils.hexToDec(s.substring(3,5)));
				this.b = this.__colorify(Cannon.Math.Utils.hexToDec(s.substring(5,7)));
				this.a = 1;
			}
			else if (s.length == 4)
			{
				this.r = this.__colorify(Cannon.Math.Utils.hexToDec(s.substring(1,2)+s.substring(1,2)));
				this.g = this.__colorify(Cannon.Math.Utils.hexToDec(s.substring(2,3)+s.substring(2,3)));
				this.b = this.__colorify(Cannon.Math.Utils.hexToDec(s.substring(3,4)+s.substring(3,4)));
				this.a = 1;
			}
		}
		else
		{
			Cannon.Logger.log('Cannon.Color created with an invalid string ('+s+')', Cannon.Logger.Warning);
		}
	},
	/**
	Converts this object into a plain color string
	*/
	generate: function()
	{
		return 'rgba('+this.r+', '+this.g+', '+this.b+', '+this.a+')';
	},
	toString: function()
	{
		return this.generate();
	}
});

/**
* Check if a string can be parsed as a color by Cannon.Color
*/
Cannon.Misc.Color.parsable = function(s)
{
	if (s.match(/^rgba\([0-9]{1,3}[ ]*,[ ]*[0-9]{1,3}[ ]*,[ ]*[0-9]{1,3}[ ]*,[ ]*[0-9.]+\)$/) ||
		s.match(/^rgb\(([\d ]{1,3},){2}[\d ]{1,3}\)$/) ||
		s.match(/^#[\x00-\xFF]{3,6}$/)) return true;
	else return false;
}

Cannon.Misc.Gradient = Cannon.ClassFactory.extend({
	/**
	@contructor
	Base class for gradients, just implements the common methods but cant be used
	*/
	__construct: function()
	{
		this.colorStops = [];
		this.__context = Cannon.Context.getInstance('2d');
	},
	/**
	Turns this object into a HTMLCanvasGradient
	*/
	generate: function()
	{
		return "#FFFFFF";
	},
	/**
	Adds a color stop
	@param (float) offset : the offset of the color stop, between 0 and 1
	@param (string | Cannon.Misc.Color
	@type Cannon.Misc.Gradient
	*/
	addColorStop: function(offset, color)
	{
		var color = (Cannon.Utils.instanceOf(color, Cannon.Misc.Color)) ? color : new Cannon.Misc.Color(color);
		
		this.colorStops.push({offset: offset, color: color});
		
		return this;
	},
	/**
	Removes a color stop
	@param (Float) offset
	@type Cannon.Misc.Color 
	*/
	removeColorStop: function(offset)
	{
		for (var i = 0, l = this.colorStops.length; i < l; i++)
		{
			if (this.colorStops[i].offset == offset)
			{
				this.colorStops = Cannon.Utils.arrayWithout(this.colorStops, this.colorStops[i]);
				break;
			}
		}
		
		return this;
	}
});

Cannon.Misc.LinearGradient = Cannon.Misc.Gradient.extend({
	/**
	@contructor
	A class to create simple Linear gradients
	@param (Float) size : the size in pixels of the gradient
	@param (Float) angle : the angle in degrees that the gradient is going to adopt
	*/
	__construct: function(size, angle)
	{
		this._super(false);
		this.size = size;
		this.angle = angle;
	},
	/**
	Turns this object into a HTMLCanvasGradient
	*/
	generate: function()
	{
		var startPoint = new Cannon.Math.Point2D();
		var endPoint = Cannon.Math.Point2D.polar(this.size, Cannon.Utils.degreesToRadians(this.angle));
		startPoint.x = -(endPoint.x/2);
		startPoint.y = -(endPoint.y/2);

		var gradient = this.__context.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);

		for (var i = 0; i < this.colorStops.length; i++)
		{
			gradient.addColorStop(this.colorStops[i].offset, this.colorStops[i].color);
		}

		return gradient;
	}
});

Cannon.Misc.RadialGradient = Cannon.Misc.Gradient.extend({
	/**
	@contructor
	Creates a simple radial gradient that expands from the center equally in all directions
	*/
	__construct: function(size)
	{
		this._super(false);
		this.center = new Cannon.Math.Point2D();
		this.size = size;
	},
	/**
	Turns this object into a HTMLCanvasGradient
	*/
	generate: function()
	{
		var gradient = this.__context.createRadialGradient(this.center.x, this.center.y, 0, this.center.x, this.center.y, this.size);

		for (var i = 0; i < this.colorStops.length; i++)
		{
			gradient.addColorStop(this.colorStops[i].offset, this.colorStops[i].color);
		}

		return gradient;
	}
});

Cannon.Misc.ComplexRadialGradient = Cannon.Misc.Gradient.extend({
	/**
	@contructor
	*/
	__construct: function(outerRadius, outerX, outerY, innerRadius, innerX, innerY)
	{
		this._super(false);
		innerX = innerX || 0;
		innerY = innerY || 0;
		innerRadius = innerRadius || 0;
		outerX = outerX || 0;
		outerY = outerY || 0;

		this.inner = new Cannon.Math.Point2D(innerX, innerY);
		this.innerRadius = innerRadius;
		this.outer = new Cannon.Math.Point2D(outerX, outerY);
		this.outerRadius = outerRadius;
	},
	/**
	Turns this object into a HTMLCanvasGradient
	*/
	generate: function()
	{
		var gradient = this.__context.createRadialGradient(this.inner.x, this.inner.y, this.innerRadius, this.outer.x, this.outer.y, this.outerRadius);

		for (var i = 0; i < this.colorStops.length; i++)
		{
			gradient.addColorStop(this.colorStops[i].offset, this.colorStops[i].color);
		}

		return gradient;
	}
});

Cannon.Misc.Pattern = Cannon.ClassFactory.extend({
	/**
	@constructor
	Creates a pattern
	@param (String) image : the path to the source image for the canvas
	@param (String) repeat : the repetition mode
	*/
	__construct: function(image, repeat)
	{
		this.__context = Cannon.Context.getInstance('2d');
		this.repeat = repeat || Cannon.Context.Repeat.Repeat;
		this.loaded = false;
		
		if (Cannon.Utils.instanceOf(image, HTMLImageElement) ||
			Cannon.Utils.instanceOf(image, HTMLCanvasElement) ||
			Cannon.Utils.instanceOf(image, HTMLVideoElement)) this.image = image;
		else
		{
			var img = new Image();
			var p = this;
			img.onerror = function(){
				Cannon.Logger.log('Failed loading '+image+' as a pattern', Cannon.Logger.Warning);
				p.loaded = false;
			}
			img.onload = function(){
				p.loaded = true;
			}
			img.src = image;
			this.image = img;
		}
	},
	/**
	Turns this object into a HTMLCanvasPattern
	*/
	generate: function()
	{
		if (this.loaded) return this.__context.createPattern(this.image, this.repeat);
	}
});

Cannon.Misc.Tween = {
	queues: {
		'__default': []
	},
	interval: 15,
	create: function(object, options, duration, callback, effect){
		//converting arguments
		options = options || {};//this wouldnt make any sens but well...
		var defaultspeed = 400;
		switch (typeof duration){
			case 'number':
				break;
			case 'function':
				callback = duration;
				duration = defaultspeed;
				break;
			case 'string':
				callback = Cannon.v;
				effect = duration;
				duration = defaultspeed;
				break;
			case 'undefined':
			default:
				duration = defaultspeed;
				break;
		}
		switch (typeof callback){
			case 'function':
				break;
			case 'string':
				effect = callback;
				callback = Cannon.v;
				break;
			case 'undefined':
			default:
				callback = Cannon.v;
				break;
		}
		effect = (Cannon.Utils.isString(effect)) ? Cannon.Misc.Tween.effects[effect]: Cannon.Misc.Tween.effects['easeOutQuad'];
		
		//this one is realy private
		function createTween(object, interval, options, effect, callback){
			var tween = {};
			tween.object = object;
			tween.interval = interval;
			tween.totalSteps = duration/tween.interval;
			tween.currentStep = 0;
			tween.options = options;
			tween.effect = effect;
			tween.callback = callback;
			
			tween.launch = function(){
				//convert properties
				//this is done at launch time in case of relative modifiers
				this.properties = [];
				for (var property in options){
					var prop = {};
					prop.name = property;
					prop.start = object[property];
					
					//absolute value
					if (Cannon.Utils.isNumber(options[property]) && Cannon.Utils.isNumber(object[property])){
						prop.end = options[property]-prop.start;
					}
					//+=
					else if (options[property].toString().indexOf('+=') == 0 && Cannon.Utils.isNumber(object[property])){
						var dif = parseFloat(options[property].toString().substring(2));
						prop.end = (object[property]+dif)-prop.start;
					}
					//-=
					else if (options[property].toString().indexOf('-=') == 0 && Cannon.Utils.isNumber(object[property]))
					{
						var dif = parseFloat(options[property].toString().substring(2));
						prop.end = (object[property]-dif)-prop.start;
					}
					//current obejct property is a Cannon.Color
					else if (Cannon.Utils.instanceOf(object[property], Cannon.Misc.Color)){
						//convert the end property to a Cannon.Color
						var color;
						if (Cannon.Utils.instanceOf(options[property], Cannon.Misc.Color)) color = options[property];
						else if (Cannon.Misc.Color.parsable(options[property])) color = new Cannon.Misc.Color(options[property]);
						
						color.r = color.r-prop.start.r;
						color.g = color.g-prop.start.g;
						color.b = color.b-prop.start.b;
						color.a = color.a-prop.start.a;
						
						prop.end = color;
					}
					//current object is a color string
					else if (Cannon.Utils.isString(object[property]) && Cannon.Misc.Color.parsable(object[property]))
					{
						//convert the start property
						prop.start = new Cannon.Misc.Color(object[property]);
						
						//convert the end property to a Cannon.Color
						var color;
						if (Cannon.Utils.instanceOf(options[property], Cannon.Misc.Color)) color = options[property];
						else if (Cannon.Misc.Color.parsable(options[property])) color = new Cannon.Misc.Color(options[property]);
						
						color.r = color.r-prop.start.r;
						color.g = color.g-prop.start.g;
						color.b = color.b-prop.start.b;
						color.a = color.a-prop.start.a;
						
						prop.end = color;
					}
					
					if (!Cannon.Utils.isUndefined(prop.end))  tween.properties.push(prop);
				}
				this.step();
			}
			tween.step = function(){
				this.stepper = setTimeout(Cannon.Utils.bind(Cannon.Misc.Tween.step, Cannon.Misc.Tween, this), this.interval);
			};
			tween.abort = function(){
				clearTimeout(this.stepper);
				if (this.queue) this.queue = Cannon.Utils.arrayWithout(this.queue, tween);
			};
			
			return tween;
		}
		
		var tween = createTween(object, this.interval, options, effect, callback);
		
		//queue checking
		if (options.queue === false) tween.launch();
		else{
			//queue, but where
			if (Cannon.Utils.isUndefined(options.queue)) queue = Cannon.Misc.Tween.queues['__default'];//default queue
			else{
				//custom queue
				if (Cannon.Utils.isUndefined(Cannon.Misc.Tween.queues[options.queue])) Cannon.Misc.Tween.queues[options.queue] = [];
				queue = Cannon.Misc.Tween.queues[options.queue];
			}
			//add to the queue
			queue.push(tween);
			tween.queue = queue;//couplage :/
			this.__startTweens(queue);
		}
		
		return tween;
	},
	__startTweens: function(queue){
		var started = [];
		for (var i = 0, l = queue.length; i < l; i++){
			if (!Cannon.Utils.isUndefined(queue[i].stepper)){
				started.push(queue[i].object);
			}
			else if (started.indexOf(queue[i].object) < 0) {
				queue[i].launch();
				started.push(queue[i].object);
			}
		}
	},
	step: function(tween){	
		for (var i = 0, l = tween.properties.length; i < l; i++){
			var newValue = null;
			var property = tween.properties[i];
			if (Cannon.Utils.isNumber(property.start)){
				//newValue = property.start+((property.end-property.start)*realpos);
				newValue = tween.effect(tween.currentStep, property.start, property.end, tween.totalSteps);
			}
			else if (Cannon.Utils.instanceOf(property.start, Cannon.Misc.Color) && Cannon.Utils.instanceOf(property.end, Cannon.Misc.Color)){
				var r = parseInt(tween.effect(tween.currentStep, property.start.r, property.end.r, tween.totalSteps));
				var g = parseInt(tween.effect(tween.currentStep, property.start.g, property.end.g, tween.totalSteps));
				var b = parseInt(tween.effect(tween.currentStep, property.start.b, property.end.b, tween.totalSteps));
				var a = parseFloat(tween.effect(tween.currentStep, property.start.a, property.end.a, tween.totalSteps));
				
				newValue = new Cannon.Misc.Color(r,g,b,a);
			}
			
			tween.object[property.name] = newValue;
		}
		
		if(tween.currentStep < tween.totalSteps){
			tween.currentStep++;
			tween.step();
		}
		else {
			tween.callback(tween.object);
			if (tween.queue){
				tween.queue = Cannon.Utils.arrayWithout(tween.queue, tween);
				this.__startTweens(tween.queue);
			}
		}
	},
	effects: {
		linear: function(now, start, end, dur){
			return start+end*now/dur;;
		},
		easeInQuad: function (now, start, end, dur) {
			return end*(now/=dur)*now + start;
		},
		easeOutQuad: function (now, start, end, dur) {
			return -end *(now/=dur)*(now-2) + start;
		},
		easeInOutQuad: function (now, start, end, dur) {
			if ((now/=dur/2) < 1) return end/2*now*now + start;
			return -end/2 * ((--now)*(now-2) - 1) + start;
		},
		easeInCubic: function (now, start, end, dur) {
			return end*(now/=dur)*now*now + start;
		},
		easeOutCubic: function (now, start, end, dur) {
			return end*((now=now/dur-1)*now*now + 1) + start;
		},
		easeInOutCubic: function (now, start, end, dur) {
			if ((now/=dur/2) < 1) return end/2*now*now*now + start;
			return end/2*((now-=2)*now*now + 2) + start;
		},
		easeInQuart: function (now, start, end, dur) {
			return end*(now/=dur)*now*now*now + start;
		},
		easeOutQuart: function (now, start, end, dur) {
			return -end * ((now=now/dur-1)*now*now*now - 1) + start;
		},
		easeInOutQuart: function (now, start, end, dur) {
			if ((now/=dur/2) < 1) return end/2*now*now*now*now + start;
			return -end/2 * ((now-=2)*now*now*now - 2) + start;
		},
		easeInQuint: function (now, start, end, dur) {
			return end*(now/=dur)*now*now*now*now + start;
		},
		easeOutQuint: function (now, start, end, dur) {
			return end*((now=now/dur-1)*now*now*now*now + 1) + start;
		},
		easeInOutQuint: function (now, start, end, dur) {
			if ((now/=dur/2) < 1) return end/2*now*now*now*now*now + start;
			return end/2*((now-=2)*now*now*now*now + 2) + start;
		},
		easeInSine: function (now, start, end, dur) {
			return -end * Math.cos(now/dur * (Math.PI/2)) + end + start;
		},
		easeOutSine: function (now, start, end, dur) {
			return end * Math.sin(now/dur * (Math.PI/2)) + start;
		},
		easeInOutSine: function (now, start, end, dur) {
			return -end/2 * (Math.cos(Math.PI*now/dur) - 1) + start;
		},
		easeInExpo: function (now, start, end, dur) {
			return (now==0) ? start : end * Math.pow(2, 10 * (now/dur - 1)) + start;
		},
		easeOutExpo: function (now, start, end, dur) {
			return (now==dur) ? start+end : end * (-Math.pow(2, -10 * now/dur) + 1) + start;
		},
		easeInOutExpo: function (now, start, end, dur) {
			if (now==0) return start;
			if (now==dur) return start+end;
			if ((now/=dur/2) < 1) return end/2 * Math.pow(2, 10 * (now - 1)) + start;
			return end/2 * (-Math.pow(2, -10 * --now) + 2) + start;
		},
		easeInCirc: function (now, start, end, dur) {
			return -end * (Math.sqrt(1 - (now/=dur)*now) - 1) + start;
		},
		easeOutCirc: function (now, start, end, dur) {
			return end * Math.sqrt(1 - (now=now/dur-1)*now) + start;
		},
		easeInOutCirc: function (now, start, end, dur) {
			if ((now/=dur/2) < 1) return -end/2 * (Math.sqrt(1 - now*now) - 1) + start;
			return end/2 * (Math.sqrt(1 - (now-=2)*now) + 1) + start;
		},
		easeInElastic: function (now, start, end, dur) {
			var s=1.70158;var p=0;var a=end;
			if (now==0) return start; if ((now/=dur)==1) return start+end; if (!p) p=dur*.3;
			if (a < Math.abs(end)) { a=end; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (end/a);
			return -(a*Math.pow(2,10*(now-=1)) * Math.sin( (now*dur-s)*(2*Math.PI)/p )) + start;
		},
		easeOutElastic: function (now, start, end, dur) {
			var s=1.70158;var p=0;var a=end;
			if (now==0) return start; if ((now/=dur)==1) return start+end; if (!p) p=dur*.3;
			if (a < Math.abs(end)) { a=end; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (end/a);
			return a*Math.pow(2,-10*now) * Math.sin( (now*dur-s)*(2*Math.PI)/p ) + end + start;
		},
		easeInOutElastic: function (now, start, end, dur) {
			var s=1.70158;var p=0;var a=end;
			if (now==0) return start; if ((now/=dur/2)==2) return start+end; if (!p) p=dur*(.3*1.5);
			if (a < Math.abs(end)) { a=end; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (end/a);
			if (now < 1) return -.5*(a*Math.pow(2,10*(now-=1)) * Math.sin( (now*dur-s)*(2*Math.PI)/p )) + start;
			return a*Math.pow(2,-10*(now-=1)) * Math.sin( (now*dur-s)*(2*Math.PI)/p )*.5 + end + start;
		},
		easeInBack: function (now, start, end, dur, s) {
			if (s == undefined) s = 1.70158;
			return end*(now/=dur)*now*((s+1)*now - s) + start;
		},
		easeOutBack: function (now, start, end, dur, s) {
			if (s == undefined) s = 1.70158;
			return end*((now=now/dur-1)*now*((s+1)*now + s) + 1) + start;
		},
		easeInOutBack: function (now, start, end, dur, s) {
			if (s == undefined) s = 1.70158;
			if ((now/=dur/2) < 1) return end/2*(now*now*(((s*=(1.525))+1)*now - s)) + start;
			return end/2*((now-=2)*now*(((s*=(1.525))+1)*now + s) + 2) + start;
		},
		easeInBounce: function (now, start, end, dur) {
			return end - Cannon.Tween.effects.easeOutBounce(dur-now, 0, end, dur) + start;
		},
		easeOutBounce: function (now, start, end, dur) {
			if ((now/=dur) < (1/2.75)) {
				return end*(7.5625*now*now) + start;
			} else if (now < (2/2.75)) {
				return end*(7.5625*(now-=(1.5/2.75))*now + .75) + start;
			} else if (now < (2.5/2.75)) {
				return end*(7.5625*(now-=(2.25/2.75))*now + .9375) + start;
			} else {
				return end*(7.5625*(now-=(2.625/2.75))*now + .984375) + start;
			}
		},
		easeInOutBounce: function (now, start, end, dur) {
			if (now < dur/2) return Cannon.Tween.effects.easeInBounce (now*2, 0, end, dur) * .5 + start;
			return Cannon.Tween.effects.easeOutBounce (now*2-dur, 0, end, dur) * .5 + end*.5 + start;
		}
	}
};


Cannon.Misc.WebWorker = Cannon.ClassFactory.extend({
	__construct: function(source, callback){
		this.worker = null;
		this.workberBase = "self.addEventListener('message',function(event){var args = event.data.args; var context = event.data.context || this; var ret = userFunction.apply(context, args);postMessage(ret);}, false);";
		this.workberBase += "var userFunction = ";
		this.callback = (callback || Cannon.v);
		this.blobUrl = '';
		
		if (!Cannon.Utils.isUndefined(source)) this.setup(source);
	},
	setup: function(source){
		this.source = source;
		
		if (Cannon.Utils.isFunction(source)){
			var blob = new Blob([this.workberBase+source.toString()]);
			this.blobUrl = window.URL.createObjectURL(blob);
		}
		else {
			Cannon.Logger.log('Cannon WebWorker has to be setup with a function, other types are not currently supported', Cannon.Logger.Warning);
		}
		
		this.worker = new Worker(this.blobUrl);
		this.worker.addEventListener('message', Cannon.Utils.bind(this.__onMessage, this), false);
		this.worker.addEventListener('error', Cannon.Utils.bind(this.__onError, this), false);
	},
	setCallback: function(callback){
		if (Cannon.Utils.isFunction(callback)) this.callback = callback;
	},
	process: function(){
		//copy arguments over
		var args = [];
		for (var i = 0, l = arguments.length; i < l; i++) args.push(arguments[i]);
		
		this.postMessage({args: args});
	},
	processFromContext:function(args, context){
		//@TODO : jsonify context functions ?
		this.postMessage({args: args, context: context});
	},
	postMessage: function(args){
		return this.worker.postMessage(args);
	},
	terminate: function(){
		return this.worker.terminate();
	},
	__onMessage: function(event){
		this.callback(event.data);
	},
	__onError: function(event){
		var msg = 'Webworker crashed with the following error : '+event.message+' (line '+event.lineno+')';
		Cannon.Logger.log(msg, Cannon.Logger.Warning);
	},
	clone: function(){
		var worker = new Cannon.Misc.WebWorker();
		worker.setup(this.source);
		worker.setCallback(this.callback);
		return worker;
	}
});

Cannon.Misc.WebWorkerFarm = Cannon.ClassFactory.extend({
	__construct: function(amount, source, callback){
		this.workerAmount = amount || 4;
		this.workers = [];
		this.busy = [];
		this.__createWorkers();
		this.callback = (callback || Cannon.v);
		
		this.loops = 0;
		this.args = [0];
		this.results = [];
		
		if (!Cannon.Utils.isUndefined(source)) this.setup(source);
	},
	__createWorkers: function(){
		for(var i = 0, l = this.workerAmount; i < l; i++){	
			var worker = new Cannon.Misc.WebWorker();
			worker.setCallback(Cannon.Utils.bind(this.__onMessage, this, i));
			this.workers.push(worker);
			this.busy.push(false);
		}
	},
	setup: function(fn){
		for (var i = 0, l = this.workers.length; i < l; i++){
			this.workers[i].setup(fn);
		}
	},
	setCallback: function(callback){
		if (Cannon.Utils.isFunction(callback)) this.callback = callback;
	},
	loop: function(loops, args){
		args = args || [];
		this.args = this.args.concat(args);
		this.loops = loops;
		
		for (var i = 0, l = Math.min(this.loops, this.workers.length); i < l; i++){
			this.launchNextWorker();
		}
	},
	launchNextWorker: function(){
		if (this.args[0] >= this.loops){
			for (var i = 0, l = this.workers.length; i < l; i++){
				if (this.busy[i] !== false) return;
			}
			return this.done();
		}
		else {
			for (var i = 0, l = this.workers.length; i < l; i++){
				if (this.busy[i] === false){
					this.launchWorker(i);
					break;
				}
			}
		}
	},
	launchWorker: function(workerIndex){
		this.workers[workerIndex].postMessage({args: this.args});
		this.busy[workerIndex] = this.args[0];
		this.args[0]++;
	},
	__onMessage: function(workerIndex, data){
		this.results[this.busy[workerIndex]] = data;
		this.busy[workerIndex] = false;
		this.launchNextWorker();
	},
	done: function(){
		this.callback(this.results);
	},
});