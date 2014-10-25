/**
 * Species related functions
 */
"use strict";

(function() {
	var speciesInfo = {
		"Bird" : {
			preferredGravity: 0.58,
			preferredTemperature: 9,
			temperatureTolerance: 5,
			radiationTolerance: 0.03,
			preferredLand: 0.35,
			landTolerance: 0.06,
			seismicTolerance: 0.25,
			windTolerance: 0.1,
		},
		"Feline" : {
			preferredGravity: 0.86,
			preferredTemperature: 15,
			temperatureTolerance: 4,
			radiationTolerance: 0.05,
			preferredLand: 0.55,
			landTolerance: 0.1,
			seismicTolerance: 0.05,
			windTolerance: 0.17,
		},
		"Frog" : {
			preferredGravity: 0.83,
			preferredTemperature: 17,
			temperatureTolerance: 2,
			radiationTolerance: 0.02,
			preferredLand: 0.3,
			landTolerance: 0.08,
			seismicTolerance: 0.11,
			windTolerance: 0.19,
		},
		"Human" : {
			preferredGravity: 1.00,
			preferredTemperature: 13,
			temperatureTolerance: 4,
			radiationTolerance: 0.02,
			preferredLand: 0.30,
			landTolerance: 0.1,
			seismicTolerance: 0.06,
			windTolerance: 0.15,
		},
		"Insect" : {
			preferredGravity: 0.74,
			preferredTemperature: 17,
			temperatureTolerance: 5,
			radiationTolerance: 0.26,
			preferredLand: 0.38,
			landTolerance: 0.25,
			seismicTolerance: 0.25,
			windTolerance: 0.09,
		},
		"Lizard" : {
			preferredGravity: 0.95,
			preferredTemperature: 24,
			temperatureTolerance: 1,
			radiationTolerance: 0.07,
			preferredLand: 0.50,
			landTolerance: 0.2,
			seismicTolerance: 0.3,
			windTolerance: 0.21,
		},
		"Lobster" : {
			preferredGravity: 1.26,
			preferredTemperature: 12,
			temperatureTolerance: 3,
			radiationTolerance: 0.21,
			preferredLand: 0.1,
			landTolerance: 0.05,
			seismicTolerance: 0.33,
			windTolerance: 0.35,
		},
		"Rodent" : {
			preferredGravity: 0.79,
			preferredTemperature: 9,
			temperatureTolerance: 3,
			radiationTolerance: 0.11,
			preferredLand: 0.75,
			landTolerance: 0.3,
			seismicTolerance: 0.01,
			windTolerance: 0.56,
		}
	};

	var species = {};

	species.list = function() {
		return Object.keys(speciesInfo);
	}

	species.getHabitability = function(planet) {
		var habs = {};
		var ht = 0;
		var hb = 0;
		var hw = 100;
		for (var s in speciesInfo) {
			var spec = speciesInfo[s];
			var hab = 100;
			// gravity
			var diff = (Math.abs(spec.preferredGravity-planet.surfaceGravity) - spec.preferredGravity/4);
			if (diff > 0) {
				hab -= (diff * 95)
			}
			// temperature
			diff = Math.abs(spec.preferredTemperature-planet.temperature)-spec.temperatureTolerance;
			if (diff > 0) {
				hab -= diff*1.5;
			}
			// radiation
			diff = planet.surfaceRadiation-spec.radiationTolerance;
			if (diff > 0) {
				hab -= 175*diff;
			}
			// seismic
			diff = planet.seismicInstability-spec.seismicTolerance;
			if (diff > 0) {
				hab -= 125*diff;
			}
			// land/water split
			diff = Math.abs(spec.preferredLand - planet.percentLand)-spec.landTolerance;
			if (diff > 0) {
				hab -= 20*diff;
			}
			// wind factor
			diff = planet.windFactor - spec.windTolerance;
			if (diff > 0) {
				hab -= 125*diff;
			}

			if (hab > 50 && planet.cloudAlpha == 0) {
				hab -= 50;
			} else if (hab < 0) {
				hab = 0;
			} 

			
			habs[s] = hab;
			ht += hab;
			if (hb < hab) { hb = hab; }
			if (hw > hab) { hw = hab; }
		}
		habs.average = (ht/8);
		habs.best = hb;
		habs.worst = hw;
		return habs;
	}





	module.exports = species;

}());