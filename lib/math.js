/**
A point with x and y properties
*/
Cannon.Math.Point2D = Cannon.ClassFactory.extend({
	/**
	@constructor
	@param (Number) x
	@param (Number) y
	*/
	__construct: function(x, y){
		this.x = (x || 0);
		this.y = (y || 0);
	},
	/**
	Computes the length from (0,0) to tthis point
	@type Number
	*/
	length: function(){
		return (Math.sqrt((this.x*this.x) + (this.y*this.y)));
	},
	/**
	Clones the current point
	@type Point2D
	*/
	clone: function(){
		return new Cannon.Math.Point2D(this.x, this.y);
	},
	/**
	Adds the coordinates of another point to the coordinates of this point
	@param (Point2D) p
	@type (Point2D)
	*/
	add: function(p){
		if (Cannon.Utils.instanceOf(p, Cannon.Math.Point2D)){
			this.x += p.x;
			this.y += p.y;
		}
		
		return this;
	},
	/**
	 Subtracts the coordinates of another point from the coordinates of this point
	@param (Point2D) p
	@type (Point2D)
	*/
	substract: function(p){
		if (Cannon.Utils.instanceOf(p, Cannon.Math.Point2D)){
			this.x -= p.x;
			this.y -= p.y;
		}
		
		return this;
	},
	/**
	Determines whether two points are equal
	@param (Point2D) p
	@type Boolean
	*/
	equals: function(toCompare){
		return (this.x == toCompare.x && this.y == toCompare.y);
	},
	/**
	Offsets the Point object by the specified amount.
	@param (Number) dx X offset
	@param (Number) dy Y offset
	*/
	offset: function(dx, dy){
		this.x += dx;
		this.y += dy;
		
		return this;
	},
	/**
	Returns a string representation of the point
	@type String
	*/
	toString: function(){
		return '(x='+this.x+', y='+this.y+')';
	}
});

//statisc methods
/**
Determines a point between two specified points.
@type Point2D
*/
Cannon.Math.Point2D.interpolate = function(p1, p2, f)
{
	f = f || .5;
	var p = new Cannon.Math.Point2D();
	if (Cannon.Utils.instanceOf(p1, Cannon.Math.Point2D) && Cannon.Utils.instanceOf(p2, Cannon.Math.Point2D)){
		var f = (parseFloat(f) || 0.5);
		p.x = (p1.x+p2.x)*f;
		p.y = (p1.y+p2.y)*f;
	}
	else Cannon.Logger.log('Cannon.Math.Point2D::interpolate expects first 2 arguments to be instances of Cannon.Math.Point2D');
	
	return p;
}
/**
Converts a pair of polar coordinates to a Cartesian point coordinate
@type Point2D
*/
Cannon.Math.Point2D.polar = function(length, angle){
	var p = new Cannon.Math.Point2D();
	length = (length || 0);
	angle = (angle || 0);
	p.x = length*Math.cos(angle);
	p.y = length*Math.sin(angle);
	return p;
}

/**
A vertex class used for geometrical shapes. Has x and y properties as well as 2 control points 
*/
Cannon.Math.Vertex2D = Cannon.ClassFactory.extend({
	/**
	This constructor accepts both numbers and Point2D as parameters. 
	You can define up to 3 points, each one either as a Point2D or as 2 arguments defining x and y.
	The 3 points are respectively x and y coodinates of the vertex, its first control point and itssecond control points.
	Control points are optionnal, if none is defined, using the vertex in a shape will result in a straight line. If only one is prvided, the second will take the same value.
	@constructor
	*/
	__construct: function(){
		//main point
		this.point = this.__processPoint(arguments[0], arguments[0], arguments[1]);
		if (!this.point){
			Cannon.Logger.log('Failed to create new Vertex2D with given arguments', Cannon.Logger.Warning);
			this.point = new Point2D(0,0);
		}
		//control point 1
		this.controlPoint1 = this.__processPoint(arguments[1], arguments[2], arguments[3]) || this.point.clone();
		//control point 2
		this.controlPoint2 = this.__processPoint(arguments[2], arguments[4], arguments[5]) || this.point.clone();
	},
	__processPoint: function(point, x, y){
		//returns an object because we dont need all the methods asssociated with Point2D
		if (Cannon.Utils.instanceOf(point, Cannon.Math.Point2D) || (point && point.x && point.y)){
			return new Cannon.Math.Point2D(point.x, point.y);
		}
		else if (Cannon.Utils.isNumber(x) && Cannon.Utils.isNumber(y)){
			return new Cannon.Math.Point2D(x, y);
		}
		else{
			return null;
		}
	},
	/**
	Converts the vertex into an array [cp1x, cp1y, cp2x, cp2y, x, y] that can be used with bezierCurveTo
	*/
	toArray: function(prev){
		return [this.controlPoint1.x, this.controlPoint1.y, this.controlPoint2.x, this.controlPoint1.y, this.point.x, this.point.y];
	},
	toString: function(){
		return '['+this.controlPoint1.x+', '+this.controlPoint1.y+', '+this.controlPoint2.x+', '+this.controlPoint2.y+', '+this.point.x+', '+this.point.y+']';
	}
});

