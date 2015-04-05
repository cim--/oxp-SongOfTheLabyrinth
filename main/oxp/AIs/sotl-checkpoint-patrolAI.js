"use strict";

this.name = "SOTL Checkpoint Patrol AI";

this.aiStarted = function() {
	var ai = new worldScripts["oolite-libPriorityAI"].PriorityAIController(this.ship);

	/* Takes orders from controller. Order types:
	 * Defend: return to very close to buoy
	 * Recall: return to patrol areas around buoy
	 * Intercept: intercept specified torus
	 * Check: check known position (convert intercept orders if torus disappears)
	 * Intercept/Check orders convert to Recall once completed
	 */


	ai.setPriorities([
		// if under attack, fight back or flee

		// if illegal activity nearby, demand surrender
		// attack if they try to flee

		// if no controller buoy set, return to station

		// check orders

		// defend - set destination to controller buoy, go there
		// recall - set destination to point ~24k from controller buoy, go there
		// intercept - set destination to torus object, go there
		// check - set destination to target position, go there
		
		{
			behaviour: ai.behaviourWaitHere,
			reconsider: 3600
		}
	]);


}