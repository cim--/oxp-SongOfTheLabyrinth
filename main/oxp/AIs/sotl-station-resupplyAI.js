"use strict";

this.name = "Station Resupply AI";

this.aiStarted = function() {
	var ai = new worldScripts["oolite-libPriorityAI"].PriorityAIController(this.ship);

	ai.setCommunicationsRole("sotl_stationResupply");


	if (this.ship.position.distanceTo(this.ship.group.leader) > 8E3) {
		// already resupplying
		ai.setParameter("sotl_resupplyLevel",Math.ceil(Math.random()*this.ship.cargoSpaceCapacity));
	} else {
		// start with full resupply cargo on normal launch
		ai.setParameter("sotl_resupplyLevel",this.ship.cargoSpaceCapacity);
	}


	var pri_resupply = [
		/*
		 * Step 1: fly to resupply docking start position
		 * Step 2: face resupply docking end position
		 * Step 3: set collision exception, fly to docking end position
		 * Step 4: freighter will handle transfers
		 */
		{ // step 4
			label: "Docked with target?",
			condition: ai.sotl_conditionResupplierFreighterDocked,
			behaviour: ai.behaviourWaitHere,
			reconsider: 30 // needs to be faster than the freighter
		},
		{ // step 3
			label: "Ready to dock with target?",
			condition: ai.sotl_conditionResupplyReadyToDock,
			configuration: ai.sotl_configurationSetResupplyFinalDocking,
			behaviour: ai.behaviourApproachDestination,
			reconsider: 30 // this reconsider is unlikely to be used
		},
		{ // step 2
			label: "Turn to face docking?",
			condition: ai.sotl_conditionResupplyAtDockingStartPoint,
			configuration: ai.sotl_configurationSetResupplyMidDocking,
			behaviour: ai.sotl_behaviourPriorityFaceDestinationForResupplyDock,
			reconsider: 30 // this reconsider is unlikely to be used
		},
		{ // step 1
			label: "Go to docking start location",
			configuration: ai.sotl_configurationSetResupplyBeginDocking,
			behaviour: ai.behaviourApproachDestination,
			reconsider: 30
		}
	];

	/* TODO: At the moment this doesn't clear the collision exception
	 * once the docking operation is complete. Should fix this at some
	 * point. */

	ai.setPriorities([
		/* Fight */
		{
			label: "Avoid combat",
			condition: ai.conditionInCombat,
			behaviour: ai.behaviourFleeCombat,
			reconsider: 5
		},
		{
			label: "Check resupply mission",
			condition: ai.sotl_conditionHasResupplyMission,
			// mission complete/failed? return to base
			// this means it won't try to use remaining cargo
			// on a different freighter -- it probably didn't have
			// the right items on board anyway
			falsebranch: ai.templateReturnToBase(),
			truebranch: pri_resupply
		},
		// getting here means there's no resuppliable ship
		// and no stations left in the system.
	].concat(ai.templateWitchspaceJumpAnywhere()),
					 1); // delay initial reconsideration

}