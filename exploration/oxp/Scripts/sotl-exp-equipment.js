"use strict";

this.name = "SOTL Equipment Management";

this.$weaponManagement = false;

/* Event handlers */

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

/* General equipment management */

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
	cargo += (sstatus["EQUIPMENT_OK"]?sstatus["EQUIPMENT_OK"]*15:0)+(sstatus["EQUIPMENT_DAMAGED"]?sstatus["EQUIPMENT_DAMAGED"]*15:0);
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

	this.$weaponManagement = true;
	if (player.ship.hasEquipmentProviding("EQ_SOTL_EXP_PROSPECTINGLASER")) {
		player.ship.forwardWeapon = "EQ_WEAPON_SOTL_PROSPECTING";
	} else {
		player.ship.forwardWeapon = "EQ_WEAPON_NONE";
	}
	this.$weaponManagement = false;

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
	if (choice == null || choice == "99_EXIT") {
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
	if (choice == null) {
		return;
	} else if (choice == "98_RETURN") {
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


/*** Equipment items ***/

this.$sensorValues = [0,0,0,0,0,0,0,0,0,0];
this.$sensorLabels = ["-","I","N","A","C","T","I","V","E","-"];

/* Null sensor */

this._nullSensorSetValues = function() {
	this.$sensorValues = [0,0,0,0,0,0,0,0,0,0];
	this.$sensorLabels = ["-","I","N","A","C","T","I","V","E","-"];
}

this._deactivateSensors = function() {
	this._gravSensorDeactivate();
	this._spectralSensorDeactivate();
	this._nullSensorSetValues();
};

/* Gravitational Sensor */

this.$gravSensorOn = false;
this.$gravSensorScanning = false;
this.$gravSensorFCB = null;
this.$gravSensorErrorLevel = 1;

/* Modes: power, scan, assign reading to compass target, exclude
 * scanned target from reading */
this.$gravSensorControlMode = "power";

this.$gravSensorVector = new Vector3D(0,0,0);
this.$gravSensorResult = new Vector3D(0,0,0);
this.$gravSensorExclusions = [];

this._gravSensorDeactivate = function() {
	player.ship.thrust = player.ship.maxThrust;
	this.$gravSensorOn = false;
	if (this.$gravSensorFCB != null) {
		removeFrameCallback(this.$gravSensorFCB);
		this.$gravSensorFCB = null;
	}
}


this._gravSensorButton1 = function() {
	if (!this.$gravSensorOn) {
		if (player.ship.speed > 0 || player.ship.velocity.magnitude() > 0) {
			player.consoleMessage("Gravitational Sensor: unable to activate - must be stationary");
		} else {
			this._deactivateSensors(); // turn off any other sensors
			this.$gravSensorOn = true;
			this.$gravSensorScanning = false;
			this.$gravSensorControlMode = "power";
			this.$gravSensorErrorLevel = 1;
			this.$gravSensorExclusions = [];

			this._gravSensorResetValues();
			player.ship.maxThrust = player.ship.thrust; // just in case
			player.ship.thrust = 0;
			this.$gravSensorVector = new Vector3D(0,0,0);
			this.$gravSensorResult = new Vector3D(0,0,0);
			player.consoleMessage("Gravitational Sensor: online");

		}
	} else {
		switch (this.$gravSensorControlMode) {
		case "power":
			player.consoleMessage("Gravitational Sensor: offline");
			this._deactivateSensors();
			break;
		case "scan":
			this._gravSensorScan();
			break;
		case "assign":
			this._gravSensorAssign();
			break;
		case "exclude":
			this._gravSensorExclude();
			break;
		}
	}
}

this._gravSensorButton2 = function() {
	if (!this.$gravSensorOn) {
		player.consoleMessage("Gravitational Sensor Inactive");
	} else {
		switch (this.$gravSensorControlMode) {
		case "power":
			this.$gravSensorControlMode = "scan";
			player.consoleMessage("Gravitational Sensor mode: scan control");
			break;
		case "scan":
			if (this.$gravSensorScanning) {
				player.consoleMessage("Gravitational Sensor: scan active - cannot change control mode");
			} else {
				this.$gravSensorControlMode = "assign";
				player.consoleMessage("Gravitational Sensor mode: scan assignment");
			}
			break;
		case "assign":
			this.$gravSensorControlMode = "exclude";
			player.consoleMessage("Gravitational Sensor mode: scan filtering");
			break;
		case "exclude":
			this.$gravSensorControlMode = "power";
			player.consoleMessage("Gravitational Sensor mode: power control");
			break;
		}
	}
}


this._gravSensorResetValues = function() {
	this.$sensorValues = [0,0,0,0,0,0,0,0.5,0.5,0.5];
	this.$sensorLabels = [" G","mG","µG","nG","pG","fG","","X","Y","Z"];
};

this._gravSensorCount = function() {
	var status = player.ship.equipmentStatus("EQ_SOTL_EXP_SENSORGRAVITATIONAL",true);
	if (status['EQUIPMENT_OK']) {
		return status['EQUIPMENT_OK'];
	} else {
		return 0;
	}
}


this._gravSensorScan = function() {
	if (this.$gravSensorScanning) {
		this.$gravSensorScanning = false;
		removeFrameCallback(this.$gravSensorFCB);
		this.$gravSensorFCB = null;
		player.consoleMessage("Gravitational scan ended");
	} else {
		player.consoleMessage("Gravitational scan begun");
		this.$gravSensorScanning = true;
		this.$gravSensorErrorLevel = 1;
		this.$gravSensorVector = this._gravSensorWorldVector();
		this.$gravSensorResult = new Vector3D(0,0,0);
		this.$gravSensorFCB = addFrameCallback(this._gravSensorRunScan.bind(this));
	}
};


this._gravSensorAssign = function() {
	if (this.$gravSensorResult.magnitude() == 0) {
		player.consoleMessage("No gravitational scan stored. Run scan first.");
	} else {
		var dws = worldScripts["SOTL discovery checks"];
		var target = worldScripts["SOTL discovery checks"]._compassTarget();
		if (target == null || target == system.mainStation) {
			player.consoleMessage("Invalid target to assign gravitational scan. Adjust compass.");
		} else {
			var g = this.$gravSensorResult.magnitude();
//			log(this.name,"Estimated force: "+g+" G");
			var relpos = target.position.subtract(player.ship.position);
			var rdist = relpos.magnitude()/target.radius;

			if (target == system.sun) {
				assigner = dws._discoverStarProperty.bind(dws,"gravity");
				// readjust for sun gravity distance faking curve
				g *= this._gravSensorSunAdjustment(rdist);

			} else { // is planet
				assigner = dws._discoverPlanetProperty.bind(dws,target.sotl_planetIndex,"gravity");
			}
//			log(this.name,"Distance: "+rdist+" radii");
			// remove components not in direction of target
			// (works better if other masses filtered out before the scan)
//			log(this.name,"Directional bias: "+relpos.direction().dot(this.$gravSensorResult.direction()));
			g *= relpos.direction().dot(this.$gravSensorResult.direction());
//			log(this.name,"Contributed force: "+g+" G");
			// surface gravity estimate
			g *= (rdist*rdist);
//			log(this.name,"Estimated surface force: "+g+" G");
			assigner(g);
			player.consoleMessage("Estimated surface gravity: "+g.toFixed(3)+" G",7);
		}
	}
};


this._gravSensorExclude = function() {
	var target = worldScripts["SOTL discovery checks"]._compassTarget();
	if (!target.isSun && !target.isPlanet) {
		player.consoleMessage("Invalid target to exclude from gravitational scan. Adjust compass.");
	} else {
		var grav = worldScripts["SOTL discovery checks"]._reportedGravity(target);
		if (grav == -1) {
			player.consoleMessage("No gravity estimate for this object - cannot filter from scan results");
		} else {
			var idx = this.$gravSensorExclusions.indexOf(target);
			if (idx == -1) {
				player.consoleMessage("Now filtering target from subsequent scans");
				this.$gravSensorExclusions.push(target);
			} else {
				player.consoleMessage("Now not filtering target from subsequent scans");
				this.$gravSensorExclusions.splice(idx,1);
			}
			this.$gravSensorResult = new Vector3D(0,0,0);
			player.consoleMessage("Now filtering "+this.$gravSensorExclusions.length+" mass(es)");
		}
	}
};


this._gravSensorErrorMagnitude = function() {
	var systematic = 1E-6;
	var sensors = this._gravSensorCount();
	if (sensors > 1) {
		systematic = 1E-8;
		if (sensors > 2) {
			systematic = 1E-10;
			if (sensors > 3) {
				systematic = 1E-12;
				if (sensors > 4) {
					// more than 5 gives no additional benefit
					systematic = 1E-14;
				}
			}
		}
	}
	return systematic;
}

this._gravSensorWorldVector = function() {
	var vect = new Vector3D(0,0,0);
	var star = JSON.parse(system.info.star_data);
	var sg = 28.02 * (star.mass / ((star.radius/14E5)*(star.radius/14E5)));

	vect = this._gravSensorAddVector(vect,sg,system.sun,true);
//	log(this.name,"Gravitational vector with sun = "+vect.x+", "+vect.y+", "+vect.z);

	var planetdata = JSON.parse(system.info.planet_data)
	var planets = system.planets;
	for (var i=0;i<planets.length;i++) {
		var pn = planets[i];
		if (pn.sotl_planetIndex !== undefined) {
			var idx = pn.sotl_planetIndex;
			vect = this._gravSensorAddVector(vect,planetdata[idx].surfaceGravity,pn,false);
//			log(this.name,"Gravitational vector with planet "+idx+" = "+vect.x+", "+vect.y+", "+vect.z);
		}
	}

	// exclusions
	for (i=0;i<this.$gravSensorExclusions.length;i++) {
		var exc = this.$gravSensorExclusions[i];
		var exg = worldScripts["SOTL discovery checks"]._reportedGravity(exc);
		if (exg != -1) {
			/* Note: excludes what the player currently *thinks* the
			 * object is, not what it actually is */
			vect = this._gravSensorAddVector(vect,-exg,exc,exc.isSun);
		}
	}
	
	var systematic = Vector3D.randomDirectionAndLength(this._gravSensorErrorMagnitude());

	return vect.add(systematic);
};

this._gravSensorSunAdjustment = function(rdist) {
	if (rdist > 1) {
		var adjdist = 0.5+(rdist/2);
		if (adjdist > 25) {
			adjdist = 25;
		}
		return adjdist;
	}
	return 1;
}

this._gravSensorAddVector = function(vect, grav, obj, sunAdjustment) {
	var dist = player.ship.position.distanceTo(obj);
	var rdist = dist / obj.radius;

	if (sunAdjustment) {
		/* due to differing scales, stars are 5 times the radius they
		 * "should" be, so end up with 25 times the effective gravity
		 * at distance. Scale the reported sun gravity smoothly from
		 * 'real' to '0.04' at increasing distance from the
		 * surface. */
		
		grav /= this._gravSensorSunAdjustment(rdist);
		
		/* planets are small enough that being 25 times the radius
		 * they "should" have doesn't cause the same sort of issues */
	} 

	var g = grav/(rdist*rdist);
//	log(this.name,"Object projecting "+g+"G");
	var force = obj.position.subtract(player.ship.position).direction().multiply(g);
	return vect.add(force);
};


this._gravSensorRunScan = function(delta) {
	
	var errormag = this._gravSensorErrorMagnitude();
	if (this.$gravSensorErrorLevel < errormag) {
		this.$gravSensorErrorLevel = errormag;
	} else {
		var turn = Math.abs(player.ship.roll)+Math.abs(player.ship.pitch)+Math.abs(player.ship.yaw);
		if (turn == 0) {
			// reduce error levels
			this.$gravSensorErrorLevel = Math.pow(0.5,delta)*this.$gravSensorErrorLevel;
		} else {
			// rapidly increase error levels
			this.$gravSensorErrorLevel *= (1+(turn*delta));
			if (this.$gravSensorErrorLevel < 1E-7) {
				this.$gravSensorErrorLevel *= 2;
			}
		}
		errormag = this.$gravSensorErrorLevel;
	}

	var measurement = this.$gravSensorVector.add(Vector3D.random(errormag));
	this.$gravSensorResult = measurement;

	// plot directional measurement
	var direction = measurement.direction();

	var transformed = new Vector3D(
		direction.dot(player.ship.vectorRight),
		direction.dot(player.ship.vectorUp),
		direction.dot(player.ship.vectorForward)
	);

	var normalised = transformed.multiply(0.5).add([0.5,0.5,0.5]);
	this.$sensorValues[7] = normalised.x;	
	this.$sensorValues[8] = normalised.y;
	this.$sensorValues[9] = normalised.z;

	var strength = measurement.magnitude();
	var scale = 1;
	for (var i=0;i<=5;i++) {
		var result = ((strength/scale)/1000);
		if (result < 0) {
			result = 0;
		} else if (result > 1) {
			result = 1
		}
		this.$sensorValues[i] = result;
		strength -= Math.floor(strength/scale)*scale;
		scale /= 1000;
	}
}



/* Spectral Sensor */

this.$spectralSensorOn = false;
this.$spectralSensorScanning = false;
this.$spectralSensorFCB = null;

/* Modes: power, scan stellar, scan atmosphere, scan asteroid (2 modes) */
this.$spectralSensorControlMode = "power";

this.$spectralSensorTarget = [0,0,0,0,0,0,0,0,0,0];
this.$spectralSensorResults = [0,0,0,0,0,0,0,0,0,0];

this._spectralSensorResetValues = function() {
	this.$sensorValues = [0,0,0,0,0,0,0,0,0,0];
	this.$spectralSensorResults = [0,0,0,0,0,0,0,0,0,0];
	switch (this.$spectralSensorControlMode) {
	case "power":
		this.$sensorLabels = ["S","T","A","N","D","B","Y",".",".","."];
		break;
	case "stellar":
		this.$sensorLabels = ["H","He","C","O","Na","Mg","Ca","Fe","Ni","Pb"];
		break;
	case "planetary":
		this.$sensorLabels = ["H","N","O","Ar","CO2","CO","H2O","SO2","CH4","MV"];
		break;
	case "asteroid1":
		this.$sensorLabels = ["Si","H2O","Fe","Cu","Al","Ti","U","Pt","Pd","Au"];
		break;
	case "asteroid2":
		this.$sensorLabels = ["Si","H2O","Fe","Ir","Rh","Te","In","Rh","Ru","Os"];
		break;
	}
};


this._spectralSensorDeactivate = function() {
	this.$spectralSensorOn = false;
	this.$spectralSensorScanning = false;
	if (this.$spectralSensorFCB != null) {
		removeFrameCallback(this.$spectralSensorFCB);
		this.$spectralSensorFCB = null;
	}
}


this._spectralSensorButton1 = function() {
	if (!this.$spectralSensorOn) {
		this._deactivateSensors();
		this.$spectralSensorOn = true;
		this.$spectralSensorScanning = false;
		this.$spectralSensorControlMode = "power";
		this._spectralSensorResetValues();
		player.consoleMessage("Spectral sensor: online");
	} else {
		if (this.$spectralSensorControlMode == "power") {
			this._deactivateSensors();
			player.consoleMessage("Spectral sensor: offline");
		} else {
			// start scan if not started
			// and facing appropriate object
			if (!this.$spectralSensorScanning) {
				if (this._spectralCheckScanAlignment()) {
					this.$spectralSensorScanning = true;
					this.$spectralSensorTarget = this._spectralSetTargets();
					this.$spectralSensorResults = [0,0,0,0,0,0,0,0,0,0];
					
					this.$spectralSensorFCB = addFrameCallback(this._spectralSensorRunScan.bind(this));

				} else {
					player.consoleMessage("Spectral sensor: Not aligned with suitable target - realign and retry");
				}
			} else {
				// stop scan if started
				this.$spectralSensorScanning = false;
				removeFrameCallback(this.$spectralSensorFCB);
				this.$spectralSensorFCB = null;

				// and push results to status
				this._spectralSaveResults();
			}
		}
	}
}


this._spectralSensorButton2 = function() {
	if (this.$spectralSensorScanning) {
		player.consoleMessage("Spectral sensor: Cannot change mode while scan running");
	} else if (!this.$spectralSensorOn) {
		player.consoleMessage("Spectral sensor: Not active");
	} else {
		switch (this.$spectralSensorControlMode) {
		case "power":
			this.$spectralSensorControlMode = "stellar";
			player.consoleMessage("Selected stellar scan mode");
			break;
		case "stellar":
			this.$spectralSensorControlMode = "planetary";
			player.consoleMessage("Selected atmospheric scan mode");
			break;
		case "planetary":
			this.$spectralSensorControlMode = "asteroid1";
			player.consoleMessage("Selected asteroid common scan mode");
			break;
		case "asteroid1":
			this.$spectralSensorControlMode = "asteroid2";
			player.consoleMessage("Selected asteroid rare scan mode");
			break;
		case "asteroid2":
			this.$spectralSensorControlMode = "power";
			player.consoleMessage("Selected sensor power mode");
			break;
		}
		this._spectralSensorResetValues();
	}
}

this._spectralGetTargetObject = function() {
	var target = null;
	switch ($spectralSensorControlMode) {
	case "stellar":
		target = system.sun;
		break;
/*	case "planetary":
		target = worldScripts["SOTL discovery checks"]._compassTarget();
		if (!target.isPlanet) {
			target = null;
		}
		break;
	case "asteroid1":
	case "asteroid2":
		target = player.ship.target;
		if (!target.hasRole("asteroid")) {
			target = null;
		}
		break; */ // TODO: not yet implemented
	}
	return target;
};

this._spectralCheckScanAlignment = function() {
	var target = this._spectralGetTargetObject();
	if (target == null) {
		return false;
	}
	var vect = target.position.subtract(player.ship.position);
	var align = vect.direction().dot(player.ship.vectorForward);
	var req = vect.magnitude() / Math.sqrt(Math.pow(vect.magnitude(),2)+Math.pow(target.collisionRadius,2));
	return align >= req;
};



this._spectralSetTargets = function() {
	var target = this._spectralGetTargetObject();
	switch ($spectralSensorControlMode) {
	case "stellar":
		return this._spectralSetTargetsSun();
		// TODO: others!
	}
};


this._spectralSetTargetsSun = function() {
	var star = JSON.parse(system.info.star_data);
	var r = worldScripts["SOTL Ranrot"];
	r._srand(star.mineralSeed);
	
	// "H","He","C","O","Na","Mg","Ca","Fe","Zn","Pb"
	// log scale
	var baseline = [105, 95, 70, 75, 45, 60, 50, 60, 30, 10];
	var minerals = star.mineralFactor*100;
	for (var i=0;i<minerals;i++) {
		if (r._randf() * 2 < star.mineralFactor) {
			baseline[2+(r._rnd()%8)] += 1;
		} else {
			baseline[r._rnd()%2] += 1;
		}
	}

	return baseline;
};


this._spectralSaveResults = function() {
	switch ($spectralSensorControlMode) {
	case "stellar":
		this._spectralSaveResultSun();
		break;
		// TODO: others!
	}
};


this._spectralSaveResultSun = function() {

	var star = JSON.parse(system.info.star_data);
	var brightness = star.brightness;
	var accuracy = this.$spectralSensorResults[0]/100;
	if (accuracy < 0.95 || accuracy > 1.05) {
		brightness *= accuracy*accuracy;
	}
	worldScripts["SOTL discovery checks"]._discoverStarProperty("brightness",brightness);
	player.consoleMessage("Star Brightness: "+brightness.toFixed(3)+" Sl",7);

	var metallicity = star.mineralFactor;
	var accuracy = 1;
	var expected = 0;
	var actual = 0;
	var max = 0;
	for (var i=0;i<10;i++) {
		expected += this.$spectralSensorTarget[i];
		actual += this.$spectralSensorResults[i];
		if (max < this.$spectralSensorResults[i]) {
			max = this.$spectralSensorResults[i];
		}
	}
	var conversion = (actual/expected);
	for (var i=0;i<10;i++) {
		accuracy += ((this.$spectralSensorResults[i]/this.$spectralSensorTarget[i])/conversion)-1;
	}
	accuracy *= max/100;
	// accuracy = 1 for a perfect check
	metallicity *= accuracy * accuracy;
	if (metallicity > 2) {
		player.consoleMessage("Star Metallicity: corrupted data - rescan",7);		
	} else {
		player.consoleMessage("Star Metallicity: "+metallicity.toFixed(2)+" M",7);

		worldScripts["SOTL discovery checks"]._discoverStarProperty("metallicity",metallicity);
	}
};


this._spectralSensorRunScan = function(delta) {
	var status = player.ship.equipmentStatus("EQ_SOTL_EXP_SENSORSPECTROSCOPIC",true);
	var scount = 0;
	if (status['EQUIPMENT_OK']) {
		scount = status['EQUIPMENT_OK'];
	} else {
		scount = 0;
		return; // should never get here
	}
	// TODO: if scanning asteroid, return unless laser fired

	var target = this._spectralGetTargetObject();

	var ifactor = 50;
	// TODO: ifactor varies between planets, asteroids, stars
	// ifactor for planets best if at ~mid-crescent angle
	var intensity = Math.pow((target.collisionRadius*ifactor / target.position.distanceTo(player.ship)),2);
	var noiseIntensity = 0.2/(scount*scount);
	if (!this._spectralCheckScanAlignment()) {
		intensity = 0; // must stay on target
	}

	var total = 0;
	for (var i=0;i<10;i++) {
		total += this.$spectralSensorTarget[i];
	}

	for (i=0;i<10;i++) {
		// add noise
		this.$spectralSensorResults[i] += delta*noiseIntensity*Math.random();
	}

	for (var i=0;i<10;i++) {
		var proportion = this.$spectralSensorTarget[i]/total;
		this.$spectralSensorResults[i] += delta*intensity*proportion;
		if (this.$spectralSensorResults[i] > 100) {
			for (i=0;i<10;i++) {
				// rapid oversaturation of sensors!
				this.$spectralSensorResults[i] += delta*intensity;
			}
		}
	}

	for (i=0;i<10;i++) {
		if (this.$spectralSensorResults[i] > 100) {
			this.$sensorValues[i] = 1;
		} else {
			this.$sensorValues[i] = this.$spectralSensorResults[i]/100;
		}
	}	


};