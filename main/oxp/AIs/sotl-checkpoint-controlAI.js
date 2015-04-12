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
			preconfiguration: ai.sotl_configurationControllerValidateGroups,
			condition: ai.conditionInCombat,
			behaviour: ai.sotl_behaviourControllerSetDefend,
			reconsider: 10
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
			preconfiguration: ai.sotl_configurationScanForTorusForCheckpoint,
			condition: ai.sotl_conditionControllerReadyToSendTorusIntercept,
			behaviour: ai.sotl_behaviourControllerSendTorusIntercept,
			reconsider: 60
		},
		// if more patrols than needed and all patrols are nearby,
		// degroup 0th patrol so it returns to base		{
			condition: ai.sotl_conditionControllerHasSurplusPatrols,
			behaviour: ai.sotl_behaviourControllerReleaseOnePatrol,
			reconsider: 60
		},
		// if last patrol change more than 1 hour ago, or fewer
		// patrols than needed, request launch of new patrols from
		// station; give the new patrols recall orders
		{
			condition: ai.sotl_conditionControllerHasInsufficientPatrols,
			behaviour: ai.sotl_behaviourControllerRequestOnePatrol,
			reconsider: 60
		},
		{
			condition: ai.sotl_conditionControllerHasOldPatrols,
			behaviour: ai.sotl_behaviourControllerRequestOnePatrol,
			reconsider: 60
		},
		{
			behaviour: ai.behaviourWaitHere,
			reconsider: 3600
		}
	]);


}