"use strict";

this.name = "SOTW Ship Refit";

this.$logstring = "cim.sotw.debug";
this.$colorDisabled = "0.2 0.5 0.2";
this.$colorEnabled = "0.4 0.9 0.4";

this.$esuse = 0;
this.$desuse = 0;
this.$enregen = 0;
this.$shieldBias = 0;


this.startUp = function() {
	if (missionVariables.sotw_refit_shieldbias) {
		this.$shieldBias = missionVariables.sotw_refit_shieldbias;
	} 
}

this.startUpComplete = function() {
	// now enable these methods
	this.equipmentAdded = function(eqKey) {
		this._evaluateRefit();
	}
	
	this.equipmentRemoved = function(eqKey) {
		this._evaluateRefit();
	}

	this._evaluateRefit();
	player.ship.hud = "sotw_hud_refit.plist";
}


this.shipDockedWithStation = function() {
	player.ship.hud = "sotw_hud_refit.plist";
}

this.shipWillLaunchFromStation = function() {
	player.ship.hud = null;
}


this.playerWillSaveGame = function() {
	missionVariables.sotw_refit_shieldbias = this.$shieldBias;
}


this.playerBoughtEquipment = function(eqKey) {
	if (eqKey == "EQ_SOTW_RECONFIGURE") {
		this.$emstate = "98_home";
		this.$changesMade = false;
		this._equipmentManagerScreen();
	}
}






this._clearEquipment = function() {
	var pse = player.ship.equipment;
	log(this.$logstring,"Clearing equipment");
	for (var i=pse.length-1;i>0;i--) {
		if (pse[i].equipmentKey.match(/^EQ_SOTW_COMPONENT_/)) {
			player.ship.removeEquipment(pse[i].equipmentKey);
		}
	}
	this._evaluateRefit();
};



this._evaluateRefit = function() {
	this.$esuse = 0;
	this.$desuse = 0;
	this.$enuse = 0;
	this._evaluateRefitEngines();
	this._evaluateRefitThrusters();
	this._evaluateRefitShields();	
	this._evaluateRefitGenerators();
	this._evaluateRefitCapacitors();
	this._evaluateRefitWitchdrives();
	this._evaluateOtherEquipment();
	log(this.$logstring,"ES: "+this.$esuse+", DES: "+this.$desuse);
	this._updateHUD();
}


this._evaluateOtherEquipment = function() {
	var key, keys = ["EQ_SOTW_COMBAT_COMPUTER","EQ_SOTW_NAVIGATION_COMPUTER"];
	
	while (key = keys.shift()) {
		var eqs = player.ship.equipmentStatus(key,true);
		var pse = EquipmentInfo.infoForKey(key);
		this._evaluateRefitSpace(eqs,pse);
	}
}


this._evaluateRefitSpace = function(eqs,pse) {
	if (eqs.EQUIPMENT_OK > 0 || eqs.EQUIPMENT_DAMAGED > 0) {
		if (pse.scriptInfo && pse.scriptInfo.sotw_esuse) {
			this.$esuse += (eqs.EQUIPMENT_OK + eqs.EQUIPMENT_DAMAGED)*(pse.scriptInfo.sotw_esuse);
		}
		if (pse.scriptInfo && pse.scriptInfo.sotw_enuse) {
			this.$enuse -= (eqs.EQUIPMENT_OK)*(pse.scriptInfo.sotw_enuse);
			if (this.$enuse > 0) {
				player.ship.energyRechargeRate = this.$enuse;
			} else {
				player.ship.energyRechargeRate = 0;
			}
		}
		if (pse.scriptInfo && pse.scriptInfo.sotw_desuse) {
			this.$desuse += (eqs.EQUIPMENT_OK + eqs.EQUIPMENT_DAMAGED)*(pse.scriptInfo.sotw_desuse);
		}
	}
}


