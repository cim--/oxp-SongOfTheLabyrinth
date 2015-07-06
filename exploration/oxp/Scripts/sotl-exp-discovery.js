"use strict";

this.name = "SOTL discovery checks";

this.$discoveryChecks = null;

this.startUp = function() {
	this.$discoveryChecks = new Timer(this, this._checkForDiscovery.bind(this), 1, 1);
};

this.shipDied = function() {
	this.$discoveryChecks.stop();
}


this._checkForDiscovery = function() {
	var discovered = parseInt(system.info.planets_discovered);
	var planets = system.planets;
	for (var i=0;i<planets.length;i++) {
		var pn = planets[i];
		var bitmask = (1 << pn.sotl_planetIndex);
		if (!(discovered & bitmask)) {
			// not yet discovered - try to find it

			/* passive discovery; takes place when within 75 radii of
			 * a planet. Hopefully far enough back to avoid "it's
			 * right there! pick it up!" frustration, but close enough
			 * to avoid detecting ones the player had gone right
			 * past. */
			if (player.ship.position.distanceTo(pn) < pn.radius * 75) {
				this._discoverPlanet(pn,bitmask);
			}

		}
	}

};


this._discoverPlanet = function(planet, bitmask) {
	var index = planet.sotl_planetIndex
	system.info.planets_discovered |= bitmask;
	
	if (system.info["planet_name_"+index] == "") {
		var num = Math.floor(Math.random()*10000);
		system.info["planet_name_"+index] = system.name+" P"+num;
		planet.planet_name = system.info["planet_name_"+index];
	}
	system.setWaypoint("planet_"+index,planet.position,[0,0,0,0],{
		size:1,
		beaconCode:"P",
		beaconLabel:system.info["planet_name_"+index]
	});
	player.consoleMessage("New planetary body confirmed.");
	player.consoleMessage("Preliminary designation "+system.info["planet_name_"+index]);
};