/**
Represents a 2D vector
*/
Cannon.Math.Vector2D = Cannon.ClassFactory.extend({
	/**
	@constructor
	@param (Number) x
	@param (Number) y
	*/
	__construct: function(x, y){
		this.x = x;
		this.y = y;
	},
	/**
	Clones thecurrent vector
	@type Vector2D
	@return A new vector
	*/
	clone: function(){
		return new Cannon.Math.Vector2D(this.x, this.y);
	},
	/**
	Adds another vector to this
	@param (Vector2D) v2
	@type Vector2D
	@return this
	*/
	add: function(v2){
		this.x += v2.x;
		this.y += v2.y;
		return this;
	},
	/**
	Substracts a vector from this
	@param (Vector2D) v2
	@type Vector2D
	@return this
	*/
	substract: function(v2){
		this.x -= v2.x;
		this.y -= v2.y;
		
		return this;
	},
	/**
	Multiplies the current vector by a given value
	@param (Number) number The value to multiply the vector by
	*/
	multiply: function(number){
		this.x *= number;
		this.y *= number;
		
		return this;
	},
	/**
	Determines whether two vectors are equal
	@param (Vector2D) toCompare
	@type Boolean
	*/
	equals: function(toCompare){
		return (this.x == toCompare.x && this.y == toCompare.y);
	},
	/**
	Computes the length of the current vector
	@type Number
	*/
	length: function(){
		return (Math.sqrt((this.x*this.x) + (this.y*this.y)));
	},
	/**
	Normalizes the current vector
	@type Vector2D
	*/
	normalize: function(){
		var l = this.length();
		if( l != 0){
			this.x /= l;
			this.y /= l;
		}
		
		return this;
	},
	/**
	Returns the right normal of the current vector
	@type Vector2D
	@return A new vector
	*/
	rightNormal: function(){
		return new Cannon.Math.Vector2D( this.y * -1, this.x);
	},
	/**
	Returns the left normal of the current vector
	@type Vector2D
	@return A new vector
	*/
	leftNormal: function(){
		return new Cannon.Math.Vector2D( this.y, this.x * -1);
	},
	/**
	Returns a bector representing the direction of the current vector
	@type Vector2D
	@return A new vector
	*/
	dir: function(){
		var v = this.clone().normalize();
		return v;
	},
	/**
	Projects this onto v2
	@param (Vector2D) v2
	@type Vector2D
	@return A new vector
	*/
	proj: function(v2){
		var den = v2.dotProduct(v2);
		if( den == 0){
			Cannon.Logger.log('Vector2D.proj was called with a 0 length vector', Cannon.Logger.Warning);
			var v = this.clone();
		}
		else{
			var v = v2.clone().multiply(this.dotProduct(v2)/den);
		}
	
		return v;
	},
	/**
	Retuns the projection length of this and v2
	@param (Vector2D) v2
	@type Number
	*/
	projLength: function(v2){
		var den = v2.dotProduct(v2);
		if( den == 0){
			Cannon.Logger.log('Vector2D.projLength was called with a 0 length vector', Cannon.Logger.Warning);
			return 0;
		}
		else{
			return Math.abs(this.dotProduct(v2)/den);
		}
	},
	/**
	Computes the dot product of this and v2
	@param (Vector2D) v2
	@type Number
	*/
	dotProduct: function(v2){
		return ((this.x * v2.x) + (this.y * v2.y));
	},
	/**
	Computes the cross product of this and v2
	@param (Vector2D) v2
	@type Number
	*/
	crossProduct: function(v2){
		return ((this.x * v2.y) - (this.y * v2.x));
	},
	/**
	Returns a string representation of the vector
	@type String
	*/
	toString: function(){
		return '(x='+this.x+', y='+this.y+')';
	}
});