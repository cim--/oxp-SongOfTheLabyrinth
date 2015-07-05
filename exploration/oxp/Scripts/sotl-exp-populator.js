"use strict";

this.name = "SOTL Exploration Populator";

this.interstellarSpaceWillPopulate = function() {
	// nothing - at least, for now
};

this.systemWillPopulate = function() {
	system.sun.position = [0,0,0];

	var numPlanets = parseInt(system.info.planets_available);
	var discovered = parseInt(system.info.planets_discovered);
	var knownPlanet = -1;
	var threshold = -1;

	for (var i=0;i<numPlanets;i++) {
		if (discovered & (1 << i)) {
			if (parseInt(system.info["planet_value_"+i]) > threshold) {
				threshold = parseInt(system.info["planet_value_"+i]);
				knownPlanet = i;
			}
		}
	}
	
	if (knownPlanet == -1) {
		// system.mainPlanet.remove(); // no discovered planets
		system.mainPlanet.position = [1E14,0,0]; // can't remove it
	} else {
		system.mainPlanet.position = system.info["planet_position_"+knownPlanet].split(" ");
		system.setWaypoint("planet_"+i,system.mainPlanet.position,[0,0,0,0],{
			size:1,
			beaconCode:"P",
			beaconLabel:system.info.planet_name
		});
	}
	for (i=0;i<numPlanets;i++) {
		if (i != knownPlanet) { // system.mainPlanet covers this one
			var planet = system.addPlanet("planet_"+galaxyNumber+"_"+system.ID+"_"+i);
			planet.position = system.info["planet_position_"+i].split(" ");
			if (discovered & (1 << i)) {
				system.setWaypoint("planet_"+i,planet.position,[0,0,0,0],{
					size:1,
					beaconCode:"P",
					beaconLabel:system.info["planet_name_"+i]
				});
				
			}
		}
	};


	if (system.ID == 0) {
		system.mainStation.position = system.mainPlanet.position.add([system.mainPlanet.radius*2.5,0,0]);
	} else {
		/* TODO: some sort of save anywhere? */
		system.mainStation.remove();
	}

	
	


};

