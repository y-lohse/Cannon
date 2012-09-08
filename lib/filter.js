Cannon.registerPackage('Filter');

/**
* A set of pixels with each its own values. Can laod and read data from or to a canvas
*/
Cannon.Filter.Bitmap = Cannon.ClassFactory.extend({
	/**
	@constructor
	@param (Int) width The width of the bitmap object
	@param (Int) height The height of the bitmap object
	*/
	__construct: function(width, height)
	{
		this.context = Cannon.Context.getInstance('2d');
		this.width = (width || 1);
		this.height = (height || 1);
		
		this.imageData = this.context.createImageData(this.width, this.height);
		this.cols = [];
	},
	/**
	Loads the bitmap values
	@param (CanvasRenderingContext) Thecontext to load the pixels from
	@param (Number) x : The x offset to use before loading the pixels from the canvas
	@param (Number) y : The y offset to use before loading the pixels from the canvas
	*/
	loadBitmap: function(context, x, y)
	{
		if (!Cannon.Utils.instanceOf(context, CanvasRenderingContext2D)) return;
		x = (x || 0);
		y = (y || 0);
		
		try{
			this.imageData = context.getImageData(x, y, this.width, this.height);
		}
		catch(e)
		{
			Cannon.Logger.log('Failed retrieving context image data.', Cannon.Logger.Warning);
		}
	},
	/**
	Writes the content of the bitmap object to a canvas
	@param (CanvasRenderingContext) context : The context to write the data to
	@param (bool) override : Optionnal. If set to false, the pixel that have alpha values below 255 will be combined with the underlying values, wich also takes up more time. Is set to true, the bitmap witllsimply override anything in its way. Default is true. 
	*/
	putImageData: function(context, override, startX, startY)
	{
		if (!Cannon.Utils.instanceOf(context, CanvasRenderingContext2D)) return;
		startX = (startX || 0);
		startY = (startY || 0);
		if (override == undefined) override = true;
		
		var w = this.width;
		var h = this.height;
		
		context.putImageData(this.imageData, startX, startY);
	},
	/**
	Gets the value of a pixel at a given point
	@param (Number) x
	@param (Number) y
	@return Array
	*/
	getPixelAt: function(x, y)
	{
		var bitindex = (y*this.width+x)*4;
		var data = this.imageData.data;
		return  [data[bitindex], data[bitindex+1], data[bitindex+2], data[bitindex+3]];
	},
	getAlphaAt: function(x, y)
	{
		var bitindex = (y*this.width+x)*4;
		return this.imageData.data[bitindex+3];
	},
	setPixelAt: function(x, y, pixel)
	{
		var bitindex = (y*this.width+x)*4;
		var data = this.imageData.data;
		data[bitindex] = pixel[0];
		data[bitindex+1] = pixel[1];
		data[bitindex+2] = pixel[2];
		data[bitindex+3] = pixel[3];
	}
});

Cannon.Filter.LightCanvas = Cannon.ClassFactory.extend({
	__construct: function(width, height){
		this.canvas = document.createElement('canvas');
		this.canvas.setAttribute('width', width);
		this.canvas.setAttribute('height', height);
		this.context = this.canvas.getContext('2d');
		this.width = width;
		this.height = height;
	},
	setDimensions: function(width, height){
		this.width = width;
		this.height = height;
		this.canvas.setAttribute('width', this.width);
		this.canvas.setAttribute('height', this.height);
	},
	toDataURL: function(){
		return this.canvas.toDataURL.apply(this.canvas, arguments);
	}
});

