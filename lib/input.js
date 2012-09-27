Cannon.registerPackage('Input');

Cannon.Input.VideoInput = Cannon.ClassFactory.extend({
	__construct: function(){
		this.videoElement = document.createElement('video');
		this.videoElement.autoplay = true;
		this.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
							navigator.mozGetUserMedia || navigator.msGetUserMedia;
		this.stream = null;
		
		this.width = this.height = 0;
	},
	startCapture: function(){
		var params = [{ video: true}, 
						Cannon.Utils.bind(this.onSuccess, this),
						Cannon.Utils.bind(this.onFail, this)];
		this.getUserMedia.apply(navigator, params);
	},
	/**
	Registers a new event listener on the canvas
	@param (String) type Name of the event
	@param (Funtion) handler Callback function
	*/
	on: function(type, handler){
		Cannon.Event.on(this.videoElement, type, handler);
	},
	onSuccess: function(stream){
		this.stream = stream;
		try{
			this.videoElement.src = window.URL.createObjectURL(stream);
		}
		catch (e){
			this.videoElement.src = stream;
		}
		
		this.videoElement.play();
		Cannon.Logger.log('Starting VideoInput stream...');
		
		//It takes a little time before the stream actually starts
		var listener = Cannon.Utils.bind(function(){
			Cannon.Logger.log('init');
			if (this.videoElement.videoWidth > 0){
				this.videoElement.removeEventListener('canplay', listener);
				this.init();
			}
		}, this);
		this.videoElement.addEventListener('canplay', listener, false);
	},
	onFail: function(){
		Cannon.Event.fire(this.videoElement, 'videoinput:fail');
		Cannon.Logger.log('Unable to fetch the users video input', Cannon.Logger.Warning);
	},
	init: function(){
		this.width = this.videoElement.videoWidth;
		this.height = this.videoElement.videoHeight;
		
		Cannon.Logger.log('VideoInput stream started');
		Cannon.Event.fire(this.videoElement, 'videoinput:start');
	}
});