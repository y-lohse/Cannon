//dependancy on math
Cannon.registerPackage('SAT');

Cannon.SAT.CollisionSolver = {};
Cannon.SAT.CollisionSolver.solveCollsion = function(object1, object2){
	if (Cannon.Utils.instanceOf(object1, Cannon.SAT.BoundingBox) &&
	    Cannon.Utils.instanceOf(object2, Cannon.SAT.BoundingBox)){
		return Cannon.SAT.CollisionSolver.solveBoxBoxCollision(object1, object2);
	}
	else if (Cannon.Utils.instanceOf(object1, Cannon.SAT.BoundingCircle) &&
		 Cannon.Utils.instanceOf(object2, Cannon.SAT.BoundingCircle)){
		return Cannon.SAT.CollisionSolver.solveCircleCircleCollision(object1, object2);
	}
	else if ((Cannon.Utils.instanceOf(object1, Cannon.SAT.BoundingBox) &&
		 Cannon.Utils.instanceOf(object2, Cannon.SAT.BoundingCircle)) ||
		 (Cannon.Utils.instanceOf(object2, Cannon.SAT.BoundingBox) &&
		 Cannon.Utils.instanceOf(object1, Cannon.SAT.BoundingCircle))
		){
		return (Cannon.Utils.instanceOf(object1, Cannon.SAT.BoundingBox)) ? Cannon.SAT.CollisionSolver.solveBoxCircleCollision(object1, object2) : Cannon.SAT.CollisionSolver.solveBoxCircleCollision(object2, object1);
	}
	else{
		Cannon.Logger.log('Unable to solve collision');
	}
};
Cannon.SAT.CollisionSolver.collideOnAxis = function(vectorsBox1, vectorsBox2, axis){
	var dpBox1 = Cannon.SAT.CollisionSolver.getMinMaxDPs(vectorsBox1, axis);
	var dpBox2 = Cannon.SAT.CollisionSolver.getMinMaxDPs(vectorsBox2, axis);
	
	var separate = dpBox1[1] < dpBox2[0] || dpBox2[1] < dpBox1[0];
	if (!separate){
		//collision
		var vector = axis.clone();
		var smallestProjection = Math.abs(dpBox2[1]-dpBox1[0]) < Math.abs(dpBox1[1]-dpBox2[0]);
		vector.multiply((smallestProjection) ? dpBox2[1]-dpBox1[0] : dpBox1[1]-dpBox2[0]);
		if (!smallestProjection) vector.multiply(-1);

		return vector;
	}
	else return false;
};
Cannon.SAT.CollisionSolver.getMinMaxDPs = function(vectors, axis){
	var minDP, maxDP;
	minDP = maxDP = vectors[0].dotProduct(axis);
	
	for (var i = 1; i < vectors.length; i++){
		var curDP = vectors[i].dotProduct(axis);
		if (curDP > maxDP){
			maxDP = curDP;
		}
		if (curDP < minDP){
			minDP = curDP;
		}
	}
	
	return [minDP, maxDP];
};
Cannon.SAT.CollisionSolver.solveBoxBoxCollision = function(box1, box2){
	var normalsBox1 = box1.getNormals();
	var normalsBox2 = box2.getNormals();

	for (var i = 0; i < normalsBox1.length; i++){
		normalsBox1[i].normalize();
		normalsBox2[i].normalize();
	}

	var vectorsBox1 = [];
	var vectorsBox2 = [];
	for (var i = 0; i < 4; i++){
		var corner1 = box1.getCorner(i);
		vectorsBox1.push(new Cannon.Math.Vector2D(corner1.x, corner1.y));

		var corner2 = box2.getCorner(i);
		vectorsBox2.push(new Cannon.Math.Vector2D(corner2.x, corner2.y));
	}
	
	var result = new Cannon.SAT.CollisionResult(box1, box2);
	var axes = [normalsBox1[0], normalsBox1[1], normalsBox2[0], normalsBox2[1]];

	for (var i = 0; i < axes.length; i++){
		var colliding = Cannon.SAT.CollisionSolver.collideOnAxis(vectorsBox1, vectorsBox2, axes[i]);
		if (colliding) result.addCollisionVector(colliding);
		else result.colliding = false;
	}

	return result;
};
Cannon.SAT.CollisionSolver.solveCircleCircleCollision = function(circle1, circle2){
	var result = new Cannon.SAT.CollisionResult(circle1, circle2);
	
	var radiis = circle1.radius+circle2.radius;
	var distance = Cannon.Math.Utils.distance(circle1, circle2);
	if (distance > radiis){
		result.colliding = false;
	}
	else{
		var vector = new Vector2D(circle1.x-circle2.x, circle1.y-circle2.y);
		vector.normalize();
		vector.multiply(radiis-distance);
	
		//exact overlapping, pick any axis, there is no right one
		if (vector.length() === 0) vector.x = radiis;
		result.addCollisionVector(vector);
	}
	
	return result;
};
Cannon.SAT.CollisionSolver.solveBoxCircleCollision = function(box, circle){
	var normalsBox = box.getNormals();

	for (var i = 0; i < normalsBox.length; i++){
		normalsBox[i].normalize();
	}

	var vectorsBox = [];
	for (var i = 0; i < 4; i++){
		var corner = box.getCorner(i);
		vectorsBox.push(new Cannon.Math.Vector2D(corner.x, corner.y));
	}
	
	var axes = [normalsBox[0], normalsBox[1]];
	var result = new Cannon.SAT.CollisionResult(box, circle);

	for (var i = 0; i < axes.length; i++){
		var axis = axes[i];
		var dpBox = Cannon.SAT.CollisionSolver.getMinMaxDPs(vectorsBox, axis);

		var circleMin = axis.clone();
		circleMin.multiply(circle.radius);
		circleMin.x += circle.x;
		circleMin.y += circle.y;
		circleMin = circleMin.dotProduct(axis);

		var circleMax = axis.clone();
		circleMax.multiply(circle.radius*-1);
		circleMax.x += circle.x;
		circleMax.y += circle.y;
		circleMax = circleMax.dotProduct(axis)

		var dpCircle = [Math.min(circleMin, circleMax), Math.max(circleMin, circleMax)];

		var separate = dpBox[1] < dpCircle[0] || dpCircle[1] < dpBox[0];
		if (separate){
			result.colliding = false;
		}
		else {
			var vector = axis.clone();
			var smallestProj = Math.abs(dpCircle[1]-dpBox[0]) < Math.abs(dpBox[1]-dpCircle[0]);
			vector.multiply((smallestProj) ? dpCircle[1]-dpBox[0] : dpBox[1]-dpCircle[0]);
			if (smallestProj) vector.multiply(-1);

			result.addCollisionVector(vector);
		}

	}

	return result;
};
Cannon.SAT.CollisionResult = Cannon.ClassFactory.extend({
	__construct: function(object1, object2){
		this.object1 = object1;
		this.object2 = object2;
		this.colliding = true;
		this.collisions = [];
	},
	addCollisionVector: function(vector){
		var vectorLength = vector.length();
		var insertIndex = this.collisions.length;
		for (var i = 0; i < this.collisions.length; i++){
			if (insertIndex === this.collisions.length && this.collisions[i].length() > vectorLength) insertIndex = i;
			
			if (vector.equals(this.collisions[i])) return;//same vectors
		}

		this.collisions.splice(insertIndex, 0, vector);
	},
	toString: function(){
		return 'CollisionResult between '+this.object1.toString()+' '+this.object2.toString()+' : '+this.colliding;
	}
});

