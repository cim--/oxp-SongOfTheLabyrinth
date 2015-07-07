"use strict";

this.name = "SOTL Main Station AI";

this.aiStarted = function() {
	var ai = new worldScripts["oolite-libPriorityAI"].PriorityAIController(this.ship);

	ai.setParameter("oolite_flag_listenForDistressCall",true);
	ai.setCommunicationsRole("sotl_localMaximum");

	/* Temporary */
	ai.setPriorities([
		{
			behaviour: ai.behaviourStationManageTraffic,
			reconsider: 3600
		}
	]);
}