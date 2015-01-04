"use strict";

this.name = "SOTW Priority AI Extensions";

this.startUp = function() {
	var lib = worldScripts["oolite-libPriorityAI"].PriorityAIController;

	/* Conditions */

	lib.prototype.sotw_conditionScannerContainsHostileFaction() {
		var scan = this.getParameter("oolite_scanResults");
		if (scan) {
			var f1 = this.ship.script.$sotwFaction;
			this.checkScannerWithPredicate(function(s) { 
				var f2 = scan[i].script.$sotwFaction;
				if (f2 && f2 != f1) {
					var result = this.sotw_utilCompareFactions(f1,f2);
					if (result < 0) {
						return true;
					}
				}
				return false;
			});
		} else {
			return false;
		}
	};

	lib.prototype.conditionStationHasEnoughDefense = function() {
		// should have one patrolling ship per security level
		// (sotw_desiredSecurityLevel parameter) in some systems there
		// may be some stationary defense drones too, which will count
		// against this number
	};

	/* Behaviours */

	lib.prototype.sotw_behaviourStationFight = function() {
		if (!this.__ltcache.sotw_launched_ship) {
			if (this.$defenseShipCounter > 0) {
				this.sotw_utilLaunchDefenseShips();
			}
		}
	};

	lib.prototype.sotw_behaviourStationRespondToDistressCall = function() {
		// check factions of both parties, then take action
	};
	
	lib.prototype.sotw_behaviourStationWarnOrAttackHostileFaction() {
		var f1 = this.ship.script.$sotwFaction;
		var f2 = this.ship.target.script.$sotwFaction;
		var compare = this.sotw_utilCompareFactions(f1,f2);
		if (compare <= -3) {
			// attack on sight
			this.ship.alertCondition = 3;
			this.ship.requestHelpFromGroup();
			this.reconsiderNow();
		} else if (compare == -2) {
			if (this.ship.alertCondition == 2) {
				// already warned
				this.ship.alertCondition = 3;
				this.ship.requestHelpFromGroup();
				this.reconsiderNow();
			} else {
				this.sotw_utilWarnTarget();
			}
		}
	
	};

	lib.prototype.sotw_behaviourStationLaunchSalvager = function() {
		
	};

	lib.prototype.sotw_behaviourStationLaunchDefense = function() {
		if (!this.__ltcache.sotw_launched_ship) {
			if (this.$defenseShipCounter > 0) {
				this.sotw_utilLaunchDefenseShips();
			}
		}
		// TODO: if total defense ship count is too low
		// then may initiate an "escort the refill" mission
	};


	/* Utils */
	
	/**
	 * -3: hostile on sight
	 * -2: extremely suspicious, may attack pre-emptively
	 * -1: suspicious, will not give any benefit of doubt
	 *  0: neutral, may aid distress calls if safe to do so
	 *  1: friendly, will give benefit of doubt, will usually aid distress calls
	 *  2: allied, will give benefit of doubt, always helps distress calls
	 *  3: same faction
	 */
	lib.prototype.sotw_utilCompareFactions = function(f1,f2) {
		if (f1 == f2) { return 3; }
		return 0; // temp
	};

	lib.prototype.sotw_utilLaunchDefenseShips = function() {
		this.__ltcache.sotw_launched_ship = 1;
		// TODO: actually launch ships
	};

	lib.prototype.sotw_utilWarnTarget = function() {

	};

	/* Event handlers and response sets */
	// need to override a few core definitions here, for simplicity








};