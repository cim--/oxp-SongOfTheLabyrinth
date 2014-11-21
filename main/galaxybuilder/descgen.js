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
		debugcounter: {},
		fleetassign: 0
	};
	var debugcount = function(key) {
		if (!state.debugcounter[key]) {
			state.debugcounter[key] = 0;
		}
		console.error(key+" = "+(++state.debugcounter[key]));
	}
	

	var nth = function(idx) {
		return ["first","second","third","fourth","fifth","sixth","seventh","eighth","ninth","tenth"][idx];
	}

	var fleetns = ["First","Second","Third","Fourth","Fifth","Sixth","Seventh","Eighth","Ninth","Tenth","Eleventh","Twelth","Thirteenth","Fourteenth","Fifteenth","Sixteenth"];
	var fleetnth = function(r) {
		return fleetns[r.rand(16)];
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
	var expandNumber = ["one","two","three","four","five","six","seven","eight","nine"];
	var expandDictator = ["Emperor","Empress","King","Queen","President","Viceroy","General","Admiral","Governor"];
	var expandBridge = ["Gap","Edge","Bridge","Link","Span","Arch","Connection","Transit","Knife","Pass","Cut"];

	var expand = function(info,string) {
//		console.error(info,string);
		string = string.replace(/%S/g,info.name+"'s");
		string = string.replace(/%H/g,info.name);
		string = string.replace(/%UC/g,info.star.name);
		string = string.replace(/%U/g,info.star.name.replace(/ \(.*/,""));

		string = string.replace(/%NB/g,info.names.company);
		string = string.replace(/%ND/g,info.names.dictator);
		string = string.replace(/%NW/g,info.names.warmonger);
		string = string.replace(/%NC/g,info.names.capital);
		string = string.replace(/%NG/g,info.names.gap);

		// some specifics here
		string = string.replace(/%IB/g,info.species.name("Bird"));
		string = string.replace(/%II/g,info.species.name("Insect"));
		string = string.replace(/%IRS/g,info.species.pluralName("Rodent"));
		string = string.replace(/%IR/g,info.species.name("Rodent"));
		if (info.colony.species.length > 0) {
			if (info.colony.species.length > 1) {
				if (info.colony.species.length > 2) {
					string = string.replace(/%I2S/g,info.species.pluralName(info.colony.species[2]));
					string = string.replace(/%I2/g,info.species.name(info.colony.species[2]));
				}
				string = string.replace(/%I1S/g,info.species.pluralName(info.colony.species[1]));
				string = string.replace(/%I1/g,info.species.name(info.colony.species[1]));
			}
			string = string.replace(/%IS/g,info.species.pluralName(info.colony.species[0]));
			string = string.replace(/%I/g,info.species.name(info.colony.species[0]));
			string = string.replace(/%O/g,state.home[info.colony.species[0]]?state.home[info.colony.species[0]]:"their homeworld");
			string = string.replace(/%NN/g,info.species.retrieveName(info.colony.species[0],info.r));
			string = string.replace(/%N/g,info.species.word(info.colony.species[0],info.r));
		}
		string = string.replace(/%B1/g,expandBridge[info.r.rand(expandBridge.length)]);
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
		string = string.replace(/%V/g,expandDictator[info.r.rand(expandDictator.length)]);
		string = string.replace(/%T/g,expandTribunal[info.r.rand(expandTribunal.length)]);
		string = string.replace(/%R/g,expandResearch[info.r.rand(expandResearch.length)]);
		string = string.replace(/%XL/g,expandNumber[Math.floor(expandNumber.length/2)+info.r.rand(Math.floor(expandNumber.length/2))]);
		string = string.replace(/%XS/g,expandNumber[1+info.r.rand(Math.floor(expandNumber.length/2))]);
		string = string.replace(/%X/g,expandNumber[info.r.rand(expandNumber.length)]);
		// invasion population loss
		string = string.replace(/%L7/g,"one billion");
		string = string.replace(/%L6/g,"one billion");
		string = string.replace(/%L5/g,"hundred million");
		string = string.replace(/%L4/g,"ten million");
		string = string.replace(/%L3/g,"one million");
		string = string.replace(/%L2/g,"hundred thousand");
		string = string.replace(/%L1/g,"ten thousand");
		string = string.replace(/%L0/g,"one thousand");

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
		// witchdrive discovery
		string = string.replace(/%D1E/g,(info.r.rand(20)+110)+" kD");
		string = string.replace(/%D1L/g,(info.r.rand(20)+130)+" kD");
		string = string.replace(/%D1/g,(info.r.rand(40)+110)+" kD");

		// fix %X %L1/%L4
		string = string.replace("one ten","ten");
		string = string.replace("two ten","twenty");
		string = string.replace("three ten","thirty");
		string = string.replace("four ten","forty");
		string = string.replace("five ten","fifty");
		string = string.replace("six ten","sixty");
		string = string.replace("seven ten","seventy");
		string = string.replace("eight ten","eighty");
		string = string.replace("nine ten","ninety");
		// fix %X %L3/%L6/%L7
		string = string.replace("one one","one");
		string = string.replace("two one","two");
		string = string.replace("three one","three");
		string = string.replace("four one","four");
		string = string.replace("five one","five");
		string = string.replace("six one","six");
		string = string.replace("seven one","seven");
		string = string.replace("eight one","eight");
		string = string.replace("nine one","nine");

		return string;
	}

	var descgen = {};

	descgen.companyName = function(i,j,p,r,s) {
		var spec = p.get(i,j,"colony").species[0];
		if (!spec) { spec = s.getNative(i,r); }
		var result;
		if (r.randf() < 0.5) {
			result = s.word(spec,r);
		} else {
			result = s.retrieveName(spec,r);
		}
		result += " "+expandBusiness[r.rand(expandBusiness.length)];
		return result;
	};

	descgen.dictatorName = function(i,j,p,r,s) {
		var spec = p.get(i,j,"colony").species[0];
		if (!spec) { spec = s.getNative(i,r); }
		var result;
		result = expandDictator[r.rand(expandDictator.length)];
		result += " "+s.retrieveName(spec,r);
		return result;
	};
	
	descgen.warmongerName = function(i,j,p,r,s) {
		var spec = p.get(i,j,"colony").species[0];
		if (!spec) { spec = s.getNative(i,r); }
		var result;
		result = expandWarmonger[r.rand(expandWarmonger.length)];
		result += " "+s.retrieveName(spec,r);
		return result;
	};

	descgen.capitalcityName = function(i,j,p,r,s) {
		var spec = p.get(i,j,"colony").species[0];
		if (!spec) { spec = s.getNative(i,r); }
		var result;
		if (r.randf() < 0.5) {
			result = s.word(spec,r);
		} else {
			result = s.retrieveName(spec,r);
		}
		result += " "+expandCity[r.rand(expandCity.length)];
		return result;
	};

	descgen.gapName = function(i,j,p,r,s) {
		var spec = p.get(i,j,"colony").species[0];
		var star = p.get(i,j,"star");
		if (!spec) { spec = s.getNative(i,r); }
		var result;
		if (!star.name.match(/\(/)) {
			if (r.randf() < 0.5) {
				result = s.word(spec,r);
			} else {
				result = s.retrieveName(spec,r);
			}
		} else {
			result = star.name.replace(/ \(.*/,"");
		}
		result += " "+expandBridge[r.rand(expandBridge.length)];
		return result;
	};
	

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
				return "%H is the home planet of the "+info.species.pluralName(sp)+".";
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
				return "The "+info.species.pluralName(sp)+" originally developed "+info.species.evolution(sp)+".";
			} else if (checkKey("HSD-Old",2)) {
				useKey("HSD-Old");
				return "Home system of the "+info.species.pluralName(sp)+", the planet "+info.name+" appears from deep archaeological records to have had at least one technological species before them.";
			} else if (checkKey("HSD-Old",3,true)) {
				useKey("HSD-Old");
				return "Homeworld of the "+info.species.pluralName(sp)+", %H orbits the aging %U. Their slow evolution "+info.species.evolution(sp)+" into a technological species occurred without significant environmental damage, and the world is renowned for its natural beauty.";
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
			block.text += " "+info.species.earlyHistory(info.colony.species[0]);
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
				{key: "BFIC-HAB10", text: "The %IS were lucky to find %H so close to their homeworld, and rapidly established a small settlement.", condition: info.habitability[info.colony.species[0]] >= 90 },
				{key: "BFIC-HAB11", text: "%S first towns were founded in %D2.", condition: true },
				{key: "BFIC-HAB12", text: "While only marginally habitable, %S position near the home world made it fundamental to initial %I colonisation, and the initial outpost soon grew.", condition: info.colony.stage >= 3 },
				{key: "BFIC-HAB13", text: "The initial colony on %H was founded in %D2, but despite the initial promise of the world, a series of deadly setbacks led to further colonists mostly going elsewhere, and a self-sustaining economy has still not begun.", condition: info.economy.type == "Colonisation" },
				{key: "BFIC-HAB14", text: "%H is home to a wide range of life, and while extremely habitable, settlements have intentionally been kept to a small area to preserve the wilderness.", condition: info.economy.reason == "Wilderness" },
				{key: "BFIC-HAB15", text: "%I settlers first landed on this pleasant world in %D2", condition: true },
				{key: "BFIC-HAB16", text: "Surveys of %U discovered %H in %D2, though despite its desirability the initial settlement did not take place until around ten kD later due to severe %M shortages on the %I homeworld.", condition: info.planet.mineralWealth < 0.25 },
				{key: "BFIC-HAB17", text: "The oceans of %H are detectable by telescope from the %I homeworld, and it was one of the first candidates for a local survey following their invention of the witchdrive.", condition: info.planet.landFraction < 0.25 },
				{key: "BFIC-HAB18", text: "One of the first %I colonies, %H declared independence in %D2 in a dispute over %P.", condition: info.politics.region == 0 },
				{key: "BFIC-HAB19", text: "Initially unsure of how common habitable worlds were, %IS settled marginal worlds such as %H in the early stages of their expansion.", condition: info.habitability[info.colony.species[0]] < 85 },
				{key: "BFIC-HAB20", text: "%IS and %I1S both found this a suitable habitable system, and jointly colonised it in %D2.", condition: info.colony.reason == "Joint Habitability" },
				{key: "BFIC-HAB21", text: "Initially discovered by a %I scout, it was settled by both %I1S and %IS as part of their early treaties.", condition: info.colony.reason == "Joint Habitability" },
				{key: "BFIC-HAB22", text: "%I1S and %IS founded joint colonies like %H after their first contact to encourage cultural exchange.", condition: info.colony.reason == "Joint Habitability" },
				{key: "BFIC-HAB23", text: "With an environment suitable for both %IS and %I1S, and positioned between their two homeworlds, %H became a joint colony in %D2", condition: info.colony.reason == "Joint Habitability" }
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
				{key: "BFIC-MIN1", text: "As the demands of witchspace travel increased, %S position near to their homeworld led %IS to establish mining operations here in %D2.", condition: true},
				{key: "BFIC-MIN2", text: "The easily accessible minerals in this system's asteroid belts were key to early colonisation of the chart.", condition: info.economy.type != "Ground Mining" },
				{key: "BFIC-MIN3", text: "As a mineral-rich system, %H gained an outpost in %D2.", condition: true},
				{key: "BFIC-MIN4", text: "Despite the extremely harsh conditions, %IS began mining %S considerable mineral deposits early on. Thousands of early colonists died due to the lack of environmental protection while obtaining the valuable %M ores.", condition: info.habitability.best == 0},
				{key: "BFIC-MIN5", text: "While not an obvious choice for %I colonisation, the concentration of %M deposits in the system made it essential to their early expansion.", condition: info.habitability[info.colony.species[0]] < 80 },
				{key: "BFIC-MIN6", text: "%S rich surface deposits needed little work to extract. While nowadays more conventional deep-mining is needed, when operations started in %D2 they almost doubled the %IS's %M production.", condition: info.economy.type != "Asteroid Mining" },
				{key: "BFIC-MIN7", text: "Founded in %D2 as a %M extraction system.", condition: true },
				{key: "BFIC-MIN8", text: "In %H the %IS's early colonisation struck both literal and figurative %M, as the planet combined rich deposits with a biosphere survivable without environmental suits", condition: info.habitability[info.colony.species[0]] >= 80 },
				{key: "BFIC-MIN9", text: "%H was a home away from home for the early %I pioneers. Environmentally very similar to their homeworld, the system is also mineral-rich.", condition: info.habitability[info.colony.species[0]] >= 90 },
				{key: "BFIC-MIN10", text: "Mining began here in %D2 to support the %IS's expanding space industry.", condition: true },
				{key: "BFIC-MIN11", text: "The original mining operations never lived up to the promises of %S vast mineral wealth, due to the intense radiation from %U.", condition: info.planet.surfaceRadiation > 0.3 },
				{key: "BFIC-MIN12", text: "While the unstable crust brought great deposits of %M to the surface, it made establishing consistent mining difficult.", condition: info.planet.seismicInstability > 0.2 },
				{key: "BFIC-MIN13", text: "Much of %S %M is buried deep beneath the ice caps, but enough was accessible to early settlers that a few mines were operational by %D2", condition: info.planet.percentIce > 0.5 },
				{key: "BFIC-MIN14", text: "The initial outpost was established here in %D2 to assist supply lines and carry out asteroid mining.", condition: info.economy.type != "Ground Mining" },
				{key: "BFIC-MIN15", text: "%H was founded as one of the %IS's earliest extraction systems", condition: true },
				{key: "BFIC-MIN16", text: "%H's low gravity and high mineral wealth made it an attractive mining planet", condition: info.planet.surfaceGravity < 0.7 },
				{key: "BFIC-MIN17", text: "After a couple of failed attempts, mining operations began in earnest in %D2.", condition: true },
				{key: "BFIC-MIN18", text: "%H was an early %I mining system.", condition: true },
				{key: "BFIC-MIN19", text: "%M first brought settlers to %H in %D2.", condition: true },
				{key: "BFIC-MIN20", text: "The initial mining outpost was founded in %D2 for %M extraction.", condition: true },
				{key: "BFIC-MIN21", text: "Their shared shortages of %M led to %I and %I1 cooperation in mining %H in %D2", condition: info.colony.reason == "Joint Mining" },
				{key: "BFIC-MIN22", text: "Combining their mining technology allowed %I1S and %IS to rapidly exploit the rich seams of this system.", condition: info.colony.reason == "Joint Mining" },
				{key: "BFIC-MIN23", text: "%I mining operations started here in %D2, with %I1S joining soon after first contact.", condition: info.colony.reason == "Joint Mining" },
				{key: "BFIC-MIN24", text: "%M mining has been carried out here by both %IS and %I1S since %D2.", condition: info.colony.reason == "Joint Mining" },
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
				{key: "BFPGC-HAB12", text: "The agricultural potential of this system was recognised early on by %IS, who founded a small colony here in %D3.", condition: info.economy.reason == "Agriculture II" },
				{key: "BFPGC-HAB13", text: "This early %I settlement was considered pre-unification to be among one of the most beautiful known worlds.", condition: info.economy.type == "Tourism" },
				{key: "BFPGC-HAB14", text: "The %U system was settled pre-unification by %IS.", condition: true }
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
				{key: "BFPGC-MIN5", text: "As a mineral-rich world with a pleasant environment, %H was settled by %IS shortly after they discovered it in %D3.", condition: info.habitability[info.colony.species[0]] >= 80 },
				{key: "BFPGC-MIN6", text: "%H was originally settled as a mining system in %D3.", condition: true },
				{key: "BFPGC-MIN7", text: "%M mining has been carried out in %H since before unification, with the first operations beginning around %D3.", condition: true },
				{key: "BFPGC-MIN8", text: "The surface of %H contained many accessible metal deposits when it was discovered in %D3.", condition: info.economy.type != "Ground Mining" },
				{key: "BFPGC-MIN9", text: "As %I space expanded, it became more impractical to build all equipment at %O, and %H was founded as an early factory colony.", condition: info.economy.type == "Production" },
				{key: "BFPGC-MIN10", text: "The need for %M led %IS to conduct some exploratory mining in the harsh light of %U, but difficulties in safely extracting the ore meant that the system never made a profit.", condition: info.habitability.best == 0 },
				{key: "BFPGC-MIN11", text: "Combining both a suitable environment and easy mining opportunities, %H was settled in %D3 shortly after the initial surveys.", condition: info.habitability[info.colony.species[0]] >= 80 },
				{key: "BFPGC-MIN12", text: "Founded in %D3 as another of the %I mining systems.", condition: true },
				{key: "BFPGC-MIN13", text: "The development of cheaper and more reliable witchdrives allowed %IS to expand supply lines to new colonies considerably further than before. %H had been surveyed briefly in %D2, but despite significant mineral reserves it was only considered practical to settle in %D3.", condition: true },
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
				{ key: "BFPGC-WAY2", text: "Initial habitation in %H was a %I way station installed in %D3 to resupply their widening trade routes. Most of the %IS have now left the system.", condition: info.colony.species.length > 1 },
				{ key: "BFPGC-WAY3", text: "A small refuelling outpost was placed here in %D3.", condition: true },
				{ key: "BFPGC-WAY4", text: "Originally founded as a rest stop for convoys between %O and the colonies, %H retains some of that role today.", condition: info.colony.stage == 1 },
				{ key: "BFPGC-WAY5", text: "The original station in this system was destroyed by %A, leaving early convoys vulnerable to accidents. While it was later refounded, the stability of the system never quite recovered.", condition: info.economy.type == "Salvage" && info.colony.attacked == 0 },
				{ key: "BFPGC-WAY6", text: "When %IS first placed a station in orbit around %H to service their colonisation fleet, they had no intention of the system becoming as important as it is now.", condition: info.colony.stage > 3 },
				{ key: "BFPGC-WAY7", text: "%H was not originally considered worthwhile to colonise by the %IS. While by %D3 they had not changed their minds, its position close to %O led to the establishment of a small supply depot.", condition: true },
				{ key: "BFPGC-WAY8", text: "A pair of orbital stations were installed in %D3, before being significantly upgraded in %D6 to support increased traffic along this trade route.", condition: info.connected.length == 3 || info.connected.length == 2 },
				{ key: "BFPGC-WAY9", text: "The remote location and undesirable environment made this an ideal place for an early %I research station, although little sign of this remains nowadays.", condition: info.connected.length <= 2 },
				{ key: "BFPGC-WAY10", text: "%H was originally a resupply system for the %IS.", condition: true },
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
				{ key:"BFGC-NEW1", text: "The discovery of the cross-chart witchspace routes brought many new colonies within reach of %IS, but this form of colonisation was hugely expensive and undertaken only for systems such as %H which had excellent living conditions.", condition: true },
				{ key:"BFGC-NEW2", text: "Early cross-chart colonisation focused on worlds with excellent habitability for the crossing species. %H was founded in %D4 by %IS.", condition: true },
				{ key:"BFGC-NEW3", text: "Cross-chart colonies largely depended on the chart's native species to provide extra supplies. They were generally therefore founded on highly habitable worlds, to reduce the chances of miscommunications being fatal to the new colony.", condition: info.g != 2 },
				{ key:"BFGC-NEW4", text: "In addition to the eight colonies established by treaties, a few other colonies were established in this chart soon after unification. The first %I settlers landed here in %D4.", condition: info.g == 2 },
				{ key:"BFGC-NEW5", text: "While %H initially seemed ideal for %IS, a series of disasters involving the native %C led to the abandoning of the original colony and the world being quarantined in %D4.", condition: info.economy.reason == "Native Life" && info.economy.type == "Quarantine" },
				{ key:"BFGC-NEW6", text: "This was an early unification period colony of the %IS, founded in %D4.", condition: true },
				{ key:"BFGC-NEW7", text: "%H orbits perfectly in what %IS consider to be %U's habitable zone, and with the strengthening of supply lines it was colonised in %D4.", condition: true },
				{ key:"BFGC-NEW8", text: "The %M reserves of %H, combined with its pleasant environment, made it an obvious target for unification period colonisation.", condition: info.planet.mineralWealth > 0.45 },
				{ key:"BFGC-NEW9", text: "The first %I settlers landed here in %D4 as part of the early unification period experiments into interspecies cooperation.", condition: true },
				{ key:"BFGC-NEW10", text: "The unification period occasionally led to disputes over colonisation rights. After extensive debate, in %D4 %H was given to the %IS.", condition: info.habitability.best == 100 && info.habitability[info.colony.species[0]] < 100 },
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
				{ key:"BFGC-OLD1", text: "%IS had previously established a small outpost here, which remained in orbit to support trade while %I1S settled the planet below.", condition: true },
				{ key:"BFGC-OLD2", text: "While %IS had placed an orbital station in this system for strategic reasons, inhabiting the planet itself was never considered, and so the system was ceded to the better-adapted %I1S in %D4.", condition: info.habitability[info.colony.species[0]] < 60 },
				{ key:"BFGC-OLD3", text: "%I1 settlers joined the existing outpost in %D4", condition: true },
				{ key:"BFGC-OLD4", text: "%I1S began the habitation of %H itself in %D4.", condition: true },
				{ key:"BFGC-OLD5", text: "The existing outpost was supplemented by a %I1 ground station soon after unification.", condition: true },
				{ key:"BFGC-OLD6", text: "Unification brought many more habitable worlds within reach of %I1S. Systems such as %U which already had basic orbital infrastructure were often considered safer to settle.", condition: true },
				{ key:"BFGC-OLD7", text: "The expense of cross-chart witchspace routes meant that %I1S preferred to settle systems where supply deals could be made with an existing outpost.", condition: true },
				{ key:"BFGC-OLD8", text: "%I1S began establishing farming communities on the surface of %H in %D4.", condition: info.economy.type == "Farming" },
				{ key:"BFGC-OLD9", text: "Before the post-unification waves of intentional joint colonisation, inter-species cooperation was tested at systems like %U, where the %I1 settlers joined existing stations.", condition: true },
				{ key:"BFGC-OLD10", text: "The excellent habitability of the system led to its selection for %I1 habitation in %D4, though it was several kD later before the necessary agreements with the %IS were concluded.", condition: true },
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
					"In %D5E, %H became the first USC-sponsored joint settlement in the chart. While unlike the other charts the existence of two native species meant that this was less unusual, it was still a key moment of cooperation for %IS, %I1S, and the smaller numbers of settlers from other species."
				];
				var sel = info.r.rand(3);
				if (info.g == 5) { 
					// need this wording for the chart 6 one
					sel = 3;
				}
				block.text = opts[sel];
			} else {
				opts = [
					{ key: "BFEUC-JOINT1", text: "%IS and %I1S jointly colonised this system under the USC cooperation scheme in %D5.", condition: true },
					{ key: "BFEUC-JOINT2", text: "After early trials and successful cooperation on embassy worlds suggested a strong future for multi-species worlds, %IS and %I1S settled on %H in %D5.", condition: true },
					{ key: "BFEUC-JOINT3", text: "Hundreds of new worlds were colonised as part of the USC's multi-species world plans between around 600 kD and around 750 kD. %H had its first settlers land in %D5.", condition: true },
					{ key: "BFEUC-JOINT4", text: "It was unusual for worlds such as %H to go uninhabited as late as %D5, but the intensive settling that occurred in the unification period sometimes led to shortages of both colonists and supplies.", condition: info.habitability.best > 95 },
					{ key: "BFEUC-JOINT5", text: "%IS began setting up small-scale habitats on %H in %D5. A few kD later, they were joined by %I1S.", condition: true },
					{ key: "BFEUC-JOINT6", text: "One of the more ambitious joint settlements of the unification period, the generally superb environment of %H made it a destination for settlers from all species.", condition: info.colony.species.length >= 4 },
					{ key: "BFEUC-JOINT7", text: "%H is regarded as one of the most attractive worlds in the chart, with the initial %I and %I1 settlements being founded to blend in with its natural environment.", condition: info.economy.type == "Tourism" },
					{ key: "BFEUC-JOINT8", text: "Having gained confidence in two-species joint projects, the USC sponsored settlements like %H as a multi-species colony in %D5.", condition: info.colony.species.length >= 3 },
					{ key: "BFEUC-JOINT9", text: "While many systems are now inhabited by significant populations of several species, %U's colonisation was intended that way from the start, with %IS, %I1S and %I2S all landing here within a few days of each other.", condition: info.colony.species.length >= 3 },
					{ key: "BFEUC-JOINT10", text: "%H was settled by %IS and %I1S in %D5.", condition: true },
					{ key: "BFEUC-JOINT11", text: "Detailed biological surveys in %D5 suggested that the environment of %H was particularly suitable for %I1 food production, and they landed here soon after. Supplies of %M soon ran low, however, and a %I transport consortium was dispatched to assist, many of whom joined the original settlers after the crisis was over.", condition: checkKey("BFEUC-JOINT11",0) },
					{ key: "BFEUC-JOINT12", text: "While barely habitable with the pre-terraforming technology available at the time, %H gained a small settlement of both %IS and %I1S in %D5, who could at least work unassisted in the planet's environment.", condition: info.habitability.best < 85 },
					{ key: "BFEUC-JOINT13", text: "The %U system was originally jointly colonised by %IS and %I1S.", condition: true },
					{ key: "BFEUC-JOINT14", text: "While %H seemed a suitable settlement for %I and %I1 alike, a series of early setbacks meant that it never attracted further migrants before newer systems overtook it.", condition: info.colony.stage == 2 && info.colony.attacked == 0 },
					{ key: "BFEUC-JOINT15", text: "While the %U system had been surveyed several times before %D5, it was only with the new habitation technology provided by the cooperation of scientists across the eight charts that it became practical to inhabit full-time.", condition: true },
					{ key: "BFEUC-JOINT16", text: "After an initial %I settlement in %D4 was abandoned after %A critically damaged its orbital station, they returned in %D5 with %I1 assistance.", condition: true },
					{ key: "BFEUC-JOINT17", text: "The satisfactory environment, combined with easily-accessible %M reserves, helped the initial %I colony to expand. In %D5 they were joined by %I1 settlers attracted to the mining opportunities.", condition: info.planet.mineralWealth > 0.25 },
					{ key: "BFEUC-JOINT18", text: "The high winds of %H posed a challenge to the original %I and %I1 settlers, who lost their first two settlements to hurricanes before successfully founding %NC in %D5", condition: info.planet.windFactor >= 0.25 },
					{ key: "BFEUC-JOINT19", text: "%I and %I1 colonists first settled on %H in %D5", condition: true },
					{ key: "BFEUC-JOINT20", text: "The political instability of the %U system was there from the start, when the %I and %I1 colonists founded seven separate cities over disputed %P even before the final colony ships had landed. The USC, monitoring its joint colonisation programme closely, was at least able to note that none of the splits had occurred on species grounds.", condition: info.politics.governmentCategory == "Disordered" },
					{ key: "BFEUC-JOINT21", text: "%H is considered to be within the habitable zone of %U by several species, with the first settlement being by %IS and %I1S around %D5", condition: true }
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
				{ key: "BFEUC-OUT3", text: "Meeting other species was for many a time for reflection on one's own species. The %N Transapiest movement started among the %IS, and rapidly spread on the fringes of society. In %D5, with planetary governments growing increasingly hostile to their message of remaking the biology and technology of all eight species into a single 'transcendental' species, they bought a small orbital platform and moved it into orbit around %H.", condition: info.politics.governmentType == "Transapientism" },
				{ key: "BFEUC-OUT4", text: "The meeting of species brought many benefits, and considerably widened the debates on which government form was best. In %D5 a small number of researchers and supporters of various sides placed an orbital station around the unwanted planet of %H with the aim of conducting controlled experiements into the matter.", condition: info.politics.governmentType == "Social Evolutionists" },
				{ key: "BFEUC-OUT5", text: "While in modern times the surplus capacity of many planets is reinvested in the production and sharing of cultural artefacts, %H is rare in that it was founded in %D5 with this purpose, largely settled by artists looking for somewhere peaceful to produce their works. The colony had a tough start, but soon their sales began to provide enough money to sustain them.", condition: info.politics.governmentType == "Cultural Reachers" },
				{ key: "BFEUC-OUT6", text: "The settling of a new system was not a decision anyone took lightly, but the settlers of %H were especially cautious, debating for tens of kD whether the previous successful colonisation of worlds by other people meant that they should also do so, until they finally decided to proceed in %D5.", condition: info.politics.governmentType == "Precedentarchy" },
				{ key: "BFEUC-OUT7", text: "Where there is government and power, there will soon be corruption. %H was settled by a group of %IS in %D5, who believed that with sufficiently well-drafted rules and well-designed accountability they could avoid this problem.", condition: info.politics.governmentType == "Bureaucracy" },
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
				{ key: "BFEUJ-MIN2", text: "Mining operations have often been on the fringes of society, and an escape for the discontent. A group of "+info.species.pluralName(event.species)+" arrived here to join the existing habitat in %D5.", condition: true },
				{ key: "BFEUJ-MIN3", text: "Additional miners arrived from the "+info.species.pluralName(event.species)+" in %D5.", condition: true },
				{ key: "BFEUJ-MIN4", text: "The discovery of fresh %M deposits led to many more workers heading to the system in %D5.", condition: true },
				{ key: "BFEUJ-MIN5", text: "Increased demand for %M in %D5 was responded to by a "+info.species.name(event.species)+" group also setting up operations.", condition: true },
				{ key: "BFEUJ-MIN6", text: "The inhospitable surface of %H is a great equaliser, and its orbital habitat attracted miners from many species.", condition: info.habitability.best < 10 },
				{ key: "BFEUJ-MIN7", text: "Throughout the early unification period, %U developed a reputation as a mining system welcoming to all species.", condition: info.colony.species.length >= 4 },
				{ key: "BFEUJ-MIN8", text: "Mining stations are often some of the best designed for the diverse needs of all eight anatomies, and the station orbiting %H is considered a fine example of the early unification period.", condition: true },
				{ key: "BFEUJ-MIN9", text: "%I1S joined the extraction operations here in %D5", condition: info.colony.species.length == 2 },
				{ key: "BFEUJ-MIN10", text: "The colony expanded significantly in %D5 with the construction of several surface habitats.", condition: true },
				{ key: "BFEUJ-MIN11", text: "Asteroid mining in %U picked up significantly in %D5 after a %I1 surveyor discovered additional %M-rich rocks in the system's outer %N belt.", condition: info.economy.type == "Asteroid Mining" },
				{ key: "BFEUJ-MIN12", text: "After a series of accidents in %H's %N mine, "+info.species.name(event.species)+" specialists were brought in to carry out a full refit.", condition: info.economy.type == "Ground Mining" },
				{ key: "BFEUJ-MIN13", text: "The early mining operations at %H were more often than not unsuccessful despite the large %M concentrations. The departure of disillusioned miners and their replacement with new hopefuls throughout the early unification period gave the system its current multi-species demographics.", condition: info.colony.species.length >= 4 },
				{ key: "BFEUJ-MIN14", text: "In %D5, with yields slowly dropping, the "+info.species.pluralName(event.species)+" sponsored the installation of the system's first refinery. The ability to sell low-mass high-value refined products restored the system to profitability.", condition: info.economy.type == "Refining" } 
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
					{ key: "BFEUJ-JHAB3", text: "While originally a %I colony, %H is even better suited to the "+info.species.pluralName(event.species)+", and in %D5 with the agreement of both species they set up several major cities here.", condition: info.habitability[event.species] == info.habitability.best },
					{ key: "BFEUJ-JHAB4", text: "%H was attractive to the "+info.species.pluralName(event.species)+" and as multi-species colonies became more common in the early unification period, they joined the existing colony.", condition: true },
					{ key: "BFEUJ-JHAB5", text: "The planet's natural beauty attracted visitors even shortly after unification, with some settling permanently.", condition: info.economy.type == "Tourism" },
					{ key: "BFEUJ-JHAB6", text: "The "+info.species.pluralName(event.species)+" joined the colony in %D5.", condition: true },
					{ key: "BFEUJ-JHAB7", text: "With the relatively pleasant environment allowing the colony to stabilise quickly, it grew from both a high birth rate and substantial immigration.", condition: true },
					{ key: "BFEUJ-JHAB8", text: "Joining an established colony was usually safer than starting a new one, even on habitable planets. %H received many additional settlers shortly after unification.", condition: true },
					{ key: "BFEUJ-JHAB9", text: "Taking advantage of the existing supply lines, the "+info.species.pluralName(event.species)+" joined the small colony on %H in %D5, more than doubling the population.", condition: true },
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
				{ key: "BFMUC-NEW2", text: "While the explicit joint colonisation programme was winding down, the USC still looked more favourably on joint applications, and so %IS and %I1S landed here in %D6.", condition: true },
				{ key: "BFMUC-NEW3", text: "The initial settlements on %H were founded in %D6.", condition: true },
				{ key: "BFMUC-NEW4", text: "With both a pleasant environment on %H and reasonably accessible minerals, the %U system was originally planned for colonisation in %D5, but a shortage of supplies led to repeated postponement. The first settlers finally landed in %D6.", condition: info.planet.mineralWealth > 0.25 },
				{ key: "BFMUC-NEW5", text: "An early %I settlement in %D4 failed to prosper and was soon abandoned. With %I1 assistance, they returned in %D6.", condition: true },
				{ key: "BFMUC-NEW6", text: "The %N corporation obtained settlement rights to %H in %D6, with the first ships landing shortly afterwards.", condition: info.politics.governmentCategory == "Corporate" },
				{ key: "BFMUC-NEW7", text: "Disputes over %P on %O led a group of %I settlers to found a "+info.politics.governmentType+" here in %D6, inviting like-minded individuals from other species to join them.", condition: info.politics.governmentCategory == "Democratic" },
				{ key: "BFMUC-NEW8", text: "The charismatic %I leader %N brought hundreds of thousands of followers with him to the %U system in %D6.", condition: info.politics.governmentCategory == "Hierarchical" },
				{ key: "BFMUC-NEW9", text: "As USC policies changed post-unification, it became easier for non-homeworld groups to request settlement rights. A coalition of %I and %I1 workers' movements obtained permission to land on %H in %D6.", condition: info.politics.governmentCategory == "Collective" },
				{ key: "BFMUC-NEW10", text: "%H was settled in %D6 by a group of %IS and %I1S dissatisfied with the political structure of their homeworlds.", condition: info.politics.governmentCategory == "Atypical" },
				{ key: "BFMUC-NEW11", text: "The first permanent ground settlement in %U was founded on %H in %D6.", condition: true },
				{ key: "BFMUC-NEW12", text: "A controversial change of leadership on %O in %D6 saw many %IS leave the system. %NC on %H was founded by some of this group.", condition: true },
				{ key: "BFMUC-NEW13", text: "Several waves of settlers, from %IS, %I1S and others, established independent cities on %H starting in %D6.", condition: info.politics.governmentType == "Fragmented Rule" },
				{ key: "BFMUC-NEW14", text: "One of the last settlements explicitly founded under the joint colonisation programme, %H received %I and %I1 colonists in %D6.", condition: true },
				{ key: "BFMUC-NEW15", text: "Following successes in the early unification era, %H was founded with the intent of combining %I and %I1 culture and art in an environment comfortably habitable by both species.", condition: info.economy.type == "Cultural" },
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
				{ key: "BFMUC-OUT15", text: "The original %G governance of %D6 broke down in %D8, and the system joined the "+info.politics.regionName+" in %D9.", condition: info.politics.governmentCategory != "Atypical" && info.politics.region != 0 },

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
		var sns = info.species.pluralName(event.species);		
		if (info.habitability.best >= 70) {
			if (!state.oneoffs["BFMUJ-JHAB-"+info.g+"-"+info.s]) {
				// only do this once no matter how many species join
				state.oneoffs["BFMUJ-JHAB-"+info.g+"-"+info.s] = 1;

				opts = [
					{ key: "BFMUJ-JHAB1", text: "Additional "+sn+" settlers arrived in %D6.", condition: true },
					{ key: "BFMUJ-JHAB2", text: "The popularity of %H continued post-unification, with several major waves of settlers arriving, including hundreds of thousands of "+sns+" in %D6.", condition: true },
					{ key: "BFMUJ-JHAB3", text: "The post-unification period saw significant expansion of the %H cities, with the capital moving to %NC in %D6.", condition: true },
					{ key: "BFMUJ-JHAB4", text: "The population of %H increased substantially in %D6, with %I and %I1 remaining the most common species.", condition: true },
					{ key: "BFMUJ-JHAB5", text: "Management of the system passed to the %NB in %D6, who brought many "+sn+" workers to the system from other worlds.", condition: info.politics.governmentCategory == "Corporate" },
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
				{ key: "BFMUJ-JMIN5", text: "With %M prices rising in %D6, the %NB brought thousands of "+sn+" workers to the system, turning record profits.", condition: info.politics.governmentType == "Corporate" },
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
				{ key: "BFLUC-NEW3", text: "Near the end of the post-unification period, homeworld funding for new settlements was extremely low. %H was one of the few systems still settled from %O, as the %IS wished to have access to its %M reserves.", condition: info.planet.mineralWealth > 0.25 },
				{ key: "BFLUC-NEW4", text: "Settlers in %D7 were as likely to come from a failing colony to try again as they were to come from their species' homeworld. %H was founded by refugees fleeing collapses of %I and %I1 colonies in the area.", condition: true },
				{ key: "BFLUC-NEW5", text: "The %NB bought settlement rights to “%N's Retreat” in %D7 as a holiday world for their executives. When they went bankrupt shortly after, the world was transferred by the USC to the habitat construction workers, who renamed it to %H.", condition: info.politics.governmentCategory == "Collective" },
				{ key: "BFLUC-NEW6", text: "%H was claimed for colonisation by %IS as early as %D5, but it was only in %D7 when together with %I1S they were able to assemble a suitable fleet.", condition: true },
				{ key: "BFLUC-NEW7", text: "Despite the position of this system on key trade routes, surface habitation was only established in %D7, replacing previous ad hoc and undocumented orbital installations.", condition: info.bottle > 0 },
				{ key: "BFLUC-NEW8", text: "%IS and %I1S placed habitats on %S surface in %D7.", condition: true },
				{ key: "BFLUC-NEW9", text: "As colonisation slowed, private funding was often required to assemble a fleet. The %NB provided the majority of the funding for %S in %D7.", condition: info.politics.governmentCategory == "Corporate" },
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
				{ key: "BFLUC-OUT10", text: "In the late post-unification period, it became more practical to establish makeshift orbital stations by joining a few freighters. A station of this sort was placed in %H by exiled %IS.", condition: info.politics.governmentCategory != "Atypical" && info.politics.region == 0 },
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
		var sns = info.species.pluralName(event.species);		
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
					{ key: "BFLUJ-JHAB7", text: "As operating losses increased, ownership of the habitats was taken over by the %NB in %D7, who moved many of their operations there.", condition: info.politics.governmentCategory == "Corporate" },
					{ key: "BFLUJ-JHAB8", text: "Several major settlements were added during later expansion, with the largest being %N %Y, begun in %D7.", condition: true },
					{ key: "BFLUJ-JHAB9", text: "While there had been a small number of "+sns+" living on %H since the early unification period, and the environment was well suited to them, its distance from their homeworld meant that it was only when other established "+sn+" systems began sending out their own settlers that the population here significantly increased.", condition: info.habitability[event.species] > 90 },
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
					{ key: "BFTC-TERR12", text: "%IS and %I1S took advantage of the USC trial of environmental manipulation technology to place a small settlement on %H.", condition: info.colony.species.length > 1 },
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
				{ key: "BFTC-MIN5", text: "The %NB began extraction in %H in %D8.", condition: info.politics.governmentCategory == "Corporate" },
				{ key: "BFTC-MIN6", text: "In a large empty system such as %U, mineral-rich asteroids can easily be missed by surveys. The excellent %M concentrations in the %N belt were only discovered in %D8.", condition: info.economy.type == "Asteroid Mining" },
				{ key: "BFTC-MIN7", text: "Shortages of %M in %D8 led to the extremely inhospitable %U system gaining a mining station.", condition: info.habitability.best < 10 },
				{ key: "BFTC-MIN8", text: "Several independent mining groups pooled their resources to build a permanent station around %H in %D8.", condition: info.politics.governmentCategory == "Collective" },
				{ key: "BFTC-MIN9", text: "Mining, especially of %M, began on %H in %D8.", condition: info.economy.type != "Asteroid Mining" },
				{ key: "BFTC-MIN10", text: "The USC's environmental manipulation trials were believed at the time to be the start of a new wave of colonisation similar to that of the unification period. Mining began in %H with the hope of supplying the hundreds of new colonies, but fortunately was able to continue profitably even without them.", condition: info.colony.stage > 1 },
				{ key: "BFTC-MIN11", text: "The first permanent mining station was placed in the %U system in %D8.", condition: true },
				{ key: "BFTC-MIN12", text: "%H was settled for its mineral wealth in %D8.", condition: true },
				{ key: "BFTC-MIN13", text: "Market speculation in %D8 caused a chart-wide shortage of %M. The extraction operation at %H was intended to be temporary, but remained profitable and was kept open.", condition: true },
				{ key: "BFTC-MIN14", text: "The %U system has two asteroid belts containing many metal-rich asteroids. Mining activity increased significantly in %D8 with the opening of a supply station around %H.", condition: info.economy.type == "Asteroid Mining" },
				{ key: "BFTC-MIN15", text: "The planet is rich in %M, as well as having some accessible reserves of other metals, and quarrying and mining began in late %D8.", condition: info.economy.type == "Ground Mining" },
				{ key: "BFTC-MIN16", text: "Originally settled in %D8 as a mining system, the majority of the mines are no longer active.", condition: !info.economy.type.match(/Mining/) },
					
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
		var sns = info.species.pluralName(event.species);		

		// this is outpost-overwriting only, and rare, so a single
		// options block is probably enough
		opts = [
			{ key: "BFTJ-JOIN1", text: "Additional settlers, especially "+sns+", were attracted to the system in %D8.", condition: true },
			{ key: "BFTJ-JOIN2", text: "Further mining expansion took place in %D8, with attempts to establish permanent ground settlements.", condition: info.planet.mineralWealth > 0.45 },
			{ key: "BFTJ-JOIN3", text: "The existing orbital station at %H made monitoring of environmental modifications more straightforward, and the system was picked for USC trials of the technology in %D8", condition: info.habitability.best > 80 },
			{ key: "BFTJ-JOIN4", text: "%H was selected for environmental modification to make it habitable by "+sns+" in %D8. A small group joined the existing orbital station to observe the process.", condition: info.habitability.best > 60 && info.habitability.best < 70 },
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
				{ key: "BFUS-BI3", text: "The "+info.species.pluralName(info.star.brightnessIndexSpecies)+" have special regard for %UC as it is the brightest star visible from their homeworld.", condition: true },
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
				{ key: "BFUS-BBI1", text: "%UC is one of the brightest stars as seen from the "+info.species.pluralName(info.star.brightnessIndexSpecies)+" homeworld.", condition: true },
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
				{ key: "BFCH-RGCF6", text: "The current small ground settlement, %NC is the third on that site. So far it has avoided the fates of its predecessors.", condition: info.colony.stage > 1 },
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
				{ key: "BFCG-RSB6", text: "Falling profits caused the %NB to transfer most of its workers to other systems for the second time in %D"+lastred+".", condition: info.politics.governmentType == "Corporate" },
				{ key: "BFCG-RSB7", text: "%U has entered an active phase twice during the colony's history, requiring a partial evacuation of the system. The last such event took place in %D"+lastred+".", condition: info.star.instability > 0.3 },
				{ key: "BFCG-RSB8", text: "While %H's great beauty attracts many visitors to view it from orbit, it is not generally regarded as a pleasant place to live. The tourist transports often leave with more passengers than they came with, though the %N incident, when over one hundred thousand %IS hijacked a large freighter and fled the system in %D"+lastred+" has not been repeated.", condition: info.economy.type == "Tourism" }
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
				{ key: "BFCG-SSB2", text: "A serious plague spread rapidly through the cramped surroundings of %NC in %D"+lastred+". While only a few hundred people died as a result, significant numbers left the system, and very few new settlers arrived until a cure was finally found in %D"+(lastred+1)+".", condition: true },
				{ key: "BFCG-SSB3", text: "The tragic destruction of %N %Y by %AG in %D"+lastred+" killed almost one million colonists, and set the inhabitation of %H back by hundreds of kD.", condition: true },
				{ key: "BFCG-SSB4", text: "Major emigration took place in the %DE"+lastred+" period, as nearby settlements offered better living conditions.", condition: true },
				{ key: "BFCG-SSB5", text: "Nearly forty percent of the system's population left as it became clear that %W %N would win the civil war in %D"+lastred+".", condition: info.politics.governmentType == "Hierarchical" },
				{ key: "BFCG-SSB6", text: "Worlds such as %H which are uninhabitable outside of sealed habitats vary in population with the demand for their products. The low point came in %D"+lastred+" when advances in %R made its key product obsolete almost overnight.", condition: info.habitability.best < 60 },
				{ key: "BFCG-SSB7", text: "Reduced %M yields led to many of the miners moving on to nearby worlds during the %DE"+lastred+" period.", condition: info.planet.mineralWealth > 0.45 },
				{ key: "BFCG-SSB8", text: "%U emitted a series of major solar flares in %D"+lastred+", requiring the orbital stations to be evacuated and surface supplies to be rationed.", condition: info.star.instability > 0.3 },
				{ key: "BFCG-SSB9", text: "To protect the native %C, many smaller settlements were closed during the %DE"+lastred+" period. Many settlers emigrated entirely rather than move to the overcrowded %NC.", condition: info.habitability.best > 90 },
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
			importance: 25,
			displayOrder: 10,
			key: "",
			text: ""
		};

		if (info.colony.embassy == 1) {
			// special case - 2 or 3, one per level and two for raid.
			block.importance = 100;
			event = historySearch(info.history,"raided",10);
			if (!event) {
				event = historySearch(info.history,"assaulted",10);
				if (!event) {
					event = historySearch(info.history,"destroyed",10);
				}
			}

			opts = [
				{ key: "BFCI-EMB1", text: "The embassy world of %H coordinated the USC's military activities in this chart during the invasion. After a fierce battle, the invaders forced the remains of the "+fleetnth(info.r)+" Fleet to withdraw, and destroyed all settlements in the system.", condition: info.colony.attacked == 3 },
				{ key: "BFCI-EMB2", text: "One of the first major losses to the invasion was the destruction of the settlements on %H in %D10E, before the USC fleets were properly equipped and prepared for the fight. A small orbital station is all that has so far been rebuilt of the USC embassy.", condition: info.colony.attacked == 2 },
				{ key: "BFCI-EMB3", text: "The USC embassy worlds were the core of the response to the invasion, coordinating fleet movements across the chart. In %D10, the "+fleetnth(info.r)+" Fleet was lured away from its position by a series of strikes on nearby systems, and a hit and run assault bombarded %H's major cities, killing over %X %L"+event.oldSize+".", condition: info.colony.attacked == 1 },
				{ key: "BFCI-EMB4", text: "A major invader offensive succeeded in breaking through USC lines to assault %H in %D10. Almost %X %L"+event.oldSize+" people were successfully evacuated from the system as the attack began, destroying major communications and military installations through the system.", condition: info.colony.attacked == 1 },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,0,true));

		} else if (info.colony.attacked == 3) {
			// destroyed (~10)
			event = historySearch(info.history,"destroyed",10);

			block.importance = 100;
			opts = [
				{ key: "BFCI-DEST1", text: "The settlements on %H were completely destroyed as the invasion began in 1126 kD, and the %U system was used as a base of operations by the invaders for most of the invasion. Fewer than five thousand were able to escape the destruction.", condition: true },
				{ key: "BFCI-DEST2", text: "The invaders struck at %H in %D10, destroying orbital installations before bombarding the planet. Despite the best efforts of USC forces, most of the evacuation ships were destroyed, and %X %L"+event.oldSize+" people were killed.", condition: true },
				{ key: "BFCI-DEST3", text: "After responding to a series of hit-and-run attacks left USC defenders in disarray, the invaders struck with full force at %H, overwhelming the USC garrison and wiping out the colony.", condition: true },
				{ key: "BFCI-DEST4", text: "A heroic rearguard action by the USC "+fleetnth(info.r)+" Fleet held off the invaders long enough for the evacuation of the majority of %S %L"+event.oldSize+" inhabitants to succeed. The system then fell under invader control, only being recovered in the final counterstrike in 1141 kD.", condition: true },
				{ key: "BFCI-DEST5", text: "The %M extraction in %U was vital to the USC's defense strategy, and when the invaders assaulted the system destroying all habitats and killing %X %L"+event.oldSize+" in %D10, the "+fleetnth(info.r)+" Fleet was forced to retreat from the region.", condition: info.planet.mineralWealth > 0.45 },
				{ key: "BFCI-DEST6", text: "A surprise assault by the invaders in %D10 swept aside the local defence forces and killed %X %L"+event.oldSize+" as they destroyed all surface and orbital installations.", condition: true }
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
				{ key: "BFCI-ASS1", text: "The settlements at %H were destroyed in %D10 with the loss of %X %L"+event.oldSize+" lives. The USC "+fleetnth(info.r)+" Fleet later retook the system, which remains uninhabited except for a small refuelling depot.", condition: true },
				{ key: "BFCI-ASS2", text: "The %U system was the site of some of the toughest fighting of the invasion, with the USC "+fleetnth(info.r)+" Fleet and local forces successfully forcing the invaders to retreat in %D10 without significant damage to the orbital station.", condition: event.oldSize == 1 },
				{ key: "BFCI-ASS3", text: "%X %L"+event.oldSize+" people were evacuated from the %U system as invasion looked likely. In the end the system was spared, but so far only the orbital stations have been reactivated.", condition: true },
				{ key: "BFCI-ASS4", text: "%H's sole major settlement, %NC, was destroyed in a surprise strike by invader bombers who bypassed the well-defended orbital station. Over %L"+event.oldSize+" people died in the bombing.", condition: true },
				{ key: "BFCI-ASS5", text: "The colony on %H was completely wiped out as part of the initial assaults by the invaders in 1126 kD. The current orbital station was established as a USC supply depot when they retook the system in %D10.", condition: true },
				{ key: "BFCI-ASS6", text: "The strategic position of the system meant that it changed hands several times during the invasion. The civilian population was entirely evacuated during the initial assault in %D10.", condition: info.bottle > 0 },
				{ key: "BFCI-ASS7", text: "The majority of the USC "+fleetnth(info.r)+" Fleet was destroyed trying to defend %H from the invaders in %D10. While the orbital station survived with severe damage, over one %X %L"+event.oldSize+" people died in attacks on the surface habitats.", condition: info.economy.type == "Salvage" },
				{ key: "BFCI-ASS8", text: "An invader feint in %D10 caused the USC to divert half of the "+fleetnth(info.r)+" Fleet to evacuating the system. By the time the %X %L"+event.oldSize+" inhabitants had been taken to safety, it was obvious that the attack would never materialise, but the transports were too urgently needed elsewhere to take them back.", condition: true },
				{ key: "BFCI-ASS9", text: "The initial strikes on %H destroyed the mining stations, leading to severe %M shortages. A basic mining station was re-established as soon as the system was secured by the USC in %D10.", condition: info.planet.mineralWealth > 0.45 },
				{ key: "BFCI-ASS10", text: "The inhabitants of %H had historically avoided contact with the USC, and so they were taken by surprise when the invaders attacked in %D10E kD. Over %X %L"+event.oldSize+" people were killed or forced to flee before help could arrive.", condition: info.colony.outsiders == 1 },
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
			block.importance *= (event.oldSize/2);

			opts = [
				{ key: "BFCI-RAID1", text: "In %D10 the USC undertook a precautionary evacuation of the %U system, moving %X %L"+event.oldSize+" people to other better protected worlds. Successes in other battle zones meant that the system never came under serious attack, but very few of the evacuees have yet returned.", condition: true },
				{ key: "BFCI-RAID2", text: "The USC was able to evacuate over one %X %L"+event.oldSize+" from the system before it became the site of a clash between the invaders and the "+fleetnth(info.r)+" Fleet. The invaders largely ignored the mostly empty planet, making only token raids on factories and other infrastructure.", condition: true },
				{ key: "BFCI-RAID3", text: "The "+fleetnth(info.r)+" Fleet arrived too late to prevent a significant assault on this system in %D10. Local forces and civilians bravely defended the system, but were unable to prevent a bombardment of surface installations in which over %X %L"+event.oldSize+" died.", condition: true },
				{ key: "BFCI-RAID4", text: "In %D10 the invaders destroyed most of the orbital stations and surface settlements in %U, killing over %X %L"+event.oldSize+" people.", condition: true },
				{ key: "BFCI-RAID5", text: "The %M production on %H made it a significant target for the invaders who assaulted the system on four occasions during %D10. Over %X %L"+event.oldSize+" died in the attacks, but the mineral supplies remained secure.", condition: info.planet.mineralWealth > 0.45 },
				{ key: "BFCI-RAID6", text: "As invading ships entered the system, the "+fleetnth(info.r)+" Fleet managed to hold them off long enough for over %X %L"+event.oldSize+" people to escape on evacuation ships. The system was retaken in %D10 and the first wave of colonists returned to rebuild the system in %D11.", condition: true },
				{ key: "BFCI-RAID7", text: "One of the greatest USC failures during the invasion was the defence of %U, where the "+fleetnth(info.r)+" Fleet was almost completely destroyed, and %X %L"+event.oldSize+" people died as the planet itself was bombarded.", condition: event.oldSize > 5 },
				{ key: "BFCI-RAID8", text: "%H was bombarded from orbit in a hit and run attack in %D10. The majority of the system's %X %L"+event.oldSize+" inhabitants died in the assault or in the days that followed as the system was too small to be a priority for the USC's overstretched relief transports.", condition: event.oldSize < 4 },
				{ key: "BFCI-RAID9", text: "The %U system's strategic location meant that it changed hands several times over the course of the invasion. The civilian population was evacuated early on, and has only recently been able to return.", condition: info.bottle > 0 },
				{ key: "BFCI-RAID10", text: "In %D10 the invaders broke through USC lines and attacked %H's lightly-defended settlements. Almost %X %L"+event.oldSize+" died before the "+fleetnth(info.r)+" Fleet could be diverted to provide reinforcements.", condition: info.habitability.best > 90 },
				{ key: "BFCI-RAID11", text: "%H was the centre of around a hundred days of intense fighting in %D10, in which several thousand invader and USC warships were destroyed, and much of the planet's surface was bombed. Orbital space remains dangerously full of wreckage.", condition: info.economy.type == "Salvage" },
				{ key: "BFCI-RAID12", text: "The majority of %H's %X %L"+event.oldSize+" population was evacuated in %D10, as the planet's research facilities were expected to be a high-priority target.", condition: info.economy.type.match(/Research/) },
				{ key: "BFCI-RAID13", text: "The shipyards of %H were in %D10 responsible for servicing the "+fleetnth(info.r)+" Fleet. When an invading force arrived the defenders only had sufficient force to protect either the shipyard or the planet. USC authorities made the call to protect the shipyard, and %X %L"+event.oldSize+" died in the bombardment of the planet before reinforcements could arrive.", condition: info.economy.type == "Shipyard" },
				{ key: "BFCI-RAID14", text: "The evacuation of %H was underway when invading forces arrived in %D10. Over a third of the %X %L"+event.oldSize+" fleeing citizens lost their lives as the slow freighters made easy targets.", condition: true },
				{ key: "BFCI-RAID15", text: "The invading forces used biological weapons to kill over ninety percent of %H's population in %D10. The survivors have been quarantined on the surface to prevent the contagion spreading further.", condition: info.economy.type == "Quarantine" },
				{ key: "BFCI-RAID16", text: "Around %X %L"+event.oldSize+" died in a strike on this system in %D10.", condition: true }
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
			block = {
				importance: 0,
				displayOrder: 0,
				key: "",
				text: ""
			}
		}

		return blocks;
	};


	var blocksForMilitaryBase = function(info) {
		var blocks = [];
		var opt, opts;
		var block = {
			importance: 45,
			displayOrder: 10,
			key: "",
			text: ""
		};

		if (info.colony.stage > 3) {
			// ~10
			block.importance = 80;
			var fleet = fleetns[state.fleetassign++];
			opts = [
				{ key: "BFMB-BIG1", text: "The %U system is currently the headquarters for the USC "+fleet+" Fleet.", condition: true },
				{ key: "BFMB-BIG2", text: "Following major battles for the strategic %U system in %D10, it was made the headquarters of the "+fleet+" Fleet.", condition: info.bottle > 0 },
				{ key: "BFMB-BIG3", text: "Following the invasion, the "+fleet+" Fleet was assigned to %H in %D11.", condition: true },
				{ key: "BFMB-BIG4", text: "After a series of raids on established shipyards, military construction facilities were secretly placed on %H in %D10. The system is now the "+fleet+" Fleet headquarters.", condition: true },
				{ key: "BFMB-BIG5", text: "The USC "+fleet+" Fleet is currently assigned to the %U system on a long-term basis while the severe damage it took during the invasion is repaired.", condition: true },
				{ key: "BFMB-BIG6", text: "%S shipyards were commandeered by the USC for military production supporting the "+fleet+" Fleet in %D10, and have not yet been returned to civilian control.", condition: true },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,2,true));

		} else {
			// ~20
			opts = [			
				{ key: "BFMB-SMALL1", text: "The region around %H saw heavy fighting during the invasion. To protect it against further assaults, a USC military base was established in %D11.", condition: true },
				{ key: "BFMB-SMALL2", text: "Many of the orbital stations around %H were commandeered for USC resupply in %D10. It appears likely at this stage that the fortification will be permanent.", condition: true },
				{ key: "BFMB-SMALL3", text: "To protect the strategic system of %U, the USC established a fortified station in %D10.", condition: info.bottle > 0 },
				{ key: "BFMB-SMALL4", text: "The military base at %U allowed the region to hold off multiple attacks during the invasion.", condition: true },
				{ key: "BFMB-SMALL5", text: "As the invasion continued, systems such as %U were taken over by the USC military as rallying points, and their civilian populations were evacuated.", condition: true },
				{ key: "BFMB-SMALL6", text: "The civilian population was evacuated from %H in %D10 when the system was placed under USC military control.", condition: true },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,5,true));

		}


		if (block.text != "") {
			blocks.push(block);
			block = {
				importance: 0,
				displayOrder: 0,
				key: "",
				text: ""
			}
		}

		return blocks;
	};


	var blocksForRegionalInfo = function(info) {
		var blocks = [];
		var opt, opts;
		var block = {
			importance: 0,
			displayOrder: 11,
			key: "",
			text: ""
		};

		var region = info.p.getRegion(info.politics.region);
		if (info.s == region.influential[0]) {
			// regional capitals
			block.importance = 80;
			/* Note: this list is quite long, so most of the
			 * condition:true entries have an extra randf() on them to
			 * give the other entries more of a chance. */
			opts = [
				{ key: "BFRI-RCAP1", text: "%U is currently the capital system of the historic "+region.name+" region.", condition: region.category == "Historic Area" },
				{ key: "BFRI-RCAP2", text: "The traditional "+region.name+" area is roughly centred around %U, its most important system.", condition: region.category == "Historic Area" },
				{ key: "BFRI-RCAP3", text: "The large economy of %H makes it a key planet in the "+region.name+" region.", condition: region.category == "Economic Area" },
				{ key: "BFRI-RCAP4", text: "Trade summits between the "+region.name+" systems are usually hosted on %H.", condition: region.category == "Economic Area" },
				{ key: "BFRI-RCAP5", text: "The %H government's attempts to impose "+info.politics.governmentCategory+" regimes on all systems in the "+region.name+" area have been strongly resisted.", condition: region.category == "Politically Unstable Region" && region.subCategory.match(info.politics.governmentCategory) },
				{ key: "BFRI-RCAP6", text: "The "+region.name+" region is split by political disagreements between "+region.subCategory.replace(/\/.*/,"")+" and "+region.subCategory.replace(/.*\//,"")+" political philosophies, with %H prominently leading its side.", condition: region.category == "Politically Unstable Region" && region.subCategory.match(info.politics.governmentCategory) },
				{ key: "BFRI-RCAP7", text: "%H has attempted to use its size and influence to mediate the bitter dispute between "+region.subCategory.replace(/\/.*/,"")+" and "+region.subCategory.replace(/.*\//,"")+" systems within the "+region.name+", with limited success.", condition: region.category == "Politically Unstable Region" && !region.subCategory.match(info.politics.governmentCategory) },
				{ key: "BFRI-RCAP8", text: "The %U system is the capital of the "+region.name+" region.", condition: region.category.match(/Alliance/) && region.subCategory == info.politics.governmentCategory  && info.r.randf() < 0.4 },	
				{ key: "BFRI-RCAP9", text: "The regional administration for "+region.name+" is largely carried out on %H.", condition: region.category.match(/Alliance/) && region.subCategory == info.politics.governmentCategory  && info.r.randf() < 0.4 },
				{ key: "BFRI-RCAP10", text: "While the "+region.name+" region is an alliance of predominantly "+region.subCategory+" systems, %H is a notable exception.", condition: region.category.match(/Alliance/) && region.subCategory != info.politics.governmentCategory },
				{ key: "BFRI-RCAP11", text: "%H is the headquarters for many of the region's major corporations, most notably the %NB.", condition: region.category.match(/Alliance/) && region.subCategory == info.politics.governmentCategory && region.subCategory == "Corporate" },
				{ key: "BFRI-RCAP12", text: "The "+region.name+" Senate is in %NC on %H. Representatives from all systems of the region meet here to vote on policy and laws.", condition: region.category.match(/Alliance/) && region.subCategory == info.politics.governmentCategory && region.subCategory == "Democratic" },
				{ key: "BFRI-RCAP13", text: "%ND rules over the "+region.name+" region from this system.", condition: region.category.match(/Alliance/) && region.subCategory == info.politics.governmentCategory && region.subCategory == "Hierarchical" },
				{ key: "BFRI-RCAP14", text: "As the most influential system in the "+region.name+" region, %U is often the centre of collective assembly for its citizens.", condition: region.category.match(/Alliance/) && region.subCategory == info.politics.governmentCategory && region.subCategory == "Collective" },
				{ key: "BFRI-RCAP15", text: "The "+region.subCategory+" dominance of the "+region.name+" region would be considerably more secure if the inhabitants of %H had any sympathy for that ideology.", condition: region.category == "Weak Political Alliance" && region.subCategory != info.politics.governmentCategory },
				{ key: "BFRI-RCAP16", text: "As the most important individual system within the "+region.name+" region, %U is often referred to as its capital, though this has no legal basis.", condition: info.r.randf() < 0.2  },
				{ key: "BFRI-RCAP17", text: "While not all of the governments in the "+region.name+" area are themselves hierarchical in nature, they must all report to the %H government, which exercises strong central control.", condition: region.category == "Weak Political Alliance" && region.subCategory == info.politics.governmentCategory && region.subCategory == "Hierarchical" },
				{ key: "BFRI-RCAP18", text: "The governance of the "+region.name+" region is strongly hierarchical, with the highest levels of executive control coming from %NC on %H.", condition: region.category == "Strong Political Alliance" && region.subCategory == info.politics.governmentCategory && region.subCategory == "Hierarchical" },
				{ key: "BFRI-RCAP19", text: "The heads of the %N and %NN families have huge influence over all governments in the "+region.name+" area.", condition: region.category.match(/Alliance/) && region.subCategory == info.politics.governmentCategory && info.politics.governmentType == "Family Clans" },
				{ key: "BFRI-RCAP20", text: "The major companies operating and controlling systems in the "+region.name+" area are all institutional shareholders in the overall "+region.name+" %B.", condition: region.category.match(/Alliance/) && region.subCategory == info.politics.governmentCategory && region.subCategory == "Corporate" },
				{ key: "BFRI-RCAP21", text: "The philosophy of collective governance by the people for the people is exhibited in a variety of ways across the systems of the "+region.name+", with the General Assembly being held on %U %X times each kiloday.", condition: region.category == "Strong Political Alliance" && region.subCategory == info.politics.governmentCategory && region.subCategory == "Collective" },
				{ key: "BFRI-RCAP22", text: "The people of each system within the "+region.name+" appoint representatives to attend the regional government on %H.", condition: region.category == "Strong Political Alliance" && region.subCategory == info.politics.governmentCategory && region.subCategory == "Democratic" },
				{ key: "BFRI-RCAP23", text: "The stated aim of the "+region.name+" is to encourage democratic government throughout the region. In accordance with this, the democratic governments are able to elect councillors for the Intersystem Council, while the other governments have to live with whichever laws passed there are practical to enforce.", condition: region.category == "Weak Political Alliance" && region.subCategory == info.politics.governmentCategory && region.subCategory == "Democratic" },
				{ key: "BFRI-RCAP24", text: "The military forces under %NW are controlled from %H and strictly enforce order across the "+region.name+".", condition: region.category.match(/Alliance/) && region.subCategory == info.politics.governmentCategory && info.politics.governmentType == "Martial Law" },
				{ key: "BFRI-RCAP25", text: "The "+region.name+" is under USC Martial Law administered from %H.", condition: region.category.match(/Alliance/) && region.subCategory == info.politics.governmentCategory && info.politics.governmentType == "Martial Law" && info.colony.militaryBase == 1},
				{ key: "BFRI-RCAP26", text: "While %H is nominally the capital and %ND the absolute ruler of the "+region.name+", in practice they do not have sufficient power to enforce their decrees and the individual systems have significant autonomy.", condition: region.category == "Weak Political Alliance" && region.subCategory == info.politics.governmentCategory && region.subCategory == "Hierarchical" },
				{ key: "BFRI-RCAP27", text: "The administrative centres for the "+region.name+" are on %H.", condition: info.r.randf() < 0.2 },
				{ key: "BFRI-RCAP28", text: "%U is the most important system in the "+region.name+" area.", condition: info.r.randf() < 0.2 },
				{ key: "BFRI-RCAP29", text: "The overall leadership of the "+region.name+" area is based on %H.", condition: region.category == "Strong Political Alliance" && region.subCategory == info.politics.governmentCategory && region.subCategory == "Hierarchical" },
				{ key: "BFRI-RCAP30", text: "The high population of %H makes it a natural centre for the "+region.name+" workers' movement.", condition: region.category.match(/Alliance/) && region.subCategory == info.politics.governmentCategory && region.subCategory == "Collective" },
				{ key: "BFRI-RCAP31", text: "%H is the historical and cultural centre of the "+region.name+".", condition: region.category.match(/Area/) },
				{ key: "BFRI-RCAP32", text: "Trade summits for the "+region.name+" region are usually conducted on %H.", condition: region.category.match(/Area/) },
				{ key: "BFRI-RCAP33", text: "The "+region.name+" is dominated by the treaties between the "+region.subCategory+" systems centred on %H.", condition: region.category.match(/Alliance/) && region.subCategory == info.politics.governmentCategory  && info.r.randf() < 0.4 },	
				{ key: "BFRI-RCAP34", text: "The political unity of the "+region.subCategory+" systems led by %H gives them significant influence over the "+region.name+".", condition: region.category.match(/Alliance/) && region.subCategory == info.politics.governmentCategory  && info.r.randf() < 0.4 },	
				{ key: "BFRI-RCAP35", text: "The rulers of %H have wider authoritiy over the whole "+region.name+" area.", condition: region.category.match(/Alliance/) && region.subCategory == info.politics.governmentCategory && region.subCategory == "Hierarchical" },
				{ key: "BFRI-RCAP36", text: "%S high population and thriving service sector makes it a natural home for the headquarters of many of the region's corporations.", condition: region.category.match(/Alliance/) && region.subCategory == info.politics.governmentCategory && region.subCategory == "Corporate" },
				{ key: "BFRI-RCAP37", text: "%S high population gives it considerable influence in the systems of the "+region.name+".", condition: info.r.randf() < 0.2 },
				{ key: "BFRI-RCAP38", text: "The "+region.name+" region no longer holds the importance it did in the %DE"+(info.r.rand(6)+3)+" period, but %H remains a locally influential world.", condition: region.category == "Historic Area" },
				{ key: "BFRI-RCAP39", text: "Most of the systems of "+region.name+" are part of a stronger political alliance led from %H.", condition: region.category.match(/Alliance/) && region.subCategory == info.politics.governmentCategory && info.r.randf() < 0.4 },
				{ key: "BFRI-RCAP40", text: "Under %S leadership, "+region.name+" has become a powerful force for "+region.subCategory+" philosophies.", condition: region.category.match(/Alliance/) && region.subCategory == info.politics.governmentCategory && info.r.randf() < 0.4  },	
			];
			
			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,5,true));

		} else if (info.politics.regionInfluence > 0) {
			block.importance = 45;
			// major regional systems
			opts = [
				{ key: "BFRI-RMAJ1", text: "The %U system adds considerably to the prestige of the "+region.name+" region.", condition: true },
				{ key: "BFRI-RMAJ2", text: "While not the capital, %H holds considerable influence within the "+region.name+" area.", condition: true },
				{ key: "BFRI-RMAJ3", text: "The USC military base is an important part of regional defence and often conducts joint exercises with system militaries.", condition: info.colony.militaryBase == 1 },
				{ key: "BFRI-RMAJ4", text: "The %NB, based at %H, is one of the major corporations of the "+region.name+" region.", condition: region.subCategory.match(/Corporate/) },
				{ key: "BFRI-RMAJ5", text: "The major system of %U holds considerably influence in the regional government.", condition: region.subCategory == "Democratic" },
				{ key: "BFRI-RMAJ6", text: "While formally responsible to the regional leadership, %ND of %H is on a day to day basis the undisputed ruler of the system.", condition: region.subCategory == "Hierarchical" && info.politics.governmentType != "Family Clans" },
				{ key: "BFRI-RMAJ7", text: "A major system within the "+region.name+" area, the workers of %H have considerable influence over policy.", condition: region.subCategory == "Collective" },
				{ key: "BFRI-RMAJ8", text: "The people of %H remain largely neutral in the political and economic activity in "+region.name+".", condition: info.politics.governmentCategory == "Atypical" },
				{ key: "BFRI-RMAJ9", text: "%H could by its population and economic power be a major participant in "+region.name+", were it not for the fact that what little authorities it can assemble are rarely trusted by the other systems.", condition: info.politics.governmentCategory == "Disordered" },
				{ key: "BFRI-RMAJ10", text: "The economic and political power of the %U system adds considerably to the "+info.politics.governmentCategory+" of the debate within the "+region.name+" area.", condition: region.category == "Politically Unstable Region" && region.subCategory.match(info.politics.governmentCategory) },
				{ key: "BFRI-RMAJ11", text: "Where possible, %H tries to remain outside the conflict between "+region.subCategory.replace(/\/.*/,"")+" and "+region.subCategory.replace(/.*\//,"")+" ideologies in the region.", condition: region.category == "Politically Unstable Region" && !region.subCategory.match(info.politics.governmentCategory) && info.politics.governmentCategory != "Disordered" },
				{ key: "BFRI-RMAJ12", text: "The division between "+region.subCategory.replace(/\/.*/,"")+" and "+region.subCategory.replace(/.*\//,"")+" in the "+region.name+" is mirrored on %S surface as they struggle for control of this strategic system.", condition: region.category == "Politically Unstable Region" && !region.subCategory.match(info.politics.governmentCategory) && info.politics.governmentCategory == "Disordered" },
				{ key: "BFRI-RMAJ13", text: "%H has so far resisted calls for its governance to be restructured under more "+region.subCategory+" lines.", condition: region.category.match(/Alliance/) && region.subCategory != info.politics.governmentCategory },
				{ key: "BFRI-RMAJ14", text: "The economic power of %H allows it considerable influence over trade routes in "+region.name, condition: info.colony.militaryBase == 0 },
				{ key: "BFRI-RMAJ15", text: "%H contributes extensively to the trading strength of "+region.name+".", condition: region.category == "Economic Area" },
				{ key: "BFRI-RMAJ16", text: "Part of the historic "+region.name+" region, %H no longer plays a significant role in chart politics, but once provided a vital centre for further settlement of the region.", condition: region.category == "Historic Area" },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));

		} else if (region.category.match(/Alliance/) && region.subCategory != info.politics.governmentCategory && info.colony.stage > 0 && info.politics.governmentType != "Quarantine") {
			// non-influential system going against majority type
			block.importance = 20;
			// this is going to be relatively usual especially for
			// weak alliances and not really worth noting

			var str = (region.category == "Strong Political Alliance");
			var syc = info.politics.governmentCategory;
			var rec = region.subCategory;

			opts = [
				{ key: "BFRI-OPA1", text: "The %U system, unlike most of "+region.name+", rejects "+rec+" philosophies.", condition: true },
				{ key: "BFRI-OPA2", text: "%H has unusually been allowed to join the "+region.name+" despite not having a "+rec+" government.", condition: str },
				{ key: "BFRI-OPA3", text: "While not part of the intergovernmental cooperation of the "+region.name+" systems, %H has signed a number of mutually beneficial treaties with them and is usually considered part of the region.", condition: !str },
				{ key: "BFRI-OPA4", text: "The unusual government on %H is largely unconcerned with its nominal membership of "+region.name+", and the regional authorities for now seem uninclined to take the matter further.", condition: syc == "Atypical" },
				{ key: "BFRI-OPA5", text: "The current disorder in %H is in part believed to be encouraged by other systems in "+region.name+" who are hoping to see a "+rec+" government emerge from it.", condition: str && syc == "Disordered" },
				{ key: "BFRI-OPA6", text: "The "+rec+" government on %H collapsed in %D10, further weakening the alliance among the "+region.name+" systems.", condition: !str && syc == "Disordered" },
				{ key: "BFRI-OPA7", text: "%S treatment of its workforce has been condemned by the other "+region.name+" systems.", condition: syc == "Corporate" && rec == "Collective" },
				{ key: "BFRI-OPA8", text: "The democracies of "+region.name+" seem to have little problem with the small %H population being under the control of a few very rich shareholders and executives.", condition: syc == "Corporate" && rec == "Democratic" },
				{ key: "BFRI-OPA9", text: "The independent nature of %H is considered a challenge to many of its neighbours, who have tried to buy out the %NB on several occasions, as well as more underhanded tactics.", condition: syc == "Corporate" && rec == "Hierarchical" },
				{ key: "BFRI-OPA10", text: "The population of %H are increasingly concerned about the influence of their corporate neighbours, and have set very strict limits on political advertising and media.", condition: syc == "Democratic" && rec == "Corporate" },
				{ key: "BFRI-OPA11", text: "The inhabitants disapprove of the "+region.name+"'s tendency to regimented governments and have instituted reforms to minimise the power which can be held by any one person.", condition: syc == "Democratic" && rec == "Hierarchical" },
				{ key: "BFRI-OPA12", text: "The emphasis of %H on personal freedoms leads it into conflict with many of the other systems in "+region.name+", who view this as risking basic rights.", condition: syc == "Democratic" && rec == "Collective" },
				{ key: "BFRI-OPA13", text: "%ND of %H has been offered considerable wealth by local bodies such as the %NB for control of the planet, but has so far refused.", condition: syc == "Hierarchical" && rec == "Corporate" },
				{ key: "BFRI-OPA14", text: "A military coup in %D10 overthrew the government of %H. Other systems in "+region.name+" have been indecisive in their response.", condition: syc == "Hierarchical" && rec == "Democratic" },
				{ key: "BFRI-OPA15", text: "The "+region.name+" systems have been extremely critical of the centralised authority on %H, and through economic pressure have forced the government to implement some reforms.", condition: syc == "Hierarchical" && rec == "Collective" },
				{ key: "BFRI-OPA16", text: "Shares in the %NB corporation which officially owns the system are divided equally between all workers.", condition: syc == "Collective" && rec == "Corporate" },
				{ key: "BFRI-OPA17", text: "The workers of %H have so far resisted calls from the other "+region.name+" systems to adopt a more democratic form of government, claiming that it would promote selfishness and division.", condition: syc == "Collective" && rec == "Democratic" },
				{ key: "BFRI-OPA18", text: "The "+region.name+" authorities view the mere presence of %H as potentially destabilising, but so far have not been able to gain control over %U.", condition: syc == "Collective" && rec == "Hierarchical" },
				{ key: "BFRI-OPA19", text: "%H is officially part of the "+region.name+" area but has not signed any of the regional cooperation treaties.", condition: true },
				{ key: "BFRI-OPA20", text: "One of the "+region.name+" systems.", condition: true },
				{ key: "BFRI-OPA21", text: "Part of the "+region.name+" area.", condition: true },
				{ key: "BFRI-OPA22", text: "While theoretically part of "+region.name+", %H has too little authority to do much at all.", condition: syc == "Disordered" },
				{ key: "BFRI-OPA23", text: "The %U system is geographically part of the "+region.name+" and has several trading partners there, but is not part of the political union.", condition: !str },
				{ key: "BFRI-OPA24", text: "%S "+syc+" style of government brings it into frequent conflict with the majority of the "+region.name+" region.", condition: !str && syc != "Disordered" && syc != "Atypical" },
				{ key: "BFRI-OPA25", text: "The recent collapse of the government on %H is being observed with concern by other systems in "+region.name+".", condition: !str && syc == "Disordered" },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));


		} else if (region.category == "Politically Unstable Region"  && region.subCategory.match(info.politics.governmentCategory) && info.colony.stage > 0 && info.politics.governmentType != "Quarantine") {
			block.importance = 25;
			// non-influential system on side in unstable region
			opts = [
				{ key: "BFRI-PUR1", text: "The shareholders on %H are known to be looking to diversify their investments elsewhere in the "+region.name+".", condition: info.politics.governmentCategory == "Corporate" },
				{ key: "BFRI-PUR2", text: "%H, together with other democracies in the region, places regular pressure on other systems to improve personal rights.", condition: info.politics.governmentCategory == "Democratic" },
				{ key: "BFRI-PUR3", text: "The charismatic leaders of %H have loudly criticised nearby systems for the inefficiency of their governments, and have been criticised in turn for attempts to fund popular uprisings.", condition: info.politics.governmentCategory == "Hierarchical" },
				{ key: "BFRI-PUR4", text: "%H, as part of a wider workers' collective, grants asylum each year to hundreds of slaves freed from nearby systems.", condition: info.politics.governmentCategory == "Collective" },
				{ key: "BFRI-PUR5", text: "One of the "+region.name+" systems.", condition: true },
				{ key: "BFRI-PUR6", text: "%H is one of the contributors towards the rivalry between "+region.subCategory.replace(/\/.*/,"")+" and "+region.subCategory.replace(/.*\//,"")+" systems in the region.", condition: true },
				{ key: "BFRI-PUR7", text: "The conflict between the more influential "+region.subCategory.replace(/\/.*/,"")+" and "+region.subCategory.replace(/.*\//,"")+" systems in the "+region.name+" has often included %H against its will.", condition: true },
			];


			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));

		} else if (info.colony.stage > 0) {
			// low importance "in region" note
			block.importance = 2;
			opts = [
				{ key: "BFRI-IINR1", text: "%U is part of the "+region.name+".", condition: true },
				{ key: "BFRI-IINR2", text: "%H is in the "+region.name+" region.", condition: true },
				{ key: "BFRI-IINR3", text: "One of the "+region.name+" systems.", condition: true },
				{ key: "BFRI-IINR4", text: "A minor member system of the "+region.name+" area.", condition: true },
				{ key: "BFRI-IINR5", text: "A system in the "+region.name+" area.", condition: true },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,30,true));


		} else if (info.colony.stage == 0) {
			// uninhabited system "in" region.
			block.importance = 1;
			opts = [
				{ key: "BFRI-UINR1", text: "%U is part of the "+region.name+".", condition: true },
				{ key: "BFRI-UINR2", text: "%H is in the "+region.name+" region.", condition: true },
				{ key: "BFRI-UINR3", text: "One of the "+region.name+" systems.", condition: true },
				{ key: "BFRI-UINR4", text: "While largely uninhabited, %U is generally considered to be part of the "+region.name+" area.", condition: true },
				{ key: "BFRI-UINR5", text: "A system in the "+region.name+" area.", condition: true },
				{ key: "BFRI-UINR6", text: "Claimed but not settled by the "+region.name+".", condition: region.category.match(/Alliance/) },
				{ key: "BFRI-UINR7", text: "%H is claimed by the "+region.name+".", condition: region.category.match(/Alliance/) },
				{ key: "BFRI-UINR8", text: "While uninhabited, %U has historically been important to the "+region.name+".", condition: region.category == "Historic Area" },
				{ key: "BFRI-UINR9", text: "Though it has no official residents, %U's position makes it convenient to consider as part of "+region.name+".", condition: info.bottle > 0 }
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,100,true));


		}

		if (block.text != "") {
			blocks.push(block);
			block = {
				importance: 0,
				displayOrder: 11,
				key: "",
				text: ""
			}
		}

		return blocks;
	};


	var blocksForBorderSystems = function(info) {
		var blocks = [];
		var opt, opts;
		var block = {
			importance: 0,
			displayOrder: 11,
			key: "",
			text: ""
		};

		if (info.colony.contested == 1) {
			// ~50 systems
			block.importance = 70;
			var r1 = info.p.getRegion(info.colony.contesting[0]);
			var r2 = info.p.getRegion(info.colony.contesting[1]);
			if (r2.category.match(/Political/) && !r1.category.match(/Political/)) {
				// swap them over
				r1 = info.p.getRegion(info.colony.contesting[1]);
				r2 = info.p.getRegion(info.colony.contesting[0]);
			}

			opts = [
				{ key: "BFBS-CON1", text: "The %U system is claimed by both "+r1.name+" and "+r2.name+".", condition: r1.category.match(/Political/) && r2.category.match(/Political/) },
				{ key: "BFBS-CON2", text: "Positioned between two major regions, the %H inhabitants struggle to retain their independence.", condition: r1.category.match(/Political/) && r2.category.match(/Political/) },
				{ key: "BFBS-CON3", text: "The pressure from both "+r1.name+" and "+r2.name+" has made it difficult to form a stable government.", condition: info.politics.governmentCategory == "Disordered" },
				{ key: "BFBS-CON4", text: "The %U system is claimed by "+r1.name+", but this is disputed strongly by its occupants.", condition: r1.category.match(/Political/) && !r2.category.match(/Political/) },
				{ key: "BFBS-CON5", text: "The regional membership of this system is disputed.", condition: true },
				{ key: "BFBS-CON6", text: "%H has at times signed membership treaties with both "+r1.name+" and "+r2.name+". The current situation is uncertain.", condition: r1.category.match(/Political/) && r2.category.match(/Political/) },
				{ key: "BFBS-CON7", text: "The previous pro-"+r1.name+" government was recently toppled by "+r2.name+" sympathisers, and the future of the system is now unclear.", condition: info.politics.governmentCategory == "Disordered" },
				{ key: "BFBS-CON8", text: "%H recently declared independence from "+r1.name+" and is petitioning for admittance into "+r2.name+".", condition: true },
				{ key: "BFBS-CON9", text: "While historically the %U system has been part of "+r2.name+", the current government is petitioning for admittance int the "+r1.name+" group.", condition: r1.category.match(/Political/) && !r2.category.match(/Political/) },
				{ key: "BFBS-CON10", text: "The government of %H recently protested to the USC, alleging that agents of the nearby "+r1.name+" region were attempting to destabilise it.", condition: true },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));


		} else if (info.colony.independentHub == 1 && info.colony.embassy == 0) {
			// ~5 systems
			block.importance = 100;
			var r1 = info.p.getRegion(info.colony.contesting[0]);
			var r2 = info.p.getRegion(info.colony.contesting[1]);
			var r3 = info.p.getRegion(info.colony.contesting[2]);
			opts = [
				{ key: "BFBS-INDH1", text: "The position of %U between the major regional powers of "+r1.name+", "+r2.name+" and "+r3.name+" has allowed %H to become one of the largest trading hubs in USC space, despite its small size.", condition: true },
				{ key: "BFBS-INDH2", text: "By carefully playing the systems of "+r1.name+", "+r2.name+" and "+r3.name+" off against each other, the people of %H have remained independent and grown their system's wealth.", condition: true },
				{ key: "BFBS-INDH3", text: "%H is one of the famous systems in the chart, as its provision of neutral ground between the "+r1.name+", "+r2.name+" and "+r3.name+" regions has made it both politically and economically vital to the history of the chart.", condition: true },
				{ key: "BFBS-INDH4", text: "Carefully balanced between the "+r1.name+", "+r2.name+" and "+r3.name+" regions, %H is a major trading hub and receives visitors from across the chart.", condition: true },
			];
			
			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,0,true));

		} else if (info.politics.regionAccession == 1) {
			// accession (~15 systems)
			block.importance = 90;
			var r1 = info.p.getRegion(info.colony.contesting[0]);
			
			opts = [
				{ key: "BFBS-ACC1", text: "%H is currently negotiating to join the "+r1.name+" systems.", condition: true },
				{ key: "BFBS-ACC2", text: "A referendum on joining the "+r1.name+" region passed in %D10, and this is now being discussed.", condition: info.politics.governmentCategory == "Democratic" },
				{ key: "BFBS-ACC3", text: "Many of the shareholders of %H's biggest %Bs are from the "+r1.name+" and it has often been suggested that the %U system should be formally included in the region.", condition: info.politics.governmentCategory == "Corporate" },
				{ key: "BFBS-ACC4", text: "Workers' movements on %H regularly cooperate with their counterparts in the "+r1.name+" systems, and formal membership is under consideration.", condition: info.politics.governmentCategory == "Collective" },
				{ key: "BFBS-ACC5", text: "The %U system is under the de facto rule of "+r1.name+", but so far the expansion of the region has not been formalised.", condition: info.politics.governmentCategory == "Hierarchical" },
				{ key: "BFBS-ACC6", text: "The accession of %H to the "+r1.name+" systems is currently being considered.", condition: true },
				{ key: "BFBS-ACC7", text: r1.name+"'s control of most of the system's trade routes has led the government to consider a formal alliance.", condition: true },
				{ key: "BFBS-ACC8", text: "%H has signed several cooperation treaties with the "+r1.name+" governments, but is not yet a formal member of the union.", condition: info.politics.governmentCategory == "Democratic" },
				{ key: "BFBS-ACC9", text: "Suggestions of a merger between one of the major companies of "+r1.name+" and the %NB of %H are commonplace, though so far negotiations over the terms have been unsuccessful.", condition: info.politics.governmentCategory == "Corporate" },
				{ key: "BFBS-ACC10", text: "Though not officially a member of "+r1.name+", %H has been supported by those systems in disputes.", condition: info.politics.governmentCategory == "Collective" },
				{ key: "BFBS-ACC11", text: "The current government of %H is having increasing difficulty with rebel forces, and is believed to be approaching some of the systems in "+r1.name+" for assistance.", condition: info.politics.governmentCategory == "Hierarchical" },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,3,true));

		} else if (info.politics.regionAccession == 2) {
			// civil war (~5 systems)
			block.importance = 95;
			var r1 = info.p.getRegion(info.colony.contesting[0]);

			opts = [
				{ key: "BFBS-WACC1", text: "Fighting between pro- and anti-"+r1.name+" factions on %H has intensified recently.", condition: true },
				{ key: "BFBS-WACC2", text: "Pro-democracy activists have seized control of key settlements, including %N %Y, precipitating a civil war.", condition: r1.subCategory == "Democratic" },
				{ key: "BFBS-WACC3", text: "Rumours that the %N %B is about to acquire a controlling interest in the system have led to rioting and disorder in major cities.", condition: r1.subCategory == "Corporate" },
				{ key: "BFBS-WACC4", text: "Assisted by "+r1.name+", the workers of %H rose up against the %NB in %D11. So far %X %L2 have died as a result of the %N response.", condition: r1.subCategory == "Collective" },
				{ key: "BFBS-WACC5", text: "The assassination of the heads of government at an off-world conference in %D11 has let to political chaos. The previously unknown %N movement has gained considerable influence recommending that "+r1.name+" assistance be solicited to restore order.", condition: r1.subCategory == "Hierarchical" },
				{ key: "BFBS-WACC6", text: "The treaty assigning %U to the "+r1.name+" region was voided in %D10 after a violent crackdown on protests in %NC led to all-out civil war.", condition: true },
				{ key: "BFBS-WACC7", text: "A workers' revolt on %H with the aim of joining the system to "+r1.name+" has currently seized control of major settlements including %N %Y.", condition: r1.subCategory == "Collective" && info.colony.stage > 1},
				{ key: "BFBS-WACC8", text: "The planet is currently the subject of a hostile takeover by the "+r1.name+" regional corporations.", condition: r1.subCategory == "Corporate" },
				{ key: "BFBS-WACC9", text: "%S membership of "+r1.name+" has been suspended after the military overturned the results of a closely-contested election to appoint %NW to the presidency.", condition: r1.subCategory == "Democratic" },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,1,true));


		} else if (info.colony.independentHub == 0 && (info.bottle > 0 && info.politics.region == 0 && info.colony.stage > 0)) {
			// ~75 systems
			block.importance = 20;

			opts = [
				{ key: "BFBS-BOT1", text: "The position of the %U system on a major trade route has contributed to its popularity.", condition: true },
				{ key: "BFBS-BOT2", text: "Many trade routes pass through %U.", condition: true },
				{ key: "BFBS-BOT3", text: "The position of %U gives travellers a hard choice - pass through its unstable space, or make a large detour.", condition: info.politics.stability < 3 },
				{ key: "BFBS-BOT4", text: "The %H station is a popular stop with long-distance travellers.", condition: true },
				{ key: "BFBS-BOT5", text: "As the last system before the %NG - or the first after it - the system sees many ships pass through.", condition: info.bottle == 1 },
				{ key: "BFBS-BOT6", text: "The %H refuelling and supply station is one of the more important to inter-system trade.", condition: info.colony.stage == 1 },
				{ key: "BFBS-BOT7", text: "Situated at a natural convergence of witchspace routes, %H station attracts visitors from across the chart.", condition: info.bottle == 2 },
				{ key: "BFBS-BOT8", text: "The convenient position of %U has boosted its tourism industry.", condition: info.economy.type == "Tourism" },
				{ key: "BFBS-BOT9", text: "One of the more dangerous witchspace bottlenecks, attempts to establish control over %S space have all failed.", condition: info.politics.governmentCategory == "Disordered" },
				{ key: "BFBS-BOT10", text: "Ships crossing the %NG will often stop at %H station to resupply.", condition: info.bottle == 1 },
				{ key: "BFBS-BOT11", text: "The economy of %H is helped by its strategic position.", condition: true },
				{ key: "BFBS-BOT12", text: "Were it not for its position, it is unlikely that %H would have been settled at all.", condition: info.planet.mineralWealth < 0.45 && info.habitability.best < 0.9 },
				{ key: "BFBS-BOT13", text: "The %U system is a small hub for trading activity, as many witchspace routes cross it.", condition: true }
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));


		} 



		if (block.text != "") {
			blocks.push(block);
			block = {
				importance: 0,
				displayOrder: 11,
				key: "",
				text: ""
			}
		}

		return blocks;
	}


	var blocksForSystemEnvironmentProperties = function(info) {

		var blocks = [];
		var opt, opts;
		var block = {
			importance: 0,
			displayOrder: 1,
			key: "",
			text: ""
		}

		// temperature
		// varies from -30 to +53
		// species preferences from +9(+4) to +24(+25)
		if (info.planet.temperature < -20) {
			// ~30
			block.importance = -2*info.planet.temperature; // -40..-60
			opts = [
				{ key: "BFSEP-TEMRC1", text: "The icy surface of %H is virtually uninhabitable.", condition: true },
				{ key: "BFSEP-TEMRC2", text: "With a mean surface temperature of "+Math.floor(273+info.planet.temperature)+"K, settlements on %H are sparse and travel between them non-existent.", condition: info.colony.stage > 1 },
				{ key: "BFSEP-TEMRC3", text: "%S surface is one of the coldest of the inhabited planets, and no permanent settlements currently exist.", condition: info.colony.stage == 1 },
				{ key: "BFSEP-TEMRC4", text: "The frozen surface of %U's most habitable planet has discouraged occupation of this system.", condition: !info.colony.founded },
				{ key: "BFSEP-TEMRC5", text: "The extreme cold makes exploitation of %S %M reserves extremely challenging.", condition: info.planet.mineralWealth > 0.25 },
				{ key: "BFSEP-TEMRC6", text: "Well below comfortable temperatures, the expense of cold-adapted tools and housing has meant that %H was never economical to colonise.", condition: !info.colony.founded },
				{ key: "BFSEP-TEMRC7", text: "%H is the most habitable world in %U, but at "+Math.floor(273+info.planet.temperature)+"K it is still extremely challenging.", condition: true },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));
			
		} else if (info.planet.temperature < -5) {
			// ~250
			block.importance = -info.planet.temperature; // 6 to 20
			opts = [
				{ key: "BFSEP-TEMC1", text: "The mean surface temperature is "+Math.floor(273+info.planet.temperature)+"K.", condition: true },
				{ key: "BFSEP-TEMC2", text: "The cold surface of %H has a few warm spots near the equator, and this is where the settlements are concentrated.", condition: info.colony.stage > 1 },
				{ key: "BFSEP-TEMC3", text: "Mining in %H's icy environment is challenging, with many of the most valuable deposits buried beneath kilometre-thick permafrost.", condition: info.colony.stage > 0 && info.planet.mineralWealth > 0.45 },
				{ key: "BFSEP-TEMC4", text: "Exploratory surveys suggest significant %M reserves are locked beneath the polar ice caps of %H, but it is currently not economical to retrieve them.", condition: !info.colony.founded && info.planet.mineralWealth > 0.45 },
				{ key: "BFSEP-TEMC5", text: "A cold and forbidding world, %H is nevertheless considered at least theoretically habitable.", condition: info.habitability.best > 10 },
				{ key: "BFSEP-TEMC6", text: "Survival on the surface outside the relatively mild equatorial regions requires heavy protective clothing.", condition: info.colony.stage > 1 },
				{ key: "BFSEP-TEMC7", text: "The large ice caps of %H are easily visible from space.", condition: true },
				{ key: "BFSEP-TEMC8", text: "A geological survey in %D7 found unusually high mineral concentrations in ice cores, but no follow-up has yet taken place.", condition: !info.colony.founded && info.planet.mineralWealth > 0.45 },
				{ key: "BFSEP-TEMC9", text: "Too cold for comfortable habitation and with no known mineral reserves, %H has remained uninhabited since its discovery.", condition: !info.colony.founded && info.planet.mineralWealth < 0.25 },
				{ key: "BFSEP-TEMC10", text: "While cold, the equatorial and tropical regions of %H are possible to survive in unassisted.", condition: info.habitability.best > 70 },
				{ key: "BFSEP-TEMC11", text: "%H is currently too cold to settle without extensive use of environmental modification technology, which is currently considered too uneconomical.", condition: info.habitability.best > 60 && info.habitability.best < 70 && !info.colony.founded },
				{ key: "BFSEP-TEMC12", text: "The thin atmosphere provides little insulation, and while the mean temperature is "+Math.floor(273+info.planet.temperature)+"K. this varies considerably between day and night sides of %H.", condition: info.planet.cloudAlpha == 0 },
				{ key: "BFSEP-TEMC13", text: "An extremely cold world.", condition: true },
				{ key: "BFSEP-TEMC14", text: "%H is too cold to support more than a few isolated settlements.", condition: info.habitability.best < 60 && info.colony.stage > 0 },
				{ key: "BFSEP-TEMC15", text: "Surface temperatures on %H are well below even "+info.species.name("Bird")+" or "+info.species.name("Rodent")+" preferred levels.", condition: true },
				{ key: "BFSEP-TEMC16", text: "While the orbital station is unaffected, the frozen land of %H has resisted attempts to establish permanent settlements.", condition: info.colony.stage == 1 },
				{ key: "BFSEP-TEMC17", text: "%S oceans are mostly covered in a thick sheet of ice.", condition: info.planet.percentLand < 0.2 },
				{ key: "BFSEP-TEMC18", text: "Thick glaciers cover %S continents, with only a few salty equatorial seas unfrozen.", condition: info.planet.percentLand > 0.8 },
				{ key: "BFSEP-TEMC19", text: "Visitors to the surface of %H should ensure that they and their equipment are adequately insulated.", condition: true },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,30,true));

		} else if (info.planet.temperature > 45) {
			// ~50
			block.importance = (info.planet.temperature * 2)-50; // 40-55
			
			opts = [
				{ key: "BFSEP-TEMRH1", text: "%H orbits close to %U, and most of its surface is uninhabitably hot.", condition: true },
				{ key: "BFSEP-TEMRH2", text: "The average surface temperature is a scorching "+Math.floor(273+info.planet.temperature)+"K.", condition: true },
				{ key: "BFSEP-TEMRH3", text: "Without any significant atmosphere, the daylight side of %H rapidly heats to around 1"+Math.floor(273+info.planet.temperature)+"K.", condition: info.planet.cloudAlpha == 0 },
				{ key: "BFSEP-TEMRH4", text: "Despite the extreme temperatures, there are a few small settlements in the polar regions.", condition: info.colony.stage > 1 },
				{ key: "BFSEP-TEMRH5", text: "Even the poikilothermic "+info.species.pluralName("Lizard")+" consider %H far too hot to inhabit.", condition: !info.colony.founded },
				{ key: "BFSEP-TEMRH6", text: "%H has extensive %M reserves, but is far too hot for miners to work, even for a few hours. The dusty environment makes machinery unreliable and continually in need of costly maintenance, and so the planet remains empty.", condition: info.planet.mineralWealth > 0.45 && !info.colony.founded },
				{ key: "BFSEP-TEMRH7", text: "While the orbital station requires some protection from %U's intense heat, this is an easier task than establishing a safe surface settlement.", condition: info.colony.stage == 1 },
				{ key: "BFSEP-TEMRH8", text: "Despite the high average temperature, there are parts of %H where settlement is possible without excessive protection.", condition: info.habitability.best > 70 },
				{ key: "BFSEP-TEMRH9", text: "The hot surface and relative unimportance of the system has left %H uninhabited.", condition: !info.colony.founded },
				{ key: "BFSEP-TEMRH10", text: "%H is one of the hottest worlds still considered theoretically habitable.", condition: true },
				{ key: "BFSEP-TEMRH11", text: "%H is too close to %U for settlement with current technology.", condition: !info.colony.founded },
				{ key: "BFSEP-TEMRH12", text: "The extreme heat from %U has so far discouraged settlement.", condition: !info.colony.founded },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));

		} else if (info.planet.temperature > 30) {
			// ~300
			block.importance = info.planet.temperature-25; // 6 to 20
			opts = [
				{ key: "BFSEP-TEMH1", text: "The mean surface temperature is "+Math.floor(273+info.planet.temperature)+"K.", condition: true },
				{ key: "BFSEP-TEMH2", text: "The surface of %H is mostly a barren wasteland under the intense rays of %U.", condition: info.habitability.best < 80 },
				{ key: "BFSEP-TEMH3", text: "%H is currently considered too hot for habitation.", condition: !info.colony.founded },
				{ key: "BFSEP-TEMH4", text: "The extensive mineral reserves are valued highly, driving miners to work through the extreme heat to retrieve them. Most mining takes place underground to provide some shelter from %U.", condition: info.planet.mineralWealth > 0.45 && info.colony.stage > 0},
				{ key: "BFSEP-TEMH5", text: "The orbital stations are currently the only habitation at %H, as the surface is generally too warm for permanent residence.", condition: info.colony.stage == 1 },
				{ key: "BFSEP-TEMH6", text: "With a mean surface temperature of "+Math.floor(273+info.planet.temperature)+"K, %H is barely considered habitable.", condition: !info.colony.founded && info.habitability.best > 70 },
				{ key: "BFSEP-TEMH7", text: "The intense heat from %U places %H well outside the comfortable range for most species.", condition: true },
				{ key: "BFSEP-TEMH8", text: "Even with costly environmental manipulation tools, %H is unlikely to ever be fit for more than a few isolated polar settlements.", condition: info.habitability.best < 60 },
				{ key: "BFSEP-TEMH9", text: "The construction of %NC in %S intense heat posed many challenges for the original engineers.", condition: info.colony.stage > 1 },
				{ key: "BFSEP-TEMH10", text: "%U has turned most of %S into a barren wasteland.", condition: info.planet.cloudAlpha > 0 && info.planet.percentLand > 0.5 },
				{ key: "BFSEP-TEMH11", text: "The high surface temperatures cause significant evaporation from %H's oceans, covering the world in thick clouds.", condition: info.planet.cloudAlpha > 2 && info.planet.percentLand < 0.5 },
				{ key: "BFSEP-TEMH12", text: "The warm oceans of %H moderate the surface temperature, which still remains uncomfortably high.", condition: info.planet.percentLand < 0.2 },
				{ key: "BFSEP-TEMH13", text: "Few species can tolerate the temperatures in even the colder regions of %H for long, and the system remains uninhabited.", condition: info.planet.cloudAlpha > 0 && !info.colony.founded },
				{ key: "BFSEP-TEMH14", text: "At an average of "+(273+info.planet.temperature)+"K, the surface is too hot for productive habitation.", condition: !info.colony.founded }
			];


			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,40,true));
		}

		if (block.text != "") {
			blocks.push(block);
			block = {
				importance: 0,
				displayOrder: 1,
				key: "",
				text: ""
			}
		}

		// radiation
		// >0.1: dangerous to unresistant species
		// >0.3: dangerous to resistant species
		// >1: highly dangerous
		// >5: extremely dangerous
		if (info.planet.surfaceRadiation > 5) {
			// ~25
			block.importance = 60;
			opts = [
				{ key: "BFSEP-RADX1", text: "Without shielding, the surface radiation on %H is fatal within minutes even to "+info.species.pluralName("Insect")+".", condition: true },
				{ key: "BFSEP-RADX2", text: "Shielding against the intense radiation on %H is virtually impossible.", condition: info.habitability.best == 0 },
				{ key: "BFSEP-RADX3", text: "Even the thick exoskeletons of "+info.species.pluralName("Insect")+" or "+info.species.pluralName("Lobster")+" provide no protection against the intense radiation from %U. Exposure is invariably fatal.", condition: true },
				{ key: "BFSEP-RADX4", text: "Survival on %S surface is impossible due to the intense radiation, and so settlement remains orbital only.", condition: info.colony.stage > 0 },
				{ key: "BFSEP-RADX5", text: "The surface radiation on %H regularly exceeds "+Math.floor(info.planet.surfaceRadiation)+" Fd.", condition: true },
				{ key: "BFSEP-RADX6", text: "Surface deposits of %M are visible even on a low fly-past, but the intense radiation makes getting out of a survey ship to retrieve them impossible.", condition: info.planet.mineralWealth > 0.45 },
				{ key: "BFSEP-RADX7", text: "The thin atmosphere and proximity to %U means that %S surface receives over "+Math.floor(info.planet.surfaceRadiation)+" Fd of radiation.", condition: true }
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,5,true));

		} else if (info.planet.surfaceRadiation > 1) {
			// ~100
			block.importance = 20;
			opts = [
				{ key: "BFSEP-RADE1", text: "The surface radiation on %H is fatal within minutes to most species. Exoskeletal species may survive slightly longer.", condition: true },
				{ key: "BFSEP-RADE2", text: "The radiation levels on %H exceed "+Math.floor(info.planet.surfaceRadiation)+" Fd.", condition: true },
				{ key: "BFSEP-RADE3", text: "High surface radiation levels mean that landing on %H is not advised.", condition: !info.colony.founded },
				{ key: "BFSEP-RADE4", text: "The intense radiation from %U makes settlement on %H impossible, and even orbital stations would require too much shielding to be economical.", condition: !info.colony.founded },
				{ key: "BFSEP-RADE5", text: "The %H surface is uninhabitable due to intense radiation, and the orbital station requires regular maintenance to remove damaged shielding.", condition: info.colony.stage == 1 },
				{ key: "BFSEP-RADE6", text: "Landing on %H is not advised due to high surface radiation levels.", condition: true },
				{ key: "BFSEP-RADE7", text: "Effectively shielding the mining operations from the intense radiation is a substantial challenge.", condition: info.planet.mineralWealth > 0.45 && info.colony.stage > 0 },
				{ key: "BFSEP-RADE8", text: "The cost of radiation shielding makes extraction of %H's %M deposits impractical.", condition: !info.colony.founded && info.planet.mineralWealth > 0.45 },
				{ key: "BFSEP-RADE9", text: "The crust of %H is thick with Uranium and other radioactive elements. The strongly ionising radiation is virtually impossible to adequately shield against.", condition: true },
				{ key: "BFSEP-RADE10", text: "At "+Math.floor(info.planet.surfaceRadiation)+" Fd, the surface radiation levels on %H are some of the highest recorded on a habitable zone planet.", condition: true },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,15,true));


		} else if (info.planet.surfaceRadiation > 0.3) {
			// ~150
			block.importance = 15;
			opts = [
				{ key: "BFSEP-RADH1", text: "The surface radiation level on %H is around "+info.planet.surfaceRadiation.toFixed(2)+" Fd.", condition: true },
				{ key: "BFSEP-RADH2", text: "Surface radiation on %H is sufficient to cause serious harm after a few days of unprotected exposure.", condition: info.planet.surfaceRadiation > 0.6 },
				{ key: "BFSEP-RADH3", text: "The surface of %H is subject to radiation above safe levels for all species. "+info.species.pluralName("Lobster")+" and "+info.species.pluralName("Insect")+" will start experiencing ill effects after several days of exposure, while other species will be affected considerably more quickly. "+info.species.name("Human")+" and "+info.species.name("Frog")+" visitors should wear protective clothing at all times.", condition: info.planet.surfaceRadiation < 0.3 },
				{ key: "BFSEP-RADH4", text: "The high surface radiation levels have made %H uneconomical to settle.", condition: !info.colony.founded },
				{ key: "BFSEP-RADH5", text: "Due to high radiation levels, all permanent settlements are aboard well-shielded orbital stations.", condition: info.colony.stage == 1 },
				{ key: "BFSEP-RADH6", text: "Mining in the high radiation environment of %H requires constant replacement of radiation shielding.", condition: info.planet.mineralWealth > 0.45 },
				{ key: "BFSEP-RADH7", text: "While the surface radiation on %H is not instantly fatal, all species are advised to wear protective clothing and minimise exposure.", condition: true },
				{ key: "BFSEP-RADH8", text: "%S proximity to %U means that the atmosphere is insufficient to prevent hard ultra-violet radiation striking the surface.", condition: info.planet.cloudAlpha > 0 },
				{ key: "BFSEP-RADH9", text: "The surface settlements on %H are all heavily shielded against radiation.", condition: info.colony.stage > 1 },
				{ key: "BFSEP-RADH10", text: "The radiation levels on %H vary considerably depending on solar activity, but can peak at around "+info.planet.surfaceRadiation.toFixed(2)+" Fd.", condition: info.star.instability > 0.3 },
				{ key: "BFSEP-RADH11", text: "%H combines high surface radiation and a lack of useful resources, and so remains uninhabited.", condition: !info.colony.founded && info.planet.mineralWealth < 0.25 },
				{ key: "BFSEP-RADH12", text: "Surface radiation in excess of "+info.planet.surfaceRadiation.toFixed(2)+" Fd has discouraged all species from attempting to settle here.", condition: !info.colony.founded }
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,25,true));


		} else if (info.planet.surfaceRadiation > 0.07 && info.colony.stage > 0) {
			// ~250
			block.importance = 10;
			opts = [
				{ key: "BFSEP-RADM1", text: "The radiation levels on %H are considered above the long-term safe limits for all species except "+info.species.pluralName("Insect")+" and "+info.species.pluralName("Lobster")+". Provided that they generally remain underground, "+info.species.pluralName("Rodent")+" should also not receive a harmful dose.", condition: true },
				{ key: "BFSEP-RADM2", text: "The mean surface radiation level of "+info.planet.surfaceRadiation.toFixed(2)+" Fd is above the recommended safe level for several species. Brief exposure is unlikely to be harmful, but long-term residents will need to take precautions.", condition: true },
				{ key: "BFSEP-RADM3", text: "Members of less radiation-tolerant species should take sensible precautions when visiting the surface.", condition: true },
				{ key: "BFSEP-RADM4", text: "While it is not the most serious issue, radiation levels on %H are above long-term recommended limits, and visitors must ensure that their protective gear includes suitable shielding.", condition: info.habitability.best < 50 },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,75,true));

		} else if (info.planet.surfaceRadiation > 0.02 && info.colony.stage > 0) {
			// ~325
			block.importance = 5;
			opts = [
				{ key: "BFSEP-RADL1", text: "The surface radiation level is above the safe long-term level for "+info.species.pluralName("Frog")+" and "+info.species.pluralName("Human")+", and may in some areas exceed that for other species. Common anti-radiation precautions will generally be sufficient.", condition: true },
				{ key: "BFSEP-RADL2", text: "The mean surface radiation level is around "+info.planet.surfaceRadiation.toFixed(2)+" Fd.", condition: true }
			];
			// unlimited for now
			do {
				opt = opts[info.r.rand(opts.length)];
				block.key = opt.key;
				block.text = opt.text;
			} while (!opt.condition);

		}

		if (block.text != "") {
			blocks.push(block);
			block = {
				importance: 0,
				displayOrder: 1,
				key: "",
				text: ""
			}
		}

		// earthquakes
		// >0.5 very rare
		// >0.3 cause problems for all species
		// >0.1 cause problems for land-based species
		// >0.01 cause problems for subterranean species
		if (info.planet.seismicInstability > 0.5) {
			importance = 40;
			opts = [
				{ key: "BFSEP-QUKX1", text: "The crust of %H is extremely unstable and severe earthquakes are common.", condition: true },
				{ key: "BFSEP-QUKX2", text: "%H is geologically unstable, with frequent earthquakes.", condition: true },
				{ key: "BFSEP-QUKX3", text: "The high frequency of severe earthquakes on %H has made it uninhabitable.", condition: !info.colony.founded },
				{ key: "BFSEP-QUKX4", text: "The orbital station above the planet contains several instruments for monitoring its unstable crust.", condition: info.colony.stage == 1 },
				{ key: "BFSEP-QUKX5", text: "The highly unstable crust of %H brings a range of minerals to the surface, but makes safely extracting them difficult.", condition: info.planet.mineralWealth > 0.45 },
				{ key: "BFSEP-QUKX6", text: "Gravitational forces from other bodies in the %U system distort %S crust, causing major earthquakes.", condition: true },
				{ key: "BFSEP-QUKX7", text: "The ground of %H is far too unstable for settlement, and its fragmented crust has no stable zones.", condition: !info.colony.founded },
				{ key: "BFSEP-QUKX8", text: "Zettajoule earthquakes have been recorded from space on %S fragile surface.", condition: true },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,5,true));

		} else if (info.planet.seismicInstability > 0.3) {
			// ~130
			block.importance = 10;
			opts = [
				{ key: "BFSEP-QUKH1", text: "Large earthquakes are common on %H.", condition: true },
				{ key: "BFSEP-QUKH2", text: "%H is believed to have formed around a billion kD later than the rest of the system, and large earthquakes are common.", condition: true },
				{ key: "BFSEP-QUKH3", text: "The instability of %S crust has been a major factor in the lack of settlement.", condition: !info.colony.founded },
				{ key: "BFSEP-QUKH4", text: "The surface of %H does not contain permanent settlements due to the lack of seismically stable areas.", condition: info.colony.stage == 1 },
				{ key: "BFSEP-QUKH5", text: "%M is readily available on %H, but the frequency of earthquakes means that only shallow excavation is practical.", condition: info.planet.mineralWealth > 0.45 },
				{ key: "BFSEP-QUKH6", text: "After long-term monitoring, it does not appear that any part of %S surface is safe from major earthquakes. ", condition: info.colony.stage < 1 },
				{ key: "BFSEP-QUKH7", text: "The frequency of major earthquakes on %H is too great for even non-land species to easily construct permanent habitats.", condition: true },
				{ key: "BFSEP-QUKH8", text: "Settlement of %H is restricted to the few seismically stable areas.", condition: info.colony.stage > 1 },
				{ key: "BFSEP-QUKH9", text: "%H has frequent major earthquakes, and no safe settlement sites have yet been identified.", condition: !info.colony.founded },
			];
			
			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,20,true));

		} else if (info.planet.seismicInstability > 0.1 && info.colony.stage > 1) {
			// ~175
			block.importance = 1;
			var sur = info.colony.species.indexOf("Lizard") > -1 || 
				info.colony.species.indexOf("Frog") > -1 || 
				info.colony.species.indexOf("Human") > -1 || 
				info.colony.species.indexOf("Feline") > -1;
			var sub = info.colony.species.indexOf("Rodent") > -1;

			opts = [
				{ key: "BFSEP-QUKM1", text: "%H remains seismically active, and most settlements are constructed away from fault lines.", condition: true },
				{ key: "BFSEP-QUKM2", text: "Surface settlements have been reinforced against earthquakes.", condition: sur },
				{ key: "BFSEP-QUKM3", text: "Surface settlements have been constructed away from fault lines to protect them from earthquakes.", condition: sur },
				{ key: "BFSEP-QUKM4", text: "Inaccuracies in early surveying lead to %NN %Y being founded very close to the major %N fault. The buildings have been significantly reinforced.", condition: sur && info.colony.founded < 5 },
				{ key: "BFSEP-QUKM5", text: "The original aquatic settlements on %H were not greatly bothered by earthquakes, though later land settlements avoid fault lines.", condition: info.colony.species[0] == "Lobster" },
				{ key: "BFSEP-QUKM6", text: "The original lightweight %I settlements were not significantly affected by %S earthquakes, and the ability to fly away also helped.", condition: info.colony.species[0] == "Bird" || info.colony.species[0] == "Insect" },
				{ key: "BFSEP-QUKM7", text: "The seismic instability of %H, while manageable by most species, has required special care in strengthening the %IR tunnels.", condition: sub  },
				{ key: "BFSEP-QUKM8", text: "The seismic activity on %H has restricted significant colonisation to %IS and %I1S only.", condition: !sur && !sub && info.colony.species.length > 1 },
				{ key: "BFSEP-QUKM9", text: "The flying %IS are not significantly affected by %S earthquakes.", condition: !sur && !sub && info.colony.species.length == 1 && info.colony.species[0] != "Lobster" },
				{ key: "BFSEP-QUKM10", text: "%S earthquakes are rarely felt in the deep ocean cities of the planet.", condition: !sur && !sub && info.colony.species.length == 1 && info.colony.species[0] == "Lobster" },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,20,true));

		} else if (info.planet.seismicInstability > 0.01 && info.colony.stage > 1 && info.colony.species.indexOf("Rodent") != -1) {
			// ~175
			block.importance = 1;

			opts = [
				{ key: "BFSEP-QUKL1", text: "The %IR portions of settlements on %H have been carefully reinforced against earthquakes.", condition: info.colony.species.length > 1 },
				{ key: "BFSEP-QUKL2", text: "While solid building construction is sufficient for most inhabitants of %H, the %IR tunnels are restricted to the most stable parts of the continental interiors.", condition: info.colony.species.length > 1 },
				{ key: "BFSEP-QUKL3", text: "Finding worlds with suitably low seismic activity was difficult for the %IRS, and even %H is a compromise which restricts the safe locations for their tunnel cities.", condition: true },
				{ key: "BFSEP-QUKL4", text: "The %IRS have constructed their cities in unusually shallow tunnels here, and even above ground, for greater resilience to earthquakes.", condition: true },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,20,true));

		} else if (info.planet.seismicInstability == 0) {
			// ~30
			block.importance = 20;
			opts = [
				{ key: "BFSEP-QUKN1", text: "The surface of %H is extremely stable, with no quakes above terajoule magnitude recorded.", condition: true },
				{ key: "BFSEP-QUKN2", text: "The near-perfect stability of %S crust has made it ideal for the %IRS.", condition: info.colony.species.indexOf("Rodent") != -1 },
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
			block = {
				importance: 0,
				displayOrder: 1,
				key: "",
				text: ""
			}
		}

		// high winds
		if (info.planet.windFactor > 0.56) {
			// ~50
			// above Rodent
			block.importance = (info.planet.windFactor*50)+20;
			opts = [
				{ key: "BFSEP-WINX1", text: "The intense storms of %H are regularly visible from orbit.", condition: true },
				{ key: "BFSEP-WINX2", text: "%H experiences some of the most energetic lightning discharges of any known rocky world.", condition: true },
				{ key: "BFSEP-WINX3", text: "The storms of %H are powerful enough to damage even shielded craft.", condition: !info.colony.founded },
				{ key: "BFSEP-WINX4", text: "Surface operations on %H are rare as the intense storms are hazardous even for adapted craft.", condition: info.colony.stage == 1 },
				{ key: "BFSEP-WINX5", text: "The surface habitats on %H have had to be extensively shielded from the intense lightning and acidic rain.", condition: info.colony.stage > 1 },
				{ key: "BFSEP-WINX6", text: "Heating from %U combined with a relatively slow daily rotation causes extremely stormy weather patterns.", condition: info.planet.rotationalVelocity < 0.0007 },
				{ key: "BFSEP-WINX7", text: "The mostly oceanic surface allows extremely powerful and long-lasting storms to form.", condition: info.planet.landFraction < 0.1 },
				{ key: "BFSEP-WINX8", text: "The highly ionised atmosphere of %H is dangerous for ships to enter, and makes even orbital stations too costly to be viable.", condition: !info.colony.founded },
				{ key: "BFSEP-WINX9", text: "%S atmosphere is highly corrosive and subject to intense winds.", condition: !info.colony.founded },
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));

		} else if (info.planet.windFactor > 0.35 && info.colony.stage > 1) {
			block.importance = 20;
			// ~50
			// above Lobster
			var only = info.colony.species.indexOf("Rodent") != -1 && info.colony.species.length == 0;
			var contains = info.colony.species.indexOf("Rodent") != -1;
			var first = info.colony.species[0] == "Rodent";
			opts = [
				{ key: "BFSEP-WINH1", text: "The subterranean habitats of the %IS are the only ones able to cope with the severe storms. ", condition: only },
				{ key: "BFSEP-WINH2", text: "Almost all the population on %H are %IRS as few others can cope long-term with the underground living the planet's severe storms require.", condition: only },
				{ key: "BFSEP-WINH3", text: "The settlements of those who came to %H later are integrated into the original %IR tunnels to protect them from storms.", condition: first && !only },
				{ key: "BFSEP-WINH4", text: "The intense lightning of %H made shielding the original settlements difficult.", condition: contains && !first },
				{ key: "BFSEP-WINH5", text: "Settlement is restricted to polar areas where the storms are less intense.", condition: !contains },
				{ key: "BFSEP-WINH6", text: "Most of %S surface is subject to frequent hurricanes.", condition: true },
				{ key: "BFSEP-WINH7", text: "The electrical storms of %H are often intense enough to be spotted from orbit.", condition: true },
			];
			
			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));

		} else if (info.planet.windFactor > 0.1 && info.colony.stage > 1 && (info.colony.species.indexOf("Bird") > -1 || info.colony.species.indexOf("Insect") > -1)) {
			block.importance = (info.planet.windFactor*10)-10;
			// ~200
			// above Flying
			opts = [
				{ key: "BFSEP-WINL1", text: "The storms of %H can be a risk to natural flight, but are generally forecast sufficiently in advance", condition: true },
				{ key: "BFSEP-WINL2", text: "%IS settled %H despite its high winds because of its otherwise good environment.", condition: info.colony.species.length == 0 && info.habitability[info.colony.species[0]] > 80 },
				{ key: "BFSEP-WINL3", text: "The high winds of %H occasionally disrupt surface-orbit traffic, though usually for no more than a local day.", condition: true },
				{ key: "BFSEP-WINL4", text: "The usual lightweight %IB settlements have had to be specially reinforced to resist %S high winds.", condition: info.colony.species.indexOf("Bird") > -1 },
				{ key: "BFSEP-WINL5", text: "The usual lightweight %II settlements have had to be specially reinforced to resist %S high winds.", condition: info.colony.species.indexOf("Insect") > -1 },
				{ key: "BFSEP-WINL6", text: "The wet season on %H is known for its spectacular storms.", condition: info.economy.type == "Tourism" }
			];

			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,25,true));
		}

		if (block.text != "") {
			blocks.push(block);
			block = {
				importance: 0,
				displayOrder: 1,
				key: "",
				text: ""
			}
		}
		
		// star instability
		if (info.star.instability > 0.5) {
			// ~50
			block.importance = Math.floor(info.star.instability * 100);
			opts = [
				{ key: "BFSEP-STARX1", text: "%U is a highly variable star.", condition: true },
				{ key: "BFSEP-STARX2", text: "%U is a high-intensity flare star. Major solar flares can overwhelm unshielded equipment without warning.", condition: info.star.sequence.match(/Class M/) }, // flare star
				{ key: "BFSEP-STARX3", text: "The brightness of %U varies considerably over a period of "+(info.r.rand(300)+200)+" days.", condition: info.star.sequence == "Red giant" }, // Mira variable
				{ key: "BFSEP-STARX4", text: "The instability of %U has meant that this system has not been colonised.", condition: !info.colony.founded },
				{ key: "BFSEP-STARX5", text: "The orbital station has been carefully designed to resist the effects of solar flares.", condition: info.colony.stage == 1 },
				{ key: "BFSEP-STARX6", text: "The upper atmosphere of %U is extremely variable.", condition: info.star.sequence == "Class A" }, // RoAp variable
				{ key: "BFSEP-STARX7", text: "Despite the significant and unpredictable changes in stellar output, %H remains habitable.", condition: info.habitability.best > 70 },
				{ key: "BFSEP-STARX8", text: "The settlements on %H are adapted to %U's variability and intense solar flares.", condition: info.colony.stage > 1 },
				{ key: "BFSEP-STARX9", text: "The expense of shielding against the dangerous solar flares of %U has made colonising this system uneconomical.", condition: !info.colony.founded },
				{ key: "BFSEP-STARX10", text: "Large solar flares from %U are extremely common. Ships travelling close to the star should be extremely cautious.", condition: true }
			];
			
			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));
			

		} else if (info.star.instability > 0.3) {			
			// ~200
			block.importance = Math.floor(info.star.instability * 10);
			opts = [
				{ key: "BFSEP-STARH1", text: "%U is a variable star.", condition: true },
				{ key: "BFSEP-STARH2", text: "%U is a Class M flare star. Ships traversing close to the star should be aware of the risk of solar flares.", condition: info.star.sequence.match(/Class M/) }, // flare star
				{ key: "BFSEP-STARH3", text: "The red giant %U undergoes significant visible brightness changes.", condition: info.star.sequence == "Red giant" }, // Mira variable
				{ key: "BFSEP-STARH4", text: "The unpredictable temperature of %H, caused by variation in %U's output, makes it uninhabitable.", condition: !info.colony.founded },
				{ key: "BFSEP-STARH5", text: "The surface of %H is alternately frozen and burnt by the unsteady rays of %U.", condition: info.planet.cloudAlpha == 0 },
				{ key: "BFSEP-STARH6", text: "The brightness of %U varies daily due to surface instability.", condition: info.star.sequence == "Class F" }, // Gamma Doradus variable
				{ key: "BFSEP-STARH7", text: "The risk of intense solar flares has led to the system remaining uninhabited.", condition: !info.colony.founded },
				{ key: "BFSEP-STARH8", text: "The thick atmosphere of %H protects the surface from %U's flares, but orbital space is too hostile to set up stations, and so the system remains uninhabited.", condition: !info.colony.founded  && info.habitability.best > 90},
				{ key: "BFSEP-STARH9", text: "The orbital station at %H is well-shielded against solar flares.", condition: info.colony.stage == 1 },
				{ key: "BFSEP-STARH10", text: "The gradual dimming and brightening of %U gives %H its seasons.", condition: info.colony.stage > 1 },
				{ key: "BFSEP-STARH11", text: "The brightness of %U can vary significantly over a period of several days.", condition: true },
				{ key: "BFSEP-STARH12", text: "The unpredictability of %U has made it impossible to place stable settlements in the system.", condition: true },
				{ key: "BFSEP-STARH13", text: "Early surveys noted the danger to habitation from %U's solar flares, and the system remains uneconomical to colonise.", condition: !info.colony.founded },
				{ key: "BFSEP-STARH14", text: "The chromosphere of %U is unusually unstable.", condition: true },
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
			block = {
				importance: 0,
				displayOrder: 1,
				key: "",
				text: ""
			}
		}
		
		
		if (!info.colony.founded) {
			if (info.planet.mineralWealth > 0.7) {
				block.importance = 75;
				// ~5 still uninhabited...
				opts = [
					{key: "BFSEP-MINX1", text: "The surface of %H is extremely rich in mineral deposits.", condition: true },
					{key: "BFSEP-MINX2", text: "Surveys have found very large reserves of %M.", condition: true },
					{key: "BFSEP-MINX3", text: "%H has extremely high concentrations of %M in its crust.", condition: true },
					{key: "BFSEP-MINX4", text: "Many of the asteroids in the %U system contain valuable metals.", condition: true },
					{key: "BFSEP-MINX5", text: "The %U system is extremely mineral rich.", condition: true },
				];

				do {
					do {
						opt = opts[info.r.rand(opts.length)];
						block.key = opt.key;
						block.text = opt.text;
					} while (!opt.condition);
				} while (!checkKey(block.key,1,true));

			} else if (info.planet.mineralWealth > 0.45) {
				// ~75
				block.importance = 25;
				opts = [
					{ key: "BFSEP-MINH1", text: "Surveys have discovered significant deposits of %M on %H.", condition: true },
					{ key: "BFSEP-MINH2", text: "%H's surface is rich in valuable minerals.", condition: true },
					{ key: "BFSEP-MINH3", text: "The %U system is believed to have substantial metal reserves.", condition: true },
					{ key: "BFSEP-MINH4", text: "The system's asteroids are particularly high in %M.", condition: true }
				];

				do {
					do {
						opt = opts[info.r.rand(opts.length)];
						block.key = opt.key;
						block.text = opt.text;
					} while (!opt.condition);
				} while (!checkKey(block.key,35,true));

			} else if (info.planet.mineralWealth > 0.25) {
				block.importance = 5;
				// ~275
				opts = [
					{ key: "BFSEP-MINM1", text: "Initial surveys have shown an above average level of metal reserves in the %U system.", condition: true },
					{ key: "BFSEP-MINM2", text: "%H has plentiful supplies of %M.", condition: true },
					{ key: "BFSEP-MINM3", text: "Surveys have detected extractable %M in the asteroids of this system.", condition: true },
					{ key: "BFSEP-MINM4", text: "%H has an above average level of economically valuable metals.", condition: true },
					{ key: "BFSEP-MINM5", text: "In addition to a pleasant environment, %H has reasonably high mineral reserves.", condition: info.habitability.best > 80 },
					{ key: "BFSEP-MINM6", text: "The moderate reserves of %M on %H have so far not been economical to extract.", condition: info.habitability.best < 40 },
					{ key: "BFSEP-MINM7", text: "While the %H system has high quantities of %M, they are generally deep below %S surface and would be costly to extract.", condition: true },
					{ key: "BFSEP-MINM8", text: "%H has some deposits of economic minerals, but not in sufficient concentrations to yet be cost-effective to extract.", condition: true }
				];				

				do {
					do {
						opt = opts[info.r.rand(opts.length)];
						block.key = opt.key;
						block.text = opt.text;
					} while (!opt.condition);
				} while (!checkKey(block.key,50,true));

			}
		}		

		if (block.text != "") {
			blocks.push(block);
			block = {
				importance: 0,
				displayOrder: 1,
				key: "",
				text: ""
			}
		}

		if (info.habitability.best == 100 && info.colony.homeWorld == 0) {
			// ~30, all inhabited, ideal for two species is incredibly rare
			var sl = info.species.list();
			var ideal = [];
			for (var k=0;k<sl.length;k++) {
				if (info.habitability[sl[k]] == 100) {
					ideal.push(sl[k]);
				}
			}

			var ideals = ideal.map(function(x) { return info.species.name(x); });
			var idealp = ideal.map(function(x) { return info.species.pluralName(x); });
			block.importance = 45*ideal.length;
			opts = [
				{ key: "BFSEP-HABP1", text: "%S environment is ideally suited to "+idealp[0]+".", condition: ideal.length == 1 },
				{ key: "BFSEP-HABP2", text: "%H has a great resemblence to the "+ideals[0]+" home world.", condition: ideal.length == 1 },
				{ key: "BFSEP-HABP3", text: "Almost all of %S surface is suitable for "+ideals[0]+" habitation.", condition: ideal.length == 1 },
				{ key: "BFSEP-HABP4", text: "There are few systems better than %U for "+idealp[0]+".", condition: ideal.length == 1 },
				{ key: "BFSEP-HABP5", text: "%H is extremely unusual in having ideal habitation conditions for both "+idealp[0]+" and "+idealp[1]+".", condition: ideal.length > 1 }
			];
			
			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));

			
		}


		return blocks;
	}


	// some basic description blocks for uninteresting uninhabited worlds
	var blocksForUninhabitedEnvironmentProperties = function(info) {
		var block;
		var blocks = [];

		block = {
			importance: -1,
			displayOrder: 13,
			key: "",
			text: "Surface gravity: "+(info.planet.surfaceGravity*9.81).toFixed(2)+"m/s²."
		};
		blocks.push(block);

		if (info.planet.temperature <= 30 && info.planet.temperature >= -5) {
			block = {
				importance: -1,
				displayOrder: 13,
				key: "",
				text: "Mean surface temperature: "+(info.planet.temperature+273).toFixed(0)+" K."
			};
			blocks.push(block);
		}

		if (info.planet.surfaceRadiation <= 0.3) {
			block = {
				importance: -1,
				displayOrder: 13,
				key: "",
				text: "Normalised surface radiation: "+(info.planet.surfaceRadiation).toFixed(3)+" Fd."
			};
			blocks.push(block);
		}

		if (info.planet.seismicInstability <= 0.3 && info.planet.seismicInstability > 0) {

			var seisExa = function(inst) {
				if (inst < 0.01) {
					return "minimal";
				} else if (inst < 0.1) {
					return "low";
				} else if (inst < 0.2) {
					return "moderate";
				} else {
					return "high";
				}
			}

			block = {
				importance: -1,
				displayOrder: 13,
				key: "",
				text: "Seismic activity: "+seisExa(info.planet.seismicInstability)+"."
			};
			blocks.push(block);
		}

		if (info.planet.windFactor == 0) {
			block = {
				importance: -1,
				displayOrder: 13,
				key: "",
				text: "Extremely thin atmosphere."
			};
			blocks.push(block);
		} else if (info.planet.windFactor <= 0.35) {
			var windExa = function(inst) {
				if (inst < 0.02) {
					return "rare";
				} else if (inst < 0.1) {
					return "normal";
				} else if (inst < 0.2) {
					return "frequent";
				} else {
					return "severe";
				}
			}

			block = {
				importance: -1,
				displayOrder: 13,
				key: "",
				text: "Winds/Storms: "+windExa(info.planet.windFactor)+"."
			};
			blocks.push(block);
		}



		return blocks;
	};


	var blocksForGovernmentAndStability = function (info) {
		var blocks = [];
		var opt, opts = [];
		var block = {
			importance: info.politics.governmentCategory == "Atypical"?55:40,
			displayOrder: 12,
			key: "",
			text: ""
		}
		// mostly condition: true
		switch (info.politics.governmentType) {
			// expect 30-60 for conventional and disordered forms
			// ~10 for atypical forms
		case "Company Monopoly":
			opts = [
				{ key: "BFGAS-COMO1", text: "The %NB owns all infrastructure in the system, and its board of directors has absolute control over operations", condition: true },
				{ key: "BFGAS-COMO2", text: "All companies in %U are subsidiaries of the system-wide %NB.", condition: true },
				{ key: "BFGAS-COMO3", text: "The %NB has rapidly converted its original control of the orbital infrastructure into general ownership of all system companies.", condition: true },
				{ key: "BFGAS-COMO4", text: "Over ninety percent of the system's product is controlled by the %NB.", condition: true },
				{ key: "BFGAS-COMO5", text: "The %NB has gradually taken ownership of all operations in the system. While there is officially a separate government their role is nowadays entirely ceremonial.", condition: true },
				{ key: "BFGAS-COMO6", text: "The existence of independent business in %U is not permitted and the %NB will buy out or take more hostile steps against any that operate there. Trade is strictly regulated.", condition: true },
				{ key: "BFGAS-COMO7", text: "The %NB provides lifelong support for its workers from birth to death, including training, medical treatment, housing, food and luxuries appropriate to their job grade.", condition: true },
			];
			break;
		case "Capitalist Plutocracy":
			opts = [
				{ key: "BFGAS-CAPL1", text: "Real power on %H is exercised by a small number of ultra-rich people, whose collective control over many diverse industries makes them impossible for the weak planetary government to challenge.", condition: true },
				{ key: "BFGAS-CAPL2", text: "The original shares in the planet's wealth have over time become concentrated in the hands of a few hundred people.", condition: true },
				{ key: "BFGAS-CAPL3", text: "Bribery of legislators is extremely common on %H, with billions of credits openly changing hands over votes on the more important laws.", condition: true },
				{ key: "BFGAS-CAPL4", text: "The current ruler of %H, %ND, has been content to take a hands-off approach and leave governance of the system to their wealthy benefactors.", condition: true },
				{ key: "BFGAS-CAPL5", text: "Low taxation and loose regulation has allowed a small number of %S citizens to accumulate vast wealth. The majority, however, struggle to afford necessities.", condition: true },
				{ key: "BFGAS-CAPL6", text: "A fragmented government has allowed many of %S richest people to avoid laws they find inconvenient by moving to other parts of the planet.", condition: true },
				{ key: "BFGAS-CAPL7", text: "Everything has a price on %H, with the small central government largely funded through the sale of legal exception vouchers.", condition: true },
			];
			break;
		case "Corporate System":
			opts = [
				{ key: "BFGAS-COSY1", text: "The initial settling of the %U system was funded by several corporations, and they or their successors still retain control of largely the same infrastructure as before.", condition: true },
				{ key: "BFGAS-COSY2", text: "The %XL %Bs which control most of the planetary operations have mutual agreements not to interfere with each other's operations.", condition: true },
				{ key: "BFGAS-COSY3", text: "Fear of being on the losing side of a monopoly causes the companies of %H to band together against any seen as too ambitious or successful. A range of companies regularly rise up to control several percent of the system product, before being perceived as dangerously successful and shut off from their key suppliers.", condition: true },
				{ key: "BFGAS-COSY4", text: "The %Bs of %H are continually in fierce competition, with profit margins low and mergers, takeovers and bankruptcies common.", condition: true },
				{ key: "BFGAS-COSY5", text: "While the %NB is the largest company on %H, there are several major competitors, including the %N %B.", condition: true },
				{ key: "BFGAS-COSY6", text: "From the time of initial settlement, there has been no central government as such in %U, but there are a set of operating agreements which all companies wishing to do business must sign - including aggressive enforcement against breaches of the agreements.", condition: true },
				{ key: "BFGAS-COSY7", text: "A stable balance of power has emerged between the %B of %H, which each have near-monopoly control of individual aspects of planetary operations.", condition: true },
			];
			break;
		case "Timocracy":
			opts = [
				{ key: "BFGAS-TIMO1", text: "Following widespread tax evasion nearly bankrupting the %H government, it became possible for positions up to cabinet level to be bought for a suitable price, most of which was put into the department's annual budget.", condition: true },
				{ key: "BFGAS-TIMO2", text: "While in law %S government is democratic, the requirement for full citizens to own at least %X %L"+(info.r.rand(4)+1)+" credits of assets has led to its reclassification by the USC.", condition: true },
				{ key: "BFGAS-TIMO3", text: "Government funding is raised on %H by the auctioning of laws. For the relatively small sum of %X %L"+(info.r.rand(3))+" credits, a law may be put to the vote. The for and against sides then place competing bids for its adoption or rejection.", condition: true },
				{ key: "BFGAS-TIMO4", text: "A property qualification of %X %L"+(info.r.rand(4)+1)+" credits of taxable wealth restricts voting on %H to a wealthy minority.", condition: true },
				{ key: "BFGAS-TIMO5", text: "Individual votes on %H can be purchased for around one hundred credits, or lower for local laws. Most are bought in bulk by political and corporate consortia.", condition: true },
				{ key: "BFGAS-TIMO6", text: "The original settlers of %H issued %X %L1 shares in the planetary government - one each - as voting rights. There was no mechanism for issuing new shares, however, and the existing shares currently change hands for over %X %L"+(info.r.rand(info.colony.stage))+" credits each.", condition: info.colony.stage > 3 },
				{ key: "BFGAS-TIMO7", text: "Following several scandals, the councillors of %S government unionised, and now publish an agreed cost scale for bribes and other paid legislative duties. Undercutting ones colleagues is punished severely.", condition: true },
			];
			break;
		case "Republican Democracy":
			opts = [
				{ key: "BFGAS-REDE1", text: "Elections to the %H government are held every %X planetary years.", condition: true },
				{ key: "BFGAS-REDE2", text: "The %H government consists of a bicameral legislature elected in alternate kDs, and two joint Presidents each representing the largest party in each legislature.", condition: true },
				{ key: "BFGAS-REDE3", text: "Regional elections on %H provide senators to the legislature, which appoints the executive from within its membership.", condition: true },
				{ key: "BFGAS-REDE4", text: "The vast majority of seats in the %H government belong to the "+info.names.party1+" and "+info.names.party2+" parties.", condition: true },
				{ key: "BFGAS-REDE5", text: "The "+info.names.party1+" party has held a majority of the seats in the government since the %D11 elections.", condition: true },
				{ key: "BFGAS-REDE6", text: "Elections to %S unicameral legislature are held every %X planetary years, with elections to the planetary executive held half-way between.", condition: true },
				{ key: "BFGAS-REDE7", text: "The majority of %S political parties are aligned with either the "+info.names.party1+" or "+info.names.party2+" coalitions.", condition: true },
			];
			break;
		case "Federal Democracy":
			opts = [
				{ key: "BFGAS-FEDE1", text: "Government on %H operates in a tiered structure. Citizens elect representatives to their local governments, and those representatives elect the regional councillors, who elect the planetary senators.", condition: true },
				{ key: "BFGAS-FEDE2", text: "Representatives of %S %XL regions meet in %NC to elect the planetary government.", condition: info.colony.stage > 2 },
				{ key: "BFGAS-FEDE3", text: "The responsibilities of %S different layers of government are strictly demarcated. The planetary government is not allowed to pass laws affecting areas in the competence of a local or regional government.", condition: true },
				{ key: "BFGAS-FEDE4", text: "The constitution of %H places increasingly stricter requirements on the passing of laws the greater their area of effect. In general most planetary laws are passed by two-thirds of regions passing identical laws, rather than directly at the planetary level.", condition: true },
				{ key: "BFGAS-FEDE5", text: "Laws in %H are drafted at a planetary level, and then must be approved by at least three quarters of the local assemblies, making up majorities of all regional areas.", condition: true },
				{ key: "BFGAS-FEDE6", text: "The planetary government only manages inter-system trade and diplomacy, with all other matters delegated to autonomous regional governments.", condition: true },
				{ key: "BFGAS-FEDE7", text: "Citizens on %H only directly elect the most local tier of representatives, with other political bodies elected by those representatives.", condition: true },

			];
			break;
		case "Demarchy":
			opts = [
				{ key: "BFGAS-DEMA1", text: "The ministers of %S government are selected by lot from the planetary population every %XS years.", condition: true },
				{ key: "BFGAS-DEMA2", text: "While conventional elections are used to appoint the drafters of laws on %H, the adoption of laws is decided by panels randomly selected from the population.", condition: true },
				{ key: "BFGAS-DEMA3", text: "Each governmental decision on %H is placed before a randomly selected citizen, who can either approve, reject or pass the decision to another.", condition: true },
				{ key: "BFGAS-DEMA4", text: "All government officials on %H are chosen randomly from those who put themselves forward for election.", condition: true },
				{ key: "BFGAS-DEMA5", text: "%H combines federal and demarchic government. Appointment to the lowest layers of government is from the population, but advancement to higher layers is by random selection within the lower layers.", condition: true },
				{ key: "BFGAS-DEMA6", text: "Each citizen on reaching the age of majority is placed in a queue. Upon reaching the top they make the next governmental decision and return to the end of the queue. In an average lifespan they can expect to perform this civic duty around %XL times.", condition: true },
				{ key: "BFGAS-DEMA7", text: "Following serious corruption in the previous government, a popular revolution in %D9 instituted demarchic governance to make abuse of power much more difficult.", condition: true },
			];
			break;
		case "Direct Democracy":
			opts = [
				{ key: "BFGAS-DIDE1", text: "All legislative decisions on %H are made by a direct vote of those affected, with votes taking place every %XL days.", condition: true },
				{ key: "BFGAS-DIDE2", text: "%H uses direct democracy for government decisions. To keep this manageable, as many decisions as possible have been delegated to local levels.", condition: true },
				{ key: "BFGAS-DIDE3", text: "The democratic traditions of %S founders continue today, with any issue not able to achieve the support of at least eighty percent of the government being put to a public vote.", condition: info.colony.stage > 3 },
				{ key: "BFGAS-DIDE4", text: "%H lacks a government in the conventional sense, with all legislative and inter-system decisions being taken by referendum.", condition: true },
				{ key: "BFGAS-DIDE5", text: "Concerns over individual accumulation of power led the %H settlers to place low limits on the authority of their politicians, with all significant decisions voted on by the population as a whole.", condition: true },
				{ key: "BFGAS-DIDE6", text: "All government decisions on %H are subject to being overruled by the people. A petition of %XS thousand citizens - the number chosen when the colony was founded - will put a decision to a public vote.", condition: true },
				{ key: "BFGAS-DIDE7", text: "A constant stream of issues is placed before the %H population for voting, with most votes only remaining open for a few days. The planet's economy dips noticeably when close votes are expected, as the majority of the population takes time off to research and vote.", condition: true },
			];
			break;
		case "Dictatorship":
			opts = [
				{ key: "BFGAS-DICT1", text: "The current ruler of %H, %ND, has theoretically absolute control over the planet.", condition: true },
				{ key: "BFGAS-DICT2", text: "The %H governing council consists of a small number of military, industrial and technological leaders appointed by their predecessors.", condition: true },
				{ key: "BFGAS-DICT3", text: "A series of weak and corrupt governments in the early kDs of %S history led to the institution of a sole dictatorship. Succession is by successful assassination of the current office holder.", condition: true },
				{ key: "BFGAS-DICT4", text: "%ND is the undisputed leader of %H, with their charisma and restriction of alternative views combining to give them substantial personal influence over and above their normal powers.", condition: true },
				{ key: "BFGAS-DICT5", text: "While day-to-day decisions are made by an extensive legislative and executive structure, %ND may personally overrule any decisions and dismiss government members who displease them.", condition: true },
				{ key: "BFGAS-DICT6", text: "A council of %XL members each with their own powerful personal armies keeps an uneasy peace on %H, with the council's decisions being final.", condition: true },
				{ key: "BFGAS-DICT7", text: "%ND runs %H for maximum efficiency, refusing all suggested reforms which might slow down the planet's production.", condition: true },
			];
			break;
		case "Technocracy": // aka research dictatorship (rare)
			opts = [
				{ key: "BFGAS-TECH1", text: "The government on %H is subservient to the powerful research institutions, on whose behalf it manages the day to day business of the planet.", condition: true },
				{ key: "BFGAS-TECH2", text: "%H is ruled by the heads of its %XL largest research organisations.", condition: true },
				{ key: "BFGAS-TECH3", text: "The income brought in by the new discoveries of %S research centres collectively gives them near-total control over %H.", condition: true },
			];
			break;
		case "Feudal Realm":
			opts = [
				{ key: "BFGAS-FEUD1", text: "The %H system is ruled by a hierarchicy of leaders, from %ND at the top through rank after rank, down to the ordinary citizens. At each level, a person must retain the support of a majority of their subordinates, and of their superior, or risk dismissal.", condition: true },
				{ key: "BFGAS-FEUD2", text: "A strict hierarchy of social classes forms the %H government, with only those of high rank allowed an official voice in decisions.", condition: true },
				{ key: "BFGAS-FEUD3", text: "Power in %H is held by a set of several hundred titles, each of which is passed from its current holder to their nominated successor. Should an office holder die or retire without naming a successor, the overall ruler %ND will appoint one.", condition: true },
				{ key: "BFGAS-FEUD4", text: "By dividing governance into strict layers, the %H people claim to have encouraged accountability, by only requiring people to watch those immediately above, below or to the side of them.", condition: true },
				{ key: "BFGAS-FEUD5", text: "The rigid hierarchy of %H allows little possibility of advancement within one's own lifetime, but consistent loyalty to a superior may be rewarded by the granting of a title to your descendants.", condition: true },
				{ key: "BFGAS-FEUD6", text: "The ruler of %H, %ND, theoretically has absolute power, but in practice is heavily constrained by what their inner council will accept. The inner council, meanwhile, must constantly watch for disloyalty among their officers in the outer council.", condition: true },
				{ key: "BFGAS-FEUD7", text: "The traditionalist government of %H requires all officials to nominate a series of successors so that in the event of them leaving office - through death, retirement or promotion - there is a clear way forward.", condition: true },
			];
			break;
		case "Martial Law":
			opts = [
				{ key: "BFGAS-MART1", text: "The rule of %NW is enforced by the extensive military forces they command.", condition: info.colony.militaryBase == 0 },
				{ key: "BFGAS-MART2", text: "The military seized control of %H in a coup in %D10. The heads of the military sections jointly rule the planet.", condition: info.colony.militaryBase == 0 },
				{ key: "BFGAS-MART3", text: "After a breakdown of order following invader attacks on the system, the system military took control.", condition: info.colony.militaryBase == 0 },
				{ key: "BFGAS-MART4", text: "The unpopular former leader %V %NN was overthrown with the support of the military, whose commander %NW is now de facto ruler of the system.", condition: info.colony.militaryBase == 0 },
				{ key: "BFGAS-MART5", text: "Concerns over a lack of USC protection for this system during the invasion led the population to place defence as their highest priority, replacing their previous political structures with military commands.", condition: info.colony.militaryBase == 0 },
				{ key: "BFGAS-MART6", text: "%NW of %H is in overall command of the system's military forces, which are now also responsible for enforcing civilian laws following the collapse of the government.", condition: info.colony.militaryBase == 0 },
				{ key: "BFGAS-MART7", text: "This system is under USC military governance.", condition: info.colony.militaryBase == 1 },
			];
			break;
		case "Family Clans":
			opts = [
				{ key: "BFGAS-FACA1", text: "Family ties are extremely important on %H, with the old established families holding much of the political power through informal means.", condition: true },
				{ key: "BFGAS-FACA2", text: "The inhabitants of %H are divided between six family clans, who each own and control particular regions of the system. The internal workings of each clan are varied, though in all the elders are accorded great respect and make most of the decisions.", condition: true },
				{ key: "BFGAS-FACA3", text: "The governance of %H is largely carried out by the elders of the largest families. Through birth or more usually adoption, around eighty percent of the population belongs to one of these %XL families.", condition: true },
				{ key: "BFGAS-FACA4", text: "%H is divided between %XL families, each of which specialises in a particular area of colony management. Young people who have no particular aptitude for their own family's area will usually arrange to be adopted into the appropriate family in exchange for suitable favours. ", condition: true },
				{ key: "BFGAS-FACA5", text: "While there is a democratic government, loyalty to ones family is far stronger on %H than loyalty to the planet or the government, even among the elected officials.", condition: true },
				{ key: "BFGAS-FACA6", text: "Only those who can trace ancestry back to one of the original %XS thousand settlers of the system are able to gain full citizenship. Rule of the planet is held by the oldest surviving descendants of each settler, though due to overlapping family trees, this is typically only around %XL ten individuals.", condition: true },
				{ key: "BFGAS-FACA7", text: "Powerful alliances between the ruling families of %H govern the system, with occasional adoptions of other highly regarded citizens used to enhance family prestige.", condition: true },
			];
			break;
		case "Socialist":
			opts = [
				{ key: "BFGAS-SCLS1", text: "", condition: true },
				{ key: "BFGAS-SCLS2", text: "", condition: true },
				{ key: "BFGAS-SCLS3", text: "", condition: true },
				{ key: "BFGAS-SCLS4", text: "", condition: true },
				{ key: "BFGAS-SCLS5", text: "", condition: true },
				{ key: "BFGAS-SCLS6", text: "", condition: true },
				{ key: "BFGAS-SCLS7", text: "", condition: true },
			];
		case "Communist":
		case "Independent Communes":
		case "Worker's Cooperative":
		case "Isolationist":
		case "Quarantine":
		case "Anarchist":
		case "Transapientism":
		case "Social Evolutionist":
		case "Cultural Reacher":
		case "Precedentarchy":
		case "Bureaucracy":
		case "Variationist":
		case "United Species Coalition":
		case "United Species Embassy":
		case "Civil War":
		case "Criminal Rule":
		case "Fragmented Rule":
		case "Vigilantism":

		}
		if (opts.length) { // temporary while entries above are completed.
			do {
				do {
					opt = opts[info.r.rand(opts.length)];
					block.key = opt.key;
					block.text = opt.text;
				} while (!opt.condition);
			} while (!checkKey(block.key,10,true));
			blocks.push(block);
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
		info.names = p.get(g,s,"names");
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
		if (info.colony.militaryBase == 1) {
			blocks = blocks.concat(blocksForMilitaryBase(info));
		}

		// Regional
		//  +++ is regional capital
		//  ++ is regional influential non-capital
		//  ++ has goverment against SPA type
		//  + has government against WPA type
		//  ++ government on one side of contested region
		if (info.politics.region > 0) {
			blocks = blocks.concat(blocksForRegionalInfo(info));

		}
		//  +++ is contested system
		//  +++ is independent hub system (not embassy)
		//  ++ independent bottleneck system
		if (info.colony.contested == 1 || info.colony.independentHub == 1 || (info.bottle > 0 && info.politics.region == 0 && info.colony.stage > 0) || info.politics.regionAccession > 0) {
			blocks = blocks.concat(blocksForBorderSystems(info));
		}
		//  ++ hub count 1
		//  + hub count >= 10
		//  + hub count 2, and bottleneck
		//  ++ uninhabited bottleneck
		// TODO: use hc2+bottleneck to make longer routes on map
		

		// Planet/system (importance varies by range)
		//  * radiation levels
		//  * extreme temperatures
		//  * heavy earthquakes
		//  * high winds
		//  * solar instability
		//  * mineral wealth (uninhabited only)
		//  ++ ideal habitability
		//  +++ ideal habitability >1 species
		blocks = blocks.concat(blocksForSystemEnvironmentProperties(info));

		if (!info.colony.founded) {
			blocks = blocks.concat(blocksForUninhabitedEnvironmentProperties(info));
		}
		
		// Government and stability
		//  + government flavour text
		//  ++ atypical government
		//  ++ disorder government
		//  +++ stability is critically low
		//  ++ stability is very high
		//  ++ stability is being lowered by nearby region
		if (info.colony.stage > 0) {
			blocks = blocks.concat(blocksForGovernmentAndStability(info));
		}

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


		// Random flavour for inhabited systems about their culture or geography

		

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
				// shuffles blocks with identical (usually very low) priority
				blocks[i].importance += info.r.randf();
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