this._evaluateRefitEngines = function() {
	var engpower = 0;
	var mass = player.ship.scriptInfo.sotw_mass ? player.ship.scriptInfo.sotw_mass : 1600; // temporary until shipdata sorted out
	for (var i=1;i<4;i++) {
		var key = "EQ_SOTW_COMPONENT_ENGINE"+i;
		var eqs = player.ship.equipmentStatus(key,true);
		var pse = EquipmentInfo.infoForKey(key);

		if (eqs.EQUIPMENT_OK > 0) {
			if (pse.scriptInfo && pse.scriptInfo.sotw_engine) {
				engpower += eqs.EQUIPMENT_OK * parseFloat(pse.scriptInfo.sotw_engine);
			}
		}
		this._evaluateRefitSpace(eqs,pse);
	}
	if (engpower == 0) {
		engpower = 1;
	}
	player.ship.maxSpeed = (engpower * 1000) / mass;
	player.ship.thrust = player.ship.maxThrust = player.ship.maxSpeed / 35; // for now
}


this._evaluateRefitThrusters = function() {
	var thrpower = 0;
	var mass = player.ship.scriptInfo.sotw_mass ? player.ship.scriptInfo.sotw_mass : 1600; // temporary until shipdata sorted out
	for (var i=1;i<4;i++) {
		var key = "EQ_SOTW_COMPONENT_THRUSTER"+i;
		var eqs = player.ship.equipmentStatus(key,true);
		var pse = EquipmentInfo.infoForKey(key);

		if (eqs.EQUIPMENT_OK > 0) {
			if (pse.scriptInfo && pse.scriptInfo.sotw_thruster) {
				thrpower += eqs.EQUIPMENT_OK * parseFloat(pse.scriptInfo.sotw_thruster);
			}
		}
		this._evaluateRefitSpace(eqs,pse);
	}
	if (thrpower == 0) {
		thrpower = 1;
	}
	player.ship.maxPitch = thrpower / mass;
	player.ship.maxRoll = player.ship.maxPitch * 2;
	player.ship.maxYaw = player.ship.maxPitch / 2;
}


this._evaluateRefitShields = function() {
	var shdpower = 0;
	var mass = player.ship.scriptInfo.sotw_mass ? player.ship.scriptInfo.sotw_mass : 1600; // temporary until shipdata sorted out
	var chg = 0; var ct = 0;
	for (var i=1;i<4;i++) {
		var key = "EQ_SOTW_COMPONENT_SHIELD"+i;
		var eqs = player.ship.equipmentStatus(key,true);
		var pse = EquipmentInfo.infoForKey(key);

		if (eqs.EQUIPMENT_OK > 0) {
			if (pse.scriptInfo && pse.scriptInfo.sotw_shield) {
				chg += i; ct++;
				shdpower += eqs.EQUIPMENT_OK * parseFloat(pse.scriptInfo.sotw_shield);
			}
		}
		this._evaluateRefitSpace(eqs,pse);
	}
	chg /= ct;
	player.ship.maxForwardShield = 640 * shdpower * (1+this.$shieldBias) / mass;
	player.ship.maxAftShield = 640 * shdpower * (1-this.$shieldBias) / mass;
	player.ship.forwardShieldRechargeRate = player.ship.aftShieldRechargeRate = chg * chg;
}


this._evaluateRefitGenerators = function() {
	for (var i=1;i<4;i++) {
		var key = "EQ_SOTW_COMPONENT_GENERATOR"+i;
		var eqs = player.ship.equipmentStatus(key,true);
		var pse = EquipmentInfo.infoForKey(key);
		// space and energy is all these need
		this._evaluateRefitSpace(eqs,pse);
	}
}


this._evaluateRefitCapacitors = function() {
	var cappower = 0;
	var mass = player.ship.scriptInfo.sotw_mass ? player.ship.scriptInfo.sotw_mass : 1600; // temporary until shipdata sorted out
	for (var i=1;i<4;i++) {
		var key = "EQ_SOTW_COMPONENT_CAPACITOR"+i;
		var eqs = player.ship.equipmentStatus(key,true);
		var pse = EquipmentInfo.infoForKey(key);

		if (eqs.EQUIPMENT_OK > 0) {
			if (pse.scriptInfo && pse.scriptInfo.sotw_capacitor) {
				cappower += eqs.EQUIPMENT_OK * parseFloat(pse.scriptInfo.sotw_capacitor);
			}
		}
		this._evaluateRefitSpace(eqs,pse);
	}
	if (cappower < 0.05) {
		cappower = 0.05;
	}
	player.ship.maxEnergy = cappower*64;
}


