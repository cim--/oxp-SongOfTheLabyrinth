"use strict";

this.name = "SOTL Pirate AI";

this.aiStarted = function() {
	var ai = new worldScripts["oolite-libPriorityAI"].PriorityAIController(this.ship);


	ai.setPriorities([
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
			truebranch: [
				/* Disable the freighter, chase off anything else */
				{
					condition: ai.sotl_conditionCombatTargetIsFreighter,
					behaviour: ai.sotl_behaviourDisableCurrentTarget,
					reconsider: 5
				},
				{
					behaviour: ai.behaviourRepelCurrentTarget,
					reconsider: 5
				}
			]
		},
		{
			preconfiguration: ai.configurationCheckScanner,
			condition: this.sotl_conditionBoardingOperationInProgress,
			/* Only check for salvage if not already boarding! */
			falsebranch: [
				{
					label: "Check for cargo",
					condition: ai.conditionScannerContainsSalvageForMe,
					configuration: ai.configurationAcquireScannedTarget,
					behaviour: ai.behaviourCollectSalvage,
					reconsider: 20
				}
			]
		},
		// collect loose salvage before boarding ships
		{
			// TODO: not working for surrendered player?
			label: "Check for disabled freighter",
			condition: ai.sotl_conditionScannerContainsDisabledFreighter,
			configuration: ai.configurationAcquireScannedTarget,
			truebranch: ai.sotl_templateBoardDisabledShip()
		},
		{
			condition: ai.sotl_conditionHasInterceptionTarget,
			configuration: ai.sotl_configurationSetDestinationToInterceptionTarget,
			truebranch: ai.sotl_templateTravelToIntercept()
		},
		{
			label: "Check for poorly escorted freighter",
			condition: ai.sotl_conditionScannerContainsPoorlyEscortedFreighter,
			configuration: ai.configurationAcquireScannedTarget,
			/* TODO: announce attack */
			behaviour: ai.sotl_behaviourDisableCurrentTarget,
			reconsider: 5
		},
		{
			condition: ai.sotl_conditionContinuePiracyActivity,
			truebranch: [
				{
					preconfiguration: ai.sotl_configurationPirateScanForTorus,
					condition: ai.sotl_conditionHasInterceptionTarget,
					configuration: ai.sotl_configurationSetDestinationToInterceptionTarget,
					truebranch: ai.sotl_templateTravelToIntercept()
				},
				{	
					// within 500k of lane, outside 750k of patrol bases
					condition: ai.sotl_conditionIsInGoodPiracyLurkPosition, 
					behaviour: ai.behaviourWaitHere,
					reconsider: 20
				},
				{
					configuration: ai.sotl_configurationSetDestinationToGoodPiracyLurkPosition, //
					// sneak to destination won't use torus unless a long way
					// from expected activity areas
					truebranch: ai.sotl_templateSneakToDestination()
				}
			],
			falsebranch: ai.sotl_templateReturnToBase()
		}



	]);




}