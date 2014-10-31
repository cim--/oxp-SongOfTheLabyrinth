/** Planet information data store
 * Methods so far: 
 * set(galaxy,system,property,value)
 * get(galaxy,system,property)
 * distance (galaxy,system,system)
 * ensureConnectivity() - moves disconnected systems closer to centre
 * dump() - prints plist
 *
 * foundColony(gal,sys,speciesArr,stage,tl)
 * advanceColonyStage(gal,sys[,terraform]) - increase colony stage by 1 if possible
 * reduceColonyStage(gal,sys) - reduce colony stage by 1 if not outpost, update TL
 * advanceColonyTech(gal,sys,amount) - increase TL if possible
 * TODO: the above block should add to a colony history log for descriptions
 *
 * bottleneckType(gal, sys). 0, 1 or 2
 * economyType(gal, sys, d6, randf)  set economic variables
 *
 * Lots more methods will be needed later
 *
 */
"use strict";

(function() {

	var planetdata = [[],[],[],[],[],[],[],[]];

	var cused = [{},{},{},{},{},{},{},{}];

	var $plist = function(k,v) {
		return "\t\""+k+"\" = \""+v+"\";\n";
	}

	for (var g=0;g<8;g++) {
		for (var i=0;i<256;i++) {
			planetdata[g][i] = {};
		}
	}

	var economyTypeTable = {
		hab90: ["Ruins","Native Life","Wilderness","Agriculture I","Agriculture II","Mixed","Specialist I","Specialist I"],
		military: ["Error","Military","Military","Military","Military","Shipyard","Shipyard","Shipyard"],
		hiMinHab40: ["Ruins","Extraction","Extraction","Industrial I","Industrial I","Industrial II","Specialist II","Specialist II"],
		hiMin: ["Ruins","Extraction","Extraction","Extraction","Industrial I","Industrial II","Specialist II","Specialist II"],
		hab70: ["Ruins","Native Life","Wilderness","Agriculture I","Agriculture II","Mixed","Mixed","Mixed"],
		hab60col: ["Error","Error","Terraforming","Terraforming","Mixed","Error","Error","Error","Error"],
		medMinHab40: ["Empty","Extraction","Extraction","Industrial I","Error","Error","Error","Error"],
		medMin: ["Empty","Outsiders","Extraction","Error","Error","Error","Error","Error"],
		lowMinHab60Out: ["Empty","Terraforming","Error","Error","Error","Error","Error"],
		lowMin: ["Empty","Outsiders","Error","Error","Error","Error","Error"]
	};

	var economySelectionTable = {
		"Empty": ["Survival","Survival","Survival","Survival","Salvage","Salvage"],
		"Ruins": ["Survival","Survival","Salvage","Research (Mil)","Quarantine","Military"],
		"Native Life": ["Quarantine","Quarantine","Tourism","Research (Bio)","Colonisation","Colonisation"],
		"Wilderness": ["Colonisation","Colonisation","Tourism","Farming","Survival","Research (Bio)"],
		"Terraforming": ["Terraforming","Terraforming","Terraforming","Colonisation","Colonisation","Quarantine"],
		"Outsiders": ["Survival","Survival","Survival","Salvage","Salvage","Asteroid Mining"],
		"Extraction": ["Salvage","Asteroid Mining","Asteroid Mining","Ground Mining","Ground Mining","Refining"],
		"Agriculture I": ["Farming","Farming","Farming","Tourism","Cultural","Terraforming"],
		"Agriculture II": ["Farming","Farming","Tourism","Cultural","Cultural","Cultural"],
		"Industrial I": ["Ground Mining","Refining","Refining","Refining","Production","Production"],
		"Industrial II": ["Refining","Production","Production","Research (Eng)","Research (Comp)","Shipyard"],
		"Mixed": ["Cultural","Cultural","Tourism","Farming","Production","*Research*"],
		"Specialist I": ["Cultural","Cultural","*Research*","*Research*","*Research*","Shipyard"],
		"Specialist II": ["Research (Comp)","Research (Comp)","Research (Eng)","Research (Eng)","Research (Sci)","Shipyard"],
		"Military": ["Military","Military","Military","Shipyard","Research (Mil)","Quarantine"],
		"Shipyard": ["Production","Military","Shipyard","Shipyard","Shipyard","Research (Eng)"],
		"Research": ["Research (Mil)","Research (Bio)","Research (Eng)","Research (Soc)","Research (Comp)","Research (Sci)"]
	};

	var economyProductivityTable = {
		"Survival": 1,
		"Salvage": 5,
		"Quarantine": 1,
		"Military": 30,
		"Tourism": 40,
		"Colonisation": 10,
		"Farming": 60,
		"Terraforming": 10,
		"Asteroid Mining": 15,
		"Ground Mining": 35,
		"Refining": 50,
		"Cultural": 55,
		"Production": 80,
		"Shipyard": 70,
		"Research (Mil)": 60,
		"Research (Bio)": 65,
		"Research (Eng)": 70,
		"Research (Soc)": 60,
		"Research (Comp)": 70,
		"Research (Sci)": 45
	};

	var economyIconTable = {
		"Survival": 0,
		"Salvage": 2,
		"Quarantine": 0,
		"Military": 1,
		"Tourism": 6,
		"Colonisation": 4,
		"Farming": 5,
		"Terraforming": 4,
		"Asteroid Mining": 2,
		"Ground Mining": 2,
		"Refining": 3,
		"Cultural": 6,
		"Production": 3,
		"Shipyard": 3,
		"Research (Mil)": 7,
		"Research (Bio)": 7,
		"Research (Eng)": 7,
		"Research (Soc)": 7,
		"Research (Comp)": 7,
		"Research (Sci)": 7
	};

	var planetinfo = {};

	planetinfo.$debug = 0;

	planetinfo.galaxies = 8;
	planetinfo.systems = 256;

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

	/* 0 = not, 1 = bridge, 2 = convergency (or more complex form) */
	planetinfo.bottleneckType = function(g,s) {
		var conn = planetdata[g][s].connectedSystems;
		var connectionset = [conn[0]];
		var sofar = 0;
		do {
			sofar = connectionset.length;
			for (var i=0; i<conn.length; i++) {
				if (connectionset.indexOf(conn[i]) == -1) {
					var second = planetdata[g][conn[i]].connectedSystems;
					for (var j=0;j<second.length;j++) {
						if (second[j] != s && connectionset.indexOf(second[j]) > -1) {
							connectionset.push(conn[i]);
							break;
						}
					}
				}
			}
		} while (connectionset.length > sofar);
//		console.error(g+" "+s+" has hc "+conn.length+", connected "+connectionset.length);
		if (connectionset.length == conn.length) {
			return 0;
		} else if (connectionset.length == conn.length-1 || connectionset.length == 1) {
			return 1;
		} else {
			return 2;
		}
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
//				console.error("Galaxy "+g+": Moving system "+i+" for connectivity");
				planetdata[g][i].coordinates[0] = Math.floor((128+planetdata[g][i].coordinates[0])/2);
				planetdata[g][i].coordinates[1] = Math.floor((128+planetdata[g][i].coordinates[1])/2);
				while (cused[g][planetdata[g][i].coordinates[0]+" "+planetdata[g][i].coordinates[1]]) {
//					console.error("Moved onto a conflict...");
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


	planetinfo.foundColony = function(gal,sys,specs,stage,tl,terraform) {
		if (terraform) { terraform = true; } else { terraform = false; } 
		var colony = planetinfo.get(gal,sys,"colony");
		var i;
		for (i=0;i<specs.length;i++) {
			if (colony.species.indexOf(specs[i]) == -1) {
				colony.species.push(specs[i]);
			}
		}
		for (i=colony.stage;i<stage;i++) {
			planetinfo.advanceColonyStage(gal,sys,terraform);
		}
		if (colony.stage != stage) {
			console.error("Colony habitation failed "+JSON.stringify(colony)+" for "+gal+","+sys+" "+specs+" ("+stage+","+tl+")");
		}
		planetinfo.advanceColonyTech(gal,sys,tl-colony.techLevel);
	};

	planetinfo.colonyAtMaxSize = function (g,s,terraforming) {
		var ter3, ter4, ter5, ter6;
		if (!terraforming) { 
			ter3 = 70;
			ter4 = 80;
			ter5 = 90;
			ter6 = 95;
		} else { 
			ter3 = 60; 
			ter4 = 75;
			ter5 = 85;
			ter6 = 90;
		}
		var colony = planetinfo.get(g,s,"colony");
		var planet = planetinfo.get(g,s,"planet");
		if (colony.stage >= 7) { return true; } // at max
		var hab = planetinfo.get(g,s,"habitability");
		var hmax = 0;
		for (var i=0;i<colony.species.length;i++) {
			if (hab[colony.species[i]] > hmax) {
				hmax = hab[colony.species[i]];
			}
		}
		// to get to stage 6 requires hab >= 95
		if (colony.stage >= 6 && hmax < ter6) { return true; }
		// to get to stage 5 requires hab >= 90
		if (colony.stage >= 5 && hmax < ter5) { return true; }
		// to get to stage 4 requires hab >= 80
		if (colony.stage >= 4 && hmax < ter4) { return true; }
		// to get to stage 3 requires hab >= ter
		if (colony.stage >= 3 && hmax < ter3) { return true; }
		// to get to stage 2 requires hab >= ter || high mineral wealth and hab >= 40
		if (colony.stage >= 2 && 
			(hmax < 40 || 
			 (planet.mineralWealth < 0.6 && hmax < ter3))) { return true; } 
		// to get to stage 1 requires hab >= ter || medium mineral wealth and hab >= 10
		if (colony.stage >= 1 && 
			(hmax < 10 || 
			 (planet.mineralWealth < 0.3 && hmax < ter3))) { return true; } 
		return false;
	};

	planetinfo.advanceColonyStage = function(g,s,terraforming) {
		if (!planetinfo.colonyAtMaxSize(g,s,terraforming)) {
			var colony = planetinfo.get(g,s,"colony");
			// okay, can advance
			colony.stage++;
		}
	};

	planetinfo.reduceColonyStage = function(g,s) {
		var colony = planetinfo.get(g,s,"colony");
		if (colony.stage > 1) {
			colony.stage--;
		}
		planetinfo.advanceColonyTech(g,s,0);
	};

	planetinfo.advanceColonyTech = function(g,s,a) {
		var colony = planetinfo.get(g,s,"colony");
		colony.techLevel += a;
		if (colony.stage == 0 && colony.techLevel > 1) {
			colony.techLevel = 1; // uninhabited max
		} else if (colony.stage == 1 && colony.techLevel > 5) {
			colony.techLevel = 5; // outpost max
		} else if (colony.stage == 2 && colony.techLevel > 9) {
			colony.techLevel = 9; // stage 1 colony max
		} else if (colony.stage == 3 && colony.techLevel > 13) {
			colony.techLevel = 13; // stage 2 colony max
		} else if (colony.techLevel > 15) {
			colony.techLevel = 15; // absolute max
		}
	};

	planetinfo.raidColony = function(g,s,t) {
		planetinfo.reduceColonyStage(g,s);
		var colony = planetinfo.get(g,s,"colony");
		colony.techLevel -= t;
		if (colony.techLevel < 1) {
			colony.techLevel = 1;
		}
		colony.attacked = 1;
	};

	planetinfo.assaultColony = function(g,s,t) {
		var colony = planetinfo.get(g,s,"colony");
		while (colony.stage > 1) {
			planetinfo.reduceColonyStage(g,s);
		}
		colony.techLevel = t;
		if (colony.techLevel < 1) {
			colony.techLevel = 1;
		}
		colony.attacked = 2;
	};

	planetinfo.destroyColony = function(g,s) {
		var colony = planetinfo.get(g,s,"colony");
		colony.stage = 0;
		colony.population = 0;
		colony.species = [];
		colony.techLevel = 0;
		colony.independentHub = 0; // unlikely that an embassy will go, but possible
		colony.attacked = 3;
		colony.destroyed = 1;
	};

	planetinfo.economyType = function(g,s,roll,prodfactor) {
		var colony = planetinfo.get(g,s,"colony");
		var hab = planetinfo.get(g,s,"habitability");
		var planet = planetinfo.get(g,s,"planet");

		var table = "";
		if (hab.best >= 90) {
			table = "hab90";	
		} else if (colony.militaryBase) {
			table = "military";
		} else if (planet.mineralWealth >= 0.6) {
			if (hab.best >= 40) {
				table = "hiMinHab40";
			} else {
				table = "hiMin";
			}
		} else if (hab.best >= 70) {
			table = "hab70";
		} else if (hab.best >= 60 && colony.stage >= 2) {
			table = "hab60col";
		} else if (planet.mineralWealth >= 0.3 && hab.best >= 40) {
			table = "medMinHab40";
		} else if (planet.mineralWealth >= 0.3) {
			table = "medMin";
		} else if (hab.best >= 60) {
			table = "lowMinHab60Out";
		} else {
			table = "lowMin";
		}
		var ectype = economyTypeTable[table][colony.stage];
		if (ectype == "Error") {
			console.error("Unexpected economy type for "+g+" "+s);
			return;
		}
		var economy = {};
		economy.reason = ectype;
		economy.type = economySelectionTable[ectype][roll];
		if (economy.type == "*Research*") {
			// random research type instead
			economy.type = economySelectionTable["Research"][s%6];
		}
		economy.icon = economyIconTable[economy.type];

		economy.productivity = economyProductivityTable[economy.type] * colony.population * (0.5+prodfactor) * 100;
		if (planetinfo.bottleneckType(g,s) != 0) {
			economy.productivity *= 1.25;
		}

		planetinfo.set(g,s,"economy",economy);
	};

	planetinfo.dump = function(g,s) {
		var fix = function(a,b) {
			return a.toFixed(b);
		}
		var color = function(a) {
			return fix(a[0],3)+" "+fix(a[1],3)+" "+fix(a[2],3);
		}

		var info = planetdata[g][s];
		
		var result = "\""+g+" "+s+"\" = {\n";
		result += $plist("coordinates",info.coordinates[0]+" "+info.coordinates[1]);
		result += $plist("name",info.name);
		result += $plist("sun_radius",info.star.radius);
		result += $plist("corona_flare",fix(info.star.coronaFlare,2));
		result += $plist("corona_shimmer",fix(info.star.coronaShimmer,2));
		result += $plist("corona_hues",fix(info.star.coronaHues,2));
		result += $plist("sun_color",color(info.star.colour));
		result += $plist("sun_distance",info.planet.orbitalRadius);
		result += $plist("sun_name",info.star.sequence);

		result += $plist("planet_distance",fix(info.planet.zpos,0));
		result += $plist("radius",fix(info.planet.radius,0));
		result += $plist("percent_land",fix(100*info.planet.percentLand,2));
		result += $plist("percent_ice",fix(100*info.planet.percentIce,2));
		result += $plist("percent_cloud",fix(100*info.planet.percentCloud,2));
		result += $plist("cloud_alpha",fix(info.planet.cloudAlpha,2));
		result += $plist("rotational_velocity",fix(info.planet.rotationalVelocity,7));
		result += $plist("atmosphere_rotational_velocity",fix(info.planet.atmosphereVelocity,7));

		result += $plist("land_color",color(info.planet.landColour));
		result += $plist("polar_land_color",color(info.planet.polarLandColour));
		result += $plist("sea_color",color(info.planet.seaColour));
		result += $plist("polar_sea_color",color(info.planet.polarSeaColour));
		result += $plist("cloud_color",color(info.planet.cloudColour));
		result += $plist("polar_cloud_color",color(info.planet.polarCloudColour));

		result += $plist("population",info.colony.stage*10); // unread
		result += $plist("population_description",info.colony.populationDescription);
		if (info.colony.stage > 0) { 
			result += $plist("inhabitants",info.colony.species.join(", "));
		} else {
			result += $plist("inhabitants","Uninhabited");
		}
		result += $plist("techlevel",info.colony.techLevel?info.colony.techLevel-1:0); 

		result += $plist("economy",info.economy.icon);
		result += $plist("economy_description",info.economy.type);
		result += $plist("productivity",Math.ceil(info.economy.productivity/1E6));

		if (this.$debug) {
//			result += $plist("government",info.colony.stage);
			result += $plist("government",info.politics.region?(info.politics.region%4)+2:(info.colony.contested||info.colony.independentHub?7:0));
			result += $plist("mineral_wealth",fix(info.planet.mineralWealth,2));
			result += $plist("planet_surface_temperature",fix(info.planet.temperature,0));
			result += $plist("planet_surface_radiation",fix(info.planet.surfaceRadiation,3));
			result += $plist("planet_surface_gravity",fix(info.planet.surfaceGravity,2));
			result += $plist("planet_seismic_instability",fix(info.planet.seismicInstability,3));
			result += $plist("attacked",info.colony.attacked);
			result += $plist("military_base",info.colony.militaryBase);
			result += $plist("economy_reason",info.economy.reason);
			result += $plist("planet_wind_speeds",fix(info.planet.windFactor,3));
			result += $plist("star_instability",fix(info.star.instability,2));
			result += $plist("hab_b",fix(info.habitability.Bird,1));
			result += $plist("hab_fe",fix(info.habitability.Feline,1));
			result += $plist("hab_fr",fix(info.habitability.Frog,1));
			result += $plist("hab_h",fix(info.habitability.Human,1));
			result += $plist("hab_i",fix(info.habitability.Insect,1));
			result += $plist("hab_li",fix(info.habitability.Lizard,1));
			result += $plist("hab_lo",fix(info.habitability.Lobster,1));
			result += $plist("hab_r",fix(info.habitability.Rodent,1));
			result += $plist("description","Habitability: "+fix(info.habitability.worst,0)+"-"+fix(info.habitability.average,0)+"-"+fix(info.habitability.best,0)+". Sun: "+info.star.sequence+". Radiation: "+fix(info.planet.surfaceRadiation,3)+". Minerals: "+fix(info.planet.mineralWealth,2)+". Earthquakes: "+fix(info.planet.seismicInstability,3)+". Flares: "+fix(info.star.instability,2)+". Land: "+fix(info.planet.landFraction,2)+". Wind speed: "+fix(info.planet.windFactor,2)+". Temperature: "+fix(info.planet.temperature,0)+". Gravity: "+fix(info.planet.surfaceGravity,2)+". Attacked: "+info.colony.attacked+". Military: "+info.colony.militaryBase+". Economy Reason: "+info.economy.reason+". Bottleneck: "+planetinfo.bottleneckType(g,s));
		}

		result += "};\n";
		return result;
	};


	planetinfo.dumpRegion = function(g,s) {
		return $plist("long-range-chart-title-"+g+"-"+s,planetdata[g][s].politics.regionName);
	};


	module.exports = planetinfo;


}());