"use strict";

this.name = "SOTL Exploration Populator";


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


this.interstellarSpaceWillPopulate = function() {
	// nothing - at least, for now
};

this.systemWillPopulate = function() {
	system.setPopulator("sotl_exp_main",{
		priority: 10,
		callback: this._setUpPlanetsAndStar.bind(this)
	});

	system.setPopulator("sotl_exp_asteroids",{
		priority: 20,
		callback: this._setUpAsteroidFields.bind(this)
	});

};


this._setUpPlanetsAndStar = function() {
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
			planet.name = system.info["planet_name_"+i];
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

};




this._setUpAsteroidFields = function() {
	var p = system.planets;
	for (var i=0;i<p.length;i++) {
		if (p[i].sotl_planetIndex !== undefined) {
/*			// asteroids
			var ls = this._lagrangePoints(p[i],true);
			for (j=1;j<=5;j++) {
				// temporary for testing only
				system.addShips("asteroid",1,ls[j],0);
			} */
		}
	}
};



this._lagrangePoints = function(target,real) {
	var dws = worldScripts["SOTL discovery checks"];

	if (real) {
		var g1 = dws._actualGravity(system.sun);
		var g2 = dws._actualGravity(target);
	} else {
		var g1 = dws._reportedGravity(system.sun);
		var g2 = dws._reportedGravity(target);
	}
	
	var m1 = dws._stellarGravityToMass(g1,system.sun.radius);
	var m2 = dws._planetaryGravityToMass(g2,target.radius);
	m1 = m1 * 3E5; // convert both to being in earth masses, ish

	var l12f = Math.pow(m2/(3*m1),0.33);
	var lpos = [];
	var tp = target.position;
	lpos[1] = tp.multiply(1-l12f);
	lpos[2] = tp.multiply(1+l12f);

	var l3f = (7*m2) / (12*m1);
	lpos[3] = tp.multiply(l3f-1);

	// make axor roughly vertical
	if (Math.abs(tp.x) > Math.abs(tp.z)) {
		var axor = tp.direction().cross([0,0,1]);
	} else {
		var axor = tp.direction().cross([1,0,0]);
	}
	if (axor.y < 0) {
		// make sure all planets rotate the same way
		axor = axor.multiply(-1);
	}
	var plane = tp.direction().cross(axor);
	
	lpos[4] = tp.multiply(0.5).add(plane.multiply(tp.magnitude()*0.866));
	lpos[5] = tp.multiply(0.5).subtract(plane.multiply(tp.magnitude()*0.866));
	return lpos;
};
