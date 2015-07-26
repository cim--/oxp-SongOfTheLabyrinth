#!/usr/local/bin/node
"use strict";

var namegen = require("./namegen");
var random = require("./random");
var $ = require("./planetinfo");
var fs = require("fs");

random.seed(9835613);
random.fill(1299827);

var i,j,k; //iteration indices

random.setStart(0); // for clarity

/*
Planet scale 1/100 (normal Oolite)
Star scale 1/500 (smallest they can be without being too close to planet scale)
System scale 1/2500 (makes the star scale look right-ish from the planets)
*/

/* Set up system coordinates */
(function () {
	for (i=0;i<$.galaxies;i++) {
		var cused = [];

		var checkClearance = function(coords) {
			for (var n=0;n<cused.length;n++) {
				if (Math.abs(cused[n][1]-coords[1]) <= 4 && Math.abs(cused[n][0]-coords[0]) <= 6) {
					return true;
				}
			}
			return false;
		}

		for (j=0;j<$.systems;j++) {
			if (j==0) {
				/* System 0 is centred - most potential for exploration on
				 * limited map */
				$.set(i,j,"coordinates",[$.xsize/2,$.ysize/2]);
				cused.push([$.xsize/2,$.ysize/2]);
			} else {
				var coords = [random.rand($.xsize),random.rand($.ysize)];
				while (checkClearance(coords)) {
					// don't have them too close together
					coords = [random.rand($.xsize),random.rand($.ysize)];
				}
				$.set(i,j,"coordinates",coords);
				cused.push(coords);
			}
			var seed = [];
			for (k=0;k<6;k++) {
				seed[k] = random.rand(256);
			}
			$.set(i,j,"seed",seed.join(" "));

			var details;
			if (j != 0) {
				details = {
					knownMinerals: 0,
					knownHabitability: 0,
					knownBodies: 0, // excludes star
					knownMineralsDesc: "No survey",
					knownHabitabilityDesc: "No survey",
					bestPlanet: "No survey"
				};
			} else {
				details = {
					knownMinerals: 0,
					knownHabitability: 0,
					knownBodies: 2, // excludes star, two planets
					knownMineralsDesc: "Low concentration, low quality",
					knownHabitabilityDesc: "Sealed habitats only",
					bestPlanet: "Anchor"
				};
			}
			details.surveyEquipmentList = "None";

			$.set(i,j,"details",details);

		};
		$.ensureConnectivity(i);
	}
}());

random.setStart(10000);

/* Set up stars */
(function () {
	for (i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			var startypeN = random.rand(22);
			var sradfactor, shabfactor, minfactor, basecolour;
			var star = {};
			var planet = {};
			
			switch(startypeN) { 
			case 0: 
				if (random.randf() < 0.15) {
					// "blue"; 
					sradfactor = 2;
					shabfactor = 1.75;
					minfactor = 0.8;
					basecolour = [0.6,0.85,0.95];
					star.sequence = "Class A";
					star.brightness = 20 + random.rand(60);
					star.mass = 1.6 + random.randf() * 0.8;
					break;
				} else {
					// "white";
					sradfactor = 1.25;
					shabfactor = 1.4;
					minfactor = 0.6;
					basecolour = [0.9,0.9,0.9];
					star.sequence = "Class F";
					star.brightness = 2.5 + random.randf()*3.5;
					star.mass = 1.0 + random.randf() * 0.4;
					break;
				}
			case 1: case 2: case 3:
				// "yellow"; 
				sradfactor = 1;
				shabfactor = 1;
				minfactor = 0.5;
				basecolour = [0.9,0.9,0.4];
				star.sequence = "Class G";
				star.brightness = 0.75 + random.randf()*0.5;
				star.mass = 0.8 + random.randf() * 0.4;
				break;
			case 4: case 5: case 6: case 7:
				// "orange";
				sradfactor = 0.8;
				shabfactor = 0.7;
				minfactor = 0.4;
				basecolour = [0.95,0.7,0.25];
				star.sequence = "Class K";
				star.brightness = 0.15 + random.randf()*0.25;
				star.mass = 0.45 + random.randf() * 0.35;
				break;
			case 8: case 9: case 10:
				// "large red dwarf";
				sradfactor = 0.6;
				shabfactor = 0.5; 
				minfactor = 0.3;
				basecolour = [0.95,0.55,0.5];
				star.sequence = "Class M";
				star.brightness = 0.05 + random.randf()*0.1;
				star.mass = 0.2 + random.randf() * 0.4;
				break;
			case 11:
				// "giant"; 
				sradfactor = 50;
				shabfactor = 50;
				minfactor = 0.1; 
				basecolour = [0.95,0.25,0.25];
				star.sequence = "Red giant";
				star.brightness = 100 + random.rand(600);
				break;
				// this should probably be more like 12-29
				// but that makes A-class too rare
				// maybe if the map expands it can be adjusted
			default: // 12-21 
				// "small red dwarf";
				star.sequence = "Class M dwarf";
				star.brightness = 0.001 + random.randf()*0.009;
				star.mass = 0.075 + random.randf()*0.2;
				sradfactor = 0.3;
				shabfactor = 0.4;
				minfactor = 0.2;  
				basecolour = [0.95,0.45,0.4];
			}

			star.radius = Math.floor(14E5 * (0.9+(0.2*random.randf())) * sradfactor);
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
			star.mineralFactor = (j==0)?0.1:(minfactor*(1+random.randf()-random.randf()));
			star.mineralSeed = random.rand(0xFFFFFF);
			star.constellation = "";
			star.name = "";
			var sunz = random.randf()-0.5;
			if (random.randf() < 0.5) {
				star.vector = [Math.sqrt(1-(sunz*sunz)),0,sunz];
			} else {
				star.vector = [-Math.sqrt(1-(sunz*sunz)),0,sunz];
			}

			// star colour
			var adj = (random.randf()*0.05)-0.025;
			star.colour = [
				(basecolour[0] + adj),
				basecolour[1],
				(basecolour[2] - adj)
			];

			$.set(i,j,"star",star);

			// and other visible stars
			$.set(i,j,"starCount",random.rand(10000)+10000);
			$.set(i,j,"nebulaCount",random.rand(50)+25);
			$.set(i,j,"description",star.sequence+" star. System unexplored.");
		}
	}
}());

