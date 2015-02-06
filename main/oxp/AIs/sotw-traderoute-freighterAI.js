"use strict";

this.name = "SOTW Freighter (Trade Route) AI";

this.aiStarted = function() {
	var ai = new worldScripts["oolite-libPriorityAI"].PriorityAIController(this.ship);

	ai.setParameter("oolite_flag_sendsDistressCalls",true);

	if (this.ship.script.$sotwPersonalVector) {
		ai.setParameter("sotw_personalVector",this.ship.script.$sotwPersonalVector);
	}
	if (this.ship.script.$sotwResupplyShip) {
		ai.setParameter("sotw_freighterResupplyShip",this.ship.script.$sotwFreighterResupplyShip);
		for (var i=0;i<system.stations.length;i++) {
			if (system.stations[i].position.distanceTo(this.ship) < 15E3) {
				// make sure freighters added ready to resupply don't run away
				ai.setParameter("oolite_selectedStation",system.stations[i]);
				break;
			}
		}

	}

	if (system.info.population > 0) {
		if (system.ID == this.ship.destinationSystem) {
			ai.setParameter("sotw_freighterObjective","TRADE");
			ai.setParameter("sotw_resupplyLevel",this.ship.cargoSpaceCapacity);
		} else if (system.ID == this.ship.homeSystem) {
			ai.setParameter("sotw_freighterObjective","TRADE");
			if (this.ship.position.magnitude() < 25E3) {
				// this freighter is about to begin a trade route
				ai.setParameter("sotw_resupplyLevel",this.ship.cargoSpaceCapacity);
			} else {
				ai.setParameter("sotw_resupplyLevel",Math.floor(Math.random()*this.ship.cargoSpaceCapacity));
			}
		} else {
			ai.setParameter("sotw_freighterObjective","RESUPPLY");
			ai.setParameter("sotw_resupplyLevel",1);
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
		{
			label: "Resupply complete?",
			notcondition: ai.sotw_conditionNeedsResupply,
			configuration: ai.sotw_configurationFreighterObjectiveTravel,
			behaviour: ai.behaviourWaitHere,
			reconsider: 120 // let the resupply ship get clear
		},
		{
			label: "Station nearby?",
			condition: ai.conditionSelectedStationNearby,
			truebranch: ai.sotw_templateResupplyOperation()
		},
		{
			label: "Approach station?",
			condition: ai.conditionHasSelectedStation,
			truebranch: ai.sotw_templateApproachStation()
		},
		{
			label: "Select station",
			condition: ai.sotw_conditionRefuellingStationExists,
			configuration: ai.sotw_configurationSelectRefuellingStation,
			truebranch: ai.sotw_templateApproachStation()
		},
		{
			label: "Panic",
			// no refuelling possible here - move on
			configuration: ai.sotw_configurationFreighterObjectiveTravel,
			behaviour: ai.behaviourWaitHere,
			reconsider: 5 
		}	
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
	 * [1] if no exports from system, set destination to nearest
	 * system with exports
	 */
	var pri_trade = [
		{
			label: "Select trade route",
			notcondition: ai.sotw_conditionNeedsResupply,
			configuration: ai.sotw_configurationFreighterNewTradeRoute,
			behaviour: ai.behaviourWaitHere,
			reconsider: 120 // let the resupply ship get clear
		},
		{
			label: "Resupply at station",
			condition: ai.conditionSelectedStationNearby,
			truebranch: ai.sotw_templateResupplyOperation()
		},
		{
			label: "Approach station",
			condition: ai.conditionHasSelectedStation,
			truebranch: ai.sotw_templateApproachStation()
		},
		{
			label: "Select station",
			condition: ai.sotw_conditionMainTradingStationExists,
			configuration: ai.sotw_configurationSelectMainTradingStation,
			truebranch: ai.sotw_templateApproachStation()
		},
		{
			label: "Panic",
			// no trading possible here - panic!
			configuration: ai.sotw_configurationFreighterAbortMission,
			behaviour: ai.behaviourWaitHere,
			reconsider: 5 
		}	
	];


	/* Travel:
	 * - if has fuel, jump to the next system on the current trade route
	 * - else, refuel from the cargo hold
	 * (if not on the current trade route, then if a system which is
	 * is adjacent, jump to it instead - else set objective to
	 * SURVIVE)
	 */
	var pri_travel = [
		{
			label: "Jump to next system",
			preconfiguration: ai.sotw_configurationSetTradeRouteNextSystem,
			condition: ai.sotw_conditionHasFuelForJump,
			truebranch: ai.sotw_templateMakeWitchspaceJump()
		},
		{
			label: "Refuel",
			condition: ai.sotw_conditionHasFuelAboard,
			truebranch: ai.sotw_templateRefuelInFlight()
		},
		{
			label: "Panic",
			// out of fuel supplies - panic!
			configuration: ai.sotw_configurationFreighterAbortMission,
			behaviour: ai.behaviourWaitHere,
			reconsider: 5 
		}
	];

	/* Survive: (this is a fallback option in case the freighter ends
	   up somewhere strange, or an outbreak of war makes their trade
	   route impossible, or whatever)
	 * - if in a system with a friendly (main, for now) station, set
         objective to TRADE
	 * - if has fuel
	 * -- if in a system adjacent to an inhabited system, jump to it
	 * -- otherwise jump to a system with a lower isolation number
	 * - otherwise refuel.
	 */
	var pri_survive = [
		// TODO: TEMPORARY!
		{
			behaviour: ai.behaviourWaitHere,
			reconsider: 60
		}
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
			label: "Try to resupply",
			condition: ai.sotw_conditionFreighterWantsToResupply,
			truebranch: pri_resupply,
		}, 
		{
			label: "Try to travel",
			condition: ai.sotw_conditionFreighterWantsToTravel,
			truebranch: pri_travel,
		}, 
		{
			label: "Try to trade",
			condition: ai.sotw_conditionFreighterWantsToTrade,
			truebranch: pri_trade,
		}, 
		{
			label: "Try to survive",
			condition: ai.sotw_conditionFreighterWantsToSurvive,
			truebranch: pri_survive,
		}, 
		// emergency fallback if the current objective becomes impossible
		{
			configuration: ai.sotw_configurationFreighterAbortMission,
			behaviour: ai.behaviourReconsider
		}
	]);
}