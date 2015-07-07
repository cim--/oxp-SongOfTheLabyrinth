"use strict";

this.name = "SOTL equipment conditions";

this.allowAwardEquipment = function(eqKey, ship, context) {
	if (context != "purchase") {
		return true;
	}
	if (eqKey == "EQ_FUEL") {
		return (worldScripts["SOTL Hyperspace"].$hyperspaceFuel < worldScripts["SOTL Hyperspace"].$hyperspaceMaxFuel);
	}
	if (eqKey.match(/EQ_WEAPON/)) {
		return false;
	}
	// TODO: more conditions
	return true;
};