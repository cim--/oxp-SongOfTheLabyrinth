this.name = "SOTW Market Manager";

this.updateGeneralCommodityDefinition = function(marketdef, station, system) {
	if (station) { return marketdef; }
	var sysinfo = System.infoForSystem(galaxyNumber,system);
	
	var classes = marketdef.classes;
	
	// overlap so that X-1 and X+1 have slight gearing
	var pricebands = [
		[1,5], // 0
		[1,10], // 1
		[3,25], // 2 (min): Rock Fragments, Fuel
		[8,50], // 3: Scrap Metal, Mixed Clothes, Entertainment Packages, Mixed Food, Spare Parts, Mixed Fabrics
		[15,80], // 4: Artistic Ceramics, Fertiliser, Oil, Metal Ores, Tools
		[35,150], // 5: Industrial Ceramics, Mixed Alloys
		[60,250], // 6: Computers, Medicine, Escape Pods, Mixed Plastics
		[100,350], // 7: Artworks, Animal Fabrics, Narcotics
		[200,500], // 8: Firearms, Machinery, Ship Hardware
		[325,700], // 9: Flight Computers, Plants, Radiation Shield
		[450,900], // 10: Luxury Food, Luxury Goods, Sensors
		[600,1100], // 11: Corals, Telepresence
		[800,1350], // 12: Ship Weapons
		[1000,1600], // 13: Animals
		[1250,1850], // 14: Precious Metals
		[1500,2150], // 15: Gems
		[1800,2500], // 16
		[2100,2900], // 17: Terraformers
		[2400,3400], // 18
		[2750,3850], // 19: Scientific Equipment
		[3200,4400], // 20 (max)
		[3700,5000], // 21
		[4300,5700], // 22
	];

	var priceband = 0;
	for (var i=1;i<=22;i++) {
		if (classes.indexOf("sotw-priceband-"+i) != -1) {
			priceband = i;
			break;
		}
	}

	// rolls = random numbers, pick closest to centre
	// volatility = chance of moving an entire price band
	var volatility = 0; var rolls = 5;
	if (classes.indexOf("sotw-volatility-low") != -1) {
		volatility = 0.2; rolls = 4;
	} else if (classes.indexOf("sotw-volatility-med") != -1) {
		volatility = 0.4; rolls = 3;
	} else if (classes.indexOf("sotw-volatility-high") != -1) {
		volatility = 0.6; rolls = 2;
	} else if (classes.indexOf("sotw-volatility-extreme") != -1) {
		volatility = 1; rolls = 1;
	}
	
	var tvolfactor = 1;

	// more secure systems have less variable prices due to higher
	// trade volumes (and probably a much more significant domestic
	// economy)
	var security = sysinfo.government;
	if (security == 0) { security = 1; } // uninhabited
	volatility /= security;
	tvolfactor /= security;

	var productivity = parseInt(sysinfo.productivity);

	var ecname = sysinfo.economy_description;
	var ecreason = sysinfo.sotw_economy_reason;
	var ecstatus = parseInt(sysinfo.sotw_economy_status);
	var eckey = ecname.replace(/[^A-Za-z]+/g,"").toLowerCase();
	var ecrkey = ecreason.replace(/[^A-Za-z]+/g,"").toLowerCase();
	var imported = false; var exported = false;
	if (classes.indexOf("sotw-im-"+eckey) != -1 && classes.indexOf("sotw-ex-"+eckey) != -1) {
		var cyclepos = (clock.seconds % 864000) & 255; // 10 day steps, 256 step cycle
		if (cyclepos & system) {
			priceband += tvolfactor;
			imported = true;
		} else {
			priceband -= tvolfactor;
			exported = true;
		}
		// will either import or export, and sometimes switch
	} else if (classes.indexOf("sotw-im-"+eckey) != -1) {
		priceband += tvolfactor;
		imported = true;
	} else if (classes.indexOf("sotw-ex-"+eckey) != -1) {
		priceband -= tvolfactor;
		exported = true;
	} else {
		// neither import nor export but there may be special factors
		if (classes.indexOf("sotw-imr-"+ecrkey) != -1) {
			priceband += tvolfactor/2;
			imported = true;
		} else if (classes.indexOf("sotw-exr-"+ecrkey) != -1) {
			priceband -= tvolfactor/2;
			exported = true;
		} else {
			/* special tags, not necessarily symmetric. Add as
			 * needed. Each good should have at most one special
			 * tag */
			
			if (classes.indexOf("sotw-ims-radiation") != -1 && parseFloat(sysinfo.sotw_planet_surface_radiation) > 0.3) {
				// high radiation imports
				priceband += tvolfactor;
				imported = true;
			} else if (classes.indexOf("sotw-ims-cold") != -1 && parseFloat(sysinfo.sotw_planet_surface_temperature) < 5) {
				// low temperature imports
				priceband += tvolfactor;
				imported = true;
			} else if (classes.indexOf("sotw-exs-ocean") != -1 && parseFloat(sysinfo.sotw_habitability_best) > 80 && parseFloat(sysinfo.percent_land) < 30) {
				// habitable ocean worlds
				priceband -= tvolfactor/2;
				exported = true;
			} else if (classes.indexOf("sotw-ims-unstable") != -1 && (security <= 2 || sysinfo.sotw_government_category == "Disordered")) {
				// unstable governments
				priceband += tvolfactor/2;
				imported = true;
			} else if (classes.indexOf("sotw-ims-nohab") != -1 && parseFloat(sysinfo.sotw_habitability_best) < 60) {
				// uninhabitable worlds
				priceband += tvolfactor/2;
				imported = true;
			} else if (classes.indexOf("sotw-exs-oilmining") != -1 && parseFloat(sysinfo.sotw_habitability_best) > 60 && eckey == "groundmining") {
				// oil-rich worlds
				priceband -= tvolfactor;
				exported = true;
			} else if (classes.indexOf("sotw-exs-hab") != -1 && parseFloat(sysinfo.sotw_habitability_best) > 60) {
				// inhabitable worlds
				priceband -= tvolfactor/2;
				exported = true;
			} else if (classes.indexOf("sotw-exs-minrich") != -1 && parseFloat(sysinfo.sotw_mineral_wealth) > 0.45) {
				// mineral rich worlds
				priceband -= tvolfactor/2;
				exported = true;
			} else if (classes.indexOf("sotw-exs-tech") != -1 && sysinfo.techlevel > 8) {
				// inhabitable worlds
				priceband -= tvolfactor/2;
				exported = true;
			} else if (classes.indexOf("sotw-ims-isolation") != -1 && sysinfo.government_description == "Isolationist") {
				// inhabitable worlds
				priceband += tvolfactor;
				exported = true;


			} else if (classes.indexOf("sotw-ims-rich") != -1 && productivity > 1E6) {
				// rich worlds. This one should be the last check
				priceband += tvolfactor/2;
				imported = true;
			}
		}
	}
	priceband += volatility*(Math.random()-Math.random());
	
	// work out quantity next
	var pzeroes = Math.floor(Math.log(productivity)/Math.log(10));

	if (classes.indexOf("sotw-demand-high") != -1 && imported) {
		pzeroes += 2;
		tvolfactor = -2;
	} else if (classes.indexOf("sotw-supply-high") != -1 && exported) {
		pzeroes += 2;
		tvolfactor = 2;
	} else if (classes.indexOf("sotw-demand-medium") != -1 && imported) {
		pzeroes += 1;
		tvolfactor = -1;
	} else if (classes.indexOf("sotw-supply-medium") != -1 && exported) {
		pzeroes += 1;
		tvolfactor = 1;
	} else if (classes.indexOf("sotw-demand-low") != -1 && imported) {
		pzeroes -= 0;
		tvolfactor = -0.5;
	} else if (classes.indexOf("sotw-supply-low") != -1 && exported) {
		pzeroes -= 0;
		tvolfactor = 0.5;
	} else if (classes.indexOf("sotw-supply-none") != -1) {
		pzeroes += 0; // no change
		tvolfactor = -100;
	} else {
		// neither import nor export
		if (classes.indexOf("sotw-specialist-good")) {
			pzeroes -= 1;
			tvolfactor = -0.3*security; // tend to low-ish quantities
		}
	}
	if (exported && ecstatus == 1) {
		pzeroes += 1; // quantity bonus
	} else if (imported && ecstatus == -1) {
		pzeroes -= 2; // big quantity penalty
	}

	tvolfactor /= security; // again, bigger more stable markets tend to centre

	if (classes.indexOf("sotw-quantity-bulk") != -1) {
		pzeroes += 2;
		if (pzeroes < 4) {
			pzeroes = 4;
		}
		tvolfactor += 0.5; // available almost anywhere
	} else if (classes.indexOf("sotw-quantity-high") != -1) {
		pzeroes += 1;
		tvolfactor += 0.25; // available almost anywhere
	} else if (classes.indexOf("sotw-quantity-medium") != -1) {
		pzeroes += 0;
	} else if (classes.indexOf("sotw-quantity-low") != -1) {
		pzeroes -= 1;
	} else if (classes.indexOf("sotw-quantity-rare") != -1) {
		pzeroes -= 2;
	}
	
	if (priceband > pzeroes*3) {
		// priceband might be adjusted later but it doesn't matter
		// here capacity for expensive goods significantly reduced in
		// smaller systems. (and very expensive everywhere)
		if (exported) {
			pzeroes -= 1;
		} else {
			pzeroes -= 3;
		}
	}
	if (pzeroes < 2) { pzeroes = 2; }

	if (eckey == "survival") {
		// very limited ability to pay for anything
		priceband -= 1;
		pzeroes -= 1;
	}


	var capacity = Math.pow(2,pzeroes);
	marketdef.capacity = capacity;
	
	var bandpos = -1;
	for (i=0;i<rolls;i++) {
		// -0.5 to make abs() work
		var roll = Math.random()-0.5;
		if (Math.abs(roll) < Math.abs(bandpos)) {
			bandpos = roll;
		}
	}
	bandpos += 0.5; // add 0.5 back on
	bandpos += tvolfactor;
	if (bandpos < 0) { bandpos = 0; }
	if (bandpos > 1) { bandpos = 1; }

	var quantity = Math.floor((capacity*(1+Math.random())/2) * bandpos);


	marketdef.quantity = quantity;

	// back to price calculations
	if (quantity == 0) {
		if (!imported) {
			priceband -= 2;
		} else if (productivity < 100) {
			// might want it, but not rich enough to pay for it
			priceband -= 1;
		}
	}


	var pbfrac = priceband-Math.floor(priceband);
	if (Math.random() < pbfrac) {
		// round up
		priceband = Math.floor(priceband+1);
	} else {
		// round down
		priceband = Math.floor(priceband);
	}
	if (priceband < 0) {
		priceband = 0;
	}

	var bandpos = -1;
	for (i=0;i<rolls;i++) {
		// -0.5 to make abs() work
		var roll = Math.random()-0.5;
		if (Math.abs(roll) < Math.abs(bandpos)) {
			bandpos = roll;
		}
	}
	bandpos += 0.5; // add 0.5 back on
	if (imported && ecstatus == -1 && quantity == 0) {
		bandpos += Math.random(); // arrival of goods is rare; price volatile
		// this can take it over 1, but extrapolate rather than increment band
	}

	var price = (pricebands[priceband][0]*(1-bandpos))+(pricebands[priceband][1]*bandpos); // interpolate price
	marketdef.price = Math.floor(price*10); // convert to decicredits
	
//	log(marketdef.name,marketdef.price,marketdef.quantity,marketdef.capacity);

	return marketdef;
};