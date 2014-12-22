#!/usr/local/bin/node
"use strict";

var namegen = require("./namegen");
var descgen = require("./descgen");
var random = require("./random");
var species = require("./species");
var $ = require("./planetinfo");
var fs = require("fs");

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
			$.set(i,j,"history",[]);
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
				basecolour = [0.6,0.85,0.95];
				star.sequence = "Class A";
				star.brightness = 20 + random.rand(60);
				break;
			case 2:	case 3: case 4:
				// "white";
				sradfactor = 1.25;
				shabfactor = 1.4;
				minfactor = 0.6;
				basecolour = [0.9,0.9,0.9];
				star.sequence = "Class F";
				star.brightness = 2.5 + random.randf()*3.5;
				break;
			case 5: case 6: case 7: case 8: case 9:
				// "yellow"; 
				sradfactor = 1;
				shabfactor = 1;
				minfactor = 0.5;
				basecolour = [0.9,0.9,0.4];
				star.sequence = "Class G";
				star.brightness = 0.75 + random.randf()*0.5;
				break;
			case 10: case 11: case 12:
				// "orange";
				sradfactor = 0.8;
				shabfactor = 0.7;
				minfactor = 0.4;
				basecolour = [0.9,0.8,0.3];
				star.sequence = "Class K";
				star.brightness = 0.15 + random.randf()*0.25;
				break;
			case 13: case 14:
				// "red";
				sradfactor = 0.6;
				shabfactor = 0.5; 
				minfactor = 0.3;
				basecolour = [0.95,0.65,0.6];
				star.sequence = "Class M";
				star.brightness = 0.05 + random.randf()*0.1;
				break;
			case 15:
				// "giant"; 
				sradfactor = 10;
				// should be closer to 50, but past ~2.7E9 Oolite
				// stops being able to display things properly
				shabfactor = 10;
				minfactor = 0.1; 
				basecolour = [0.95,0.25,0.25];
				star.sequence = "Red giant";
				star.brightness = 100 + random.rand(600);
				break;
			default: // 16-19
				// "dwarf";
				star.sequence = "Class M dwarf";
				star.brightness = 0.001 + random.randf()*0.009;
				sradfactor = 0.3;
				shabfactor = 0.4;
				minfactor = 0.2;  
				basecolour = [0.95,0.45,0.4];
			}

			star.radius = Math.floor(800000 * (0.9+(0.2*random.randf())) * sradfactor);
			/* Mostly <0.3, a few in 0.4..0.6, extremely rare 0.6..0.9 */
			star.instability = (random.randf() * random.randf() * random.randf());
			if (star.sequence == "Class M dwarf") {
				star.instability /= 10;
			}
			star.coronaFlare = 0.05+((star.instability / 4) + (random.randf()/20));
			if (star.sequence == "Red giant") {
				star.coronaFlare += 0.7;
				star.instability += 0.2;
			}
			star.coronaShimmer = (star.instability / 3);
			star.coronaHues = (star.instability / 1.5);
			star.habitableZoneFactor = shabfactor;
			star.mineralFactor = minfactor;
			star.constellation = "";
			star.name = "";

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

