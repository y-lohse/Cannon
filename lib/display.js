Cannon.registerPackage('Display');

/**
A basic rectangle
*/
Cannon.Display.Rectangle = Cannon.DisplayObject.extend({
	/**
	@constructor
	@param (Number) x The x coordonate of the rectangle, relative to its parent
	@param (Number) y The y coordonate of the rectangle, relative to its parent
	@param (Number) width The width of the rectangle
	@param (Number) height The height of the rectangle
	*/
	__construct: function(x, y, width, height){
		this._super(false);
		this.x = (x || 0);
		this.y = (y || 0);
		this.width = (width || 50);
		this.height = (height || 50);
		
		this.center = [this.width/2, this.height/2];
	},
	__render: function(ctx, heritage){	
		Cannon.Event.fire(this.__eventElement, 'render');
		if (this.__applyFilters(ctx, heritage)) return;
		this.__applyMasks(ctx);
		this.__applyStyles(ctx);
		var m = this.__applyMatrix(ctx, heritage);
		this.__draw(ctx);
		if (this.childs.length > 0) this.__recursiveRender(ctx, m);
	},
	__applyMatrix: function(ctx, heritage){
		var m = new Cannon.Math.Matrix();
		m.translate(this.x+this.center[0], this.y+this.center[1]);
		m.rotate(this.radians);
		if (Cannon.Utils.instanceOf(this.matrix, Cannon.Math.Matrix)) m.multiply(this.matrix);
		if (Cannon.Utils.instanceOf(heritage, Cannon.Math.Matrix)) m.multiply(heritage);
		m.override(ctx);
		return m;
	},
	__draw: function(ctx){
		ctx.rect(this.center[0]*-1, this.center[1]*-1, this.width, this.height);
		ctx.stroke();
		ctx.fill();
	},
	__isWithin: function(x, y){
		//@TODO : come up with something clever in case of rotation
		var r = this.__getConcernedChilds(x-this.x, y-this.y);
		if (x >= this.x && x <= this.x+this.width &&
			y >= this.y && y <= this.y+this.height)
		{
			return [this].concat(r);
		}
		else return r;
	},
	toString: function(){
		return 'Rectangle(x:'+this.x+', y:'+this.y+', width:'+this.width+', height:'+this.height+')';
	}
});

/**
Circle class
*/
Cannon.Display.Circle = Cannon.DisplayObject.extend({
	/**
	Creates a new circle
	@constructor
	@param (Number) x The x coordonate of the circle, relative to its parent
	@param (Number) y The y coordonate of the circle, relative to its parent
	@param (Number) radius The radius of the circle
	*/
	__construct: function(x, y, radius){
		this._super(false);
		this.x = (x || 0);
		this.y = (y || 0);
		this.radius = (radius || 50);
	},
	__render: function(ctx, heritage){
		Cannon.Event.fire(this.__eventElement, 'render');
		if (this.__applyFilters(ctx, heritage)) return;
		this.__applyMasks(ctx);
		this.__applyStyles(ctx);
		var m = this.__applyMatrix(ctx, heritage);
		this.__draw(ctx);
		if (this.childs.length > 0) this.__recursiveRender(ctx, m);
	},
	__applyMatrix: function(ctx, heritage){
		var m = new Cannon.Math.Matrix();
		m.rotate(this.radians);
		m.translate(this.x, this.y);
		if (Cannon.Utils.instanceOf(this.matrix, Cannon.Math.Matrix)) m.multiply(this.matrix);
		if (Cannon.Utils.instanceOf(heritage, Cannon.Math.Matrix)) m.multiply(heritage);
		m.override(ctx);
		return m;
	},
	__draw: function(ctx){
		ctx.arc(0, 0, this.radius, 0, Math.PI*2, true);
		ctx.stroke();
		ctx.fill();
	},
	__isWithin: function(x, y){
		var r = this.__getConcernedChilds(x-this.x, y-this.y);
		if (Math.abs(Cannon.Utils.distance(x, y, this.x, this.y)) <= this.radius) 
		{
			return [this].concat(r);;
		}
		else return r;
	},
	toString: function(){
		return 'Circle(x:'+this.x+', y:'+this.y+', radius:'+this.radius+')';
	}
});

