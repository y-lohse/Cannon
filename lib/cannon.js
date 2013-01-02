/**
Cannon Framework
@version : 0.8.0
@author : Yannick Lohse
*/

/**
The Cannon class holds a few informations for internal use. 
It also contains all the classes made available so that they dont get into the global scope.
*/
var Cannon = {
	version: '0.8.0',
	name: 'Cannon',
	libPath: '',
	includes: [],
	include: function(path){
		this.includes.push(path);
	},
	readyBound: false,
	/**
	Called once all Cannon classes are loaded
	*/
	__loaded: function(){
		//append includes
		if (this.includes.length > 0){
			var ls = new Cannon.LoadingSet(Cannon.Utils.bind(Cannon.__loaded, Cannon), this.includes.length);

			for (var i = 0; i < this.includes.length; i++){
				(function(script, ls){
					var path = Cannon.libPath+script+'.js';
					Cannon.Logger.log('Loading '+script+' at '+path);
					ls.add(script);
					Cannon.getScript(path, function(){
						ls.ready(script);
					});
				})(this.includes[i], ls);
			}
			this.includes.length = 0;
			return;
		}
		
		if (this.readyBound) return;//allready fired
		
		this.readyBound = true;
		if (this.globalize){
			for (var i = 0; i < this.classList.length; i++){
				window[this.classList[i]] = this[this.classList[i]];
			}
		}

		Cannon.Logger.log('Cannon is now loaded and ready to rock');
		if (typeof this.onReady == 'function') this.onReady();
	},
	getScript: function(url, callback){
		var head = document.getElementsByTagName('head')[0],
			script = document.createElement('script'),
			loaded = false;

		script.setAttribute('src', url);
		script.onload = script.onreadystatechange = function(){
			if (!loaded &&
				(!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')){
				loaded = true;
				callback();
			}
		}

		head.appendChild(script);
		return;
	},
	/**
	An empty functions that does nothing and returns nothing, used as default
	*/
	v: function(){},
	packages: [],
	registerPackage: function(pack){
		this.packages.push(pack);
		if (!Cannon[pack]) Cannon[pack] = {};
		Cannon.Logger.log('Registered new package '+pack);
	},
	use: function(pack, to){
		to = to || window;
		var path = pack.split('.');
		
		var packages = (path[0] === '*') ? this.packages : [path[0]];
		var classes = (path.length === 1) ? '*' : [path[1]];
		
		//@FO+IXME : elle va se redéclarer à chaque fois
		function importTo(pack, klass, to){
			Cannon.Logger.log('Importing '+pack+'.'+klass);
			if (!Cannon.Utils.isUndefined(to[klass]))
			{
				Cannon.Logger.log(klass+' allready existed in the scope it is imported to. A backup copy will be available as _'+klass, Cannon.Logger.Warning);
				to['_'+klass] = to[klass];
			}
			to[klass] = Cannon[pack][klass];
		}
		
		for (var i = 0; i < packages.length; i++){
			if (classes == '*'){
				for (var klass in Cannon[packages[i]]){
					importTo(packages[i], klass, to);
				}
			}
			else{
				importTo(pack[i], classes, to);
			}
		}
	},
	toString: function(){
		return 'Cannon Main Object : '+this.name+' '+this.version;
	}
};

/**
Contains a set of utility functions
*/
Cannon.Utils = {
	/**
	Checks if the given parameter is a function
	@param (mixed) obj object to be evaluated
	@type boolean
	*/
	isFunction: function(obj){
		return typeof obj === 'function';
	},
	/**
	Checks if the given parameter is undefined
	@param (mixed) obj object to be evaluated
	@type boolean
	*/
	isUndefined: function(obj){
		return typeof obj === 'undefined';
	},
	/**
	Checks if the given parameter is a string
	@param (mixed) obj object to be evaluated
	@type boolean
	*/
	isString: function(obj){
		return typeof obj === 'string';
	},
	/**
	Checks if the given parameter is a number
	@param (mixed) obj object to be evaluated
	@type boolean
	*/
	isNumber: function(obj){
		return typeof obj === 'number';
	},
	/**
	Checks if child is an instance of parent
	@param (mixed) child child to be checked
	@param (constructor) presumed parent constructor
	@type boolean
	*/
	instanceOf: function(child, parent){
		if (!parent){
			if (Cannon.Logger) Cannon.Logger.log('Cannon.Utils.instanceOf called with invalid arguments', Cannon.Logger.Warning);
			return false;
		}
		return child instanceof parent;
	},
	/**
	Computes a random value between 2 values (included)
	@param (number) min lower treshhold touse
	@param (number) max upper treshhold touse
	@type float
	*/
	randomIn: function(min, max){
		return min+(max-min)*Math.random();
	},
	/**
	Converts a hexadecimal value into a decimal one
	@param (number) hexadecimal value
	@return decimal value
	@type int
	*/
	hexToDec: function(value){
		return parseInt(value, 16);
	},
	/**
	Converts a decimal value into a hexadecimal one
	@param (number) decimal value
	@return hexadecimal value
	@type string
	*/
	decToHex: function(value){
		return parseInt(value).toString(16).toUpperCase();
	},
	/**
	Converst a radian value into degrees
	@param (number) value to be converted
	@return value in degrees
	^type number
	*/
	radiansToDegrees: function(value){
		return value*180/Math.PI;
	},
	/**
	Converst a value in degrees into radians
	@param (number) value to be converted
	@return value in radians
	^type number
	*/
	degreesToRadians: function(value){
		return value*Math.PI/180;
	},
	/**
	Computes the distance between two points using Pythagora. Alternatively, the 2 first arguments can be points with x and y properties
	@param (number | point) x1 or first point
	@param (number | point) y1 or seco,d point
	@param (point) x2
	@param (point) y2
	@type number
	*/
	distance: function(x1, y1, x2, y2){
		if (arguments.length == 4){
			return Math.sqrt((Math.pow((x2-x1), 2))+(Math.pow((y2-y1), 2)))
		}
		else if (arguments.length == 2){
			return Math.sqrt((Math.pow((arguments[1].x-arguments[0].x), 2))+(Math.pow((arguments[1].y-arguments[0].y), 2)))
		}
	},
	/**
	Removes the first occurence of a value in the given array
	@param (array) array
	@param (mixed) value value to be removed
	@return a new array
	@type array
	*/
	arrayWithout: function(array, value){
		if (array.indexOf(value) >= 0) array.splice(array.indexOf(value), 1);
		return array;
	},
	/**
	Clones the given array
	@param (array) array the array to clone
	@return a new array
	@type array
	*/
	cloneArray: function(array){
		var a = [];
		for (var i = 0, l = array.length; i < l; i++){
			if (array[i] instanceof Array) a[i] = array[i].recursiveClone();
			else a[i] = array[i];
		}

		return a;
	},
	uniqueArray: function(array){
		var ret = [];
		for (var i = 0, l = array.length; i < l; i++) {
			if (ret.indexOf(array[i]) === -1){
				ret.push(array[i])
			}
		}
		return ret;
	},
	/**
	Returns the width of an element
	@param (element) the element to check for a width property
	@return the width of the element, 0 if none found	
	@type int
	*/
	getElementWidth: function(element){
		var str = element.style.width;
		if (str == '') return 0;
		else return parseInt(str.substring(0, str.indexOf('px')));
	},
	/**
	Returns the height of an element
	@param (element) the element to check for a height property
	@return the height of the element, 0 if none found	
	@type int
	*/
	getElementHeight: function(element){
		var str = element.style.height;
		if (str == '') return 0;
		else return parseInt(str.substring(0, str.indexOf('px')));
	},
	/**
	Returns the current timestamp
	@type int
	*/
	microtime: function(){
		return Date.now();
	},
	/**
	Binds a function call to a given context. Based on jQuerys .proxy
	@param (function) func the function you want to bind
	@param (object) context the context to witch the function should be bound
	@return a new function
	@type function
	*/
	bind: function(fn, context){		
		var args = Array.prototype.slice.call( arguments, 2 ),
			proxy = function() {
				return fn.apply( context, args.concat( Array.prototype.slice.call( arguments ) ) );
			};
			
		return proxy;
	},
	/**
	A private stylesheet, used internally
	*/
	styleSheet: (function(){
		var css = document.createElement('style');
		css.setAttribute('type', 'text/css');
		document.getElementsByTagName('head')[0].appendChild(css);
		return css.sheet || css.styleSheet;
	}()),
	/**
	Loads a font
	@param (String) name
	@param (String) src : the font's source file
	@param (String) weight : Optionnal, the font weight. Default is normal
	@param (String) style : Optionnal, the font-style. Default is normal
	*/
	loadFont: function(name, src, weight, style){
		Cannon.Logger.log('Loading font '+src);
		var weight = weight || 'normal';
		var style = style || 'normal';
		Cannon.Utils.styleSheet.insertRule("@font-face{font-family:'"+name+"'; src: url('"+src+"'); font-weight: "+weight+"; font-style: "+style+";}", Cannon.Utils.styleSheet.cssRules.length);
	},
	keys: {
		8:	'backspace',
		13:	'enter',
		16:	'shift',
		17: 'control',
		18:	'alt',
		20:	'capslock',
		27:	'escape',
		32:	'space',
		37:	'left',
		38:	'up',
		39:	'right',
		40:	'down'
	},
	web: function(url){
		window.open(url);
	},
};


/**
Objects and inheritance
*/
/*
 * By John Resig http://ejohn.org/
 * MIT Licensed.
*/
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  Cannon.ClassFactory = function(){};
 
  // Create a new Class that inherits from this class
  Cannon.ClassFactory.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);       
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }

    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.__construct ) this.__construct.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();

