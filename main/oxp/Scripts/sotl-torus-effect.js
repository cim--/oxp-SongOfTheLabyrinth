this.name = "SOTL Torus Effect";

this.$ship = null;
this.$fcb = null;
this.$destination = null;
this.$maxSpeed = 0;

this.effectSpawned = function() {
	this.$fcb = addFrameCallback(this.torusMove.bind(this));
};

this.effectRemoved = function() {
	if (this.$fcb) {
		removeFrameCallback(this.$fcb);
		delete this.$fcb;
	}
}

this.$accumulator = 0;
this.$speed = 0;

this.torusMove = function(delta) {
	if (!this.$ship.isValid || this.visualEffect.position.distanceTo(this.$destination) < 12E3) {
//		log(this.name,"Ending torus: "+(!this.$ship.isValid)+" "+(this.visualEffect.position.distanceTo(this.$destination) < 12E3));
		this.torusEnd();
	}
	if (this.$speed < this.$maxSpeed) {
		// accelerate
		this.$speed = Math.min(this.$speed+(0.1*delta*this.$maxSpeed),this.$maxSpeed);
	}
	var egroup = this.$ship.escortGroup; 
	var objs = egroup?egroup.ships:[this.$ship];
	var mv = this.$ship.vectorForward.multiply(this.$speed * delta);
	for (var i=0;i<objs.length;i++) {
		objs[i].position = objs[i].position.add(mv);
	}
	this.visualEffect.position = this.$ship.position;

	this.$accumulator += delta;
	if (this.$accumulator > 1) {
		--this.$accumulator;
		var nearby = system.filteredEntities(this, function(e) {
			return e!=this.$ship && e.isShip && !(this.$ship.escortGroup.containsShip(e));
		}, this.visualEffect, 22.5E3);
		// must be nothing nearby except this ship's escorts, and the escorts
		// must be much closer. Uses 22.5E3 rather than full scanner range to
		// simulate braking time, for now.
		if (nearby.length > 0) {
//			log(this.name,"Ending torus: "+nearby);
			this.torusEnd();
		}
	}

};


this.torusEnd = function() {
	removeFrameCallback(this.$fcb);
	delete this.$fcb;
	if (this.$ship.isValid) {
		this.$ship.AIScript.oolite_priorityai.setParameter("sotl_torusEffect",null);
		this.$ship.AIScript.oolite_priorityai.reconsiderNow();
	}
	this.visualEffect.remove();
}