"use strict";

this.name = "SOTW Main Station AI";

this.aiStarted = function() {
	var ai = new worldScripts["oolite-libPriorityAI"].PriorityAIController(this.ship);

	ai.setParameter("oolite_flag_listenForDistressCall",true);
	ai.setParameter("sotw_desiredSecurityLevel",system.info.government*2);

	ai.setCommunicationsRole("sotw_mainStation");

	ai.setPriorities([
		/* Fight */
		{
			preconfiguration: ai.configurationStationValidateTarget,
			condition: ai.conditionInCombat,
			behaviour: ai.sotw_behaviourStationFight,
			reconsider: 30
		},
		/* Respond to distress calls */
		{
			condition: ai.conditionHasReceivedDistressCall,
			behaviour: ai.sotw_behaviourStationRespondToDistressCall,
			reconsider: 20
		},
		/* Scan */
		{
			preconfiguration: ai.configurationCheckScanner,
			condition: ai.sotw_conditionScannerContainsHostileFaction,
			configuration: ai.configurationAcquireScannedTarget,
			behaviour: ai.sotw_behaviourStationWarnOrAttackHostileFaction,
			reconsider: 60 // long delay to give them time to leave the area
		},
		/* Scan */
		{
			preconfiguration: ai.configurationCheckScanner,
			condition: ai.conditionScannerContainsSalvage,
			behaviour: ai.sotw_behaviourStationLaunchSalvager,
			reconsider: 60 // long delay to avoid launching too many at once
		},
		{
			preconfiguration: ai.configurationStationReduceAlertLevel,
			notcondition: ai.sotw_conditionStationHasEnoughDefense,
			behaviour: ai.sotw_behaviourStationLaunchDefense,
			reconsider: 60
		},
		{
			configuration: ai.configurationStationReduceAlertLevel,
			behaviour: ai.sotw_behaviourStationIdle,
			reconsider: 60
		}
	]);
}