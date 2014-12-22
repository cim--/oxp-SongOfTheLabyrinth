"use strict";

this.name = "SOTW Conditions Script";

// no conditions defined yet

this.allowAwardEquipment = function(eqKey,ship,context) {
	if (context == "purchase" && eqKey.match(/^EQ_SOTW_COMPONENT_/)) {
		// components purchased through refit
		return false;
	}
	

	// else
	return true;
}