Cannon.SAT.BoundingBox = Cannon.ClassFactory.extend({
	__construct: function(x, y, width, height, rotation){
		this.x = (x || 0);
		this.y = (y || 0);
		this.width = (width || 0);
		this.height = (height || 0);
		this.rotation = (rotation || 0);
	},
	getCenter: function(){
		return new Cannon.Math.Point2D(this.x+this.width/2, this.y+this.height/2);
	},
	getCorner: function(index){
		var center = this.getCenter();	
		var p = new Cannon.Math.Vector2D();
		
		switch (index){
			case 1://top right
				p.x = this.x+this.width;
				p.y = this.y;
				break;
			case 2://bottom right
				p.x = this.x+this.width;
				p.y = this.y+this.height;
				break;
			case 3://bottom left
				p.x = this.x;
				p.y = this.y+this.height;
				break;
			case 0://top left
			default:
				p.x = this.x;
				p.y = this.y;
				break;
		}
			
		//on passe en local
		p.x -= center.x;
		p.y -= center.y;
		
		var angle = Cannon.Utils.degreesToRadians(this.rotation);
		
		var tmpX = (p.x*Math.cos(angle))-(p.y*Math.sin(angle));
		p.y = (p.y*Math.cos(angle))+(p.x*Math.sin(angle));
		p.x = tmpX;
			
		//on repasse en global
		p.x += center.x;
		p.y += center.y;
		return p;
	},
	getNormals: function(){
		var normals = [];
		var corners = [];
		
		for (var i = 0; i < 4; i++){
			corners.push(this.getCorner(i));
		}
		
		for (var i = 0; i < corners.length-1; i++){
			normals.push(new Vector2D(corners[i+1].x-corners[i].x, corners[i+1].y-corners[i].y).leftNormal());	
		}
		
		normals.push(new Vector2D(corners[0].x-corners[corners.length-1].x, corners[0].y-corners[corners.length-1].y).leftNormal());		

		return normals;
	},
	toString: function(){
		return 'SATBoundingBox(x:'+this.x+', y:'+this.y+', width:'+this.width+', height:'+this.height+')';
	}
});

Cannon.SAT.BoundingCircle = Cannon.ClassFactory.extend({
	__construct: function(x, y, radius){
		this.x = (x || 0);
		this.y = (y || 0);
		this.radius = (radius || 0);
	},
});
