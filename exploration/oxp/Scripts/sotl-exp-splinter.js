"use strict";

this.name = "SOTL Splinter shipscript";

/* Set by creating asteroid */
this.$sotlMinerals = [];


this.shipWasScooped = function(scooper) {
	if (scooper.isPlayer) {
		for (var i=0;i<this.$sotlMinerals.length;i++) {
			var min = this.$sotlMinerals[i];
			worldScripts["SOTL Equipment Management"]._updateMineralsCarried(min,1);
		}
	}
}


this.shipWasDumped = function(scooper) {
	if (scooper.isPlayer) {
		for (var i=0;i<this.$sotlMinerals.length;i++) {
			var min = this.$sotlMinerals[i];
			worldScripts["SOTL Equipment Management"]._updateMineralsCarried(min,-1);
		}
	}
}
