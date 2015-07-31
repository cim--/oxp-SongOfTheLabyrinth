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

	var slots = worldScripts["SOTL Equipment Management"]._slotsUsed();

	if (eqKey == "EQ_SOTL_EXP_REFIT") {
		if (slots == 0) {
			return false;
		}
	}

	var eq = EquipmentInfo.infoForKey(eqKey);	
	if (eq.scriptInfo && eq.scriptInfo.sotl_exp_ismodule) {
		if (slots + parseInt(eq.scriptInfo.sotl_exp_ismodule) > 10) {
			return false;
		}
	}

	// TODO: more conditions
	return true;
};
