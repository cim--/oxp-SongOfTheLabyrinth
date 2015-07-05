"use strict";

this.name = "SOTL Exploration Populator";

this.interstellarSpaceWillPopulate = function() {
	// nothing - at least, for now
};

this.systemWillPopulate = function() {
	system.sun.position = [0,0,0];
	system.mainPlanet.position = [system.info.sun_distance,0,0];
	if (system.ID == 0) {
		system.mainStation.position = [system.info.sun_distance,system.mainPlanet.radius*2.5,0];
	} else {
		/* TODO: some sort of save anywhere? */
		system.mainStation.remove();
	}
};

