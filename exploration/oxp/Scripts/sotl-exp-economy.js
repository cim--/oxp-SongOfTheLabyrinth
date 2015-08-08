"use strict";

this.name = "SOTL Economy Manager";

this.$mineralReserves = {};


this.startUpComplete = function() {
	if (missionVariables.sotl_exp_goods) {
		this.$mineralReserves = JSON.parse(missionVariables.sotl_exp_goods);
		this._restoreStationMarket();
	}
};


this.shipWillEnterWitchspace = function() {
	this._storeStationMarket();
}

this.playerWillSaveGame = function() {
	this._storeStationMarket();
	missionVariables.sotl_exp_goods = JSON.stringify(this.$mineralReserves);
}




this._storeStationMarket = function() {
	if (!system.mainStation) {
		return;
	}
	var market = system.mainStation.market;
	var goods = Object.keys(market);
	for (var i=0;i<goods.length;i++) {
		this.$mineralReserves[goods[i]] = market[goods[i]].quantity;
	}
}

this._restoreStationMarket = function() {
	if (!system.mainStation) {
		return;
	}
	var market = system.mainStation.market;
	var goods = Object.keys(market);
	for (var i=0;i<goods.length;i++) {
		system.mainStation.setMarketQuantity(goods[i], this.$mineralReserves[goods[i]]);
	}
}