/**
Creates a line or a curve
*/
Cannon.Display.Line = Cannon.DisplayObject.extend({
	/**
	@contructor
	@param (Array) nodes An array of Vertex2D instances
	@param 'Number) x Optionnal, x origin
	@param 'Number) y Optionnal, y origin
	*/
	__construct: function(nodes, x, y){
		this._super(false);
		this.nodes = [];
		
		if (!Cannon.Utils.instanceOf(nodes, Array))
		{
			Cannon.Logger.log('Cannon.Display.Line constrcutor expects parameter #1 to be an Array', Cannon.Logger.Error);
			return false;
		}
		
		this.x = (x || 0);
		this.y = (y || 0);
		
		for (var i = 0; i < nodes.length; i++)
		{
			var node = nodes[i];
			if (Cannon.Utils.instanceOf(node, Cannon.Math.Vertex2D)) this.nodes.push(node);
			else if (Cannon.Utils.isNumber(node.x) && Cannon.Utils.isNumber(node.y))
			{
				this.nodes.push(new Cannon.Math.Vertex2D(node.x, node.y));
				Cannon.Logger.log('Node '+i+' of a Line is not an instance of Vertex2D, used its x and y properties to createa new Vertex2D', Cannon.Logger.Warning);
			}
			else
			{
				Cannon.Logger.log('Node '+i+' of a Line is not an instance of Vertex2D, ignored', Cannon.Logger.Warning);
			}
		}
	},
	__render: function(ctx, heritage){
		Cannon.Event.fire(this.__eventElement, 'render');
		if (this.__applyFilters(ctx, heritage)) return;
		this.__applyMasks(ctx);
		this.__applyStyles(ctx);
		var m = this.__applyMatrix(ctx, heritage);
		this.__draw(ctx);
		if (this.childs.length > 0) this.__recursiveRender(ctx, m);
	},
	__applyMatrix: function(ctx, heritage){
		var m = new Cannon.Math.Matrix();
		m.rotate(this.radians);
		m.translate(this.x, this.y);
		if (Cannon.Utils.instanceOf(this.matrix, Cannon.Math.Matrix)) m.multiply(this.matrix);//own transform matrix
		if (Cannon.Utils.instanceOf(heritage, Cannon.Math.Matrix)) m.multiply(heritage);//parent matrix
		m.override(ctx);
		return m;
	},
	__draw: function(ctx){
		var l = this.nodes.length; 
		if (l > 1)
		{
			ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
			
			for (var i = 1; i < l; i++)
			{
				ctx.bezierCurveTo.apply(ctx, this.nodes[i].toArray());
			}
			
			ctx.stroke();
		}
		else Cannon.Logger.log('Unable to render a line because it is composed ofless than two points', Cannon.Logger.Error);
	},
	toString: function(){
		return 'Line(points:'+this.nodes+')['+this.nodes+']';
	}
});

/**
Creates a shape of any arbitrary form
*/
Cannon.Display.Shape = Cannon.DisplayObject.extend({
	/**
	@contructor
	@param (Array) nodes An array of Vertex2D instances
	@param 'Number) x Optionnal, x origin
	@param 'Number) y Optionnal, y origin
	*/
	__construct: function(nodes, x, y)
	{
		this._super(false);
		this.nodes = [];
		
		if (!Cannon.Utils.instanceOf(nodes, Array))
		{
			Cannon.Logger.log('Cannon.Display.Shape constrcutor expects parameter #1 tobe an Array', Cannon.Logger.Error);
			return false;
		}
		
		this.x = (x || 0);
		this.y = (y || 0);
		
		for (var i = 0; i < nodes.length; i++)
		{
			var node = nodes[i];
			if (Cannon.Utils.instanceOf(node, Cannon.Math.Vertex2D)) this.nodes.push(node);
			else if (Cannon.Utils.isNumber(node.x) && Cannon.Utils.isNumber(node.y))
			{
				this.nodes.push(new Cannon.Math.Vertex2D(node.x, node.y));
				Cannon.Logger.log('Node '+i+' of a Shape is not an instance of Vertex2D, used its x and y properties to createa new Vertex2D', Cannon.Logger.Warning);
			}
			else
			{
				Cannon.Logger.log('Node '+i+' of a Shape is not an instance of Vertex2D, ignored', Cannon.Logger.Warning);
			}
		}
	},
	__render: function(ctx, heritage)
	{
		Cannon.Event.fire(this.__eventElement, 'render');
		if (this.__applyFilters(ctx, heritage)) return;
		this.__applyMasks(ctx);
		this.__applyStyles(ctx);
		var m = this.__applyMatrix(ctx, heritage);
		this.__draw(ctx);
		if (this.childs.length > 0) this.__recursiveRender(ctx, m);
	},
	__applyMatrix: function(ctx, heritage)
	{
		var m = new Cannon.Math.Matrix();
		m.rotate(this.radians);
		m.translate(this.x, this.y);
		if (Cannon.Utils.instanceOf(this.matrix, Cannon.Math.Matrix)) m.multiply(this.matrix);
		if (Cannon.Utils.instanceOf(heritage, Cannon.Math.Matrix)) m.multiply(heritage);
		m.override(ctx);
		return m;
	},
	__draw: function(ctx)
	{
		var l = this.nodes.length;
		if (l > 1)
		{
			ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
			
			for (var i = 1; i < l; i++)
			{
				ctx.bezierCurveTo.apply(ctx, this.nodes[i].toArray());
			}
			
			ctx.fill();
			ctx.stroke();
		}
		else Cannon.Logger.log('Unable to render a line because it is composed ofless than two points', Cannon.Logger.Error);
	},
	toString: function(){
		return 'Shape(points:'+this.nodes+')['+this.nodes+']';
	}
});

