"use strict";

this.name = "SOTL Hyperspace";

/********************************* State **************************/

this.$hyperspaceFuel = 0;
this.$hyperspaceMaxFuel = 7; // TODO: variable fuel capacity


this.$hyperspaceState = 0;
this.$hyperspaceFCB = null;
this.$hyperspaceEffect = null;
this.$hyperspaceRoute = null;
this.$hyperspaceDestination = -1;
this.$hyperspaceDistance = 0;
this.$hyperspaceProgress = 0;
this.$hyperspaceExitPrecision = 0;
this.$hyperspaceRouteQualities = {};
this.$hyperspaceKnownRoute = 0;

/********************************* Event handlers **************************/

this.startUp = function() {
	this.$hyperspaceRouteQualities = missionVariables.sotl_exp_routequalities ? JSON.parse(missionVariables.sotl_exp_routequalities) : {};
	var fuel = missionVariables.sotl_exp_fuelcarried ? missionVariables.sotl_exp_fuelcarried : this.$hyperspaceMaxFuel;
	this._setFuel(fuel);
	
	for (var route in this.$hyperspaceRouteQualities) {
		var systems = route.split(":");
		this._updateRouteDrawing(systems[0],systems[1]);
	}
};

this.playerWillSaveGame = function() {
	missionVariables.sotl_exp_routequalities = JSON.stringify(this.$hyperspaceRouteQualities);
	missionVariables.sotl_exp_fuelcarried = this.$hyperspaceFuel;
};


this.playerStartedJumpCountdown = function(type, seconds) {
	if (type == "standard") {
		player.ship.cancelHyperspaceCountdown();
		if (this.$hyperspaceState == 0) {
			if (player.ship.alertCondition == 1) {
				this._beginHyperspaceSequence();
			} else {
				player.consoleMessage("Local mass density too high to initiate hyperspace");
			}
		} else {
			this._abortHyperspaceSequence();
		}
	} else {
		// unlikely, not possible after later amendments
		if (this.$hyperspaceState != 0) {
			this._abortHyperspaceSequence();
		}
	}
};

this.shipWillExitWitchspace = function() {
	if (this.$hyperspaceExitPrecision > 0 && system.sun) {
		if (this.$hyperspaceExitPrecision > 10) {
			// bad exit
			player.ship.position = system.sun.position.add(Vector3D.randomDirection(system.sun.radius*this.$hyperspaceExitPrecision));
		} else {
			// good exit
			player.ship.position = system.sun.position.add([0,0,-system.sun.radius*this.$hyperspaceExitPrecision]);
			player.ship.orientation = [1,0,0,0];
		}
	}
	this.$hyperspaceEffect = system.addVisualEffect("sotl-exp-hyperspace2",player.ship.position);
	system.breakPattern = false;
	this.$hyperspaceFCB = addFrameCallback(this._hyperspaceSequence2.bind(this));

};


this.shipExitedWitchspace = function() {
	this._resetHyperspaceSequence();
	removeFrameCallback(this.$hyperspaceFCB);
	this.$hyperspaceEffect.remove();
};


this.playerBoughtEquipment = function(eq) {
	if (eq == "EQ_FUEL") {
		this._setFuel(this.$hyperspaceMaxFuel);
	}
}



/********************************* Internals **************************/

this._hyperspaceSequence2 = function(delta) {
	this.$hyperspaceEffect.position = player.ship.position;
	this.$hyperspaceEffect.orientation = player.ship.orientation;
};


this._resetHyperspaceSequence = function() {
	// reset some more variables
	player.ship.removeEquipment("EQ_SOTL_EXP_HYPERSPACEJUMP");
	this.$hyperspaceState = 0;
	this.$hyperspaceDestination = -1;
	this.$hyperspaceDistance = 0;
	this.$hyperspaceProgress = 0;
	this.$hyperspaceKnownRoute = 0;
	this.$hyperspaceExitPrecision = 0;
	if (this.$hyperspaceEffect.isValid) {
		this.$hyperspaceEffect.remove();
	}
};


