"use strict";

this.name = "SOTL discovery checks";

this.$discoveryChecks = null;

this.startUp = function() {
	this.$discoveries = missionVariables.sotl_exp_discoveries ? JSON.parse(missionVariables.sotl_exp_discoveries) : this._initialDiscoveries();

	this.$discoveryChecks = new Timer(this, this._checkForDiscovery.bind(this), 1, 1);
};

this.playerWillSaveGame = function() {
	missionVariables.sotl_exp_discoveries = JSON.stringify(this.$discoveries);
}

this.shipDied = function() {
	this.$discoveryChecks.stop();
}

this.shipWillExitWitchspace = function() {
	this._discoverStarProperty("visited");
}


this._compassTarget = function() {
	var target = player.ship.compassTarget;
	if (target == system.sun) {
		return target;
	} else if (target == system.mainStation) {
		return target;
	} else if (target == system.mainPlanet) {
		if (system.mainPlanet.position.z < 9E13 && system.mainPlanet.sotl_planetIndex !== undefined) {
			return target;
		}
	} else if (target.beaconCode && target.beaconCode == "P") {
		var index = 0;
		for (var i=0;i<system.planets.length;i++) {
			if (system.planets[i].position.distanceTo(target) < 1000) {
				return system.planets[i];
			}
		}
	}
	return null; // no target
}


this._initialDiscoveries = function() {
	return {
		"0": {
			"star": {
				"visited": 1,
				"brightness": 1,
				"gravity": 1,
				"stability": 1
			},
			"planets": {
				"0": {
					"size": 1,
					"orbitalDistance": 1,
					"temperature": 1,
					"radiation": 1,
					"atmosphere": 1,
					"earthquakes": 1,
					"weather": 1,
					"minerals": 1,
					"habitability": 1,
					"gravity": 1
				},
				"1": {
					"size": 1,
					"orbitalDistance": 1,
					"temperature": 1,
					"radiation": 1,
					"atmosphere": 1,
					"earthquakes": 1,
					"weather": 1,
					"minerals": 1,
					"habitability": 1,
					"gravity": 1
				}
			}
		}
	};
};


this._describeStar = function() {
	var star = JSON.parse(system.info.star_data);
	var discovered = this.$discoveries[system.ID]["star"];
//	var description = star.name+"\n";
	var description = "";
	description += "Class: "+star.sequence+"\n";
	description += "Radius: "+(star.radius/14E5).toFixed(2)+" Sr\n";

	if (discovered["brightness"]) {
		description += "Brightness: "+star.brightness.toFixed(3)+" Sl\n";
	} else {
		description += "Brightness: no scan\n";
	}
	if (discovered["gravity"] == 1) {
		description += "Mass: "+star.mass.toFixed(3)+" Sm\n";
	} else if (!discovered['gravity']) {
		description += "Mass: no scan\n";
	} else {
		var sg = discovered['gravity'].scan;
		var sm = this._stellarGravityToMass(sg,star.radius);
		description += "Mass: "+sm.toFixed(3)+" Sm\n";
	}
	if (discovered["stability"]) {
		description += "Stability: "+(100*(1-star.instability)).toFixed(1)+"%\n";
	} else {
		description += "Stability: no scan\n";
	}
	
	return description;
}


this._stellarMassToGravity = function(m,r) {
	return 28.02 * m / ((r/14E5)*(r/14E5));
}

this._stellarGravityToMass = function(g,r) {
	return (g/28.02)*((r/14E5)*(r/14E5));
}



