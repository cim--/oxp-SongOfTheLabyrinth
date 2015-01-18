"use strict";

// so far this is a copy of the Oolite one. Changes are likely to be
// necessary later.
this.name = "SOTW Orbital Shuttle AI";

this.aiStarted = function() {
	var ai = new worldScripts["oolite-libPriorityAI"].PriorityAIController(this.ship);

	ai.setParameter("oolite_flag_sendsDistressCalls",true);
	ai.setParameter("oolite_flag_allowPlanetaryLanding",true);

	ai.setPriorities([
		{
			condition: ai.conditionInCombat,
			behaviour: ai.behaviourFleeCombat,
			reconsider: 10
		},
		{
			condition: ai.conditionHostileStationNearby,
			configuration: ai.configurationSetDestinationToNearestStation,
			behaviour: ai.behaviourLeaveVicinityOfDestination,
			reconsider: 20
		},
		{
			condition: ai.conditionHasSelectedStation,
			truebranch: [
				{
					condition: ai.conditionSelectedStationNearby,
					configuration: ai.configurationSetSelectedStationForDocking,
					behaviour: ai.behaviourDockWithStation,
					reconsider: 30
				},
				{
					configuration: ai.configurationSetDestinationToSelectedStation,
					behaviour: ai.behaviourApproachDestination,
					reconsider: 30
				}
			]
		},
		{
			condition: ai.conditionHasSelectedPlanet,
			truebranch: [
				{
					preconfiguration: ai.configurationSetDestinationToSelectedPlanet,
					condition: ai.conditionNearDestination,
					behaviour: ai.behaviourLandOnPlanet
				},
				{
					behaviour: ai.behaviourApproachDestination,
					reconsider: 30
				}
			]
		},
		/* TODO: need to try to hitchhike out! */
		{
			condition: ai.conditionInInterstellarSpace,
			truebranch: ai.templateWitchspaceJumpAnywhere()
		},
		{
			configuration: ai.configurationSelectShuttleDestination,
			behaviour: ai.behaviourApproachDestination,
			reconsider: 1
		}
	]);
}