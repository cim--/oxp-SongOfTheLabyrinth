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
	cargo += (fstatus["EQUIPMENT_OK"]*15)+(fstatus["EQUIPMENT_DAMAGED"]*15);
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
};