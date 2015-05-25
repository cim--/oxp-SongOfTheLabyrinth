"use strict";

this.name = "Station Defender AI";

this.aiStarted = function() {
	var ai = new worldScripts["oolite-libPriorityAI"].PriorityAIController(this.ship);

	ai.setParameter("oolite_flag_listenForDistressCall",true);
	
	if (this.ship.script.$sotlPopulationPatrolAdjust) {
		ai.setParameter("oolite_patrolLength",3E6-this.ship.script.$sotlPopulationPatrolAdjust);
	} else {
		ai.setParameter("oolite_patrolLength",3E6);
	}
	// should be about three hours
	// initial system populator should modify and stagger patrol lengths
	// of initial patrol
	ai.setWaypointGenerator(ai.sotl_waypointsStationPatrol);

	ai.setCommunicationsRole("sotl_stationDefense");

	ai.setPriorities([
		/* Fight */
		{
			condition: ai.sotl_conditionHasSurrendered,
			behaviour: ai.sotl_behaviourSurrender,
			reconsider: 120
		},
		{
			condition: ai.conditionLosingCombat,
			behaviour: ai.sotl_behaviourSurviveCombat,
			reconsider: 5
		},
		{
			condition: ai.conditionInCombat,
			configuration: ai.configurationAcquireCombatTarget,
			behaviour: ai.behaviourRepelCurrentTarget,
			reconsider: 5
		},
		{
			condition: ai.conditionMothershipIsAttackingHostileTarget,
			configuration: ai.configurationAcquireCombatTarget,
			behaviour: ai.behaviourRepelCurrentTarget,
			reconsider: 5
		},
		/* No fight, patrol over */
		{
			condition: ai.conditionPatrolIsOver,
			truebranch: ai.templateReturnToBase()
		},
		/* Check if station has been destroyed */
		{		
			condition: ai.conditionGroupLeaderIsStation,
			falsebranch: ai.templateReturnToBase(),
			truebranch: [
				/* Station exists */
				{
					preconfiguration: ai.configurationSetWaypoint,
					condition: ai.conditionHasWaypoint, // should always be true
					configuration: ai.configurationSetDestinationToWaypoint,
					behaviour: ai.behaviourApproachDestination,
					reconsider: 10
				}
			]
		}
		// no station and can't return to another one - try to leave
		// the system
	].concat(ai.templateWitchspaceJumpAnywhere()));

}