"use strict";

// so far this is a copy of the Oolite one. Changes are likely to be
// necessary later.
this.name = "SOTW Freighter (Trade Route) AI";

this.aiStarted = function() {
	var ai = new worldScripts["oolite-libPriorityAI"].PriorityAIController(this.ship);

	ai.setParameter("oolite_flag_sendsDistressCalls",true);

	if (system.info.population > 0) {
		if (system.ID == this.ship.destinationSystem) {
			ai.setParameter("sotw_freighterObjective","TRADE");
		} else if (system.ID == this.ship.homeSystem) {
			ai.setParameter("sotw_freighterObjective","TRADE");
		} else {
			ai.setParameter("sotw_freighterObjective","RESUPPLY");
		}
	} else {
		ai.setParameter("sotw_freighterObjective","TRAVEL");
	}

	/* Resupply:
	 *  - set resupply level of 1 (forces only one shuttle trip)
	 *  - find a local friendly station which sells fuel
	 *  -- if none, set objective to TRAVEL
	 *  - fly to that station
	 *  - wait near that station for shuttle docking
	 *  - if resupply level is zero, set objective to TRAVEL
	 */
	var pri_resupply = [

	];

	/* Trade:
	 *  - set resupply level of cargo size
	 *  - find a local friendly station linked to the system market
	 *  -- if none, set objective to SURVIVE
	 *  - fly to that station
	 *  - wait near that station for shuttle docking
	 *  -- if shuttle docking complete and still has resupply level,
           request another

	 * - if resupply level is zero, set objective to TRAVEL,
          destinationSystem to a suitable export destination for this
          system [1], and homeSystem to here.
	 * [1] base on the size of the trade route versus the size of the
	   freighter, if there's a lot of choice.
	 */
	var pri_trade = [

	];


	/* Travel:
	 * - if has fuel, jump to the next system on the current trade route
	 * - else, refuel from the cargo hold
	 * (if not on the current trade route, then if a system which is
	 * is adjacent, jump to it instead - else set objective to
	 * SURVIVE)
	 */
	var pri_travel = [

	];

	/* Survive: (this is a fallback option in case the freighter ends
	   up somewhere strange, or an outbreak of war makes their trade
	   route impossible, or whatever)
	 * - if in a system with a friendly station, set objective to TRADE
	 * - if has fuel
	 * -- if in a system adjacent to an inhabited system, jump to it
	 * -- otherwise jump to a system with a lower isolation number
	 * - otherwise refuel.
	 */
	var pri_survive = [

	];

	ai.setPriorities([
		{
			condition: ai.conditionInCombat,
			behaviour: ai.behaviourFleeCombat,
			reconsider: 10
		},
		{
			condition: ai.conditionHostileStationNearby,
			configuration: ai.configurationSetDestinationToNearestStation,
			behaviour: ai.behaviourLeaveVicinityOfDestination,
			reconsider: 20
		},
		{
			condition: ai.sotw_conditionFreighterWantsToResupply,
			truebranch: pri_resupply,
		}, 
		{
			condition: ai.sotw_conditionFreighterWantsToTravel,
			truebranch: pri_travel,
		}, 
		{
			condition: ai.sotw_conditionFreighterWantsToTrade,
			truebranch: pri_trade,
		}, 
		{
			condition: ai.sotw_conditionFreighterWantsToSurvive,
			truebranch: pri_survive,
		}, 
		// emergency fallback if the current objective becomes impossible
		{
			configuration: ai.sotw_configurationFreighterAbortMission,
			behaviour: ai.behaviourReconsider:
		}
	]);
}