this._evaluateRefitWitchdrives = function() {
	var wd = false;
	for (var i=1;i<=2;i++) {
		var key = "EQ_SOTW_COMPONENT_WITCHDRIVE"+i;
		var eqs = player.ship.equipmentStatus(key,true);
		var pse = EquipmentInfo.infoForKey(key);

		if (eqs.EQUIPMENT_OK > 0) {
			wd = true;
		}
		this._evaluateRefitSpace(eqs,pse);
	}
	player.ship.hyperspaceSpinTime = wd ? 15 : -1;
}


this._updateHUD = function() {
	this.$esuseMax = player.ship.scriptInfo && player.ship.scriptInfo.sotw_es ? player.ship.scriptInfo.sotw_es : 2200;
	this.$desuseMax = player.ship.scriptInfo && player.ship.scriptInfo.sotw_des ? player.ship.scriptInfo.sotw_des : 350;
	this.$esuseFree = this.$esuseMax - this.$esuse;
	this.$desuseFree = this.$desuseMax - this.$desuse;

	player.ship.setCustomHUDDial("sotw_esuse_bar",this.$esuse/this.$esuseMax);
	player.ship.setCustomHUDDial("sotw_desuse_bar",this.$desuse/this.$desuseMax);
	player.ship.setCustomHUDDial("sotw_maxspeed_str",Math.floor(player.ship.maxSpeed)+" m/s");
	player.ship.setCustomHUDDial("sotw_maxturn_str",player.ship.maxPitch.toFixed(2)+" r/s");
	player.ship.setCustomHUDDial("sotw_maxfshield_str",Math.floor(player.ship.maxForwardShield));
	player.ship.setCustomHUDDial("sotw_maxashield_str",Math.floor(player.ship.maxAftShield));
	player.ship.setCustomHUDDial("sotw_shieldbias_ind",this.$shieldBias);

	var genspare = 0;
	if (this.$enuse > 0) {
		// spare energy
		genspare = Math.log(this.$enuse+1)/5;
	} else if (this.$enuse < 0) {
		// too little energy
		genspare = -Math.log((-this.$enuse)+1)/5;
	}
	player.ship.setCustomHUDDial("sotw_genspare_ind",genspare);
	player.ship.setCustomHUDDial("sotw_genpower_str",this.$enuse.toFixed(1));
	player.ship.setCustomHUDDial("sotw_cappower_str",(player.ship.maxEnergy/64).toFixed(2));
	player.ship.setCustomHUDDial("sotw_witchdrive_light",this.equipColor("EQ_SOTW_WITCHDRIVE"));
	player.ship.setCustomHUDDial("sotw_galdrive_light",this.equipColor("EQ_GAL_DRIVE"));
}


this.equipColor = function(key) {
	if (player.ship.hasEquipmentProviding(key)) {
		return "0.0 1.0 0.0 1.0";
	} else {
		return "0.5 0.5 0.5 0.3";
	}
}



