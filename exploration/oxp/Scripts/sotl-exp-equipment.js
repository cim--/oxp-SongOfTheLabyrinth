"use strict";

this.name = "SOTL Equipment Management";

this.startUp = function() {
	this._processEquipment();
	this.equipmentAdded = function() {
		this._processEquipment();
	}
	this.equipmentRemoved = function() {
		this._processEquipment();
	}
};


this.playerBoughtEquipment = function(eq) {
	
	if (eq == "EQ_SOTL_EXP_REFIT") {
		player.ship.removeEquipment("EQ_SOTL_EXP_REFIT");
		this._startRefit();
	}
}


// for now, just repair all damaged equipment
// in future, remove it and add it to the production queues
this.shipWillDockWithStation = function() {
	var eq = player.ship.equipment;
	var repairs = false;
	for (var i=0;i<eq.length;i++) {
		var estatus = player.ship.equipmentStatus(eq[i].equipmentKey,true);
		if (estatus['EQUIPMENT_DAMAGED']) {	
			for (var j=0;j<estatus['EQUIPMENT_DAMAGED'];j++) {
				player.ship.setEquipmentStatus(eq[i].equipmentKey,"EQUIPMENT_OK");
				repairs = true;
			}
		}
	};
	if (repairs) {
		player.addMessageToArrivalReport("We have repaired the damaged components.");
	}
};



this._processEquipment = function() {
	var fuel = 0;
	var cap = 0;
	var err = 4;
	var cargo = 0;
	
	var gstatus = player.ship.equipmentStatus("EQ_SOTL_EXP_GENERATOR");
	if (gstatus == "EQUIPMENT_DAMAGED") {
		err = 2;
	}
	var cstatus = player.ship.equipmentStatus("EQ_SOTL_EXP_CAPACITOR",true);
	cap += (cstatus["EQUIPMENT_OK"]*64)+(cstatus["EQUIPMENT_DAMAGED"]*8);
	if (cap == 0) {
		cap = 8;
	}
	var fstatus = player.ship.equipmentStatus("EQ_SOTL_EXP_FUELTANK",true);
	fuel += (fstatus["EQUIPMENT_OK"]*6)+(fstatus["EQUIPMENT_DAMAGED"]*1);
	if (fuel == 0) {
		fuel = 1;
	}
	var sstatus = player.ship.equipmentStatus("EQ_SOTL_EXP_SAMPLECOLLECTION",true);
	cargo += (sstatus["EQUIPMENT_OK"]*15)+(sstatus["EQUIPMENT_DAMAGED"]*15);
	// damage stops it acting as a scoop, but doesn't directly affect
	// anything already there: cargo already takes damage as it is.

	worldScripts["SOTL Hyperspace"].$hyperspaceMaxFuel = fuel;
	if (worldScripts["SOTL Hyperspace"].$hyperspaceFuel > fuel) {
		worldScripts["SOTL Hyperspace"]._setFuel(fuel,true);
	}

	player.ship.energyRechargeRate = err;
	player.ship.maxEnergy = cap;
	if (player.ship.docked || player.ship.energy > player.ship.maxEnergy) {
		player.ship.energy = cap;
	}

	while (player.ship.cargoSpaceUsed > cargo) {
		// remove a random cargo unit
		manifest[manifest.list[Math.floor(Math.random()*manifest.list.length)].commodity]--;
	}
	player.ship.cargoSpaceCapacity = cargo;

	player.ship.maxForwardShield = 0;
	player.ship.maxAftShield = 0;

	// force recalculation of fuel requirement bar
	delete worldScripts["SOTL HUD Dials management"].$dest;
};



this._startRefit = function() {
	mission.runScreen({
		title: "Refit internal modules",
		choices: this._moduleListChoices(),
		allowInterrupt: true,
		exitScreen: "GUI_SCREEN_EQUIPSHIP"
	},this._processModuleSelection);
};


this._moduleListChoices = function() {
	var list = {};
	var slot = 0;
	modules = this._moduleList();
	for (var i=0;i<modules.length;i++) {
		list["0"+slot+"_UPDATE"] = modules[i].name;
		slot++;
	}
	if (slot < 10) {
		for (i=slot;i<10;i++) {
			list["0"+i+"_UPDATE_EMPTY"] = "Empty compartment";
		}
	}
	list["99_EXIT"] = "End refit";
	return list;
}

this._moduleList = function() {
	var modules = [];
	var eq = player.ship.equipment;
	for (var i=0;i<eq.length;i++) {
		if (eq[i].scriptInfo.sotl_exp_ismodule) {
			modules.push(eq[i]);
		}
	};
	return modules;
};


this._processModuleSelection = function(choice) {
	if (choice == "99_EXIT") {
		return;
	} else {
		var slot = parseInt(choice.substr(1,1));
		this._refitSlot(slot);
	}
}

this._refitSlot = function(slot) {
	var modules = this._moduleList();
	var desc;
	if (slot >= modules.length) {
		desc = "Empty compartment.\n\nLaunched exploration tools such as satellites and probes can be retrieved into this compartment for repair and reuse."
	} else {
		desc = modules[slot].name+"\n\n"+modules[slot].description;
	}

	mission.runScreen({
		title: "Refit compartment "+(slot+1),
		message: desc,
		choices: this._availableModuleChoices(),
		allowInterrupt: true,
		exitScreen: "GUI_SCREEN_EQUIPSHIP"
	}, this._processRefitRequest.bind(this,slot));

}


this._availableModuleChoices = function() {
	var list = {};
	var eqs = EquipmentInfo.allEquipment;
	for (var i=0;i<eqs.length;i++) {
		if (eqs[i].scriptInfo.sotl_exp_ismodule) {
			var ln = i;
			if (i < 10) {
				ln = "0"+i;
			}
			list[ln+"_"+eqs[i].equipmentKey] = "Fit "+eqs[i].name;
		}
	}
	list["90_EMPTY"] = "Empty compartment";
	list["98_RETURN"] = "Return to compartment list";
	return list;

}

this._processRefitRequest = function(slot, choice) {
	if (choice == "98_RETURN") {
		this._startRefit();
		return;
	} else if (choice == "90_EMPTY") {
		var modules = this._moduleList();
		if (slot < modules.length) {
			player.ship.removeEquipment(modules[slot].equipmentKey);
		}
	
	} else {
		var item = choice.substr(3);
		var modules = this._moduleList();
		if (slot < modules.length) {
			player.ship.removeEquipment(modules[slot].equipmentKey);
		}
		player.ship.awardEquipment(item);
		
	}
	this._startRefit();
};