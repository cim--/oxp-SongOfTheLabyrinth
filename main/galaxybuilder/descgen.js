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
	var state = { 
		home: {"Human": "Dramani's Hope" }, 
		oneoffs: {}, 
		debugcounter: 0
		// TODO: precedentarchy state has a bug - need separate state for each phase
	};
	var nth = function(idx) {
		return ["first","second","third","fourth","fifth","sixth","seventh","eighth","ninth","tenth"][idx];
	}

	var fleetnth = function(r) {
		return ["First","Second","Third","Fourth","Fifth","Sixth","Seventh","Eighth","Ninth","Tenth","Eleventh","Twelth","Thirteenth","Fourteenth","Fifteenth","Sixteenth"][r.rand(16)];
	}


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
				return history[i];
			}
		}
		return false;
	}

	var expandMinerals = ["Platinum","Rhodium","Gold","Iridium","Osmium","Palladium","Rhenium","Ruthenium","Indium","Tellurium","Bismuth"];
	var expandCreatures = ["fungi","vines","leviathans","creatures","trees","grasses","mammoths","behemoths","plants","animals","predators","swarms","venomous creatures","pollen","burrowers","worms","amoebas","scavengers","beasts","colossi","titans","constrictors","herds"];
	var expandPolitics = ["taxation","funding","economic policy","migration","settlement","mineral rights","trade routes","leadership changes","autonomy","civil rights"];
	var expandAccident = ["an asteroid storm","a reactor explosion","a collision","an unusually severe solar flare","a thruster failure","life-support failures","a coolant leak","a fuel leak","unknown causes","radical saboteurs"];
	var expandGroundAccident = ["a plague","an unexpected earthquake","an asteroid strike","a supply ship crashing","a reactor failure","a radiation leak","civil war","a massive storm","contamination","uncontrolled fires"];
	var expandCity = ["Port","Landing","Harbour","City","Town","Village","Fort","Circle","Farm","Mine","Haven"];
	// government type, biased toward atypical
	var expandGovernment = ["Corporate","Democratic","Hierarchical","Collective","Isolationist","Anarchist","Transapientist","Social Evolutionist","Cultural Reaching","Precedentarchic","Bureaucratic","Variationist"];
	var expandBusiness = ["Consortium","Corporation","Company","Partnership","Syndicate","Conglomerate"];
	var expandWarmonger = ["General","Admiral","Colonel","Marshal","Overlord","Commodore"];
	var expandTribunal = ["Arbitrators","Tribunal","Mediators","Judges","Magistrates","Committee","Inquisition","Commission"];
	var expandResearch = ["engineering","computing","physics","technology","sociology","biology","anthropology","economics","chemistry"];

	var expand = function(info,string) {
//		console.error(info,string);
		string = string.replace(/%S/g,info.name+"'s");
		string = string.replace(/%H/g,info.name);
		string = string.replace(/%UC/g,info.star.name);
		string = string.replace(/%U/g,info.star.name.replace(/ \(.*/,""));
		if (info.colony.species.length > 0) {
			if (info.colony.species.length > 1) {
				if (info.colony.species.length > 2) {
					string = string.replace(/%I2/g,info.species.name(info.colony.species[2]));
				}
				string = string.replace(/%I1/g,info.species.name(info.colony.species[1]));
			}
			string = string.replace(/%I/g,info.species.name(info.colony.species[0]));
			string = string.replace(/%O/g,state.home[info.colony.species[0]]?state.home[info.colony.species[0]]:"their homeworld");
			string = string.replace(/%N/g,info.species.word(info.colony.species[0],info.r));
		}
		string = string.replace(/%M/g,expandMinerals[info.r.rand(expandMinerals.length)]);
		string = string.replace(/%P/g,expandPolitics[info.r.rand(expandPolitics.length)]);
		string = string.replace(/%C/g,expandCreatures[info.r.rand(expandCreatures.length)]);
		string = string.replace(/%AG2/g,expandGroundAccident[info.r.rand(expandGroundAccident.length)]);
		string = string.replace(/%AG/g,expandGroundAccident[info.r.rand(expandGroundAccident.length)]);
		string = string.replace(/%A/g,expandAccident[info.r.rand(expandAccident.length)]);
		string = string.replace(/%Y/g,expandCity[info.r.rand(expandCity.length)]);
		string = string.replace(/%G/g,expandGovernment[info.r.rand(expandGovernment.length)]);
		string = string.replace(/%B/g,expandBusiness[info.r.rand(expandBusiness.length)]);
		string = string.replace(/%W/g,expandWarmonger[info.r.rand(expandWarmonger.length)]);
		string = string.replace(/%T/g,expandTribunal[info.r.rand(expandTribunal.length)]);
		string = string.replace(/%R/g,expandResearch[info.r.rand(expandResearch.length)]);

		// invasion population loss
		string = string.replace(/%L7/g,"one billion");
		string = string.replace(/%L6/g,"hundred million");
		string = string.replace(/%L5/g,"ten million");
		string = string.replace(/%L4/g,"one million");
		string = string.replace(/%L3/g,"hundred thousand");
		string = string.replace(/%L2/g,"ten thousand");
		string = string.replace(/%L1/g,"one thousand");

		// period names
		string = string.replace(/%DE2/g,"early witchdrive");
		string = string.replace(/%DE3/g,"colonisation");
		string = string.replace(/%DE4/g,"pre-unification");
		string = string.replace(/%DE5/g,"unification");
		string = string.replace(/%DE6/g,"post-unification");
		string = string.replace(/%DE7/g,"post-unification");
		string = string.replace(/%DE8/g,"environmental manipulation");
		string = string.replace(/%DE9/g,"consolidation");
		string = string.replace(/%DE10/g,"invasion");
		// initial colonisation
// if needed, has to move below %D10 anyway
//		string = string.replace(/%D1/g,(info.r.rand(10)+140)+" kD");
		string = string.replace(/%D2/g,(info.r.rand(250)+150)+" kD");
		// initial colonisation 2
		string = string.replace(/%D3/g,(info.r.rand(150)+400)+" kD");
		// galdrive phase
		string = string.replace(/%D4/g,(info.r.rand(50)+550)+" kD");
		// cooperative phases
		string = string.replace(/%D5E/g,(info.r.rand(15)+600)+" kD");
		string = string.replace(/%D5/g,(info.r.rand(135)+615)+" kD");
		string = string.replace(/%D6/g,(info.r.rand(100)+750)+" kD");
		string = string.replace(/%D7/g,(info.r.rand(50)+850)+" kD");
		// terraforming phase
		string = string.replace(/%D8E/g,(info.r.rand(15)+895)+" kD");
		string = string.replace(/%D8L/g,(info.r.rand(40)+980)+" kD");
		string = string.replace(/%D8/g,(info.r.rand(100)+910)+" kD");
		// consolidation phase
		string = string.replace(/%D9/g,(info.r.rand(126)+1000)+" kD");
		// invasion phase
		string = string.replace(/%D10E/g,(info.r.rand(3)+1126)+" kD");
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
				block.text = "Dramani's Hope was the most habitable world beyond Biya's Reach the human exile fleet could reach on its remaining fuel. Settled by two of the three surviving colony ships, it has become the new spiritual homeworld despite other Human worlds arguably now being more influential.";
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
				{key: "BFPGC-HAB10", text: "Known as an exoplanet since pre-witchdrive times, the first explorers to visit %U were surprised to find %H to be habitable. A small colony was founded in %D3.", condition: info.g != 1 && info.g != 2 },
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
			} while (!checkKey(block.key,15,true));
			// can probably decrease 15 later somewhat
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
				{ key:"BFGC-NEW6", text: "This was an early unification period colony of the %I, founded in %D4.", condition: true },
				{ key:"BFGC-NEW7", text: "%H orbits perfectly in what the %I consider to be %U's habitable zone, and with the strengthening of supply lines it was colonised in %D4.", condition: true },
				{ key:"BFGC-NEW8", text: "The %M reserves of %H, combined with its pleasant environment, made it an obvious target for unification period colonisation.", condition: info.planet.mineralWealth > 0.45 },
				{ key:"BFGC-NEW9", text: "The first %I settlers landed here in %D4 as part of the early unification period experiments into interspecies cooperation.", condition: true },
				{ key:"BFGC-NEW10", text: "The unification period occasionally led to disputes over colonisation rights. After extensive debate, in %D4 %H was given to the %I.", condition: info.habitability.best == 100 && info.habitability[info.colony.species[0]] < 100 },
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
	};

	var blocksForEarlyUnifiedColony = function(info) {
		var blocks = [];
		var opt, opts;
		var block = {
			importance: 35,
			displayOrder: 5,
			key: "",
			text: ""
		};
		if (info.colony.outsiders == 0) {
			if (checkKey("BFEUC-FIRST"+info.g,0)) {
				// limited set for the first intentionally joint in each chart
				importance = 100;
				block.key = "BFEUC-FIRST"+info.g;
				opts = [
					"The successful cooperation in the early years of unification encouraged the young USC to go further, settling habitable planets cooperatively from the start. %H was the first planet in this chart to be settled this way, with %I, %I1 and other settlers landing in %D5E.",
					"Generally positive initial results of cross-chart colonisation and between the separate settlements on the embassy worlds led the USC to begin a programme of integrated colonisation, selecting worlds highly suitable for two or more species which had not yet been inhabited. In %D5E, the %U system became the first in this chart.",
					"%H is noteworthy for being the first joint settlement in this chart sponsored by the USC, the old "+info.species.name("Bird")+" and "+info.species.name("Frog")+" joint settlements in their native chart being a significant model. The initial landing of 30,000 %I and %I1 settlers took place in %D5E.",
					"In %D5E, %H became the first USC-sponsored joint settlement in the chart. While unlike the other charts the existence of two native species meant that this was less unusual, it was still a key moment of cooperation for the %I, the %I1, and the smaller numbers of settlers from other species."
				];
				var sel = info.r.rand(3);
				if (info.g == 5) { 
					// need this wording for the chart 6 one
					sel = 3;
				}
				block.text = opts[sel];
			} else {
				opts = [
					{ key: "BFEUC-JOINT1", text: "The %I and %I1 jointly colonised this system under the USC cooperation scheme in %D5.", condition: true },
					{ key: "BFEUC-JOINT2", text: "After early trials and successful cooperation on embassy worlds suggested a strong future for multi-species worlds, the %I and %I1 settled on %H in %D5.", condition: true },
					{ key: "BFEUC-JOINT3", text: "Hundreds of new worlds were colonised as part of the USC's multi-species world plans between around 600 kD and around 750 kD. %H had its first settlers land in %D5.", condition: true },
					{ key: "BFEUC-JOINT4", text: "It was unusual for worlds such as %H to go uninhabited as late as %D5, but the intensive settling that occurred in the unification period sometimes led to shortages of both colonists and supplies.", condition: info.habitability.best > 95 },
					{ key: "BFEUC-JOINT5", text: "The %I began setting up small-scale habitats on %H in %D5. A few kD later, they were joined by the %I1.", condition: true },
					{ key: "BFEUC-JOINT6", text: "One of the more ambitious joint settlements of the unification period, the generally superb environment of %H made it a destination for settlers from all species.", condition: info.colony.species.length >= 4 },
					{ key: "BFEUC-JOINT7", text: "%H is regarded as one of the most attractive worlds in the chart, with the initial %I and %I1 settlements being founded to blend in with its natural environment.", condition: info.economy.type == "Tourism" },
					{ key: "BFEUC-JOINT8", text: "Having gained confidence in two-species joint projects, the USC sponsored settlements like %H as a multi-species colony in %D5.", condition: info.colony.species.length >= 3 },
					{ key: "BFEUC-JOINT9", text: "While many systems are now inhabited by significant populations of several species, %U's colonisation was intended that way from the start, with the %I, %I1 and %I2 all landing here within a few days of each other.", condition: info.colony.species.length >= 3 },
					{ key: "BFEUC-JOINT10", text: "%H was settled by the %I and %I1 in %D5.", condition: true },
					{ key: "BFEUC-JOINT11", text: "Detailed biological surveys in %D5 suggested that the environment of %H was particularly suitable for %I1 food production, and they landed here soon after. Supplies of %M soon ran low, however, and a %I transport consortium was dispatched to assist, many of whom joined the original settlers after the crisis was over.", condition: checkKey("BFEUC-JOINT11",0) },
					{ key: "BFEUC-JOINT12", text: "While barely habitable with the pre-terraforming technology available at the time, %H gained a small settlement of both %I and %I1 in %D5, who could at least work unassisted in the planet's environment.", condition: info.habitability.best < 85 },
					{ key: "BFEUC-JOINT13", text: "The %U system was originally jointly colonised by the %I and %I1.", condition: true },
					{ key: "BFEUC-JOINT14", text: "While %H seemed a suitable settlement for %I and %I1 alike, a series of early setbacks meant that it never attracted further migrants before newer systems overtook it.", condition: info.colony.stage == 2 && info.colony.attacked == 0 },
					{ key: "BFEUC-JOINT15", text: "While the %U system had been surveyed several times before %D5, it was only with the new habitation technology provided by the cooperation of scientists across the eight charts that it became practical to inhabit full-time.", condition: true },
					{ key: "BFEUC-JOINT16", text: "After an initial %I settlement in %D4 was abandoned after %A critically damaged its orbital station, they returned in %D5 with %I1 assistance.", condition: true },
					{ key: "BFEUC-JOINT17", text: "The satisfactory environment, combined with easily-accessible %M reserves, helped the initial %I colony to expand. In %D5 they were joined by %I1 settlers attracted to the mining opportunities.", condition: info.planet.mineralWealth > 0.25 },
					{ key: "BFEUC-JOINT18", text: "The high winds of %H posed a challenge to the original %I and %I1 settlers, who lost their first two settlements to hurricanes before successfully founding %N %Y in %D5", condition: info.planet.windFactor >= 0.25 },
					{ key: "BFEUC-JOINT19", text: "%I and %I1 colonists first settled on %H in %D5", condition: true },
					{ key: "BFEUC-JOINT20", text: "The political instability of the %U system was there from the start, when the %I and %I1 colonists founded seven separate cities over disputed %P even before the final colony ships had landed. The USC, monitoring its joint colonisation programme closely, was at least able to note that none of the splits had occurred on species grounds.", condition: info.politics.governmentCategory == "Disordered" },
					{ key: "BFEUC-JOINT21", text: "%H is considered to be within the habitable zone of %U by several species, with the first settlement being by the %I and %I1 around %D5", condition: true }
				];
				

				do {
					do {
						opt = opts[info.r.rand(opts.length)];
						block.key = opt.key;
						block.text = opt.text;
					} while (!opt.condition);
				} while (!checkKey(block.key,15,true));
				// TODO: allow reduction of 15

			}
		} else {
			block.importance = 85;
			// outsiders (~10 systems)
			opts = [
				{ key: "BFEUC-OUT1", text: "Contact was lost with the %H colony in %D5, though scans from orbit revealed the habitat to still be functioning.", condition: info.politics.governmentType == "Isolationist" },
				{ key: "BFEUC-OUT2", text: "In %D5, with the USC managing settlement on the worlds considered suitable for habitation or mining, a group of %I radicals quietly settled the backwater system of %U. By the time they were discovered in %D6, their colony on %H was established. Negotiating with a strictly non-hierarchical group proved difficult, but the USC recognised their rights to the system.", condition: info.politics.governmentType == "Anarchist" },
				{ key: "BFEUC-OUT3", text: "Meeting other species was for many a time for reflection on one's own species. The Transapiest movement started among the %I, and rapidly spread on the fringes of society. In %D5, with planetary governments growing increasingly hostile to their message of remaking the biology and technology of all eight species into a single 'transcendental' species, they bought a small orbital platform and moved it into orbit around %H.", condition: info.politics.governmentType == "Transapientism" },
				{ key: "BFEUC-OUT4", text: "The meeting of species brought many benefits, and considerably widened the debates on which government form was best. In %D5 a small number of researchers and supporters of various sides placed an orbital station around the unwanted planet of %H with the aim of conducting controlled experiements into the matter.", condition: info.politics.governmentType == "Social Evolutionists" },
				{ key: "BFEUC-OUT5", text: "While in modern times the surplus capacity of many planets is reinvested in the production and sharing of cultural artefacts, %H is rare in that it was founded in %D5 with this purpose, largely settled by artists looking for somewhere peaceful to produce their works. The colony had a tough start, but soon their sales began to provide enough money to sustain them.", condition: info.politics.governmentType == "Cultural Reachers" },
				{ key: "BFEUC-OUT6", text: "The settling of a new system was not a decision anyone took lightly, but the settlers of %H were especially cautious, debating for tens of kD whether the previous successful colonisation of worlds by other people meant that they should also do so, until they finally decided to proceed in %D5.", condition: info.politics.governmentType == "Precedentarchy" },
				{ key: "BFEUC-OUT7", text: "Where there is government and power, there will soon be corruption. %H was settled by a group of %I in %D5, who believed that with sufficiently well-drafted rules and well-designed accountability they could avoid this problem.", condition: info.politics.governmentType == "Bureaucracy" },
				{ key: "BFEUC-OUT8", text: "The %U system did not in %D5 contain anything considered particularly important, and so the cobbling together of several small ships and a few freighters into a makeshift orbital station took a while to attract outside attention.", condition: info.politics.governmentType == "Variationist" },
				{ key: "BFEUC-OUT9", text: "An administrative error led to %H being marked for colonisation. As the initial orbital station was moved into position in %D5, it became clear that the supplies for habitat construction were entirely incorrect for the world. A small crew was left onboard the station to maintain it, and after the decision was made that it would be uneconomical to recover the station, some of them stayed.", condition: info.politics.governmentCategory != "Atypical" },
				{ key: "BFEUC-OUT10", text: "Most planetary colonisations in the early unification period were sponsored by one or more homeworld governments, but occasionally independent groups would make a request, and the USC sometimes accepted this for systems not considered economically or strategically important.", condition: info.politics.governmentCategory != "Atypical" },
				{ key: "BFEUC-OUT11", text: "Many groups throughout history have thought that they could do better than their current government. Some have succeeded. Others, like the settlers of %H, did not. In %D5, shortly after founding, their %G government collapsed and never recovered.", condition: info.politics.governmentCategory == "Disordered" && info.colony.attacked == 0 },
				{ key: "BFEUC-OUT12", text: "The %H system was founded by radical settlers in %D5, aiming to run the system along strict %G lines. Despite scepticism from more established governments, the structure survived until the invasion shattered the colony.", condition: info.politics.governmentCategory == "Disordered" && info.colony.attacked >= 1 },
				{ key: "BFEUC-OUT13", text: "The settlers in %D5 originally set up a %G government, but this collapsed after the %N revolution in %D7.", condition: info.politics.governmentCategory == "Disordered" },
				{ key: "BFEUC-OUT14", text: "The settlers of %H were struck with a particularly virulent form of %N plague shortly after landing, and almost all of them died. The survivors were those with a genetic resistance to the plague, and their descendants continue to inhabit the settlement today. With the resistance merely protecting them from the most severe systems, the disease is still endemic and the system is quarantined.", condition: info.politics.governmentType == "Quarantine" },

			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,5,true));
			// TODO: reduce 5
			if (block.key == "BFEUC-OUT6") {
				console.error("Precedent5 is with "+info.name);
				state.precendentarchy5 = info.name;
			}
		}

		if (block.text != "") {
			blocks.push(block);
		}

		return blocks;
	}


	var blocksForEarlyUnifiedJoin = function(info, event) {
		var blocks = [];
		var opt, opts;
		var block = {
			importance: 10,
			displayOrder: 5,
			key: "",
			text: ""
		};
		
		if (info.planet.mineralWealth >= 0.45) {
			opts = [
				{ key: "BFEUJ-MIN1", text: "On the more habitable worlds, colonisation often depends on who can best live there. Mining worlds, however, often have an environment unpleasantly harsh for everyone, and it was not uncommon for other species to begin competing mining operations.", condition: true },
				{ key: "BFEUJ-MIN2", text: "Mining operations have often been on the fringes of society, and an escape for the discontent. A group of "+info.species.name(event.species)+" arrived here to join the existing habitat in %D5.", condition: true },
				{ key: "BFEUJ-MIN3", text: "Additional miners arrived from the "+info.species.name(event.species)+" in %D5.", condition: true },
				{ key: "BFEUJ-MIN4", text: "The discovery of fresh %M deposits led to many more workers heading to the system in %D5.", condition: true },
				{ key: "BFEUJ-MIN5", text: "Increased demand for %M in %D5 was responded to by a "+info.species.name(event.species)+" group also setting up operations.", condition: true },
				{ key: "BFEUJ-MIN6", text: "The inhospitable surface of %H is a great equaliser, and its orbital habitat attracted miners from many species.", condition: info.habitability.best < 10 },
				{ key: "BFEUJ-MIN7", text: "Throughout the early unification period, %U developed a reputation as a mining system welcoming to all species.", condition: info.colony.species.length >= 4 },
				{ key: "BFEUJ-MIN8", text: "Mining stations are often some of the best designed for the diverse needs of all eight anatomies, and the station orbiting %H is considered a fine example of the early unification period.", condition: true },
				{ key: "BFEUJ-MIN9", text: "The %I1 joined the extraction operations here in %D5", condition: info.colony.species.length == 2 },
				{ key: "BFEUJ-MIN10", text: "The colony expanded significantly in %D5 with the construction of several surface habitats.", condition: true },
				{ key: "BFEUJ-MIN11", text: "Asteroid mining in %U picked up significantly in %D5 after a %I1 surveyor discovered additional %M-rich rocks in the system's outer %N belt.", condition: info.economy.type == "Asteroid Mining" },
				{ key: "BFEUJ-MIN12", text: "After a series of accidents in %H's %N mine, "+info.species.name(event.species)+" specialists were brought in to carry out a full refit.", condition: info.economy.type == "Ground Mining" },
				{ key: "BFEUJ-MIN13", text: "The early mining operations at %H were more often than not unsuccessful despite the large %M concentrations. The departure of disillusioned miners and their replacement with new hopefuls throughout the early unification period gave the system its current multi-species demographics.", condition: info.colony.species.length >= 4 },
				{ key: "BFEUJ-MIN14", text: "In %D5, with yields slowly dropping, the "+info.species.name(event.species)+" sponsored the installation of the system's first refinery. The ability to sell low-mass high-value refined products restored the system to profitability.", condition: info.economy.type == "Refining" } 
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,20,true));
			// can probably bring 10 down a bit later
			
		} else {
			if (!state.oneoffs["BFEUJ-JHAB-"+info.g+"-"+info.s]) {
				// only do this once no matter how many species join
				state.oneoffs["BFEUJ-JHAB-"+info.g+"-"+info.s] = 1;
				// join habitable				
				opts = [
					{ key: "BFEUJ-JHAB1", text: "The USC interspecies policy also attracted settlers of other species to existing colonies where they could make use of parts of the environment less attractive to the current inhabitants. A large group of "+info.species.name(event.species)+" settlers landed here in %D5.", condition: true },
					{ key: "BFEUJ-JHAB2", text: "Additional settlers from other species joined the growing colony in %D5.", condition: true },
					{ key: "BFEUJ-JHAB3", text: "While originally a %I colony, %H is even better suited to the "+info.species.name(event.species)+", and in %D5 with the agreement of both species they set up several major cities here.", condition: info.habitability[event.species] == info.habitability.best },
					{ key: "BFEUJ-JHAB4", text: "%H was attractive to the "+info.species.name(event.species)+" and as multi-species colonies became more common in the early unification period, they joined the existing colony.", condition: true },
					{ key: "BFEUJ-JHAB5", text: "The planet's natural beauty attracted visitors even shortly after unification, with some settling permanently.", condition: info.economy.type == "Tourism" },
					{ key: "BFEUJ-JHAB6", text: "The "+info.species.name(event.species)+" joined the colony in %D5.", condition: true },
					{ key: "BFEUJ-JHAB7", text: "With the relatively pleasant environment allowing the colony to stabilise quickly, it grew from both a high birth rate and substantial immigration.", condition: true },
					{ key: "BFEUJ-JHAB8", text: "Joining an established colony was usually safer than starting a new one, even on habitable planets. %H received many additional settlers shortly after unification.", condition: true },
					{ key: "BFEUJ-JHAB9", text: "Taking advantage of the existing supply lines, the "+info.species.name(event.species)+" joined the small colony on %H in %D5, more than doubling the population.", condition: true },
					{ key: "BFEUJ-JHAB10", text: "The superb natural environment of %H attracted colonists from many species to the %U system.", condition: info.habitability.best == 100 },
					{ key: "BFEUJ-JHAB11", text: "In the early unification period, even a long-established colony had a population thousands of times smaller than a homeworld, and massive population growth could sometimes happen overnight, as it did here when hundreds of thousands of "+info.species.name(event.species)+" settlers arrived in %D5.", condition: true },
					{ key: "BFEUJ-JHAB12", text: "%H's population expanded significantly in %D5 with the arrival of additional "+info.species.name(event.species)+" workers.", condition: true }
					/* TODO: maybe some species-specific entries? */
				];

				do {
					do {
						opt = opts[info.r.rand(opts.length)];
						block.key = opt.key;
						block.text = opt.text;
					} while (!opt.condition);
				} while (!checkKey(block.key,10,true));
				// can probably bring 10 down a bit later

			}
		}

		if (block.text != "") {
			blocks.push(block);
		}
		

		return blocks;
	}


	var blocksForMidUnifiedColony = function(info) {
		var blocks = [];
		var opt, opts;
		var block = {
			importance: 35,
			displayOrder: 6,
			key: "",
			text: ""
		};
		if (info.colony.outsiders == 0) {
			opts = [
				{ key: "BFMUC-NEW1", text: "As the USC stabilised, it became more common for new settlements to be founded by groups other than homeworld governments. %H was settled from nearby %I and %I1 colonies in %D6.", condition: true },
				{ key: "BFMUC-NEW2", text: "While the explicit joint colonisation programme was winding down, the USC still looked more favourably on joint applications, and so the %I and %I1 landed here in %D6.", condition: true },
				{ key: "BFMUC-NEW3", text: "The initial settlements on %H were founded in %D6.", condition: true },
				{ key: "BFMUC-NEW4", text: "With both a pleasant environment on %H and reasonably accessible minerals, the %U system was originally planned for colonisation in %D5, but a shortage of supplies led to repeated postponement. The first settlers finally landed in %D6.", condition: info.planet.mineralWealth > 0.25 },
				{ key: "BFMUC-NEW5", text: "An early %I settlement in %D4 failed to prosper and was soon abandoned. With %I1 assistance, they returned in %D6.", condition: true },
				{ key: "BFMUC-NEW6", text: "The %N corporation obtained settlement rights to %H in %D6, with the first ships landing shortly afterwards.", condition: info.politics.governmentCategory == "Corporate" },
				{ key: "BFMUC-NEW7", text: "Disputes over %P on %O led a group of %I settlers to found a "+info.politics.governmentType+" here in %D6, inviting like-minded individuals from other species to join them.", condition: info.politics.governmentCategory == "Democratic" },
				{ key: "BFMUC-NEW8", text: "The charismatic %I leader %N brought hundreds of thousands of followers with him to the %U system in %D6.", condition: info.politics.governmentCategory == "Hierarchical" },
				{ key: "BFMUC-NEW9", text: "As USC policies changed post-unification, it became easier for non-homeworld groups to request settlement rights. A coalition of %I and %I1 workers' movements obtained permission to land on %H in %D6.", condition: info.politics.governmentCategory == "Collective" },
				{ key: "BFMUC-NEW10", text: "%H was settled in %D6 by a group of %I and %I1 dissatisfied with the political structure of their homeworlds.", condition: info.politics.governmentCategory == "Atypical" },
				{ key: "BFMUC-NEW11", text: "The first permanent ground settlement in %U was founded on %H in %D6.", condition: true },
				{ key: "BFMUC-NEW12", text: "A controversial change of leadership on %O in %D6 saw many %I leave the system. %N %Y on %H was founded by some of this group.", condition: true },
				{ key: "BFMUC-NEW13", text: "Several waves of settlers, from the %I, %I1 and others, established independent cities on %H starting in %D6.", condition: info.politics.governmentType == "Fragmented Rule" },
				{ key: "BFMUC-NEW14", text: "One of the last settlements explicitly founded under the joint colonisation programme, %H received %I and %I1 colonists in %D6.", condition: true },
			];
				

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,15,true));
			// TODO: allow reduction of 15
			
			
		} else {
			block.importance = 85;
			// outsiders (~10 systems)
			opts = [
				{ key: "BFMUC-OUT1", text: "Founded in %D6 by a group of %I settlers distrustful of the USC, the inhabitants refuse almost all external communication.", condition: info.politics.governmentType == "Isolationist" },
				{ key: "BFMUC-OUT2", text: "Entirely non-hierarchical ways of running a settlement have been tried on many occasions. %H is one of the few which has continued to do so ever since its founding in %D6.", condition: info.politics.governmentType == "Anarchist" },
				{ key: "BFMUC-OUT3", text: "The increased rate of scientific discovery post-unification led to the %N movement in %D6 establishing orbital stations in %U to experiment with extreme technological advancement of their %I bodies and minds.", condition: info.politics.governmentType == "Transapientism" },
				{ key: "BFMUC-OUT4", text: "The %H settlers rebelled against the authority of %O in %D6, but having achieved independence could not decide on a new government form. As a compromise they agreed to trial and refine many forms, on a strict rotation.", condition: info.politics.governmentType == "Social Evolutionists" },
				{ key: "BFMUC-OUT5", text: "The appearance of %H fascinated the %N, who spent days at a time orbiting and sketching the planet from cheap shuttles. A group of %I entrepreneurs set up a small orbital outpost to sell them supplies in %D6, and the system went on to gain a reputation as an excellent working environment for other artists.", condition: info.politics.governmentType == "Cultural Reachers" },
				{ key: "BFMUC-OUT6A", text: "Following the example of "+state.precedentarchy5+", a Precedentist group placed an orbital station around %H in %D6.", condition: info.politics.governmentType == "Precedentarchy" && state.precdentarchy5 },
				{ key: "BFMUC-OUT6B", text: "The settling of a new system was not a decision anyone took lightly, but the settlers of %H were especially cautious, debating for tens of kD whether the previous successful colonisation of worlds by other people meant that they should also do so, until they finally decided to proceed in %D5.", condition: info.politics.governmentType == "Precedentarchy" && !state.precdentarchy5 },
				{ key: "BFMUC-OUT7", text: "An extremely strong belief in strict adherence to the law led the %N fringe political movement to colonise %H in %D6.", condition: info.politics.governmentType == "Bureaucracy" },
				{ key: "BFMUC-OUT8", text: "The non-conformist Variationist movement began shortly after unification, feeling that the new potential of the eight species was being wasted by an over-regulated USC. In %D6, they established stations around %H, in preparation for establishing ground habitats.", condition: info.politics.governmentType == "Variationist" },
				{ key: "BFMUC-OUT9", text: "Originally founded in %D6 as a %G society, the government was replaced when the system came under the auspices of the "+info.politics.regionName, condition: info.politics.governmentCategory != "Atypical" && info.politics.region != 0 },
				{ key: "BFMUC-OUT10", text: "The original %G government founded in %D6 lasted only "+(12+info.r.rand(23))+" kD before being replaced.", condition: info.politics.governmentCategory != "Atypical" && info.politics.region == 0 },
				{ key: "BFMUC-OUT11", text: "Arguments among the original %I colonists led to %H falling into disorder in %D6, barely after the final colonisation ship had landed.", condition: info.politics.governmentCategory == "Disordered" && info.colony.attacked == 0 },
				{ key: "BFMUC-OUT12", text: "The settlement at %H was originally founded in %D6 by a group of anti-USC radicals.", condition: info.politics.governmentCategory == "Disordered" && info.colony.attacked >= 1 },
				{ key: "BFMUC-OUT13", text: "Fleeing from criminal charges on %O, the %N reached %U in %D6. Despite occasional efforts to remove them, the system has remained under their control since.", condition: info.politics.governmentType == "Criminal Rule" },
				{ key: "BFMUC-OUT14", text: "The %U system had not been approved for settlement due to its inhospitability. After a group of %I reactionaries landed on the surface in %D6, it was placed under formal USC quarantine.", condition: info.politics.governmentType == "Quarantine" },

			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,4,true));
			if (block.key == "BFMUC-OUT6B") {
				console.error("Precedent6 is with "+info.name);
				state.precendentarchy6 = info.name;
			}

		}

		if (block.text != "") {
			blocks.push(block);
		}

		return blocks;
	}


	var blocksForMidUnifiedJoin = function(info, event) {
		var blocks = [];
		var opt, opts;
		var block = {
			importance: 10,
			displayOrder: 6,
			key: "",
			text: ""
		};
		var sn = info.species.name(event.species);		
		if (info.habitability.best >= 70) {
			if (!state.oneoffs["BFMUJ-JHAB-"+info.g+"-"+info.s]) {
				// only do this once no matter how many species join
				state.oneoffs["BFMUJ-JHAB-"+info.g+"-"+info.s] = 1;

				opts = [
					{ key: "BFMUJ-JHAB1", text: "Additional "+sn+" settlers arrived in %D6.", condition: true },
					{ key: "BFMUJ-JHAB2", text: "The popularity of %H continued post-unification, with several major waves of settlers arriving, including hundreds of thousands of "+sn+" in %D6.", condition: true },
					{ key: "BFMUJ-JHAB3", text: "The post-unification period saw significant expansion of the %H cities, with the capital moving to %N %Y in %D6.", condition: true },
					{ key: "BFMUJ-JHAB4", text: "The population of %H increased substantially in %D6, with %I and %I1 remaining the most common species.", condition: true },
					{ key: "BFMUJ-JHAB5", text: "Management of the system passed to the %N %B in %D6, who brought many "+sn+" workers to the system from other worlds.", condition: info.politics.governmentCategory == "Corporate" },
					{ key: "BFMUJ-JHAB6", text: "One of the greatest scandals in %H politics occurred in %D6 when Councillor %N was accused of having brought almost one hundred thousand "+sn+" settlers to the system to flood the Presidential vote. After much deliberation, the case was dismissed, but %N retired from politics before the election.", condition: info.politics.governmentCategory == "Democratic" },
					{ key: "BFMUJ-JHAB7", text: "Inter-system conflict was rare and strongly discouraged by the USC, but the struggling %U system was successfully invaded in %D6 by the rogue %W %N and their "+sn+" mercenaries. Unable to expel them without risking massive loss of civilian life, the USC forces eventually withdrew.", condition: info.politics.governmentCategory == "Hierarchical" },
					{ key: "BFMUJ-JHAB8", text: "The habitability of %H and its collectivist government made it a popular destination for "+sn+" workers, who now make up around a third of the population.", condition: info.politics.governmentCategory == "Collective" },
					{ key: "BFMUJ-JHAB9", text: "The post-unification period saw increased emigration from the homeworlds as interstellar and even inter-chart travel became more affordable. Many arrived on %H shortly after %D6, as its economy transitioned from self-sustaining to being a significant exporter of food to nearby mining systems.", condition: info.economy.reason.match(/Agriculture/) },
					{ key: "BFMUJ-JHAB10", text: sn+" migrants joined the existing population in large numbers in %D6.", condition: true },
					{ key: "BFMUJ-JHAB11", text: "The agreeable environment of %H continued to attract migrants during the post-unification period", condition: true },
					{ key: "BFMUJ-JHAB12", text: "%N %Y was founded in %D6 to meet the needs of the increasing number of "+sn+" settlers.", condition: true },
					{ key: "BFMUJ-JHAB13", text: "The %U system remained a popular destination for migrants during the post-unification period.", condition: true },
					{ key: "BFMUJ-JHAB14", text: "The majority of %S "+sn+" population are descended from a colony ship which was damaged by %A in %D6 and forced to divert to the nearest habitable system.", condition: true },
					{ key: "BFMUJ-JHAB15", text: "Despite %H having a suitable environment, it was only in %D6 that "+sn+" settlers joined the existing population.", condition: info.habitability[event.species] > 90 },
					{ key: "BFMUJ-JHAB16", text: "By %D6 habitation technology had progressed to make %H suitable for all species, and the population increased significantly.", condition: info.habitability.worst > 70 },
					{ key: "BFMUJ-JHAB17", text: "One of the last systems to be part of the USC joint colonisation plans, %H received a steady stream of "+sn+" migrants until %D6.", condition: true }
				];
				
				do {
					do {
						opt = opts[info.r.rand(opts.length)];
						block.key = opt.key;
						block.text = opt.text;
					} while (!opt.condition);
				} while (!checkKey(block.key,10,true));
				// can probably bring 10 down a bit later
			}
		} else {
			// join mining world
			opts = [
				{ key: "BFMUJ-JMIN1", text: "Increased demand for %M led to the temporary expansion of mining operations in %D6.", condition: true },
				{ key: "BFMUJ-JMIN2", text: "An attempt to establish further surface mining bases was made in %D6.", condition: true },
				{ key: "BFMUJ-JMIN3", text: "By %D6, the %U system was home to four major mining platforms.", condition: true },
				{ key: "BFMUJ-JMIN4", text: "Asteroid mining requires little permanent investment in a system, and by %D6, a steady stream of prospectors of all species were arriving, searching the belts, and unless they struck lucky, leaving again.", condition: info.economy.type == "Asteroid Mining" },
				{ key: "BFMUJ-JMIN5", text: "With %M prices rising in %D6, the %N %B brought thousands of "+sn+" workers to the system, turning record profits.", condition: info.politics.governmentType == "Corporate" },
				{ key: "BFMUJ-JMIN6", text: "The post-unification period saw significant growth in the mining operations on and around %H, with new deposits being found faster than the necessary workers could arrive in the system", condition: true },
				{ key: "BFMUJ-JMIN7", text: "The main orbital station was significantly renovated in %D6 to reflect the increasing multi-species nature of the system.", condition: true },
				{ key: "BFMUJ-JMIN8", text: "The radiation levels in %U were considered too high for permanent residence, and so the population experienced rapid turnover throughout the post-unification period.", condition: info.planet.surfaceRadiation > 0.3 },
				{ key: "BFMUJ-JMIN9", text: "Speculation in %M prices lead to many new workers arriving in %D6, hoping for easy riches.", condition: true },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));
			// can probably bring 10 down a bit later

		}

		if (block.text != "") {
			blocks.push(block);
		}
		

		return blocks;
	}


	var blocksForLateUnifiedColony = function(info) {
		var blocks = [];
		var opt, opts;
		var block = {
			importance: 35,
			displayOrder: 7,
			key: "",
			text: ""
		};
		if (info.colony.outsiders == 0) {
			opts = [
				{ key: "BFLUC-NEW1", text: "By %D7, when %H was colonised, there was liitle enthusiasm among the homeworld governments for further expansion as their practical influence over existing colonies waned. Like many of this period, the initial supplies were funded by subscription from the colonists themselves.", condition: true },
				{ key: "BFLUC-NEW2", text: "A joint %I-%I1 expedition settled %H in %D7.", condition: true },
				{ key: "BFLUC-NEW3", text: "Near the end of the post-unification period, homeworld funding for new settlements was extremely low. %H was one of the few systems still settled from %O, as the %I wished to have access to its %M reserves.", condition: info.planet.mineralWealth > 0.25 },
				{ key: "BFLUC-NEW4", text: "Settlers in %D7 were as likely to come from a failing colony to try again as they were to come from their species' homeworld. %H was founded by refugees fleeing collapses of %I and %I1 colonies in the area.", condition: true },
				{ key: "BFLUC-NEW5", text: "The %N %B bought settlement rights to “%N's Retreat” in %D7 as a holiday world for their executives. When they went bankrupt shortly after, the world was transferred by the USC to the habitat construction workers, who renamed it to %H.", condition: info.politics.governmentCategory == "Collective" },
				{ key: "BFLUC-NEW6", text: "%H was claimed for colonisation by the %I as early as %D5, but it was only in %D7 when together with the %I1 they were able to assemble a suitable fleet.", condition: true },
				{ key: "BFLUC-NEW7", text: "Despite the position of this system on key trade routes, surface habitation was only established in %D7, replacing previous ad hoc and undocumented orbital installations.", condition: info.bottle > 0 },
				{ key: "BFLUC-NEW8", text: "The %I and %I1 placed habitats on %S surface in %D7.", condition: true },
				{ key: "BFLUC-NEW9", text: "As colonisation slowed, private funding was often required to assemble a fleet. The %N %B provided the majority of the funding for %S in %D7.", condition: info.politics.governmentCategory == "Corporate" },
				{ key: "BFLUC-NEW10", text: "In %D7, shortly before first landing, one of the supply ships was destroyed by %A. Without the central backing of prior periods, obtaining supplies to finish the job has been a very slow process.", condition: info.economy.type == "Colonisation" },
				{ key: "BFLUC-NEW11", text: "Towards the end of the post-unification period, USC oversight of colonisation requests became extremely lax, and %H was one of many worlds to have multiple conflicting requests accepted. Relationships between the %I and %I1 landing parties were extremely strained when they both arrived here in %D7.", condition: info.politics.governmentCategory == "Disordered" },
				{ key: "BFLUC-NEW12", text: "%H is now all that remains of the former %N Empire. Founded in %D7, it was distant enough to avoid the revolutions which overthrew the dictatorial governments in the rest of the Empire.", condition: info.politics.governmentCategory == "Hierarchical" },
				{ key: "BFLUC-NEW13", text: "%H was settled towards the end of the post-unification period.", condition: true },
			];
				

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,15,true));
			// TODO: allow reduction of 15
			
			
		} else {
			block.importance = 85;
			// outsiders (~10 systems)
			opts = [
				{ key: "BFLUC-OUT1", text: "Little is known of the original settlers who arrived in the %U system around %D7, as they refused to answer any communications at all until %D9.", condition: info.politics.governmentType == "Isolationist" },
				{ key: "BFLUC-OUT2", text: "Protesting against USC support for the homeworlds, the settlers of %H took over the previously uninhabited system in %D7.", condition: info.politics.governmentType == "Anarchist" },
				{ key: "BFLUC-OUT3", text: "Several orbital stations were placed around %H in %D7 to conduct research into artificial intelligence. When the project funding was cut, many of the scientists remained in the system.", condition: info.politics.governmentType == "Transapientism" },
				{ key: "BFLUC-OUT4", text: "The inhabitants of %H have the aim of finding the perfect social structure. They founded the system in %D7 to trial various options on a smaller scale.", condition: info.politics.governmentType == "Social Evolutionists" },
				{ key: "BFLUC-OUT5", text: "The famous %I philanthropist %N provided funding for a small settlement on %H in %D7 as an artists' retreat.", condition: info.politics.governmentType == "Cultural Reachers" },
				{ key: "BFLUC-OUT6", text: "Precedentist governments had previously been set up in sufficient other systems that when the %N Precedentists were founded in %D7, colonising their own planet became the obvious decision.", condition: info.politics.governmentType == "Precedentarchy" },
				{ key: "BFLUC-OUT7", text: "The original orbital installation at %H almost failed entirely due to major disputes between the crew. To keep the peace, in %D7 dispute resolution was given over to the %T who would strictly enforce the colony's laws and regulations.", condition: info.politics.governmentType == "Bureaucracy" },
				{ key: "BFLUC-OUT8", text: "The original colonists of %H believed the pace of progress to be too slow. Their aim in settling was to be somewhere that daily environmental changes were inevitable, in the hope that this would encourage them in making rapid change of other forms.", condition: info.politics.governmentType == "Variationist" },
				{ key: "BFLUC-OUT9", text: "The settlement at %H was founded in %D7 by a small independent group but joined the "+info.politics.regionName+" in %D9.", condition: info.politics.governmentCategory != "Atypical" && info.politics.region != 0 },
				{ key: "BFLUC-OUT10", text: "In the late post-unification period, it became more practical to establish makeshift orbital stations by joining a few freighters. A station of this sort was placed in %H by exiled %I.", condition: info.politics.governmentCategory != "Atypical" && info.politics.region == 0 },
				{ key: "BFLUC-OUT11", text: "The extremely limited order in %U is provided from a small orbital platform placed around %H in %D7.", condition: info.politics.governmentCategory == "Disordered" && info.colony.attacked == 0 },
				{ key: "BFLUC-OUT12", text: "The small independent settlement at %H was founded around %D7, though managed to remain hidden from later surveys. Unfortunately it did not remain hidden during the invasion.", condition: info.politics.governmentCategory == "Disordered" && info.colony.attacked >= 1 },
				{ key: "BFLUC-OUT13", text: "%U's position makes it ideal for criminal operations, which are believed to have been coordinated from here since %D7.", condition: info.politics.governmentType == "Criminal Rule" },
				{ key: "BFLUC-OUT14", text: "%H was exposed to heavy radioactive fallout in %D7 when a new freighter prototype being tested here lost control and exploded in the upper atmosphere. A small USC installation was placed in orbit to monitor the environment and enforce quarantine.", condition: info.politics.governmentType == "Quarantine" },
				{ key: "BFLUC-OUT15", text: "Originally founded as a %G system in %D7, the government was overthrown after mismanagement of supply lines, and the nearby "+info.politics.regionName+" stepped in to restore order.", condition: info.politics.governmentCategory != "Atypical" && info.politics.region != 0 },
				{ key: "BFLUC-OUT16", text: "The station around %H was installed in %D7 to support planned settlements which never occurred. To stop it falling into disrepair, the system was transferred to the "+info.politics.regionName+".", condition: info.politics.governmentCategory != "Atypical" && info.politics.region != 0 },
				{ key: "BFLUC-OUT17", text: "Arguments broke out on the colony ships to %U before they had even reached the system. No stable government was ever formed.", condition: info.politics.governmentCategory == "Disordered" },

			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,3,true));

			if (block.key == "BFLUC-OUT6") {
				console.error("Precedent7 is with "+info.name);
				state.precendentarchy7 = info.name;
			}

		}

		if (block.text != "") {
			blocks.push(block);
		}

		return blocks;
	}


	var blocksForLateUnifiedJoin = function(info, event) {
		var blocks = [];
		var opt, opts;
		var block = {
			importance: 10,
			displayOrder: 7,
			key: "",
			text: ""
		};
		var sn = info.species.name(event.species);		
		if (info.habitability.best >= 70) {
			if (!state.oneoffs["BFLUJ-JHAB-"+info.g+"-"+info.s]) {
				// only do this once no matter how many species join
				state.oneoffs["BFLUJ-JHAB-"+info.g+"-"+info.s] = 1;

				// need ~120
				opts = [
					{ key: "BFLUJ-JHAB1", text: "The settlement on %H continued to expand during the post-unification period.", condition: true },
					{ key: "BFLUJ-JHAB2", text: "The success of %H attracted additional "+sn+" settlers in %D7.", condition: true },
					{ key: "BFLUJ-JHAB3", text: "To make better use of some of %S biomes, many "+sn+" groups were invited to join the colony in %D7.", condition: true },
					{ key: "BFLUJ-JHAB4", text: "Further significant expansion took place in %D7.", condition: true },
					{ key: "BFLUJ-JHAB5", text: "Tens of thousands of "+sn+" refugees were welcomed to %H in %D7.", condition: true },
					{ key: "BFLUJ-JHAB6", text: "A stable environment and government attracted many additional settlers throughout the post-unification period.", condition: info.colony.species.length >= 4 },
					{ key: "BFLUJ-JHAB7", text: "As operating losses increased, ownership of the habitats was taken over by the %N %B in %D7, who moved many of their operations there.", condition: info.politics.governmentCategory == "Corporate" },
					{ key: "BFLUJ-JHAB8", text: "Several major settlements were added during later expansion, with the largest being %N %Y, begun in %D7.", condition: true },
					{ key: "BFLUJ-JHAB9", text: "While there had been a small number of "+sn+" living on %H since the early unification period, and the environment was well suited to them, its distance from their homeworld meant that it was only when other established "+sn+" systems began sending out their own settlers that the population here significantly increased.", condition: info.habitability[event.species] > 90 },
					{ key: "BFLUJ-JHAB10", text: "Having proved that their unconventional form of government could be sustainable, many more sympathisers joined the colony, with construction of %N %Y beginning in %D7 to house the increasing population.", condition: info.politics.governmentCategory == "Atypical" },
					{ key: "BFLUJ-JHAB11", text: "%U system's economically important position attracted many more settlers to the system as inter-system trade networks began to predominate in the late post-unification period.", condition: info.bottle > 0 },
					{ key: "BFLUJ-JHAB12", text: "%H continued to be a popular settlement throughout the late post-unification period.", condition: info.colony.stage >= 3 },
				];
				
				do {
					do {
						opt = opts[info.r.rand(opts.length)];
						block.key = opt.key;
						block.text = opt.text;
					} while (!opt.condition);
				} while (!checkKey(block.key,20,true)); 
				// can probably bring 20 down a bit later
			}
		} else {
			// need ~30

			// join mining world
			opts = [
				{ key: "BFLUJ-JMIN1", text: "Mining operations in %H were further expanded in %D7.", condition: true },
				{ key: "BFLUJ-JMIN2", text: "A decreased demand for %M required diversification into other minerals to keep the operations profitable. "+sn+" consultants were brought in to upgrade equipment and retrain the miners.", condition: true },
				{ key: "BFLUJ-JMIN3", text: "Later surveys discovered extensive %M deposits on %H, and several mining corporations bid for the extraction rights.", condition: info.politics.governmentCategory == "Corporate" },
				{ key: "BFLUJ-JMIN4", text: "The concern of the %H mining operators for worker safety led to slightly reduced profits, but made the system an extremely popular destination for miners.", condition: info.politics.governmentCategory == "Collective" },
				{ key: "BFLUJ-JMIN5", text: "In %D7, rich %M deposits were discovered in the system's outer %N belt, and efforts were made to upgrade the orbital stations to support the fast transports needed to economically exploit them.", condition: info.economy.type == "Asteroid Mining" },
				{ key: "BFLUJ-JMIN6", text: "The extraction of minerals in %H remained profitable, with sufficient surplus being made to upgrade the orbital platforms in %D7.", condition: true },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));
			// can probably bring 10 down a bit later

		}

		if (block.text != "") {
			blocks.push(block);
		}
		

		return blocks;
	}


	var blocksForTerraformingColony = function(info) {
		var blocks = [];
		var opt, opts;
		var block = {
			importance: 75,
			displayOrder: 8,
			key: "",
			text: ""
		};
		if (info.colony.reason == "Terraforming") {
		
			if (checkKey("BTFC-TERRF",0) && info.habitability.best < 70) {
				block.importance = 100;
				block.key = "BTFC-TERRF";
				block.text = "In 887 kD, breakthroughs in environmental manipulation made it possible to inhabit worlds previously considered unusable. The initial trials took place on %H in 895kD, successfully creating an area of several thousand square kilometres in which a conventional habitat could be constructed.";
				state.firstTerr = info.name;
			} else if (checkKey("BTFC-TERRF",3) && info.habitability.best < 70) {
				block.importance = 95;
				block.key = "BTFC-TERRF";
				block.text = "In addition to "+state.firstTerr+", three other worlds were selected for early trials of the new environmental manipulation technology. Operations began on %H in %D8E, and colonists arrived soon after.";
			} else {
				
				opts = [
					{ key: "BFTC-TERR1", text: "After the promising trial results, %H was selected for environmental manipulation in %D8.", condition: info.habitability.best < 70 },
					{ key: "BFTC-TERR2", text: "Environmental manipulation technology was not just trialled to make uninhabitable worlds livable, but to make livable worlds safer. %D8 saw its use on the previously-uninhabited world of %H.", condition: info.habitability.best > 80 },
					{ key: "BFTC-TERR3", text: "Environmental manipulation to make %H habitable as part of the UCS-wide trials began in %D8.", condition: info.habitability.best < 70 },
					{ key: "BFTC-TERR4", text: "%H had been considered for colonisation as early as %D6, but it was only with the environmental manipulation technology available in %D8 that it was considered cost-effective to do so - and then only with the significant subsidies the UCS was offering for trialling the technology.", condition: info.habitability.best >= 70 },
					{ key: "BFTC-TERR5", text: "The trials of environmental manipulation technology were a success, but the great expense of using it meant that plans for further phases were placed on indefinite hold. %H was one of the last systems to be colonised as part of the trial, in %D8L.", condition: true },
					{ key: "BFTC-TERR6", text: "The use of environmental manipulation technology on %H was unusually funded outside of the USC project, in the belief that the technology would eventually pay for itself.", condition: info.politics.governmentCategory == "Corporate" },
					{ key: "BFTC-TERR7", text: "The expense of using environmental manipulators, and a desire to monitor the results long-term before further use, meant that the USC trials were ended shortly after %H was colonised in %D8L", condition: true },
					{ key: "BFTC-TERR8", text: "%H was settled with the assistance of environmental manipulation technology in %D8.", condition: true },
					{ key: "BFTC-TERR9", text: "The use of environmental manipulation technology allowed a wide range of species to colonise %H in %D8.", condition: info.colony.species.length > 3 },
					{ key: "BFTC-TERR10", text: "The risk of environmental manipulation was highlighted in %D8 when %W %N seized control of the manipulation control centre, threatening to shut it down unless the government surrended to them. Their successors continue to rule from the control centre today.", condition: info.politics.governmentCategory == "Hierarchical" },
					{ key: "BFTC-TERR11", text: "The use of environmental manipulation technology in %D8 finally allowed formal residence in the %U system, sweeping aside various informal attempts to control its position on a key trade route.", condition: info.bottle > 0 },
					{ key: "BFTC-TERR12", text: "The %I and %I1 took advantage of the USC trial of environmental manipulation technology to place a small settlement on %H.", condition: info.colony.species.length > 1 },
				];

				do {
					do {
						opt = opts[info.r.rand(opts.length)];
						block.key = opt.key;
						block.text = opt.text;
					} while (!opt.condition);
				} while (!checkKey(block.key,16,true));
			}

		} else if (info.colony.reason == "Mining") {
			block.importance = 25;

			opts = [
				{ key: "BFTC-MIN1", text: "The increased demand for %M resulting from the USC's environmental manipulation trials caused several new mining operations to open, including %H in %D8.", condition: true },
				{ key: "BFTC-MIN2", text: "Routine resurveys of %U discovered high %M concentrations, and extraction began in %D8", condition: true },
				{ key: "BFTC-MIN3", text: "As older mining systems began to exhaust the easily accessible reserves, or rebuilt their economies around refining and production activities, newer mines opened in systems such as %H.", condition: true },
				{ key: "BFTC-MIN4", text: "It was sometimes more cost-effective to open mining operations in a new system than to upgrade existing mines. %H was settled for this reason in %D8.", condition: true },
				{ key: "BFTC-MIN5", text: "The %N %B began extraction in %H in %D8.", condition: info.politics.governmentCategory == "Corporate" },
				{ key: "BFTC-MIN6", text: "In a large empty system such as %U, mineral-rich asteroids can easily be missed by surveys. The excellent %M concentrations in the %N belt were only discovered in %D8.", condition: info.economy.type == "Asteroid Mining" },
				{ key: "BFTC-MIN7", text: "Shortages of %M in %D8 led to the extremely inhospitable %U system gaining a mining station.", condition: info.habitability.best < 10 },
				{ key: "BFTC-MIN8", text: "Several independent mining groups pooled their resources to build a permanent station around %H in %D8.", condition: info.politics.governmentCategory == "Collective" },
				{ key: "BFTC-MIN9", text: "Mining, especially of %M, began on %H in %D8.", condition: info.economy.type != "Asteroid Mining" },
				{ key: "BFTC-MIN10", text: "The USC's environmental manipulation trials were believed at the time to be the start of a new wave of colonisation similar to that of the unification period. Mining began in %H with the hope of supplying the hundreds of new colonies, but fortunately was able to continue profitably even without them.", condition: info.colony.stage > 1 },
				{ key: "BFTC-MIN11", text: "The first permanent mining station was placed in the %U system in %D8.", condition: true },
				{ key: "BFTC-MIN12", text: "%H was settled for its mineral wealth in %D8.", condition: true },
				{ key: "BFTC-MIN13", text: "Market speculation in %D8 caused a chart-wide shortage of %M. The extraction operation at %H was intended to be temporary, but remained profitable and was kept open.", condition: true }
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,6,true));
			
		} else if (info.colony.reason == "Outsiders") { 

			opts = [
				{ key: "BFTC-OUT1", text: "Contact was lost with the %H orbital station shortly after its installation in %D8. Remote investigations revealed that it was still operational and inhabited, but no communications were answered.", condition: info.politics.governmentType == "Isolationist" },
				{ key: "BFTC-OUT2", text: "In %D8, an orbital station was placed around %H in the previously uninhabited %U system by a group of %I anarchists.", condition: info.politics.governmentType == "Anarchist" },
				{ key: "BFTC-OUT3", text: "While most USC scientists watched the environmental manipulation trials with interests, the Transapiest movement continued to focus on manipulating the eight species to better fit the environment, and founded a small settlement on %H in %D8 to continue their research.", condition: info.politics.governmentType == "Transapientism" },
				{ key: "BFTC-OUT4", text: "%U is officially a Social Evolutionist system, but the residents dispute this classification as the frequent changes of government and government style are the result of unplanned revolutions rather than planned experiments. Proposals to add a 'Social Revolutionist' classification for them are currently stalled in USC committees.", condition: info.politics.governmentType == "Social Evolutionists" },
				{ key: "BFTC-OUT5", text: "By %D8 it was not unusual for major systems to be able to generate a sufficient surplus to focus much of it on the production of cultural works. %H station was founded as an offworld retreat for artists in the nearby systems.", condition: info.politics.governmentType == "Cultural Reachers" },
				{ key: "BFTC-OUT6A", text: "Following the example of "+state.precedentarchy5+", the %N Precedentists colonised %H in %D8.", condition: info.politics.governmentType == "Precedentarchy" && state.precedentarchy5 },
				{ key: "BFTC-OUT6B", text: "Following the example of "+state.precedentarchy6+", the %N Precedentists colonised %H in %D8.", condition: info.politics.governmentType == "Precedentarchy" && state.precedentarchy6 },
				{ key: "BFTC-OUT6C", text: "Following the example of "+state.precedentarchy7+", the %N Precedentists colonised %H in %D8.", condition: info.politics.governmentType == "Precedentarchy" && state.precedentarchy7 },
				{ key: "BFTC-OUT6D", text: "Following the example of previous worlds, the %N Precedentists colonised %H in %D8.", condition: info.politics.governmentType == "Precedentarchy" && !state.precedentarchy5 && !state.precedentarchy6 && !state.precedentarchy7 },
				{ key: "BFTC-OUT7", text: "The corporate founders of %H station displayed significant distrust of their employees, and codified almost every aspect of station life in the employee handbook. After the executive board was killed by %A on their transport, control passed entirely to the %T.", condition: info.politics.governmentType == "Bureaucracy" },
				{ key: "BFTC-OUT8", text: "The Variationist movement has been a minor but noteworthy part of society since unification. In %D8, discovering that the differences in system laws would make it illegal for all of their members to gather on any individual system, they placed an orbital station around the uninhabited world of %H to host meetings.", condition: info.politics.governmentType == "Variationist" },
				{ key: "BFTC-OUT9", text: "In %D7, an orbital station was abandoned around %H after being severely damaged in transport by %A. In %D8 it was salvaged and repaired by a group of settlers needing a cheap alternative to buying their own station.", condition: info.politics.governmentCategory != "Atypical" },
				{ key: "BFTC-OUT10", text: "The %U system has been home to a range of inhabitants since around %D8, but no permanent installations appear to have been constructed.", condition: info.politics.governmentCategory == "Disordered" && info.colony.attacked == 0 },
				{ key: "BFTC-OUT11", text: "A small orbital station was placed in orbit around %H in %D8.", condition: info.politics.governmentCategory == "Disordered" && info.colony.attacked >= 1 },
				{ key: "BFTC-OUT12", text: "%H was placed under quarantine in %D8L as a precautionary measure after a surface exploration party following up aerial mineral surveys disappeared without trace. So far investigations into the incident have not been conclusive, and the quarantine remains.", condition: info.politics.governmentType == "Quarantine" },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,6,true));

			if (block.key == "BFLUC-OUT8D") {
				console.error("Precedent8 is with "+info.name);
				state.precendentarchy8 = info.name;
			}

		}


		if (block.text != "") {
			blocks.push(block);
		}
		

		return blocks;
	}


	var blocksForTerraformingJoin = function(info,event) {
		var blocks = [];
		var opt, opts;
		var block = {
			importance: 12,
			displayOrder: 8,
			key: "",
			text: ""
		};

		var sn = info.species.name(event.species);		

		// this is outpost-overwriting only, and rare, so a single
		// options block is probably enough
		opts = [
			{ key: "BFTJ-JOIN1", text: "Additional settlers, especially "+sn+", were attracted to the system in %D8.", condition: true },
			{ key: "BFTJ-JOIN2", text: "Further mining expansion took place in %D8, with attempts to establish permanent ground settlements.", condition: info.planet.mineralWealth > 0.45 },
			{ key: "BFTJ-JOIN3", text: "The existing orbital station at %H made monitoring of environmental modifications more straightforward, and the system was picked for USC trials of the technology in %D8", condition: info.habitability.best > 80 },
			{ key: "BFTJ-JOIN4", text: "%H was selected for environmental modification to make it habitable by "+sn+" in %D8. A small group joined the existing orbital station to observe the process.", condition: info.habitability.best > 60 && info.habitability.best < 70 },
			{ key: "BFTJ-JOIN5", text: "More settlers arrived in %D8.", condition: true },
			{ key: "BFTJ-JOIN6", text: "New %M deposits were discovered in %D8, briefly attracting a rush of miners and prospectors to the system.", condition: info.planet.mineralWealth > 0.45 },
			{ key: "BFTJ-JOIN7", text: "The system was selected for terraforming trials in %D8L, shortly before the programme ended.", condition: info.habitability.best > 60 },
			{ key: "BFTJ-JOIN8", text: "%S small orbital station was renovated and expanded in %D8 in preparation for planned ground settlements.", condition: true },
			{ key: "BFTJ-JOIN9", text: "%H was selected for environmental modification trials in %D8, focusing on thickening the atmosphere to reduce the harsh radiation from %U.", condition: info.planet.surfaceRadiation > 0.4 }
		];
		

		do {
			do {
				opt = opts[info.r.rand(opts.length)];
				block.key = opt.key;
				block.text = opt.text;
			} while (!opt.condition);
		} while (!checkKey(block.key,3,true));


		if (block.text != "") {
			blocks.push(block);
		}
		
		return blocks;
	};

	
	var blocksForConsolidationColony = function(info) {
		var blocks = [];
		var opt, opts;
		var block = {
			importance: 50,
			displayOrder: 9,
			key: "",
			text: ""
		};

		opts = [
			{ key: "BFCC-NEW1", text: "New settlement almost ceased after the end of the environmental modification trials, with most organisations with the wealth to fund a colony waiting to see the impact. %H had a small orbital outpost established in %D9, as an unusual exception.", condition: info.politics.governmentCategory != "Atypical" },
			{ key: "BFCC-NEW2", text: "With official settlement virtually non-existent, a few systems such as %U became 'settled' just through originally temporary outposts becoming permanent.", condition: info.politics.governmentCategory != "Atypical" },
			{ key: "BFCC-NEW3", text: "Minority political movements often went to uninhabited space to try to put their utopias into practice. %H was settled in %D9 by the %N movement.", condition: true },
			{ key: "BFCC-NEW4", text: "A small group of independent ship owners converted freighters into an permanent orbiter in %D9.", condition: true },
			{ key: "BFCC-NEW5", text: "The "+info.politics.governmentType+" government here was set up by %I exiles from %O in %D9.", condition: info.politics.governmentCategory == "Atypical" },
			{ key: "BFCC-NEW6", text: "Discovery of %M deposits led to the establishment of a small mining platform in %D9, hoping to use modern technologies to outcompete the more established systems.", condition: info.planet.mineralWealth > 0.25 },
			{ key: "BFCC-NEW7", text: "The significantly slowing pace of colonisation meant that even attractive worlds such as %H could go uninhabited until %D9.", condition: info.habitability.best > 90 },
			{ key: "BFCC-NEW8", text: "This backwater system had long been home to outcasts and transient visitors, though a permanent settlement did not appear until %D9.", condition: info.politics.region == 0 },
		];


		do {
			do {
				opt = opts[info.r.rand(opts.length)];
				block.key = opt.key;
				block.text = opt.text;
			} while (!opt.condition);
		} while (!checkKey(block.key,3,true));


		if (block.text != "") {
			blocks.push(block);
		}
		
		return blocks;
	};


	var blocksForRefugeeColony = function(info) {
		var blocks = [];
		var opt, opts;
		var block = {
			importance: 80,
			displayOrder: 10,
			key: "",
			text: ""
		};

		opts = [
			{ key: "BFRC-NEW1", text: "Official colonisation was entirely suspended during the invasion, but a group of %I radicals set up a small outpost at %H in %D10.", condition: info.politics.governmentCategory == "Atypical" },
			{ key: "BFRC-NEW2", text: "Refugees fleeing from the invasion ran out of fuel in %U and were forced to stop around %H to await help.", condition: true },
			{ key: "BFRC-NEW3", text: "After a major attack left few survivors, fleeing settlers hid in the %U system in %D10.", condition: true },
			{ key: "BFRC-NEW4", text: "As the invasion intensified, the streams of refugees often found themselves cut off from safety, and forced to hide on planetary surfaces. The makeshift settlement at %H was created in %D10.", condition: true },
			{ key: "BFRC-NEW5", text: "Two evacuation ships were abandoned in the %U system in %D10 after %A damaged them. They were later recovered and converted by smugglers.", condition: true },
			{ key: "BFRC-NEW6", text: "A small refuelling depot at %H became home to tens of thousands of refugees during the invasion.", condition: true },
		];


		do {
			do {
				opt = opts[info.r.rand(opts.length)];
				block.key = opt.key;
				block.text = opt.text;
			} while (!opt.condition);
		} while (!checkKey(block.key,3,true));


		if (block.text != "") {
			blocks.push(block);
		}
		
		return blocks;
	};


	var blocksForStarSystem = function(info) {
		var blocks = [];
		var opt, opts;
		var block = {
			importance: 25,
			displayOrder: 1,
			key: "",
			text: ""
		};
		// these blocks are not limited.

		if (info.star.brightnessIndex !== undefined && info.star.brightnessIndex == 0) {
			opts = [
				{ key: "BFUS-BI1", text: "%UC is the brightest star visible from the "+info.species.name(info.star.brightnessIndexSpecies)+" homeworld.", condition: true },
				{ key: "BFUS-BI2", text: "The luminosity and proximity to their homeworld of the "+info.star.sequence+" %UC made it the brightest star known to prehistoric "+info.species.name(info.star.brightnessIndexSpecies)+" astronomers.", condition: true },
				{ key: "BFUS-BI3", text: "The "+info.species.name(info.star.brightnessIndexSpecies)+" have special regard for %UC as it is the brightest star visible from their homeworld.", condition: true },
			]
		} else if (info.star.constellationIndex !== undefined && info.star.constellationIndex == 0) {
			opts = [
				{ key: "BFUS-CBI1", text: "%U is the brightest star in the traditional "+info.species.name(info.star.constellationIndexSpecies)+" constellation "+info.star.constellation+".", condition: true },
				{ key: "BFUS-CBI2", text: "%UC was one of the most prominent stars in the pre-witchdrive "+info.species.name(info.star.constellationIndexSpecies)+"'s sky.", condition: true },
				{ key: "BFUS-CBI3", text: "%H was known to prehistoric "+info.species.name(info.star.constellationIndexSpecies)+" astronomers who were able to image its orbit around the nearby %U.", condition: true },
			]
		} else if (info.star.brightnessIndex !== undefined && info.star.brightnessIndex < 10) {
			var hpos = info.species.getHomeworld(info.star.brightnessIndexSpecies);
			var hn = info.p.get(hpos[0],hpos[1],"name");
			opts = [
				{ key: "BFUS-BBI1", text: "%UC is one of the brightest stars as seen from the "+info.species.name(info.star.brightnessIndexSpecies)+" homeworld.", condition: true },
				{ key: "BFUS-BBI2", text: "%UC is the "+nth(info.star.brightnessIndex)+" brightest star as seen from "+hn+".", condition: true },
				{ key: "BFUS-BBI3", text: info.species.name(info.star.brightnessIndexSpecies)+" astronomers discovered planets around %UC in prehistoric times.", condition: true }
			];
		} else if (info.g == 2 && info.s == 0 ) { // galpoint
			block.importance = 50;
			opts = [
				{ key: "BFUS-GAL1", text: "%U's central position made it the starting point for the USC's star survey of this chart, with the remainder being added in the order that a combination of telescope observation and local surveys was able to locate their position.", condition: true }
			];

		} else {
			block.importance = 1;
			// nothing much interesting about the star
			opts = [
				{ key: "BFUS-BORING1", text: "%U is a "+info.star.sequence+" star.", condition: true },
				{ key: "BFUS-BORING2", text: "First discovered by astronomers from the Human homeworld, %U's position was later confirmed by local surveys.", condition: info.g==1 },
				{ key: "BFUS-BORING3", text: "First formally surveyed by the USC as they explored the empty third chart.", condition: info.g==2 },
				{ key: "BFUS-BORING4", text: "%H is the most interesting planet orbiting the "+info.star.sequence+" star %U.", condition: true },
				{ key: "BFUS-BORING5", text: "The "+info.star.sequence+" star system %U remains uninhabited.", condition: !info.colony.founded },
				{ key: "BFUS-BORING6", text: "%H orbits %U at a distance of "+info.planet.orbitalRadiusAU+" AU.", condition: true },
			];
		}

		do {
			opt = opts[info.r.rand(opts.length)];
			block.key = opt.key;
			block.text = opt.text;
		} while (!opt.condition);


		if (block.text != "") {
			blocks.push(block);
		}
		
		return blocks;
	}


	var blocksForColonyHistory = function(info) {
		var blocks = [];
		var opt, opts;
		var block = {
			importance: 0,
			displayOrder: 0,
			key: "",
			text: ""
		};
		// type = expanded|reduced, newSize=, historyStep=

		var advs = 0; var reds = 0; var redOuts = 0; var redBils = 0; var peak = 0; var redOutSteps = []; var redBilSteps = []; var peakStep = 0; var bilStep = 0; var advSteps = []; var lastred = 0;
		for (var i=0;i<info.history.length;i++) {
			if (info.history[i].type == "expanded") {
				advs++;
				if (!historySearch(info.history,"founded",info.history[i].historyStep)) {
					// ignore expansions from new settlers for this check
					advSteps.push(info.history[i].historyStep);
				}
				if (peak < info.history[i].newSize) {
					peak = info.history[i].newSize;
					peakStep = info.history[i].historyStep;
				}
				if (info.history[i].newSize == 6) {
					if (bilStep == 0 || bilStep > info.history[i].historyStep) {
						bilStep = info.history[i].historyStep;
					}
				}
			} else if (info.history[i].type == "reduced") {
				reds++;
				lastred = info.history[i].historyStep;
				if (info.history[i].newSize == 1) {
					redOuts++;
					redOutSteps.push(info.history[i].historyStep);
				} else if (info.history[i].newSize >= 5) {
					redBils++;
					redBilSteps.push(info.history[i].historyStep);
				}
			}
		}
		
		if (redOuts > 1) {
			// repeated failures of ground colonies (~40 cases)
			block.importance = 60;
			var opts = [
				{ key: "BFCH-RGCF1", text: "The hostile surface of %H made establishing ground-based settlements difficult, with the surface being entirely abandoned in %D"+redOutSteps[0]+" and %D"+redOutSteps[1]+".", condition: true },
				{ key: "BFCH-RGCF2", text: "The surface settlements have suffered from multiple disasters, and there has been no permanent surface habitation since %D"+redOutSteps[redOutSteps.length-1]+".", condition: info.colony.stage == 1 },
				{ key: "BFCH-RGCF3", text: "The system's population has varied significantly since its founding, with surface settlements being entirely abandoned as people moved on.", condition: true },
				{ key: "BFCH-RGCF4", text: "While permanent ground installations have been tried repeatedly on %H, they have not lasted long. The last, %N %Y, was abandoned in %D"+redOutSteps[redOutSteps.length-1]+".", condition: info.colony.stage == 1 },
				{ key: "BFCH-RGCF5", text: "After %N %Y had to be evacuated in %D"+redOutSteps[0]+" it was some time before ground settlements were re-established, only to be abandoned again in %D"+redOutSteps[1]+".", condition: true },
				{ key: "BFCH-RGCF6", text: "The current small ground settlement, %N %Y is the third on that site. So far it has avoided the fates of its predecessors.", condition: info.colony.stage > 1 },
				{ key: "BFCH-RGCF7", text: "Settling %H itself has been extremely difficult, with most ground stations being lost shortly after their construction.", condition: true },
				{ key: "BFCH-RGCF8", text: "The unstable crust of %H makes permanent settlements difficult. Two have been entirely abandoned after major earthquakes in %D"+redOutSteps[0]+" and %D"+redOutSteps[redOutSteps.length-1]+", though it was possible in both cases to evacuate the workers.", condition: info.planet.seismicInstability > 0.2 },
				{ key: "BFCH-RGCF9", text: "Fluctuating local demand for %M has been reflected in the system's population. Permanent ground stations have been installed at times of high demand, then scrapped as they became unprofitable.", condition: info.planet.mineralWealth > 0.25 },
				{ key: "BFCH-RGCF10", text: "Attempts to mine the surface of %H as well have been tried on several occasions, but the mineral concentrations are not sufficiently high to justify the extra expense.", condition: info.economy.type == "Asteroid Mining" },
				{ key: "BFCG-RGCF11", text: "The %H colony has suffered terrible fortune, with the initial ground settlement being wiped out by %AG in %D"+redOutSteps[0]+". A second attempt lasted little longer, and was abandoned in %D"+redOutSteps[redOutSteps.length-1]+" after being seriously damaged by %AG2.", condition: true }
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
					block.displayOrder = redOutSteps[redOutSteps.length-1];
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));

		} else if (redOuts == 1) {
			// failure of ground colony (~200 cases)
			block.importance = 15;
			
			opts = [
				{ key: "BFCG-GCF1", text: "The first ground settlement on %H was destroyed by %AG in %D"+redOutSteps[0]+".", condition: true },
				{ key: "BFCG-GCF2", text: "In %D"+redOutSteps[0]+" %N %Y was severely damaged by %AG and had to be abandoned.", condition: true },
				{ key: "BFCG-GCF3", text: "There were brief attempts to place permanent habitats on %H, but these ended in %D"+redOutSteps[0]+" after it became clear the system's population was too low to sustain them.", condition: info.colony.stage == 1 },
				{ key: "BFCG-GCF4", text: "An early surface habitat was destroyed in %D"+redOutSteps[0]+" by a severe earthquake despite having been carefully placed hundreds of kilometres from active faults.", condition: info.planet.seismicInstability > 0.2 },
				{ key: "BFCG-GCF5", text: "A severe storm damaged the initial surface settlements, and they were abandoned in %D"+redOutSteps[0]+".", condition: info.planet.windFactor > 0.2 },
				{ key: "BFCG-GCF6", text: "Operations at the surface mines were suspended in %D"+redOutSteps[0]+" after other systems out-competed them for %M production.", condition: info.planet.mineralWealth > 0.45 },
				{ key: "BFCG-GCF7", text: "%N %Y, the original ground station, had to be abandoned in %D"+redOutSteps[0]+" after shielding cracked and the superstructure became irretrievably irradiated.", condition: info.planet.surfaceRadiation > 0.25 },
				{ key: "BFCG-GCF8", text: "Attempts at establishing surface mines on %H failed to be more profitable than asteroid mining and were abandoned in %D"+redOutSteps[0]+".", condition: info.economy.type == "Asteroid Mining" },
				{ key: "BFCG-GCF9", text: "Surface habitation suffered a temporary setback in %D"+redOutSteps[0]+" when %N %Y was damaged by %AG.", condition: info.colony.stage > 1 },
				{ key: "BFCG-GCF10", text: "The first surface settlement was placed without a great understanding of the local %C and was overtaken in %D"+redOutSteps[0]+".", condition: info.habitability.best > 80 },
				{ key: "BFCG-GCF11", text: "Decontaminating %N %Y after a major chemical spill in %D"+redOutSteps[0]+" has so far not been economically viable, and the site remains quarantined.", condition: info.economy.type == "Quarantine" },
				{ key: "BFCG-GCF12", text: "The ground settlements were evacuated in %D8 after an accident involving the unauthorised use of environmental modification technology.", condition: redOutSteps[0] == 8 }
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
					block.displayOrder = redOutSteps[0];
				} while (!opt.condition);
			} while (!checkKey(block.key,40,true));


		} else if (redBils > 0) {
			// won't happen to the same colony as redouts (~5 cases)
			block.importance = 85;
			opts = [
				{ key: "BFCG-BSA1", text: "Billions of people abandoned %H in %D"+redBilSteps[0]+" after rumours that %U had become unstable took hold.", condition: true },
				{ key: "BFCG-BSA2", text: "Over three hundred million died in %D"+redBilSteps[0]+" after %N %Y and much of the surrounding area was devastated by %AG.", condition: true },
				{ key: "BFCG-BSA3", text: "%S population gradually fell during the %DE"+redBilSteps[0]+" period, eventually stabilising at around a fifth of its previous size.", condition: true },
				{ key: "BFCG-BSA4", text: "Violent conflicts beginning in %D"+redBilSteps[0]+" left hundreds of millions dead, and billions fleeing the system as refugees.", condition: true },
				{ key: "BFCG-BSA5", text: "%H is known for experiencing a substantial population drop in the %DE"+redBilSteps[0]+" period. In %D"+(redBilSteps[0]+1)+" it was discovered that the food purification technology was suppressing fertility, and since its replacement the population stabilised.", condition: true }
			];
			
			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
					block.displayOrder = redBilSteps[0];
				} while (!opt.condition);
			} while (!checkKey(block.key,1,true));


		} else if (reds > 2) {
			// repeated setbacks (~25 cases)
			block.importance = 70;
			
			opts = [
				{ key: "BFCG-RSB1", text: "The %H settlement faced repeated setbacks, with many colonists giving up and returning to %O.", condition: true },
				{ key: "BFCG-RSB2", text: "The importance of the %U system has varied considerably, with the population falling as often as rising. Major emigration took place in the %DE"+lastred+" period.", condition: true },
				{ key: "BFCG-RSB3", text: "The loss of %N %Y to %AG in %D"+lastred+" killed tens of thousands and caused many more to leave the system. It was the most severe of a series of disasters which had plagued the colony since its founding.", condition: true },
				{ key: "BFCG-RSB4", text: "The %M deposits of the %U system are large but difficult to access. The population has varied considerably with demand for the metal over the years.", condition: info.planet.mineralWealth > 0.45 },
				{ key: "BFCG-RSB5", text: "Concerns over the impact of the %H colony on the native life have led it to be scaled back on several occasions, most significantly in %D"+lastred+".", condition: info.habitability.best > 90 },
				{ key: "BFCG-RSB6", text: "Falling profits caused the %N %B to transfer most of its workers to other systems for the second time in %D"+lastred+".", condition: info.politics.governmentType == "Corporate" },
				{ key: "BFCG-RSB7", text: "%U has entered an active phase twice during the colony's history, requiring a partial evacuation of the system. The last such event took place in %D"+lastred+".", condition: info.star.instability > 0.3 },
				{ key: "BFCG-RSB8", text: "While %H's great beauty attracts many visitors to view it from orbit, it is not generally regarded as a pleasant place to live. The tourist transports often leave with more passengers than they came with, though the %N incident, when over one hundred thousand %I hijacked a large freighter and fled the system in %D"+lastred+" has not been repeated.", condition: info.economy.type == "Tourism" }
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
					block.displayOrder = lastred;
				} while (!opt.condition);
			} while (!checkKey(block.key,6,true));

		} else if (reds == 1) {
			// setback (~125 cases)
			block.importance = 20;
			opts = [
				{ key: "BFCG-SSB1", text: "The %H settlement was set back in %D"+lastred+" when several cities had to be evacuated after %AG.", condition: true },
				{ key: "BFCG-SSB2", text: "A serious plague spread rapidly through the cramped surroundings of %N %Y in %D"+lastred+". While only a few hundred people died as a result, significant numbers left the system, and very few new settlers arrived until a cure was finally found in %D"+(lastred+1)+".", condition: true },
				{ key: "BFCG-SSB3", text: "The tragic destruction of %N %Y by %AG in %D"+lastred+" killed almost one million colonists, and set the inhabitation of %H back by hundreds of kD.", condition: true },
				{ key: "BFCG-SSB4", text: "Major emigration took place in the %DE"+lastred+" period, as nearby settlements offered better living conditions.", condition: true },
				{ key: "BFCG-SSB5", text: "Nearly forty percent of the system's population left as it became clear that %W %N would win the civil war in %D"+lastred+".", condition: info.politics.governmentType == "Hierarchical" },
				{ key: "BFCG-SSB6", text: "Worlds such as %H which are uninhabitable outside of sealed habitats vary in population with the demand for their products. The low point came in %D"+lastred+" when advances in %R made its key product obsolete almost overnight.", condition: info.habitability.best < 60 },
				{ key: "BFCG-SSB7", text: "Reduced %M yields led to many of the miners moving on to nearby worlds during the %DE"+lastred+" period.", condition: info.planet.mineralWealth > 0.45 },
				{ key: "BFCG-SSB8", text: "%U emitted a series of major solar flares in %D"+lastred+", requiring the orbital stations to be evacuated and surface supplies to be rationed.", condition: info.star.instability > 0.3 },
				{ key: "BFCG-SSB9", text: "To protect the native %C, many smaller settlements were closed during the %DE"+lastred+" period. Many settlers emigrated entirely rather than move to the overcrowded %N %Y.", condition: info.habitability.best > 90 },
				{ key: "BFCG-SSB10", text: "In the %DE"+lastred+" period, %H suffered from a major civil war. Refugees fled the system in their millions, and several major cities quickly fell into ruins.", condition: info.economy.type == "Salvage" },
				{ key: "BFCG-SSB11", text: "A series of weak governments in the %DE"+lastred+" period almost bankrupted the colony, and most of the population were transferred to nearby systems or back to %O.", condition: info.politics.governmentCategory == "Democratic" },
				{ key: "BFCG-SSB12", text: "Fears of a hostile takeover caused many workers to take early retirement and move to more secure systems in %D"+lastred+".", condition: info.politics.governmentCategory == "Corporate" },
				{ key: "BFCG-SSB13", text: "Many settlers failed to adapt to the more basic lifestyle of a colony world and with its population falling the abandonment of %H was considered in %D"+lastred+".", condition: true }
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
					block.displayOrder = lastred;
				} while (!opt.condition);
			} while (!checkKey(block.key,20,true));

		}
		if (block.text != "") {
			blocks.push(block);
			var block = {
				importance: 0,
				displayOrder: 0,
				key: "",
				text: ""
			}
		}
		if (info.colony.stage <= peak-2 && info.attacked == 0) {
			// ~1% or less of peak size (~0 cases)
			console.error("BPeak "+(state.bpeak?++state.bpeak:state.bpeak=1));
			block.importance = 95;
			block.key = "BFCG-NNPL1";
			block.text = "%H was once one of the most promising colonies in the chart, but a series of bad decisions and disasters throughout the %DE"+lastred+" period reduced its population to less than one percent of its peak as colonists gave up and went elsewhere."; 
		}
		if (block.text != "") {
			blocks.push(block);
			var block = {
				importance: 0,
				displayOrder: 0,
				key: "",
				text: ""
			}
		}

		if (bilStep != 0) {
			// reached 1 billion population (~40 cases)
			block.importance = 40;
			opts = [
				{ key: "BFCG-BIL1", text: "%H was popular with settlers and officially passed one billion population in %D"+bilStep+".", condition: true },
				{ key: "BFCG-BIL2", text: "The population exceeded one billion for the first time in %D"+bilStep+".", condition: true },
				{ key: "BFCG-BIL3", text: "Very few worlds manage to reach a population of one billion, with %H doing so during the %DE"+bilStep+" period.", condition: true },
				{ key: "BFCG-BIL4", text: "High mineral wealth and a superb environment made %H rapidly self-sufficient, and the population expanded, reaching one billion in %D"+bilStep+".", condition: info.planet.mineralWealth > 0.45 },
				{ key: "BFCG-BIL5", text: "%S economy prospered during the %DE"+bilStep+" period, with sufficient surplus after feeding the billion inhabitants to produce many great artworks.", condition: info.economy.type == "Cultural" },
				{ key: "BFCG-BIL6", text: "The total population of the %U system reached one billion in %D"+bilStep+".", condition: true },
				{ key: "BFCG-BIL7", text: "While always manageable, it was only with the development of environmental manipulation technology that sufficient living space could be found for %S population to reach one billion.", condition: info.habitability.best < 90 },
			];
			
			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
					block.displayOrder = bilStep;
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));

		}
		if (block.text != "") {
			blocks.push(block);
			var block = {
				importance: 0,
				displayOrder: 0,
				key: "",
				text: ""
			}
		}

		return blocks;
	};


	var blocksForColonyInvasion = function(info) {
		var blocks = [];
		var opt, opts, event;
		var block = {
			importance: 40,
			displayOrder: 10,
			key: "",
			text: ""
		};

		if (info.colony.attacked == 3) {
			// destroyed (~10)
			event = historySearch(info.history,"destroyed",10);

			block.importance = 100;
			opts = [
				{ key: "BFCI-DEST1", text: "The settlements on %H were completely destroyed as the invasion began in 1126 kD, and the %U system was used as a base of operations by the invaders for most of the invasion. Fewer than five thousand were able to escape the destruction.", condition: true },
				{ key: "BFCI-DEST2", text: "The invaders struck at %H in %D10, destroying orbital installations before bombarding the planet. Despite the best efforts of USC forces, most of the evacuation ships were destroyed, and %L"+event.oldSize+" people were killed.", condition: true },
				{ key: "BFCI-DEST3", text: "After responding to a series of hit-and-run attacks left USC defenders in disarray, the invaders struck with full force at %H, overwhelming the USC garrison and wiping out the colony.", condition: true },
				{ key: "BFCI-DEST4", text: "A heroic rearguard action by the USC "+fleetnth(info.r)+" Fleet held off the invaders long enough for the evacuation of the majority of %S %L"+event.oldSize+" inhabitants to succeed. The system then fell under invader control, only being recovered in the final counterstrike in 1141 kD.", condition: true },
				{ key: "BFCI-DEST5", text: "The %M extraction in %U was vital to the USC's defense strategy, and when the invaders assaulted the system destroying all habitats and killing %L"+event.oldSize+" in %D10, the "+fleetnth(info.r)+" Fleet was forced to retreat from the region.", condition: info.planet.mineralWealth > 0.45 },
				{ key: "BFCI-DEST6", text: "A surprise assault by the invaders in %D10 swept aside the local defence forces and killed %L"+event.oldSize+" as they destroyed all surface and orbital installations.", condition: true }
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,2,true));

		} else if (info.colony.attacked == 2) {
			// almost destroyed (~40)
			event = historySearch(info.history,"assaulted",10);
			block.importance = 95;

			opts = [
				{ key: "BFCI-ASS1", text: "The settlements at %H were destroyed in %D10 with the loss of %L"+event.oldSize+" lives. The USC "+fleetnth(info.r)+" Fleet later retook the system, which remains uninhabited except for a small refuelling depot.", condition: true },
				{ key: "BFCI-ASS2", text: "The %U system was the site of some of the toughest fighting of the invasion, with the USC "+fleetnth(info.r)+" Fleet and local forces successfully forcing the invaders to retreat in %D10 without significant damage to the orbital station.", condition: event.oldSize == 1 },
				{ key: "BFCI-ASS3", text: "%L"+event.oldSize+" people were evacuated from the %U system as invasion looked likely. In the end the system was spared, but so far only the orbital stations have been reactivated.", condition: true },
				{ key: "BFCI-ASS4", text: "%H's sole major settlement, %N %Y, was destroyed in a surprise strike by invader bombers who bypassed the well-defended orbital station. Over %L"+event.oldSize+" people died in the bombing.", condition: true },
				{ key: "BFCI-ASS5", text: "The colony on %H was completely wiped out as part of the initial assaults by the invaders in 1126 kD. The current orbital station was established as a USC supply depot when they retook the system in %D10.", condition: true },
				{ key: "BFCI-ASS6", text: "The strategic position of the system meant that it changed hands several times during the invasion. The civilian population was entirely evacuated during the initial assault in %D10.", condition: info.bottle > 0 },
				{ key: "BFCI-ASS7", text: "The majority of the USC "+fleetnth(info.r)+" Fleet was destroyed trying to defend %H from the invaders in %D10. While the orbital station survived with severe damage, over %L"+event.oldSize+" people died in attacks on the surface habitats.", condition: info.economy.type == "Salvage" },
				{ key: "BFCI-ASS8", text: "An invader feint in %D10 caused the USC to divert half of the "+fleetnth(info.r)+" Fleet to evacuating the system. By the time the %L"+event.oldSize+" inhabitants had been taken to safety, it was obvious that the attack would never materialise, but the transports were too urgently needed elsewhere to take them back.", condition: true },
				{ key: "BFCI-ASS9", text: "The initial strikes on %H destroyed the mining stations, leading to severe %M shortages. A basic mining station was re-established as soon as the system was secured by the USC in %D10.", condition: info.planet.mineralWealth > 0.45 },
				{ key: "BFCI-ASS10", text: "The inhabitants of %H had historically avoided contact with the USC, and so they were taken by surprise when the invaders attacked in %D10E kD. Over %L"+event.oldSize+" people were killed or forced to flee before help could arrive.", condition: info.colony.outsiders == 1 },
				{ key: "BFCI-ASS11", text: "The majority of the system population was killed in %D10 as the invaders struck at key systems across the chart.", condition: true }
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,5,true));

		} else {
			// seriously damaged (~175)
			event = historySearch(info.history,"raided",10);
/*
			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,20,true));
*/
		}

		if (block.text != "") {
			blocks.push(block);
			var block = {
				importance: 0,
				displayOrder: 0,
				key: "",
				text: ""
			}
		}

		return blocks;
	};


	/* Returns the description blocks for a system, sorted by
	 * importance */
	descgen.getDescBlocks = function(g,s,p,r,sp) {
		var blocks = [];
		
		var event = null;

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
		info.p = p;
		info.bottle = p.bottleneckType(g,s);

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
		if (info.colony.founded == 5) {
			blocks = blocks.concat(blocksForEarlyUnifiedColony(info));
		}
		//  ++ earlier colony has 2nd species join (stage 5)
		if (event = historySearch(info.history,"joined",5)) {
			blocks = blocks.concat(blocksForEarlyUnifiedJoin(info,event));
		}


		//  + joint colony
		if (info.colony.founded == 6) {
			blocks = blocks.concat(blocksForMidUnifiedColony(info));
		}
		//  ++ earlier colony has 2nd species join (stage 6)
		if (event = historySearch(info.history,"joined",6)) {
			blocks = blocks.concat(blocksForMidUnifiedJoin(info,event));
		}


		//  + joint colony
		if (info.colony.founded == 7) {
			blocks = blocks.concat(blocksForLateUnifiedColony(info));
		}
		//  ++ earlier colony has 2nd species join (stage 7)
		if (event = historySearch(info.history,"joined",7)) {
			blocks = blocks.concat(blocksForLateUnifiedJoin(info,event));
		}


		//  +++ first terraformed colony
		//  +++ early terraformed colony
		//  ++ terraformed colony
		if (info.colony.founded == 8) {
			blocks = blocks.concat(blocksForTerraformingColony(info));
		}
		//  ++ earlier colony has terraforming-era join
		if (event = historySearch(info.history,"joined",8)) {
			blocks = blocks.concat(blocksForTerraformingJoin(info,event));
		}

		// ++ rare outsider colonies
		if (info.colony.founded == 9) {
			blocks = blocks.concat(blocksForConsolidationColony(info));
		}

		// +++ refugees
		if (info.colony.founded == 10) {
			blocks = blocks.concat(blocksForRefugeeColony(info));
		}

		// some of these can be used for inhabited systems too
		blocks = blocks.concat(blocksForStarSystem(info));

		//  ++ reduced to outpost randomly
		//  +++ reduced to outpost randomly more than once
		//  + reduced in level
		//  ++ reduced in level more than once
		//  +++ current level more than two behind peak (except for invasion)
		//  ++ colony reaches stage 5
		//  +++ colony reaches stage 6
		//  ++ stage 5 or 6 colony decreases in level
		if (info.colony.founded > 0) {
			blocks = blocks.concat(blocksForColonyHistory(info));
		}

		//  + colony raided in invasion
		//  ++ colony above stage 3 raided in invasion
		//  +++ colony assaulted or destroyed in invasion
		if (info.colony.attacked > 0) {
			blocks = blocks.concat(blocksForColonyInvasion(info));
		}
		
		//  +++ stage 3+ colony gains military base
		//  ++ other colony gains military base


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