this._equipmentManagerScreen = function(defaultChoice) {
	var title, message, choices;
	switch (this.$emstate) {
	case "98_home":
		title = "Refit Ship";
		message = "Ship refitting screen. Select the desired ship configuration with the Refit options, then select 'Apply Configuration' to confirm your decision and have the shipyard refit your ship."; // TODO
		choices = {
			"01_engines": this._genChoice("Refit Engines"),
			"02_thrusters": this._genChoice("Refit Thrusters"),
			"03_shields": this._genChoice("Refit Shields"),
			"04_generators": this._genChoice("Refit Generators"),
			"05_capacitors": this._genChoice("Refit Capacitors"),
			"06_witchdrives": this._genChoice("Refit Witchdrive"),
		};
		if (this.$enuse > 0) {
			choices["99_save"] = this._genChoice("Apply Configuration");
		} else {
			choices["99_save"] = {
				text: "Insufficient generators",
				unselectable: true,
				color: this.$colorDisabled
			};
		}
		break;
	case "01_engines":
		title = "Refit Engines";
		message = "Select the engines to use in this refit. You must have sufficient cash to purchase the engines, and sufficient space in your ship's drive area to install them (see the DES bar to the left).\n\nLarger engines are more efficient, but if they are damaged in combat you will lose more power as a result.\n\n"+this._infoTable("EQ_SOTW_COMPONENT_ENGINE","sotw_engine",4);
		choices = {
			"10_add_engine1": this._addChoice("EQ_SOTW_COMPONENT_ENGINE1"),
			"11_add_engine2": this._addChoice("EQ_SOTW_COMPONENT_ENGINE2"),
			"12_add_engine3": this._addChoice("EQ_SOTW_COMPONENT_ENGINE3"),
			"13_add_engine4": this._addChoice("EQ_SOTW_COMPONENT_ENGINE4"),
			"15_rem_engine1": this._remChoice("EQ_SOTW_COMPONENT_ENGINE1"),
			"16_rem_engine2": this._remChoice("EQ_SOTW_COMPONENT_ENGINE2"),
			"17_rem_engine3": this._remChoice("EQ_SOTW_COMPONENT_ENGINE3"),
			"18_rem_engine4": this._remChoice("EQ_SOTW_COMPONENT_ENGINE4"),
			"19_clear_engine": this._genChoice("Remove all engines"),
			"98_home": this._genChoice("Return to main refit screen")
		};
		break;
	case "02_thrusters":
		title = "Refit Thrusters";
		message = "Select the thrusters to use in this refit. You must have sufficient cash to purchase the thrusters, and sufficient space in your ship to install them (see the ES bar to the left).\n\nLarger thrusters are more efficient, but if they are damaged in combat you will lose more control as a result.\n\n"+this._infoTable("EQ_SOTW_COMPONENT_THRUSTER","sotw_thruster",4);
		choices = {
			"20_add_thruster1": this._addChoice("EQ_SOTW_COMPONENT_THRUSTER1"),
			"21_add_thruster2": this._addChoice("EQ_SOTW_COMPONENT_THRUSTER2"),
			"22_add_thruster3": this._addChoice("EQ_SOTW_COMPONENT_THRUSTER3"),
			"23_add_thruster4": this._addChoice("EQ_SOTW_COMPONENT_THRUSTER4"),
			"25_rem_thruster1": this._remChoice("EQ_SOTW_COMPONENT_THRUSTER1"),
			"26_rem_thruster2": this._remChoice("EQ_SOTW_COMPONENT_THRUSTER2"),
			"27_rem_thruster3": this._remChoice("EQ_SOTW_COMPONENT_THRUSTER3"),
			"28_rem_thruster4": this._remChoice("EQ_SOTW_COMPONENT_THRUSTER4"),
			"29_clear_thruster": this._genChoice("Remove all thrusters"),
			"98_home": this._genChoice("Return to main refit screen")
		};
		break;
	case "03_shields":
		title = "Refit Shields";
		message = "Select the shields to use in this refit. You must have sufficient cash to purchase the shields, and sufficient space in your ship to install them (see the ES bar to the left).\n\nLarger shields are more efficient, but if they are damaged in combat you will lose more defence as a result.\n\n"+this._infoTable("EQ_SOTW_COMPONENT_SHIELD","sotw_shield",4);
		choices = {
			"30_add_shield1": this._addChoice("EQ_SOTW_COMPONENT_SHIELD1"),
			"31_add_shield2": this._addChoice("EQ_SOTW_COMPONENT_SHIELD2"),
			"32_add_shield3": this._addChoice("EQ_SOTW_COMPONENT_SHIELD3"),
			"33_add_shield4": this._addChoice("EQ_SOTW_COMPONENT_SHIELD4"),
			"34_adjust_shield": this._genChoice("Adjust shield bias"),
			"35_rem_shield1": this._remChoice("EQ_SOTW_COMPONENT_SHIELD1"),
			"36_rem_shield2": this._remChoice("EQ_SOTW_COMPONENT_SHIELD2"),
			"37_rem_shield3": this._remChoice("EQ_SOTW_COMPONENT_SHIELD3"),
			"38_rem_shield4": this._remChoice("EQ_SOTW_COMPONENT_SHIELD4"),
			"39_clear_shield": this._genChoice("Remove all shields"),
			"98_home": this._genChoice("Return to main refit screen")
		};
		break;
	case "04_generators":
		title = "Refit Generators";
		message = "Select the generators to use in this refit. You must have sufficient cash to purchase the generators, and sufficient space in your ship to install them (see the ES bar to the left).\n\nLarger generators are more efficient, but if they are damaged in combat you will lose more energy as a result.\n\n"+this._infoTable("EQ_SOTW_COMPONENT_GENERATOR","sotw_generator",4);
		choices = {
			"40_add_generator1": this._addChoice("EQ_SOTW_COMPONENT_GENERATOR1"),
			"41_add_generator2": this._addChoice("EQ_SOTW_COMPONENT_GENERATOR2"),
			"42_add_generator3": this._addChoice("EQ_SOTW_COMPONENT_GENERATOR3"),
			"43_add_generator4": this._addChoice("EQ_SOTW_COMPONENT_GENERATOR4"),
			"45_rem_generator1": this._remChoice("EQ_SOTW_COMPONENT_GENERATOR1"),
			"46_rem_generator2": this._remChoice("EQ_SOTW_COMPONENT_GENERATOR2"),
			"47_rem_generator3": this._remChoice("EQ_SOTW_COMPONENT_GENERATOR3"),
			"48_rem_generator4": this._remChoice("EQ_SOTW_COMPONENT_GENERATOR4"),
			"49_clear_generator": this._genChoice("Remove all generators"),
			"98_home": this._genChoice("Return to main refit screen")
		};
		break;
	case "05_capacitors":
		title = "Refit Capacitors";
		message = "Select the capacitors to use in this refit. You must have sufficient cash to purchase the capacitors, and sufficient space in your ship to install them (see the ES bar to the left).\n\nLarger capacitors are more efficient, but if they are damaged in combat you will lose more energy as a result.\n\n"+this._infoTable("EQ_SOTW_COMPONENT_CAPACITOR","sotw_capacitor",4);
		choices = {
			"50_add_capacitor1": this._addChoice("EQ_SOTW_COMPONENT_CAPACITOR1"),
			"51_add_capacitor2": this._addChoice("EQ_SOTW_COMPONENT_CAPACITOR2"),
			"52_add_capacitor3": this._addChoice("EQ_SOTW_COMPONENT_CAPACITOR3"),
			"53_add_capacitor4": this._addChoice("EQ_SOTW_COMPONENT_CAPACITOR4"),
			"55_rem_capacitor1": this._remChoice("EQ_SOTW_COMPONENT_CAPACITOR1"),
			"56_rem_capacitor2": this._remChoice("EQ_SOTW_COMPONENT_CAPACITOR2"),
			"57_rem_capacitor3": this._remChoice("EQ_SOTW_COMPONENT_CAPACITOR3"),
			"58_rem_capacitor4": this._remChoice("EQ_SOTW_COMPONENT_CAPACITOR4"),
			"59_clear_capacitor": this._genChoice("Remove all capacitors"),
			"98_home": this._genChoice("Return to main refit screen")
		};
		break;
	case "06_witchdrives":
		title = "Refit Witchdrive";
		message = "Select the witchdrive unit to fit to the ship. Multiple witchdrives may be fitted, though this only provides redundancy in the event of damage and does not increase performance. Ships without witchdrives may only enter witchspace by following another ship through a wormhole.\n\n"+this._infoTable("EQ_SOTW_COMPONENT_WITCHDRIVE",false,2);
		choices = {
			"60_add_witchdrive1": this._addChoice("EQ_SOTW_COMPONENT_WITCHDRIVE1"),
			"61_add_witchdrive2": this._addChoice("EQ_SOTW_COMPONENT_WITCHDRIVE2"),
			"65_rem_witchdrive1": this._remChoice("EQ_SOTW_COMPONENT_WITCHDRIVE1"),
			"66_rem_witchdrive2": this._remChoice("EQ_SOTW_COMPONENT_WITCHDRIVE2"),
			"69_clear_witchdrive": this._genChoice("Remove all witchdrives"),
			"98_home": this._genChoice("Return to main refit screen")
		};
		break;
	}
	if (!(defaultChoice && choices[defaultChoice])) {
		defaultChoice = "98_home";
	}
	mission.runScreen({
		exitScreen: "GUI_SCREEN_EQUIP_SHIP",
		allowInterrupt: false,
		screenID: "sotw_refit",
		title: title,
		message: message,
		choices: choices,
		initialChoicesKey: defaultChoice
	}, this._equipmentManagerCallback);
}