// 19 rands per system so far
(function () {
	var au = 7.5E7;
	for (i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			var star = $.get(i,j,"star");

			var planet = {};

			planet.habZoneRange = 0.5+random.randf();
			planet.orbitalRadius = Math.floor(star.habitableZoneFactor * planet.habZoneRange * au);
			planet.orbitalRadiusAU = (star.habitableZoneFactor * planet.habZoneRange).toFixed(2);
			var mw1 = random.randf(); var mw2 = random.randf();
			// pick the one closer to the minfactor
			planet.mineralWealth = ((Math.abs(mw1-star.mineralFactor) < Math.abs(mw2-star.mineralFactor))?mw1:mw2) * random.randf();
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
			var rad = (10*(1-pcloud)*(2.4-calpha)*(1.5-planet.habZoneRange)*star.instability);
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
			contesting: [],
			independentHub: 0,
			embassy: 0,
			attacked: 0,
			destroyed: 0,
			militaryBase: 0,
			outsiders: 0,
			reason: ""
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
				// habitable with terraforming
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
				// just out of reach of terraforming
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
var homeWorlds = [[],[],[],[],[],[],[],[]];

(function() {
	$.$historyStep = 1;
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
		cinfo.stage = 7; // stage 6
		cinfo.homeWorld = 1;
		cinfo.founded = 1;
		cinfo.techLevel = 5;
		cinfo.species.push(s);
		$.set(g,best,"name",s+" Homeworld"); // temp
		$.set(g,best,"colony",cinfo);
		keyWorlds[s] = [g,best];
		homeWorlds[g].push(best);
		species.setHomeworld(s,g,best);
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
				if (planet.mineralWealth < 0.4 && hab.best < 80) {
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
		if (hab.Human < 80) { continue; }
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
	cinfo.founded = 1;
	$.set(1,foundReach,"colony",cinfo);
	$.set(1,foundReach,"name","Biya's Reach");
	keyWorlds["Reach"] = [1,foundReach];

	cinfo = $.get(1,foundHope,"colony");
	cinfo.stage = 3;
	cinfo.species.push("Human");
	cinfo.homeWorld = 1;
	cinfo.techLevel = 4;
	cinfo.founded = 1;
	$.set(1,foundHope,"colony",cinfo);
	$.set(1,foundHope,"name","Dramani's Hope");
	species.setHomeworld("Human",1,foundHope);
	keyWorlds["Hope"] = [1,foundHope];

	cinfo = $.get(1,foundLanding,"colony");
	cinfo.stage = 2;
	cinfo.species.push("Human");
	cinfo.homeWorld = 1;
	cinfo.techLevel = 3;
	cinfo.founded = 1;
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
	$.$historyStep = 2;
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
					// at this stage, don't even have basic terraforming
					// tech to make 70-80 worlds habitable.
					// and supply lines are often too limited for the 80-90
					// range
					if (hab[s] >= 80+random.rand(20)) {
						$.foundColony(g,j,[s],3,2);
						colony.reason = "Habitability";
						// 0.55 higher than normal
						// mining technology less advanced
					} else if (planet.mineralWealth > 0.55) {
						if (hab[s] >= 10) {
							$.foundColony(g,j,[s],2,1);
						} else {
							$.foundColony(g,j,[s],1,1);
						}
						colony.reason = "Mining";
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
				if (hab["Bird"] >= 85 && hab["Frog"] >= 85) {
					// joint colony
					$.foundColony(g,j,["Bird","Frog"],3,2);
					colony.reason = "Joint Habitability";
				} else if (bdist < 30 && hab["Bird"] >= 80+random.rand(20)) {
					$.foundColony(g,j,["Bird"],3,2);
					colony.reason = "Habitability";
				} else if (fdist < 30 && hab["Frog"] >= 80+random.rand(20)) {
					$.foundColony(g,j,["Frog"],3,2);
					colony.reason = "Habitability";
					// 0.55 higher than normal
					// mining technology less advanced
				} else if (planet.mineralWealth > 0.55) {
					if (bdist < hdist && fdist < hdist) {
						// joint mining
						if (hab["Bird"] >= 10 || hab["Frog"] >= 10) {
							$.foundColony(g,j,["Bird","Frog"],2,1);
						} else {
							$.foundColony(g,j,["Frog","Bird"],1,1);
						}
						colony.reason = "Joint Mining";
					} else if (bdist < fdist) {
						if (hab["Bird"] >= 10) {
							$.foundColony(g,j,["Bird"],2,1);
						} else {
							$.foundColony(g,j,["Bird"],1,1);
						}
						colony.reason = "Mining";
					} else {
						if (hab["Frog"] >= 10) {
							$.foundColony(g,j,["Frog"],2,1);
						} else {
							$.foundColony(g,j,["Frog"],1,1);
						}
						colony.reason = "Mining";
					}
				}
			}
		}
	}

}());

random.setStart(150100); // the above is currently deterministic

/* Stage 3: second-wave colonisation */

(function() {
	$.$historyStep = 3;
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
				if (random.randf() < 0.75/colony.stage) {
					$.advanceColonyStage(i,j);
				} else if (random.randf() < 0.2) { // 5% / 75%
					$.reduceColonyStage(i,j);
				} 
				$.advanceColonyTech(i,j,random.rand(4));
			} else {
				// add new colonies
				// with whole galaxy to choose from, pick the best
				for (k=0;k<nativeSpecies[i].length;k++) {
					if (hab[nativeSpecies[i][k]] >= 95 && random.randf() < 0.3) {
						$.foundColony(i,j,[nativeSpecies[i][k]],2,3);
						colony.reason = "Habitability";
					} 
				}
				// add new mining operations
				if (planet.mineralWealth >= 0.45 && colony.stage == 0 && random.randf() < 0.25) {
					$.foundColony(i,j,[nativeSpecies[i][random.rand(nativeSpecies[i].length)]],1,1);
					colony.reason = "Mining";
				}
				// add outposts near homeworlds
				if (colony.stage == 0) {
					for (var keyw in keyWorlds) {
						var w = keyWorlds[keyw];
						var spec = keyw;
						if (i==1) {
							spec = "Human";
						}
						// nearby
						if (w[0] == i && $.distance(i,j,w[1]) <= 15) {
							// and at least somewhat interesting
							if (hab[spec] > 70 || planet.mineralWealth > 0.25) {
								$.foundColony(i,j,[spec],1,1);
								colony.reason = "Waystation";
								break;
							}
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
	$.$historyStep = 4;
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
				if (colony.stage != 7) { // Human
					for (k=colony.stage;k<6;k++) {
						$.advanceColonyStage(i,j);
					}
				}
				$.advanceColonyTech(i,j,2);
			} else if (colony.stage > 0) {
				if (random.randf() < 0.5/colony.stage) {
					$.advanceColonyStage(i,j);
				} else if (random.randf() < 0.3) { // 15% / 50%
					$.reduceColonyStage(i,j);
				} 
				var upg = 2+random.rand(3);
				if (upg > colony.stage) {
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
	colony.reason = "United Capital";
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
		colony = $.get(2,bestempty,"colony");
		colony.reason = "Best G3";
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
			// stage 3 embassy colony
			colony = $.get(i,founduc,"colony");
			if (colony.stage <= 2) {
				$.foundColony(i,founduc,species.list(),4,6);
			} else {
				// if taking over somewhere established, boost to stage 4
				$.foundColony(i,founduc,species.list(),5,7);
			}
			colony.independentHub = 1;
			colony.embassy = 1;
			if (!colony.reason) { colony.reason = "Embassy"; }
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
				if (hab[spec] >= 95 && colony.stage <= 1 && random.randf() < 0.4 && !species.isNative(i,spec) && colony.species.indexOf(spec) == -1) {
					if (colony.stage == 1) {
						console.error(spec+" joining outpost at "+i+" "+j);
					}

					$.foundColony(i,j,[spec],2,4);
				}
				if (!colony.reason) { colony.reason = "Galdrive Habitable"; }
			}
		}
	}

}());

/* Stage 5, 6, 7: cooperative colonisation [may need to adjust number of passes]
New colonies get TL = stage + 3, add 1 to TL of existing stage 2+ colonies (50% chance) and homeworlds (75% chance)
50% chance each colony increases by one stage if possible, 15% chance it decreases by one stage if not already an outpost
Any system that is no more than a stage 2 colony, with >70% habitability for a species not currently on it has a 20% chance of gaining that species (increasing a stage if possible). Uninhabited and outpost systems both go to stage 1 colonies.
Any system with high mineral wealth, still at outpost stage, has a 10% chance of being inhabited by an extra species and increasing to stage 1
*/

for (var cocostage = 5; cocostage <= 7; cocostage++) {
	$.$historyStep = cocostage;
	var speclist = species.list();

	var hab270 = function(hab) {
		var ct = 0;
		for (var s=0;s<speclist.length;s++) {
			if (hab[speclist[s]]>=70) {
				ct++;
			}
		}
		return (ct>1);
	}
	// 10000 per pass seems to be plenty
	random.setStart(110000 + (10000*cocostage));
	(function() {
		var hab, colony, planet;
		for( i=0;i<$.galaxies;i++) {
			for (j=0;j<$.systems;j++) {
				colony = $.get(i,j,"colony");
				// upgrade colonies
				if (colony.stage > 0) {
					if (!colony.homeWorld) {
						if (random.randf() < 0.5/colony.stage) {
							$.advanceColonyStage(i,j);
						} else if (random.randf() < 0.3) { // 15% / 50%
							$.reduceColonyStage(i,j);
						}
					}
					if (colony.stage >= 3) {
						if (random.randf() < colony.homeWorld ? 0.25 : 0.5) {
							$.advanceColonyTech(i,j,1);
						}
					}
				}
				// extra colonists settle
				if (colony.stage <= 3) {
					hab = $.get(i,j,"habitability");
					if (colony.stage > 0) {
						for (k=0;k<speclist.length;k++) {
							/* Now have tech to make 70-80 worlds
							 * habitable. Not true terraforming, more
							 * improved habitat design and shielding */
							if (colony.species.indexOf(speclist[k]) == -1 && 
								((hab[speclist[k]] >= 70 && random.randf() < 0.2))) {
								colony.species.push(speclist[k]);
								$.addHistoryItem(i,j,{type:"joined", species:speclist[k]});
								if (colony.stage <= 4) {
									// extra species won't increase above stage 3 colony
									$.advanceColonyStage(i,j);
								}
								$.advanceColonyTech(i,j,1);
							}
						}
					} else if (random.randf() < $.proximityFactor(i,j,0.08) && hab270(hab)) {
						var specs = [];
						do {
							for (k=0;k<speclist.length;k++) {
								if (specs.indexOf(speclist[k]) == -1 && hab[speclist[k]] >= 70+random.rand(20)) {
									specs.push(speclist[k]);
								}
							}
						} while (specs.length < 2);

						$.foundColony(i,j,specs,2,4);
						colony.reason = "Joint Colony";
					}

				}
				planet = $.get(i,j,"planet");
				// expand mining outposts collaboratively
				if (planet.mineralWealth >= 0.45 && colony.stage == 1) {
					k = random.rand(speclist.length);
					if (colony.species.indexOf(speclist[k]) == -1) {
						colony.species.push(speclist[k]);
						$.addHistoryItem(i,j,{type:"joined", species:speclist[k]});
						$.advanceColonyStage(i,j);
						$.advanceColonyTech(i,j,1);
					}
				}
				// outsider settlements - low tech outposts
				if (colony.stage == 0 && random.randf() < 0.01) {
					$.foundColony(i,j,[speclist[random.rand(speclist.length)]],1,1);
					colony.outsiders = 1;
					colony.reason = "Outsiders";
				}
			}
		}
	}());
}

random.setStart(190000);

/*
Stage 8: terraforming
New colonies get TL = stage + 4, add 1 to TL of existing systems (stage/6 chance)
50% chance each colony increases by one stage if possible, 15% chance it decreases by one stage if not already an outpost
Any system with no non-outpost population and 60% habitability gets a terraformed stage 2 colony of all species it is at >60%
All remaining systems with high or medium mineral wealth get a stage 1 colony
*/

(function() {
	$.$historyStep = 8;
	var hab, colony, planet;
	var speclist = species.list();
	var tmp1 = 0, tmp2 = 0, tmp3 = 0, tmp4 = 0, tmp5 = 0;
	for(i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			// upgrade colonies
			colony = $.get(i,j,"colony");
			hab = $.get(i,j,"habitability");
			planet = $.get(i,j,"planet");
			if (colony.stage > 0) {
				if (!colony.homeWorld) {
					if (random.randf() < 0.5/colony.stage) {
						$.advanceColonyStage(i,j,true);
					} else if (random.randf() < 0.3) { // 15% / 50%
						$.reduceColonyStage(i,j);
					}
					if (random.randf() < (colony.stage-1) / 6) {
						$.advanceColonyTech(i,j,1);
					}
				} else {
					if (colony.stage != 7) { // Human, now can terraform
						for (k=colony.stage;k<6;k++) {
							$.advanceColonyStage(i,j,true);
						}
					}
				}
			}
			if (colony.stage <= 1) {
				// search for terraforming candidates
				if (hab.best >= 60 && hab.worst < 70 && random.randf() < $.proximityFactor(i,j,0.01)) {
					var terrlist = [];
					for (k=0;k<speclist.length;k++) {
						if (hab[speclist[k]] >= 60 && random.randf() < 0.5 && colony.species.indexOf(speclist[k]) == -1) {
							terrlist.push(speclist[k]);
						}
					}
					if (terrlist.length > 0) {
						if (colony.stage > 0) {
							$.addHistoryItem(i,j,{type:"joined", species:terrlist[0]});
							tmp4++;
						} else {
							colony.reason = "Terraforming";
						}

						$.foundColony(i,j,terrlist,3,6,true);
					}
					tmp1++;
					// search for unclaimed mining opportunities
				} else if (planet.mineralWealth > 0.45 && 0.25+random.randf() < planet.mineralWealth + $.proximityFactor(i,j,0.01)) {
					var spec = speclist[random.rand(speclist.length)];
					if (colony.species.indexOf(spec) == -1) {
						if (colony.stage > 0) {
							$.addHistoryItem(i,j,{type:"joined", species:spec});
							tmp5++;
						} else {
							colony.reason = "Mining";
						}
						if (hab.worst >= 10) {
							$.foundColony(i,j,[spec],2,5);
						} else {
							$.foundColony(i,j,[spec],1,4);
						}
					}
					tmp2++;
				} 
			}
			// outsider settlements - low tech outposts
			if (colony.stage == 0 && random.randf() < 0.01) {
				$.foundColony(i,j,[speclist[random.rand(speclist.length)]],1,1);
				colony.outsiders = 1;
				colony.reason = "Outsiders";
				tmp3++;
			}

		}
	}
	console.error("Terraforming stage: "+tmp1+" terraformed ("+tmp4+" had outpost), "+tmp2+" mining ("+tmp5+" had outpost), "+tmp3+" outsider");
}());

random.setStart(200000);

/*Stage 9: consolidation
50% chance each colony increases by one stage if possible, 15% chance it decreases by one stage if not already an outpost
Add 1 to TL of existing systems (stage/6 chance) */
(function() {
	$.$historyStep = 9;
	var colony;
	var speclist = species.list();

	for(i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			// upgrade colonies
			colony = $.get(i,j,"colony");
			if (colony.stage > 0) {
				if (!colony.homeWorld) {
					// this one not /colony.stage
					// consolidation allows higher population growth
					if (random.randf() < 0.8) {
						$.advanceColonyStage(i,j,true);
					} else if (random.randf() < 0.3) { // 15% / 50%
						$.reduceColonyStage(i,j);
					}
					if (random.randf() < (colony.stage-1) / 6) {
						$.advanceColonyTech(i,j,1);
					}
				} else {
					if (random.randf() < 0.5) {
						$.advanceColonyTech(i,j,1);
					}
				}
				// still occasional outsider settlements
			} else if (random.randf() < 0.01) {
				$.foundColony(i,j,[speclist[random.rand(speclist.length)]],1,1);
				colony.outsiders = 1;
			}
		}
	}
}());

random.setStart(210000);

/* Stage 10: first invasion wave
20% chance each colony increases by one stage and gets +1 TL; 20% chance it decreases by one stage and gets -d6 TL; 5% chance it is knocked back to outpost (and TL set to d4); 1% chance it is knocked back to uninhabited. Homeworlds are unaffected. 
Non-homeworld systems at the colony stage cap have a 5% chance of gaining d4 TL and a military base. */

(function() {
	$.$historyStep = 10;
	var colony;
	var speclist = species.list();

	for(i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			// colonies under attack
			colony = $.get(i,j,"colony");
			if (colony.homeWorld == 0 && colony.stage > 0) {
				var choice = random.rand(100);
				if (choice < 20/colony.stage) {
					$.advanceColonyStage(i,j,true);
					$.advanceColonyTech(i,j,1);
				} else if (choice < 20 || colony.stage == 7) {
					// nothing
				} else if (choice < 40) {
					$.raidColony(i,j,1+random.rand(6)); // 20% of raid
				} else if (choice < 45) {
					$.assaultColony(i,j,1+random.rand(4)); // 5% chance of assault - planet is depopulated, some orbital infrastructure remains or rebuilt
				} else if (choice == 45) {
					$.destroyColony(i,j); // 1% chance of total destruction
				}
				
				if ($.colonyAtMaxSize(i,j,true)) {
					if (random.randf() < 0.05 && !colony.embassy) {
						colony.militaryBase = 1;
						$.advanceColonyTech(i,j,1+random.rand(4));
					}
				}
			} else if (colony.stage == 0 && random.randf() < 0.01) {
				// refugees
				$.foundColony(i,j,[speclist[random.rand(speclist.length)]],1,1);
				colony.outsiders = 1;
			}

		}
	}
}());

