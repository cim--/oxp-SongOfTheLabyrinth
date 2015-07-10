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
	marketdef.price = 0;
	marketdef.quantity = 0;
	return marketdef;
}
	