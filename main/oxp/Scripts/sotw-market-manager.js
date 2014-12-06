"use strict";

this.name = "SOTW Market Manager";

this.updateGeneralCommodityDefinition = function(marketdef, station, system) {
	if (station) { return marketdef; }
	var sysinfo = System.infoForSystem(galaxyNumber,system);
	
	var classes = marketdef.classes;
	
	// overlap so that X-1 and X+1 have slight gearing
	var pricebands = [
		[1,5], // 0
		[1,10], // 1
		[3,25], // 2 (min): Rock Fragments
		[8,50], // 3: Scrap Metal, Mixed Clothes
		[15,80], // 4: Escape Pods, Mixed Alloys, Artistic Ceramics
		[35,150], // 5: Industrial Ceramics
		[60,250], // 6: Computers
		[100,350], // 7: Artworks
		[200,500], // 8
		[325,700], // 9: Flight Computers
		[450,900], // 10
		[600,1100], // 11
		[800,1350], // 12
		[1000,1600], // 13: Animals
		[1250,1850], // 14
		[1500,2150], // 15
		[1800,2500], // 16
		[2100,2900], // 17
		[2400,3400], // 18
		[2750,3850], // 19
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


	var ecname = sysinfo.economy_description;
	var eckey = ecname.replace(/[^A-Za-z]+/g,"").toLowerCase();
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
	}
	priceband += volatility*(Math.random()-Math.random());
	
	// work out quantity next
	var productivity = parseInt(sysinfo.productivity);
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
		pzeroes -= 1;
		tvolfactor = -0.3*security; // tend to low-ish quantities
	}
	tvolfactor /= security; // again, bigger more stable markets tend to centre

	if (classes.indexOf("sotw-quantity-bulk") != -1) {
		pzeroes += 2;
	} else if (classes.indexOf("sotw-quantity-high") != -1) {
		pzeroes += 1;
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
	if (eckey == "survival") {
		// very limited ability to pay for anything
		priceband -= 1;
		pzeroes -= 1;
	}

	if (pzeroes < 1) { pzeroes = 1; }

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

	var quantity = Math.floor((capacity/2) * bandpos);

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

	var price = (pricebands[priceband][0]*(1-bandpos))+(pricebands[priceband][1]*bandpos); // interpolate price
	marketdef.price = Math.floor(price*10); // convert to decicredits
	
	log(marketdef.name,marketdef.price,marketdef.quantity,marketdef.capacity);

	return marketdef;
};