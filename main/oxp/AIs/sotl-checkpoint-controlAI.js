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

		// if new torus use detected nearby and the object is further out
		// than this, and the object is heading inwards, and at least
		// two patrols are currently on standby orders, give one of
		// those patrols intercept orders

		// if more patrols than needed and all patrols are nearby,
		// degroup 0th patrol so it returns to base

		// if last patrol change more than 1 hour ago, request launch
		// of new patrols from station; give the new patrols recall orders
		{
			behaviour: ai.behaviourWaitHere,
			reconsider: 3600
		}
	]);


}