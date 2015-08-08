"use strict";

this.name = "SOTL Exploration Trade Goods";

this.updateGeneralCommodityDefinition = function(marketdef, station, system) {

	if (station) { return marketdef; }
	if (system != 0) {
		marketdef.price = 0;
		marketdef.quantity = 0;
		return marketdef;
	}
	
	/* For now */
	marketdef.price = 0; // prevent purchase

	if (worldScripts["SOTL Economy Manager"].$mineralReserves[marketdef.key] !== undefined) {
		// load saved quantities
		marketdef.quantity = worldScripts["SOTL Economy Manager"].$mineralReserves[marketdef.key];
	} else {
		// new game, generate quantities
		if (marketdef.classes.indexOf("sotl-exp-reserves-high") != -1) {
			marketdef.quantity = 200+Math.floor(Math.random()*300);
		} else if (marketdef.classes.indexOf("sotl-exp-reserves-medium") != -1) {
			marketdef.quantity = 50+Math.floor(Math.random()*150);
		} else if (marketdef.classes.indexOf("sotl-exp-reserves-low") != -1) {
			marketdef.quantity = 10+Math.floor(Math.random()*40);
		} else if (marketdef.classes.indexOf("sotl-exp-reserves-verylow") != -1) {
			marketdef.quantity = 1+Math.floor(Math.random()*10);
		} else if (marketdef.classes.indexOf("sotl-exp-reserves-none") != -1) {
			marketdef.quantity = 0;
		}

	}
	
	return marketdef;
}
	