/**
The Cannon Logger helps keeping track of what happens inside Cannon, but anyone can use it
*/
Cannon.Logger = {
	logstack: [],
	Info: 'Info',
	Warning: 'Warning',
	Error: 'Error',
	maxlog: 10,
	/**
	Apprends a message to the log
	@param (string) message
	@param (constant) level optionnal, level of the message. Should be Logger.Info, Logger.Warning or Logger.Error
	*/
	log: function(message, level){
		var caller = arguments.callee.caller;
		level = (level || Cannon.Logger.Info);
		var date = new Date();

		var log = {message: message, level: level, date: date, caller: caller};
		this.logstack.push(log);

		if (this.autologing){
			this.autologElement.innerHTML += this.logToHTML(log);
			this.element.scrollTop = this.element.scrollHeight;

			var logs = this.autologElement.childNodes;
			if (this.autologElement.childNodes.length >= this.maxlog){
				this.autologElement.removeChild(logs[0]);
			}
		}
	},
	/**
	Converts a single log into a string
	@param (log) log
	@type string
	*/
	logToString: function(log){
		return log.date.getHours()+':'+log.date.getMinutes()+':'+log.date.getSeconds()+' - '+log.level+' - '+log.message+'\n';
	},
	/**
	Converts the whole log into a string
	@type string
	*/
	toString: function(){
		var str = '';
		for (var i = 0; i < this.logstack.length; i++)
		{
			str += this.logToString(this.logstack[i]);
		}
		return str;
	},
	/**
	Converts a single log into a HTML-fromated string
	@param (log) log
	@type string
	*/
	logToHTML: function(log){
		var col;
		if (log.level == Cannon.Logger.Error) col = '#FF5D40';
		else if (log.level == Cannon.Logger.Warning) col = '#FFC040';
		else col = '#FFFFFF';

		var str = '<tbody><tr style="color:black; background-color: '+col+'">';
		str += '<td><b>'+log.date.getHours()+':'+log.date.getMinutes()+':'+log.date.getSeconds()+':'+log.date.getMilliseconds()+'</b></td>';
		str += '<td style="padding-left: 4px;"><b>'+log.level+'</b></td>';
		str += '<td style="padding-left: 4px;">'+log.message+'</td>';
		str += '</tr></tbody>';
		
		return str;
	},
	/**
	Converths all logs into HTML
	@type string
	*/
	toHTML: function(){
		var html = '';
		for (var i = 0; i < this.logstack.length; i++)
		{
			html += this.logToHTML(this.logstack[i]);
		}
		return html;
	},
	autologing: false,
	autologElement: null,
	/**
	Starts autologing. All log messages, past and future, are appended to the given html element
	@param (string | element) element The html element that will contain the logs, or its id
	*/
	autolog: function(element){
		element = (Cannon.Utils.isString(element)) ? document.getElementById(element) : element;
		this.autologing = true;
		element.innerHTML = '';
		
		var table = document.createElement('table');
		table.setAttribute('rowspacing', 0);
		table.setAttribute('cellspacing', 0);
		table.setAttribute('border', 0);
		element.appendChild(table);
		this.element = element;
		this.autologElement = table;
		this.autologElement.innerHTML = this.toHTML();
		this.element.scrollTop = this.element.scrollHeight;
	}
};

