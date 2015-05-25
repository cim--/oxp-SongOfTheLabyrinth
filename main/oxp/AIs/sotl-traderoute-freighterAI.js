"use strict";

this.name = "SOTL Freighter (Trade Route) AI";

this.aiStarted = function() {
	var ai = new worldScripts["oolite-libPriorityAI"].PriorityAIController(this.ship);

	ai.setParameter("oolite_flag_sendsDistressCalls",true);

	if (this.ship.script.$sotlPersonalVector) {
		ai.setParameter("sotl_personalVector",this.ship.script.$sotlPersonalVector);
	}
	if (this.ship.script.$sotlResupplyShip) {
		ai.setParameter("sotl_freighterResupplyShip",this.ship.script.$sotlFreighterResupplyShip);
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
			ai.setParameter("sotl_freighterObjective","TRADE");
			ai.setParameter("sotl_resupplyLevel",this.ship.cargoSpaceCapacity);
		} else if (system.ID == this.ship.homeSystem) {
			ai.setParameter("sotl_freighterObjective","TRADE");
			if (this.ship.position.magnitude() < 25E3) {
				// this freighter is about to begin a trade route
				ai.setParameter("sotl_resupplyLevel",this.ship.cargoSpaceCapacity);
			} else {
				ai.setParameter("sotl_resupplyLevel",Math.floor(Math.random()*this.ship.cargoSpaceCapacity));
			}
		} else {
			ai.setParameter("sotl_freighterObjective","RESUPPLY");
			ai.setParameter("sotl_resupplyLevel",1);
		}
	} else {
		ai.setParameter("sotl_freighterObjective","TRAVEL");
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
			notcondition: ai.sotl_conditionNeedsResupply,
			configuration: ai.sotl_configurationFreighterObjectiveTravel,
			behaviour: ai.behaviourWaitHere,
			reconsider: 120 // let the resupply ship get clear
		},
		{
			label: "Station nearby?",
			condition: ai.conditionSelectedStationNearby,
			truebranch: ai.sotl_templateResupplyOperation()
		},
		{
			label: "Approach station?",
			condition: ai.conditionHasSelectedStation,
			truebranch: ai.sotl_templateApproachStation()
		},
		{
			label: "Select station",
			condition: ai.sotl_conditionRefuellingStationExists,
			configuration: ai.sotl_configurationSelectRefuellingStation,
			truebranch: ai.sotl_templateApproachStation()
		},
		{
			label: "Panic",
			// no refuelling possible here - move on
			configuration: ai.sotl_configurationFreighterObjectiveTravel,
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
			notcondition: ai.sotl_conditionNeedsResupply,
			configuration: ai.sotl_configurationFreighterNewTradeRoute,
			behaviour: ai.behaviourWaitHere,
			reconsider: 120 // let the resupply ship get clear
		},
		{
			label: "Resupply at station",
			condition: ai.conditionSelectedStationNearby,
			truebranch: ai.sotl_templateResupplyOperation()
		},
		{
			label: "Approach station",
			condition: ai.conditionHasSelectedStation,
			truebranch: ai.sotl_templateApproachStation()
		},
		{
			label: "Select station",
			condition: ai.sotl_conditionMainTradingStationExists,
			configuration: ai.sotl_configurationSelectMainTradingStation,
			truebranch: ai.sotl_templateApproachStation()
		},
		{
			label: "Panic",
			// no trading possible here - panic!
			configuration: ai.sotl_configurationFreighterAbortMission,
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
			preconfiguration: ai.sotl_configurationSetTradeRouteNextSystem,
			condition: ai.sotl_conditionHasFuelForJump,
			truebranch: ai.sotl_templateMakeWitchspaceJump()
		},
		{
			label: "Refuel",
			condition: ai.sotl_conditionHasFuelAboard,
			truebranch: ai.sotl_templateRefuelInFlight()
		},
		{
			label: "Panic",
			// out of fuel supplies - panic!
			configuration: ai.sotl_configurationFreighterAbortMission,
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
			condition: ai.sotl_conditionHasSurrendered,
			behaviour: ai.sotl_behaviourSurrender,
			reconsider: 120
		},
		{
			condition: ai.conditionInCombat,
			behaviour: ai.sotl_behaviourSurviveCombat,
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
			condition: ai.sotl_conditionFreighterWantsToResupply,
			truebranch: pri_resupply,
		}, 
		{
			label: "Try to travel",
			condition: ai.sotl_conditionFreighterWantsToTravel,
			truebranch: pri_travel,
		}, 
		{
			label: "Try to trade",
			condition: ai.sotl_conditionFreighterWantsToTrade,
			truebranch: pri_trade,
		}, 
		{
			label: "Try to survive",
			condition: ai.sotl_conditionFreighterWantsToSurvive,
			truebranch: pri_survive,
		}, 
		// emergency fallback if the current objective becomes impossible
		{
			configuration: ai.sotl_configurationFreighterAbortMission,
			behaviour: ai.behaviourReconsider
		}
	]);
}