this._describePlanet = function(index) {
	var planet = JSON.parse(system.info.planet_data)[index];
	var discovered = this.$discoveries[system.ID]["planets"][index];
	if (!discovered) {
		return "No target";
	}
	var description = "";
//	var description = system.info["planet_names_"+index]+"\n";

	if (discovered["size"]) {
		description += "Radius: "+(planet.radius).toFixed(0)+" km\n";
	} else {
		description += "Radius: no scan\n";
	}

	if (discovered["orbitalDistance"]) {
		description += "Orbit: "+planet.orbitalRadiusAU.toFixed(3)+" AU\n";
	} else {
		description += "Orbit: ~"+planet.orbitalRadiusAU.toFixed(1)+" AU\n";
	}

	if (discovered["gravity"] == 1) {
		description += "Surface gravity: "+planet.surfaceGravity.toFixed(3)+" G\n";
	} else if (!discovered['gravity']) {
		description += "Surface gravity: no scan\n";
	} else {
		description += "Surface gravity: "+discovered['gravity'].scan.toFixed(3)+" G\n";
	}

	if (discovered["temperature"]) {
		description += "Surface temperature: "+(273+planet.temperature).toFixed(0)+" K\n";
	} else {
		description += "Surface temperature: no scan\n";
	}

	if (discovered["radiation"]) {
		description += "Surface radiation: "+(100*planet.surfaceRadiation).toFixed(2)+" tR\n";
	} else {
		description += "Surface radiation: no scan\n";
	}

	if (discovered["atmosphere"]) {
		if (planet.cloudAlpha < 0.01) {
			description += "Atmosphere: none\n\n";
		} else {
			/* TODO: more atmosphere scanning */
			description += "Atmosphere: no samples\n";
			if (discovered["weather"]) {
				/* TODO */
				description += "Weather: ...\n";
			} else {
				description += "Weather: no scan\n";
			}
		}
	} else {
		description += "Atmosphere: no scan\n\n";
	}

	if (discovered["earthquakes"]) {
		description += "Seismic Activity: ";
		if (planet.seismicInstability < 0.01) {
			description += "Insignificant";
		} else if (planet.seismicInstability < 0.03) {
			description += "Low";
		} else if (planet.seismicInstability < 0.06) {
			description += "Moderate";
		} else if (planet.seismicInstability < 0.1) {
			description += "High";
		} else if (planet.seismicInstability < 0.2) {
			description += "Very High";
		} else {
			description += "Extreme";
		}

		description += "\n";
	} else {
		description += "Seismic Activity: no scan\n";
	}

	if (discovered["minerals"]) {
		/* TODO */
		description += "Minerals: low\n";
	} else {
		description += "Minerals: no scan\n";
	}

	if (discovered["habitability"]) {
		/* TODO */
		description += "Habitability: ";
		if (planet.habitability >= 90) {
			description += "Ideal";
		} else if (planet.habitability >= 80) {
			description += "Self-sufficient open habitats";
		} else if (planet.habitability >= 70) {
			description += "Restricted open air habitats";
		} else if (planet.habitability >= 50) {
			description += "Lightweight colony domes";
		} else if (planet.habitability >= 0) {
			description += "Standard colony domes";
		} else {
			description += "Shielded colony domes";
		}
		description += "\n";
	} else {
		description += "Habitability: insufficient data\n";
	}
	
	return description;
}


this._checkForDiscovery = function() {
	var discovered = parseInt(system.info.planets_discovered);
	var planets = system.planets;
	for (var i=0;i<planets.length;i++) {
		var pn = planets[i];
		var bitmask = (1 << pn.sotl_planetIndex);
		if (!(discovered & bitmask)) {
			// not yet discovered - try to find it

			/* passive discovery; takes place when within 150 radii of
			 * a planet. Hopefully far enough back to avoid "it's
			 * right there! pick it up!" frustration, but close enough
			 * to avoid detecting ones the player had gone right
			 * past. */
			if (player.ship.position.distanceTo(pn) < pn.radius * 150) {
				this._discoverPlanet(pn,bitmask);
			}

		}
	}

};


this._reportedGravity = function(object) {
	var discovered;
	if (object.isSun) {
		discovered = this.$discoveries[system.ID]["star"]["gravity"];
	} else {
		var idx = object.sotl_planetIndex;
		discovered = this.$discoveries[system.ID]["planets"][idx]["gravity"];
	}
	if (discovered == 1) {
		var data, grav;
		if (object.isSun) {
			data = JSON.parse(system.info.star_data);
			grav = this._stellarMassToGravity(data.mass,data.radius)
		} else {
			data = JSON.parse(system.info.planet_data)[index];
			grav = planet.surfaceGravity;
		}
		return grav;
	} else if (!discovered) {
		return -1;
	} else {
		return discovered.scan;
	}
}


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
	this._discoverPlanetProperty(index,"size");

	player.consoleMessage("New planetary body confirmed.");
	player.consoleMessage("Preliminary designation "+system.info["planet_name_"+index]);
	player.score++;

};


this._discoverPlanetProperty = function(index,prop,value) {
	if (!this.$discoveries[system.ID]) {
		this.$discoveries[system.ID] = {};
	}
	if (!this.$discoveries[system.ID]["planets"]) {
		this.$discoveries[system.ID]["planets"] = {};
	}
	if (!this.$discoveries[system.ID]["planets"][index]) {
		this.$discoveries[system.ID]["planets"][index] = {};
	}
	if (value === undefined || this.$discoveries[system.ID]["planets"][index][prop] == 1) {
		this.$discoveries[system.ID]["planets"][index][prop] = 1;
	} else {
		this.$discoveries[system.ID]["planets"][index][prop] = {
			scan: value
		};
	}
	worldScripts["SOTL HUD Dials management"]._updateMFD();
}

this._discoverStarProperty = function(prop,value) {
	if (!this.$discoveries[system.ID]) {
		this.$discoveries[system.ID] = {};
	}
	if (!this.$discoveries[system.ID]["star"]) {
		this.$discoveries[system.ID]["star"] = {};
	}
	if (value === undefined || this.$discoveries[system.ID]["star"][prop] == 1) {
		this.$discoveries[system.ID]["star"][prop] = 1;
	} else {
		this.$discoveries[system.ID]["star"][prop] = {
			scan: value
		};
	}
	worldScripts["SOTL HUD Dials management"]._updateMFD();
}