
(function() {

	var namegen = {};

	/* Words by category. Words may appear in multiple categories */

	var orbitPositions = [
		"Prime","Secundus","Tertius","Quartus","Quintus",
		"Aleph","Bayt","Gimel","Dalet",
		"I","II","III","IV","V","VI","VII","VIII"
	];

	var constellationPositionsGeneric = [
		"Eye","Height","Point","Rise","Jewel","Gem","Glow","Centre","Tool","Gap"
	];
	var constellationPositionsLizard = [
		"Scale","Tongue","Arm","Foot","Leg","Tail","Beam","Hand","Head"
	];
	var constellationPositionsRodent = [
		"Arm","Foot","Leg","Tail","Paw","Burrow","Tunnel","Shadow","Head"
	];
	var constellationPositionsFeline = [
		"Ear","Nose","Arm","Leg","Tail","Paw","Claw","Back","Head","Whisker"
	];
	var constellationPositionsBird = [
		"Wing","Feather","Flight","Beak","Head","Talon","Branch","Wind"
	];
	var constellationPositionsFrog = [
		"Leg","Foot","Pond","Shore","Mud","Leaf","Leap"
	];
	var constellationPositionsLobster = [
		"Shell","Claw","Pincer","Wave","Crest","Depth","Fin","Hoof","Carapace","Mandible","Calm"
	];
	var constellationPositionsInsect = [
		"Shell","Wing","Eyes","Swarm","Thorax","Sting","Antenna"
	];
	
	var sequenceConcepts = ["Alpha","Beta","Gamma","Delta","Epsilon","Zeta","Eta","Theta","Iota","Kappa","Lambda","Mu","Nu","Xi","Omicron","Pi","Rho","Sigma","Tau","Upsilon","Phi","Chi","Psi","Omega"];

	var paradiseConcepts = [
		"Paradise","Utopia","Dreamland","Eternity","Enchantment","Harmony","Serenity","Tranquility","Sanctuary","Beauty","Bliss","Delight"
	];
	var brightConcepts = [
		"Eye","Life","Light","Jewel","Gem","Chance","Hope","Breath","Orb","Marble","Wanderer","Beacon","Gleam","Harvest","Earth","Air","Soul","Heart","Spirit","Force","Mover","Traveller","Fortune","Faith","Radiance","Shine","Aurora"
	];
	var greenConcepts = [
		"Land","Grove","Wilds","Haven","Shelter","Home","Terminus","Settlement","Colony","Outpost","Work","Bond","Port"
	];
	var hotConcepts = [
		"Inferno","Char","Spark","Pit"
	];
	var coldConcepts = [
		"Ice","Glaze","Rime","Winter"
	];
	var harshConcepts = [
		"Bleakness","Labour","Punishment","Toil","Grave","Tomb","Wreck","Ruin","Folly","Hubris","Pride"
	];
	var radiationConcepts = [
		"Burn","Beacon","Blight","Scorch","Revenge"
	];
	var airlessConcepts = [
		"Rock","Stone","Boulder","Pebble"
	];
	var miningConcepts = [
		"Mine","Quarry","Jewel","Gem","Vein","Riches","Wealth","Abundance","Hoard","Pearl","Prize","Claim","Yield","Dig","Chasm","Abyss"
	];
	var oceanConcepts = [
		"Ocean","Sea","Waters","Deeps","Abyss","Waters","Lagoon"
	];
	var redConcepts = [
		"Ruby","Rust","Blood","Amber","Garnet","Crimson","Red","Copper"
	];
	var greenRockConcepts = [
		"Green","Agate","Beryl","Emerald","Moss","Jade"
	];
	var blueConcepts = [
		"Blue","Azure","Sapphire","Lapis","Lazuli","Topaz","Turquoise"
	];

	var corporateConcepts = [
		"Market","Bazaar","Profit","Yield","Harvest","Winnings","Acquisition","Grant","Claim","Share","Board","Income","Asset","Credit","Stock","Purchase","Contract"
	];
	var corporateOrganisationConcepts = [
		"Corporation","Incorporation","Conglomerate","Consortium","Syndicate"
	];

	var democraticConcepts = [
		"Choice","Option","Voice","Song","Breath","Majority","Decision","Ballot","Vote","Preference","Score","Council","Senate","Chamber","Legislature","Cabinet","Plebiscite"
	];
	var hierarchicalConcepts = [
		"Order","Throne","Seat","Crown","Sceptre","Seal","Orb","Sphere","Command","Supremacy","Stand","Citadel","Fortress","Leadership","Royal","Might","Victory","Empire"
	];
	var collectiveConcepts = [
		"Unity","Unison","Harmony","Equity","Liberty","Labour","Work","Accord","Collective","Equality","Community","Society","Peace","Tenacity","Help","Support","Union","Commonwealth","Commons","Combine"
	];
	var experimentalConcepts = [
		"Chance","Proof","Trial","Claim","Attempt","Testament","Exhibit","Witness","Revolution"
	];
	var isolationistGovernmentConcepts = [
		"Solitude","Exile","Detachment","Recluse","Secret","Seal","Lock","Gate"
	];
	// yes, okay, slightly silly variable name
	var anarchistGovernmentConcepts = [
		"Freedom","Syndicate","Collective","Liberty","Autonomy","Escape","Levelling"
	];
	var transsapientGovernmentConcepts = [
		"Future","Machine","Immortality","Intelligence","Mind","Network","Awareness"
	];
	var socevolGovernmentConcepts = [
		"Adjustment","Iteration","Progress","Competition","Observation","Analysis","Verification","Science"
	];
	var reacherGovernmentConcepts = [
		"Art","Artwork","Dance","Song","Poem","Symphony","Sculpture","Theatre","Music","Drawing"
	];
	var precedentGovernmentConcepts = [
		"History","Precedent","Authority","Ancestor","Model","Antecedent","Ritual","Routine","Practice","Conservation"
	];
	var bureauGovernmentConcepts = [
		"Law","Rule","Paper","Form","Order","Structure","Design","System"
	];
	var varietyGovernmentConcepts = [
		"Diversity","Variation","Chaos","Change","Assortment","Medley","Divergence","Miscellany"
	];

	var refugeConcepts = [
		"Shelter","Haven","End","Escape","Refuge","Sanctuary","Hideout","Retreat","Shield","Safety","Sanctum","Trail","Rest"
	];

	var homeConcepts = [
		"Shelter","Haven","Home","Landing","Hope","Find","Claim","Stake","Jewel","Endeavour","World","Orb","Planet","Ball","Tower","Grant","Bequest","Charity","Reward","Luck","Rest","Sphere"
	];
	var homeAirConcepts = [
		"Roost","Wind","Height","Cloud"
	];
	var homeWaterConcepts = [
		"Port","Harbour","Abyss","Depths","Beach","River"
	];
	var homeTunnelConcepts = [
		"Warren","Burrow","Den","Sett"
	];
	var homeGroundConcepts = [
		"Valley","Hill","Mountain","Land"
	];

	var convergenceConcepts = [
		"Hub","Convergence","Meeting","Crossing","Point","Joining","Focus","Pivot","Pole","Heart","Core"
	];
	var crossingConcepts = [
		"Bridge","Crossing","Link","Edge","Span","Arch","Reach","Border","Corner","Tie"
	];

	var terraformingConcepts = [
		"Forge","Construct","Artifice","Result","Taming","Soften","Pacific","Mutation","Alteration","Foundry","Control","Way","Plan","Hope","Future","Prospect","Due","Destiny"
	];

	var militaryConcepts = [
		"Fortress","Citadel","Battlement","Redoubt","Castle","Stronghold","Bastion","Keep","Sword","Spear","Shield","Stand","Surety","Glory","Fury","Courage","Tower","Colossus","Triumph","Bulwark","Guard","Vanguard","Valor","Bombard","Cordon","Gate","Fortification","Donjon","Acropolis","Garrison","Camp","Encampment","Barracks","Wall","Barrier","Barricade","Rampart","Parapet","Palisade","Screen","Pillar","Alcázar","Bailey","Enceinte","Portcullis","Barbican","Ward"
	];

	var originConcepts = [
		"Home Systems","Core","Worlds","Homeworlds","Old Worlds","Heart","Foundation","Nucleus"
	];

	var allianceConcepts = [
		"Treaty","Pact","Coalition","Alliance","Federation","Confederacy","Union","League","Syndicate","Entente","Bloc","Unification","Conjunction","Organisation","Unity","Arrangement","Council","Cooperation"
	];

	var chaosConcepts = [
		"Chaos","Debate","Insurgency","Turmoil","Pandemonium","Muddle","Snarl","Riot","Terror","Contest","Dispute","Agitation","Altercation","Forum","Net"
	];

	var tradezoneConcepts = [
		"Free Trade Area","Mercantile","Merchants","Market","Bazaar","Exchange","Fair","Interchange","Switch","Contract","Bargain","Covenant","Concord"
	];

	var regionalConcepts = [
		"Cluster","Nebula","Reach","Stars","Suns","District","Domain","Zone","Discovery","Battlefield","Constellation","Borders","Outlands","Halo","Sweep","Margin","Forge","Asterism","Foundry","Prospect","Retreat","Links","Heights","Ports","Stations","Cloister","Group","Watchers","Observers"
	];

	var pairConcepts = [
		"Pair","Duo","Twins","Mirror","Equilibrium","Connection"
	];
	var triadConcepts = [
		"Triangle","Arc","Trio","Triad","Triumvirate","Trinity"
	];
	var quadConcepts = [
		"Square","Tetrad","Crossroad","Quartet"
	];
	var biggroupConcepts = [
		"Region","Sector","Environs","Web","Net","Network"
	];
	var hugegroupConcepts = [
		"Worlds","Swathe","Flight","Centre","Realm","Expanse"
	];

	/* Name components */
	var componentOrbitPosition = function(r) {
		return orbitPositions[r.rand(orbitPositions.length)];
	}

	var componentSequenceConcept = function(r) {
		// double rand to bias towards earlier letters
		return sequenceConcepts[r.rand(r.rand(sequenceConcepts.length))];
	}

	var componentOriginConcept = function(r) {
		return originConcepts[r.rand(originConcepts.length)];
	}

	var componentChaosConcept = function(r) {
		return chaosConcepts[r.rand(chaosConcepts.length)];
	}

	var componentRegionalConcept = function(r,sz) {
		var list = [];
		if (sz == 2) {
			list = list.concat(pairConcepts);
		} else if (sz == 3) {
			list = list.concat(triadConcepts);
		} else if (sz == 4) {
			list = list.concat(quadConcepts);
			list = list.concat(regionalConcepts);
		} else if (sz >= 9) {
			list = list.concat(hugegroupConcepts);
			list = list.concat(regionalConcepts);
		} else {
			list = list.concat(biggroupConcepts);
			list = list.concat(regionalConcepts);
		}
		return list[r.rand(list.length)];
	}


	var componentConstellationPosition = function(r,s) {
		var list = constellationPositionsGeneric;
		if (s == "Lizard") {
			list = list.concat(constellationPositionsLizard);
		} else if (s == "Rodent") {
			list = list.concat(constellationPositionsRodent);
		} else if (s == "Feline") {
			list = list.concat(constellationPositionsFeline);
		} else if (s == "Bird") {
			list = list.concat(constellationPositionsBird);
		} else if (s == "Frog") {
			list = list.concat(constellationPositionsFrog);
		} else if (s == "Lobster") {
			list = list.concat(constellationPositionsLobster);
		} else if (s == "Insect") {
			list = list.concat(constellationPositionsInsect);
		}
		return list[r.rand(list.length)];
	}

	var componentPlanetConcept = function(r,planet,hab) {
		var list = ["World"];
		if (planet.temperature >= 30) {
			list = list.concat(hotConcepts);
		} else if (planet.temperature <= -5) {
			list = list.concat(coldConcepts);
		} 
		if (planet.mineralWealth >= 0.6) {
			list = list.concat(miningConcepts);
		}
		if (hab.average >= 0.9) {
			list = list.concat(paradiseConcepts);
		}
		if (hab.average >= 0.7) {
			list = list.concat(brightConcepts);
		}
		if (hab.best >= 0.7) {
			list = list.concat(greenConcepts);
		}
		if (hab.best < 0.4) {
			list = list.concat(harshConcepts);
		}
		if (planet.surfaceRadiation >= 0.4) {
			list = list.concat(radiationConcepts);
		}
		if (planet.cloudAlpha == 0) {
			list = list.concat(airlessConcepts);
		}
		if (planet.landFraction <= 0.25) {
			list = list.concat(oceanConcepts);
		}

		var cf = 1.2;
		if (planet.landFraction >= 0.65) {
			if (planet.landColour[0] > planet.landColour[1]*cf && planet.landColour[0] > planet.landColour[2]*cf) {
				list = list.concat(redConcepts);
			}
			if (planet.landColour[1] > planet.landColour[0]*cf && planet.landColour[1] > planet.landColour[2]*cf && hab.best < 70) {
				list = list.concat(greenRockConcepts);
			}
			if (planet.landColour[2] > planet.landColour[0]*cf && planet.landColour[2] > planet.landColour[1]*cf) {
				list = list.concat(blueConcepts);
			}
		} else if (planet.landFraction <= 0.35) {
			if (planet.seaColour[0] > planet.seaColour[1]*cf && planet.seaColour[0] > planet.seaColour[2]*cf) {
				list = list.concat(redConcepts);
			}
			if (planet.seaColour[1] > planet.seaColour[0]*cf && planet.seaColour[1] > planet.seaColour[2]*cf) {
				list = list.concat(greenRockConcepts);
			}
			if (planet.seaColour[2] > planet.seaColour[0]*cf && planet.seaColour[2] > planet.seaColour[1]*cf && hab.best < 70) {
				list = list.concat(blueConcepts);
			}
		}

		return list[r.rand(list.length)];
	};

	var componentPoliticsConcept = function(r,pol) {
		var list = [];
		if (pol == "Corporate") {
			list = list.concat(corporateConcepts);
			list = list.concat(corporateOrganisationConcepts);
		} else if (pol == "Democratic") {
			list = list.concat(democraticConcepts);
		} else if (pol == "Hierarchical") {
			list = list.concat(hierarchicalConcepts);
		} else if (pol == "Collective") {
			list = list.concat(collectiveConcepts);
		} else if (pol == "Atypical") {
			list = list.concat(experimentalConcepts);
		} else if (pol == "United Species") {
			list = list.concat(democraticConcepts);
			list = list.concat(brightConcepts);
			list = list.concat(collectiveConcepts);
		} else {
			// destroyed system... what was it called?
			list = list.concat(democraticConcepts);
			list = list.concat(corporateConcepts);
			list = list.concat(hierarchicalConcepts);
			list = list.concat(collectiveConcepts);
		}
		return list[r.rand(list.length)];
	};


	var componentAllianceConcept = function(r,pol) {
		var list = allianceConcepts;
		if (pol == "Corporate") {
			list = list.concat(corporateConcepts);
		} else if (pol == "Democratic") {
			list = list.concat(democraticConcepts);
		} else if (pol == "Hierarchical") {
			list = list.concat(hierarchicalConcepts);
		} else if (pol == "Collective") {
			list = list.concat(collectiveConcepts);
		} else if (pol == "Trade") {
			list = list.concat(tradezoneConcepts);
		}
		return list[r.rand(list.length)];
	};

	var componentOwnership = function(n) {
		if (n.match(/s$/)) {
			return "'";
		} else {
			return "'s";
		}
	};

	var componentFounderName = function(r,sp,spec) {
		if (!spec) {
			return sp.retrieveNameOnce(sp.list()[r.rand(sp.list().length)],r);
		} else {
			return sp.retrieveNameOnce(spec,r);
		}
	};

	var componentAtypicalGovernmentConcept = function(r,gov) {
		var list = [];
		if (gov == "Isolationist") {
			list = list.concat(isolationistGovernmentConcepts);
//		} else if (gov == "Quarantine") {
			// worlds not *founded* as quarantine 
		} else if (gov == "Anarchist") {
			list = list.concat(anarchistGovernmentConcepts);
		} else if (gov == "Transapientism") {
			list = list.concat(transsapientGovernmentConcepts);
		} else if (gov == "Social Evolutionists") {
			list = list.concat(socevolGovernmentConcepts);
		} else if (gov == "Cultural Reachers") {
			list = list.concat(reacherGovernmentConcepts);
		} else if (gov == "Precedentarchy") {
			list = list.concat(precedentGovernmentConcepts);
		} else if (gov == "Bureaucracy") {
			list = list.concat(bureauGovernmentConcepts);
		} else if (gov == "Variationist") {
			list = list.concat(varietyGovernmentConcepts);
		}
		list = list.concat(list);// specific govt double-weight
		list = list.concat(experimentalConcepts); 
		return list[r.rand(list.length)];
	}
	
	var componentRefugeConcept = function(r) {
		var list = refugeConcepts;
		return list[r.rand(list.length)];
	};

	var componentHomeConcept = function(r,spec) {
		var list = homeConcepts;
		if (spec == "Insect" || spec == "Bird") {
			list = list.concat(homeAirConcepts);
		} else if (spec == "Frog" || spec == "Lobster") {
			list = list.concat(homeWaterConcepts);
		} else if (spec == "Rodent") {
			list = list.concat(homeTunnelConcepts);
		} else {
			list = list.concat(homeGroundConcepts);
		}
		return list[r.rand(list.length)];
	};

	var componentBridge = function(r) {
		var list = crossingConcepts;
		return list[r.rand(list.length)];
	}

	var componentHub = function(r) {
		var list = convergenceConcepts;
		return list[r.rand(list.length)];
	}
	
	var componentTerraformingConcept = function(r) {
		var list = terraformingConcepts;
		return list[r.rand(list.length)];
	};

	var componentMilitaryConcept = function(r) {
		var list = militaryConcepts;
		return list[r.rand(list.length)];
	};


	/* Name pattern */
	var nameByWords = function(g,s,p,sp,r) {
		var spec = p.get(g,s,"colony").species[0];
		var n = "";
		var dl = 5+r.rand(8);
		while (n.length < dl) {
			if (n.length > 0) {
				n += " ";
			}
			n += sp.word(spec,r);
		}
		return n;
	}

	var nameByWord = function(g,s,p,sp,r) {
		var spec = p.get(g,s,"colony").species[0];
		return sp.word(spec,r);
	}


	var nameByBrightStar = function(g,s,p,sp,r) {
		var star = p.get(g,s,"star");
		var n = star.name.replace(/ \(.*/,"");
		var choice = r.randf();
		var planet = p.get(g,s,"planet");
		var hab = p.get(g,s,"habitability");
		var politics = p.get(g,s,"politics");
		var colony = p.get(g,s,"colony");
		if (choice < 0.2 && colony.stage < 3) {
			n += " "+componentOrbitPosition(r);
		} else if (choice < 0.6) {
			n += componentOwnership(n);
			n += " "+componentPlanetConcept(r,planet,hab);
		} else if (choice < 0.9) {
			n += " "+componentPlanetConcept(r,planet,hab);
		} else {
			n += componentOwnership(n);
			n += " "+componentPoliticsConcept(r,p.governmentCategoryFromType(politics));
		}
		return n;
	};

	var nameByConstellation = function(g,s,p,sp,r) {
		var star = p.get(g,s,"star");
		var n = star.constellation;
		var choice = r.randf();
		var planet = p.get(g,s,"planet");
		var hab = p.get(g,s,"habitability");
		var politics = p.get(g,s,"politics");
		var spec = p.get(g,s,"colony").species[0];
		if (choice < 0.5) {
			n += " "+componentConstellationPosition(r,spec);
		} else if (choice < 0.7) {
			n += componentOwnership(n);
			n += " "+componentPlanetConcept(r,planet,hab);
		} else if (choice < 0.9) {
			n += " "+componentPlanetConcept(r,planet,hab);
		} else {
			n += componentOwnership(n);
			n += " "+componentPoliticsConcept(r,p.governmentCategoryFromType(politics.governmentType));
		}
		return n;
	};

	var nameByOutsiders = function(g,s,p,sp,r) { 
		var choice = r.randf();
		var politics = p.get(g,s,"politics");
		var colony = p.get(g,s,"colony");
		var star = p.get(g,s,"star");
		var spec = colony.species[0];
		var n = "";
		if (colony.founded == 10 && choice < 0.6) {
			var choice2 = r.randf();
			if (choice2 < 0.2) {
				n = componentRefugeConcept(r);
			} else if (choice2 < 0.4) {
				n = componentFounderName(r,sp,spec);
				n += componentOwnership(n);
				n += " "+componentRefugeConcept(r,spec);
			} else {
				// haven't had time to name it yet
				n = star.name+" "+componentOrbitPosition(r);
			}
		} else if (choice < 0.05) {
			n = star.name+" "+componentOrbitPosition(r);
		} else if (choice < 0.4) {
			n += componentFounderName(r,sp,spec);
			n += componentOwnership(n);
			n += " "+componentHomeConcept(r,spec);
		} else if (choice < 0.7) {
			n += componentAtypicalGovernmentConcept(r,politics.governmentType);
			n += componentOwnership(n);
			n += " "+componentHomeConcept(r,spec);
		} else {
			n += componentFounderName(r,sp,spec);
			n += componentOwnership(n);
			n += " "+componentAtypicalGovernmentConcept(r,politics.governmentType);
		}
		return n;
	};

	var nameByFounder = function(g,s,p,sp,r) { 
		var choice = r.randf();
		var colony = p.get(g,s,"colony");
		var star = p.get(g,s,"star");
		var bottle = p.bottleneckType(g,s);
		var spec = colony.species[0];
		var planet = p.get(g,s,"planet");
		var hab = p.get(g,s,"habitability");
		var n = componentFounderName(r,sp,spec);
		n += componentOwnership(n);
		if (bottle == 1 && choice < 0.3) {
			n += " "+componentBridge(r);
		} else if (bottle == 2 && choice < 0.45) {
			n += " "+componentHub(r);
		} else if (choice < 0.3) {
			n += " "+componentHomeConcept(r,spec);
		} else if (choice < 0.75) {
			n += " "+componentPlanetConcept(r,planet,hab);
		} else {
			n += " "+componentHomeConcept(r,spec);
		}
		return n;
		// founder+government is covered in nameByGovernment branch
	}; 

	var nameByGovernment = function(g,s,p,sp,r) {
		var choice = r.randf();
		var politics = p.get(g,s,"politics");
		var gtype = p.governmentCategoryFromType(politics.governmentType);
		var colony = p.get(g,s,"colony");
		var bottle = p.bottleneckType(g,s);
		var spec = colony.species[0];
		var planet = p.get(g,s,"planet");
		var hab = p.get(g,s,"habitability");
		var n = "";
		if (bottle == 1 && choice < 0.2) {
			n = componentPoliticsConcept(r,gtype);
			n += componentOwnership(n);
			n += " "+componentBridge(r);
		} else if (bottle == 2 && choice < 0.35) {
			n = componentPoliticsConcept(r,gtype);
			n += componentOwnership(n);
			n += " "+componentHub(r);
		} else if (choice < 0.4) {
			n = componentFounderName(r,sp,spec);
			n += componentOwnership(n);
			n += " "+componentPoliticsConcept(r,gtype);
		} else if (choice < 0.7) {
			n = componentPoliticsConcept(r,gtype);
			n += componentOwnership(n);
			n += " "+componentPlanetConcept(r,planet,hab);
		} else {
			n = componentPlanetConcept(r,planet,hab);
			n += componentOwnership(n);
			n += " "+componentPoliticsConcept(r,gtype);
		}
		return n;
	};

	var nameByUnimaginative = function(g,s,p,sp,r) { 
		var choice = r.randf();
		var politics = p.get(g,s,"politics");
		var gtype = p.governmentCategoryFromType(politics.governmentType);
		var colony = p.get(g,s,"colony");
		var star = p.get(g,s,"star");
		var bottle = p.bottleneckType(g,s);
		var spec = colony.species[0];
		var planet = p.get(g,s,"planet");
		var hab = p.get(g,s,"habitability");
		var n = "";
		if (!colony.founded && r.randf() < 0.8) {
			choice = 0.8; // uninhabited planets much more likely to have "no" name
		}
		if (choice < 0.02) {
			n = componentPlanetConcept(r,planet,hab);
		} else if (choice < 0.1) {
			n = componentPlanetConcept(r,planet,hab);
			// most will have since been renamed
			n += " "+componentSequenceConcept(r,planet,hab);
		} else if (choice < 0.4 && spec != "Human") {
			// just gets a random word
			n = componentFounderName(r,sp,spec);
		} else if (choice < 0.7) {
			n = componentPlanetConcept(r,planet,hab);
			do {
				var n2 = componentPlanetConcept(r,planet,hab);
			} while (n == n2);
			n += " "+n2;
		} else {
			// never bothered to name it
			n = star.name.replace(/\(.*/,"");
			n += " "+componentOrbitPosition(r);
		}
		return n;
	}; 
	var nameByJoint = function(g,s,p,sp,r) { 
		var choice = r.randf();
		var colony = p.get(g,s,"colony");
		var spec0 = colony.species[0];
		var spec1 = colony.species[1];
		var n = "";
		if (!spec1) {
			console.error("Trying to name joint system "+g+" "+s+" but only one species found");
			spec0 = spec1;
		}
		n = componentFounderName(r,sp,spec0);
		if (choice < 0.5) {
			n += " ";
		} else if (choice < 0.95) {
			n += "-";
		} else {
			n += " & ";
		}
		n += componentFounderName(r,sp,spec1);

		return n;
	};
	var nameByTerraforming = function(g,s,p,sp,r) { 
		var choice = r.randf();
		var politics = p.get(g,s,"politics");
		var gtype = p.governmentCategoryFromType(politics.governmentType);
		var colony = p.get(g,s,"colony");
		var bottle = p.bottleneckType(g,s);
		var spec = colony.species[0];
		var planet = p.get(g,s,"planet");
		var hab = p.get(g,s,"habitability");
		var n = "";
		if (bottle == 1 && choice < 0.2) {
			n = componentTerraformingConcept(r);
			n += componentOwnership(n);
			n += " "+componentBridge(r);
		} else if (bottle == 2 && choice < 0.25) {
			n = componentTerraformingConcept(r);
			n += componentOwnership(n);
			n += " "+componentHub(r);
		} else if (choice < 0.5) {
			n = componentFounderName(r,sp,spec);
			n += componentOwnership(n);
			n += " "+componentTerraformingConcept(r,gtype);
		} else if (choice < 0.75) {
			n = componentPoliticsConcept(r,gtype);
			n += componentOwnership(n);
			n += " "+componentTerraformingConcept(r,planet,hab);
		} else {
			n = componentPlanetConcept(r,planet,hab);
			n += componentOwnership(n);
			n += " "+componentTerraformingConcept(r,gtype);
		}
		return n;
	};


	var nameByMilitary = function(g,s,p,sp,r) { 
		var choice = r.randf();
		var politics = p.get(g,s,"politics");
		var gtype = p.governmentCategoryFromType(politics.governmentType);
		var colony = p.get(g,s,"colony");
		var bottle = p.bottleneckType(g,s);
		var spec = colony.species[0];
		var planet = p.get(g,s,"planet");
		var hab = p.get(g,s,"habitability");
		var n = "";
		if (bottle == 1 && choice < 0.2) {
			n = componentMilitaryConcept(r);
			n += componentOwnership(n);
			n += " "+componentBridge(r);
		} else if (bottle == 2 && choice < 0.25) {
			n = componentMilitaryConcept(r);
			n += componentOwnership(n);
			n += " "+componentHub(r);
		} else if (choice < 0.8) {
			n = componentFounderName(r,sp,spec);
			n += componentOwnership(n);
			n += " "+componentMilitaryConcept(r,gtype);
		} else {
			n = componentPlanetConcept(r,planet,hab);
			n += componentOwnership(n);
			n += " "+componentMilitaryConcept(r,gtype);
		}
		return n;
	};

	/* Name pattern selectors */
	var nameEarlySystem = function(g,s,p,sp,r) {
		var star = p.get(g,s,"star");
		var colony = p.get(g,s,"colony");
		var politics = p.get(g,s,"politics");
		var choice = r.randf();
		if (choice < 0.2) {
			return nameByWords(g,s,p,sp,r);
		} else if (star.constellation != "" && choice < 0.4)  {
			if (star.name.match(/\(/)) {
				return nameByBrightStar(g,s,p,sp,r);
			} else {
				return nameByConstellation(g,s,p,sp,r);
			}
		} else if (colony.outsiders == 1 && choice < 0.8) {
			return nameByOutsiders(g,s,p,sp,r);
		} else if (choice < 0.4) {
			return nameByFounder(g,s,p,sp,r);
		} else if (choice < 0.8) {
			return nameByGovernment(g,s,p,sp,r);
		} else {
			return nameByUnimaginative(g,s,p,sp,r);
		}
	};

	// this is much more direct as independent hubs are very rare
	// so the chance of duplication is minimal
	var nameHubSystem = function(g,s,p,sp,r) {
		var n = "";
		var star = p.get(g,s,"star");
		if (star.name.match(/\(/)) {
			n = star.name.replace(/ \(.*/,"");
		} else if (star.constellation != "") {
			n = star.constellation;
		} else {
			var specl = p.get(g,s,"colony").species;
			n = componentFounderName(r,sp,specl[r.rand(specl.length)]);
		}
		n += " "+componentHub(r);
		return n;
	}

	var nameJointSystem = function(g,s,p,sp,r) {
		var star = p.get(g,s,"star");
		var colony = p.get(g,s,"colony");
		var politics = p.get(g,s,"politics");
		var choice = r.randf();
		if (colony.outsiders == 1 && choice < 0.8) {
			return nameByOutsiders(g,s,p,sp,r);
		} else if (choice < 0.15) {
			return nameByFounder(g,s,p,sp,r);
		} else if (choice < colony.founded/10) {
			return nameByJoint(g,s,p,sp,r);
		} else if (choice < 0.9) {
			return nameByGovernment(g,s,p,sp,r);
		} else {
			return nameByUnimaginative(g,s,p,sp,r);
		}
	};

	var nameMidSystem = function(g,s,p,sp,r) {
		var star = p.get(g,s,"star");
		var colony = p.get(g,s,"colony");
		var politics = p.get(g,s,"politics");
		var choice = r.randf();
		if (choice < 0.2) {
			return nameByWords(g,s,p,sp,r);
		} else if (star.constellation != "" && choice < 0.3)  {
			if (star.name.match(/\(/)) {
				return nameByBrightStar(g,s,p,sp,r);
			} else {
				return nameByConstellation(g,s,p,sp,r);
			}
		} else if (colony.outsiders == 1 && choice < 0.8) {
			return nameByOutsiders(g,s,p,sp,r);
		} else if (choice < 0.3) {
			return nameByFounder(g,s,p,sp,r);
		} else if (choice < 0.85) {
			return nameByGovernment(g,s,p,sp,r);
		} else {
			return nameByUnimaginative(g,s,p,sp,r);
		}
	};

	var nameLateSystem = function(g,s,p,sp,r) {
		var star = p.get(g,s,"star");
		var colony = p.get(g,s,"colony");
		var politics = p.get(g,s,"politics");
		var choice = r.randf();
		if (star.constellation != "" && choice < 0.05)  {
			if (star.name.match(/\(/)) {
				return nameByBrightStar(g,s,p,sp,r);
			} else {
				return nameByConstellation(g,s,p,sp,r);
			}
		} else if (choice < 0.3) {
			return nameByWords(g,s,p,sp,r);
		} else if (colony.outsiders == 1 && choice < 0.8) {
			return nameByOutsiders(g,s,p,sp,r);
		} else if (choice < 0.2) {
			return nameByFounder(g,s,p,sp,r);
		} else if (choice < 0.8) {
			return nameByGovernment(g,s,p,sp,r);
		} else {
			return nameByUnimaginative(g,s,p,sp,r);
		}
	};

	var nameTerraformedSystem = function(g,s,p,sp,r) {
		var star = p.get(g,s,"star");
		var colony = p.get(g,s,"colony");
		var politics = p.get(g,s,"politics");
		var choice = r.randf();
		if (star.constellation != "" && choice < 0.05)  {
			if (star.name.match(/\(/)) {
				return nameByBrightStar(g,s,p,sp,r);
			} else {
				return nameByConstellation(g,s,p,sp,r);
			}
		} else if (colony.outsiders == 1 && choice < 0.6) {
			return nameByOutsiders(g,s,p,sp,r);
		} else if (choice < 0.1) {
			return nameByWords(g,s,p,sp,r);
		} else if (choice < 0.15) {
			return nameByFounder(g,s,p,sp,r);
		} else if (choice < 0.2) {
			return nameByGovernment(g,s,p,sp,r);
		} else if (choice < 0.9) {
			return nameByTerraforming(g,s,p,sp,r);
		} else {
			return nameByUnimaginative(g,s,p,sp,r);
		}
	};


	var nameMilitarySystem = function(g,s,p,sp,r) {
		var star = p.get(g,s,"star");
		var colony = p.get(g,s,"colony");
		var politics = p.get(g,s,"politics");
		var choice = r.randf();
		if (star.constellation != "" && choice < 0.05)  {
			if (star.name.match(/\(/)) {
				return nameByBrightStar(g,s,p,sp,r);
			} else {
				return nameByConstellation(g,s,p,sp,r);
			}
		} else if (colony.outsiders == 1 && choice < 0.3) {
			return nameByOutsiders(g,s,p,sp,r);
		} else if (choice < 0.1) {
			return nameByWords(g,s,p,sp,r);
		} else if (choice < 0.15) {
			return nameByFounder(g,s,p,sp,r);
		} else if (choice < 0.2) {
			return nameByGovernment(g,s,p,sp,r);
		} else if (choice < 0.9) {
			return nameByMilitary(g,s,p,sp,r);
		} else {
			return nameByUnimaginative(g,s,p,sp,r);
		}
	};


	var nameUninhabitedSystem = function(g,s,p,sp,r) {
		var star = p.get(g,s,"star");
		var colony = p.get(g,s,"colony");
		var politics = p.get(g,s,"politics");
		var choice = r.randf();
		if (star.constellation != "")  {
			if (star.name.match(/\(/)) {
				return nameByBrightStar(g,s,p,sp,r);
			} else {
				return nameByConstellation(g,s,p,sp,r);
			}
		} else {
			return nameByUnimaginative(g,s,p,sp,r);
		}
	};



	/* Select name pattern selector */
	namegen.nameSystem = function(g,s,planetinfo,speciesInfo,random) {
		var colony = planetinfo.get(g,s,"colony");
		if (colony.independentHub == 1) {
			return nameHubSystem(g,s,planetinfo,speciesInfo,random);
		} else if (colony.militaryBase == 1 && colony.founded > 5+random.rand(5)) {
			return nameMilitarySystem(g,s,planetinfo,speciesInfo,random);
		} else if (colony.founded <= 3) {
			return nameEarlySystem(g,s,planetinfo,speciesInfo,random);
		} else if (colony.founded <= 4 && speciesInfo.isNative(g,colony.species[0])) {
			return nameEarlySystem(g,s,planetinfo,speciesInfo,random);
		} else if (colony.founded <= 7) {
			if (colony.species.length > 1) {
				return nameJointSystem(g,s,planetinfo,speciesInfo,random);
			} else {
				return nameMidSystem(g,s,planetinfo,speciesInfo,random);
			}
		} else if (colony.stage > 0 || colony.founded > 0) {
			var hab = planetinfo.get(g,s,"habitability");
			if (hab.best >= 60 && hab.best < 70) {
				return nameTerraformedSystem(g,s,planetinfo,speciesInfo,random);
			} else if (colony.species.length > 1) {
				return nameJointSystem(g,s,planetinfo,speciesInfo,random);
			} else {
				return nameLateSystem(g,s,planetinfo,speciesInfo,random);
			}
		} else {
			return nameUninhabitedSystem(g,s,planetinfo,speciesInfo,random);
		}
	};

	namegen.newPrefix = function(r) {
		var list = ["New ","Neo-","Novo ","Nova "];
		return list[r.rand(list.length)];
	}

	/* Regional naming functions */

	var usedComponents = {};
	var noReuse = function(generator,debug) {
		var iter = 0;
		do {
			var result = generator();
			iter++
			if (iter == 5) {
				console.error("repeatedly trying to find unused with generator "+debug);
			} else if (iter == 10) {
				console.error("gave up finding unused with generator "+debug);
				return result; // give up
			}
		} while (usedComponents[result]);
		usedComponents[result] = 1;
		return result;
	}

	// regions based around a species homeworld
	namegen.nameHomeRegion = function(region,p,s,r) {
		var hw = region.influential[0];
		var spec = p.get(region.galaxy,hw,"colony").species[0];
		if (spec != "Human") {
			var n = s.name(spec);
			if (r.randf() < 0.5) {
				n = p.get(region.galaxy,hw,"name");
			}
			if (region.category.match(/Alliance/)) {
				n += " "+noReuse(componentPoliticsConcept.bind(this,r,region.subCategory),"Politics "+region.subCategory);
			} else {
				n += " "+noReuse(componentOriginConcept.bind(this,r),"Origin");
			}
			return n;
		} else {
			// human is different as it's not really a homeworld
			return "Biya's Providence";
		}
	};

	namegen.nameMilitaryRegion = function(region,p,s,r) {
		var choice = r.randf();
		var hw = region.influential[0];
		var star = p.get(region.galaxy,hw,"star");
		var system = p.get(region.galaxy,hw,"name");
		var suffix = noReuse(componentMilitaryConcept.bind(this,r),"Military");
		var n = "";
		if (star.name.match(/\(/) && choice < 0.6) {
			n = star.name.replace(/ \(.*/,"")+" "+suffix;
		} else if (star.constellation != "" && choice < 0.4) {
			n = star.constellation+" "+suffix;
		} else if (!system.match(/ /) && choice < 0.7) {
			n = system+" "+suffix;
		} else {
			n = nameByWord(region.galaxy,hw,p,s,r)+" "+suffix;
		}
		return n;
	};

	namegen.namePoliticalRegion = function(region,p,s,r) {
		var choice = r.randf();
		var hw = region.influential[0];
		var star = p.get(region.galaxy,hw,"star");
		var system = p.get(region.galaxy,hw,"name");
		var suffix = noReuse(componentAllianceConcept.bind(this,r,region.subCategory),"Politics ("+region.subCategory+")");
		var n = "";
		if (star.name.match(/\(/) && choice < 0.6) {
			n = star.name.replace(/ \(.*/,"")+" "+suffix;
		} else if (star.constellation != "" && choice < 0.4) {
			n = star.constellation+" "+suffix;
		} else if (!system.match(/ /) && choice < 0.7) {
			n = system+" "+suffix;
		} else {
			n = nameByWord(region.galaxy,hw,p,s,r)+" "+suffix;
		}
		return n;
	};

	namegen.nameUnstableRegion = function(region,p,s,r) {
		var idx = 0;
		var nodiff = 1;
		do {
			var hw1 = region.members[idx++];
			var pol1 = p.get(region.galaxy,hw1,"politics");
			var gov1 = p.governmentCategoryFromType(pol1.governmentType);
		} while (!region.subCategory.match(gov1));
		do {
			var hw2 = region.members[idx++];
			var pol2 = p.get(region.galaxy,hw2,"politics");
			var gov2 = p.governmentCategoryFromType(pol2.governmentType);
			if (gov2 != gov1 && region.subCategory.match(gov2)) {
				nodiff = 0;
			}
		} while (nodiff && idx < region.members.length)
		var star1 = p.get(region.galaxy,hw1,"star");
		var star2 = p.get(region.galaxy,hw2,"star");
		var sys1 = p.get(region.galaxy,hw1,"name");
		var sys2 = p.get(region.galaxy,hw2,"name");
		var n = "";
		var choice = r.randf();
		var suffix = noReuse(componentChaosConcept.bind(this,r));
		if (star1.constellation != "" && star1.constellation != star2.constellation) {
			// if mostly in one constellation, use that
			n = star1.constellation+" "+suffix
		} else if (!sys1.match(/ /) && !sys2.match(/ /) && choice < 0.8) {
			// if system names are short, use those
			n = sys1+"-"+sys2+" "+noReuse(componentChaosConcept.bind(this,r))+suffix;
		} else {
			n = nameByWord(region.galaxy,hw1,p,s,r)+"-"+nameByWord(region.galaxy,hw2,p,s,r)+" "+suffix;
		}
		return n;
	};

	namegen.nameEconomicRegion = function(region,p,s,r) {
		var choice = r.randf();
		var hw = region.influential[0];
		var star = p.get(region.galaxy,hw,"star");
		var system = p.get(region.galaxy,hw,"name");
		var suffix = noReuse(componentAllianceConcept.bind(this,r,"Trade"),"Politics");
		var n = "";
		if (star.name.match(/\(/) && choice < 0.6) {
			n = star.name.replace(/ \(.*/,"")+" "+suffix;
		} else if (star.constellation != "" && choice < 0.4) {
			n = star.constellation+" "+suffix;
		} else if (!system.match(/ /) && choice < 0.7) {
			n = system+" "+suffix;
		} else {
			n = nameByWord(region.galaxy,hw,p,s,r)+" "+suffix;
		}
		return n;

	};

	namegen.nameHistoricRegion = function(region,p,s,r) {
		var choice = r.randf();
		var hw = region.influential[0];
		var star = p.get(region.galaxy,hw,"star");
		var system = p.get(region.galaxy,hw,"name");
		var colony = p.get(region.galaxy,hw,"colony");
		var suffix = noReuse(componentRegionalConcept.bind(this,r,region.members.length),"Regional"+region.members.length);
		
		var n = "";
		if (star.name.match(/\(/) && choice < 0.1) {
			n = star.name.replace(/ \(.*/,"")+" "+suffix;
		} else if (star.constellation != "" && choice < 0.5) {
			n = star.constellation+" "+suffix;
		} else if (!system.match(/ /) && choice < 0.15) {
			n = system+" "+suffix;
		} else {
			choice = r.randf();
			if (choice < 0.15) {
				n = nameByWord(region.galaxy,hw,p,s,r)+" "+suffix;
			} else if (choice < 0.35) {
				var specl = p.get(region.galaxy,hw,"colony").species;
				n = componentFounderName(r,s,specl[r.rand(specl.length)]);
				n += componentOwnership(n);
				n += " "+suffix;
			} else if (choice < 0.7) {
				n = nameByWord(region.galaxy,hw,p,s,r);
				if (!n.match(/s$/)) {
					n += "s";
				}
			} else {
				n = nameByWord(region.galaxy,hw,p,s,r);
			}
		}
		return n;
	};

	namegen.partyName = function(r) {
		var choices = [].concat(brightConcepts,greenConcepts,redConcepts,greenRockConcepts,blueConcepts,collectiveConcepts,refugeConcepts,convergenceConcepts,biggroupConcepts,triadConcepts,quadConcepts);
		return choices[r.rand(choices.length)];
	}

	module.exports = namegen;

}());