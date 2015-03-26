"use strict";

this.name = "SOTL Main Station AI";

this.aiStarted = function() {
	var ai = new worldScripts["oolite-libPriorityAI"].PriorityAIController(this.ship);

	ai.setParameter("oolite_flag_listenForDistressCall",true);
	ai.setParameter("sotl_desiredSecurityLevel",system.info.sotl_system_stability*2);
	ai.setParameter("sotl_defenseShipStrength",system.info.sotl_system_stability);

	ai.setCommunicationsRole("sotl_mainStation");

	ai.setPriorities([
		/* Fight */
		{
			preconfiguration: ai.configurationStationValidateTarget,
			condition: ai.conditionInCombat,
			behaviour: ai.sotl_behaviourStationFight,
			reconsider: 30
		},
		/* Respond to distress calls */
		{
			condition: ai.conditionHasReceivedDistressCall,
			behaviour: ai.sotl_behaviourStationRespondToDistressCall,
			reconsider: 20
		},
		/* Scan */
		{
			preconfiguration: ai.configurationCheckScanner,
			condition: ai.sotl_conditionScannerContainsHostileFaction,
			configuration: ai.configurationAcquireScannedTarget,
			behaviour: ai.sotl_behaviourStationWarnOrAttackHostileFaction,
			reconsider: 60 // long delay to give them time to leave the area
		},
		/* Scan */
		{
			condition: ai.conditionScannerContainsSalvage,
			behaviour: ai.sotl_behaviourStationLaunchSalvager,
			reconsider: 60 // long delay to avoid launching too many at once
		},
		{
			preconfiguration: ai.configurationStationReduceAlertLevel,
			notcondition: ai.sotl_conditionStationHasEnoughDefense,
			behaviour: ai.sotl_behaviourStationLaunchDefense,
			reconsider: 60
		},
		{
			configuration: ai.configurationStationReduceAlertLevel,
			behaviour: ai.sotl_behaviourStationIdle,
			reconsider: 60
		}
	]);
}