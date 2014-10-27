#!/usr/local/bin/node
"use strict";

var random = require("./random");
var species = require("./species");
var $ = require("./planetinfo");

random.seed(7693175); // may need to change this depending on results
random.fill(1299827); // prime
// it'll loop around the fill when it hits the limit, so prime is necessary

var i,j,k; //iteration indices
// tend to use i for galaxy iteration, j for system iteration, and k for other stuff

/* Stage 1
Randomly set system coordinates
Randomly set system star type (new MS – blue/white, large; average MS – yellow, medium; old MS – orange/red, small; dwarf – red, small ; giant – red, large). Stars are occasionally unstable (“solar activity”) which makes their systems less habitable.
Randomly set accessible mineral wealth (higher in new MS systems as asteroids more common and planets less common)
Randomly set main planet range from star, depending on type of star 
Calculate main planet temperature. Main planet is the most habitable in the system, so the range above should be set to make at least 1/3 possibly habitable rather than ice, mostly-airless rock balls, or Venus-like hells.
Calculate main planet ocean %
Calculate per-species habitability %
Mark species homeworlds
*/

random.setStart(0); // for clarity

// 2 rands per star
// broken into functions to stop local variables getting everywhere
// don't do too much in each function as it makes it harder to drop extra
// random numbers in later
(function () {
	for (i=0;i<$.galaxies;i++) {
		var cused = {};
		for (j=0;j<$.systems;j++) {
			if (j == 0) {
				// always centre system 0
				// makes connectivity enforcement easier
				$.set(i,j,"coordinates",[128,128]);
				cused["128 128"] = 1;
			} else {
				var coords = [random.rand(256),random.rand(256)];
				while (cused[coords[0]+" "+coords[1]]) {
					// don't have zero-distance doubles
//					console.error("Rerolling "+i+" " +j);
					coords = [random.rand(256),random.rand(256)];
				}
				$.set(i,j,"coordinates",coords);
				cused[coords[0]+" "+coords[1]] = 1;
			}
		}
		$.ensureConnectivity(i);
	}
}());


random.setStart(6000); // allows reducing of $.galaxies for testing, allows plenty of twin breaking

// 7 rands per star so far
(function () {
	for (i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			var startypeN = random.rand(20);
			var sradfactor, shabfactor, minfactor, basecolour;
			var star = {};
			var planet = {};
			
			switch(startypeN) { 
			case 0: case 1:
				// "blue"; 
				sradfactor = 2;
				shabfactor = 1.75;
				minfactor = 0.8;
				basecolour = [0.5,0.85,0.95];
				star.sequence = "Class A"
				break;
			case 2:	case 3: case 4:
				// "white";
				sradfactor = 1.25;
				shabfactor = 1.4;
				minfactor = 0.6;
				basecolour = [0.9,0.9,0.9];
				star.sequence = "Class F";
				break;
			case 5: case 6: case 7: case 8: case 9:
				// "yellow"; 
				sradfactor = 1;
				shabfactor = 1;
				minfactor = 0.5;
				basecolour = [0.9,0.9,0.7];
				star.sequence = "Class G";
				break;
			case 10: case 11: case 12:
				// "orange";
				sradfactor = 0.8;
				shabfactor = 0.7;
				minfactor = 0.4;
				basecolour = [0.9,0.8,0.6];
				star.sequence = "Class K";
				break;
			case 13: case 14:
				// "red";
				sradfactor = 0.6;
				shabfactor = 0.5; 
				minfactor = 0.3;
				basecolour = [0.95,0.75,0.7];
				star.sequence = "Class M";
				break;
			case 15:
				// "giant"; 
				sradfactor = 10; // should be closer to 50
				shabfactor = 10;
				minfactor = 0.1; 
				basecolour = [0.95,0.7,0.65];
				star.sequence = "Red giant";
				break;
			default: // 16-19
				// "dwarf";
				star.sequence = "Class M dwarf";
				sradfactor = 0.3;
				shabfactor = 0.4;
				minfactor = 0.2;  
				basecolour = [0.95,0.75,0.7];
			}

			star.radius = Math.floor(80000 * (0.9+(0.2*random.randf())) * sradfactor);
			/* Mostly <0.3, a few in 0.4..0.6, extremely rare 0.6..0.9 */
			star.instability = (random.randf() * random.randf() * random.randf());
			star.coronaFlare = 0.1+((star.instability / 2) + (random.randf()/10));
			star.coronaShimmer = (star.instability / 3);
			star.coronaHues = (star.instability / 1.5);
			star.habitableZoneFactor = shabfactor;
			star.mineralFactor = minfactor;

			// star colour
			var adj = (random.randf()*0.05)-0.025;
			star.colour = [
				(basecolour[0] + adj),
				basecolour[1],
				(basecolour[2] - adj)
			];


			$.set(i,j,"star",star);
		}
	}
}());


