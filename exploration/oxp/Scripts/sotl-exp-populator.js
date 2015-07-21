"use strict";

this.name = "SOTL Exploration Populator";

this.interstellarSpaceWillPopulate = function() {
	// nothing - at least, for now
};

this.systemWillPopulate = function() {
	system.setPopulator("sotl_exp_main",{
		priority: 10,
		callback: function() {
			system.sun.position = [0,0,0];

			var numPlanets = parseInt(system.info.planets_available);
			var discovered = parseInt(system.info.planets_discovered);
			var knownPlanet = -1;
			var threshold = -1;
			var planetdata = JSON.parse(system.info.planet_data);


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
				system.mainPlanet.name = "No known planets";
			} else {
				system.mainPlanet.position = system.info["planet_position_"+knownPlanet].split(" ");
				system.setWaypoint("planet_"+i,system.mainPlanet.position,[0,0,0,0],{
					size:1,
					beaconCode:"P",
					beaconLabel:system.info["planet_name_"+knownPlanet]
				});
				system.mainPlanet.sotl_planetIndex = knownPlanet;
				system.mainPlanet.name = system.info["planet_name_"+knownPlanet];
				system.mainPlanet.orientation = system.mainPlanet.orientation.rotateZ(planetdata[knownPlanet].axialTilt);
			}
			for (i=0;i<numPlanets;i++) {
				if (i != knownPlanet) { // system.mainPlanet covers this one
					if (planetdata[i].cloudAlpha == 0) {
						var planet = system.addMoon("planet_"+galaxyNumber+"_"+system.ID+"_"+i);
					} else {
						var planet = system.addPlanet("planet_"+galaxyNumber+"_"+system.ID+"_"+i);
					}
					planet.position = system.info["planet_position_"+i].split(" ");
					planet.orientation = planet.orientation.rotateZ(planetdata[i].axialTilt);
					planet.sotl_planetIndex = i;
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
				system.mainStation.position = system.mainPlanet.position.add([0,system.mainPlanet.radius*2.5,0]);
			} else {
				/* TODO: some sort of save anywhere? */
				system.mainStation.remove();
			}

		}
	});
};


/* Update main planet data */
this.shipWillEnterWitchspace = function() {
	var numPlanets = parseInt(system.info.planets_available);
	var discovered = parseInt(system.info.planets_discovered);
	var knownPlanet = -1;
	var threshold = -1;

	var dcount = 0;
	for (var i=0;i<numPlanets;i++) {
		if (discovered & (1 << i)) {
			dcount++;
			if (parseInt(system.info["planet_value_"+i]) > threshold) {
				threshold = parseInt(system.info["planet_value_"+i]);
				knownPlanet = i;
			}
		}
	}
	if (knownPlanet > -1) {
		var planetdata = JSON.parse(system.info.planet_data);
		var planet = planetdata[knownPlanet];
		
		var $fix = function(a,b) {
			return a.toFixed(b);
		}
		
		var $color = function(a) {
			return $fix(a[0],3)+" "+$fix(a[1],3)+" "+$fix(a[2],3);
		}

		var $set = function(k,v) {
			system.info[k] = v;
		}
		
		/* Copy properties of best known planet to system.mainPlanet */
		$set("percent_land",$fix(100*planet.percentLand,1));
		$set("percent_ice",$fix(100*planet.percentIce,1));
		$set("percent_cloud",$fix(100*planet.percentCloud,1));
		$set("has_atmosphere",planet.cloudAlpha>0?1:0);
		$set("cloud_alpha",$fix(planet.cloudAlpha,2));
		
		$set("rotational_velocity",$fix(planet.rotationalVelocity,7));
		$set("atmosphere_rotational_velocity",$fix(planet.atmosphereVelocity,7));
		$set("land_color",$color(planet.landColour));
		$set("polar_land_color",$color(planet.polarLandColour));
		$set("sea_color",$color(planet.seaColour));
		$set("polar_sea_color",$color(planet.polarSeaColour));
		$set("cloud_color",$color(planet.cloudColour));
		$set("polar_cloud_color",$color(planet.polarCloudColour));

		system.info.planet_name = system.info["planet_name_"+i];

		$set("techlevel",dcount);

		/* Can't change main planet radius while in system */
		var pr = planet.radius;
		var si = system.info;
		this.shipWillExitWitchspace = function() {
			// wait until in real system
			if (system.ID != -1) {
				si.radius = pr;
				delete this.shipWillExitWitchspace;
			}
		}.bind(this);
	}
};
