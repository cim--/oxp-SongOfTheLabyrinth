this.name = "SOTL Conditions Script";

// no conditions defined yet

this.allowAwardEquipment = function(eqKey,ship,context) {
	if (context == "purchase" && eqKey.match(/^EQ_SOTL_COMPONENT_/)) {
		// components purchased through refit
		return false;
	}
	if (context == "purchase" || context == "scripted") {
		var eq = EquipmentInfo.infoForKey(eqKey);
		if (eq.scriptInfo && eq.scriptInfo.sotl_esuse && (worldScripts["SOTL Ship Refit"].$esuseMax - worldScripts["SOTL Ship Refit"].$esuse < eq.scriptInfo.sotl_esuse)) {
			// not enough space
			return false;
		}
		// no need to check desuse here yet
	}

	// three possible refuelling options
	if (eqKey == "EQ_SOTL_REFUEL_CARRIED") {
		if (player.ship.fuel == 7 || manifest["sotl-fuel"] == 0) {
			return false;
		}
	} else if (eqKey == "EQ_SOTL_REFUEL_MARKET") {
		if (player.ship.fuel == 7 || player.ship.dockedStation.market["sotl-fuel"].quantity == 0) {
			return false;
		}
	} else if (eqKey == "EQ_SOTL_REFUEL_PRIVATE") {
		// only if there's no more easily accessible fuel
		// a more general premium offer thing can go on interfaces later, maybe
		if (player.ship.fuel == 7 || player.ship.dockedStation.market["sotl-fuel"].quantity > 0 || manifest["sotl-fuel"] == 0) {
			return false;
		}
	}

	if (eqKey == "EQ_SOTL_REFUEL_INFLIGHT") {
		// no point in installing this on a ship without a hold
		if (player.ship.cargoSpaceCapacity == 0) {
			return false;
		}
	}

	// else
	return true;
}

this.updateEquipmentPrice = function(key,price) {
	if (key == "EQ_SOTL_REFUEL_MARKET" || key == "EQ_SOTL_REFUEL_PRIVATE") {
		price = player.ship.dockedStation.market["sotl-fuel"].price + 10;
	}
	return price;
}