Cannon.Filter.Filter = Cannon.ClassFactory.extend({
	__construct: function(){
	},
	apply: function(object, ctx, heritage, width, height){
		//save a copy of the usefull parameters
		this.drawTo = ctx;
		this.object = object;
		
		//create our very own context o witch we can draw to
		this.canvas = new Cannon.Filter.LightCanvas(width, height);
		
		//apply objects changes to our context
		object.__applyMasks(this.canvas.context);
		object.__applyStyles(this.canvas.context);
		var m = object.__applyMatrix(this.canvas.context, heritage);
		
		//now we draw our objects to the canvas
		object.__draw(this.canvas.context);
		if (object.childs.length > 0) object.__recursiveRender(this.canvas.context, m);
		
		var a = Cannon.Utils.microtime();
		this.loadBitmap();
		var b = Cannon.Utils.microtime();
		this.reduce();
		var c = Cannon.Utils.microtime();
		this.manipulate();
		var d = Cannon.Utils.microtime();
		this.drawToFinal();
		var e = Cannon.Utils.microtime();
		
		Cannon.Logger.log(d-c);
		//load : 2
		//reduce 22 -> 12
		//manipulate : dépend du filtre
		//final : 15
		//total sans manipulate : 37
	},
	reduce: function(){
		//reducing the pixels we will itterate to the minimum
		var w = this.canvas.width,
			h = this.canvas.height,
			b = this.bitmap;
		this.mostleft = 0,
		this.mostright = w,
		this.mosttop = guessTop = 0,
		this.mostbottom = guessBot = h;
		
		for (var x = w; x >= 0; x--){
			for (var y = h; y >= 0; y--){
				if (b.getAlphaAt(x, y) > 0){
					this.mostright = x;
					guessBot = guessTop = y;
					break;
				}
			}
			if (this.mostright < w) break;
		}
		for (var x = 0; x < w; x++){
			for (var y = h; y >= 0; y--){
				if (b.getAlphaAt(x, y) > 0){
					this.mostleft = x;
					guessBot = Math.max(y, guessBot);
					guessTop = Math.min(y, guessTop);
					break;
				}
			}
			if (this.mostleft != 0) break;
		}
		for (var y = 0; y < guessBot; y++){
			for (var x = this.mostright; x >= this.mostleft; x--){
				if (b.getAlphaAt(x, y) > 0){
					this.mosttop = y;
					break;
				}
			}
			if (this.mosttop != 0) break;
		}
		for (var y = h; y >= guessBot; y--){
			for (var x = this.mostright; x >= this.mostleft; x--){
				if (b.getAlphaAt(x, y) > 0){
					this.mostbottom = y;
					break;
				}
			}
			if (this.mostbottom != h) break;
		}
		
		this.mostright++;
		this.mostbottom++;
	},
	loadBitmap: function(){
		this.bitmap = new Cannon.Filter.Bitmap(this.canvas.width, this.canvas.height);
		this.bitmap.loadBitmap(this.canvas.context);
		this.data = this.bitmap.imageData.data;
		this.bitmapWidth = this.bitmap.width;
	},
	manipulate:function(){
		return;
	},
	getBitIndex: function(x, y){
		return (y*this.bitmapWidth+x)*4;
	},
	getPixelAt: function(x, y){
		var bitindex = this.getBitIndex(x, y);
		var data = this.data;
		return  [data[bitindex], data[bitindex+1], data[bitindex+2], data[bitindex+3]];
	},
	setPixelAt: function(x, y, pixel){
		var bitindex = this.getBitIndex(x, y);
		var data = this.data;
		data[bitindex] = pixel[0];
		data[bitindex+1] = pixel[1];
		data[bitindex+2] = pixel[2];
		data[bitindex+3] = pixel[3];
	},
	drawToFinal: function(){
		var img = new Image();
		img.src = this.canvas.toDataURL();
		this.drawTo.drawImage(img, 0, 0);
	}
});

Cannon.Filter.DummyFilter = Cannon.Filter.Filter.extend({
	__construct: function(){
		this._super(false);
	},
	manipulate:function(){	
		var b = this.bitmap;
		var data = this.bitmap.imageData.data;
		
		for (var x = 0, w = b.width; x < w; x++)
		{
			for (var y = 0, h = b.height; y < h; y++)
			{
				for (var i = 0, l = 2; i < l; i++){
					this.getPixelAt(x, y);
					this.setPixelAt(x, y, [255,0,0,255]);
				}
			}
		}
		
		b.putImageData(this.canvas.context);
	},
});

