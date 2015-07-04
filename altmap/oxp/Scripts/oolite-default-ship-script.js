this.name			= "oolite-default-ship-script";
// Override of the default ship script for SOTL

this.$sotlFaction = "independent";

this.shipSpawned = function() {
	if (this.ship.scanClass == "CLASS_MISSILE") {
		this.ship.scannerDisplayColor1 = [0,1,1];
		this.ship.scannerHostileDisplayColor1 = [0,1.0,1.0];
		this.ship.scannerHostileDisplayColor2 = [1.0,0.0,0.0];
	} else {
		this._setScanFromFaction();
	}

}


this._setScanFromFaction = function() {
	/* TODO: vary colours by relationship with player's current
	 * faction, if any */
	switch (this.$sotlFaction) {
	case "debris":
		this.ship.scannerDisplayColor1 = [0.7,0.7,0.7];
		this.ship.scanDescription = "";
		break;
	case "independent":
		this.ship.scannerDisplayColor1 = [1,1,0];
		this.ship.scannerHostileDisplayColor1 = [0.8,0.0,0.0];
		this.ship.scanDescription = "Unknown";
		break;
	case "criminal":
		this.ship.scannerDisplayColor1 = [1,0.7,0];
		this.ship.scannerHostileDisplayColor1 = [0.8,0.0,0.0];
		this.ship.scanDescription = "Unknown";
		break;
	case "planetary":
		this.ship.scannerDisplayColor1 = [0.5,0,1];
		this.ship.scannerHostileDisplayColor1 = [0.8,0.0,0.0];
		this.ship.scanDescription = "System Government";
		break;
		

	}
}