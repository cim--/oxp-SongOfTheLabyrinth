#!/usr/local/bin/node
"use strict";

var random = require("./random");
var species = require("./species");
var $ = require("./planetinfo");

random.seed(7693175); // may need to change this depending on results
random.fill(1299827); // prime
// it'll loop around the fill when it hits the limit, so prime is necessary

var i,j,k; //iterators

/* Stage 1
Randomly set system coordinates
Randomly set system star type (new MS – blue/white, large; average MS – yellow, medium; old MS – orange/red, small; dwarf – red, small ; giant – red, large). Stars are occasionally unstable (“solar activity”) which makes their systems less habitable.
Randomly set accessible mineral wealth (higher in new MS systems as asteroids more common and planets less common)
Randomly set main planet range from star, depending on type of star 
Calculate main planet temperature. Main planet is the most habitable in the system, so the range above should be set to make at least 1/3 possibly habitable rather than ice, mostly-airless rock balls, or Venus-like hells.
Calculate main planet ocean %
Calculate per-species habitability %
*/

random.setStart(0); // for clarity

// 2 rands per star
// broken into functions to stop local variables getting everywhere
// don't do too much in each function as it makes it harder to drop extra
// random numbers in later
(function () {
	for (i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			if (j == 0) {
				// always centre system 0
				// makes connectivity enforcement easier
				$.set(i,j,"coordinates",[128,128]);
			} else {
				$.set(i,j,"coordinates",[random.rand(256),random.rand(256)]);
			}
			$.set(i,j,"name","SW "+i+"-"+j); // placeholder
		}
		$.ensureConnectivity(i);
	}
}());


random.setStart(4096); // allows reducing of $.galaxies for testing

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


random.setStart(35000); // guess ~14 total above random numbers max

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
		}
	}
}());

random.setStart(150000); // guess ~35 total above random numbers max (may need more colours)





$.$debug = 1;
console.log("{");
for (i=0;i<$.galaxies;i++) {
	for (j=0;j<$.systems;j++) {
		$.dump(i,j);
	}
}
console.log("}");
