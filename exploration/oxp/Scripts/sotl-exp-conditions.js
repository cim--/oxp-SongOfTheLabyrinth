"use strict";

this.name = "SOTL equipment conditions";

this.allowAwardEquipment = function(eqKey, ship, context) {
	if (context != "purchase") {
		return true;
	}
	if (eqKey == "EQ_FUEL") {
		return (worldScripts["SOTL Hyperspace"].$hyperspaceFuel < worldScripts["SOTL Hyperspace"].$hyperspaceMaxFuel);
	}
	if (!worldScripts["SOTL Equipment Management"].$weaponManagement) {
		if (eqKey.match(/EQ_WEAPON/)) {
			return false;
		}
	}
	// TODO: more conditions
	return true;
};