this._equipmentManagerCallback = function(choice) {
	switch (choice) {
	case "99_save":
		if (this.$changesMade) {
			clock.addSeconds(86400);
		}
		player.ship.removeEquipment("EQ_SOTW_RECONFIGURE");
		return;
	case "98_home":
		this.$emstate = "98_home";
		break;
	case "01_engines":
		this.$emstate = "01_engines";
		break;
	case "10_add_engine1":
		this._addApply("EQ_SOTW_COMPONENT_ENGINE1");
		break;
	case "11_add_engine2":
		this._addApply("EQ_SOTW_COMPONENT_ENGINE2");
		break;
	case "12_add_engine3":
		this._addApply("EQ_SOTW_COMPONENT_ENGINE3");
		break;
	case "13_add_engine4":
		this._addApply("EQ_SOTW_COMPONENT_ENGINE4");
		break;
	case "15_rem_engine1":
		this._remApply("EQ_SOTW_COMPONENT_ENGINE1");
		break;
	case "16_rem_engine2":
		this._remApply("EQ_SOTW_COMPONENT_ENGINE2");
		break;
	case "17_rem_engine3":
		this._remApply("EQ_SOTW_COMPONENT_ENGINE3");
		break;
	case "18_rem_engine4":
		this._remApply("EQ_SOTW_COMPONENT_ENGINE4");
		break;
	case "19_clear_engine":
		this._clearApply("EQ_SOTW_COMPONENT_ENGINE");
		break;
	case "02_thrusters":
		this.$emstate = "02_thrusters";
		break;
	case "20_add_thruster1":
		this._addApply("EQ_SOTW_COMPONENT_THRUSTER1");
		break;
	case "21_add_thruster2":
		this._addApply("EQ_SOTW_COMPONENT_THRUSTER2");
		break;
	case "22_add_thruster3":
		this._addApply("EQ_SOTW_COMPONENT_THRUSTER3");
		break;
	case "23_add_thruster4":
		this._addApply("EQ_SOTW_COMPONENT_THRUSTER4");
		break;
	case "25_rem_thruster1":
		this._remApply("EQ_SOTW_COMPONENT_THRUSTER1");
		break;
	case "26_rem_thruster2":
		this._remApply("EQ_SOTW_COMPONENT_THRUSTER2");
		break;
	case "27_rem_thruster3":
		this._remApply("EQ_SOTW_COMPONENT_THRUSTER3");
		break;
	case "28_rem_thruster4":
		this._remApply("EQ_SOTW_COMPONENT_THRUSTER4");
		break;
	case "29_clear_thruster":
		this._clearApply("EQ_SOTW_COMPONENT_THRUSTER");
		break;
	case "03_shields":
		this.$emstate = "03_shields";
		break;
	case "30_add_shield1":
		this._addApply("EQ_SOTW_COMPONENT_SHIELD1");
		break;
	case "31_add_shield2":
		this._addApply("EQ_SOTW_COMPONENT_SHIELD2");
		break;
	case "32_add_shield3":
		this._addApply("EQ_SOTW_COMPONENT_SHIELD3");
		break;
	case "33_add_shield4":
		this._addApply("EQ_SOTW_COMPONENT_SHIELD4");
		break;
	case "34_adjust_shield":
		if (this.$shieldBias <= 0.8) {
			this.$shieldBias += 0.1;
		} else {
			this.$shieldBias = -0.9;
		}
		this._evaluateRefit();
		break;
	case "35_rem_shield1":
		this._remApply("EQ_SOTW_COMPONENT_SHIELD1");
		break;
	case "36_rem_shield2":
		this._remApply("EQ_SOTW_COMPONENT_SHIELD2");
		break;
	case "37_rem_shield3":
		this._remApply("EQ_SOTW_COMPONENT_SHIELD3");
		break;
	case "38_rem_shield4":
		this._remApply("EQ_SOTW_COMPONENT_SHIELD4");
		break;
	case "39_clear_shield":
		this._clearApply("EQ_SOTW_COMPONENT_SHIELD");
		break;
	case "04_generators":
		this.$emstate = "04_generators";
		break;
	case "40_add_generator1":
		this._addApply("EQ_SOTW_COMPONENT_GENERATOR1");
		break;
	case "41_add_generator2":
		this._addApply("EQ_SOTW_COMPONENT_GENERATOR2");
		break;
	case "42_add_generator3":
		this._addApply("EQ_SOTW_COMPONENT_GENERATOR3");
		break;
	case "43_add_generator4":
		this._addApply("EQ_SOTW_COMPONENT_GENERATOR4");
		break;
	case "45_rem_generator1":
		this._remApply("EQ_SOTW_COMPONENT_GENERATOR1");
		break;
	case "46_rem_generator2":
		this._remApply("EQ_SOTW_COMPONENT_GENERATOR2");
		break;
	case "47_rem_generator3":
		this._remApply("EQ_SOTW_COMPONENT_GENERATOR3");
		break;
	case "48_rem_generator4":
		this._remApply("EQ_SOTW_COMPONENT_GENERATOR4");
		break;
	case "49_clear_generator":
		this._clearApply("EQ_SOTW_COMPONENT_GENERATOR");
		break;
	case "05_capacitors":
		this.$emstate = "05_capacitors";
		break;
	case "50_add_capacitor1":
		this._addApply("EQ_SOTW_COMPONENT_CAPACITOR1");
		break;
	case "51_add_capacitor2":
		this._addApply("EQ_SOTW_COMPONENT_CAPACITOR2");
		break;
	case "52_add_capacitor3":
		this._addApply("EQ_SOTW_COMPONENT_CAPACITOR3");
		break;
	case "53_add_capacitor4":
		this._addApply("EQ_SOTW_COMPONENT_CAPACITOR4");
		break;
	case "55_rem_capacitor1":
		this._remApply("EQ_SOTW_COMPONENT_CAPACITOR1");
		break;
	case "56_rem_capacitor2":
		this._remApply("EQ_SOTW_COMPONENT_CAPACITOR2");
		break;
	case "57_rem_capacitor3":
		this._remApply("EQ_SOTW_COMPONENT_CAPACITOR3");
		break;
	case "58_rem_capacitor4":
		this._remApply("EQ_SOTW_COMPONENT_CAPACITOR4");
		break;
	case "59_clear_capacitor":
		this._clearApply("EQ_SOTW_COMPONENT_CAPACITOR");
		break;
	case "06_witchdrives":
		this.$emstate = "06_witchdrives";
		break;
	case "60_add_witchdrive1":
		this._addApply("EQ_SOTW_COMPONENT_WITCHDRIVE1");
		break;
	case "61_add_witchdrive2":
		this._addApply("EQ_SOTW_COMPONENT_WITCHDRIVE2");
		break;
	case "65_rem_witchdrive1":
		this._remApply("EQ_SOTW_COMPONENT_WITCHDRIVE1");
		break;
	case "66_rem_witchdrive2":
		this._remApply("EQ_SOTW_COMPONENT_WITCHDRIVE2");
		break;
	case "69_clear_witchdrive":
		this._clearApply("EQ_SOTW_COMPONENT_WITCHDRIVE");
		break;
	}
	this._equipmentManagerScreen(choice);

}