/**
A sprite is a set of images
*/
Cannon.Display.Sprite = Cannon.DisplayObject.extend({
	/**
	@contructor
	@param (Array) frames The different images that will compose the sprite. If there is only one image, you dont need to pass it as an array. Supproted value for images are a path to an image or an HTMLImageElement
	@param (Number) x X position of the sprite
	@param (Number) y Y position of the sprite
	@param (Number) width Optional, width of the sprite. If not specified, the width will be the width of the rendered frame
	@param (Number) height Optionnal, height of the sprite. If not specified, the height will be the height of the rendered frame
	*/
	__construct: function(frames, x, y, width, height){
		this._super(false);
		
		if (!Cannon.Utils.instanceOf(frames, Array) && !Cannon.Utils.isUndefined(frames)) frames = [frames];
		frames = (frames || []);
		this.frames = new Array(frames.length);
		this.x = (x || 0);
		this.y = (y || 0);
		this.width = (width || null);
		this.height = (height || null);
		this.center = [(this.width/2 || this.x), (this.height/2 || this.y)];
		
		this.loader = new Cannon.LoadingSet(Cannon.Utils.bind(function(){
			this.loaded = true;
			Cannon.Event.fire(this.__eventElement, 'load');
		}, this), frames.length);
		this.loaded = false;
		
		for (var i = 0, l = frames.length; i < l; i++)
		{
			if (Cannon.Utils.instanceOf(frames[i], HTMLImageElement) ||
				Cannon.Utils.instanceOf(frames[i], HTMLCanvasElement) ||
				Cannon.Utils.instanceOf(frames[i], HTMLVideoElement)) {
				this.loader.add('img'+i);
				this.__imageReady(frames[i], i);
			} else
			{
				var img = new Image();
				img.onload = Cannon.Utils.bind(this.__imageReady, this, img, i);
				img.onerror = Cannon.Utils.bind(this.__imageFailed, this, img, i);
				this.loader.add('img'+i);
				img.src = frames[i];
			}
		}
		
		this.currentFrame = 0;
		this.playing = false;
	},
	/**
	@private
	*/
	__imageReady: function(image, index){
		this.frames[index] = image;
		this.loader.ready('img'+index);
	},
	/**
	@private
	*/
	__imageFailed: function(image, index){
		Cannon.Logger.log('Failed loading '+image.src, Cannon.Logger.Warning);
		this.frames[index] = false;
		this.loader.ready('img'+index);
	},
	__render: function(ctx, heritage){
		Cannon.Event.fire(this.__eventElement, 'render');
		if (this.__applyFilters(ctx, heritage)) return;
		this.__applyMasks(ctx);
		this.__applyStyles(ctx);
		var m = this.__applyMatrix(ctx, heritage);
		this.__draw(ctx);
		if (this.childs.length > 0) this.__recursiveRender(ctx, m);
	},
	__applyMatrix: function(ctx, heritage)
	{
		var m = new Cannon.Math.Matrix();
		m.rotate(this.radians);
		m.translate(this.x+this.center[0], this.y+this.center[1]);
		if (Cannon.Utils.instanceOf(this.matrix, Cannon.Math.Matrix)) m.multiply(this.matrix);//own matrix
		if (Cannon.Utils.instanceOf(heritage, Cannon.Math.Matrix)) m.multiply(heritage);//parent matrix
		m.override(ctx);
		return m;
	},
	__draw: function(ctx)
	{
		var frame = this.frames[this.currentFrame];
		if (!frame || !this.loaded){
			this.nextFrame();
			return;
		}
		
		try{
			var width = (this.width || frame.width), 
				height = (this.height || frame.height);
			ctx.drawImage(this.frames[0], this.center[0]*-1, this.center[1]*-1, width, height);
		}
		catch (e){
			Cannon.Logger.log('Sprite rendering failed - '+e.toString(), Cannon.Logger.Error);
		}
		if (this.playing) this.nextFrame();
	},
	/**
	Displays the next frame of the sprite
	*/
	nextFrame: function()
	{
		this.currentFrame = (this.currentFrame+1)%this.frames.length;
	},
	/**
	Displays the previous frame of the sprite
	*/
	previousFrame: function()
	{
		if (this.currentFrame <= 0) this.currentFrame = this.frames.length-1;
		else this.currentFrame--;
	},
	/**
	Plays each frame ofthe sprite after the other
	*/
	play: function()
	{
		this.playing = true;
	},
	/**
	Srops theanimation on the currently displayed frame
	*/
	stop: function()
	{
		this.playing = false;
	},
	/**
	Goes to the desired frame and plays the animation from there on
	@param (Int) frame
	*/
	gotoAndPlay: function(frame)
	{
		this.currentFrame = frame%this.frames.length;
		this.play();
	},
	/**
	Goes to the desired frame and stops there
	@param (Int) frame
	*/
	gotoAndStop: function(frame)
	{
		this.currentFrame = frame%this.frames.length;
		this.stop();
	},
	__isWithin: function(x, y)
	{
		//just a basic rectangle lookup :/
		var frame = this.frames[this.currentFrame];
		var width = (this.width || frame.width), height = (this.height || frame.height);
		
		var r = this.__getConcernedChilds(x-this.x, y-this.y);
		if (x >= this.x && x <= this.x+width &&
			y >= this.y && y <= this.y+height)
		{
			return [this].concat(r);;
		}
		else return r;
	},
	toString: function()
	{
		return 'Sprite';
	}
});