random.setStart(35000); // guess ~13 total above random numbers max

// 18 rands per system so far
(function () {
	for (i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			var star = $.get(i,j,"star");

			var planet = {};

			planet.habZoneRange = 0.5+random.randf();
			planet.orbitalRadius = Math.floor(star.habitableZoneFactor * planet.habZoneRange * 4E6);
			var mw1 = random.randf(); var mw2 = random.randf();
			// pick the one closer to the minfactor
			planet.mineralWealth = ((Math.abs(mw1-star.mineralFactor) < Math.abs(mw2-star.mineralFactor))?mw1:mw2);
			// <0.3 = low, <0.65 = medium

			planet.radius = 2750+random.rand(6000);

			// (20-60) + (~5-15) + (0-39) => (~30-115) - 60 => (-30 - 55)
			// though last 10 degrees are exceptionally rare on either edge
			planet.temperature = (planet.habZoneRange * 40) + (planet.radius / 600) + random.rand(40) - 55;
			
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
			if (pland+rockball > 1)
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
			var rad = (10*(1-pcloud)*(1-calpha)*(1.5-planet.habZoneRange)*star.instability);
			if (rad < 0) { rad = 0; }
			planet.surfaceRadiation = rad;

			planet.seismicInstability = (random.randf()*random.randf()*(2-planet.habZoneRange)*star.mineralFactor);
			if (planet.seismicInstability > 0.2)
			{
				planet.mineralWealth += planet.seismicInstability / 5;
			}

			planet.surfaceGravity = ((planet.radius/6400)*(0.8+(random.randf()*0.4)));

			planet.zpos = Math.floor(400000+random.rand(600000));

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

			$.set(i,j,"planet",planet);
		}
	}
}());


random.setStart(75000); // guess ~20 total above random numbers max


// habitability per species numbers
// not itself random, but generates planet colouring which is
// 15 rands per system
(function () {
	var initialColonyState = function() {
		return {
			stage: 0, // uninhabited
			population: 0,
			species: [],
			techLevel: 0,
			homeWorld: 0,
			contested: 0,
			independentHub: 0
		}
	};

	for (i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			var planet = $.get(i,j,"planet");
			
			var habitability = species.getHabitability(planet);

			var h = habitability.best;
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
				// habitable with a lot of work
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
				// use same number of rands
			} else if (h > 60) {
				// with terraforming, just about suitable for someone
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
				// habitable in shelters only, even for tougher species
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

			$.set(i,j,"habitability",habitability);
			$.set(i,j,"planet",planet);


			$.set(i,j,"colony",initialColonyState());
		}
	}
}());

random.setStart(150000); // guess ~35 total above random numbers max (may need more colours)

// list of key worlds (homeworlds, initial human worlds, United bases)
var keyWorlds = {};

