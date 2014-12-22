"use strict";

this.name = "SOTW Ship Refit";

this.$logstring = "cim.sotw.debug";
this.$colorDisabled = "0.2 0.5 0.2";
this.$colorEnabled = "0.4 0.9 0.4";

this.$esuse = 0;
this.$desuse = 0;
this.$enregen = 0;


this.playerBoughtEquipment = function(eqKey) {
	if (eqKey == "EQ_SOTW_RECONFIGURE") {
		this.$emstate = "98_home";
		this.$changesMade = false;
		this._equipmentManagerScreen();
	}
}


this.equipmentAdded = function(eqKey) {
	this._evaluateRefit();
}


this.equipmentRemoved = function(eqKey) {
	this._evaluateRefit();
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
	log(this.$logstring,"ES: "+this.$esuse+", DES: "+this.$desuse);
}


this._evaluateRefitSpace = function(eqs,pse) {
	if (eqs.EQUIPMENT_OK > 0 || eqs.EQUIPMENT_DAMAGED > 0) {
		if (pse.scriptInfo && pse.scriptInfo.sotw_esuse) {
			this.$esuse += (eqs.EQUIPMENT_OK + eqs.EQUIPMENT_DAMAGED)*(pse.scriptInfo.sotw_esuse);
		}
		if (pse.scriptInfo && pse.scriptInfo.sotw_enuse) {
			this.$enuse -= (eqs.EQUIPMENT_OK)*(pse.scriptInfo.sotw_enuse);
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



this._updateHUD = function() {
	player.ship.hud = "sotw_hud_refit.plist";
	this.$esuseMax = player.ship.scriptInfo && player.ship.scriptInfo.sotw_es ? player.ship.scriptInfo.sotw_es : 2200;
	this.$desuseMax = player.ship.scriptInfo && player.ship.scriptInfo.sotw_des ? player.ship.scriptInfo.sotw_des : 350;
	this.$esuseFree = this.$esuseMax - this.$esuse;
	this.$desuseFree = this.$desuseMax - this.$desuse;

	player.ship.setCustomHUDDial("sotw_esuse_bar",this.$esuse/this.$esuseMax);
	player.ship.setCustomHUDDial("sotw_desuse_bar",this.$desuse/this.$desuseMax);
	player.ship.setCustomHUDDial("sotw_maxspeed_str",Math.floor(player.ship.maxSpeed)+" m/s");
	player.ship.setCustomHUDDial("sotw_maxturn_str",player.ship.maxPitch.toFixed(2)+" r/s");
}


this._equipmentManagerScreen = function(defaultChoice) {
	this._updateHUD();
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
			"99_save": this._genChoice("Apply Configuration")
		};
		break;
	case "01_engines":
		title = "Refit Engines";
		message = "Select the engines to use in this refit. You must have sufficient cash to purchase the engines, and sufficient space in your ship's drive area to install them (see the DES bar to the left).\n\nLarger engines are more efficient, but if they are damaged in combat you will lose more power as a result.\n\n"+this._infoTable("EQ_SOTW_COMPONENT_ENGINE","sotw_engine");
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
		message = "Select the thrusters to use in this refit. You must have sufficient cash to purchase the thrusters, and sufficient space in your ship to install them (see the ES bar to the left).\n\nLarger thrusters are more efficient, but if they are damaged in combat you will lose more control as a result.\n\n"+this._infoTable("EQ_SOTW_COMPONENT_THRUSTER","sotw_thruster");
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
		player.ship.hud = null;
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

this._infoTable = function(prefix,property) {
	var table = [];
	table[0] = ["Name","Price","TL","Power","Size","Fitted"];
	for (var i=1;i<=4;i++) {
		var eq = EquipmentInfo.infoForKey(prefix+""+i);
		var pse = player.ship.equipmentStatus(prefix+""+i,true);
		var ct = pse.EQUIPMENT_OK + pse.EQUIPMENT_DAMAGED;
		table[i] = [eq.name,(eq.price/10).toFixed(1),eq.techLevel+1,eq.scriptInfo[property],eq.scriptInfo.sotw_esuse,ct];
	}
	var results = "";
	for (i=0;i<=4;i++) {
		var result = "";
		result += table[i][0];
		result = this._pad(result,10);
		result += table[i][1];
		result = this._pad(result,15);
		result += table[i][2];
		result = this._pad(result,20);
		result += table[i][3];
		result = this._pad(result,25);
		result += table[i][4];
		result = this._pad(result,30);
		result += table[i][5];
		result += "\n";
		results += result;
	}
	results += "\nYou have "+player.credits+"₢ and "+this.$esuseFree+"/"+this.$esuseMax+" space ("+this.$desuseFree+"/"+this.$desuseMax+" drive space).";
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