Cannon.Logger.log(Cannon.name+' - '+Cannon.version);
Cannon.Logger.log('Cannon Logger started, now logging...');

/**
Creates a LoadingSet that will control the loading of several things
*/
Cannon.LoadingSet = Cannon.ClassFactory.extend({
	/**
	Creates a new LoadingSet
	@param (function) callback : The callback function to call once the loading set has fineshed loading
	@param (int) size Optionnal, defines the number of items that will be loaded with this loading set. Prevents the onLoad to be triggered to early.
	*/
	__construct: function(callback, size){
		this.onLoad = callback || Cannon.v;
		this.pieces = [],
		this.percent = 0,
		this.loaded = 0,
		this.total = 0,
		this.maxSize = (size || 0);
	},
	/**
	Adds a piece to the LoadingSet
	@param (mixed) piece A piece you want to add. The LoadingSet must be notified that this piece has finished its loading by calling the LoadingSet::ready method with the piece as argument
	@param (number) value Optionnal, can be used to give more importance to some files. Default value is 1
	*/
	add: function(piece, value){
		value = (value || 1);
		this.pieces.push({piece: piece, value: value, loaded: false});
		this.update();

		if (this.maxSize != 0 && this.pieces.length > this.maxSize){
			Cannon.Logger.log('LoadingSet defined with a size of '+this.maxSize+' has been provided with '+this.pieces.length+' pieces', Cannon.Logger.Warning);
		}
	},
	/**
	The method should be called when a piece is loaded
	@param (mixed) piece The piece that just finished loading
	*/
	ready: function(piece){
		var index = this.findPiece(piece);
		
		if (index >= 0){
			this.pieces[index].loaded = true;
			this.update();
		}
	},
	/**
	Used to find the index of a piece inside the collection
	@param (mixed) piece A piece that the LoadingSet watches
	*/
	findPiece: function(piece){
		for (var i = 0; i < this.pieces.length; i++){
			if (this.pieces[i].piece == piece) return i;
		}
		Cannon.Logger.log('Could not find piece '+piece+' inside given LoadingSet', Cannon.Logger.Warning);
		return false;
	},
	/**
	Refreshes the amount of files loaded. You don'tneed to call this function yourself, it gets called when a piece has finished loading
	*/
	update: function(){
		this.total = 0;
		this.loaded = 0;

		for (var i = 0; i < this.pieces.length; i++){
			var val = this.pieces[i].value;
			this.total += val;
			if (this.pieces[i].loaded) this.loaded += val;
		}

		this.percent = this.loaded/this.total*100;
		if (this.total == this.loaded && (this.maxSize == 0 || this.maxSize <= this.pieces.length)) this.onLoad();
	}
});

//based on prototypes Event class
/**
A class that allows to fire custom events
*/
Cannon.Event = {
	__eventListeners: [],//holds the event listeners
	__elements: [],//the elements we're watching
	/**
	Fires a custom event
	@param (element) source The source that is used to fire the event
	@param (string) type The event type
	@param (object) infos Optionnal, an object containing additional informations
	*/
	fire: function(source, type, infos){
		var event;
		if (document.createEvent) {
			event = document.createEvent('HTMLEvents');
			event.initEvent('dataavailable', true, true);
		} 
		else {
			event = document.createEventObject();
			event.eventType = bubble ? 'ondataavailable' : 'onfilterchange';
		}

		event.eventName = type;

		for (var extra in infos){
			event[extra] = infos[extra]
		}
		
		if (document.createEvent) source.dispatchEvent(event);
		else source.fireEvent(event.eventType, event);
	},
	/**
	This method is a proxy that catches all events and transfers them to their respective handlers
	@param (event) event
	*/
	__responder: function(event){
		if (!Cannon.Utils.isUndefined(event.eventName)){
			for (var i = 0; i < this.__eventListeners.length; i++){
				if (this.__eventListeners[i].type == event.eventName && this.__eventListeners[i].element === event.target){
					//@TODO : extend the event
					this.__eventListeners[i].handler(event);
					break;
				}
			}
		}
	},
	/**
	Registers a custom event
	@param (element) element The element to watch for the event
	@param (string) type The event type
	@param (function) handler The callback function that is to be used if the event is captured
	*/
	on: function(element, type, handler){
		var listener = {type: type, element: element, handler: handler};
		if (this.__eventListeners.indexOf(listener) >= 0) return;//allready registered
		else this.__eventListeners.push(listener);
		
		if (this.__elements.indexOf(element) >= 0) return;
		
		if (element.addEventListener) element.addEventListener("dataavailable", Cannon.Utils.bind(this.__responder, this), false);
		else{
			element.attachEvent("ondataavailable", Cannon.Utils.bind(this.__responder, this));
			element.attachEvent("onfilterchange", Cannon.Utils.bind(this.__responder, this));
		}
		
		this.__elements.push(element);
	},
	/**
	Unregisters an event listener
	@param (element) element The element that was watched
	@param (string) type The event type
	@param (function) handler Thecallback function
	*/
	stopListening: function(element, type, handler)
	{
		var index;
		for (var i = 0, l = this.__eventListeners.length; i < l; i++){
			if(	this.__eventListeners[i].type === type &&
				this.__eventListeners[i].element === element &&
				this.__eventListeners[i].handler === handler){
				index = i;
				break;
			}
		}
		if (index >= 0) this.__eventListeners = Cannon.Utils.arrayWithout(this.__eventListeners, this.__eventListeners[index]);
		
		if (this.__countListeners(element) >= 0) return;//other events are registered on this element, don't emove the lisetners
		
		if (element.removeEventListener) element.removeEventListener("dataavailable", Cannon.Utils.bind(this.responder, this), false);
		else{
			element.detachEvent("ondataavailable", Cannon.Utils.bind(this.__responder, this));
			element.detachEvent("onfilterchange",  Cannon.Utils.bind(this.__responder,  this));
		}
	},
	/*
	* counts the amount of currently registered listeners on element
	*/
	/**
	Counts the amount of currently registered listeners on the given element
	@param (element) element
	*/
	__countListeners: function(element){
		var count = 0;
		
		for (var i = 0, l = this.__eventListeners.length; i < l; i++)
		{
			if (this.__eventListeners[i].element == element) count++;
		}
		
		return count;
	},
};