(function() {
	var setHomeWorld = function(g,s) {
		var edging = 30;
		var best = 0; var max = 0;
		for(j=0;j<$.systems;j++) {
			var pos = $.get(g,j,"coordinates");
			var hab = $.get(g,j,"habitability");
			if (max < hab[s] && pos[0] < 255-edging && pos[0] > edging && pos[1] < 255-(2*edging) && pos[1] > 2 * edging) { 
				if (s == "Bird") {
					var fdist = $.distance(g,keyWorlds["Frog"][1],j);
					if (fdist < 25) {
						continue;
					}
				}
				max = hab[s];
				best = j;
			}
		}
		var cinfo = $.get(g,best,"colony");
		cinfo.stage = 6; // stage 5
		cinfo.homeWorld = 1;
		cinfo.techLevel = 5;
		cinfo.species.push(s);
		$.set(g,best,"name",s+" Homeworld"); // temp
		$.set(g,best,"colony",cinfo);
		keyWorlds[s] = [g,best];
		/* Reversing cause and effect here of course - we place them
		 * there because it's the best system, but actualy it's the
		 * best system because they evolved there. */
		console.error(s+" homeworld is "+g+" "+best);
	}
	setHomeWorld(0,"Lizard");
	setHomeWorld(3,"Rodent");
	setHomeWorld(4,"Feline");
	setHomeWorld(5,"Frog");
	setHomeWorld(5,"Bird");
	setHomeWorld(6,"Lobster");
	setHomeWorld(7,"Insect");
	// special case for human worlds
	var foundReach = -1;
	var reachPos = [-1,-1];
	var edge = 0;
	var planet, hab, pos;
	do {
		var candidates = [];
		for (j=0;j<$.systems;j++) {
			pos = $.get(1,j,"coordinates");
			if (pos[1] <= edge || pos[1] >= 255-edge) {
				planet = $.get(1,j,"planet");
				hab = $.get(1,j,"habitability");
				if (planet.mineralWealth < 0.4 && hab.Human < 70) {
					candidates.push(j);
				}
			}
		}
		if (candidates.length > 0) {
			foundReach = candidates[random.rand(candidates.length)];
			reachPos = $.get(1,foundReach,"coordinates");
		} else {
			edge++;
		}
	} while (foundReach == -1);

	var foundHope = -1;
	var foundLanding = -1;
	var hdist = 100;
	var ldist = 100;
	for (j=0;j<$.systems;j++) {
		if (j==foundReach) { continue; }
		hab = $.get(1,j,"habitability");
		if (hab.Human < 70) { continue; }
		pos = $.get(1,j,"coordinates");
		var dist = $.distance(1,j,foundReach);
		if (dist < hdist) {
			if (foundHope != -1) {
				foundLanding = foundHope;
				ldist = hdist;
			}
			foundHope = j;
			hdist = dist;
		} else if (dist < ldist) {
			foundLanding = j;
			ldist = dist;
		}
	}

	var hab1 = $.get(1,foundHope,"habitability");
	var hab2 = $.get(1,foundLanding,"habitability");
	if (hab1.Human < hab2.Human) {
		var tmp = foundHope;
		foundHope = foundLanding;
		foundLanding = tmp;
	}

	var cinfo = $.get(1,foundReach,"colony");
	cinfo.stage = 1; // outpost
	cinfo.species.push("Human");
	cinfo.techLevel = 2;
	$.set(1,foundReach,"colony",cinfo);
	$.set(1,foundReach,"name","Biya's Reach");
	keyWorlds["Reach"] = [1,foundReach];

	cinfo = $.get(1,foundHope,"colony");
	cinfo.stage = 3;
	cinfo.species.push("Human");
	cinfo.homeWorld = 1;
	cinfo.techLevel = 4;
	$.set(1,foundHope,"colony",cinfo);
	$.set(1,foundHope,"name","Dramani's Hope");
	keyWorlds["Hope"] = [1,foundHope];

	cinfo = $.get(1,foundLanding,"colony");
	cinfo.stage = 2;
	cinfo.species.push("Human");
	cinfo.homeWorld = 1;
	cinfo.techLevel = 3;
	$.set(1,foundLanding,"colony",cinfo);
	$.set(1,foundLanding,"name","Aquino's Landing");
	keyWorlds["Landing"] = [1,foundLanding];

}());

random.setStart(150010); // the above should be fairly deterministic

/*
 * Stage 2: initial colonisation, colonies get TL=stage
Non-human: 
Find all systems with habitability > 70% within 30 LY, give them stage 2 colonies
Find all systems with high mineral wealth within 30 LY, give them stage 1 colonies (or outposts, if too uninhabitable)
If any world in range is at least 70% habitable by both Frog and Bird, and in G6, and not within 10LY of a homeworld, give it both species. Do the same for high mineral wealth worlds but only those closer to both homeworlds than the homeworlds are to each other.
Human: 
Find system on long edge of chart with extreme Y coordinate, low habitability and mineral wealth. This is Biya's Reach – the entry system. Give it an outpost.
Find two nearest systems with >70% habitability. These are Dramani's Hope and Aquino's Landing. Set them to stage 3/2 colony levels and mark as TL4/3 homeworlds. (The one with the higher mineral wealth is Aquino's Landing)
Then find nearby good habitation or mineral systems within 20 LY of Biya's Reach and set them up as stage 1 colonies (or outposts, if too uninhabitable)
*/