this._addApply = function(key) {
	// add equipment
	// remove cash
	var eq = EquipmentInfo.infoForKey(key);
	if (player.ship.awardEquipment(key)) {
		player.credits -= eq.price/10;
		this.$changesMade = true;
	}
}

this._remApply = function(key) {
	// remove equipment
	// add cash
	var eq = EquipmentInfo.infoForKey(key);
	if (player.ship.removeEquipment(key)) {
		player.credits += eq.price/10;
		this.$changesMade = true;
	}
}

this._clearApply = function(prefix) {
	for (var i=1;i<=4;i++) {
		while (player.ship.equipmentStatus(prefix+""+i) == "EQUIPMENT_OK") {
			this._remApply(prefix+""+i);
		}
	}
}

this._addChoice = function(key) {
	// check enough DES, ES, cash, local TL
	// if so show as enabled, otherwise disabled
	var eq = EquipmentInfo.infoForKey(key);

	var choice = {
		text: "Add "+eq.name,
		unselectable: true,
		color: this.$colorDisabled
	};
	if (eq.techLevel <= system.info.techlevel) {
		if (parseFloat(eq.scriptInfo.sotw_esuse) + this.$esuse <= this.$esuseMax) {
			if (!eq.scriptInfo.sotw_desuse || parseFloat(eq.scriptInfo.sotw_desuse) + this.$desuse <= this.$desuseMax) {
				if (eq.price/10 <= player.credits) {
					choice.unselectable = false;
					choice.color = this.$colorEnabled;
				}
			}
		}
	}
	return choice;

}