random.setStart(220000);

// now at present day

/* Stage 11: set economies */
(function() {
	$.$historyStep = 11;
	var colony;
	for(i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			colony = $.get(i,j,"colony");
			// need to set colony population, which is finalised at this point
			// before economic steps
			var prand = (random.rand(90)+10)/10;
			var pop, pdesc;
			switch (colony.stage) {
			case 0:
				pop = 1E3 * prand; 
				pdesc = "No official population";
				break;
			case 1:
				pop = 1E4 * prand; 
				pdesc = (prand*10).toFixed(0)+" thousand";
				break;
			case 2:
				pop = 1E5 * prand; 
				pdesc = (prand*100).toFixed(0)+" thousand";
				break;
			case 3:
				pop = 1E6 * prand; 
				pdesc = (prand).toFixed(1)+" million";
				break;
			case 4:
				pop = 1E7 * prand; 
				pdesc = (prand*10).toFixed(0)+" million";
				break;
			case 5:
				pop = 1E8 * prand; 
				pdesc = (prand*100).toFixed(0)+" million";
				break;
			case 6:
			case 7:
				// a stage 6 colony is just a stage 5 with more influence
				pop = 1E9 * prand; 
				pdesc = (prand).toFixed(1)+" billion";
				break;
			}
			colony.population = pop;
			colony.populationDescription = pdesc;
			
			$.economyType(i,j,random.rand(6),random.randf(),random);

		}
	}
}());

random.setStart(230000);

/* Stage 12 */
/*
Grant the following influence points +d3 to each system on the chart: United Capital 25, Homeworld 12, Stage 6 colony 6, Stage 5 colony 3, Military colony +3 (or 3 if on <= Stage 4 colony), all others including military outposts none.
In the order Homeworld, Stage 5, any Mil, Stage 4, which is not already in a named region do the following:
Generate a region ID (Colonials do Dramani's Hope first but influence extended from both counts as the same region)
For each inhabited system next to the region, do the following until out of influence. If the cost cannot be paid, remove the system from the adjacency list and try again. If the adjacency list is empty, stop even if influence remains. Prioritise systems next to the homeworld:
If the system is already in a region and not influential, spend its colony stage in influence if possible to mark it as contested between the two. If the system is influential or insufficient influence is available, ignore it. If the system is a cross bottleneck, it can be set to contested for one influence regardless of stage.
If the system is already contested by two other parties, spend one influence and change its status to “independent hub system”
If the system is already an independent hub system, spend one influence if possible.
If the system being included is itself influential, add half its influence value to the region owner, and include it.
If the system being included is within 3.5 LY and at least stage two, keep influence the same, and include it
If the system has a Quarantine or Survival economy, include it at no cost, but do not add its adjacent systems to the adjacency list.
If the system is at least stage one, lose one influence point and include it
If the system is an outpost, lose two influence points and include it
If the system is a line bottleneck, do not add the system on the other end to the adjacent list
If the system is a cross bottleneck, spend two additional influence if possible (else spend all possible) and do not add the systems on the other side to the adjacent list
*/

