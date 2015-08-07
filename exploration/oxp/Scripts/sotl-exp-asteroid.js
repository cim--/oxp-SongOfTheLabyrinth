"use strict";

this.name = "SOTL Asteroid shipscript";

/* These variables are filled in by populator */
this.$sotlMinerals = null;
this.$sotlAsteroidIndex = null;
this.$sotlScan1 = null;
this.$sotlScan2 = null;


this.shipTakingDamage = function(a,w,t) {
	worldScripts["SOTL Equipment Management"]._registerAsteroidHit(this.ship);
	if (w.isPlayer && player.ship.forwardWeapon.equipmentKey == "EQ_WEAPON_SOTL_SAMPLING" && Math.random() < 0.6) {

		var apos = this.ship.position;
		var ppos = w.position;
		var fragpos = this._intersectLineAndSphere(apos,this.ship.collisionRadius,ppos,w.vectorForward);
		var splinter = system.addShips("sotl-splinter",1,fragpos,0)[0];
		var vel = Vector3D.random(100);
		if (vel.dot(ppos.subtract(apos)) < 0) {
			// head away from asteroid surface
			vel = vel.multiply(-1);
		}
		splinter.velocity = vel;
		if (this.$sotlMinerals[0] == 10) {
			splinter.setCargo("minerals",1);
		} else if (this.$sotlMinerals[1] == 10) {
			splinter.setCargo("sotl-exp-ice",1);
		} else {
			splinter.setCargo("sotl-exp-iron",1);
		}
		splinter.script.$sotlMinerals = this._pick();

	}
};


this._pick = function() {
	
	var expectations = worldScripts["SOTL Equipment Management"]._miningExpectations();
	var cargoes = ["minerals","sotl-exp-ice","sotl-exp-iron","sotl-exp-copper","sotl-exp-aluminium","sotl-exp-titanium","sotl-exp-uranium","sotl-exp-platinum","sotl-exp-palladium","sotl-exp-gold","sotl-exp-iridium","sotl-exp-rhodium","sotl-exp-tellerium","sotl-exp-indium","sotl-exp-rhenium","sotl-exp-ruthenium","sotl-exp-osmium"];
	var contains = [];
	for (var i=0;i<expectations.length;i++) {
		// has it in minable quantities
		if (this.$sotlMinerals[i] * 10 > expectations[i]) {
			// less common for rarer ones
			// guaranteed for the base material
			if (Math.random() * 10 < this.$sotlMinerals[i]) {
				contains.push(cargoes[i]);
			}
		}
	}
	return contains;
}


/* Imperfect, but good enough for spherical-ish asteroids */
this._intersectLineAndSphere = function(centre, radius, origin, direction) {

	var c2 = Math.pow(centre.subtract(origin).magnitude(),2) - Math.pow(radius,2);
	var b = (direction.dot(centre.subtract(origin)));
	if (b*b >= c2) {
		var distance = b - Math.sqrt((b*b) - c2); // take the smaller one

		return origin.add(direction.multiply(distance));
	} else {
		// miss, so we should never get here.
		// fallback
		return centre.add(origin.subtract(centre).direction().multiply(radius));
	}
}
