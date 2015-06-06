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
	var interceptOrders = [
		// check if torus object still valid
		// convert order to check order if not, unless ships now in
		// range then use recall

		// set destination to last position and go there (reconsider: 5)

		// set destination to torus object plus torus velocity * 5 (rec: 5)
		{
			condition: ai.sotl_conditionCheckOrdersAreComplete,
			behaviour: ai.sotl_behaviourSetRecallOrdersForSelf,
			reconsider: 1
		},
		// set destination to position and go there (reconsider: 5)
		{
			configuration: ai.sotl_configurationSetDestinationToInterceptPosition,
			truebranch: ai.sotl_templateTravelToIntercept()
		}
	];
	var checkOrders = [
		// if reached destination, set recall orders and reconsider
		{
			condition: ai.sotl_conditionCheckOrdersAreComplete,
			behaviour: ai.sotl_behaviourSetRecallOrdersForSelf,
			reconsider: 1
		},
		// set destination to position and go there (reconsider: 5)
		{
			configuration: ai.sotl_configurationSetDestinationToCheckPosition,
			truebranch: ai.sotl_templateTravelToIntercept()
		}
	];
	var recallOrders = [
		// set destination to controller (~40km) and go there
		{
			configuration: ai.sotl_configurationSetDestinationToController,
			truebranch: ai.sotl_templateTravelToDestination()
		}
	];
	var defendOrders = [
		// set destination to controller (5km) and go there
		{
			configuration: ai.sotl_configurationSetDestinationToControllerClose,
			truebranch: ai.sotl_templateTravelToDestination()
		}
	];



	ai.setPriorities([
		// if under attack, fight back or flee
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
			behaviour: ai.sotl_behaviourDisableCurrentTarget,
			reconsider: 5
		},
		// if illegal activity nearby, demand surrender
		// attack if they try to flee
		{
			preconfiguration: ai.configurationCheckScanner,
			condition: ai.sotl_conditionScannerContainsRefusedSurrender,
			configuration: ai.configurationAcquireScannedTarget,
			behaviour: ai.sotl_behaviourDisableCurrentTarget,
			reconsider: 5
		},
		{
			condition: ai.sotl_conditionScannerContainsIllegalActivity,
			configuration: ai.configurationAcquireScannedTarget,
			behaviour: ai.sotl_behaviourDemandTargetSurrender,
			reconsider: 15
		},
		/* 
		 * check if group has leader, appoint self if not
		 * check if is leader
		 * if not leader, just escort the current leader
		 */
		{
			preconfiguration: ai.configurationAppointGroupLeader,
			condition: ai.conditionIsGroupLeader,
			truebranch: [
				{
					configuration: ai.sotl_configurationMarkGroupMembersAsEscorts
				}
			],
			falsebranch: ai.sotl_templateEscortMothership()
		},
		// if no controller buoy set, return to station
		{
			notcondition: ai.sotl_conditionHasController,
			truebranch: ai.sotl_templateReturnToBase()
		},
		// check orders
		// defend - set destination to controller buoy, go there
		// recall - set destination to point ~24k from controller buoy, go there
		// intercept - set destination to torus object, go there
		// check - set destination to target position, go there
		{
			preconfiguration: ai.sotl_configurationGetControllerOrder,
			condition: ai.sotl_conditionControllerOrderIsIntercept,
			truebranch: interceptOrders
		},
		{
			condition: ai.sotl_conditionControllerOrderIsCheck,
			truebranch: checkOrders
		},
		{
			condition: ai.sotl_conditionControllerOrderIsRecall,
			truebranch: recallOrders
		},
		{
			condition: ai.sotl_conditionControllerOrderIsDefend,
			truebranch: defendOrders
		},
		/* Shouldn't happen */
		{
			behaviour: ai.behaviourWaitHere,
			reconsider: 3600
		}
	]);


}