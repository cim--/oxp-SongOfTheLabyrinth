/**
 * Species related functions
 */
"use strict";

(function() {

	var wordbits = [
		"ab","ac","ad","ag","ah","al","am","an","ap","ar","as","at","aw","ax","az",
		"ba","be","bi","bo","bu","by",
		"ca","ce","ci","co",
		"da","de","di","do","du","dy",
		"eb","ec","ed","ef","ee","eg","el","em","en","ep","er","es","et","ev","ex","ez",
		"fa","fe","fi","fo",
		"ga","ge","gi","go","gu","gy",
		"ha","he","hi","ho","hu",
		"ib","ic","id","if","ig","il","im","in","ip","ir","is","it","iv","ix","iz",
		"ja","je","jo","ju",
		"ka","ke","ko","ku",
		"la","le","li","lo","lu","ly",
		"ma","me","mi","mo","mu","my",
		"na","ne","no",
		"oa","od","of","og","oh","oi","ol","om","on","oo","op","or","os","ot","ow","ox","oy","oz",
		"pa","pi","po","pu",
		"qua","que","qui","quo",
		"ra","re","ri","ro","ru","ry",
		"sa","se","si","so","su",
		"ta","te","ti","to","tu",
		"ub","ud","ug","ul","um","un","up","us","ur","ut","ux",
		"ve","vi","vo",
		"wa","we","wi","wo","wy",
		"xe","xy",
		"ya","ye","yo",
		"za","ze","zo","zy",
		"ath","eth","oth","uth",
		"ess","iss","oss","uss",
		"ach","ich","och",
		"tra","tre","tri","tro","tru","try",
		"sla","sle","sli","slo",
		"sha","she","sho","shu",
		"gra","gre","gri","gro","gry",
		"stra","stre","stri","stro","stru","stry",
		"pla","ple","pli","plo","plu",
		"mar","mer","mor",
		"bar","ber","bor","bur",
		"tar","ter","tor","tur",
		"lar","lir","lor","lur",
		"bat","bet","bit",
		"cat","cot","cut",
		"det","dot",
		"mat","met","mit",
		"arm","erm","orm","urm",
		"fat","fit",
		"gan","gin","gon","gun",
		"has","his","hos",
		"mas","mis","mus","mys",
		"rat","rot","rut",
		"ang","eng","ing","ong","ung",
		"egg","igg","ogg","ugg",
		"are","ari","aro","aru",
		"pre","pra","pri","pro","pru","pry",
		"sta","ste","sti","sto","stu","sty",
		"ach","ech","ich","och",
		"ack","eck","ick","ock"
	];

	var wordmap = {
		"ii": "i",
		"aa": "a",
		"uu": "u",
		"''": "'",
		"qq": "q",
	};

	// human name list
	var namelist = [
		"Abena","Abeni","Aberash","Abidemi","Abiodun","Achieng","Adaeze","Adanna","Adebowale","Adhiambo","Adisa","Adjoa","Afua","Akachi","Alaba","Alemayehu","Amadi","Ameqran","Andile","Atieno","Ayodele","Azubuike","Babajide","Babirye","Bamidele","Berhanu","Bosede","Chausiku","Chiamaka","Dakarai","Dejen","Desta","Ebele","Ekene","Ekundayo","Emeka","Enitan","Enyinnaya","Esi","Farai","Faraji","Folami","Fungai","Furaha","Hiwot","Idowu","Idir","Idriss","Ime","Isingoma","Itri","Izem","Jelani","Jumaane","Kagiso","Kahina","Kamaria","Katlego","Kayin","Kefilwe","Kgosi","Khamisi","Kirabo","Kofi","Lanre","Lekan","Lerato","Lesedi","Lindiwe","Makena","Manyara","Marjani","Masego","Mbali","Mirembe","Munashe","Neo","Nia","Nneka","Nomusa","Nontle","Nsia","Nthanda","Nuru","Nyarai","Ochieng","Olayinka","Oluchi","Omolara","Onyeka","Otieno","Refilwe","Rufaro","Rutendo","Sanaa","Sauda","Seble","Sefu","Sekai","Sipho","Ssanyu","Subira","Tafari","Tamrat","Taonga","Tapiwa","Tariro","Tau","Tendai","Tendaji","Thema","Thulani","Tichaona","Tidir","Tifawt","Udo","Uduak","Wekesa","Xolani","Yejide","Zola","Zuri","Zuberi","Sellal","Santos","Boni","Khama","Zida","Yang","Samba","Panza","Kamoun","Déby","Dhoinine","Kabila","Ponyo","Nguesso","Mbasogo","Tomi","Afwerki","Teshome","Desalegn","Ondimba","Ondo","Jammeh","Mahama","Condé","Fofana","Ouattara","Duncan","Kenyatta","Thabane","Sirleaf","Kolo","Keïta","Mara","Benkirane","Guebuza","Nyussi","Vaquina","Pohamba","Geingob","Issoufou","Rafini","Kagame","Murekezi","Sall","Dionne","Koroma","Zuma","Dlamini","Kikwete","Pinda","Zunu","Museveni","Rugunda","Scott"
	];
console.error(namelist.length);

	var speciesInfo = {
		"Bird" : {
			preferredGravity: 0.58,
			preferredTemperature: 9,
			temperatureTolerance: 5,
			radiationTolerance: 0.03,
			preferredLand: 0.35,
			landTolerance: 0.06,
			seismicTolerance: 0.25,
			windTolerance: 0.1,
			nativeChart: 5,
			speciesName: "",
			evolution: "above %S scattered islands",
			earlyHistory: "Early %I experiments with space flight allowed them to go far above what their own wings would allow. They discovered the fundamentals of witchspace in %D1, and began launching their initial scouts soon after."
		},
		"Feline" : {
			preferredGravity: 0.86,
			preferredTemperature: 15,
			temperatureTolerance: 4,
			radiationTolerance: 0.05,
			preferredLand: 0.55,
			landTolerance: 0.1,
			seismicTolerance: 0.05,
			windTolerance: 0.17,
			nativeChart: 4,
			speciesName: "",
			evolution: "in the extensive grasslands of %H",
			earlyHistory: "The %I discovered witchspace in %D1E, but a shortage of %M meant that their first successful witchdrive test only occurred in %D1L after a significant asteroid mining programme. Many of their early mining colonies were set up to provide %H with this locally rare element."
		},
		"Frog" : {
			preferredGravity: 0.83,
			preferredTemperature: 17,
			temperatureTolerance: 2,
			radiationTolerance: 0.02,
			preferredLand: 0.3,
			landTolerance: 0.08,
			seismicTolerance: 0.11,
			windTolerance: 0.19,
			nativeChart: 5,
			speciesName: "",
			evolution: "in %S swamps",
			earlyHistory: "Equally at home in the water and on land, conquering the air and then space was a dream of the ancestral %I. Their comprehensive astronomy programme detected faint radio transmissions from the %IB's home system, though it was only in %D1E with their discovery of witchspace that they truly began preparing for first contact with another species."
		},
		"Human" : {
			preferredGravity: 1.00,
			preferredTemperature: 13,
			temperatureTolerance: 4,
			radiationTolerance: 0.02,
			preferredLand: 0.30,
			landTolerance: 0.1,
			seismicTolerance: 0.06,
			windTolerance: 0.15,
			wordBits: wordbits, // use standard list
			nameList: namelist,
			nativeChart: 1,
			speciesName: "Human",
			evolution: "on distant Earth",
			earlyHistory: "%Is are believed to have been the earliest species to discover the witchdrive, and the calendar's 0 kD is marked from the estimated date of this. The human homeworld is around 250LY from Biya's Reach, and other than that they were fleeing something little is now known of why they came to this region of space."
		},
		"Insect" : {
			preferredGravity: 0.74,
			preferredTemperature: 17,
			temperatureTolerance: 5,
			radiationTolerance: 0.26,
			preferredLand: 0.38,
			landTolerance: 0.25,
			seismicTolerance: 0.25,
			windTolerance: 0.09,
			nativeChart: 7,
			speciesName: "",
			evolution: "on the warm equatorial coasts",
			earlyHistory: "The tough exoskeleton and wings of the %I served them well during early space flight, allowing them to move easily in microgravity, and survive harsh radiation. They discovered witchspace in %D1 on one of their off-world stations."
		},
		"Lizard" : {
			preferredGravity: 0.95,
			preferredTemperature: 24,
			temperatureTolerance: 1,
			radiationTolerance: 0.07,
			preferredLand: 0.50,
			landTolerance: 0.2,
			seismicTolerance: 0.13,
			windTolerance: 0.21,
			nativeChart: 0,
			speciesName: "",
			evolution: "in the hot plains of %H",
			earlyHistory: "Early space travel was a challenge for the %I, whose need to keep their environmental temperature carefully regulated significantly added to the cost. They discovered witchspace in %D1E but were not able to safely make a crewed flight until %D1L."
		},
		"Lobster" : {
			preferredGravity: 1.26,
			preferredTemperature: 12,
			temperatureTolerance: 3,
			radiationTolerance: 0.21,
			preferredLand: 0.1,
			landTolerance: 0.05,
			seismicTolerance: 0.33,
			windTolerance: 0.35,
			nativeChart: 6,
			speciesName: "",
			evolution: "beneath %S vast oceans",
			earlyHistory: "The aquatic %I took several thousand kD after initially developing a technological culture to emerge on to the land. Once they had done so, however, they reached the air, space and witchspace in quick succession, making their first inter-system journey in %D1."
		},
		"Rodent" : {
			preferredGravity: 0.79,
			preferredTemperature: 9,
			temperatureTolerance: 3,
			radiationTolerance: 0.11,
			preferredLand: 0.75,
			landTolerance: 0.3,
			seismicTolerance: 0.01,
			windTolerance: 0.56,
			nativeChart: 3,
			speciesName: "",
			evolution: "below the surface",
			earlyHistory: "Their vast tunnels stretch several kilometres below the surface, which in their prehistory was occupied by several dangerous predators. They did not venture onto the surface again until after the development of air travel. In %D1 they developed their first witchdrive."
		}
	};


	var species = {};

	// random = random.js random number streamer
	species.generatePreferredWordBits = function(spec,random) {
		do {
			var preflist = [];
			for (var i=0;i<26;i++) {
				if (random.randf() < 0.5) {
					preflist.push(String.fromCharCode(97+i));
				}
			}
			if (random.randf() < 0.25) {
				preflist.push("'");
			}
			// require at least two vowels
		} while (
			((preflist.indexOf("a") == -1)?0:1) +
				((preflist.indexOf("e") == -1)?0:1) +
				((preflist.indexOf("i") == -1)?0:1) +
				((preflist.indexOf("o") == -1)?0:1) +
				((preflist.indexOf("u") == -1)?0:1) < 2);
			
		var prefbits = [];
		// select some from common bit list
		for (i=0;i<wordbits.length;i++) {
			var chance = 0.1;
			for (var j=0;j<3;j++) {
				if (preflist.indexOf(wordbits[i].substr(j,1)) != -1) {
					chance += 0.25;
				}
			}
			if (random.randf() < chance) {
				prefbits.push(wordbits[i]);
			}
		}
		if (preflist.indexOf("a") != -1) {
			if (random.randf() < 0.25) {
				preflist.push("á");
			}
			if (random.randf() < 0.25) {
				preflist.push("à");
			}
		}
		if (preflist.indexOf("e") != -1) {
			if (random.randf() < 0.25) {
				preflist.push("é");
			}
			if (random.randf() < 0.25) {
				preflist.push("è");
			}
		}
		if (preflist.indexOf("i") != -1) {
			if (random.randf() < 0.25) {
				preflist.push("í");
			}
			if (random.randf() < 0.25) {
				preflist.push("ì");
			}
		}
		if (preflist.indexOf("o") != -1) {
			if (random.randf() < 0.25) {
				preflist.push("ó");
			}
			if (random.randf() < 0.25) {
				preflist.push("ò");
			}
		}
		if (preflist.indexOf("u") != -1) {
			if (random.randf() < 0.25) {
				preflist.push("ú");
			}
			if (random.randf() < 0.25) {
				preflist.push("ù");
			}
		}
		console.error(spec+" has pref list "+preflist);
		
		// make up some new ones from common letter list
		var l = prefbits.length/8;
		var phstr;
		for (i=0;i<l;i++) {
			var phlength = random.rand(2)+2;
			do { 
				phstr = "";
				for (j=0;j<phlength;j++) {
					phstr += preflist[random.rand(preflist.length)];
				}
			} while (!phstr.match(/[aeiouáàéèíìóòúù]/));
			prefbits.push(phstr);
		}
		speciesInfo[spec].wordBits = prefbits;
//		console.error(spec+" has bit list "+prefbits);
	}

	species.generateNameLists = function(spec,random) {
		speciesInfo[spec].nameList = [];
		var wbl = speciesInfo[spec].wordBits.length;
		for (var i=0;i<400;i++) {
			var name = "";
			var nl = random.rand(2)+2;
			for (var j=0;j<nl;j++) {
				name += speciesInfo[spec].wordBits[random.rand(wbl)];
			}
			for (j in wordmap) {
				name = name.replace(j,wordmap[j]);
			}
			name = name.replace(/^'/,"");
			name = name.replace(/'$/,"");
			speciesInfo[spec].nameList.push(name);
		}
//		console.error(spec+" has name list "+speciesInfo[spec].nameList);
	}

	species.wordBit = function(spec,random) {
		return speciesInfo[spec].wordBits[random.rand(speciesInfo[spec].wordBits.length)];
	}

	species.word = function(spec,random) {
		var wb = speciesInfo[spec].wordBits;
		var wbl = wb.length;
		var word = "";
		var nl = random.rand(3)+2;
		for (var j=0;j<nl;j++) {
			word += wb[random.rand(wbl)];
		}
		for (j in wordmap) {
			word = word.replace(j,wordmap[j]);
		}
		word = word.replace(/^'/,"");
		word = word.replace(/'$/,"");
		return word.replace(/^./, function (str) { return str.toUpperCase(); });
	}

	species.longerWord = function(spec,random) {
		var wb = speciesInfo[spec].wordBits;
		var wbl = wb.length;
		var word = "";
		var nl = random.rand(3)+3;
		for (var j=0;j<nl;j++) {
			word += wb[random.rand(wbl)];
		}
		for (j in wordmap) {
			word = word.replace(j,wordmap[j]);
		}
		word = word.replace(/^'/,"");
		word = word.replace(/'$/,"");
		return word.replace(/^./, function (str) { return str.toUpperCase(); });
	}


	species.retrieveNameOnce = function(spec,random) {
		var name = speciesInfo[spec].nameList.splice(random.rand(speciesInfo[spec].nameList.length),1);
		return name[0].replace(/^./, function (str) { return str.toUpperCase(); });
	}

	species.retrieveName = function(spec,random) {
		var name = speciesInfo[spec].nameList[random.rand(speciesInfo[spec].nameList.length)];
		return name.replace(/^./, function (str) { return str.toUpperCase(); });
	}


	species.list = function() {
		return Object.keys(speciesInfo);
	};

	species.getNearestOrder = function(g) {
		var cycle = ["Lizard","Insect","Lobster","Bird","Frog","Feline","Rodent","Human"];
		// fall-through is deliberate, and makes most sense read bottom-up
		switch (g) {
		case 1:
			// G2 and G3 are the same as there's no G3 species
		case 2:
			cycle.push(cycle.shift()); // move Rodents last for G3
		case 3:
			cycle.push(cycle.shift()); // move Felines last for G4
		case 4:
			cycle.push(cycle.shift()); // move Birds last for G5
			cycle.push(cycle.shift()); // move Frogs last for G5
		case 5:
			cycle.push(cycle.shift()); // move Lobsters last for G6
		case 6:
			cycle.push(cycle.shift()); // move Insects last for G7
		case 7:
			cycle.push(cycle.shift()); // move Lizards last for G8
		case 0:
			// do nothing
		}
		return cycle;
	}

	species.getHabitability = function(planet) {
		var habs = {};
		var ht = 0;
		var hb = 0;
		var hw = 100;
		for (var s in speciesInfo) {
			var spec = speciesInfo[s];
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

			
			habs[s] = hab;
			ht += hab;
			if (hb < hab) { hb = hab; }
			if (hw > hab) { hw = hab; }
		}
		habs.average = (ht/8);
		habs.best = hb;
		habs.worst = hw;
		return habs;
	};

	species.setGovernmentPreferences = function(s,pref) {
		speciesInfo[s].governments = pref;
	};

	species.randomGovernment = function(s,randf) {
		return speciesInfo[s].governments[Math.floor(speciesInfo[s].governments.length*randf)];
	};
	
	species.describeGovernmentPreferences = function(s) {
		var prefs = {};
		for (var i=0;i<speciesInfo[s].governments.length;i++) {
			if (prefs[speciesInfo[s].governments[i]]) {
				prefs[speciesInfo[s].governments[i]]++;
			} else {
				prefs[speciesInfo[s].governments[i]] = 1;
			}
		}
		var result = "";
		for (var p in prefs) {
			result += p+": "+prefs[p]+"\n";
		}
		return result;
	};

	species.isNative = function(g,s) {
		return (speciesInfo[s].nativeChart == g);
	};

	species.getNative = function(g,r) {
		var l = [];
		if (g == 2) {
			l = species.list();
		}
		for (var k in speciesInfo) {
			if (speciesInfo[k].nativeChart == g) {
				l.push(k);
			}
		}
		return l[r.rand(l.length)];
	};

	species.setName = function(s,name) {
		speciesInfo[s].speciesName = name;
	}

	species.setHomeworld = function(s,g,sys) {
		speciesInfo[s].homeWorld = [g,sys];
	}

	species.getHomeworld = function(s) {
		return speciesInfo[s].homeWorld;
	}

	species.name = function(s) {
		return speciesInfo[s].speciesName;
	}

	species.pluralName = function(s) {
		var sn = speciesInfo[s].speciesName;
		if (sn.match(/[aeiou]$/)) {
			return sn;
		} else {
			return sn + "s";
		}
	}


	species.evolution = function(s) {
		return speciesInfo[s].evolution;
	};

	species.earlyHistory = function(s) {
		return speciesInfo[s].earlyHistory;
	};

	module.exports = species;

}());