$.set(0,0,"description","The colony ship 'Local Maximum' arrived in this system around 55 kD ago, following an unusual hyperspace event. The system is largely unsuited to habitation, containing only two airless planets 'Anchor' and 'Stray', and a mineral-poor asteroid belt. Most of the population remains on the Local Maximum, currently orbiting Anchor.");


random.setStart(75000);

// name stars
(function() {
	var ku = 0;
	var usedNames = {};
	var spec, star;
	var letters = ["","Alpha","Beta","Gamma","Delta","Epsilon","Zeta","Eta","Theta","Iota","Kappa","Lambda","Mu","Nu","Xi","Omicron","Pi","Rho","Sigma","Tau","Upsilon","Phi","Chi","Psi","Omega"];

	for (i=0;i<$.galaxies;i++) {
		var byBrightness = [];
		for (j=0;j<$.systems;j++) {
			star = $.get(i,j,"star");
			if (j==0) {
				star.name = "Max's Drift";
				star.constellation = "";
			} else {
				// calculate distance, brightness, direction from Astray
				var dist = $.distance(i,0,j);
				var dir = $.direction(i,0,j);
				var brightness = star.brightness / (dist*dist);
				byBrightness.push({
					brightness: brightness,
					dir: dir,
					id: j
				});
			}
		}
		var namedStars = 35;

		// sort by apparent magnitude, brightest first
		byBrightness.sort(function(a,b) { return -(a.brightness-b.brightness); });
		var constellations = [];
		var catalogueName = "AS";
		for (k=0;k<24;k++) {
			constellations.push({
				name:namegen.word(random,2),
				index:0
			});
		}
		// visibility threshold ~ 0.0001
		for (k=0;k<byBrightness.length;k++) {
			var starInfo = byBrightness[k];
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
				sn = namegen.word(random,3)+" ("+letters[constellations[constellation].index]+" "+constellations[constellation].name+")";
						
				if (!star.constellationIndex || star.constellationIndex > constellations[constellation].index) {
					star.constellation = constellations[constellation].name;
					star.constellationIndex = constellations[constellation].index;
					star.constellationIndexSpecies = spec;
				}

			} else if (brightness > 0.0001 && constellations[constellation].index < letters.length) {
				sn = letters[constellations[constellation].index]+" "+constellations[constellation].name;
				star.constellation = constellations[constellation].name;
				star.constallationIndex = constellations[constellation].index;					
			} else {
				sn = catalogueName+" "+starInfo.id;
			}
			star.name = sn;
		}
	}

}());

random.setStart(80000);

/* Planets */
(function() {
	for (i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			var numplanets = 1;
			var star = $.get(i,j,"star");
			if (j == 0) {
				numplanets = 2;
				$.addPlanet(i,j,star, star.habitableZoneFactor * 0.3, 1, random, "Anchor");
				$.addPlanet(i,j,star, star.habitableZoneFactor * 5.6, 1, random, "Stray");
				$.set(i,j,"planets_discovered",3); // bitmask
			} else {
				numplanets += random.rand(4);
				if (star.sequence != "Red giant") {
					// red giants have lost many planets
					do {
						numplanets += random.rand(4);
					} while (numplanets % 4 == 0);
				}
				var radius = (star.sequence != "Red giant") ? 0.05 : 1.5;
				for (k=0;k<numplanets;k++) {
					if (radius < 1) {
						radius += random.randf()/3;
					}
					radius *= 1.0+random.randf();
					$.addPlanet(i,j,star, radius, 0, random, "");
					/* Autonaming is possible for testing! */
					//					$.addPlanet(i,j,star, radius, 0, random, star.name.replace("/ .*/","")+" "+(k+1));
				}
				$.set(i,j,"planets_discovered",0); // bitmask
			}
			
			/* TODO: need to add asteroid fields */
		}
	}
}());











/* Write to disk */
(function() {
	console.error(random.getPlace());
	$.$debug = 1;
	var planetinfoplist = '/* File is auto-generated - do not edit directly! */\n'+
		'{\n'+
		'	"interstellar space" =\n'+
		'	{\n'+
		'		sky_n_stars = 13000;\n'+
		'		sky_n_blurs = 75;\n'+
		'	};\n'+
		'\n'+
		'	"universal" = \n'+
		'	{\n'+
		'		sky_color_1 = (0.85,0.9,1);\n'+
		'		sky_color_2 = (1.0,0.9,0.8);\n'+
		'		ambient_level = 0.25;\n'+
		'	};\n';

	for (i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			planetinfoplist += $.dump(i,j);
		}
	}
	for (i=0;i<$.galaxies;i++) {
		for (j=0;j<$.systems;j++) {
			planetinfoplist += $.dumpPlanets(i,j);
		}
	}
	planetinfoplist += "}\n";
	fs.writeFileSync("build/planetinfo.plist",planetinfoplist);

}());
