/**
 * Description block format is:
 {
   importance: 0-100 (100 is most important)
   text: text string describing the block
   key: string key identifying the block origin for duplicate prevention
   displayOrder: 1-12 (stage for historical, 12 for current)
 }
 */
(function() {
	var usedKeys = {};
	var state = { home: {"Human": "Dramani's Hope" } };
	var checkKey = function(k,c,e) {
		if (!usedKeys[k]) {
			usedKeys[k] = 0;
			return true;
		}
		if (usedKeys[k] <= c) {
			return true;
		}
		if (e) {
			console.error("Key overused "+k);
		}
		return false;
	};
	var useKey = function(k) {
		if (!usedKeys[k]) {
			usedKeys[k] = 1;
		} else {
			usedKeys[k] += 1;
		}
	}

	var historySearch = function(history, event, stage) {
		for (var i=0;i<history.length;i++) {
			if (history[i].type == event && history[i].historyStep == stage) {
				return true;
			}
		}
		return false;
	}

	var expandMinerals = ["Platinum","Rhodium","Gold","Iridium","Osmium","Palladium","Rhenium","Ruthenium","Indium","Tellurium","Bismuth"];
	var expandCreatures = ["fungi","vines","leviathans","creatures","trees","grasses","mammoths","behemoths","plants","animals","predators","swarms","venomous creatures","pollen","burrowers","worms","amoebas","scavengers","beasts","colossi","titans","constrictors","herds"];
	var expandPolitics = ["taxation","funding","economic policy","migration","settlement","mineral rights","trade routes","leadership changes","autonomy"];
	var expandAccident = ["an asteroid storm","a reactor explosion","a collision","an unusually severe solar flare","a thruster failure","life-support failures","a coolant leak","a fuel leak","unknown causes","radical saboteurs"];

	var expand = function(info,string) {
//		console.error(info,string);
		string = string.replace(/%S/g,info.name+"'s");
		string = string.replace(/%H/g,info.name);
		string = string.replace(/%U/g,info.star.name.replace(/ \(.*/,""));
		if (info.colony.species.length > 0) {
			if (info.colony.species.length > 1) {
				string = string.replace(/%I1/g,info.species.name(info.colony.species[1]));
			}
			string = string.replace(/%I/g,info.species.name(info.colony.species[0]));
			string = string.replace(/%O/g,state.home[info.colony.species[0]]?state.home[info.colony.species[0]]:"their homeworld");
			string = string.replace(/%N/g,info.species.word(info.colony.species[0],info.r));
		}
		string = string.replace(/%M/g,expandMinerals[info.r.rand(expandMinerals.length)]);
		string = string.replace(/%P/g,expandPolitics[info.r.rand(expandPolitics.length)]);
		string = string.replace(/%C/g,expandCreatures[info.r.rand(expandCreatures.length)]);
		string = string.replace(/%A/g,expandAccident[info.r.rand(expandAccident.length)]);
		// initial colonisation
		string = string.replace(/%D1/g,(info.r.rand(10)+140)+" kD");
		string = string.replace(/%D2/g,(info.r.rand(250)+150)+" kD");
		// initial colonisation 2
		string = string.replace(/%D3/g,(info.r.rand(150)+400)+" kD");
		// galdrive phase
		string = string.replace(/%D4/g,(info.r.rand(50)+550)+" kD");
		// cooperative phases
		string = string.replace(/%D5/g,(info.r.rand(150)+600)+" kD");
		string = string.replace(/%D6/g,(info.r.rand(100)+750)+" kD");
		string = string.replace(/%D7/g,(info.r.rand(50)+850)+" kD");
		// terraforming phase
		string = string.replace(/%D8/g,(info.r.rand(100)+900)+" kD");
		// consolidation phase
		string = string.replace(/%D9/g,(info.r.rand(126)+1000)+" kD");
		// invasion phase
		string = string.replace(/%D10/g,(info.r.rand(16)+1126)+" kD");
		// post-invasion
		string = string.replace(/%D11/g,(info.r.rand(3)+1142)+" kD");
		return string;
	}


	var descgen = {};

	

	/* Functions which return substrings */

	var evolutionDesc = function(info) {
		var sp = info.colony.species[0];
		if (info.star.sequence == "Red giant") {
			if (checkKey("HSD-Giant",0,true)) {
				useKey("HSD-Giant");
				return "Whether the %U system's early history contained any life is unknown. The "+info.species.name(sp)+" evolved only after it expanded to a red giant.";
			}
		} else if (info.star.sequence == "Class M dwarf") {
			if (checkKey("HSD-Dwarf",0,true)) {
				useKey("HSD-Dwarf");
				return "The dim light of %U only slowly allowed life to evolve here, but eventually "+info.species.evolution(sp)+" the "+info.species.name(sp)+" developed sapience and technology.";
			}
		} else if (info.star.brightness > 2) {
			if (checkKey("HSD-Young",0)) {
				useKey("HSD-Young");
				return "The "+info.species.name(sp)+" evolved rapidly "+info.species.evolution(sp)+" under the bright light of %U.";
			} else if (checkKey("HSD-Young",1)) {
				useKey("HSD-Young");
				return "%H is the home planet of the "+info.species.name(sp)+".";
			} else if (checkKey("HSD-Young",2,true)) {
				useKey("HSD-Young");
				return "The "+info.species.name(sp)+" home world orbits the young star %U. They are believed to be the species which reached sapience quickest after planetary formation.";
			}
		} else {
			if (checkKey("HSD-Old",0)) {
				useKey("HSD-Old");
				return "It was on %H, orbiting the "+info.star.sequence+" star %U, that the "+info.species.name(sp)+" species began.";
			} else if (checkKey("HSD-Old",1)) {
				useKey("HSD-Old");
				return "The "+info.species.name(sp)+" originally developed "+info.species.evolution(sp)+".";
			} else if (checkKey("HSD-Old",2)) {
				useKey("HSD-Old");
				return "Home system of the "+info.species.name(sp)+", the planet "+info.name+" appears from deep archaeological records to have had at least one technological species before them.";
			} else if (checkKey("HSD-Old",3,true)) {
				useKey("HSD-Old");
				return "Homeworld of the "+info.species.name(sp)+", %H orbits the aging %U. Their slow evolution "+info.species.evolution(sp)+" into a technological species occurred without significant environmental damage, and the world is renowned for its natural beauty.";
			}
		}
		return "";
	}


	/* Functions which return (sets of) blocks */
	
	var blocksForHomeworld = function(info) {
		var blocks = [];
		var block = {
			importance: 100,
			displayOrder: 1,
			key: ""
		};
		if (info.g != 1 && info.g != 2) {
			state.home[info.colony.species[0]] = info.name;
			block.text = evolutionDesc(info);
		} else if (info.g == 1) {
			if (info.name == "Dramani's Hope") {
				block.text = "Dramani's Hope was the most habitable world beyond Biya's Reach the human exile fleet could reach on its remaining fuel. Settled by two of the three surviving colony ships, it has become the new spiritual homeworld, a status that remains unchallenged despite many larger human colonies now existing.";
			} else if (info.name == "Aquino's Landing") {
				block.text = "Shortly after the founding of Dramani's Hope, another habitable system was found, suitable for mining and limited fuel generation. Taking a single colony ship and the remaining fuel, Aquino is said to have led hundreds of thousands of colonists to found a settlement there. Its strategic importance as a mining system is now long past, but there are many museums describing its once vital role to the exile fleet.";
			} else {
				block.text = "The possibly-mythical explorer Biya discovered this system in around 140 kD. At the time it was also connected by a 6.98 LY link to a much larger star cluster, slowly widening towards the 7 LY jump limit. Shortly before the link broke in around 150 kD, a human colonisation fleet jumped across the gap, intentionally exiling itself to flee a now-unrecorded threat.";
			}
		} else if (info.g == 2) {
			block.text = "Selected as the best system in Chart 3 for joint habitation, it was founded as the capital of the United Species Coalition, and retains that role today. While the invasion has damaged the USC's strength considerably, the capital itself survived all attempts to assault it, and it is from here that the difficult work of reconstruction is coordinated.";
		}
		blocks.push(block);

		return blocks;
	};

	var blocksForEmbassy = function(info) {
		var blocks = [];
		var block = {
			importance: 100,
			displayOrder: 4,
			key: "",
			text: ""
		};

		if (info.colony.founded < 4) {
			block.key = "BFE-Old";
			if (checkKey(block.key,0)) {
				block.text = "The colony was transferred to the USC as an embassy system shortly after the signing of the treaties.";
			} else if (checkKey(block.key,1)) {
				block.text = "In %D4, the small colony was significantly expanded by the arrival of the USC embassy.";
			} else if (checkKey(block.key,2)) {
				block.text = "As the most generally habitable planet in the chart, %H was the obvious choice for the young United Species Coalition, and it was transferred to their control in %D4";
			} else if (checkKey(block.key,3)) {
				block.text = "The United Species Coalition took over this system as an embassy in %D4.";
			} else if (checkKey(block.key,4)) {
				block.text = "The agreeable environment allowed the original "+info.species.name(info.colony.species[0])+" settlers to recommend %H as an embassy world to the United Species Coalition, and it became one of the most diverse systems in the chart.";
			} else {
				block.text = "This system became a USC embassy in %D4.";
			}
		} else {
			block.key = "BFE-New";
			if (checkKey(block.key,0)) {
				block.text = "The system was settled in %D4 as a USC embassy and administrative centre for the chart.";
			} else if (checkKey(block.key,1)) {
				block.text = "%H was chosen as the chart's USC embassy in %D4.";
			} else if (checkKey(block.key,2,true)) {
				block.text = "The pleasant climate and lack of previous claims led to %H being chosen as the site of the USC embassy.";
			}
		}
		blocks.push(block);
		if (info.colony.attacked > 0) {
			block = {
				importance: 100,
				displayOrder: 10,
			};
			block.key = "BFE-Attack";
			block.text = "The successful assault on this system was a severe blow to USC morale.";
			blocks.push(block);
		}
		return blocks;
	}


	var blocksForInitialColony = function(info) {
		var blocks = [];
		var opt, opts;
		var block = {
			importance: 75,
			displayOrder: 2,
			key: "",
			text: ""
		};
		if (checkKey("BFIC-First",0) && info.colony.species[0] != "Human") {
			block.text = "Generally believed to be the earliest off-world colony in the eight charts of any species, it was founded in 137KD, before humans crossed Biya's Gap.";
			block.key = "BFIC-First";
			state.oldest = info.name;
		} else if (!checkKey("BFIC-First",0) && checkKey("BFIC-FirstDispute",5) && info.colony.species[0] != "Human") {
			block.key = "BFIC-FirstDispute";
			if (checkKey("BFIC-FirstDispute",1)) {
				block.text = "This system claims to be the oldest off-world colony, though "+state.oldest+" is considered more likely.";
			} else if (checkKey("BFIC-FirstDispute",3)) {
				block.text = "Once thought to be the oldest off-world colony, more recent finds have dated it to %D1.";
			} else {
				block.text = "This is one of the oldest off-world colonies, founded in %D1.";
			}
		}
		if (block.text != "") {
			blocks.push(block);
			block = {
				importance: 40,
				displayOrder: 2,
				key: "",
				text: ""
			};
		}
		if (info.habitability[info.colony.species[0]] >= 80)  {
			opts = [
				{key: "BFIC-HAB1", text: "Early %I explorers discovered %H to be safely inhabitable, and initial settlements were built in %D2.", condition: true },
				{key: "BFIC-HAB2", text: "%S pleasant environment and closeness to the %I homeworld made it a natural early colony.", condition:  info.habitability[info.colony.species[0]] >= 90 },
				{key: "BFIC-HAB3", text: "The superb environment of %H made it a popular destination for early %I colonists, and immigration controls were introduced as early as %D2.", condition:  info.habitability[info.colony.species[0]] >= 95 },
				{key: "BFIC-HAB4", text: "Exploration of the %U system discovered %H comfortably within the habitable zone, and colonisation ships were soon dispatched.", condition: true },
				{key: "BFIC-HAB5", text: "The native life of %H fascinated the early %I explorers, who established their first monitoring station in %D2.", condition: info.economy.reason == "Native Life" },
				{key: "BFIC-HAB6", text: "After the native %C of %H wiped out the initial colony, the system was placed under quarantine in %D2.", condition: info.economy.reason == "Native Life" && info.economy.type == "Quarantine" },
				{key: "BFIC-HAB7", text: "First settled in %D2 for early experiments at off-world farming.", condition: true },
				{key: "BFIC-HAB8", text: "The natural beauty of %H was obvious to early %I explorers, and it became a highly popular destination for the new interstellar tourism industry.", condition: info.economy.type == "Tourism" },
				{key: "BFIC-HAB9", text: "%H was founded as a %I residential colony in %D2.", condition: true },
				{key: "BFIC-HAB10", text: "The %I were lucky to find %H so close to their homeworld, and rapidly established a small settlement.", condition: info.habitability[info.colony.species[0]] >= 90 },
				{key: "BFIC-HAB11", text: "%S first towns were founded in %D2.", condition: true },
				{key: "BFIC-HAB12", text: "While only marginally habitable, %S position near the home world made it fundamental to initial %I colonisation, and the initial outpost soon grew.", condition: info.colony.stage >= 3 },
				{key: "BFIC-HAB13", text: "The initial colony on %H was founded in %D2, but despite the initial promise of the world, a series of deadly setbacks led to further colonists mostly going elsewhere, and a self-sustaining economy has still not begun.", condition: info.economy.type == "Colonisation" },
				{key: "BFIC-HAB14", text: "%H is home to a wide range of life, and while extremely habitable, settlements have intentionally been kept to a small area to preserve the wilderness.", condition: info.economy.reason == "Wilderness" },
				{key: "BFIC-HAB15", text: "%I settlers first landed on this pleasant world in %D2", condition: true },
				{key: "BFIC-HAB16", text: "Surveys of %U discovered %H in %D2, though despite its desirability the initial settlement did not take place until around ten kD later due to severe %M shortages on the %I homeworld.", condition: info.planet.mineralWealth < 0.25 },
				{key: "BFIC-HAB17", text: "The oceans of %H are detectable by telescope from the %I homeworld, and it was one of the first candidates for a local survey following their invention of the witchdrive.", condition: info.planet.landFraction < 0.25 },
				{key: "BFIC-HAB18", text: "One of the first %I colonies, %H declared independence in %D2 in a dispute over %P.", condition: info.politics.region == 0 },
				{key: "BFIC-HAB19", text: "Initially unsure of how common habitable worlds were, the %I settled marginal worlds such as %H in the early stages of their expansion.", condition: info.habitability[info.colony.species[0]] < 85 },
				{key: "BFIC-HAB20", text: "The %I and %I1 both found this a suitable habitable system, and jointly colonised it in %D2.", condition: info.colony.reason == "Joint Habitability" },
				{key: "BFIC-HAB21", text: "Initially discovered by a %I scout, it was settled by both the %I1 and %I as part of their early treaties.", condition: info.colony.reason == "Joint Habitability" },
				{key: "BFIC-HAB22", text: "The %I1 and %I founded joint colonies like %H after their first contact to encourage cultural exchange.", condition: info.colony.reason == "Joint Habitability" },
				{key: "BFIC-HAB23", text: "With an environment suitable for both %I and %I1, and positioned between their two homeworlds, %H became a joint colony in %D2", condition: info.colony.reason == "Joint Habitability" }
				// more unconditional hab entries needed
			];


			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));
			// TODO: reduce 10
		}
		if (block.text != "") {
			blocks.push(block);
			block = {
				importance: 40,
				displayOrder: 2,
				key: "",
				text: ""
			};
		} else 		if (info.planet.mineralWealth > 0.45) {
//			console.error("Stage 2 mineral colony "+info.g+" "+info.s);
			opts = [
				{key: "BFIC-MIN1", text: "As the demands of witchspace travel increased, %S position near to their homeworld led the %I to establish mining operations here in %D2.", condition: true},
				{key: "BFIC-MIN2", text: "The easily accessible minerals in this system's asteroid belts were key to early colonisation of the chart.", condition: info.economy.type != "Ground Mining" },
				{key: "BFIC-MIN3", text: "As a mineral-rich system, %H gained an outpost in %D2.", condition: true},
				{key: "BFIC-MIN4", text: "Despite the extremely harsh conditions, the %I began mining %S considerable mineral deposits early on. Thousands of early colonists died due to the lack of environmental protection while obtaining the valuable %M ores.", condition: info.habitability.best == 0},
				{key: "BFIC-MIN5", text: "While not an obvious choice for %I colonisation, the concentration of %M deposits in the system made it essential to their early expansion.", condition: info.habitability[info.colony.species[0]] < 80 },
				{key: "BFIC-MIN6", text: "%S rich surface deposits needed little work to extract. While nowadays more conventional deep-mining is needed, when operations started in %D2 they almost doubled the %I's %M production.", condition: info.economy.type != "Asteroid Mining" },
				{key: "BFIC-MIN7", text: "Founded in %D2 as a %M extraction system.", condition: true },
				{key: "BFIC-MIN8", text: "In %H the %I's early colonisation struck both literal and figurative %M, as the planet combined rich deposits with a biosphere survivable without environmental suits", condition: info.habitability[info.colony.species[0]] >= 80 },
				{key: "BFIC-MIN9", text: "%H was a home away from home for the early %I pioneers. Environmentally very similar to their homeworld, the system is also mineral-rich.", condition: info.habitability[info.colony.species[0]] >= 90 },
				{key: "BFIC-MIN10", text: "Mining began here in %D2 to support the %I's expanding space industry.", condition: true },
				{key: "BFIC-MIN11", text: "The original mining operations never lived up to the promises of %S vast mineral wealth, due to the intense radiation from %U.", condition: info.planet.surfaceRadiation > 0.3 },
				{key: "BFIC-MIN12", text: "While the unstable crust brought great deposits of %M to the surface, it made establishing consistent mining difficult.", condition: info.planet.seismicInstability > 0.2 },
				{key: "BFIC-MIN13", text: "Much of %S %M is buried deep beneath the ice caps, but enough was accessible to early settlers that a few mines were operational by %D2", condition: info.planet.percentIce > 0.5 },
				{key: "BFIC-MIN14", text: "The initial outpost was established here in %D2 to assist supply lines and carry out asteroid mining.", condition: info.economy.type != "Ground Mining" },
				{key: "BFIC-MIN15", text: "%H was founded as one of the %I's earliest extraction systems", condition: true },
				{key: "BFIC-MIN16", text: "%H's low gravity and high mineral wealth made it an attractive mining planet", condition: info.planet.surfaceGravity < 0.7 },
				{key: "BFIC-MIN17", text: "After a couple of failed attempts, mining operations began in earnest in %D2.", condition: true },
				{key: "BFIC-MIN18", text: "%H was an early %I mining system.", condition: true },
				{key: "BFIC-MIN19", text: "%M first brought settlers to %H in %D2.", condition: true },
				{key: "BFIC-MIN20", text: "The initial mining outpost was founded in %D2 for %M extraction.", condition: true },
				{key: "BFIC-MIN21", text: "Their shared shortages of %M led to %I and %I1 cooperation in mining %H in %D2", condition: info.colony.reason == "Joint Mining" },
				{key: "BFIC-MIN22", text: "Combining their mining technology allowed the %I1 and %I to rapidly exploit the rich seams of this system.", condition: info.colony.reason == "Joint Mining" },
				{key: "BFIC-MIN23", text: "%I mining operations started here in %D2, with the %I1 joining soon after first contact.", condition: info.colony.reason == "Joint Mining" },
				{key: "BFIC-MIN24", text: "%M mining has been carried out here by both %I and %I1 since %D2.", condition: info.colony.reason == "Joint Mining" },
				{key: "BFIC-MIN25", text: "The first mining operations started in %D2.", condition: true },
				{key: "BFIC-MIN26", text: "The extraction operations started in %D2 still continue in %H.", condition: info.economy.reason == "Extraction" },
				{key: "BFIC-MIN27", text: "The %U system is unusually rich in %M, and was crucial to early %I witchdrive manufacture.", condition: true },
				{key: "BFIC-MIN28", text: "%H is home to one of the earliest %I prospecting habitats.", condition: true },
				{key: "BFIC-MIN29", text: "%H was settled in %D2 for %M extraction.", condition: true }, 
				{key: "BFIC-MIN30", text: "This system was first inhabited by %I miners in %D2", condition: true }
			];
			// TODO: one or two more unconditionals
			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,6,true));
			
		}
		if (block.text != "") {
			blocks.push(block);
			block = {
				importance: 40,
				displayOrder: 2,
				key: "",
				text: ""
			}
		}

		return blocks;
	}

	var blocksForPreGaldriveColony = function(info) {
		var blocks = [];
		var opt, opts;
		var block = {
			importance: 35,
			displayOrder: 3,
			key: "",
			text: ""
		};

		if (info.habitability[info.colony.species[0]] >= 90) {
			opts = [
				{key: "BFPGC-HAB1", text: "The significant increase in operational range as the %I witchdrive programme continued brought many more systems within their reach. %H, in a stable orbit with conditions similar to %O, was settled in %D3.", condition: true },
				{key: "BFPGC-HAB2", text: "%H was one of the earlier %I colonies intended purely for self-sustained habitation, chosen because of its great similarity to %O.", condition: info.habitability[info.colony.species[0]] >= 97 },
				{key: "BFPGC-HAB3", text: "The initial survey of %U missed %H due to equipment failures. It was only after resurveying in %D3 that it was colonised.", condition: true },
				{key: "BFPGC-HAB4", text: "This system was settled pre-unification in %D3.", condition: true },
				{key: "BFPGC-HAB5", text: "%S soil was discovered to be suitable for many %I native flora, and initial farming camps were set up in %D3 to help supply the nearby mining outposts.", condition: info.economy.type == "Farming" },
				{key: "BFPGC-HAB6", text: "The discovery of many habitable planets such as %H led to increasing demands on the early %I witchdrive factories, both for the colonisation ships themselves and the supply lines needed in their early days. Despite its suitability, the system was only colonised in %D3.", condition: true },
				{key: "BFPGC-HAB7", text: "%H was founded in %D3 as a residential colony.", condition: true },
				{key: "BFPGC-HAB8", text: "%H was quarantined shortly after discovery to protect the unusual native life from harm.", condition: info.economy.reason == "Native Life" && info.economy.type == "Quarantine" },
				{key: "BFPGC-HAB9", text: "While easily habitable, the early colony suffered from significant mineral shortages.", condition: info.planet.mineralWealth < 0.1 },
				{key: "BFPGC-HAB10", text: "Known as an exoplanet since pre-witchdrive times, the first explorers to visit %U were surprised to find %H to be habitable. A small colony was founded in %D3.", condition: true },
				{key: "BFPGC-HAB11", text: "Long-range surveys from %O discovered %H in %D2, but it was only in %D3 that it was felt suitable for colonisation.", condition: true },
				{key: "BFPGC-HAB12", text: "The agricultural potential of this system was recognised early on by the %I, who founded a small colony here in %D3.", condition: info.economy.reason == "Agriculture II" },
				{key: "BFPGC-HAB13", text: "This early %I settlement was considered pre-unification to be among one of the most beautiful known worlds.", condition: info.economy.type == "Tourism" },
				{key: "BFPGC-HAB14", text: "The %U system was settled pre-unification by the %I.", condition: true }
			];


			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,6,true));
		}

		if (block.text != "") {
			blocks.push(block);
			block = {
				importance: 35,
				displayOrder: 3,
				key: "",
				text: ""
			};
		}
		else if (info.planet.mineralWealth > 0.45) {
			opts = [
				{key: "BFPGC-MIN1", text: "Advances in miniaturisation and reliably of witchdrives allowed %I miners to reach this system in %D3.", condition: true },
				{key: "BFPGC-MIN2", text: "As %I space expanded, systems such as %H were valuable for their %M reserves.", condition: true },
				{key: "BFPGC-MIN3", text: "The continuing need for more %M to supply expansion led to several colonies being founded in mineral-rich systems. %H was particularly important due to the purity of its deposits.", condition: info.planet.mineralWealth > 0.6 },
				{key: "BFPGC-MIN4", text: "While the planets were considered unremarkable by early %I explorers, the mineral-rich asteroids of the system's %N belt brought thousands of prospectors to the system.", condition: info.economy.type == "Asteroid Mining" },
				{key: "BFPGC-MIN5", text: "As a mineral-rich world with a pleasant environment, %H was settled by the %I shortly after they discovered it in %D3.", condition: info.habitability[info.colony.species[0]] >= 80 },
				{key: "BFPGC-MIN6", text: "%H was originally settled as a mining system in %D3.", condition: true },
				{key: "BFPGC-MIN7", text: "%M mining has been carried out in %H since before unification, with the first operations beginning around %D3.", condition: true },
				{key: "BFPGC-MIN8", text: "The surface of %H contained many accessible metal deposits when it was discovered in %D3.", condition: info.economy.type != "Ground Mining" },
				{key: "BFPGC-MIN9", text: "As %I space expanded, it became more impractical to build all equipment at %O, and %H was founded as an early factory colony.", condition: info.economy.type == "Production" },
				{key: "BFPGC-MIN10", text: "The need for %M led the %I to conduct some exploratory mining in the harsh light of %U, but difficulties in safely extracting the ore meant that the system never made a profit.", condition: info.habitability.best == 0 },
				{key: "BFPGC-MIN11", text: "Combining both a suitable environment and easy mining opportunities, %H was settled in %D3 shortly after the initial surveys.", condition: info.habitability[info.colony.species[0]] >= 80 },
				{key: "BFPGC-MIN12", text: "Founded in %D3 as another of the %I mining systems.", condition: true },
				{key: "BFPGC-MIN13", text: "The development of cheaper and more reliable witchdrives allowed the %I to expand supply lines to new colonies considerably further than before. %H had been surveyed briefly in %D2, but despite significant mineral reserves it was only considered practical to settle in %D3.", condition: true },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));
			// TODO: reduce 10
		}
		if (block.text != "") {
			blocks.push(block);
		}
		block = {
			importance: 25,
			displayOrder: 3,
			key: "",
			text: ""
		};
		if (info.colony.reason == "Waystation") {
			opts = [
				{ key: "BFPGC-WAY1", text: "As %I space expanded, they began a programme of installing orbital stations in nearby otherwise uninhabited systems.", condition: true },
				{ key: "BFPGC-WAY2", text: "Initial habitation in %H was a %I way station installed in %D3 to resupply their widening trade routes. Most of the %I have now left the system.", condition: info.colony.species.length > 1 },
				{ key: "BFPGC-WAY3", text: "A small refuelling outpost was placed here in %D3.", condition: true },
				{ key: "BFPGC-WAY4", text: "Originally founded as a rest stop for convoys between %O and the colonies, %H retains some of that role today.", condition: info.colony.stage == 1 },
				{ key: "BFPGC-WAY5", text: "The original station in this system was destroyed by %A, leaving early convoys vulnerable to accidents. While it was later refounded, the stability of the system never quite recovered.", condition: info.economy.type == "Salvage" && info.colony.attacked == 0 },
				{ key: "BFPGC-WAY6", text: "When the %I first placed a station in orbit around %H to service their colonisation fleet, they had no intention of the system becoming as important as it is now.", condition: info.colony.stage > 3 },
				{ key: "BFPGC-WAY7", text: "%H was not originally considered worthwhile to colonise by the %I. While by %D3 they had not changed their minds, its position close to %O led to the establishment of a small supply depot.", condition: true },
				{ key: "BFPGC-WAY8", text: "A pair of orbital stations were installed in %D3, before being significantly upgraded in %D6 to support increased traffic along this trade route.", condition: info.connected.length == 3 || info.connected.length == 2 },
				{ key: "BFPGC-WAY9", text: "The remote location and undesirable environment made this an ideal place for an early %I research station, although little sign of this remains nowadays.", condition: info.connected.length <= 2 },
				{ key: "BFPGC-WAY10", text: "%H was originally a resupply system for the %I.", condition: true },
				{ key: "BFPGC-WAY11", text: "A small supply depot was established here in %D3.", condition: true },
				{ key: "BFPGC-WAY12", text: "Efficiently managing the expanding %I convoys required the establishment of small orbital platforms around systems near to %O.", condition: true },
				{ key: "BFPGC-WAY13", text: "%H was originally settled in %D3 with an orbital station to assist convoys passing through to more interesting systems.", condition: true },
				{ key: "BFPGC-WAY14", text: "The pre-unification %I colonisation required otherwise undesirable systems such as %H to have orbital stations installed to service the early supply freighters.", condition: true },
				{ key: "BFPGC-WAY15", text: "%S orbital stations date back to %D3 when it was a common stop on the routes to more distant colonies", condition: info.colony.stage == 1 }
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,20,true));
		}
		if (block.text != "") {
			blocks.push(block);
		}

		return blocks;
	}


	var blocksForGaldriveColony = function(info) {
		// the founding of these is covered elsewhere
		if (info.colony.homeWorld || info.colony.embassy) { return []; }
		var blocks = [];
		var opt, opts;
		var block = {
			importance: 45,
			displayOrder: 4,
			key: "",
			text: ""
		};
		// new colonies
		if (info.colony.reason == "Best G3") {
			opts = [
				{ key:"BFGC-BEST1", text: "The USC treaty established eight systems to accompany the capital in this chart. %H was selected for %I habitation.", condition: true },
				{ key:"BFGC-BEST2", text: "One of the eight systems originally intended as a species embassy to the USC, over ten million colonists landed here in %D4 hoping to lead the way in peaceful cooperation.", condition: true },
				{ key:"BFGC-BEST3", text: "%H was the first %I colony in this chart, nominated by the USC treaty due to its superb similarity to %O.", condition: true },
			];
			// TODO: a few more
			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,3,true));

		} else if (info.colony.founded == 4) {
			opts = [
				{ key:"BFGC-NEW1", text: "The discovery of the cross-chart witchspace routes brought many new colonies within reach of the %I, but this form of colonisation was hugely expensive and undertaken only for systems such as %H which had excellent living conditions.", condition: true },
				{ key:"BFGC-NEW2", text: "Early cross-chart colonisation focused on worlds with excellent habitability for the crossing species. %H was founded in %D4 by the %I.", condition: true },
				{ key:"BFGC-NEW3", text: "Cross-chart colonies largely depended on the chart's native species to provide extra supplies. They were generally therefore founded on highly habitable worlds, to reduce the chances of miscommunications being fatal to the new colony.", condition: info.g != 2 },
				{ key:"BFGC-NEW4", text: "In addition to the eight colonies established by treaties, a few other colonies were established in this chart soon after unification. The first %I settlers landed here in %D4.", condition: info.g == 2 },
				{ key:"BFGC-NEW5", text: "While %H initially seemed ideal for the %I, a series of disasters involving the native %C led to the abandoning of the original colony and the world being quarantined in %D4.", condition: info.economy.reason == "Native Life" && info.economy.type == "Quarantine" },
				{ key:"BFGC-NEW6", text: "This was an early unification era colony of the %I, founded in %D4.", condition: true },
				{ key:"BFGC-NEW7", text: "%H orbits perfectly in what the %I consider to be %U's habitable zone, and with the strengthening of supply lines it was colonised in %D4.", condition: true },
				{ key:"BFGC-NEW8", text: "The %M reserves of %H, combined with its pleasant environment, made it an obvious target for unification era colonisation.", condition: info.planet.mineralWealth > 0.45 },
				{ key:"BFGC-NEW9", text: "The first %I settlers landed here in %D4 as part of the early unification era experiments into interspecies cooperation.", condition: true },
				{ key:"BFGC-NEW10", text: "The unification era occasionally led to disputes over colonisation rights. After extensive debate, in %D4 %H was given to the %I.", condition: info.habitability.best == 100 && info.habitability[info.colony.species[0]] < 100 },
			];
			
			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));

		} else {
			// other species' outposts being colonised
			opts = [
				{ key:"BFGC-OLD1", text: "The %I had previously established a small outpost here, which remained in orbit to support trade while the %I1 settled the planet below.", condition: true },
				{ key:"BFGC-OLD2", text: "While the %I had placed an orbital station in this system for strategic reasons, inhabiting the planet itself was never considered, and so the system was ceded to the better-adapted %I1 in %D4.", condition: info.habitability[info.colony.species[0]] < 60 },
				{ key:"BFGC-OLD3", text: "%I1 settlers joined the existing outpost in %D4", condition: true },
				{ key:"BFGC-OLD4", text: "The %I1 began the habitation of %H itself in %D4.", condition: true },
				{ key:"BFGC-OLD5", text: "The existing outpost was supplemented by a %I1 ground station soon after unification.", condition: true },
				{ key:"BFGC-OLD6", text: "Unification brought many more habitable worlds within reach of the %I1. Systems such as %U which already had basic orbital infrastructure were often considered safer to settle.", condition: true },
				{ key:"BFGC-OLD7", text: "The expense of cross-chart witchspace routes meant that the %I1 preferred to settle systems where supply deals could be made with an existing outpost.", condition: true },
				{ key:"BFGC-OLD8", text: "The %I1 began establishing farming communities on the surface of %H in %D4.", condition: info.economy.type == "Farming" },
				{ key:"BFGC-OLD9", text: "Before the post-unification waves of intentional joint colonisation, inter-species cooperation was tested at systems like %U, where the %I1 settlers joined existing stations.", condition: true },
				{ key:"BFGC-OLD10", text: "The excellent habitability of the system led to its selection for %I1 habitation in %D4, though it was several kD later before the necessary agreements with the %I were concluded.", condition: true },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,2,true));
			// this is a very rare case, so try to avoid reusing text
		}
		if (block.text != "") {
			blocks.push(block);
		}

		return blocks;
	}



	/* Returns the description blocks for a system, sorted by
	 * importance */
	descgen.getDescBlocks = function(g,s,p,r,sp) {
		var blocks = [];
		
		var info = {};
		info.g = g;
		info.s = s;
		info.species = sp;
		info.connected = p.get(g,s,"connectedSystems");
		info.colony = p.get(g,s,"colony");
		info.politics = p.get(g,s,"politics");
		info.history = p.get(g,s,"history");		
		info.planet = p.get(g,s,"planet");
		info.name = p.get(g,s,"name");
		info.star = p.get(g,s,"star");
		info.economy = p.get(g,s,"economy");
		info.habitability = p.get(g,s,"habitability");
		info.r = r;

		// 	 ++++ homeworld or equivalent
		if (info.colony.homeWorld == 1) {
			blocks = blocks.concat(blocksForHomeworld(info));
		}
		//  +++ united embassy founded
		else if (info.colony.embassy) {
			blocks = blocks.concat(blocksForEmbassy(info));
		} 
		//  ++ initial-wave colony
		else if (info.name == "Biya's Reach") {
			blocks = blocks.concat(blocksForHomeworld(info));
		}
		else if (info.colony.founded == 2) {
			blocks = blocks.concat(blocksForInitialColony(info));
		}
		//  + pre-galdrive colony
		else if (info.colony.founded == 3) {
			blocks = blocks.concat(blocksForPreGaldriveColony(info));
		}
		//  + galdrive colonisation
		if (historySearch(info.history,"founded",4)) {
			blocks = blocks.concat(blocksForGaldriveColony(info));
		}

		//  +++ first joint colony in chart
		//  ++ early joint colony in chart
		//  + joint colony


		//  +++ first terraformed colony
		//  +++ early terraformed colony
		//  ++ terraformed colony

		//  ++ early colony has 2nd species join
		//  ++ colony founded on 0-0-0 world
		//  ++ reduced to outpost randomly
		//  +++ reduced to outpost randomly more than once
		//  + reduced in level
		//  ++ reduced in level more than once
		//  +++ current level more than two behind peak (except for invasion)
		//  +++ first colony of a species in chart
		// 	 ++ colony has >= 3 species
		//  +++ colony has >= 4 species (and not a United world)
		//  + founded as habitable
		//  + founded as high mineral
		//  + founded as terraformable
		//  ++ founded by outsiders (separate lists by government)
		//  +++ founded by outsiders and expands beyond outpost stage
		//  ++ first colony to reach stage 4 for species
		//  ++ colony reaches stage 5
		//  +++ colony reaches stage 6
		//  +++ colony reaches TL15
		//  ++ stage 5 or 6 colony decreases in level
		//  + colony raided in invasion
		//  ++ colony above stage 3 raided in invasion
		//  +++ colony assaulted or destroyed in invasion
		//  +++ stage 3+ colony gains military base
		//  ++ other colony gains military base
		//  +++ most recent settlement

		// Regional
		//  +++ is regional capital
		//  ++ is regional influential non-capital
		//  +++ is contested system
		//  +++ is independent hub system (not embassy)
		//  ++ has goverment against SPA type
		//  + has government against WPA type
		//  ++ founded by outsiders but now in region
		//  ++ government on one side of contested region
		//  + long distance from any region
		//  ++ independent bottleneck system

		// Government
		//  ++ atypical government
		//  ++ disorder government
		//  +++ stability is critically low
		//  ++ stability is very high
		//  ++ stability is being lowered by nearby region
		//  + government flavour text

		// Economy
		//  +++ quarantine system
		//  +++ native life research system
		//  ++ tourism system
		//  +++ non-habitable tourism system
		//  ++ terraforming eco but non-terraforming type
		//  ++ colonisation eco
		//  ++ productivity > 1E7
		//  ++ productivity/person > 100
		//  ++ research eco
		//  +++ shipyard eco
		//  + economy flavour text

		// Planet/system (importance varies by range)
		//  * radiation levels
		//  * extreme temperatures
		//  ++ ideal habitability
		//  +++ ideal habitability >1 species
		//  * heavy earthquakes
		//  + oceanic world
		//  + land world with atmosphere
		//  ++ outpost-only habitability
		//  ++ hub count 1
		//  + hub count >= 10
		//  + hub count 2, and bottleneck
		//  ++ uninhabited bottleneck



		

		if (blocks.length == 0) {
			blocks.push({
				importance: 0,
				key: "",
				text: "NO DESCRIPTION AVAILABLE",
				displayOrder: 10000
			});
		} else {
			for (var i=0;i<blocks.length;i++) {
				blocks[i].text = expand(info,blocks[i].text);
			}
		}

		blocks.sort(function(a,b) {
			return b.importance - a.importance;
		});
		return blocks;
	}

	/* For each block, increment its usage counter. Blocks with a
	 * usage counter > 10 are removed. */
	descgen.countblocks = function(blocks) {
		for (var i=0;i<blocks.length;i++) {
			if (blocks[i].key != "") {
				useKey(blocks[i].key);
			}
		}
	}

	descgen.debug = function() {
		console.error(usedKeys);
	}

	module.exports = descgen;

}());