/**
This is an "abstract class". Create your own exceptions inheriting from this one. Appart from the usual name and message, it also gets the StackTrace.
*/
Cannon.Exception = Cannon.ClassFactory.extend({
	/**
	The constructor function, used to get the stacktrace
	*/
	__construct: function(caller){
		this.caller = caller;
		this.args = this.caller.arguments;
		this.name = 'Exception';
		this.message = 'The Cannon.Exception class has been used to throw an Exception. It is however an abstract class and thius should never be instanciated.';
	},
	/**
	Returns the name and message (not the stacktrace)
	@type string
	*/
	toString: function(){
		return this.name+' : '+this.message;
	},
	/**
	Returns the complete message with its stacktrace, formatted in html
	@type string
	*/
	toHTML: function(){
		var str = this.name+' : '+this.message+'<br />';
		str += '<b>Raised in :</b><br />'+this.caller+'<br />';
		str += '<b>Function called with arguments :</b><br /><table>';
		for (var i = 0; i < this.args.length; i++) str += '<tr><td>'+i+'</td><td>'+this.args[i]+'</td></tr>';
		str += '</table><hr />';
		return str;
	}
});

/**
Abstract class that implements a child nesting system with depth for display objects. This class is used internally, there is no reason why you would need to use it or extend it.
*/
Cannon.ChildSystem = Cannon.ClassFactory.extend({
	/**
	Constructor, defines the replacement modes and creates the child array
	*/
	__construct: function()
	{
		this.childs = [];
		this.ChildReplacementModes = {UNDER: 'under', OVER: 'over', SWAP: 'swap'};
		this.childReplacementMode = this.ChildReplacementModes.UNDER;
	},
	/**
	Adds a child to the scene
	@param (DisplayObject) child
	@return the child, or false if insertion fails
	@type DisplayObject | boolean
	*/
	addChild: function(child){
		if (Cannon.Utils.instanceOf(child, Cannon.DisplayObject))
		{
			child.__parent = this;
			//we try to find a depth that is left blank for the child
			for (var i = 0; i < this.childs.length; i++)
			{
				if (Cannon.Utils.isUndefined(this.childs[i]))
				{
					//this depth is empty, insert the child here
					child.__depth = i;
					this.childs[i] = child;
					return child;
				}
			}
			//all depths are filled so far, append it
			//Cannon.Logger.log(this.childs.length);
			//Cannon.Logger.log(child.childs.length);
			child.__depth = this.childs.length;
			this.childs[this.childs.length] = child;
			//Cannon.Logger.log(this.childs.length);
			//Cannon.Logger.log(child.childs.length);
			return child;
		}
		Cannon.Logger.log('Tryng to add a child to a ChildSystem that is not an instance of a DisplayObject', Cannon.Logger.Warning);
		return false;
	},
	/**
	Removes the child
	@param (DisplayObject) child
	*/
	removeChild: function(child){
		if (this.childs[child.__depth] == child){
			this.childs[child.__depth] = undefined;
			child.__depth = null;
			child.__parent = null;
			return true;
		}
		//if not we have a serious depth issue
		Cannon.Logger.log('A request to delete a child from a ChildSystem has been ignored because the childs __depth property does not match its real depth', Cannon.Logger.Error);
	},
	/**
	Changes the depth of a child
	@param (DisplayObject) child A child taht has allready been added
	@param (int) depth The new depth of the child
	@param (constant) remplacementMode Optionnal. Tells the ChildSystem how to handle the case when there is allready a child at the desired depth. Can be either Cannon.ChildSystem.ReplacementModes.UNDER, Cannon.ChildSystem.ReplacementModes.OVER or Cannon.ChildSystem.ReplacementModes.SWAP. Default mode is UNDER
	*/
	setChildDepth: function(child, depth, replacementMode){
		if (this.childs.indexOf(child) < 0){
			Cannon.Logger.log('Tryng to change the depth of a child that doesn\'t exist in the currect ChildSystem', Cannon.Logger.Warning);
			return false;
		}
		
		if (!Cannon.Utils.isUndefined(this.childs[depth])){
			//there's a child at the given depth
			replacement = (replacementMode || this.childReplacementMode);

			replacedChild = this.childs[depth];
			baseDepth = child.__depth;
			this.childs[child.__depth] = undefined;
			this.childs[depth] = child;
			child.__depth = depth;
			
			if (replacement == 'under'){
				newDepth = this.getNextLowestDepth(baseDepth);
				if (newDepth !== false){
					this.childs[newDepth] = replacedChild;
					replacedChild.__depth = newDepth;
				}
				else{
					//there's no place left under, fall back on over
					newDepth = this.getNextHighestDepth(baseDepth);
					this.childs[newDepth] = replacedChild;
					replacedChild.__depth = newDepth;
					Cannon.Logger.log('Impossible to add a child under the given depth, adding it on top', Cannon.Logger.Warning);
				}
				
				return child;
			}
			else if (replacement == 'over'){
				newDepth = this.getNextHighestDepth(baseDepth);
				this.childs[newDepth] = replacedChild;
				replacedChild.__depth = newDepth;
			
				return child;
			}
			else if (replacement == 'swap'){
				this.childs[baseDepth] = replacedChild;
				replacedChild.__depth = baseDepth;
			
				return child;
			}
			else return false;
		}
		else{
			//no child here
			this.childs[child.__depth] = undefined;
			child.__depth = depth;
			this.childs[depth] = child;
			
			return child;
		}
	},
	/**
	Returns the closest empty depth, starting from the base and going upwards
	@param (int) base Depth to start the search with
	@type int
	*/
	getNextHighestDepth: function(base){
		base = base || 0;
		for (var i = base; i < this.childs.length; i++){
			if (Cannon.Utils.isUndefined(this.childs[i])) return i;
		}
		return this.childs.length;
	},
	/**
	Returns the closest empty depth, starting from the base and going downwards
	@param (int) base Depth to start the search with
	@return Returns false in case there is no empty depth under the given base
	@type int | boolean
	*/
	getNextLowestDepth: function(base){
		base = base || this.childs.length;
		for (var i = base; i = 0; i--){
			if (Cannon.Utils.isUndefined(this.childs[i])) return i;
		}
		return false;
	},

	/**
	Trys to determine if a child is concerned by an event (click, mouseover, etc). Calls the __isWithin method on the DisplayObjects.
	Note that this function starts with the highets objects and goes downward, stopping when the first object tells it is concerned by the event
	@type Array
	*/
	__getConcernedChilds: function(x, y){
		var concerned = [];
		
		for (var i = this.childs.length; i-- > 0;) {
			if (Cannon.Utils.instanceOf(this.childs[i], Cannon.DisplayObject) && this.childs[i].visible){
				concerned = concerned.concat(this.childs[i].__isWithin(x, y));
			}
		}

		return concerned;
	}
});

