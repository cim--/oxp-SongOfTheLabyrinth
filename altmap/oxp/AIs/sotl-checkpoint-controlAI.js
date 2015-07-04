"use strict";

this.name = "SOTL Checkpoint Controller AI";

this.aiStarted = function() {
	var ai = new worldScripts["oolite-libPriorityAI"].PriorityAIController(this.ship);

	/* Gives orders to patrols. Order types:
	 * Defend: return to very close to buoy
	 * Recall: return to patrol areas around buoy
	 * Intercept: intercept specified torus
	 * Check: check known position (convert intercept orders if torus disappears)
	 * Intercept/Check orders convert to Recall once completed
	 */


	ai.setPriorities([
		// if under attack, set defend orders on all groups
		{
			label: "Check combat state",
			preconfiguration: ai.sotl_configurationControllerValidateGroups,
			condition: ai.conditionInCombat,
			behaviour: ai.sotl_behaviourControllerSetDefend,
			reconsider: 5
		},

/*		{ // TODO: once long-range distress calls implemented
			preconfiguration: ai.sotl_configurationScanForDistressCall,
			condition: ai.sotl_conditionControllerReadyToSendDistressCheck,
			behaviour: ai.sotl_behaviourControllerSendDistressCheck,
			reconsider: 60
		}, */

		// if new torus use detected nearby and the object is further out
		// than this, and the object is heading inwards, and at least
		// two patrols are currently on standby orders, give one of
		// those patrols intercept orders
		{
			label: "Check for torus flares",
			preconfiguration: ai.sotl_configurationControllerScanForTorusForCheckpoint,
			condition: ai.sotl_conditionControllerReadyToSendTorusIntercept,
			behaviour: ai.sotl_behaviourControllerSendTorusIntercept,
			reconsider: 5
		},
		// if more patrols than needed and all patrols are nearby,
		// degroup 0th patrol so it returns to base
		{
			label: "Check for surplus release",
			condition: ai.sotl_conditionControllerHasSurplusPatrols,
			behaviour: ai.sotl_behaviourControllerReleaseOnePatrol,
			reconsider: 5
		},
		// if last patrol change more than 1 hour ago, or fewer
		// patrols than needed, request launch of new patrols from
		// station; give the new patrols recall orders
		{
			label: "Check for patrol shortage",
			condition: ai.sotl_conditionControllerHasInsufficientPatrols,
			behaviour: ai.sotl_behaviourControllerRequestOnePatrol,
			reconsider: 5
		},
		{
			label: "Check for patrol end",
			condition: ai.sotl_conditionControllerHasOldPatrols,
			behaviour: ai.sotl_behaviourControllerRequestOnePatrol,
			reconsider: 5
		},
		{
			label: "Wait and try again",
			behaviour: ai.behaviourWaitHere,
			reconsider: 5
		}
	],2+Math.random());
	// longer startup delay on controllers, to let ships get into torus 
	// on initial population


}