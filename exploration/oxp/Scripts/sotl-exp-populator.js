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

	this.$asteroidIndex = 0;
	
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
	var planetdata = JSON.parse(system.info.planet_data);
	for (var i=0;i<p.length;i++) {
		if (p[i].sotl_planetIndex !== undefined) {
			var trojans;
			if (trojans = planetdata[p[i].sotl_planetIndex].trojans) {
				var lps = this._lagrangePoints(p[i],true);
				var seed = planetdata[p[i].sotl_planetIndex].trojanSeed;
				var temp = planetdata[p[i].sotl_planetIndex].surfaceTemperature;
				
				this._setUpAsteroidField(lps[4],trojans,temp,seed);
				this._setUpAsteroidField(lps[5],trojans,temp,seed*137);
			}
		}
	}
};


this._setUpAsteroidField = function(position,minerals,temp,seed) {
	var r = worldScripts["SOTL Ranrot"];
	r._srand(seed);
	var size = 5+Math.floor(r._randf()*10);
	for (var i=1;i<=size;i++) {
		r._srand((seed*i*1301)&0x7FFFFFFF); // make sure can safely add extra numbers to end

		offset = [
			(r._randf()*100E3)-50E3,
			(r._randf()*100E3)-50E3,
			(r._randf()*100E3)-50E3
		];
		
		var pos = position.add(offset);

		var base = "metal";
		if (r._randf() > minerals) {
			base = "rocky";
			if (r._randf() > minerals && temp < 0) {
				base = "ice";
			}
		}

		var asize = "small";
		if (r._randf() < 0.5) {
			asize = "large";
		}

		var asteroid = system.addShips("sotl-"+base+"-asteroid-"+asize,1,pos,0)[0];

		asteroid.script.$sotlMinerals = this._mineralConcentrations(base, minerals ,r);
		asteroid.script.$sotlAsteroidIndex = this.$asteroidIndex++;

		asteroid.script.$sotlScan1 = [];
		asteroid.script.$sotlScan2 = [];

		asteroid.script.shipTakingDamage = function(a,w,t) {
			if (w == player.ship) {
				worldScripts["SOTL Equipment Management"]._registerAsteroidHit(this.ship);
			}
		}.bind(asteroid.script);
		
		asteroid.scannerDisplayColor1 = "0.3 0.3 0.3";
		asteroid.scanDescription = "unscanned";

		var discovery = worldScripts["SOTL discovery checks"]._getAsteroidScan(asteroid.script.$sotlAsteroidIndex);
		if (discovery) {
			worldScripts["SOTL discovery checks"]._showAsteroidScan(asteroid,discovery);
		}
	}

};


this._mineralConcentrations = function (base, minerals, r) {
	var i;
	// ["Si","H2O","Fe","Cu","Al","Ti","U","Pt","Pd","Au"]
	// ["Si","H2O","Fe","Ir","Rh","Te","In","Re","Ru","Os"];
	var concentrations = [0,0,0, 0,0,0, 0,0,0,0, 0,0,0,0, 0,0, 0];
	switch (base) {
	case "ice":
		concentrations[1] = 10;
		concentrations[0] = 2+r._randf();
		for (i=2;i<=16;i++) {
			if (r._randf() < 0.1 && i < 10) {
				concentrations[i] = r._randf()*minerals;
			} else {
				concentrations[i] = r._randf()*minerals/10;
			}
		}
		break;
	case "rocky":
		concentrations[0] = 10;
		concentrations[1] = r._randf()*3;
		for (i=2;i<=5;i++) {
			concentrations[i] = r._randf()*minerals*5;
		}
		for (i=6;i<=13;i++) {
			concentrations[i] = r._randf()*minerals*2;
		}
		for (i=14;i<=16;i++) {
			concentrations[i] = r._randf()*minerals/3;
		}
		break;
	case "metal":
		concentrations[0] = r._randf()*8;
		concentrations[1] = r._randf()*3;
		concentrations[2] = 10;
		for (i=3;i<=5;i++) {
			concentrations[i] = r._randf()*minerals*15;
		}
		
		for (i=6;i<=13;i++) {
			if (r._randf() < minerals) {
				concentrations[i] = r._randf()*minerals*12;
			} else {
				concentrations[i] = r._randf()*minerals;
			}
		}
		for (i=14;i<=15;i++) {
			if (r._randf() < minerals) {
				concentrations[i] = r._randf()*minerals*8;
			} else {
				concentrations[i] = r._randf()*minerals;
			}
		}
		if (r._randf() < minerals) {
			concentrations[16] = r._randf()*minerals*5;
		} else {
			concentrations[16] = r._randf()*minerals;
		}
		break;
	}
	return concentrations;
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