this._beginHyperspaceSequence = function() {
	this.$hyperspaceState = 1;
	this.$hyperspaceFCB = addFrameCallback(this._hyperspaceSequence.bind(this));
	player.ship.awardEquipment("EQ_SOTL_EXP_HYPERSPACEJUMP");
	this.$hyperspaceDestination = this._getDestination();
	this.$hyperspaceRoute = this._makeHyperspaceRoute(system.ID,this.$hyperspaceDestination);
	this.$hyperspaceDistance = system.info.distanceToSystem(System.infoForSystem(galaxyNumber,this.$hyperspaceDestination));
	if (system.ID != -1) {
		this.$hyperspaceKnownRoute = this.$hyperspaceRouteQualities[system.ID+":"+this.$hyperspaceDestination] ? this.$hyperspaceRouteQualities[system.ID+":"+this.$hyperspaceDestination] : 0;
	} else {
		this.$hyperspaceKnownRoute = 0;
	}
	this.$hyperspaceProgress = -5;

};


this._abortHyperspaceSequence = function() {
	if (this.$hyperspaceState == 2) {
		while(!player.ship.takeInternalDamage()) {}
		this._endHyperspaceSequence();
	} else {
		// end while charging
		removeFrameCallback(this.$hyperspaceFCB);
		this.$hyperspaceFCB = null;
		this.$hyperspaceRoute = null;
		this._resetHyperspaceSequence();
	}
};

this._endHyperspaceSequence = function() {
	removeFrameCallback(this.$hyperspaceFCB);
	this.$hyperspaceFCB = null;
	this.$hyperspaceRoute = null;

	// create wormhole to destination
	if (this.$hyperspaceProgress < 10) {
		this._resetHyperspaceSequence();
		// not left system
		var closeness = system.sun.radius*(10+(Math.pow(2,this.$hyperspaceProgress)));
		player.ship.position = system.sun.position.add(Vector3D.randomDirection(closeness));
	} else {
		var jumper = system.addShips("alloy",1,[2E10,0,0],0)[0];
		this.$hyperspaceExitPrecision = 10;
		if (this.$hyperspaceProgress < 10+(10*this.$hyperspaceDistance)) {
			// not far enough - misjump
			jumper.scriptedMisjump = true;
			jumper.scriptedMisjumpRange = (this.$hyperspaceProgress-10)/(10*this.$hyperspaceDistance);
		} else if (this.$hyperspaceProgress < 20+(10*this.$hyperspaceDistance)) {
			// bad exit
			var remaining = 20+(10*this.$hyperspaceDistance)-this.$hyperspaceProgress;
			this.$hyperspaceExitPrecision += Math.pow(2,remaining);

		} else {
			// good exit
			if (system.ID > -1) {
				if (!this.$hyperspaceKnownRoute) {
					// start storing data
					this.$hyperspaceRouteQualities[system.ID+":"+this.$hyperspaceDestination] = 1;
				} else if (this.$hyperspaceRouteQualities[system.ID+":"+this.$hyperspaceDestination] < 20) {
					// improve route data
					/* TODO: faster/slower scanners? */
					this.$hyperspaceRouteQualities[system.ID+":"+this.$hyperspaceDestination] += 1;
				}
				this._updateRouteDrawing(system.ID,this.$hyperspaceDestination);
			}

		}
		jumper.fuel = 7;
		jumper.exitSystem(this.$hyperspaceDestination);
		jumper.remove();
		this.$hyperspaceEffect.position = player.ship.position = [2E10,0,0];
	}
};


this._updateRouteDrawing = function(a,b) {
	if (this.$hyperspaceRouteQualities[a+":"+b]) {
		SystemInfo.setInterstellarProperty(galaxyNumber,a,b,2,"link_color",this._linkColour(this.$hyperspaceRouteQualities[a+":"+b]));
	} else {
		SystemInfo.setInterstellarProperty(galaxyNumber,a,b,2,"link_color",this._linkColour(0));
	}
	if (this.$hyperspaceRouteQualities[b+":"+a]) {
		SystemInfo.setInterstellarProperty(galaxyNumber,b,a,2,"link_color",this._linkColour(this.$hyperspaceRouteQualities[b+":"+a]));

	} else {
		SystemInfo.setInterstellarProperty(galaxyNumber,b,a,2,"link_color",this._linkColour(0));
	}
};


