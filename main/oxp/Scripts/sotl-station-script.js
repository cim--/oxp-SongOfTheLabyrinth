this.name = "SOTL Station Shipscript";

this.$defenseShipCounter = Math.floor(system.info.sotl_system_stability * (4 + Math.random()*3));
this.$salvageShipCounter = (system.info.population/10);
this.$sotlFaction = "planetary";

this.shipSpawned = function() {

}