(function() {
	var earlyColonies = function(g,s,r) {
		var c = keyWorlds[s];
		if (s == "Human") {
			// humans spread out from Biya's Reach at this stage
			c = keyWorlds["Reach"];
		}
		for (j=0;j<$.systems;j++) {
			if ($.distance(g,c[1],j) <= r) {
				var hab = $.get(g,j,"habitability");
				var colony = $.get(g,j,"colony");
				var planet = $.get(g,j,"planet");
				if (colony.stage == 0) {
					if (hab[s] >= 70) {
						$.foundColony(g,j,[s],3,2);
					} else if (planet.mineralWealth > 0.6) {
						if (hab[s] >= 10) {
							$.foundColony(g,j,[s],2,1);
						} else {
							$.foundColony(g,j,[s],1,1);
						}
					}
				}
			}			
		}
	};

	earlyColonies(0,"Lizard",30);
	earlyColonies(1,"Human",20);
	earlyColonies(3,"Rodent",30);
	earlyColonies(4,"Feline",30);
	earlyColonies(6,"Lobster",30);
	earlyColonies(7,"Insect",30);

	// special case for G6
	var bh = keyWorlds["Bird"];
	var fh = keyWorlds["Frog"];
	var r = 30;
	var g = 5;
	for (j=0;j<$.systems;j++) {
		var bdist = $.distance(g,bh[1],j);
		var fdist = $.distance(g,fh[1],j);
		var hdist = $.distance(g,bh[1],fh[1]);
		var hab = $.get(g,j,"habitability");
		var colony = $.get(g,j,"colony");
		var planet = $.get(g,j,"planet");
		if (colony.stage == 0) {
			if (bdist < 30 || fdist < 30) {
				if (hab["Bird"] >= 70 && hab["Frog"] >= 70) {
					// joint colony
					$.foundColony(g,j,["Bird","Frog"],3,2);
				} else if (bdist < 30 && hab["Bird"] >= 70) {
					$.foundColony(g,j,["Bird"],3,2);
				} else if (fdist < 30 && hab["Frog"] >= 70) {
					$.foundColony(g,j,["Frog"],3,2);
				} else if (planet.mineralWealth > 0.6) {
					if (bdist < hdist && fdist < hdist) {
						// joint mining
						if (hab["Bird"] >= 10 || hab["Frog"] >= 10) {
							$.foundColony(g,j,["Bird","Frog"],2,1);
						} else {
							$.foundColony(g,j,["Bird","Frog"],1,1);
						}
					} else if (bdist < fdist) {
						if (hab["Bird"] >= 10) {
							$.foundColony(g,j,["Bird"],2,1);
						} else {
							$.foundColony(g,j,["Bird"],1,1);
						}
					} else {
						if (hab["Frog"] >= 10) {
							$.foundColony(g,j,["Frog"],2,1);
						} else {
							$.foundColony(g,j,["Frog"],1,1);
						}
					}
				}
			}
		}
	}

}());

random.setStart(150100); // the above is currently deterministic

/* Stage 3: second-wave colonisation */

(function() {
	var nativeSpecies = [["Lizard"],["Human"],[],["Rodent"],["Feline"],["Frog","Bird"],["Lobster"],["Insect"]];
	
	for (i=0;i<$.galaxies;i++) {
		if (i==2) { continue; } // G3 still uninhabited
		for (j=0;j<$.systems;j++) {
			var colony = $.get(i,j,"colony");
			var hab = $.get(i,j,"habitability");
			var planet = $.get(i,j,"planet");
			// upgrade existing colonies first
			if (colony.homeWorld) {
				$.advanceColonyTech(i,j,2);
			} else if (colony.stage > 0) {
				if (random.randf() < 0.75) {
					$.advanceColonyStage(i,j);
				} else if (random.randf() < 0.05) {
					$.reduceColonyStage(i,j);
				} 
				$.advanceColonyTech(i,j,random.rand(4));
			} else {
				// add new colonies
				for (k=0;k<nativeSpecies[i].length;k++) {
					if (hab[nativeSpecies[i][k]] >= 90) {
						$.foundColony(i,j,[nativeSpecies[i][k]],2,3);
					} 
				}
				// add new mining operations
				if (planet.mineralWealth >= 0.6 && colony.stage == 0) {
					$.foundColony(i,j,nativeSpecies[i],1,1);
				}
				// add outposts near homeworlds
				if (colony.stage == 0) {
					for (var keyw in keyWorlds) {
						var w = keyWorlds[keyw];
						if (w[0] == i && $.distance(i,j,w[1]) <= 15) {
							$.foundColony(i,j,nativeSpecies[i],1,1);
							break;
						}
					}
				}
			}
		}
		

	}

}());

random.setStart(155000); // at most 3 rolls per system, generally far less