var maxRegionID = 0;
var unitedRegionID = 0;

(function() {
	var colony, politics, tcolony, tpolitics, teconomy, considered, influencer;
	var regionID = 1;

	var $ignoreSystem = function(adjacents,idx) {
		considered.push(adjacents[idx]);
		adjacents.splice(idx,1);
	};

	var $includeSystem = function(adjacents,idx,influence,needs,includer,extend) {
		if (needs > influence) {
			// can't do this one
			$ignoreSystem(adjacents,idx);
			return influence;
		}
		includer();
		if (extend) {
			var maxdist = 7+$.get(i,considered[0],"politics").regionInfluence;
			var tadjacents = $.get(i,adjacents[idx],"connectedSystems");
			for (j=0;j<tadjacents.length;j++) {
				if (adjacents.indexOf(tadjacents[j]) == -1 && considered.indexOf(tadjacents[j]) == -1 && $.get(i,tadjacents[j],"colony").stage > 0) {
					// if not already on the adjacency list and not
					// already considered and not uninhabited
					if ($.distance(i,tadjacents[j],considered[0]) < maxdist) {
						adjacents.push(tadjacents[j]);
					}
				}
			}
		}
		$ignoreSystem(adjacents,idx); // mark as considered
		return influence-needs;
	};

	var $contestSystem = function() {
		// remove from previous region, mark as contested
		if (tcolony.contested == 0 && tcolony.independentHub == 0) {
			tcolony.contested = 1;
			tcolony.contesting = [tpolitics.region,regionID];
			tpolitics.region = 0;
			tpolitics.regionName = "Contested System";
		} else {
			// or independent hub, if already contested
			tcolony.contested = 0;
			tcolony.contesting.push(regionID);
			tcolony.independentHub = 1;
			tpolitics.region = 0;
			tpolitics.regionName = "Independent Hub";
			
			// massive boost to trading income!
			teconomy.productivity += 100000;
			teconomy.productivity *= 5+(random.randf()*10);
			teconomy.productivity = Math.floor(teconomy.productivity);
		}
	};

	var $joinSystem = function() {
		tpolitics.region = regionID;
//		tpolitics.regionName = "Region "+regionID; //tmp
	}

	for (var i=0;i<$.galaxies;i++) {
		var influencers = [[],[],[],[],[]];
		// find influential systems
		for (var j=0;j<$.systems;j++) {
			colony = $.get(i,j,"colony");
			politics = {
				region: 0,
				regionName: "Chart "+i,
				regionInfluence: 0,
				governmentCategory: "",
				governmentType: "",
				regionAccession: 0,
				stability: 0
			};
			if (colony.homeWorld) {
				if (i==2) {
					politics.regionInfluence = 25; // united capital
					unitedRegionID = regionID;
				} else {
					politics.regionInfluence = 12;
				}
			} else if (colony.stage == 7 && !colony.embassy) {
				politics.regionInfluence = 9;
			} else if (colony.stage == 6 && !colony.embassy) {
				politics.regionInfluence = 6;
			} else if (colony.stage == 5 && !colony.embassy) {
				politics.regionInfluence = 4;
			}
			if (colony.militaryBase == 1) {
				politics.regionInfluence += 3;
			}
			if (politics.regionInfluence > 0) {
				if (colony.homeWorld) {
					influencers[0].push(j);
				} else if (colony.stage == 7) {
					influencers[1].push(j);
				} else if (colony.stage == 6) {
					influencers[2].push(j);
				} else if (colony.militaryBase == 1) {
					influencers[3].push(j);
				} else {
					influencers[4].push(j);
				}
			}
			$.set(i,j,"politics",politics);
		}
		console.error("Influencers for "+i+" are "+influencers[0]+"/"+influencers[1]+"/"+influencers[2]+"/"+influencers[3]+"/"+influencers[4]);
		// create regions based on influencers
		for (k=0;k<influencers.length;k++) {
			// go through influencers of each type in order of type
			while ((influencer = influencers[k].shift()) !== undefined) {
				var adjacents = $.get(i,influencer,"connectedSystems").map(function(x) { return x; });
				considered = [influencer];
				politics = $.get(i,influencer,"politics");
				if (politics.region > 0) {
					// do nothing 
				} else {
//					console.error("Starting region "+regionID+" with "+influencer);
					var contestchance = 1;
					var regionInfo = {
						id: regionID,
						galaxy: i,
						influential: [influencer],
						members: [], // gets filled in later
						category: "",
						subCategory: "",
						name: ""
//						name: "Region "+regionID // overwritten later
					}
					// core human worlds are all part of the same region
					// so join them in now for free
					var influenceLevel = politics.regionInfluence;
					politics.region = regionID;
//					politics.regionName = "Capital of region "+regionID; // tmp

					if (i==1) {
						if (influencer == keyWorlds["Hope"][1]) {
							console.error("Including Landing in Hope");
							adjacents.unshift(keyWorlds["Landing"][1]);
							tpolitics = $.get(i,keyWorlds["Landing"][1],"politics");
							regionInfo.influential.push(keyWorlds["Landing"][1]);
							$includeSystem(adjacents,0,2,1,$joinSystem,true);
							adjacents.unshift(keyWorlds["Reach"][1]);
							tpolitics = $.get(i,keyWorlds["Reach"][1],"politics");
							$includeSystem(adjacents,0,2,1,$joinSystem,true);
						} else if (influencer == keyWorlds["Landing"][1]) {
							console.error("Including Hope in Landing");
							adjacents.unshift(keyWorlds["Hope"][1]);
							tpolitics = $.get(i,keyWorlds["Hope"][1],"politics");
							$includeSystem(adjacents,0,2,1,$joinSystem,true);
							adjacents.unshift(keyWorlds["Reach"][1]);
							tpolitics = $.get(i,keyWorlds["Landing"][1],"politics");
							$includeSystem(adjacents,0,2,1,$joinSystem,true);
						}
					}

					while (adjacents.length > 0) {
						// start with nearest to stop regions becoming lines
						adjacents.sort(function(a,b) {
							var ad = $.distance(i,influencer,a);
							var bd = $.distance(i,influencer,b);
							return ad-bd;
						});
						var tryidx = random.rand(Math.min(adjacents.length,3));
						var trysys = adjacents[tryidx];
						var bottle = $.bottleneckType(i,trysys);
						var bottleCost = bottle;//==2?2:0;
						tcolony = $.get(i,trysys,"colony");
						tpolitics = $.get(i,trysys,"politics");
						teconomy = $.get(i,trysys,"economy");
						if (tcolony.embassy == 1) {
							// always ignore embassies
							$ignoreSystem(adjacents,tryidx);
						} else if (tpolitics.region > 0) {
							// systems already in regions
							if (tpolitics.regionInfluence > 0 || tpolitics.region == regionID) {
								// ignore the central systems
								// ignore if one from this region ends up listed
								$ignoreSystem(adjacents,tryidx);
							} else if (tcolony.stage > 0) {
								// only inhabited can be contested
//								if (bottle == 2) {
									// cross bottlenecks naturally end up contested
								influenceLevel = $includeSystem(adjacents,tryidx,influenceLevel,0,$contestSystem,false);
/*									contestchance++;
								} else {

									influenceLevel = $includeSystem(adjacents,tryidx,influenceLevel,0,$contestSystem,false);
									contestchance++;
								} else {
									// not actually contesting it
									$ignoreSystem(adjacents,tryidx);
								}*/
							} else {
								$ignoreSystem(adjacents,tryidx);
							}
						} else if (tcolony.contested == 1 || tcolony.independentHub == 1) {
							// systems which are already contested
							influenceLevel = $includeSystem(adjacents,tryidx,influenceLevel,0,$contestSystem,false);
						} else if (tpolitics.regionInfluence > 0) {
							if ($.distance(i,influencer,trysys) <= 7 || tpolitics.regionInfluence <= influenceLevel) {
								// secondary capital joins!
								influenceLevel = $includeSystem(adjacents,tryidx,influenceLevel,-Math.floor(tpolitics.regionInfluence/2),$joinSystem,true);
								// above always succeeds, so no need to check here
								regionInfo.influential.push(trysys);
//								console.error("Including influential "+trysys+" in region "+regionInfo.id);
							} else {
								// influential system resists takeover!
								$ignoreSystem(adjacents,tryidx);
//								console.error("Excluding influential "+trysys+" in region "+regionInfo.id);
							}

						} else if ($.distance(i,influencer,trysys) <= 7) {
							// nearby non-outpost systems joined free
							var cCost = (tcolony.stage != 1)?0:1;
							influenceLevel = $includeSystem(adjacents,tryidx,influenceLevel,cCost+bottleCost,$joinSystem,bottle==0);
						} else if (teconomy.type == "Quarantine" || teconomy.type == "Survival") {
							// it's officially in, but only because no-one wants it
							influenceLevel = $includeSystem(adjacents,tryidx,influenceLevel,bottleCost,$joinSystem,false);
						} else if (tcolony.stage >= 2) {
							// habited planets take some control
							influenceLevel = $includeSystem(adjacents,tryidx,influenceLevel,bottleCost+1,$joinSystem,bottle==0);
						} else if (tcolony.stage == 1) {
							// outposts take more, and are less use for transmitting control
							influenceLevel = $includeSystem(adjacents,tryidx,influenceLevel,bottleCost+2,$joinSystem,bottle==0);
						} else {
							// uninhabited system not next to start system
							// skip
//							influenceLevel = $includeSystem(adjacents,tryidx,influenceLevel,0,$joinSystem,false);
							$ignoreSystem(adjacents,tryidx);
						}
					}
					$.setRegion(regionID,regionInfo);
					maxRegionID = regionID;
					regionID++;
				}
			}
		}
	}
}());