Cannon.Canvas = Cannon.ChildSystem.extend({
	/**
	@constructor
	Creates a new canvas within the given element
	@param (Element) element The html element in wich the canvas will be created
	@param (Object) options A set of options. Supported properties are width, height and framerate
	*/
	__construct: function(element, options){
		this._super(false);
		options = (options || {});

		if (!Cannon.Utils.instanceOf(element, Element)) element = document.getElementById(element.toString());
		if (element == null) return false;
		else this.element = element;
		
		this.width = (options.width || Cannon.Utils.getElementWidth(this.element) || 1);
		this.height = (options.height || Cannon.Utils.getElementHeight(this.element) || 1);

		this.canvas = document.createElement('canvas');
		this.canvas.setAttribute('width', this.width);
		this.canvas.setAttribute('height', this.height);
		this.canvas.setAttribute('tabindex', 0);
		this.element.appendChild(this.canvas);
		
		this.context = this.canvas.getContext('2d');
		
		this.fps = 0;
		this.startFPS = Cannon.Utils.microtime();
		this.endFPS = this.startFPS;
		this.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		this.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
		this.animationFrameId = 0;
		
		this.mouseX = 1;
		this.mouseY = 1;

		//@FIXME : essayer d'enlever cette dépendance
		this.matrix = new Cannon.Math.Matrix();
		this.x = 0;
		this.y = 0;
		this.scaleX = 1;
		this.scaleY = 1;
		this.rotation = 0;
		
		this.hovered = [];//list of hovered elements
		this.heldKeys = [];//list of keys that are currently held down

		this.canvas.addEventListener('click', Cannon.Utils.bind(this.__onClick, this), false);
		this.canvas.addEventListener('mousemove', Cannon.Utils.bind(this.__onMouseMove, this), false);
		this.canvas.addEventListener('mousedown', Cannon.Utils.bind(this.__onMouseDown, this), false);
		this.canvas.addEventListener('mouseup', Cannon.Utils.bind(this.__onMouseUp, this), false);
		this.canvas.addEventListener('focus', Cannon.Utils.bind(function(){
			Cannon.Event.fire(this.canvas, 'canvas:focus', {canvas: this, context: this.context, mouseX: this.mouseX, mouseY: this.mouseY});
		}, this), false);
		this.canvas.addEventListener('blur', Cannon.Utils.bind(function(){
			Cannon.Event.fire(this.canvas, 'canvas:blur', {canvas: this, context: this.context, mouseX: this.mouseX, mouseY: this.mouseY});
		}, this), false);
		this.canvas.addEventListener('contextmenu', Cannon.Utils.bind(function(){
			Cannon.Event.fire(this.canvas, 'canvas:contextmenu', {canvas: this, context: this.context, mouseX: this.mouseX, mouseY: this.mouseY});
			if (!this.allowRightClick) return false;
		}, this), false);
		this.canvas.addEventListener('keydown', Cannon.Utils.bind(this.__onKeyEvent, this, 'keydown'), false);
		this.canvas.addEventListener('keyup', Cannon.Utils.bind(this.__onKeyEvent, this, 'keyup'), false);
		this.canvas.addEventListener('keypress', Cannon.Utils.bind(this.__onKeyEvent, this, 'keypress'), false);
		
		this.allowRightClick = true;
		
		this.__render();
		
		Cannon.Logger.log('A new Canvas has been successfully created');
	},
	/**
	Sets the compositing moe for the canvas
	@param (String) compositing
	*/
	setGlobalCompositing: function(compositing){
		this.context.globalCompositeOperation = compositing;
	},
	/**
	Clears the content of the canvas
	*/
	clear: function(){
		this.context.clearRect(0, 0, this.width, this.height);
	},
	/**
	The loop that renders the animation
	*/
	__render: function(){
		Cannon.Event.fire(this.canvas, 'canvas:render', {canvas: this, context: this.context, mouseX: this.mouseX, mouseY: this.mouseY})
		this.animationFrameId = this.requestAnimationFrame.call(window, Cannon.Utils.bind(this.__render, this), this.canvas);
		
		this.clear();

		//apply the canvas specific matrix
		var m = this.matrix.clone();
		m.translate(-this.x, -this.y);
		m.scale(this.scaleX, this.scaleY);
		m.rotate(this.rotation);
		
		var childs = this.childs;
		for (var i = 0, l = childs.length; i < l; i++) {
			if (Cannon.Utils.instanceOf(childs[i], Cannon.DisplayObject) && childs[i].visible){
				this.context.save();
				this.context.beginPath();
				childs[i].__render(this.context, m);
				this.context.closePath();
				this.context.restore();
			}
		}
		
		Cannon.Event.fire(this.canvas, 'canvas:afterrender', {canvas: this, context: this.context, mouseX: this.mouseX, mouseY: this.mouseY});
		
		this.endFPS = Cannon.Utils.microtime();
		var fps = Math.round(1000/(this.endFPS-this.startFPS));
		Cannon.Event.fire(this.canvas, 'canvas:FPS', {fps: fps});
		this.startFPS = Cannon.Utils.microtime();
	},
	stopRendering: function(){
		this.cancelAnimationFrame.call(window, this.animationFrameId);
	},
	/**
	Called when a click inside the canvas is detected
	*/
	__onClick: function(event){
		Cannon.Event.fire(this.canvas, 'canvas:click', {mouseX: this.mouseX, mouseY: this.mouseY});
		
		var concerned = this.__getConcernedChilds(this.mouseX, this.mouseY);
		for (var i = 0, l = concerned.length; i < l; i++) Cannon.Event.fire(concerned[i].__eventElement, 'click', {eventTarget: concerned[i]});
	},
	/**
	Called when the mouse moves inside the canvas
	*/
	__onMouseMove: function(event){
		//recalculating the mouse position
		var offsetLeft = offsetTop = 0;
		var element = this.element;
		
		do{
			offsetLeft += element.offsetLeft;
			offsetTop += element.offsetTop;
		}
		while (element = element.offsetParent);
		
		offsetTop -= (document.documentElement.scrollTop || document.body.scrollTop)-document.documentElement.clientTop;
		offsetLeft -= (document.documentElement.scrollLeft || document.body.scrollLeft)-document.documentElement.clientLeft;

		this.mouseX = event.clientX-offsetLeft;
		this.mouseY = event.clientY-offsetTop;
		
		//firing the mousemove event
		Cannon.Event.fire(this.canvas, 'canvas:mousemove', {mouseX: this.mouseX, mouseY: this.mouseY});
		var concerned = this.__getConcernedChilds(this.mouseX, this.mouseY);
		for (var i = 0, l = concerned.length; i < l; i++){
			Cannon.Event.fire(concerned[i].__eventElement, 'mousemove', {eventTarget: concerned[i]});
			
			//mouseover checking
			if (this.hovered.indexOf(concerned[i]) < 0){
				Cannon.Event.fire(concerned[i].__eventElement, 'mouseover', {eventTarget: concerned[i]});
				this.hovered.push(concerned[i]);
			}
		}
		
		//mouseout stuff
		var hovered = this.hovered;
		for (var i = 0, l = hovered.length; i < l; i++){
			if (concerned.indexOf(hovered[i]) < 0){
				//DisplayObject is not concerned any longer
				Cannon.Event.fire(hovered[i].__eventElement, 'mouseout', {eventTarget: hovered[i]});
				this.hovered = Cannon.Utils.arrayWithout(hovered, hovered[i]);
				i--;
				l--;
			}
		}
	},
	/**
	Called when the mousedown event is fired in the canvas
	*/
	__onMouseDown: function(event){
		Cannon.Event.fire(this.canvas, 'canvas:mousedown', {mouseX: this.mouseX, mouseY: this.mouseY});
		var concerned = this.__getConcernedChilds(this.mouseX, this.mouseY);
		for (var i = 0, l = concerned.length; i < l; i++) Cannon.Event.fire(concerned[i].__eventElement, 'mousedown', {eventTarget: concerned[i]});
	},
	/**
	Called when the mouseup event is fired in the canvas
	*/
	__onMouseUp: function(event){
		Cannon.Event.fire(this.canvas, 'canvas:mouseup', {mouseX: this.mouseX, mouseY: this.mouseY});
		var concerned = this.__getConcernedChilds(this.mouseX, this.mouseY);
		for (var i = 0, l = concerned.length; i < l; i++) Cannon.Event.fire(concerned[i].__eventElement, 'mouseup', {eventTarget: concerned[i]});
	},
	/**
	Proxy method for all key events
	*/
	__onKeyEvent: function(type, event){
		var key = Cannon.Utils.keys[event.keyCode] || event.keyCode;

		var params = {keyCode: event.keyCode, 
					  key: key, 
					  ctrlKey: event.ctrlKey, 
					  altKey: event.altKey, 
					  metaKey: event.metaKey, 
					  shiftKey: event.shiftKey, 
					  mouseX: this.mouseX, 
					  mouseY: this.mouseY};
	
		Cannon.Event.fire(this.canvas, 'canvas:'+type, params);
		Cannon.Event.fire(this.canvas, 'canvas:'+type+':'+key, params);

		//tracking des touches appuyés
		if (type === 'keydown' && this.heldKeys.indexOf(key) < 0) this.heldKeys.push(key);
		else if (type === 'keyup') this.heldKeys = Cannon.Utils.arrayWithout(this.heldKeys, key);
	},
	/**
	Registers a new event listener on the canvas
	@param (String) type Name of the event
	@param (Funtion) handler Callback function
	*/
	on: function(type, handler){
		Cannon.Event.on(this.canvas, type, handler);
	},
	/**
	Unregisters an event listener on the canvas
	@param (String) type Name of the event
	@param (Funtion) handler Callback function
	*/
	stopListening: function(type, handler){
		Cannon.Event.stopListening(this.canvas, type, handler);
	},
	/**
	Changes the cursor used for the canvas. This uses the css cursor property, with all the limitations and browser specificities it has.
	@param (String) src : the path to the cursor you want to use. Can also be a keyword, ie. pointer, wait, etc
	*/
	changeCursor: function(src){
		this.element.style['cursor'] = "url('"+src+"'), auto";
	},
	/**
	Checks if the given key is currently held down
	@param (String | Integer) key : The key to look for, either as the keyCode or one of the known key strings
	*/
	keyIsDown: function(key){
		if (Cannon.Utils.isNumber(key)) key = Cannon.Utils.keys[key] || key;
		return (this.heldKeys.indexOf(key) >= 0) ? true : false;
	},
	toDataURL: function(){
		return this.canvas.toDataURL.apply(this.canvas, arguments);
	},
});