/* Stage 4: initial inter-galactic colonisation, united systems treaties 

New colonies get TL = stage + 3, add 2+d3 but no more than stage to TL of existing colonies, 3 to homeworlds. Human homeworlds increase to max stage for their habitability.
50% chance each colony increases by one stage if possible. 15% chance it decreases by one stage if not already an outpost.
The system with the highest minimum habitability for all species (hopefully >60%) in chart 3 becomes the United Capital. This starts as a stage 4 colony of all species and counts as a Homeworld for future calculations. 
The non-homeworld system with the highest minimum habitability in other charts becomes the United Embassy for that chart (stage 3 colony of all species, counts as an independent hub for future calculations), will take over inhabited systems (going to stage 4 if it was already stage 2 or 3)
The best uninhabited system for each species in chart 3 gets a stage 3 colony of that species (start with Humans, and cycle backwards to Rodents)
Any uninhabited or outpost system with >90% habitability in any chart gets a stage 1 colony of the most suited species. (again, cycle backwards so nearest species gets first go)
*/
(function() {
	var hab, colony, planet;
	// upgrade existing colonies first
	for( i=0;i<$.galaxies;i++) {
		if (i==2) { continue; } // G3 still uninhabited
		for (j=0;j<$.systems;j++) {
			colony = $.get(i,j,"colony");
			hab = $.get(i,j,"habitability");
			planet = $.get(i,j,"planet");
			// upgrade existing colonies first
			if (colony.homeWorld) {
				if (colony.stage != 6) { // Human
					for (k=colony.stage;k<6;k++) {
						$.advanceColonyStage(i,j);
					}
				}
				$.advanceColonyTech(i,j,3);
			} else if (colony.stage > 0) {
				if (random.randf() < 0.5) {
					$.advanceColonyStage(i,j);
				} else if (random.randf() < 0.15) {
					$.reduceColonyStage(i,j);
				} 
				var upg = 2+random.rand(3);
				if (upg < colony.stage) {
					upg = colony.stage
				}
				$.advanceColonyTech(i,j,upg);
			}
		}
	}
	// populate galaxy 3 (United Capital, initial colonies)
	var bestworst = 0; var founduc = -1;
	for (j=0;j<$.systems;j++) {
		hab = $.get(2,j,"habitability");
		if (hab.worst > bestworst) {
			bestworst = hab.worst;
			founduc = j;
		}
	}
	console.error("United Capital is 2 "+founduc);
	$.foundColony(2,founduc,species.list(),5,7);
	$.set(2,founduc,"name","United Capital");
	colony = $.get(2,founduc,"colony");
	colony.homeWorld = 1; // close enough
	keyWorlds["Capital"] = [2,founduc];

	var order = species.getNearestOrder(2);
	for (k=0;k<order.length;k++) {
		var bestempty = -1;
		var bestspec = 0;
		var spec = order[k];
		// find best uninhabited system in G3
		for (j=0;j<$.systems;j++) {
			hab = $.get(2,j,"habitability");
			colony = $.get(2,j,"colony");
			if (colony.stage == 0 && hab[spec] > bestspec) {
				bestspec = hab[spec];
				bestempty = j;
			}
		}
		// stage 3 colony
		$.foundColony(2,bestempty,[spec],4,6);
	}

	for (i=0;i<$.galaxies;i++) {
		// populate united embassy colonies
		if (i != 2) {
			// none in G3
			bestworst = 0; founduc = -1;
			for (j=0;j<$.systems;j++) {
				hab = $.get(i,j,"habitability");
				colony = $.get(i,j,"colony");
				if (colony.homeWorld == 0 && hab.worst > bestworst) {
					bestworst = hab.worst;
					founduc = j;
				}
			}
			// stage 3 embassy
			colony = $.get(i,founduc,"colony");
			if (colony.stage <= 2) {
				$.foundColony(i,founduc,species.list(),4,6);
			} else {
				// if taking over somewhere established, boost to stage 4
				$.foundColony(i,founduc,species.list(),5,7);
			}
			colony.independentHub = 1;
			$.set(i,founduc,"name","United Embassy "+(i+1));
			console.error("United Embassy at "+i+" "+founduc);
		}
		
		// populate super-habitable
		order = species.getNearestOrder(i);
		for (k=0;k<order.length;k++) {		
			var spec = order[k];
			for (j=0;j<$.systems;j++) {
				hab = $.get(i,j,"habitability");
				colony = $.get(i,j,"colony");
				if (hab[spec] >= 90 && colony.stage <= 1) {
					$.foundColony(i,j,[spec],2,4);
				}
			}
		}
	}

}());






$.$debug = 1;
console.log("{");
for (i=0;i<$.galaxies;i++) {
	for (j=0;j<$.systems;j++) {
		if (!$.get(i,j,"name")) {
			var colony = $.get(i,j,"colony");
			if (colony.stage > 1) {
				$.set(i,j,"name","C"+(colony.stage-1)+" "+i+"-"+j);
			} else if (colony.stage == 1) {
				$.set(i,j,"name","O "+i+"-"+j);
			} else {
				$.set(i,j,"name","S "+i+"-"+j);
			}
		}
		$.dump(i,j);
	}
}
console.log("}");