random.setStart(240000);

// set up species government preferences
(function() {
	console.error("Setting government preferences");

	var speclist = species.list();
	for (k=0;k<speclist.length;k++) {
		var basetypes = ["Corporate","Corporate","Democratic","Democratic","Hierarchical","Hierarchical","Collective","Collective","Atypical","Corporate","Corporate","Democratic","Democratic","Hierarchical","Hierarchical","Collective","Collective"];
		for (i=0;i<10;i++) {
			// biases towards existing ones
			basetypes.push(basetypes[random.rand(basetypes.length)]);
		}

		var cortypes = ["Company Monopoly","Capitalist Plutocracy","Corporate System","Timocracy"];
		var demtypes = ["Republican Democracy","Federal Democracy","Demarchy","Direct Democracy"];
		var hietypes = ["Dictatorship","Feudal Realm","Martial Law","Family Clans"];
		var coltypes = ["Socialist","Communist","Independent Communes","Workers' Cooperative"];
		var atytypes = ["Isolationist","Anarchist","Transapientism","Social Evolutionists","Cultural Reachers","Precedentarchy","Bureaucracy","Variationist"];
		for (i=0;i<10;i++) {
			cortypes.push(cortypes[random.rand(cortypes.length)]);
			demtypes.push(demtypes[random.rand(demtypes.length)]);
			hietypes.push(hietypes[random.rand(hietypes.length)]);
			coltypes.push(coltypes[random.rand(coltypes.length)]);
			atytypes.push(atytypes[random.rand(atytypes.length)]);
		}
		var preferences = [];
		for (i=0;i<basetypes.length;i++) {
			if (basetypes[i] == "Corporate") {
				preferences = preferences.concat(cortypes);
			} else if (basetypes[i] == "Democratic") {
				preferences = preferences.concat(demtypes);
			} else if (basetypes[i] == "Hierarchical") {
				preferences = preferences.concat(hietypes);
			} else if (basetypes[i] == "Collective") {
				preferences = preferences.concat(coltypes);
			} else if (basetypes[i] == "Atypical") {
				preferences = preferences.concat(atytypes);
			}
		}
		preferences.sort();
		species.setGovernmentPreferences(speclist[k],preferences);
//		console.error(speclist[k]+" has government preferences "+species.describeGovernmentPreferences(speclist[k]));
	}

}());

random.setStart(245000);