/**
A singleton that returns an instance of CanvasRenderingContext (needed to create gradients among other things). Also contains some constants.
*/
Cannon.Context = {
	/**
	Returns an instance of a CanvasRenderingContext that can be used to create things when needed.
	*/
	getInstance: function(context){
		if (this.context) return this.context;
		else{
			//@TODo : try instanciating a CanvasRenderingContext
			this.canvas2d = document.createElement('canvas');
			this.context = this.canvas2d.getContext('2d');
			return this.context;
		}
	},

	LineCap: {BUTT: 'butt', ROUND: 'round', SQUARE: 'square'},
	LineJoin: {ROUND: 'round', BEVEL: 'bevel', MITER: 'miter'},
	TextAlign: {START: 'start', END: 'end', LEFT: 'left', RIGHT: 'right', CENTER: 'center'},
	TextBaseline: {TOP: 'top', HANGING: 'hanging', MIDDLE: 'middle', ALPHABETIC: 'alphabetic', IDEOGRAPHIC: 'ideographic', BOTTOM: 'bottom'},
	TextRenderStyle: {FILL: 'fill', STROKE:' stroke'},
	Compositing: {SourceOver: 'source-over', SourceIn: 'source-in', SourceOut:'source-out', SourceAtop: 'source-atop', DestinationOver: 'destination-over', DestinationIn: 'destination-in', DestinationOut: 'destination-out', DestinationAtop: 'destination-atop', Lighter: 'lighter', Copy: 'copy', Xor: 'xor'},
	Repeat: {Repeat: 'repeat', RepeatX: 'repeat-x', RepeatY: 'repeat-y', NoRepeat: 'no-repeat'}
};

