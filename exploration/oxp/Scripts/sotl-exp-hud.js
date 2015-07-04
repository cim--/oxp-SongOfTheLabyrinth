"use strict";

this.name = "SOTL HUD Dials management";

this.startUp = function() {
	this.$fcb = addFrameCallback(this._updateHUD.bind(this));
	this.$dest = system.ID;
};

this.shipDied = function() {
	removeFrameCallback(this.$fcb);
};


this._updateHUD = function(delta) {
	var max = 7;
	player.ship.setCustomHUDDial("sotl_exp_hyp_fuelcarried",player.ship.fuel/max);
	
	if (worldScripts["SOTL Hyperspace"].$hyperspaceState == 1) {
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
};