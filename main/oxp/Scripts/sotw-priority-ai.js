"use strict";

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

	lib.prototype.sotw_conditionFreighterWantsToTrade = function() {
		return this.getParameter("sotw_freighterObjective") == "TRADE";
	};

	lib.prototype.sotw_conditionFreighterWantsToResupply = function() {
		return this.getParameter("sotw_freighterObjective") == "RESUPPLY";
	};

	lib.prototype.sotw_conditionFreighterWantsToTravel = function() {
		return this.getParameter("sotw_freighterObjective") == "TRAVEL";
	};

	lib.prototype.sotw_conditionFreighterWantsToSurvive = function() {
		return this.getParameter("sotw_freighterObjective") == "SURVIVE";
	};

	lib.prototype.sotw_conditionFreighterResupplierAssigned = function() {
		var re = this.getParameter("sotw_freighterResupplyShip");
		if (!re) {
			// initial population stage only
			re = this.ship.script.$sotwResupplyShip;
			if (re && re.isValid) {
				this.setParameter("sotw_freighterResupplyShip",re);
			}
		}
		if (re && re.isValid && (re.status == "STATUS_IN_FLIGHT" || re.status == "STATUS_LAUNCHING" || re.status == "STATUS_DOCKED")) {
			return true;
		} else if (re) {
			this.setParameter("sotw_freighterResupplyShip",null);
		}
		return false;
	};

	// freighter testing if the resupplier is docked
	lib.prototype.sotw_conditionFreighterResupplierDocked = function() {
		var re = this.getParameter("sotw_freighterResupplyShip");
		if (!re) {
			// initial population stage only
			re = this.ship.script.$sotwResupplyShip;
			if (re && re.isValid) {
				this.setParameter("sotw_freighterResupplyShip",re);
			}
		}
		if (re && re.isValid && (re.status == "STATUS_IN_FLIGHT" || re.status == "STATUS_LAUNCHING" || re.status == "STATUS_DOCKED")) {
			if (this.ship.speed == 0 && re.speed == 0) {
				if (this.distance(re) < this.ship.collisionRadius + re.collisionRadius + 20) {
					if (this.ship.collisionExceptions.indexOf(re) > -1) {
						return true;
					}
				}
			}
		} else if (re) {
			this.setParameter("sotw_freighterResupplyShip",null);
		}
		return false;
	};

	// resupplier testing if the freighter is docked
	lib.prototype.sotw_conditionResupplierFreighterDocked = function() {
		var rt = this.ship.script.$sotwResupplyTarget;
		if (rt && rt.isValid && rt.status == "STATUS_IN_FLIGHT") {
			if (this.ship.speed == 0 && rt.speed == 0) {
				if (this.distance(rt) < this.ship.collisionRadius + rt.collisionRadius + 20) {
					if (this.ship.collisionExceptions.indexOf(rt) > -1) {
						return true;
					}
				}
			}
		} else if (rt) {
			this.setParameter("sotw_freighterResupplyShip",null);
		}
		return false;
	};


	lib.prototype.sotw_conditionNeedsResupply = function() {
		var sl = this.getParameter("sotw_resupplyLevel");
		return (sl > 0);
	};

	lib.prototype.sotw_conditionInResupplyRange = function() {
		var station = this.getParameter("oolite_selectedStation");
		if (station && this.distance(station) < 20E3)
		{
			var resupplyPoint = station.position.add(this.sotw_utilPersonalVector().multiply(10E3+station.collisionRadius));
			return (this.distance(resupplyPoint) < 2E3);
		}
		return false;
	};

	lib.prototype.sotw_conditionRefuellingStationExists = function() {
		var ss = system.stations;
		for (var i=0;i<ss.length;i++) {
			if (this.friendlyStation(ss[i])) {
				/* TODO: will eventually need condition about whether
				 * the station is open for general business */
				if (ss[i].market["sotw-fuel"].quantity > 0) {
					return true;
				}
			}
		}
		return false;
	};

	lib.prototype.sotw_conditionNearRefuellingStation = function() {
		var ss = system.stations;
		for (var i=0;i<ss.length;i++) {
			if (this.friendlyStation(ss[i])) {
				/* TODO: will eventually need condition about whether
				 * the station is open for general business */
				if (ss[i].market["sotw-fuel"].quantity > 0) {
					if (this.distance(ss[i]) < 20E3) {
						return true;
					}
				}
			}
		}
		return false;
	};

	lib.prototype.sotw_conditionMainTradingStationExists = function() {
		/* TODO: more than just one station linked to main market */
		return this.friendlyStation(system.mainStation);
	};

	lib.prototype.sotw_conditionIsMoving = function() {
		return this.ship.speed > 0;
	};

	lib.prototype.sotw_conditionHasFuelForJump = function() {
		var next = this.getParameter("sotw_nextSystem");
		var dist = system.info.distanceToSystem(System.infoForSystem(galaxyNumber,next));
		return this.ship.fuel >= dist;
	};
	
	lib.prototype.sotw_conditionHasFuelAboard = function() {
		// TODO: actually track fuel carried
		return true;
	};

	lib.prototype.sotw_conditionWitchspaceCountdownComplete = function() {
		var cstart = this.getParameter("sotw_witchspaceCountdownStarted");
		return (cstart && clock.absoluteSeconds - cstart > 15);
	};

	lib.prototype.sotw_conditionRefuellingCountdownComplete = function() {
		var cstart = this.getParameter("sotw_refuellingCountdownStarted");
		return ((cstart) && ((clock.absoluteSeconds - cstart) > 300));
	};

	lib.prototype.sotw_conditionInClearSpace = function() {
		if (this.ship.position.magnitude() < 100E3) {
			return false;
		}
		var scanned = this.ship.checkScanner(true);
		for (var i=0;i<scanned.length;i++) {
			if (scanned.group != this.ship.group) {
				return false;
			}
		}
		return true;
	};

	lib.prototype.sotw_conditionHasResupplyMission = function() {
		var rtarget = this.ship.script.$sotwResupplyTarget;
		if (!rtarget || !rtarget.isValid) {
			return false;
		}
		if (this.getParameter("sotw_resupplyLevel") == 0 || rtarget.AIScript.oolite_priorityai.getParameter("sotw_resupplyLevel") == 0) {
			return false;
		}
		if (rtarget.speed > 0) {
			// this probably means the ship being resupplied is trying
			// to evade attacks, so now really isn't a good time to
			// try resupplying it.
			return false;
		}
		return true;
	};

	lib.prototype.sotw_conditionResupplyReadyToDock = function() {
		var rtarget = this.ship.script.$sotwResupplyTarget;
		var dest = this.sotw_utilDockingEndPosition(rtarget);
		// if either at start point or closer
		if (this.distance(dest) <= dest.distanceTo(this.sotw_utilDockingStartPosition(rtarget))+20) {
			// and facing the right way
			if (dest.subtract(this.ship.position).direction().dot(this.ship.vectorForward) > 0.999) {
				return true;
			}
		}
		return false;
	};

	lib.prototype.sotw_conditionResupplyAtDockingStartPoint = function() {
		var rtarget = this.ship.script.$sotwResupplyTarget;
		var dest = this.sotw_utilDockingStartPosition(rtarget);
		return this.distance(dest) < 5;
	};

	/* Configurations */

	lib.prototype.sotw_configurationSetResupplyFinalDocking = function() {
		var rtarget = this.ship.script.$sotwResupplyTarget;
		this.ship.destination = this.sotw_utilDockingEndPosition(rtarget);
		this.ship.desiredRange = 5;
		var cspeed = this.cruiseSpeed();
		this.ship.desiredSpeed = Math.min(cspeed,50);
		// must add collision exception, or trying to fly to the
		// destination will also try to avoid this ship...
		this.ship.addCollisionException(rtarget);
	};

	lib.prototype.sotw_configurationSetResupplyMidDocking = function() {
		var rtarget = this.ship.script.$sotwResupplyTarget;
		if (this.ship.destination.distanceTo(this.sotw_utilDockingMidPosition(rtarget)) < 10 || this.ship.destination.distanceTo(this.sotw_utilDockingEndPosition(rtarget)) < 10) {
			this.ship.destination = this.sotw_utilDockingEndPosition(rtarget);
		} else {
			this.ship.destination = this.sotw_utilDockingMidPosition(rtarget);
		}
		this.ship.desiredRange = 5;
		var cspeed = this.cruiseSpeed();
		this.ship.desiredSpeed = Math.min(cspeed,50);
		// must add collision exception, or trying to fly to the
		// destination will also try to avoid this ship...
		this.ship.addCollisionException(rtarget);
	};

	lib.prototype.sotw_configurationSetResupplyBeginDocking = function() {
		var rtarget = this.ship.script.$sotwResupplyTarget;
		this.ship.destination = this.sotw_utilDockingStartPosition(rtarget);
		this.ship.desiredRange = 2;
		this.ship.desiredSpeed = this.cruiseSpeed();
		// remove collision exception if set earlier
		this.ship.removeCollisionException(rtarget);
	};


	// spread them out around the station, rather than having them all pile up
	// on the witchpoint side
	lib.prototype.sotw_configurationSetDestinationToResupplyPoint = function() {
		var station = this.getParameter("oolite_selectedStation");
		this.ship.destination = station.position.add(this.sotw_utilPersonalVector().multiply(10E3+station.collisionRadius));
		this.ship.desiredRange = 100;
		this.ship.desiredSpeed = this.cruiseSpeed();
	};

	lib.prototype.sotw_configurationSetDestinationToClearSpace = function() {
		// clear out of the orbital plane
		var pos = this.ship.position;
		if (Math.abs(pos.y) < 25E3) {
			if (Math.random() < 0.5) {
				this.ship.destination = [pos.x,pos.y-75E3,pos.z];
			} else {
				this.ship.destination = [pos.x,pos.y+75E3,pos.z];
			}
		} else {
			this.ship.destination = [pos.x,pos.y*2,pos.z];
		}
		this.ship.desiredRange = 1000;
		this.ship.desiredSpeed = this.cruiseSpeed();
	};

	lib.prototype.sotw_configurationSelectMainTradingStation = function() {
		// TODO: more options than this
		this.setParameter("oolite_selectedStation",system.mainStation);
	};

	lib.prototype.sotw_configurationSelectRefuellingStation = function() {
		var opts = [];
		var ss = system.stations;
		for (var i=0;i<ss.length;i++) {
			if (this.friendlyStation(ss[i])) {
				if (ss[i].market["sotw-fuel"].quantity > 0) {
					opts.push(ss[i]);
				}
			}
		}
		if (ss.length > 0) {
			this.setParameter("oolite_selectedStation",opts[Math.floor(Math.random()*opts.length)]);
		}
	};

	lib.prototype.sotw_configurationSetTradeRouteNextSystem = function() {
		var next = this.getParameter("sotw_nextSystem");
		if (next === null || next == system.ID) {
			var routes = system.info.sotw_economy_onroutes.split(";");
			for (var i=0;i<routes.length;i++) {
				var route = routes[i].split(",");
				if (parseInt(route[route.length-1]) == this.ship.destinationSystem) {
					for (var j=0;j<route.length;j++) {
						if (route[j] == system.ID) {
							this.setParameter("sotw_nextSystem",route[j+1]);
							return;
						}
					}
				}
			}
			// get here, then not on the trade route to the destination system
			// odd... shouldn't happen
			// TODO: use conventional route planning to find the next
			// system towards the destination - will pick up the trade
			// route eventually!
		}

	};

	lib.prototype.sotw_configurationFreighterNewTradeRoute = function() {
		this.setParameter("sotw_freighterObjective","TRAVEL");
		this.ship.homeSystem = system.ID;
		
		var exports = system.info.sotw_economy_exportsto.split(";");
		if (system.info.sotw_economy_exportsto.split != "") {
			this.ship.destinationSystem = parseInt(exports[Math.floor(Math.random()*exports.length)]);
		} else {
			var dist = 7;
			do {
				var systems = system.info.systemsInRange(dist);
				for (var i=0;i<systems.length;i++) {
					if (systems[i].sotw_economy.exportsto != "") {
						// travel to the nearest system that
						// does export something
						this.ship.destinationSystem = systems[i];
						return;
					}
				}
				dist += 7;
			} while (dist < 100);
		}
	}

	lib.prototype.sotw_configurationFreighterAbortMission = function() {
		this.setParameter("sotw_freighterObjective","SURVIVE");
	};

	lib.prototype.sotw_configurationFreighterObjectiveTravel = function() {
		this.setParameter("sotw_freighterObjective","TRAVEL");
	};

	lib.prototype.sotw_configurationBeginWitchspaceCountdown = function() {
		// also discards stale countdowns
		if (!this.getParameter("sotw_witchspaceCountdownStarted") || this.getParameter("sotw_witchspaceCountdownStarted") - clock.absoluteSeconds > 60) {
			this.setParameter("sotw_witchspaceCountdownStarted",clock.absoluteSeconds);
		}
		this.ship.destination = this.ship.position.add(this.ship.vectorForward.multiply(1E6));
		this.ship.desiredSpeed = this.cruiseSpeed();
		this.ship.desiredRange = 1E3;
	};

	lib.prototype.sotw_configurationBeginRefuellingCountdown = function() {
		// also discards stale countdowns
		if (!this.getParameter("sotw_refuellingCountdownStarted") || this.getParameter("sotw_refuellingCountdownStarted") - clock.absoluteSeconds > 900) {
			this.setParameter("sotw_refuellingCountdownStarted",clock.absoluteSeconds);
		}
	};

	lib.prototype.sotw_configurationRefuel = function() {
		/* TODO: consume a tonne of fuel from hold to do this */
		this.ship.fuel = 7;
	}

	/* Behaviours */

	lib.prototype.sotw_behaviourChargeWitchspaceDrive = function() {
		// for now, just fly forward-ish
		this.behaviourApproachDestination();
	};

	lib.prototype.sotw_behaviourEnterWitchspace = function() {
		var destID = this.getParameter("sotw_nextSystem");
		var result = this.ship.exitSystem(destID);
		this.setParameter("sotw_witchspaceCountdownStarted",null);
		// if it doesn't, we'll get blocked
		if (result)
		{
			this.ship.notifyGroupOfWormhole();
		}
		var handlers = {};
		this.responsesAddStandard(handlers);
		this.applyHandlers(handlers);
	};

	lib.prototype.sotw_behaviourRequestResupply = function() {
		var s = this.getParameter("oolite_selectedStation");
		if (s.alertCondition > 1) {
			// not right now!
			return;
		}
		var resupply = pop._launchShipsFromStation(s,"sotw-transport-insystem","sotw-freighter-resupply",true,1,10)[0];
		if (resupply) {
			this.setParameter("sotw_freighterResupplyShip",resupply);
			resupply.script.$sotwResupplyTarget = this.ship;
		}
		var handlers = {};
		this.responsesAddStandard(handlers);
		this.applyHandlers(handlers);
	};


	lib.prototype.sotw_behaviourTransferResupply = function() {
		var needs = this.getParameter("sotw_resupplyLevel");
		var resupply = this.getParameter("sotw_freighterResupplyShip");
		var has = resupply.AIScript.oolite_priorityai.getParameter("sotw_resupplyLevel");
		if (needs > 0 && has > 0) {
			// transfer one unit of cargo
			// TODO: actually swap hold cargo based on what this ship wants
			this.setParameter("sotw_resupplyLevel",needs-1);
			resupply.AIScript.oolite_priorityai.setParameter("sotw_resupplyLevel",has-1);
			// and start refuelling
			this.sotw_configurationBeginRefuellingCountdown();
			if (needs == 1 || has == 1) {
				// now operation is complete
				// undock
				resupply.velocity = this.ship.vectorUp.multiply(75);
				// slight recoil
				this.ship.velocity = this.ship.vectorUp.multiply(-10);
			}
		}
		var handlers = {};
		this.responsesAddStandard(handlers);
		this.applyHandlers(handlers);
	};

	lib.prototype.sotw_behaviourPriorityFaceDestinationForResupplyDock = function() {
		// face destination, ignoring everything else until done
		var handlers = {
			shipNowFacingDestination : function() {
				this.reconsiderNow();
			}
		};
		this.applyHandlers(handlers);
		this.ship.performFaceDestination();
	};

	/* -- Station behaviours */

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
		var aggressor = this.getParameter("oolite_distressAggressor");
		var sender = this.getParameter("oolite_distressSender");
		var f1 = this.ship.script.$sotwFaction;
		var fa = aggressor.script.$sotwFaction;
		var fs = sender.script.$sotwFaction;
		var coma = this.sotw_utilCompareFactions(f1,fa);
		var coms = this.sotw_utilCompareFactions(f1,fs);
		if (coma > coms) {
			// reverse the two
			var tmp = sender;
			sender = aggressor;
			aggressor = tmp;
			tmp = coms;
			coms = coma;
			coma = tmp;
		}
		if (coms >= 0 && coma <= 1) {
			this.ship.addDefenseTarget(aggressor);
			if (!this.ship.hasHostileTarget) {
				this.ship.alertCondition = 3;
				this.ship.target = aggressor;
			}
		}

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

	lib.prototype.sotw_utilPersonalVector = function() {
		var v = this.getParameter("sotw_personalVector");
		if (!v) {
			v = Vector3D.randomDirection();
			this.setParameter("sotw_personalVector",v);
		}
		return v;
	};

	lib.prototype.sotw_utilDockingStartPosition = function(ship) {
		return this.sotw_utilDockingEndPosition(ship).add(ship.vectorForward.multiply(-1*(ship.boundingBox.z+this.ship.boundingBox.z+500)));
	};

	// this is used to get the turning to face destination right for ship
	// orientation
	lib.prototype.sotw_utilDockingMidPosition = function(ship) {
		return this.sotw_utilDockingEndPosition(ship).add(ship.vectorUp.multiply(500));
	};

	lib.prototype.sotw_utilDockingEndPosition = function(ship) {
		return ship.position.add(ship.vectorUp.multiply((ship.boundingBox.y+this.ship.boundingBox.y)/2));
	};


	// Core utility override
	lib.prototype.friendlyStation = function(station) {
		var f1 = this.ship.script.$sotwFaction;
		var f2 = station.script.$sotwFaction;
		var compare = this.sotw_utilCompareFactions(f1,f2);
		return compare >= 0;
	};

	// Core utility override
	lib.prototype.hostileStation = function(station) {
		var f1 = this.ship.script.$sotwFaction;
		var f2 = station.script.$sotwFaction;
		var compare = this.sotw_utilCompareFactions(f1,f2);
		return compare <= -2;
	};


	/* Event handlers and response sets */
	// need to override a few core definitions here, for simplicity

	// CORE Override - use factions rather than roles
	lib.prototype.ignorePlayerFriendlyFire = function()
	{
		var whom = player.ship;
		if (whom.target == this.ship)
		{
			return false; // was probably intentional
		}
		if (this.getParameter("oolite_lastAssist") == whom)
		{
			// player has helped this ship in this fight so is probably on the same side.
			if (Math.random() < 0.5)
			{
				// don't forgive too often
				this.setParameter("oolite_lastAssist",null);
			}
			return true;
		}
		// player could have meant to do that
		if (!this.getParameter("oolite_playerFriendlyFireAlready"))
		{
			var relation = this.sotw_utilCompareFactions(this.ship.script.$sotwFaction,player.ship.script.$sotwFaction);
			if (relation >= 1) {
				// only allow one!
				this.setParameter("oolite_playerFriendlyFireAlready",true);
				return true;
			}
		}
		return false;
	}

	/* Templates */

	lib.prototype.sotw_templateApproachStation = function() {
		/* TODO: torus drive support */
		return [
			{
				label: "Approach station",
				configuration: this.configurationSetDestinationToSelectedStation,
				behaviour: this.behaviourApproachDestination,
				reconsider: 30
			}
		];
	};


	lib.prototype.sotw_templateResupplyOperation = function() {
		/* 1) Come to complete stop
		 * 2) If no resupplier, request one
		 * 3) If resupplier docked, transfer one unit of resupply
		 * 4) Otherwise wait
		 */
		return [
			{
				label: "Approach designated resupply point",
				notcondition: this.sotw_conditionInResupplyRange,
				configuration: this.sotw_configurationSetDestinationToResupplyPoint,
				behaviour: this.behaviourApproachDestination,
				reconsider: 20
			},
			{
				label: "Stop close to station",
				condition: this.sotw_conditionIsMoving,
				behaviour: this.behaviourWaitHere,
				reconsider: 20
			},
			{
				label: "Request resupply ship",
				notcondition: this.sotw_conditionFreighterResupplierAssigned,
				behaviour: this.sotw_behaviourRequestResupply,
				reconsider: 60 // it'll take a while for one to get here, anyway
			},
			{
				label: "Carry out resupply transfers",
				condition: this.sotw_conditionFreighterResupplierDocked,
				behaviour: this.sotw_behaviourTransferResupply,
				reconsider: 60
			},
			{
				label: "Wait",
				behaviour: this.behaviourWaitHere,
				reconsider: 60
			}
		];
	};

	lib.prototype.sotw_templateMakeWitchspaceJump = function() {
		return [
			{
				label: "Complete witchspace countdown",
				condition: this.sotw_conditionWitchspaceCountdownComplete,
				behaviour: this.sotw_behaviourEnterWitchspace,
				reconsider: 5
			},
			{
				label: "Begin witchspace countdown",
				configuration: this.sotw_configurationBeginWitchspaceCountdown,
				behaviour: this.sotw_behaviourChargeWitchspaceDrive,
				reconsider: 15
			}
		];
	};

	lib.prototype.sotw_templateRefuelInFlight = function() {
		return [
			{
				// if refuelling countdown complete
				// set fuel to full and reconsider
				label: "Complete refuelling operation",
				condition: this.sotw_conditionRefuellingCountdownComplete,
				configuration: this.sotw_configurationRefuel,
				behaviour: this.behaviourWaitHere,
				reconsider: 5
			},
			{
				label: "Reach clear space and refuel",
				preconfiguration: this.sotw_configurationBeginRefuellingCountdown,
				condition: this.sotw_conditionInClearSpace,
				// if refuelling countdown not started, start it
				// if too near witchpoint, fly forwards
				configuration: this.sotw_configurationSetDestinationToClearSpace,
				behaviour: this.behaviourApproachDestination,
				reconsider: 60
			},
			{
				label: "Wait and refuel",
				// else stop and wait
				behaviour: this.behaviourWaitHere,
				reconsider: 60
			}
		];
	};

	lib.prototype.sotw_templateEscortMothership = function() {
		return [
			{
				behaviour: this.behaviourEscortMothership,
				reconsider: 60
			}
		];
	};

	/* Waypoint generators */

	lib.prototype.sotw_waypointsStationPatrol = function() {
		// needs to depend on station security level
		// stations with more ships on patrol can have more complex routes
		var patrol = this.ship.script.$sotwPatrolZoneNumber;
		var gs = this.ship.group.ships;
		var nums = [];
		var onpatrol = 1;
		// find patrol numbers for other ships in groups (1-indexed)
		for (var i=gs.length-1;i>=0;i--) {
			if (gs[i].AIScript.oolite_priorityai) {
				var pzn = gs[i].script.$sotwPatrolZoneNumber;
				if (pzn) {
					nums.push(pzn);
					onpatrol++;
				}
			}
		}
		// patrol can be > onpatrol if a ship disappears
		// so reorganise this one
		if (!patrol || patrol > onpatrol) {
			patrol = 1;
			while (nums.indexOf(patrol) != -1) {
				++patrol;
			}
			// patrol is now first free number
			this.ship.script.$sotwPatrolZoneNumber = patrol;
		}

		var station = this.ship.group.leader;
		
		// check length each time - will reorganise if ships lost
		var pos = pop._stationPatrolLocation(station,patrol,onpatrol);
		
		this.setParameter("oolite_waypointRange",500);
		this.setParameter("oolite_waypoint",pos);
	};

};