/**
This is the base class that all objects thta are to be displayed inherit from
*/
Cannon.DisplayObject = Cannon.ChildSystem.extend({
	/**
	@constructor
	*/
	__construct: function(){
		this._super(false);
		this.__depth = null;
		this.__parent = null;

		this.strokeStyle = "rgba(0,0,0,255)";
		this.fillStyle = "rgba(0,0,0,255)";
		this.alpha = 1;
		this.lineWidth = 2;
		this.lineJoin = Cannon.Context.LineJoin.MITER;
		this.lineCap = Cannon.Context.LineCap.BUTT;
		this.miterLimit = 10;
		this.shadowOffsetX = 0;
		this.shadowOffsetY = 0;
		this.shadowBlur = 0;
		this.shadowColor = "rgba(0,0,0,0)";
		
		this.rotation = 0;
		this.radians = 0;

		this.visible = true;
		
		this.matrix = null;
		this.masks = [];
		this.filters = [];
		
		this.__eventElement = document.createElement('div');
		this.__hover = false;//mouseover/mouseout detection
	},
	/**
	Renders the DisplayObject and its childs
	*/
	__render: function(ctx, heritage){
		Cannon.Event.fire(this.__eventElement, 'render');
		if (this.__applyFilters(ctx, heritage)) return;
		this.__applyMasks(ctx);
		this.__applyStyles(ctx);
		var m = this.__applyMatrix(ctx, heritage);
		if (this.childs.length > 0) this.__recursiveRender(ctx, m);
	},
	/**
	Calls the render method of all childs
	@param (CanvasRenderingContext) ctx The context
	@param (Object) heritage The properties the child inherit from theire parent
	*/
	__recursiveRender: function(ctx, heritage){
		for (var i = 0, l = this.childs.length; i < l; i++) {
			var child = this.childs[i];
			if (Cannon.Utils.instanceOf(child, Cannon.DisplayObject) && child.visible){
				ctx.save();
				ctx.beginPath();
				child.__render(ctx, heritage);
				ctx.closePath();
				ctx.restore();
			}
		}
	},
	__applyMasks: function(ctx){
		var l = this.masks.length;
		
		for (var i = 0; i < l; i++){
			if (Cannon.Utils.instanceOf(this.masks[i], Cannon.DisplayObject)){
				this.masks[i].alpha = 0;
				this.masks[i].__render(ctx);
			}
		}
		
		if (l > 0) ctx.clip();
	},
	__applyMatrix: function(ctx, heritage){
		var m = new Cannon.Math.Matrix();
		if (Cannon.Utils.instanceOf(this.matrix, Cannon.Math.Matrix)) m.multiply(this.matrix);//own matrix
		if (Cannon.Utils.instanceOf(heritage, Cannon.Math.Matrix)) m.multiply(heritage);//parent matrix
		m.override(ctx);
		
		return m;
	},
	/**
	Addapts the canvas context to the DisplayObject
	@param (CanvasRenderingContext) ctx The context to addapt
	*/
	__applyStyles: function(ctx){
		ctx.globalAlpha = this.alpha;
		ctx.lineWidth = this.lineWidth;
		ctx.lineJoin = this.lineJoin;
		ctx.lineCap = this.lineCap;
		ctx.miterLimit = this.miterLimit;
		ctx.shadowOffsetX = this.shadowOffsetX;
		ctx.shadowOffsetY = this.shadowOffsetY;
		ctx.shadowBlur = this.shadowBlur;
		ctx.shadowColor = this.shadowColor;
		
		//enforce rotation
		this.radians = Cannon.Utils.degreesToRadians(this.rotation);

		//@FIXME
		var fillStyle;
		if (Cannon.Utils.isString(this.fillStyle)) fillStyle = this.fillStyle;
		else if (Cannon.Utils.instanceOf(this.fillStyle, Cannon.Misc.Color)) fillStyle = this.fillStyle.generate();
		else if (Cannon.Utils.instanceOf(this.fillStyle, Cannon.Misc.Gradient)) fillStyle = this.fillStyle.generate();
		else if (Cannon.Utils.instanceOf(this.fillStyle, Cannon.Misc.Pattern)) fillStyle = this.fillStyle.generate();
		else if (Cannon.Utils.instanceOf(this.fillStyle, CanvasPattern)) fillStyle = this.fillStyle;
		else if (Cannon.Utils.instanceOf(this.fillStyle, CanvasGradient)) fillStyle = this.fillStyle;
		ctx.fillStyle = fillStyle;

		var strokeStyle;
		if (Cannon.Utils.isString(this.strokeStyle)) strokeStyle = this.strokeStyle;
		else if (Cannon.Utils.instanceOf(this.strokeStyle, Cannon.Misc.Color)) strokeStyle = this.strokeStyle.generate();
		else if (Cannon.Utils.instanceOf(this.strokeStyle, Cannon.Misc.Gradient)) strokeStyle = this.strokeStyle.generate();
		else if (Cannon.Utils.instanceOf(this.strokeStyle, Cannon.Misc.Pattern)) strokeStyle = this.strokeStyle.generate();
		else if (Cannon.Utils.instanceOf(this.strokeStyle, CanvasPattern)) strokeStyle = this.strokeStyle;
		else if (Cannon.Utils.instanceOf(this.strokeStyle, CanvasGradient)) strokeStyle = this.strokeStyle;
		ctx.strokeStyle = strokeStyle;
	},
	__applyFilters: function(ctx, heritage){
		var l = this.filters.length;
		//@TODO : get the canvas widt and height
		for (var i = 0; i < l; i++){
			this.filters[i].apply(this, ctx, heritage, this.__parent.width, this.__parent.height);
		}
		
		if (l > 0) return true;
		else return false;
	},
	/**
	Proxy method to register event listeners
	@param (String) type Name of the event
	@param (Funtion) handler Callback function
	*/
	on: function(type, handler){
		Cannon.Event.on(this.__eventElement, type, handler);
	},
	/**
	Unregisters an event listener
	@param (String) type Name of the event
	@param (Funtion) handler Callback function
	*/
	stopListening: function(type, handler){
		Cannon.Event.stopListening(this.__eventElement, type, handler);
	},
	/**
	Changes the shadow of the current element
	*/
	setShadow: function(x, y, blur, color){
		this.shadowOffsetX = x || 0;
		this.shadowOffsetY = y || 0;
		this.shadowBlur = blur || 0;
		this.shadowColor = color || "rgba(0,0,0,0)";
	},
	addMask: function(mask){
		this.masks.push(mask);
	},
	/**
	Checks if the x and y coordonates are within the DisplayObject or one of it childs
	*/
	__isWithin: function(x, y){
		return this.__getConcernedChilds(x, y);
	},
	toString: function(){
		return 'Cannon.DisplayObject';
	}
});

