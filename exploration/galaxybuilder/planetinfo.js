/** Planet information data store
 * Methods so far: 
 * set(galaxy,system,property,value)
 * get(galaxy,system,property)
 * distance (galaxy,system,system)
 * ensureConnectivity() - moves disconnected systems closer to centre
 * dump() - prints plist
 *
 */
"use strict";

(function() {

	var highMineralPoint = 0.45;
	var mediumMineralPoint = 0.25;
	var highHabPoint

	var invasioncasualties = 0;

	var planetdata = [];
	var tradeRoutes = [[],[],[],[],[],[],[],[]];

	// region 0 should never be asked for
	var regiondata = [{}];

	var cused = [{},{},{},{},{},{},{},{}];

	var $plist = function(k,v) {
		return "\t\""+k+"\" = \""+v+"\";\n";
	}

	var $plistarray = function(k,v) {
		return "\t\""+k+"\" = \""+v.join(";")+"\";\n";
	}

	var $fix = function(a,b) {
		return a.toFixed(b);
	}

	var $color = function(a) {
		return $fix(a[0],3)+" "+$fix(a[1],3)+" "+$fix(a[2],3);
	}

	var $getHabitability = function(planet) {
		var spec = {
			preferredGravity: 1.00,
			preferredTemperature: 13,
			temperatureTolerance: 4,
			radiationTolerance: 0.02,
			preferredLand: 0.30,
			landTolerance: 0.1,
			seismicTolerance: 0.06,
			windTolerance: 0.15
		};

		var hab = 100;
		// gravity
		var diff = (Math.abs(spec.preferredGravity-planet.surfaceGravity) - spec.preferredGravity/4);
		if (diff > 0) {
			hab -= (diff * 125)
		}
		// temperature
		diff = Math.abs(spec.preferredTemperature-planet.temperature)-spec.temperatureTolerance;
		if (diff > 0) {
			hab -= diff*1.75;
		}
		// radiation
		diff = planet.surfaceRadiation-spec.radiationTolerance;
		if (diff > 0) {
			hab -= 200*diff;
		}
		// seismic
		diff = planet.seismicInstability-spec.seismicTolerance;
		if (diff > 0) {
			hab -= 150*diff;
		}
		// land/water split
		diff = Math.abs(spec.preferredLand - planet.percentLand)-spec.landTolerance;
		if (diff > 0) {
			hab -= 25*diff;
		}
		// wind factor
		diff = planet.windFactor - spec.windTolerance;
		if (diff > 0) {
			hab -= 150*diff;
		}

		if (hab > 50 && planet.cloudAlpha == 0) {
			hab -= 50;
		} else if (hab < 0) {
			hab = 0;
		} 

		return hab;
	};

	var $planetspec = function(planet) {
		var result = "";
		result += $plist("planet_distance",1E6); 
		result += $plist("radius",planet.radius);
		result += $plist("percent_land",$fix(100*planet.percentLand,1));
		result += $plist("percent_ice",$fix(100*planet.percentIce,1));
		result += $plist("percent_cloud",$fix(100*planet.percentCloud,1));
		result += $plist("has_atmosphere",planet.cloudAlpha>0?1:0);
		result += $plist("cloud_alpha",$fix(planet.cloudAlpha,2));
		
		result += $plist("rotational_velocity",$fix(planet.rotationalVelocity,7));
		result += $plist("atmosphere_rotational_velocity",$fix(planet.atmosphereVelocity,7));
		
		result += $plist("land_color",$color(planet.landColour));
		result += $plist("polar_land_color",$color(planet.polarLandColour));
		result += $plist("sea_color",$color(planet.seaColour));
		result += $plist("polar_sea_color",$color(planet.polarSeaColour));
		result += $plist("cloud_color",$color(planet.cloudColour));
		result += $plist("polar_cloud_color",$color(planet.polarCloudColour));

		return result;
	}

	var planetinfo = {};

	planetinfo.$debug = 0;

	planetinfo.galaxies = 1;
	planetinfo.systems = 256;	
	planetinfo.xsize = 256;
	planetinfo.ysize = 256;

	for (var g=0;g<planetinfo.galaxies;g++) {
		planetdata[g] = [];
		for (var i=0;i<planetinfo.systems;i++) {
			planetdata[g][i] = {
				planets: []
			};
		}
	}

	planetinfo.set = function(g,s,p,v) {
		if (p == "coordinates") {
			cused[g][v[0]+" "+v[1]] = 1;
		}
		planetdata[g][s][p] = v;
	};

	planetinfo.get = function(g,s,p) {
		return planetdata[g][s][p];
	};

	planetinfo.distance = function(g,s1,s2) {
		var dx = planetdata[g][s1].coordinates[0] - planetdata[g][s2].coordinates[0];
		var dy = Math.floor((planetdata[g][s1].coordinates[1] - planetdata[g][s2].coordinates[1])/2);
		return (Math.floor(Math.sqrt((dx*dx)+(dy*dy)))*0.4);
	}


	planetinfo.direction = function(g,s1,s2) {
		var dx = planetdata[g][s1].coordinates[0] - planetdata[g][s2].coordinates[0];
		var dy = (planetdata[g][s1].coordinates[1] - planetdata[g][s2].coordinates[1])/2;
		var theta = Math.atan(dy/dx);
		if (dx < 0 && dy >= 0) {
			theta += Math.PI;
		} else if (dx < 0) {
			theta -= Math.PI;
		}
		return theta;
	}

	var au = 2E7;
	planetinfo.addPlanet = function(i, j, star, orbitDistAU, forceNoAtmosphere, random, forceName) {
		var planet = {};
		
		planet.habZoneRange = orbitDistAU / star.habitableZoneFactor;
		planet.orbitalRadius = orbitDistAU * au;
		planet.orbitalRadiusAU = orbitDistAU;

		var mw1 = random.randf(); var mw2 = random.randf();
		// pick the one closer to the minfactor
		planet.mineralWealth = ((Math.abs(mw1-star.mineralFactor) < Math.abs(mw2-star.mineralFactor))?mw1:mw2) * random.randf();

		// <0.3 = low, <0.65 = medium

		planet.radius = 2750+random.rand(6000);

		// (20-60) + (~5-15) + (0-39) => (~30-115) - 60 => (-30 - 55)
		// though last 10 degrees are exceptionally rare on either edge
		planet.temperature = ((1/planet.habZoneRange) * 40) + (planet.radius / 600) + random.rand(40) - 55;
		
		var pland = random.randf();
		var pcloud = 0.8 + (random.randf() * 0.2);
		var calpha = 0.9 + (1.5*random.randf());
		if (planet.temperature > 30) {
			// too hot for much liquid water
			pland += ((planet.temperature-30) / 100);
			// thick clouds from gas in atmosphere
			// maybe even venusian
			pcloud += ((planet.temperature-30) / 50);
		} else if (planet.temperature < 0) {
			// much of liquid water locked up in ice caps
			pland -= ((planet.temperature) / 100);
			// and much less available as gas for cloud formation
			pcloud += ((planet.temperature) / 100);
		}
		var icecap = ((25-planet.temperature)*2.5)/100;
		if (icecap > 1) { icecap = 1; }
		if (icecap < 0) { icecap = 0; }
		if (pland > 1) { pland = 1; }
		if (pcloud > 1) { pcloud = 1; }
		if (pcloud < 0) { pcloud = 0; }

		// pland > 75%? chance of turning into rockball
		// pland = 1, pcloud = 0, calpha = 0
		var rockball = random.randf()/4;
		var landarea = pland;
		if (forceNoAtmosphere || pland+rockball > 1)
		{
			pland = 1;
			pcloud = 0;
			calpha = 0;
			icecap = 0;
			landarea = 1;
		} else {
			// the planet texture generation doesn't
			// really give good results here
			pland = 0.3 + (0.4*pland);
		}

		planet.percentIce = icecap;
		planet.percentLand = pland; // planet generator
		planet.landFraction = landarea; // actual
		planet.percentCloud = pcloud;
		planet.cloudAlpha = calpha;

		planet.rotationalVelocity = ((0.5 + random.randf())*0.001);

		// surface radiation levels (star.instability, etc.)
		// anything above 1 is extremely rare, most habitable worlds should be
		// < 0.1
		var rad = (10*(1-pcloud)*(2.4-calpha)*(Math.min(0.1,1.5-planet.habZoneRange))*star.instability);
		if (rad < 0) { rad = 0; }
		planet.surfaceRadiation = rad;

		planet.seismicInstability = (random.randf()*random.randf()*Math.min(0.1,2-planet.habZoneRange)*star.mineralFactor);
		if (planet.seismicInstability > 0.2)
		{
			planet.mineralWealth += planet.seismicInstability / 5;
		}
	
		planet.surfaceGravity = ((planet.radius/6400)*(0.8+(random.randf()*0.4)));
	
		//			var planetzf = 1E5;
		var planetzf = 1E6;
		planet.zpos = Math.floor(planetzf*((5*planet.surfaceGravity)+random.randf()));

		var avel = random.randf()*random.randf()*random.randf()*random.randf();
		var arv;
		avel += planet.temperature/100;
		if (avel < 0) {
			avel = 0.01;
		}
		if (avel < 0.3)	{
			arv = avel * 0.0003;
		} else if (avel < 0.6) {
			arv = avel * 0.001;
		} else {
			arv = avel * 0.003;
		}
		if (calpha == 0) {
			// no significant atmosphere
			avel = 0;
			arv = 0;
		} 

		planet.windFactor = avel;
		planet.atmosphereVelocity = arv;

		/* Physical properties set up - now determine appearance */

		var h = $getHabitability(planet);

		if (h > 90) {
			// nice places
			planet.landColour = [
				0.4+(random.randf()*0.2),
				0.8+(random.randf()*0.1),
				0.45+(random.randf()*0.2)
			];
			planet.seaColour = [
				0.3+(random.randf()*0.3),
				0.7+(random.randf()*0.2),
				0.9+(random.randf()*0.1)
			];
			planet.polarLandColour = [
				0.7+(random.randf()*0.01),
				0.7+(random.randf()*0.01),
				0.7+(random.randf()*0.01)
			];
			planet.polarSeaColour = [
				planet.polarLandColour[0],
				planet.polarLandColour[1],
				planet.polarLandColour[2]
			];
			planet.cloudColour = [
				0.9,
				0.9,
				0.9
			];
			planet.polarCloudColour = [
				0.9,
				0.9,
				0.9
			];
			// use same number of rands
			random.randf();random.randf();random.randf();
			random.randf();random.randf();random.randf();
		} else if (h > 80) {
			// habitable with work
			planet.landColour = [
				0.4+(random.randf()*0.2),
				0.4+(random.randf()*0.2),
				0.25+(random.randf()*0.1)
			];
			planet.seaColour = [
				0.4+(random.randf()*0.3),
				0.6+(random.randf()*0.2),
				0.7+(random.randf()*0.1)
			];
			planet.polarLandColour = [
				0.65+(random.randf()*0.05),
				0.65+(random.randf()*0.05),
				0.65+(random.randf()*0.05)
			];
			planet.polarSeaColour = [
				planet.polarLandColour[0] + 0.05,
				planet.polarLandColour[1] + 0.05,
				planet.polarLandColour[2] + 0.05,
			];
			planet.cloudColour = [
				0.6+(random.randf()*0.1),
				0.6+(random.randf()*0.1),
				0.6+(random.randf()*0.1)
			];
			planet.polarCloudColour = [
				0.9,
				0.9,
				0.9
			]; 
			// use same number of rands
			random.randf();random.randf();random.randf();
		} else if (h > 70) {
			// barely habitable in places
			planet.landColour = [
				0.45+(random.randf()*0.2),
				0.35+(random.randf()*0.2),
				0.25+(random.randf()*0.1)
			];
			planet.seaColour = [
				0.4+(random.randf()*0.3),
				0.5+(random.randf()*0.2),
				0.6+(random.randf()*0.1)
			];
			planet.polarLandColour = [
				0.55+(random.randf()*0.15),
				0.5+(random.randf()*0.15),
				0.55+(random.randf()*0.15)
			];
			planet.polarSeaColour = [
				planet.seaColour[0] + 0.1,
				planet.seaColour[1] + 0.1,
				planet.seaColour[2] + 0.1,
			];
			planet.cloudColour = [
				0.6+(random.randf()*0.2),
				0.6+(random.randf()*0.2),
				0.6+(random.randf()*0.2)
			];
			planet.polarCloudColour = [
				0.9+(random.randf()*0.02),
				0.9+(random.randf()*0.02),
				0.9+(random.randf()*0.02)
			]; 

		} else if (h > 60) {
			// uninhabitable for us but life exists there
			planet.landColour = [
				0.1+(random.randf()*0.8),
				0.1+(random.randf()*0.2),
				0.1+(random.randf()*0.8)
			];
			planet.seaColour = [
				0.3+(random.randf()*0.5),
				0.3+(random.randf()*0.5),
				0.3+(random.randf()*0.5)
			];
			planet.polarLandColour = [
				0.4+(random.randf()*0.5),
				0.4+(random.randf()*0.5),
				0.4+(random.randf()*0.5)
			];
			planet.polarSeaColour = [
				planet.seaColour[0] + 0.2,
				planet.seaColour[1] + 0.2,
				planet.seaColour[2] + 0.2,
			];
			planet.cloudColour = [
				0.2+(random.randf()*0.7),
				0.2+(random.randf()*0.7),
				0.2+(random.randf()*0.7)
			];
			planet.polarCloudColour = [
				0.3+(random.randf()*0.5),
				0.3+(random.randf()*0.5),
				0.3+(random.randf()*0.5)
			];


		} else {
			// habitable in shelters only
			planet.landColour = [
				0.1+(random.randf()*0.8),
				0.1+(random.randf()*0.2),
				0.1+(random.randf()*0.8)
			];
			planet.seaColour = [
				0.3+(random.randf()*0.5),
				0.3+(random.randf()*0.5),
				0.3+(random.randf()*0.5)
			];
			planet.polarLandColour = [
				0.4+(random.randf()*0.5),
				0.4+(random.randf()*0.5),
				0.4+(random.randf()*0.5)
			];
			planet.polarSeaColour = [
				planet.seaColour[0] + 0.2,
				planet.seaColour[1] + 0.2,
				planet.seaColour[2] + 0.2,
			];
			planet.cloudColour = [
				0.2+(random.randf()*0.7),
				0.2+(random.randf()*0.7),
				0.2+(random.randf()*0.7)
			];
			planet.polarCloudColour = [
				0.3+(random.randf()*0.5),
				0.3+(random.randf()*0.5),
				0.3+(random.randf()*0.5)
			];

		}


		planetdata[i][j].planets.push(planet);

	};




	var $buildConnectivity = function(g) {
		var connectivity = [];
		for (var i=0;i<planetinfo.systems;i++) {
			connectivity.push([]);
		}
		for (i=0;i<planetinfo.systems;i++) {
			for (var j=i+1;j<planetinfo.systems;j++) {
				if (planetinfo.distance(g,i,j) <= 7) {
					connectivity[i].push(j)
					connectivity[j].push(i);
				}
			}
		}
		for (i=0;i<planetinfo.systems;i++) {
			planetdata[g][i].connectedSystems = connectivity[i];
		}
		return connectivity;
	}

	var $intersect = function(a1, a2) {
		for (var i=0;i<a1.length;i++) {
			if (a2.indexOf(a1[i]) != -1) {
				return true;
			}
		}
		return false;
	};

	planetinfo.ensureConnectivity = function(g) {
		var connectivity = $buildConnectivity(g);
		var found = false;
		var connected = [0];
		var i;
		do {
			found = false;
			for (i=1;i<planetinfo.systems;i++) {
				if (connected.indexOf(i) == -1) {
					if ($intersect(connectivity[i],connected)) {
						connected.push(i);
						found = true;
					}
				}
			}
			// until we don't find any more connected systems
		} while (found);
		found = false;
		for (i=1;i<planetinfo.systems;i++) {
			if (connected.indexOf(i) == -1) {
				console.error("Galaxy "+g+": Moving system "+i+" for connectivity");
				planetdata[g][i].coordinates[0] = Math.floor((128+planetdata[g][i].coordinates[0])/2);
				planetdata[g][i].coordinates[1] = Math.floor((128+planetdata[g][i].coordinates[1])/2);
				while (cused[g][planetdata[g][i].coordinates[0]+" "+planetdata[g][i].coordinates[1]]) {
					console.error("Moved onto a conflict...");
					planetdata[g][i].coordinates[0]++;
					planetdata[g][i].coordinates[1]--;
				}

				found = true;
			}
		}
		if (found) {
			// need to rebuild connectivity map
			connectivity = $buildConnectivity(g);
		}
	};



	planetinfo.dump = function(g,s,sp) {

		var info = planetdata[g][s];
		var result = "\""+g+" "+s+"\" = {\n";
		result += $plist("layer",1);
		result += $plist("coordinates",info.coordinates[0]+" "+info.coordinates[1]);
		result += $plist("random_seed",info.seed);


		result += $plist("name",info.star.name.replace(/ \(.*\)/g,""));

		result += $plist("sun_radius",info.star.radius);
		result += $plist("corona_flare",$fix(info.star.coronaFlare,2));
		result += $plist("corona_shimmer",$fix(info.star.coronaShimmer,2));
		result += $plist("corona_hues",$fix(info.star.coronaHues,2));
		result += $plist("sun_color",$color(info.star.colour));
		result += $plist("sun_distance",2E7*info.star.habitableZoneFactor); // will be repositioned anyway
		result += $plist("sun_name",info.star.name);
		result += $plist("sun_vector","0 0 1");

		/* Main planets start out completely black. Removed if no
		 * planets discovered; set to most interesting planet on
		 * discovery and just moved */
		if (false && s != 0) { // test - set everything to show first planet
			// undiscovered systems
			result += $plist("planet_distance",1E6); 
			result += $plist("radius",3000);
			result += $plist("percent_land",0);
			result += $plist("percent_ice",100);
			result += $plist("percent_cloud",0);
			result += $plist("has_atmosphere",0);
			result += $plist("cloud_alpha",0);
			
			result += $plist("rotational_velocity",0);
			result += $plist("atmosphere_rotational_velocity",0);
			
			result += $plist("land_color","blackColor");
			result += $plist("polar_land_color","blackColor");
			result += $plist("sea_color","blackColor");
			result += $plist("polar_sea_color","blackColor");
			result += $plist("cloud_color","blackColor");
			result += $plist("polar_cloud_color","blackColor");
		} else {
			result += $planetspec(info.planets[0]);
		}			
		result += $plist("planets_discovered",info.planets_discovered);

		result += $plist("sky_n_stars",info.starCount);
		result += $plist("sky_n_blurs",info.nebulaCount);

		result += $plist("description",info.description);

		result += $plist("economy",info.details.knownMinerals);
		result += $plist("government",info.details.knownHabitability);
		result += $plist("techlevel",info.details.knownBodies);
		result += $plist("economy_description",info.details.knownMineralsDesc);
		result += $plist("government_description",info.details.knownHabitabilityDesc);
		result += $plist("inhabitants",info.details.surveyEquipmentList);
		result += $plist("productivity",info.details.bestPlanet);


		result += "};\n";
		return result;
	}


	module.exports = planetinfo;

}());