Cannon.Filter.BrightnessFilter = Cannon.Filter.Filter.extend({
	__construct: function(intensity)
	{
		this._super(false);
		this.intensity = intensity;
	},
	manipulate:function()
	{
		var b = this.bitmap;
		var intensity = this.intensity;
		
		for (var x = this.mostleft, w = this.mostright; x < w; x++)
		{
			for (var y = this.mosttop, h = this.mostbottom; y < h; y++)
			{
				var color = this.getPixelAt(x, y);
				
				color[0] *= 1+intensity;
				color[1] *= 1+intensity;
				color[2] *= 1+intensity;
				
				this.setPixelAt(x, y, color);
			}
		}
		
		b.putImageData(this.canvas.context);
	},
});

Cannon.Filter.ContrastFilter = Cannon.Filter.Filter.extend({
	__construct: function(intensity)
	{
		this._super(false);
		this.intensity = intensity;
	},
	manipulate:function()
	{
		var b = this.bitmap;
		var intensity = this.intensity;
		for (var x = this.mostleft, w = this.mostright; x < w; x++)
		{
			for (var y = this.mosttop, h = this.mostbottom; y < h; y++)
			{
				var color = this.getPixelAt(x, y);
				
				color[0] += intensity*(color[0]-127);
				color[1] += intensity*(color[1]-127);
				color[2] += intensity*(color[2]-127);
				
				this.setPixelAt(x, y, color);
			}
		}
		
		b.putImageData(this.canvas.context);
	},
});

Cannon.Filter.BlackAndWhiteFilter = Cannon.Filter.Filter.extend({
	__construct: function()
	{
		this._super(false);
	},
	manipulate:function()
	{
		var b = this.bitmap;
		var intensity = this.intensity;
		for (var x = this.mostleft, w = this.mostright; x < w; x++)
		{
			for (var y = this.mosttop, h = this.mostbottom; y < h; y++)
			{
				var color = this.getPixelAt(x, y);
				var average = (color[0]+color[1]+color[2])/3;
				color[0] = average;
				color[1] = average;
				color[2] = average;
				
				this.setPixelAt(x, y, color);
			}
		}
		
		b.putImageData(this.canvas.context);
	},
});

Cannon.Filter.BlurFilter = Cannon.Filter.Filter.extend({
	__construct: function(x, y){
		this._super(false);
		this.x = x || 0;
		this.y = y || 0;
	},
	manipulate:function(){
		var s = Cannon.Utils.microtime();
		
		var cache = [],
			data = this.bitmap.imageData.data;
			bitmap = this.bitmap,
			offsetX = this.x,
			offsetY = this.y,
			bitindex = null;
		
		//ca c'est uber rapide
		for (var x = this.mostleft-offsetX, w = this.mostright+offsetX; x < w; x++){
			cache[x] = [];
			for (var y = this.mosttop-offsetY, h = this.mostbottom+-offsetY; y < h; y++){
				bitindex = this.getBitIndex(x, y);
				cache[x][y] = [data[bitindex], data[bitindex+1], data[bitindex+2], data[bitindex+3]];
			}
		}
		
		//for (var x = this.mostright-1, w = this.mostleft; x > w; x--){
		for (var x = this.mostleft, w = this.mostright; x < w; x++){
			for (var y = this.mosttop, h = this.mostbottom; y < h; y++){
				//17 ms
				var colors = [];
				for (var i = -offsetX; i < offsetX+1; i++){
					colors.push(cache[x+i][y]);
				}
				for (var i = -offsetY; i < offsetY+1; i++){
					colors.push(cache[x][y+i]);
				}
				
				var color = [0,0,0,0];
				
				//12 ms
				var l = colors.length;
				for (var i = 0; i < l; i++){
					color[0] += colors[i][0];
					color[1] += colors[i][1];
					color[2] += colors[i][2];
					color[3] += colors[i][3];
				}
				
				color[0] /= l;
				color[1] /= l;
				color[2] /= l;
				color[3] /= l;
				
				bitindex = this.getBitIndex(x, y);
				data[bitindex] = color[0];
				data[bitindex+1] = color[1];
				data[bitindex+2] = color[2];
				data[bitindex+3] = color[3];
				//this.setPixelAt(x, y, color);
			}
		}
		
		bitmap.putImageData(this.canvas.context);
		var e = Cannon.Utils.microtime();
		//Cannon.Logger.log(e-s);
		//330 - 30 tableau linéaire local
		//500 - 60 avec tableau linéaire
	},
});