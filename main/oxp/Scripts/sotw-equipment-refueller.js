this.name = "SOTW Inflight Refueller";

this.$inProgress = 0;
this.$fcb = 0;
this.$accumulator = 0;
this.$savedInjectorBurn = 0;
this.$savedInjectorSpeed = 0;

this.activated = function() {
	if (this.$inProgress > 0) {
		player.consoleMessage("Refuelling already in progress");
		return;
	}
	if (player.ship.manifest["sotw-fuel"] == 0) {
		player.consoleMessage("No fuel available in hold");
		return;
	}
	if (player.ship.fuel == 7) {
		player.consoleMessage("Main fuel tank already full");
		return;
	}
	this.$inProgress = 1;
	this.$fcb = addFrameCallback(this._refuellingOperation.bind(this));
	player.consoleMessage("Commencing in-flight refuelling");
	player.ship.manifest["sotw-fuel"]--;
	this.$savedInjectorBurn = player.ship.injectorBurnRate;
	this.$savedInjectorSpeed = player.ship.injectorSpeedFactor;
	player.ship.injectorBurnRate = 0;
	player.ship.injectorSpeedFactor = 1;
};


this._refuellingOperation = function(delta) {
	this.$accumulator += delta;
	while (this.$accumulator > 2) {
		this.$accumulator -= 2;
		player.ship.fuel += 0.1;
		this.$inProgress += 1;
	}
	if (this.$inProgress >= 71 || player.ship.fuel == 7) {
		// transfer complete
		player.consoleMessage("In-flight refuelling complete");
		this._endRefuellingOperation();
	} else if (player.ship.docked) {
		// if player docks while this is going on,
		// complete the refuelling and stop
		player.ship.fuel += (71-this.$inProgress)/10;
		this._endRefuellingOperation();
	} else if (player.ship.status == "STATUS_WITCHSPACE_COUNTDOWN") {
		// stop now!
		player.consoleMessage("In-flight refuelling cancelled: witchdrive engaged!");
		this._endRefuellingOperation();
	}
};


this._endRefuellingOperation = function() {
	removeFrameCallback(this.$fcb);
	this.$inProgress = 0;
	this.$accumulator = 0;
	player.ship.injectorBurnRate = this.$savedInjectorBurn;
	player.ship.injectorSpeedFactor = this.$savedInjectorSpeed;
};


this.mode = function() {
	if (this.$inProgress == 0) {
		player.consoleMessage("Refuelling not in progress");
		return;
	}
	// in case you really need your injectors back in a hurry
	player.consoleMessage("In-flight refuelling cancelled");
	this._endRefuellingOperation();
};