// start applying governments to systems
(function() {
	console.error("Setting governments");

	var politics,colony,region,economy;
	console.error("...Setting regional governments");

	// regional influential governments first
	for (k=1;k<=maxRegionID;k++) {
		region = $.getRegion(k);
		for (j=0;j<region.influential.length;j++) {
			var sys = region.influential[j];
			politics = $.get(region.galaxy,sys,"politics");
			if (k==unitedRegionID) {
				politics.governmentType = "United Species Coalition";
			} else {
				colony = $.get(region.galaxy,sys,"colony");
				politics.governmentType = species.randomGovernment(colony.species[random.rand(colony.species.length)],random.randf());
				if (colony.militaryBase) {
					var makemartial = random.randf();
					if (colony.stage == 1 
						|| (colony.stage == 2 && makemartial < 0.6)
						|| (colony.stage == 3 && makemartial < 0.3)
						|| (colony.stage == 4 && makemartial < 0.1)) {
						politics.governmentType = "Martial Law";
					}
				}
			}
			politics.governmentCategory = $.governmentCategoryFromType(politics.governmentType);
			region.members.push(region.influential[j]);
		}
	}
	console.error("...Setting regional secondary governments");
	// regional non-influential systems next
	for (i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			politics = $.get(i,j,"politics");
			colony = $.get(i,j,"colony");
			if (politics.region > 0 && politics.governmentType == "") {
				region = $.getRegion(politics.region);
				region.members.push(j);
				if (region.id == unitedRegionID) {
					politics.governmentType = "United Species Coalition";
				} else {
					economy = $.get(i,j,"economy");
					if (economy.type == "Survival" || colony.stage == 0) {
						politics.governmentType = $.randomDisorderedGovernment(random.randf());
					} else if (economy.type == "Quarantine") {
						politics.governmentType = "Quarantine";
					} else if (colony.attacked == 1 && random.randf() < 0.33) {
						politics.governmentType = $.randomDisorderedGovernment(random.randf());
					} else if (economy.type.match(/^Research/) && random.randf() < 0.25) {
						politics.governmentType = "Technocracy";
					} else if (random.randf() < 0.02) {
						politics.governmentType = $.randomDisorderedGovernment(random.randf());
					} else {
						// no special case.
						var copyInf = random.randf();
						var infToCopy = $.get(i,region.influential[random.rand(region.influential.length)],"politics");
						
						if (infToCopy.governmentCategory != "Disordered" && infToCopy.governmentCategory != "Atypical" && 
							(colony.stage == 1 && copyInf < 0.5
							 || (colony.stage == 2 && copyInf < 0.7)
							 || (colony.stage == 3 && copyInf < 0.5)
							 || (colony.stage == 4 && copyInf < 0.4))) {
							// copy an influential
							politics.governmentType = infToCopy.governmentType;
						} else if (colony.outsiders == 0 || colony.founded == 10) {
							// species random
							politics.governmentType = species.randomGovernment(colony.species[random.rand(colony.species.length)],random.randf());
						} else if (colony.outsiders == 1) {
							do {
								// outsiders tend to have atypical
								politics.governmentType = species.randomGovernment(colony.species[random.rand(colony.species.length)],random.randf());
							} while ($.governmentCategoryFromType(politics.governmentType) != "Atypical");
						} else {
							// species random
							politics.governmentType = species.randomGovernment(colony.species[random.rand(colony.species.length)],random.randf());
						}
					}
				}
				politics.governmentCategory = $.governmentCategoryFromType(politics.governmentType);
			}
		}
	}
	console.error("...Setting regional types");
	// now set types of regions
	for (k=1;k<=maxRegionID;k++) {
		region = $.getRegion(k);
		if (k==unitedRegionID) {
			region.category = "United Species Coalition";
			region.name = "USC Jointly Administered Systems";
		}
		var corp = 0; var demo = 0; var coll = 0; var hier = 0; var atyp = 0; var total = 0;
		for (j=0;j<region.members.length;j++) {
			var gcat = $.get(region.galaxy,region.members[j],"politics").governmentCategory;
			if (gcat == "Corporate") {
				corp++; total++;
			} else if (gcat == "Democratic") {
				demo++; total++;
			} else if (gcat == "Hierarchical") {
				hier++; total++;
			} else if (gcat == "Collective") {
				coll++; total++;
			} else if (gcat == "Atypical") {
				atyp++; total++;
			}
		}
		var strpt = 0.8; var wkpt = 0.501; var unpt = 0.33;
		if (total > 1 && corp >= total*strpt) {
			region.category = "Strong Political Alliance";
			region.subCategory = "Corporate";
		} else if (total > 1 && demo >= total*strpt) {
			region.category = "Strong Political Alliance";
			region.subCategory = "Democratic";
		} else if (total > 1 && hier >= total*strpt) {
			region.category = "Strong Political Alliance";
			region.subCategory = "Hierarchical";
		} else if (total > 1 && coll >= total*strpt) {
			region.category = "Strong Political Alliance";
			region.subCategory = "Collective";
		} else if (total > 2 && corp >= total*wkpt) {
			region.category = "Weak Political Alliance";
			region.subCategory = "Corporate";
		} else if (total > 2 && demo >= total*wkpt) {
			region.category = "Weak Political Alliance";
			region.subCategory = "Democratic";
		} else if (total > 2 && hier >= total*wkpt) {
			region.category = "Weak Political Alliance";
			region.subCategory = "Hierarchical";
		} else if (total > 2 && coll >= total*wkpt) {
			region.category = "Weak Political Alliance";
			region.subCategory = "Collective";
		} else if (total > 3 && corp >= total*unpt && demo >= total*unpt) {
			region.category = "Politically Unstable Region";
			region.subCategory = "Corporate/Democratic";
		} else if (total > 3 && corp >= total*unpt && hier >= total*unpt) {
			region.category = "Politically Unstable Region";
			region.subCategory = "Corporate/Hierarchical";
		} else if (total > 3 && corp >= total*unpt && coll >= total*unpt) {
			region.category = "Politically Unstable Region";
			region.subCategory = "Corporate/Collective";
		} else if (total > 3 && demo >= total*unpt && hier >= total*unpt) {
			region.category = "Politically Unstable Region";
			region.subCategory = "Democratic/Hierarchical";
		} else if (total > 3 && demo >= total*unpt && coll >= total*unpt) {
			region.category = "Politically Unstable Region";
			region.subCategory = "Democratic/Collective";
		} else if (total > 3 && hier >= total*unpt && coll >= total*unpt) {
			region.category = "Politically Unstable Region";
			region.subCategory = "Hierarchical/Collective";
		} else if (random.randf() < 0.5) {
			region.category = "Economic Area";
		} else {
			region.category = "Historic Area";
		}
	}
	// decontest systems
	var regionscontesting = [];
	for (i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			colony = $.get(i,j,"colony");
			if (colony.contested == 1) {
				var rt1 = $.getRegion(colony.contesting[0]).category;
				var rt2 = $.getRegion(colony.contesting[1]).category;
				if (!rt1.match(/Political/) && !rt2.match(/Political/)) {
					colony.contesting = [];
					colony.contested = 0;
					// can only contest with political regions
					// but need to temporarily include as independent hubs
					// can be formed between three or more.
				} else if (regionscontesting.indexOf(colony.contesting[0]) > -1 && regionscontesting.indexOf(colony.contesting[1]) > -1) {
					colony.contesting = [];
					colony.contested = 0;
					// each region can only contest one system at once
					// but might end up contesting two in unusual circumstances
					// which is okay. The others drop back to uncontested.
				} else {
					// actually being contested
					regionscontesting.push(colony.contesting[0]);
					regionscontesting.push(colony.contesting[1]);
				}
			}
		}
	}

	console.error("...Setting non-regional systems");
	// now can do the non-regional systems
	for (i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			politics = $.get(i,j,"politics");
			colony = $.get(i,j,"colony");
			if (politics.region == 0) {
				economy = $.get(i,j,"economy");
				if (colony.independentHub == 1 && colony.stage > 0) {
					if ($.get(i,j,"name") && $.get(i,j,"name").match(/Embassy/)) {
						politics.governmentType = "United Species Coalition";
					} else {
						do {
							// independent hubs end up something conventional
							politics.governmentType = species.randomGovernment(colony.species[random.rand(colony.species.length)],random.randf());
						} while ($.governmentCategoryFromType(politics.governmentType) == "Atypical");
					}
				} else if (colony.attacked > 0 && random.randf() < 0.66) {
					// much greater chance of falling to disorder outside
					// of regional influence
					politics.governmentType = $.randomDisorderedGovernment(random.randf());
				} else if (economy.type == "Survival" || colony.stage == 0) {
					politics.governmentType = $.randomDisorderedGovernment(random.randf());
				} else if (colony.outsiders == 1 && colony.founded < 10) {
					do {
						// outsiders tend to have atypical
						politics.governmentType = species.randomGovernment(colony.species[random.rand(colony.species.length)],random.randf());
					} while ($.governmentCategoryFromType(politics.governmentType) != "Atypical");
				} else if (colony.contested) {
					var choice = random.randf();
					if (choice < 0.1) {
						politics.governmentType = species.randomGovernment(colony.species[random.rand(colony.species.length)],random.randf());
					} else if (choice < 0.3) {
						politics.governmentType = "Civil War";
					} else {
						var adj = $.get(i,j,"connectedSystems");
						var gcat = "";
						// select primary government of an adjacent region
						do {
							var adjid = adj[random.rand(adj.length)];
							var reg = $.get(i,adjid,"politics").region;
							if (reg > 0) {
								var regInfo = $.getRegion(reg);
								gcat = $.get(i,regInfo.influential[0],"politics").governmentCategory;
							}
						} while (gcat == "" || gcat == "United Species");
						// select random government of that region
						do {
							politics.governmentType = species.randomGovernment(colony.species[random.rand(colony.species.length)],random.randf());
						} while ($.governmentCategoryFromType(politics.governmentType) != gcat);
					}
				} else if (economy.type == "Quarantine") {
					politics.governmentType = "Quarantine";
				} else if (economy.type.match(/Research/) && random.randf() < 0.25) {
					politics.governmentType = "Technocracy";

				} else {
					adj = $.get(i,j,"connectedSystems");
					reg = $.get(i,adj[0],"politics").region;
					regInfo = $.getRegion(reg);
					var surrounded = false;
					if (reg != 0) {
						surrounded = true;
						var scount = 0;
						for (k=1;k<adj.length;k++) {
							if ($.get(i,adj[k],"politics").region != reg) {
								scount++;
								break;
							}
						}
						if (scount / adj.length > 0.25) {
							surrounded = false; // better than 1 in 4 links
						}
					}
					if (surrounded && regInfo.category.match(/Political Alliance/)) {
						choice = random.randf();
						if (choice < 0.2) {
							politics.governmentType = "Civil War";
							politics.regionAccession = 2;
							colony.contesting.push(reg);
						} else if (choice < 0.5) {
							politics.governmentType = species.randomGovernment(colony.species[random.rand(colony.species.length)],random.randf());
						} else {
							gcat = $.get(i,regInfo.influential[0],"politics").governmentCategory;
							do {
								politics.governmentType = species.randomGovernment(colony.species[random.rand(colony.species.length)],random.randf());
							} while ($.governmentCategoryFromType(politics.governmentType) != gcat);
							politics.regionAccession = 1;
							colony.contesting.push(reg);
						}						
					} else {
						if (random.randf() < 0.05) {
							politics.governmentType = $.randomDisorderedGovernment(random.randf());
						} else {
							politics.governmentType = species.randomGovernment(colony.species[random.rand(colony.species.length)],random.randf());
						}
					}
				}

				politics.governmentCategory = $.governmentCategoryFromType(politics.governmentType);
			}
		}
	}
	console.error("...Cleanup");
	// cleanup similar government types
	for (i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			politics = $.get(i,j,"politics");
			colony = $.get(i,j,"colony");
			economy = $.get(i,j,"economy");
			if (politics.governmentType == "Dictatorship" && economy.type.match(/Research/)) {
				politics.governmentType = "Technocracy";
			} else if (politics.governmentType == "Civil War" && colony.stage <= 1) {
				politics.governmentType = "None";
			} else if (politics.governmentType == "Fragmented Society" && colony.stage <= 1) {
				politics.governmentType = "None";
			} else if (politics.governmentType == "Isolationist" && economy.type == "Quarantine") {
				politics.governmentType = "Quarantine";
			} else if (politics.governmentType == "Transapientism" && (random.rand(7) < colony.stage || economy.type.match(/Research/))) {
				economy.type = "Research (Comp)";
			}
		}
	}


}());


