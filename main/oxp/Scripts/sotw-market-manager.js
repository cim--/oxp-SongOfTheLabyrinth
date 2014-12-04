"use strict";

this.name = "SOTW Market Manager";

this.updateGeneralCommodityDefinition = function(marketdef, station, system) {
	if (station != null) { return marketdef; }
	var economy = System.infoForSystem(galaxyNumber,system).economy_description;
	
	var classes = marketdef.classes;
	





	return marketdef;
};