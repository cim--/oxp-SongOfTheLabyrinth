"use strict";

this.name = "SOTL Escort AI";

this.aiStarted = function() {
	var ai = new worldScripts["oolite-libPriorityAI"].PriorityAIController(this.ship);

	ai.setParameter("oolite_flag_sendsDistressCalls",true);

	/* Mostly this is the same as the core Oolite one, *except* that
	 * the escort green flight behaviour is a template, not a
	 * behaviour, to allow for more sophistication later. */

	ai.setPriorities([
		{
			condition: ai.conditionLosingCombat,
			behaviour: ai.behaviourFleeCombat,
			reconsider: 5
		},
		{
			condition: ai.conditionMothershipInCombat,
			truebranch: [
				{
					condition: ai.conditionMothershipUnderAttack,
					configuration: ai.configurationAcquireDefensiveEscortTarget,
					behaviour: ai.behaviourRepelCurrentTarget,
					reconsider: 5
				},
				{
					condition: ai.conditionMothershipIsAttacking,
					configuration: ai.configurationAcquireOffensiveEscortTarget,
					behaviour: ai.behaviourDestroyCurrentTarget,
					reconsider: 5
				},
				{
					behaviour: ai.behaviourRejoinMothership,
					reconsider: 5
				}
			]
		},
		{
			// if we're in combat but mothership isn't, then we need
			// to finish this fight off and get back to them
			condition: ai.conditionInCombat,
			configuration: ai.configurationAcquireCombatTarget,
			behaviour: ai.behaviourRepelCurrentTarget,
			reconsider: 5
		},
		{
			condition: ai.conditionWitchspaceEntryRequested,
			behaviour: ai.behaviourEnterWitchspace,
			reconsider: 15
		},
		{
			condition: ai.conditionIsEscorting,
			truebranch: ai.sotl_templateEscortMothership()
		},
		/* Don't have a mothership */
		{
			condition: ai.conditionFriendlyStationNearby,
			configuration: ai.configurationSetNearbyFriendlyStationForDocking,
			behaviour: ai.behaviourDockWithStation,
			reconsider: 30
		},
		/* And it's not because they just docked either */
		{
			preconfiguration: ai.configurationCheckScanner,
			condition: ai.conditionScannerContainsShipNeedingEscort,
			behaviour: ai.behaviourOfferToEscort,
			reconsider: 15
		},
		{
			condition: ai.conditionFriendlyStationExists,
			configuration: ai.configurationSetDestinationToNearestFriendlyStation,
			behaviour: ai.behaviourApproachDestination,
			reconsider: 30
		},
		/* No friendly stations and no nearby ships needing escort */
		{
			condition: ai.conditionCanWitchspaceOut,
			configuration: ai.configurationSelectWitchspaceDestination,
			behaviour: ai.behaviourEnterWitchspace,
			reconsider: 20
		},
		/* And we're stuck here, but something to escort will probably
		 * show up at the witchpoint sooner or later */
		{
			configuration: ai.configurationSetDestinationToWitchpoint,
			behaviour: ai.behaviourApproachDestination,
			reconsider: 30
		}
	]);




}