"use strict";

this.name = "SOTL HUD Dials management";

this.startUp = function() {
	player.ship.maxSpeed = 3500; // testing
	player.ship.maxThrust *= 20;
	player.ship.thrust *= 20;

	this.$fcb = addFrameCallback(this._updateHUD.bind(this));
	this.$dest = system.ID;
};

this.shipDied = function() {
	removeFrameCallback(this.$fcb);
};

this.compassTargetChanged = function() {
	if (player.ship.status == "STATUS_IN_FLIGHT") {
		this._updateMFD();
	} else {
		this._clearMFD();
	}
};

this.shipWillEnterWitchspace = function() {
	this._clearMFD();
}

this.shipLaunchedFromStation = this.shipExitedWitchspace = function() {
	this._updateMFD();
}

this.shipWillDockWithStation = function() {
	this._clearMFD();
}

this._clearMFD = function() {
	player.ship.setMultiFunctionText("sotl_exp_surveyresults",null);
}

this._updateMFD = function() {
	if (worldScripts["SOTL Hyperspace"].$hyperspaceState == 2) {
		return this._clearMFD();	
	}
	var target = worldScripts["SOTL discovery checks"]._compassTarget();
	var description = "No target";
	if (target != null) {
		if (target == system.sun) {
			description = worldScripts["SOTL discovery checks"]._describeStar();
		} else if (target == system.mainStation) {
			description = "Modified colonisation ship";
		} else {
			description = worldScripts["SOTL discovery checks"]._describePlanet(target.sotl_planetIndex);
		}
	}

	player.ship.setMultiFunctionText("sotl_exp_surveyresults",description);
	player.ship.setMultiFunctionDisplay(0,"sotl_exp_surveyresults");
};


this._updateHUD = function(delta) {
	/* Update hyperspeed bar */
	if (player.ship.torusEngaged) {
		var speed = (player.ship.speed/player.ship.maxSpeed)/1024;
		player.ship.setCustomHUDDial("sotl_exp_torusspeed",speed);

	} else {
		player.ship.setCustomHUDDial("sotl_exp_torusspeed",0);
	}

	/* Update fuel bars */
	var max = worldScripts["SOTL Hyperspace"].$hyperspaceMaxFuel;
	player.ship.setCustomHUDDial("sotl_exp_hyp_fuelcarried",worldScripts["SOTL Hyperspace"].$hyperspaceFuel/max);
	
	if (worldScripts["SOTL Hyperspace"].$hyperspaceState == 2) {
		// fuel has been used but shouldn't be shown as required
		player.ship.setCustomHUDDial("sotl_exp_hyp_fuelrequired",0);
		this.$dest = -2; // force reset on exit of hyperspace
	} else {
		var dest = worldScripts["SOTL Hyperspace"]._getDestination();
		if (dest !== undefined) {
			if (dest != this.$dest) {
				this.$dest = dest;
				if (dest == -1 || dest == system.ID) {
					player.ship.setCustomHUDDial("sotl_exp_hyp_fuelrequired",0);
				} else {
					var dist = system.info.distanceToSystem(System.infoForSystem(galaxyNumber,dest));
					if (dist > 7) {
						player.ship.setCustomHUDDial("sotl_exp_hyp_fuelrequired",0);
					} else {
						var usage = Math.sqrt(dist);
						player.ship.setCustomHUDDial("sotl_exp_hyp_fuelrequired",usage/max);
					}
				}
			}
		}
	}

	/* Update sensor bars */
	var values = worldScripts["SOTL Equipment Management"].$sensorValues;
	var labels = worldScripts["SOTL Equipment Management"].$sensorLabels;
	for (var i=0;i<=9;i++) {
		player.ship.setCustomHUDDial("sotl_exp_sensor"+i,values[i]);
		player.ship.setCustomHUDDial("sotl_exp_sensorlabel"+i,labels[i]);
	}
};