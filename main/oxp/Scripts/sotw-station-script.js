this.name = "SOTW Station Shipscript";

this.$defenseShipCounter = Math.floor(system.info.sotw_system_stability * (4 + Math.random()*3));
this.$salvageShipCounter = (system.info.population/10);
this.$sotwFaction = "planetary";

this.shipSpawned = function() {

}