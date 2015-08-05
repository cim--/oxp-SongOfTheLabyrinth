"use strict";

this.name = "SOTL Asteroid shipscript";

/* These variables are filled in by populator */
this.$sotlMinerals = null;
this.$sotlAsteroidIndex = null;
this.$sotlScan1 = null;
this.$sotlScan2 = null;


this.shipTakingDamage = function(a,w,t) {
	worldScripts["SOTL Equipment Management"]._registerAsteroidHit(this.ship);
	if (w.isPlayer && player.ship.forwardWeapon.equipmentKey == "EQ_WEAPON_SOTL_SAMPLING") {

		var apos = this.ship.position;
		var ppos = w.position;
		var fragpos = apos.add(ppos.subtract(apos).direction().multiply(this.ship.collisionRadius));

		var splinter = system.addShips("sotl-splinter",1,fragpos,0)[0];
		splinter.velocity = Vector3D.random(300);
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
