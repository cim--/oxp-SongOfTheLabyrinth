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

	var highMineralPoint = 0.45;
	var mediumMineralPoint = 0.25;
	var highHabPoint


	var planetdata = [[],[],[],[],[],[],[],[]];

	// region 0 should never be asked for
	var regiondata = [{}];

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
		hab90: ["Native Empty","Native Life","Wilderness","Agriculture I","Agriculture II","Mixed","Specialist I","Specialist I"],
		military: ["Error","Military","Military","Military","Military","Shipyard","Shipyard","Shipyard"],
		hiMinHab40: ["Empty","Extraction","Extraction","Industrial I","Industrial II","Specialist II","Specialist II","Specialist II"],
		hiMin: ["Empty","Extraction","Extraction","Industrial I","Industrial II","Industrial II","Specialist II","Specialist II"],
		hab70: ["Empty","Native Life","Wilderness","Agriculture I","Agriculture II","Mixed","Mixed","Mixed"],
		hab60col: ["Error","Error","Terraforming","Terraforming","Mixed","Error","Error","Error","Error"],
		medMinHab40: ["Empty","Extraction","Extraction","Industrial I","Error","Error","Error","Error"],
		medMin: ["Empty","Outsiders","Extraction","Error","Error","Error","Error","Error"],
		lowMinHab60Out: ["Empty","Terraforming","Error","Error","Error","Error","Error"],
		lowMin: ["Empty","Outsiders","Error","Error","Error","Error","Error"]
	};

	var economySelectionTable = {
		"Empty": ["Survival","Survival","Survival","Survival","Survival","Survival"],
		"Native Empty": ["Quarantine","Quarantine","Quarantine","Quarantine","Quarantine","Quarantine"],
		"Ruins": ["Survival","Survival","Salvage","Research (Mil)","Quarantine","Military"],
		"Native Life": ["Quarantine","Quarantine","Quarantine","Research (Bio)?","Colonisation","Colonisation"],
		"Wilderness": ["Colonisation","Colonisation","Salvage","Farming","Survival","Research (Bio)?"],
		"Terraforming": ["Terraforming","Terraforming","Terraforming","Colonisation","Colonisation","Quarantine"],
		"Outsiders": ["Survival","Survival","Salvage","Colonisation","Asteroid Mining","Asteroid Mining"],
		"Extraction": ["Asteroid Mining","Asteroid Mining","Ground Mining","Ground Mining","Ground Mining","Refining"],
		"Agriculture I": ["Farming","Farming","Farming","Tourism","Cultural","Terraforming"],
		"Agriculture II": ["Farming","Farming","Tourism","Cultural","Cultural","Cultural"],
		"Industrial I": ["Refining","Refining","Refining","Production","Production","Production"],
		"Industrial II": ["Refining","Production","Production","Production","Shipyard","Shipyard"],
		"Mixed": ["Cultural","Cultural","Tourism","Farming","Production","*Research*"],
		"Specialist I": ["Cultural","*Research*","*Research*","*Research*","*Research*","Shipyard"],
		"Specialist II": ["*Research*","*Research*","*Research*","*Research*","*Research*","Shipyard"],
		"Military": ["Military","Military","Military","Shipyard","Research (Mil)","Quarantine"],
		"Shipyard": ["Production","Military","Shipyard","Shipyard","Shipyard","Research (Eng)"],
		"Research": ["Research (Eng)","Research (Soc)","Research (Comp)","Research (Bio)","Research (Sci)","Research (Mil)"] 
	};

	var resstarcounts = {};
	var maxresstarcount = 0;

	var economyProductivityTable = {
		"Survival": 1,
		"Salvage": 5,
		"Quarantine": 1,
		"Military": 30,
		"Tourism": 40,
		"Service": 50,
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
		"Service": 6,
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


	planetinfo.proximityFactor = function (gal,sys,baseline) {
		var connected = planetdata[gal][sys].connectedSystems;
		var accum = 1;
		for (var k = 0; k < connected.length; k++) {
			var other = connected[k];
			if (planetdata[gal][other].colony.founded < planetinfo.$historyStep) {
				accum += planetdata[gal][other].colony.stage;
			}
		}
		return accum * baseline;
	}


	planetinfo.uninhabitedDistances = function(gal) {
		var found = {};
		var foundc = 0;
		for (var j=0;j<planetinfo.systems;j++) {
			if (planetdata[gal][j].colony.stage > 0) {
				found[j] = 1;
				foundc++;
				planetdata[gal][j].uninhabitedDistance = 0;
			}
		}
		var undist = 1;

		while (foundc < 256) {
			for (var j=0;j<planetinfo.systems;j++) {
				if (found[j] == undist) {
					var connected = planetdata[gal][j].connectedSystems;
					for (var k = 0; k < connected.length; k++) {
						var other = connected[k];
						if (!found[other]) {
							foundc++;
							found[other] = undist+1;
							planetdata[gal][other].uninhabitedDistance = undist;
						}
					}
				}
			}
//			console.error("Gal "+gal+" undist "+undist+" count "+foundc);
			undist++;
		}

	};


	planetinfo.foundColony = function(gal,sys,specs,stage,tl,terraform) {
		if (terraform) { terraform = true; } else { terraform = false; } 
		var colony = planetinfo.get(gal,sys,"colony");
		if (colony.species.length == 0) {
			colony.founded = planetinfo.$historyStep;
		}
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
		planetinfo.addHistoryItem(gal,sys,{ type: "founded", species: specs });
	};

	planetinfo.colonyAtMaxSize = function (g,s,terraforming) {
		var ter3, ter4, ter5, ter6;
		if (!terraforming) { 
			ter3 = 70;
			ter4 = 85;
			ter5 = 90;
			ter6 = 95;
		} else { 
			ter3 = 60; 
			ter4 = 80;
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
			 (planet.mineralWealth < highMineralPoint && hmax < ter3))) { return true; } 
		// to get to stage 1 requires hab >= ter || medium mineral wealth and hab >= 10
		if (colony.stage >= 1 && 
			(hmax < 10 || 
			 (planet.mineralWealth < mediumMineralPoint && hmax < ter3))) { return true; } 
		return false;
	};

	planetinfo.advanceColonyStage = function(g,s,terraforming) {
		if (!planetinfo.colonyAtMaxSize(g,s,terraforming)) {
			var colony = planetinfo.get(g,s,"colony");
			// okay, can advance
			colony.stage++;
			planetinfo.addHistoryItem(g,s,{ type: "expanded" , newSize: colony.stage });
		}
	};

	planetinfo.reduceColonyStage = function(g,s,nolog) {
		var colony = planetinfo.get(g,s,"colony");
		if (colony.stage > 1) {
			colony.stage--;
			if (!nolog) {
				planetinfo.addHistoryItem(g,s,{ type: "reduced" , newSize: colony.stage });
			}
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
		planetinfo.reduceColonyStage(g,s,true);
		var colony = planetinfo.get(g,s,"colony");
		colony.techLevel -= t;
		if (colony.techLevel < 1) {
			colony.techLevel = 1;
		}
		colony.attacked = 1;
		planetinfo.addHistoryItem(g,s,{ type: "raided", newSize: colony.stage, oldSize: colony.stage+1 });
	};

	planetinfo.assaultColony = function(g,s,t) {
		var colony = planetinfo.get(g,s,"colony");
		planetinfo.addHistoryItem(g,s,{ type: "assaulted", newSize: 1, oldSize: colony.stage });

		while (colony.stage > 1) {
			planetinfo.reduceColonyStage(g,s,true);
		}
		colony.techLevel = t;
		if (colony.techLevel < 1) {
			colony.techLevel = 1;
		}
		colony.attacked = 2;
	};

	planetinfo.destroyColony = function(g,s) {
		var colony = planetinfo.get(g,s,"colony");
		planetinfo.addHistoryItem(g,s,{ type: "destroyed", oldSize: colony.stage });
		colony.stage = 0;
		colony.population = 0;
//		colony.species = []; // needed for later records
		colony.techLevel = 0;
		colony.independentHub = 0; // unlikely that an embassy will go, but possible
		colony.attacked = 3;
		colony.destroyed = 1;

	};

	planetinfo.economyType = function(g,s,roll,prodfactor,random) {
		var colony = planetinfo.get(g,s,"colony");
		var hab = planetinfo.get(g,s,"habitability");
		var planet = planetinfo.get(g,s,"planet");

		var table = "";
		// tables are a little misnamed now
		if (hab.best >= 95) {
			table = "hab90";	
		} else if (colony.militaryBase) {
			table = "military";
		} else if (planet.mineralWealth >= highMineralPoint) {
			if (hab.best >= 40) {
				table = "hiMinHab40";
			} else {
				table = "hiMin";
			}
		} else if (hab.best >= 70) {
			table = "hab70";
		} else if (hab.best >= 60 && colony.stage >= 2) {
			table = "hab60col";
		} else if (planet.mineralWealth >= mediumMineralPoint && hab.best >= 40) {
			table = "medMinHab40";
		} else if (planet.mineralWealth >= mediumMineralPoint) {
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
		if ((ectype == "Empty" && colony.attacked > 0) || colony.attacked > 1) {
			ectype = "Ruins";
		}
		var economy = {};
		economy.reason = ectype;
		economy.type = economySelectionTable[ectype][roll];
		if (economy.type == "*Research*") {
			// random research type instead
			var et = "";
			do {
				et = economySelectionTable["Research"][random.rand(6)];
				if (!resstarcounts[et]) {
					resstarcounts[et] = 0;
				}
				// balance usage of types carefully
			} while (resstarcounts[et] > (maxresstarcount/6));
			resstarcounts[et]++;
			maxresstarcount++;
			economy.type = et;
		} else if (economy.type == "Research (Bio)?") {
			if (random.rand(3)==0) {
				economy.type = "Research (Bio)";
			} else {
				economy.type = "Tourism";
			}
		} else if ((economy.type == "Tourism" || economy.type == "Cultural") && random.randf() < 0.5) {
			economy.type = "Service";
		}
		
		economy.icon = economyIconTable[economy.type];

		economy.productivity = economyProductivityTable[economy.type] * colony.population * (0.5+prodfactor) * 100;
		if (planetinfo.bottleneckType(g,s) != 0) {
			economy.productivity *= 1.25;
		}

		planetinfo.set(g,s,"economy",economy);
	};

	planetinfo.getRegion = function(r) {
		return regiondata[r];
	};

	planetinfo.setRegion = function(r,info) {
		return regiondata[r] = info;
	};

	planetinfo.governmentCategoryFromType = function(type) {
		var cortypes = ["Company Monopoly","Capitalist Plutocracy","Corporate System","Timocracy"];
		var demtypes = ["Republican Democracy","Federal Democracy","Demarchy","Direct Democracy"];
		var hietypes = ["Dictatorship","Technocracy","Feudal Realm","Martial Law","Family Clans"];
		var coltypes = ["Socialist","Communist","Independent Communes","Workers' Cooperative"];
		var atytypes = ["Isolationist","Quarantine","Anarchist","Transapientism","Social Evolutionist","Cultural Reacher","Precedentarchy","Bureaucracy","Variationist"];
		var usctypes = ["United Species Coalition","United Species Embassy"];
		if (cortypes.indexOf(type) != -1) {
			return "Corporate";
		} else if (demtypes.indexOf(type) != -1) {
			return "Democratic";
		} else if (hietypes.indexOf(type) != -1) {
			return "Hierarchical";
		} else if (coltypes.indexOf(type) != -1) {
			return "Collective";
		} else if (atytypes.indexOf(type) != -1) {
			return "Atypical";
		} else if (usctypes.indexOf(type) != -1) {
			return "United Species";
		} else {
			return "Disordered";
		}
	};

	planetinfo.randomDisorderedGovernment = function(r) {
		var distypes = ["Civil War","Criminal Rule","Fragmented Rule","Vigilantism"];
		return distypes[Math.floor(distypes.length*r)];
	};


	planetinfo.addHistoryItem = function(g,s,item) {
		if (!planetdata[g][s].history) {
			planetdata[g][s].history = [];
		}
		item.historyStep = planetinfo.$historyStep;
		planetdata[g][s].history.push(item);
	};

	planetinfo.$historyStep = 0;


	planetinfo.dump = function(g,s,sp) {
		var fix = function(a,b) {
			return a.toFixed(b);
		}
		var color = function(a) {
			return fix(a[0],3)+" "+fix(a[1],3)+" "+fix(a[2],3);
		}

		var info = planetdata[g][s];
		
		var govtDebugNum = function(type) {
			if (type == "") { return 1; } // not yet determined
			var c = planetinfo.governmentCategoryFromType(type);
			if (c == "Corporate") { return 7; }
			if (c == "Democratic") { return 6; }
			if (c == "Hierarchical") { return 3; }
			if (c == "Collective") { return 4; }
			if (c == "Atypical") { return 2; }
			if (c == "Disordered") { return 0; }
			if (c == "United Species") { return 5; }
			return 1; // never?
		}

		var result = "\""+g+" "+s+"\" = {\n";
		result += $plist("layer",1);
		result += $plist("coordinates",info.coordinates[0]+" "+info.coordinates[1]);
		result += $plist("random_seed",info.seed);


		if (info.colony.stage > 0 || info.colony.founded > 0) {
			result += $plist("name",info.name);
			result += $plist("planet_name",info.name);
		} else {
			// slightly different system map for uninhabited systems
			result += $plist("name",info.star.name.replace(/ \(.*\)/g,""));
			result += $plist("planet_name",info.name);
		}
		result += $plist("sun_radius",info.star.radius);
		result += $plist("corona_flare",fix(info.star.coronaFlare,2));
		result += $plist("corona_shimmer",fix(info.star.coronaShimmer,2));
		result += $plist("corona_hues",fix(info.star.coronaHues,2));
		result += $plist("sun_color",color(info.star.colour));
		result += $plist("sun_distance",info.planet.orbitalRadius);
		result += $plist("sun_name",info.star.name);
		result += $plist("sun_vector",color(info.star.vector));

		result += $plist("planet_distance",fix(info.planet.zpos,0));
		result += $plist("radius",fix(info.planet.radius,0));
		result += $plist("percent_land",fix(100*info.planet.percentLand,2));
		result += $plist("percent_ice",fix(100*info.planet.percentIce,2));
		result += $plist("percent_cloud",fix(100*info.planet.percentCloud,2));
		result += $plist("has_atmosphere",info.planet.cloudAlpha>0?1:0);
		result += $plist("cloud_alpha",fix(info.planet.cloudAlpha,2));

		result += $plist("rotational_velocity",fix(info.planet.rotationalVelocity,7));
		result += $plist("atmosphere_rotational_velocity",fix(info.planet.atmosphereVelocity,7));

		result += $plist("land_color",color(info.planet.landColour));
		result += $plist("polar_land_color",color(info.planet.polarLandColour));
		result += $plist("sea_color",color(info.planet.seaColour));
		result += $plist("polar_sea_color",color(info.planet.polarSeaColour));
		result += $plist("cloud_color",color(info.planet.cloudColour));
		result += $plist("polar_cloud_color",color(info.planet.polarCloudColour));

		result += $plist("sky_n_stars",info.starCount);
		result += $plist("sky_n_blurs",info.nebulaCount);
		if (info.nebulaColours.length > 0) {
			result += $plist("nebula_color_1",color(info.nebulaColours.slice(0,3)));
			result += $plist("nebula_color_2",color(info.nebulaColours.slice(3)));
			result += $plist("sky_blur_scale",30);
		}

		result += $plist("population",info.colony.stage*10); // unread
		result += $plist("population_description",info.colony.populationDescription);
		if (info.colony.stage > 0) { 
			if (info.colony.species.length > 3) {
				result += $plist("inhabitants","Mixed species");
			} else {
				result += $plist("inhabitants",info.colony.species.map(
					function(x) {
						return sp.name(x);
					}
				).join(", "));
			}
			result += $plist("inhabitant","Inhabited");
		} else {
			result += $plist("inhabitants","Uninhabited");
			result += $plist("inhabitant","Uninhabited");
		}
		result += $plist("techlevel",info.colony.techLevel?info.colony.techLevel-1:0); 

		result += $plist("economy",info.economy.icon);
		result += $plist("economy_description",info.economy.type);
		result += $plist("productivity",Math.ceil(info.economy.productivity/1E6));

		result += $plist("government",info.politics.stability);
		if (info.colony.stage > 0) {
			result += $plist("government_description",info.politics.governmentType);
			result += $plist("sotw_government_category",info.politics.governmentCategory);
		} else {
			result += $plist("government_description","None");
			result += $plist("sotw_government_category","None");
		}

		result += $plist("station",info.station.type); // temporary
		result += $plist("station_vector",color(info.station.vector));

		result += $plist("description",info.description);
		result += $plist("sotw_description_elements",info.descriptionElements);
		result += $plist("sotw_description_elements_used",info.descriptionElementsUsed);

		result += $plist("sotw_planet_surface_radiation",fix(info.planet.surfaceRadiation,3));
		result += $plist("sotw_planet_surface_temperature",fix(info.planet.temperature,0));
		result += $plist("sotw_mineral_wealth",fix(info.planet.mineralWealth,2));
		result += $plist("sotw_habitability_best",fix(info.habitability.best,1));
		result += $plist("sotw_economy_reason",info.economy.reason);
		

		if (this.$debug) {
//			result += $plist("government",govtDebugNum(info.politics.governmentType));
//			result += $plist("government",info.colony.stage);
//			result += $plist("government",info.politics.region?(info.politics.region%4)+2:(info.colony.contested||info.colony.independentHub?7:0));
			result += $plist("founded",info.colony.founded);
			result += $plist("planet_surface_gravity",fix(info.planet.surfaceGravity,2));
			result += $plist("planet_seismic_instability",fix(info.planet.seismicInstability,3));
			result += $plist("undist",info.uninhabitedDistance);
			result += $plist("attacked",info.colony.attacked);
			result += $plist("contested",info.colony.contested);
			result += $plist("independent_hub",info.colony.independentHub);
			result += $plist("accession",info.politics.accession);
			result += $plist("military_base",info.colony.militaryBase);
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
			result += $plist("hab_worst",fix(info.habitability.worst,1));
//			result += $plist("description","Habitability: "+fix(info.habitability.worst,0)+"-"+fix(info.habitability.average,0)+"-"+fix(info.habitability.best,0)+". Sun: "+info.star.sequence+". Radiation: "+fix(info.planet.surfaceRadiation,3)+". Minerals: "+fix(info.planet.mineralWealth,2)+". Earthquakes: "+fix(info.planet.seismicInstability,3)+". Flares: "+fix(info.star.instability,2)+". Land: "+fix(info.planet.landFraction,2)+". Wind speed: "+fix(info.planet.windFactor,2)+". Temperature: "+fix(info.planet.temperature,0)+". Gravity: "+fix(info.planet.surfaceGravity,2)+". Attacked: "+info.colony.attacked+". Military: "+info.colony.militaryBase+". Economy Reason: "+info.economy.reason+". Bottleneck: "+planetinfo.bottleneckType(g,s)+". Orbits: "+info.star.name);
		}

		result += "};\n";
		return result;
	};


	planetinfo.dumpRegion = function(g,s) {
		var region = planetdata[g][s].politics.region;
		if (region > 0) {
			var rdata = planetinfo.getRegion(region);
			return $plist("long-range-chart-title-"+g+"-"+s,rdata.name);
		} else {
			var colony = planetdata[g][s].colony;
			if (colony.contested) {
				var cnames = " ("+colony.contesting.map(function(i) {
					// return region name for region id
					return planetinfo.getRegion(i).name;
				}).join("/")+")";
				return $plist("long-range-chart-title-"+g+"-"+s,"Disputed system"+cnames);
			} else if (colony.embassy) {
				return $plist("long-range-chart-title-"+g+"-"+s,"USC Embassy");
			} else if (colony.independentHub) {
				return $plist("long-range-chart-title-"+g+"-"+s,"Independent hub");
			}
		}
		return "";
	};

	var regionColor = function(category) {
		if (category.match(/Political Alliance/)) {
			return "0.3 0.7 0.3 0.5";
		} else if (category == "Politically Unstable Region") {
			return "0.7 0.3 0.3 0.5";
		} else {
			return "0.3 0.3 0.7 0.5";
		}
	};

	planetinfo.dumpRegionLinks = function(r) {
		var p1,p2;
		var result = "// "+r.name+" ("+r.members.join(",")+")\n";
		for (var i=0;i<r.members.length;i++) {
			for (var j=i+1;j<r.members.length;j++) {
				p1 = r.members[i];
				p2 = r.members[j];
				if (p2 < p1) {
					var tmp = p1; p1 = p2; p2 = tmp; // swap
				}
				result += "\"interstellar: "+r.galaxy+" "+p1+" "+p2+"\" = {\n";
				result += $plist("link_color",regionColor(r.category));
				result += "};\n";
			}
			var connected = planetdata[r.galaxy][r.members[i]].connectedSystems;
			var accum = 1;
			for (var k = 0; k < connected.length; k++) {
				var other = connected[k];
				if (planetdata[r.galaxy][other].colony.contested || (planetdata[r.galaxy][other].colony.independentHub && !planetdata[r.galaxy][other].colony.embassy)) {
					p1 = r.members[i];
					p2 = other
					if (p2 < p1) {
						var tmp = p1; p1 = p2; p2 = tmp; // swap
					}
					result += "\"interstellar: "+r.galaxy+" "+p1+" "+p2+"\" = {\n";
					if (planetdata[r.galaxy][other].colony.independentHub) {
						result += $plist("link_color","0.2 0.6 0.6 0.5");
					} else {
						result += $plist("link_color","0.7 0.5 0.2 0.5");
					}
					result += "};\n";
					

				}
			}

		}
		return result;
	};

	module.exports = planetinfo;


}());