random.setStart(260000);

// set system stability levels
(function() {
	var politics,colony,region,economy;
	console.error("Setting system stability");
	for (i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			politics = $.get(i,j,"politics");
			colony = $.get(i,j,"colony");
			economy = $.get(i,j,"economy");
			if (politics.region > 0) {
				region = $.getRegion(politics.region);
			} else {
				region = null;
			}

			if (colony.stage == 0) {
				politics.stability = 0;
			} else if (colony.homeWorld == 1 || colony.militaryBase == 1) {
				politics.stability = 7;
			} else {
				var st = colony.stage;
				st += random.rand(5)-3;
				if (colony.independentHub) { st += 2; }
				if (colony.contested) { st -= 1; }
				if (politics.region > 0) {
					if (region.category == "Strong Political Alliance") {
						st += 3;
					} else if (region.category == "Weak Political Alliance") {
						st += 1;
					} else if (region.category == "Politically Unstable Region") {
						st -= 1;
					}
				}
				if ($.colonyAtMaxSize(i,j,true)) { st += 1; }
				if (economy.type == "Colonisation") { st -= 2; }
				if (economy.type == "Research (Mil)") { st += 1; }
				if (economy.type == "Shipyard") { st += 1; }
				if (economy.type == "Tourism") { st += 1; }
				if (economy.type == "Survival") { st -= 5; }
				if (politics.governmentType == "Martial Law") { st += 2; }
				else if (politics.governmentCategory == "Hierarchical") { st += 1; }
				if (politics.governmentCategory == "Disordered") { st -= 2; }
				// next set stack with the category penalty
				if (politics.governmentType == "Civil War") { st -= 2; }
				if (politics.governmentType == "None") { st -= 2; }
				if (politics.governmentType == "Criminal Rule") { st -= 2; }
				if (politics.governmentType == "Isolationist") { st -= 2; }
				if (economy.productivity < 1E3) { st -= 1; }
				if (economy.productivity > 1E6) { st += 1; }
				if (colony.attacked == 1) { st -= 2; }
				if (colony.attacked > 1) { st -= 3; }

				// clamp
				// inhabited systems always have at least st1
				if (st < 1) { st = 1; }
				if (st > 7) { st = 7; }

				politics.stability = st;
			}
		}

		// uninhabited system stability
		$.uninhabitedDistances(i);
	}
}());

random.setStart(265000);

// generate word and name components for species
(function() {
	var speclist = species.list();
	for (k=0;k<speclist.length;k++) {
		if (speclist[k] != "Human") {
			// human strings are not randomised
			species.generatePreferredWordBits(speclist[k],random);
			species.generateNameLists(speclist[k],random);
		}
	}
	
}());

// leave plenty of space for adding extra base word bits later
random.setStart(300000);

(function() {
	var ku = 0;
	var usedNames = {};
	var colony, spec, star, colony2;
	var letters = ["","Alpha","Beta","Gamma","Delta","Epsilon","Zeta","Eta","Theta","Iota","Kappa","Lambda","Mu","Nu","Xi","Omicron","Pi","Rho","Sigma","Tau","Upsilon","Phi","Chi","Psi","Omega"];
	// first pass, name stars
	// most uninhabited systems are going to keep these names
	for (i=0;i<$.galaxies;i++) {
		var byBrightness = [];
		for (j=0;j<$.systems;j++) {
			star = $.get(i,j,"star");
			if (i==1) {
				if (ku == 0 && star.sequence == "Class G") {
					// ~250 LY from Sol
					// far enough that a plane-cut doesn't need
					// to include other catalogued stars.
					// Some way past Mizar (Ursa Major) from Sol
					star.name = "SAO 28750"; ku = 1;
				} else {
					// fictional future catalogue versions
					star.name = "SAO "+(random.rand(4000000)+260000);
				}
				star.constellation = "";
			} else if (i==2) {
				// systematic survey of new region of space
				star.name = "SCC-"+(j+1);
				star.constellation = "";
			} else {
				// calculate distance, brightness, direction from (nearest) homeworld
				if (homeWorlds[i].indexOf(j) != -1) {
					// is a homeworld
					colony = $.get(i,j,"colony");
					spec = colony.species[0];
					star.name = species.retrieveNameOnce(spec,random);
					// set system name at same time
					var n = species.retrieveNameOnce(spec,random);
					$.set(i,j,"name",n);
					usedNames[n] = 1+(i*$.systems)+j;
				} else {
					for (k=0;k<homeWorlds[i].length;k++) {
						var dist = $.distance(i,homeWorlds[i][k],j);
						var dir = $.direction(i,homeWorlds[i][k],j);
						var brightness = star.brightness / (dist*dist);
						byBrightness.push({
							brightness: brightness,
							dir: dir,
							homeIndex: k,
							id: j
						});
					}
				}
			}
		}
		if (i != 1 && i != 2) {
			// start making constellations
			for (j=0;j<homeWorlds[i].length;j++) {
				colony = $.get(i,homeWorlds[i][j],"colony");
				spec = colony.species[0];
				var namedStars = 15+random.rand(10);

				// sort by apparent magnitude, brightest first
				byBrightness.sort(function(a,b) { return -(a.brightness-b.brightness); });
				var constellations = [];
				var catalogueName = species.wordBit(spec,random).toUpperCase();
				for (k=0;k<24;k++) {
					constellations.push({
						name:species.retrieveNameOnce(spec,random),
						index:0
					});
				}
				// visibility threshold ~ 0.0003
				for (k=0;k<byBrightness.length;k++) {
					var starInfo = byBrightness[k];
					if (starInfo.homeIndex != j) { continue; }
					star = $.get(i,starInfo.id,"star");
					var constellation = Math.floor(((starInfo.dir/Math.PI)*12)+12)%24;
					brightness = starInfo.brightness;
					if (!star.brightnessIndex || star.brightnessIndex > k) {
						star.brightnessIndex = k;
						star.brightnessIndexSpecies = spec;
					}

					constellations[constellation].index++;
					// once get to the dimmer stars, start skipping some
					if (brightness < 0.001*random.randf()) {
						constellations[constellation].index++;
						if (brightness < 0.001*random.randf()) {
							constellations[constellation].index++;
						}
					}
					var sn = "";
					if (k < namedStars || constellations[constellation].index == 1) {
						sn = species.retrieveNameOnce(spec,random)+" ("+letters[constellations[constellation].index]+" "+constellations[constellation].name+")";
						
						if (!star.constellationIndex || star.constellationIndex > constellations[constellation].index) {
							star.constellation = constellations[constellation].name;
							star.constellationIndex = constellations[constellation].index;
							star.constellationIndexSpecies = spec;
						}

					} else if (brightness > 0.0003 && constellations[constellation].index < letters.length) {
						sn = letters[constellations[constellation].index]+" "+constellations[constellation].name;
						star.constellation = constellations[constellation].name;
						star.constallationIndex = constellations[constellation].index;					
					} else {
						sn = catalogueName+" "+(random.rand(50)+(k*50));
					}
//					console.error(sn);
					if (j==0) {
						star.name = sn;
					} else {
						// special case G6
						if (star.name.match(/[0-9]/) && !sn.match(/[0-9]/)) {
							// named by second species, not by first
							star.name = sn;
						} else if (!star.name.match(/[0-9]/) && sn.match(/[0-9]/)) {
							// named by first species, not by second
							// do nothing
						} else {
							// merge names
							star.name += " / "+sn;
						}
					}
				}
			}
		}
	}
	// second pass, name other systems

	/* Reversed so that duplicate breaking isn't concentrated in
	 * higher charts */
	for (j=0;j<$.systems;j++) {
		for (i=0;i<$.galaxies;i++) {
			star = $.get(i,j,"star");
			if (!star.name) {
				console.error("No star name for "+i+" "+j);
			}

			colony = $.get(i,j,"colony");
			// already named
			if (colony.homeWorld == 1) { continue; }
			if ($.get(i,j,"name") == "Biya's Reach") { continue; }
			var thisName = "";
			var dc = 0;
			thisName = namegen.nameSystem(i,j,$,species,random);
			if (usedNames[thisName]) {
				console.error("Duplicate name "+thisName+" => fixing");
				var us = (usedNames[thisName]-1)%$.systems;
				var ug = (usedNames[thisName]-1-us)/$.systems;
				colony2 = $.get(ug,us,"colony");
				if (colony2.founded < colony.founded) {
					thisName = namegen.newPrefix(random)+thisName;
					console.error("...Renamed to "+thisName);
				} else {
					var newname = namegen.newPrefix(random)+thisName;
					$.set(ug,us,"name",newname);
					console.error("...Renamed other to "+newname);
					usedNames[newname] = usedNames[thisName];
				}

			}
			usedNames[thisName] = 1+(i*$.systems)+j;
			//				console.error(thisName);

			$.set(i,j,"name",thisName);

		}
	}

}());