this._linkColour = function(depth) {
	if (depth == 0) {
		return "0.2 0.2 0.2 0.5"; // matches chart_connection_color in gui-settings
	} else if (depth >= 20) {
		return "0.1 1.0 0.1 0.5";
	} else if (depth > 10) {
		return ((20-depth)/20).toFixed(1)+" "+(depth/20).toFixed(1)+" 0.1 0.5";
	} else if (depth == 10) {
		return "0.5 0.5 0.1 0.5";
	} else {
		return "0.5 "+(depth/20).toFixed(1)+" 0.1 0.5";
	}
};


this._getDestination = function() {
	if (player.ship.routeMode == "OPTIMIZED_BY_NONE") {
		return player.ship.targetSystem;
	}
	var route = system.info.routeToSystem(System.infoForSystem(galaxyNumber,player.ship.targetSystem),player.ship.routeMode);
	if (route) {
		return route.route[1];
	} else {
		return -1; // shouldn't be possible to get this
	}
};


this._makeHyperspaceRoute = function(s1,s2) {
	if (s1 == -1) {
		s1 = Math.floor(Math.random()*4096);
	}
	/* TODO: may want to separate ranrot implementation out, if it's
	 * needed elsewhere */
	var seed = (s2*4096)+s1;
	var _ranrot = { high: 0, low: 0 }
	var uint32 = worldScripts["SOTL Uint32 support"]._uint32;

	_ranrot.high = seed;
	_ranrot.low = uint32.xor(seed,0xFFFFFFFF);

	var rnd = function () {
		_ranrot.high = uint32.addMod32(
			uint32.shiftLeft(_ranrot.high,16),
			uint32.shiftRight(_ranrot.high,16)
		);
		_ranrot.high = uint32.addMod32(_ranrot.high,_ranrot.low);
		_ranrot.low = uint32.addMod32(_ranrot.high,_ranrot.low);
		return uint32.and(_ranrot.high,0x7FFFFFFF);
	};
	rnd();rnd();rnd(); // shuffle
	var randf = function() {
		return rnd()/0x7FFFFFFF;
	}
	
	var route = [];
	var cx = 0; var cy = 0;
	for (var i=0;i<=90;i++) {
		route.push([cx,cy]);
		var chg = randf();
		if (i < 5) {
			// startup is slow
			chg = 0;
		}
		if (chg < 0.55) {
			// small change
			cx += (randf()*0.4)-0.2;
			cy += (randf()*0.4)-0.2;
		} else if (chg < 0.85) {
			// medium change
			cx += (randf()*0.7)-0.35;
			cy += (randf()*0.7)-0.35;
		} else {
			// large change
			cx = (randf()*2)-1;
			cy = (randf()*2)-1;
		}
		if (cx > 1 || cx < -1) {
			cx /= 2;
		}
		if (cy > 1 || cy < -1) {
			cy /= 2;
		}
	};
	route.push([cx,cy]);

	return route;
};

this._setFuel = function(amount) {
	this.$hyperspaceFuel = amount;
	var range = amount*amount;
	if (range > 7) {
		player.ship.fuel = 7;
	} else {
		player.ship.fuel = range;
	}
}