this._remChoice = function(key) {
	// check has one, local TL
	// if so show as enabled, otherwise disabled
	var eq = EquipmentInfo.infoForKey(key);

	var choice = {
		text: "Remove "+eq.name,
		unselectable: true,
		color: this.$colorDisabled
	};
	if (player.ship.equipmentStatus(key,true).EQUIPMENT_OK > 0) {
		if (eq.techLevel <= system.info.techlevel) {
			choice.unselectable = false;
			choice.color = this.$colorEnabled;
		}
	}
	return choice;
}


this._genChoice = function(str) {
	return {
		text: str,
		color: this.$colorEnabled
	};
}

this._infoTable = function(prefix,property,len) {
	var table = [];
	if (property) {
		table[0] = ["Name","Price","TL","Power","Size","Fitted"];
	} else {
		table[0] = ["Name","Price","TL","","Size","Fitted"];
	}
	for (var i=1;i<=len;i++) {
		var eq = EquipmentInfo.infoForKey(prefix+""+i);
		var pse = player.ship.equipmentStatus(prefix+""+i,true);
		var ct = pse.EQUIPMENT_OK + pse.EQUIPMENT_DAMAGED;
		if (property) {
			table[i] = [eq.name,(eq.price/10).toFixed(1),eq.techLevel+1,eq.scriptInfo[property],eq.scriptInfo.sotw_esuse,ct];
		} else {
			table[i] = [eq.name,(eq.price/10).toFixed(1),eq.techLevel+1,"",eq.scriptInfo.sotw_esuse,ct];
		}
	}
	var results = "";
	for (i=0;i<=len;i++) {
		var result = "";
		result += table[i][0];
		result = this._pad(result,10);
		result += table[i][1];
		result = this._pad(result,16);
		result += table[i][2];
		result = this._pad(result,18);
		result += table[i][3];
		result = this._pad(result,23);
		result += table[i][4];
		result = this._pad(result,28);
		result += table[i][5];
		result += "\n";
		results += result;
	}
	results += "\nYou have "+player.credits.toFixed(1)+"₢ and "+this.$esuseFree+"/"+this.$esuseMax+" space ("+this.$desuseFree+"/"+this.$desuseMax+" drive space).";
	return results;
}

this._pad = function(str,length) {
	var current = defaultFont.measureString(str);
	var space = defaultFont.measureString(" ");
	var hair = defaultFont.measureString(String.fromCharCode(31));
	while (current + space < length) {
		str += " ";
		current = defaultFont.measureString(str);
	}
	while (current + hair < length) {
		str += String.fromCharCode(31);
		current = defaultFont.measureString(str);
	}
	return str;
}