/**
* Allows to display a single line of text
*/
Cannon.Display.DynamicText = Cannon.DisplayObject.extend({
	/**
	@contructor
	@param (String) text : The text do display
	@param (Number) x
	@param (Number) y
	*/
	__construct: function(text, x, y)
	{
		this._super(false);
		this.text = text;
		
		this.x = x;
		this.y = y;

		this.fontFamily = 'arial';
		this.fontStyle = '';
		this.fontSize = 20;
		
		this.textAlign = Cannon.Context.TextAlign.START;
		this.textBaseline = Cannon.Context.TextBaseline.TOP;

		this.renderStyle = Cannon.Context.TextRenderStyle.FILL;

		this.rotation = 0;
		this.radians = 0;

		this.__privateContext = Cannon.Context.getInstance('2d');
	},
	__render: function(ctx, heritage)
	{
		Cannon.Event.fire(this.__eventElement, 'render');
		if (this.__applyFilters(ctx, heritage)) return;
		this.__applyMasks(ctx);
		this.__applyStyles(ctx);
		var m = this.__applyMatrix(ctx, heritage);
		this.__draw(ctx);
		if (this.childs.length > 0) this.__recursiveRender(ctx, m);
	},
	__applyMatrix: function(ctx, heritage)
	{
		//positionning is done through textAlign and textBaseline
		var m = new Cannon.Math.Matrix();
		m.rotate(this.radians);
		m.translate(this.x, this.y);
		if (Cannon.Utils.instanceOf(this.matrix, Cannon.Math.Matrix)) m.multiply(this.matrix);
		if (Cannon.Utils.instanceOf(heritage, Cannon.Math.Matrix)) m.multiply(heritage);
		m.apply(ctx);
		return m;
	},
	__draw: function(ctx)
	{
		ctx.font = this.fontStyle+' '+this.fontSize+'px '+this.fontFamily;
		ctx.textAlign = this.textAlign;
		ctx.textBaseline = this.textBaseline;
		
		if (this.renderStyle == Cannon.Context.TextRenderStyle.STROKE) ctx.strokeText(this.text, 0, 0);
		else ctx.fillText(this.text, 0, 0);
	},
	/**
	Changes the font options
	@param (String) fontFamily
	@param (Number) fontSize
	@param (String) fontStyle : additional options (like bold or italic)
	*/
	setFont: function(fontFamily, fontSize, fontStyle)
	{
		this.fontFamily = fontFamily;
		this.fontSize = fontSize;
		this.fontStyle = fontStyle;
	},
	/**
	Mesures the width occupied by the text with the current font settings
	@return (Number)
	*/
	getWidth: function()
	{
		this.__applyStyles(this.__privateContext);
		this.__privateContext.font = this.fontStyle+' '+this.fontSize+'px '+this.fontFamily;
		this.__privateContext.textAlign = this.textAlign;
		this.__privateContext.textBaseline = this.textBaseline;
		var metric = this.__privateContext.measureText(this.text);
		return metric.width;
	},
	/**
	Mesures the height occupied by the text with the current font settings
	@return (Number)
	*/
	getHeight: function()
	{
		return this.fontSize;
	},
	__isWithin: function(x, y)
	{
		//just a basic rectangle lookup :/
		var width = this.getWidth(), height = this.fontSize;
		
		var r = this.__getConcernedChilds(x-this.x, y-this.y);
		if (x >= this.x && x <= this.x+width &&
			y >= this.y && y <= this.y+height)
		{
			return [this].concat(r);;
		}
		else return r;
	},
	toString: function()
	{
		return 'Dynamic: '+this.text;
	}
});