this._hyperspaceSequence = function(delta) {
	this.$hyperspaceProgress += delta;
	if (this.$hyperspaceProgress < 0) {
		player.ship.setCustomHUDDial("sotl_exp_hyp_progresstext","Charging Drive");
		player.ship.setCustomHUDDial("sotl_exp_hyp_progress",(5+this.$hyperspaceProgress)/5);
		player.ship.setCustomHUDDial("sotl_exp_hyp_roll_required",0);
		player.ship.setCustomHUDDial("sotl_exp_hyp_pitch_required",0);
		player.ship.setCustomHUDDial("sotl_exp_hyp_status",[0,0,0,0]);
		return;
	}
	if (this.$hyperspaceState == 1) {
		player.ship.position = [1E10,0,0];
		this.$hyperspaceEffect = system.addVisualEffect("sotl-exp-hyperspace",[1E10,0,0]);
		this.$hyperspaceEffect.shaderFloat1 = 20+(this.$hyperspaceDistance*10);
		this._setFuel(this.$hyperspaceFuel-Math.sqrt(this.$hyperspaceDistance));
		this.$hyperspaceState = 2;
	}

	if (this.$hyperspaceProgress >= (this.$hyperspaceDistance*10)+20) {
		player.ship.setCustomHUDDial("sotl_exp_hyp_progresstext","Complete");
		this._endHyperspaceSequence();
		return;
	}

	var s1 = Math.floor(this.$hyperspaceProgress);
	var s2 = s1+1;
	var s3 = s1+2;
	var frac = this.$hyperspaceProgress-s1;

	// get desired roll/pitch positions
	var dx = (this.$hyperspaceRoute[s1][0]*(1-frac))+(this.$hyperspaceRoute[s2][0]*(frac));	
	var dy = (this.$hyperspaceRoute[s1][1]*(1-frac))+(this.$hyperspaceRoute[s2][1]*(frac));
	// get actual roll/pitch positions
	// axes are inverted
	var ax = -player.ship.roll/player.ship.maxRoll;
	var ay = -player.ship.pitch/player.ship.maxPitch;

//	log(this.name, "X: d="+dx+",a="+ax+" ; Y: d="+dy+",a="+ay);

	var energydrain = 3; // basic level
	if (this.$hyperspaceKnownRoute) {
		energydrain -= Math.pow(this.$hyperspaceKnownRoute,0.75)/5;
	}

	var precisionfactor = 5;
	energydrain += Math.abs(ax-dx)*precisionfactor;
	energydrain += Math.abs(ay-dy)*precisionfactor;
	// going the wrong way gives serious energy drain
	if (ax * dx <= 0 && (Math.abs(dx) > 0.1 || Math.abs(ax) > 0.1)) {
		energydrain *= 1.25;
	}
	if (ay * dy <= 0 && (Math.abs(dy) > 0.1 || Math.abs(ay) > 0.1)) {
		energydrain *= 1.25;
	}

	if (player.ship.energy < energydrain*delta) {
		player.ship.explode();
		// otherwise energy regen will apply before explosion check
	} else {
		player.ship.energy -= energydrain*delta;
	}

	var remainingtime = ((this.$hyperspaceDistance*10)+20)-this.$hyperspaceProgress;
	var colspec;
	if (energydrain < player.ship.energyRechargeRate) {
		var margin = Math.min(0.0,energydrain+1-player.ship.energyRechargeRate)
		colspec = [margin,1.0,0.0,1.0]; // working well
	} else {
		var survivaltime = player.ship.energy/(energydrain-player.ship.energyRechargeRate);
		if (survivaltime < remainingtime) {
			colspec = [1.0,0.0,0.0,1.0];
		} else if (survivaltime > remainingtime*2) {
			colspec = [1.0,1.0,0.0,1.0];;
		} else {
			colspec = [1.0,(survivaltime/remainingtime)-1.0,0.0,1.0];
		}
		if (survivaltime < 5) {
			// flash light if emergency exit needed
			colspec[3] = Math.abs(Math.sin(this.$hyperspaceProgress*10));
		}
	}

	var progress = 0;
	var progresstext = "";
	if (this.$hyperspaceProgress < 10) {
		progress = this.$hyperspaceProgress/40;
		progresstext = "Leaving system";
	} else if (remainingtime < 10) {
		progress = 0.75+((10-remainingtime)/40);
		progresstext = "Entering system";
	} else {
		progress = 0.25+(((this.$hyperspaceProgress-10)/(this.$hyperspaceDistance*10))*0.5);
		progresstext = "Travelling";
	}

	this.$hyperspaceEffect.position = player.ship.position;
	this.$hyperspaceEffect.orientation = player.ship.orientation;

	// set HUD indicators
	player.ship.setCustomHUDDial("sotl_exp_hyp_roll_required",dx);
	player.ship.setCustomHUDDial("sotl_exp_hyp_pitch_required",dy);
	player.ship.setCustomHUDDial("sotl_exp_hyp_status",colspec);
	player.ship.setCustomHUDDial("sotl_exp_hyp_progress",progress);
	player.ship.setCustomHUDDial("sotl_exp_hyp_progresstext",progresstext);

};