// naming takes a lot of numbers
random.setStart(319000);

// name species
(function() {
	var cons = ["ari","or","","a","ian","oid"];
	var vow = ["thi","","se","ri","n"];
	
	for (i=0;i<$.galaxies;i++) {
		if (i==1 || i==2) { continue; }
		for (k=0;k<homeWorlds[i].length;k++) {
			j = homeWorlds[i][k];
			var spec = $.get(i,j,"colony").species[0];
			var pname = $.get(i,j,"name");
			var sname = "";
			if (random.randf() < 0.5) {
				// species and planet name are similar
				sname = pname;
			} else {
				sname = species.word(spec,random);
			}
			if (sname.match(/[aeiouáàéèíìóòúù]$/)) {
				sname += vow.splice(random.rand(vow.length),1);
			} else {
				sname += cons.splice(random.rand(vow.length),1);
			}
			console.error("Named "+spec+" "+sname);
			species.setName(spec,sname);
		}
	}

}());

random.setStart(320000);

// name regions
(function() {
	for (k=1;k<=maxRegionID;k++) {
		var region = $.getRegion(k);
		if (region.name == "") {
			// ucr is already named
			var capital = region.influential[0];
			var colony = $.get(region.galaxy,capital,"colony");
			var rname = "";
			if (colony.homeWorld == 1) {
				rname = namegen.nameHomeRegion(region,$,species,random);
			} else if (colony.militaryBase == 1) {
				rname = namegen.nameMilitaryRegion(region,$,species,random);
			} else if (region.category == "Strong Political Alliance") {
				rname = namegen.namePoliticalRegion(region,$,species,random);
			} else if (region.category == "Weak Political Alliance" && random.randf() < 0.5) {
				rname = namegen.namePoliticalRegion(region,$,species,random);
			} else if (region.category == "Politically Unstable Region" && random.randf() < 0.5) {
				rname = namegen.nameUnstableRegion(region,$,species,random);
			} else if (region.category == "Economic Area" && random.randf() < 0.8) {
				rname = namegen.nameEconomicRegion(region,$,species,random);
			} else {
				rname = namegen.nameHistoricRegion(region,$,species,random);
			}
			region.name = rname;
//			console.error("Region "+rname+" in chart "+region.galaxy+" ("+region.members.join(",")+")");
		} 

		for (j=0;j<region.members.length;j++) {
			var politics = $.get(region.galaxy,region.members[j],"politics");
			politics.regionName = region.name;
		}		
	}

}());

random.setStart(325000);

// system descriptions
(function() {
	/* Reversed so that duplicate breaking isn't concentrated in
	 * higher charts */
	for (j=0;j<$.systems;j++) {
		for (i=0;i<$.galaxies;i++) {
			var names = {
				company: descgen.companyName(i,j,$,random,species),
				dictator: descgen.dictatorName(i,j,$,random,species),
				criminalGroup: namegen.criminalGroupName(random,species),
				criminal: descgen.criminalName(i,j,$,random,species),
				warmonger: descgen.warmongerName(i,j,$,random,species),
				capital: descgen.capitalcityName(i,j,$,random,species),
				gap: descgen.gapName(i,j,$,random,species),
				party1: namegen.partyName(random),
				party2: namegen.partyName(random),
				art: descgen.artName(i,j,$,random,species),
				sport: descgen.artName(i,j,$,random,species),
				news: descgen.newsName(i,j,$,random,species),
				otherOrg: descgen.otherName(i,j,$,random,species)
			};
			$.set(i,j,"names",names);
			var descblocks = descgen.getDescBlocks(i,j,$,random,species);
			// in case later work wants to depend on the presence of a particular element, which can include hidden blocks
			$.set(i,j,"descriptionElements",descblocks.map(function(b) { return b.key; }).join(","));

			var lenacc = 0;
			var useblocks = 0;
			var blocks = [];
			do {
				if (descblocks[useblocks].text.length + lenacc < 550) {
					blocks.push(descblocks[useblocks]);
					lenacc += descblocks[useblocks++].text.length;
				} else {
					useblocks++; // try to find a shorter block?
				}
			} while(lenacc < 400 && useblocks < descblocks.length);

			descgen.countblocks(blocks);
			blocks.sort(function(a,b) {
				if (a.displayOrder != b.displayOrder) {
					return a.displayOrder - b.displayOrder;
				} else {
					return b.importance - a.importance;
				}
			});
			$.set(i,j,"description",blocks.map(function(b) { return b.text; }).join(" ... "));
			$.set(i,j,"descriptionElementsUsed",blocks.map(function(b) { return b.key; }).join(","));
		}
	}
	descgen.debug();
}());

// used about 100k so far, so give room to double.
random.setStart(550000);

// checkpoint random
(function() {
	for (i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			if ($.get(i,j,"descriptionElementsUsed").match(/BGFI-NEBULA/)) {
				$.set(i,j,"starCount",random.rand(500)+800);
				$.set(i,j,"nebulaCount",random.rand(500)+300);
				$.set(i,j,"nebulaColours",[random.randf(),random.randf(),random.randf(),random.randf(),random.randf(),random.randf()]);
			} else if ($.get(i,j,"descriptionElementsUsed").match(/BGFI-SHROUD/)) {
				$.set(i,j,"starCount",random.rand(50)+80);
				$.set(i,j,"nebulaCount",random.rand(500)+300);
				$.set(i,j,"nebulaColours",[random.randf()/5,random.randf()/5,random.randf()/5,random.randf()/5,random.randf()/5,random.randf()/5]);
			} else {
				$.set(i,j,"starCount",random.rand(5000)+8000);
				$.set(i,j,"nebulaCount",random.rand(50)+25);
				$.set(i,j,"nebulaColours",[]);
			}
		}
	}	
}());


(function() {
	console.error(random.getPlace());
	$.$debug = 1;
	var planetinfoplist = "{\n";
	for (i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			planetinfoplist += $.dump(i,j,species);
		}
	}
	for (k=1;k<=maxRegionID;k++) {
		var region = $.getRegion(k);
		planetinfoplist += $.dumpRegionLinks(region);
	}
	planetinfoplist += "}\n";
	fs.writeFileSync("build/planetinfo.plist",planetinfoplist);

	var descriptionplist = "\n";
	for (i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			descriptionplist += $.dumpRegion(i,j);
		}
	}
	descriptionplist += "\n";
	fs.writeFileSync("build/descriptions.plist.regional",descriptionplist);

}());