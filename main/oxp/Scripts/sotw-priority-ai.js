this.name = "SOTW Priority AI Extensions";

this.startUp = function() {
	var lib = worldScripts["oolite-libPriorityAI"].PriorityAIController;
	var pop = worldScripts["SOTW Populator Script"];
	/* Conditions */

	lib.prototype.sotw_conditionScannerContainsHostileFaction = function() {
		var scan = this.getParameter("oolite_scanResults");
		if (scan) {
			var f1 = this.ship.script.$sotwFaction;
			this.checkScannerWithPredicate(function(s) { 
				var f2 = s.script.$sotwFaction;
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

	lib.prototype.sotw_conditionStationHasEnoughDefense = function() {
		// should have one patrolling ship per security level
		// (sotw_desiredSecurityLevel parameter) in some systems there
		// may be some stationary defense drones too, which will count
		// against this number
		var gs = this.ship.group.ships;
		var has = 0;
		for (var i=gs.length-1;i>=0;i--) {
			if (gs[i].primaryRole == "sotw-station-defense-ship" || gs[i].primaryRole == "sotw-station-defense-platform") {
				has++;
			}
		}
		return has >= this.getParameter("sotw_desiredSecurityLevel");
	};

	/* Behaviours */

	lib.prototype.sotw_behaviourStationFight = function() {
		if (!this.__ltcache.sotw_launched_ship) {
			if (this.ship.script.$defenseShipCounter > 0) {
				this.sotw_utilLaunchDefenseShips();
			}
		}
		var handlers = {};
		this.responsesAddStation(handlers);
		this.applyHandlers(handlers);
	};

	lib.prototype.sotw_behaviourStationRespondToDistressCall = function() {
		// check factions of both parties, then take action
		var handlers = {};
		this.responsesAddStation(handlers);
		this.applyHandlers(handlers);
	};
	
	lib.prototype.sotw_behaviourStationWarnOrAttackHostileFaction = function() {
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
		var handlers = {};
		this.responsesAddStation(handlers);
		this.applyHandlers(handlers);
	};

	lib.prototype.sotw_behaviourStationLaunchSalvager = function() {
		if (this.ship.script.$salvageShipCounter > 0) {
			this.sotw_utilLaunchSalvageShip();
		}
		var handlers = {};
		this.responsesAddStation(handlers);
		this.applyHandlers(handlers);
	};

	lib.prototype.sotw_behaviourStationLaunchDefense = function() {
		if (!this.__ltcache.sotw_launched_ship) {
			if (this.ship.script.$defenseShipCounter > 0) {
				this.sotw_utilLaunchDefenseShips();
			}
		}
		// TODO: if total defense ship count is too low
		// then may initiate an "escort the refill" mission
		var handlers = {};
		this.responsesAddStation(handlers);
		this.applyHandlers(handlers);
	};

	lib.prototype.sotw_behaviourStationIdle = function() {
		var handlers = {};
		this.responsesAddStation(handlers);
		this.applyHandlers(handlers);
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
		var attempt = Math.min(3,this.ship.script.$defenseShipCounter);
		var ships = pop._launchShipsFromStation(this.ship,"sotw-fighter-superiority","sotw-station-defense-ship",true,attempt,attempt*this.getParameter("sotw_defenseShipStrength"));
		if (ships) {
			this.ship.script.$defenseShipCounter -= ships.length;
		}
	};

	lib.prototype.sotw_utilLaunchSalvageShips = function() {
		this.__ltcache.sotw_launched_ship = 1;
		// TODO: actually launch ships
	};

	lib.prototype.sotw_utilWarnTarget = function() {
		// TODO: actually warn target
	};

	/* Event handlers and response sets */
	// need to override a few core definitions here, for simplicity




	/* Waypoint generators */

	lib.prototype.sotw_waypointsStationPatrol = function() {
		// needs to depend on station security level
		// stations with more ships on patrol can have more complex routes
		var patrol = this.getParameter("sotw_patrolZoneNumber");
		if (!patrol) {
			var gs = this.ship.group.ships;
			var nums = [];
			// find patrol numbers for other ships in groups (1-indexed)
			for (var i=gs.length-1;i>=0;i--) {
				if (gs[i].AIScript.oolite_priorityai) {
					var pzn = gs[i].AIScript.oolite_priorityai.getParameter("sotw_patrolZoneNumber");
					if (pzn) {
						nums.push(pzn);
					}
				}
			}
			patrol = 1;
			while (nums.indexOf(patrol) != -1) {
				++patrol;
			}
			// patrol is now first free number
			this.setParameter("sotw_patrolZoneNumber",patrol);
		}
		if (patrol <= 6) {
			patrol &= 1;
		} else {
			patrol &= 3;
		}
		var centre, speed, radius, vx, vy;
		var station = this.ship.group.leader;
		switch (patrol) {
		case 0:
			// nearby circular patrol
			centre = station.position;
			speed = 200;
			radius = 12.5E3;
			vx = station.vectorForward;
			vy = station.vectorRight;
			break;
		case 1:
			// nearby witchpoint direction patrol
			// TODO: point towards most common traffic direction
			// not necessarily main planet witchpoint
			centre = station.position.subtract(station.position.direction().multiply(15E3));
			speed = 200;
			radius = 5E3;
			vx = station.position.direction().cross(new Vector3D(0,0,1)).direction();
			vy = station.position.direction().cross(vx).direction();
			break;
		case 2:
			// far circular patrol
			centre = station.position;
			speed = 200;
			radius = 30E3;
			vx = station.vectorForward;
			vy = station.vectorUp;
			break;
		case 3:
			// far witchpoint direction patrol
			centre = station.position.subtract(station.position.direction().multiply(30E3));
			speed = 200;
			radius = 5E3;
			vx = station.position.direction().cross(new Vector3D(0,0,1)).direction();
			vy = station.position.direction().cross(vx).direction();
			break;
		}
		
		var aspeed = speed/radius;
		var angle = clock.absoluteSeconds*aspeed;
		var sinx = vx.multiply(Math.sin(angle)*radius);
		var cosx = vy.multiply(Math.cos(angle)*radius);
		var pos = centre.add(sinx).add(cosx);

		this.setParameter("oolite_waypointRange",500);
		this.setParameter("oolite_waypoint",pos);
		system.setWaypoint("sotw_patrol"+patrol,pos,[1,0,0,0],{size:100,beaconCode:patrol});
	};

};