Cannon.Logger.log('Cannon core classes loaded, now proceeding with the additionnal classes...');

//Exceptions
//This is probably shit, theframework should not catch these errors. But it might come in handy at times.
/*window.addEventListener('error', function(){
	//if (Cannon.Logger) Cannon.Logger.log('An uncaught exception has occured', Cannon.Logger.Error);
}, false);-*/

//watch for the ready event
(function(){
	var scripts = document.getElementsByTagName('head')[0].getElementsByTagName('script');
	for (var i = 0; i < scripts.length; i++){
		if (scripts[i].getAttribute('src').indexOf('cannon.js')){
			var src = scripts[i].getAttribute('src');
			libPath = src.substring(0, src.indexOf('cannon.js'));
			Cannon.Logger.log('Library path detected as beeing '+libPath);
			Cannon.libPath = libPath;
		}
	}

	if (document.addEventListener) {
		DOMContentLoaded = function() {
			document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
			Cannon.Utils.bind(Cannon.__loaded, Cannon);
		};
	} 
	else if (document.attachEvent) {
		DOMContentLoaded = function() {
			if (document.readyState === "complete") {
				document.detachEvent( "onreadystatechange", DOMContentLoaded);
				Cannon.Utils.bind(Cannon.__loaded, Cannon);
			}
		};
	}

	if (document.addEventListener) {
		document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
		window.addEventListener("load", Cannon.Utils.bind(Cannon.__loaded, Cannon), false);
	} 
	else if (document.attachEvent) {
		document.attachEvent("onreadystatechange", DOMContentLoaded);
		window.attachEvent("onload", Cannon.Utils.bind(Cannon.__loaded, Cannon));
	}
})();