"use strict";

this.name = "SOTL Priority AI Extensions";

this.$factionTable = {
	"planetary" : {
		"planetary": 3,
		"independent": 0,
		"criminal": -3, 
		"player": 0
	},
	// TODO: stop using "independent" as a catch-all for traders
	"independent" : {
		"planetary": 1,
		"independent": 0,
		"criminal": -1,
		"player": 0
	},
	"criminal" : {
		"planetary": -2,
		"independent": -1,
		"criminal": 3,
		"player": -1
	}

};

this.startUp = function() {
	var lib = worldScripts["oolite-libPriorityAI"].PriorityAIController;
	var pop = worldScripts["SOTL Populator Script"];
	/* Conditions */

	lib.prototype.sotl_conditionDestinationIsNearby = function() {
		return this.ship.destination.distanceTo(this.ship) < 25000;
	}
	
	lib.prototype.sotl_conditionScannerContainsHostileFaction = function() {
		var scan = this.getParameter("oolite_scanResults");
		if (scan) {
			var f1 = this.ship.script.$sotlFaction;
			this.checkScannerWithPredicate(function(s) { 
				var f2 = s.script.$sotlFaction;
				if (f2 && f2 != f1) {
					var result = this.sotl_utilCompareFactions(f1,f2);
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

	lib.prototype.sotl_conditionScannerContainsRefusedSurrender = function() {
		var scan = this.getParameter("oolite_scanResults");
		if (scan) {
			var f1 = this.ship.script.$sotlFaction;
			this.checkScannerWithPredicate(function(s) { 
				var f2 = s.script.$sotlSurrenderFaction;
				// asked to surrender
				if (f2 && f2 == f1) {
					// hasn't surrendered
					if (!this.sotl_utilHasSurrendered(s)) {
						return true;
					}
				}
				return false;
			});
		} else {
			return false;
		}
	};


	lib.prototype.sotl_conditionScannerContainsIllegalActivity = function() {
		var scan = this.getParameter("oolite_scanResults");
		if (scan) {
			var f1 = this.ship.script.$sotlFaction;
			return this.checkScannerWithPredicate(function(s) { 
				if (this.sotl_utilHasSurrendered(s)) {
					// do not re-attack surrendered ships
					return false;
				}
				var f2 = s.script.$sotlFaction;
				if (f2 && f2 != f1) {
					var result = this.sotl_utilCompareFactions(f1,f2);
					log(this.ship,"Compared "+f1+" with "+f2+", got "+result);
					/* TODO: split s.bounty to allow this to be used
					 * other than by system station ships */
					if (result < 2 && s.bounty > 0) {
						return true;
					} 
					if (result == -3) {
						return true;
					}
					if (s.hasHostileTarget && result < 3) {
						var st = s.target;
						var stf = st.script.$sotlFaction;
						var result2 = this.sotl_utilCompareFactions(f1,stf);
						if (result2 > result) {
							// if we like their target more than we like them
							return true;
						}
					}
				}
				return false;
			});
			/* TODO: implement illegal goods, add check for smugglers */
		} else {
			return false;
		}
	};

	lib.prototype.sotl_conditionStationHasEnoughDefense = function() {
		// should have one patrolling ship per security level
		// (sotl_desiredSecurityLevel parameter) in some systems there
		// may be some stationary defense drones too, which will count
		// against this number
		var gs = this.ship.group.ships;
		var has = 0;
		for (var i=gs.length-1;i>=0;i--) {
			if (gs[i].primaryRole == "sotl-station-defense-ship" || gs[i].primaryRole == "sotl-station-defense-platform") {
				has++;
			}
		}
		return has >= this.getParameter("sotl_desiredSecurityLevel");
	};

	lib.prototype.sotl_conditionFreighterWantsToTrade = function() {
		return this.getParameter("sotl_freighterObjective") == "TRADE";
	};

	lib.prototype.sotl_conditionFreighterWantsToResupply = function() {
		return this.getParameter("sotl_freighterObjective") == "RESUPPLY";
	};

	lib.prototype.sotl_conditionFreighterWantsToTravel = function() {
		return this.getParameter("sotl_freighterObjective") == "TRAVEL";
	};

	lib.prototype.sotl_conditionFreighterWantsToSurvive = function() {
		return this.getParameter("sotl_freighterObjective") == "SURVIVE";
	};

	lib.prototype.sotl_conditionFreighterResupplierAssigned = function() {
		var re = this.getParameter("sotl_freighterResupplyShip");
		if (!re) {
			// initial population stage only
			re = this.ship.script.$sotlResupplyShip;
			if (re && re.isValid) {
				this.setParameter("sotl_freighterResupplyShip",re);
			}
		}
		if (re && re.isValid && (re.status == "STATUS_IN_FLIGHT" || re.status == "STATUS_LAUNCHING" || re.status == "STATUS_DOCKED")) {
			return true;
		} else if (re) {
			this.setParameter("sotl_freighterResupplyShip",null);
		}
		return false;
	};

	// freighter testing if the resupplier is docked
	lib.prototype.sotl_conditionFreighterResupplierDocked = function() {
		var re = this.getParameter("sotl_freighterResupplyShip");
		if (!re) {
			// initial population stage only
			re = this.ship.script.$sotlResupplyShip;
			if (re && re.isValid) {
				this.setParameter("sotl_freighterResupplyShip",re);
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
			this.setParameter("sotl_freighterResupplyShip",null);
		}
		return false;
	};

	// resupplier testing if the freighter is docked
	lib.prototype.sotl_conditionResupplierFreighterDocked = function() {
		var rt = this.ship.script.$sotlResupplyTarget;
		if (rt && rt.isValid && rt.status == "STATUS_IN_FLIGHT") {
			if (this.ship.speed == 0 && rt.speed == 0) {
				if (this.distance(rt) < this.ship.collisionRadius + rt.collisionRadius + 20) {
					if (this.ship.collisionExceptions.indexOf(rt) > -1) {
						return true;
					}
				}
			}
		} else if (rt) {
			this.setParameter("sotl_freighterResupplyShip",null);
		}
		return false;
	};


	lib.prototype.sotl_conditionNeedsResupply = function() {
		var sl = this.getParameter("sotl_resupplyLevel");
		return (sl > 0);
	};

	lib.prototype.sotl_conditionInResupplyRange = function() {
		var station = this.getParameter("oolite_selectedStation");
		if (station && this.distance(station) < 20E3)
		{
			var resupplyPoint = station.position.add(this.sotl_utilPersonalVector().multiply(10E3+station.collisionRadius));
			return (this.distance(resupplyPoint) < 2E3);
		}
		return false;
	};

	lib.prototype.sotl_conditionRefuellingStationExists = function() {
		var ss = system.stations;
		for (var i=0;i<ss.length;i++) {
			if (this.friendlyStation(ss[i])) {
				/* TODO: will eventually need condition about whether
				 * the station is open for general business */
				if (ss[i].market["sotl-fuel"].quantity > 0) {
					return true;
				}
			}
		}
		return false;
	};

	lib.prototype.sotl_conditionNearRefuellingStation = function() {
		var ss = system.stations;
		for (var i=0;i<ss.length;i++) {
			if (this.friendlyStation(ss[i])) {
				/* TODO: will eventually need condition about whether
				 * the station is open for general business */
				if (ss[i].market["sotl-fuel"].quantity > 0) {
					if (this.distance(ss[i]) < 20E3) {
						return true;
					}
				}
			}
		}
		return false;
	};

	lib.prototype.sotl_conditionLocalSpaceClear = function() {
		var nearby = system.filteredEntities(this, function(e) {
			return e!=this.ship && e.isShip && !(this.ship.escortGroup.containsShip(e) && this.distance(e) < 2.5E3);
		}, this.ship, 25E3);
		// must be nothing nearby except this ship's escorts/group,
		// and the escorts must be much closer
		return (nearby.length == 0);
	};


	lib.prototype.sotl_conditionMothershipUsingTorus = function() {
		var t = this.ship.group.leader.AIScript.oolite_priorityai.getParameter("sotl_torusEffect");
		return (t && t.isValid);
	};


	lib.prototype.sotl_conditionMainTradingStationExists = function() {
		/* TODO: more than just one station linked to main market */
		return this.friendlyStation(system.mainStation);
	};

	lib.prototype.sotl_conditionIsMoving = function() {
		return this.ship.speed > 0;
	};

	lib.prototype.sotl_conditionHasFuelForJump = function() {
		var next = this.getParameter("sotl_nextSystem");
		var dist = system.info.distanceToSystem(System.infoForSystem(galaxyNumber,next));
		return this.ship.fuel >= dist;
	};
	
	lib.prototype.sotl_conditionHasFuelAboard = function() {
		// TODO: actually track fuel carried
		return true;
	};

	lib.prototype.sotl_conditionHasSurrendered = function() {
		// if only own group around, cancel surrender state
		if (this.sotl_conditionInClearSpace()) {
			this.setParameter("sotl_surrendered",null);
			return false;
		}
		return this.getParameter("sotl_surrendered");
	};

	lib.prototype.sotl_conditionWitchspaceCountdownComplete = function() {
		var cstart = this.getParameter("sotl_witchspaceCountdownStarted");
		return (cstart && clock.absoluteSeconds - cstart > 15);
	};

	lib.prototype.sotl_conditionRefuellingCountdownComplete = function() {
		var cstart = this.getParameter("sotl_refuellingCountdownStarted");
		return ((cstart) && ((clock.absoluteSeconds - cstart) > 300));
	};

	lib.prototype.sotl_conditionInClearSpace = function() {
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

	lib.prototype.sotl_conditionHasResupplyMission = function() {
		var rtarget = this.ship.script.$sotlResupplyTarget;
		if (!rtarget || !rtarget.isValid) {
			return false;
		}
		if (this.getParameter("sotl_resupplyLevel") == 0 || rtarget.AIScript.oolite_priorityai.getParameter("sotl_resupplyLevel") == 0) {
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

	lib.prototype.sotl_conditionResupplyReadyToDock = function() {
		var rtarget = this.ship.script.$sotlResupplyTarget;
		var dest = this.sotl_utilDockingEndPosition(rtarget);
		// if either at start point or closer
		if (this.distance(dest) <= dest.distanceTo(this.sotl_utilDockingStartPosition(rtarget))+20) {
			// and facing the right way
			if (dest.subtract(this.ship.position).direction().dot(this.ship.vectorForward) > 0.999) {
				return true;
			}
		}
		return false;
	};

	lib.prototype.sotl_conditionResupplyAtDockingStartPoint = function() {
		var rtarget = this.ship.script.$sotlResupplyTarget;
		var dest = this.sotl_utilDockingStartPosition(rtarget);
		return this.distance(dest) < 5;
	};

	/* -- Controllers */

	lib.prototype.sotl_conditionHasController = function() {
		return (this.ship.script.$sotl_patrolControl && this.ship.script.$sotl_patrolControl.isInSpace);
	};

	lib.prototype.sotl_conditionControllerOrderIsIntercept = function() {
		var order = this.getParameter("sotl_currentControllerOrder");
		return order && order.order == "INTERCEPT";
	};

	lib.prototype.sotl_conditionControllerOrderIsCheck = function() {
		var order = this.getParameter("sotl_currentControllerOrder");
		return order && order.order == "CHECK";
	};

	lib.prototype.sotl_conditionCheckOrdersAreComplete = function() {
		var order = this.getParameter("sotl_currentControllerOrder");
		var target = order.target;
		if (order.order == "INTERCEPT")
		{
			// in case order has not yet been converted to CHECK order
			target = order.backup;
		}
		if (this.distance(target) < 10E3)
		{
			return true;
		}
	};

	lib.prototype.sotl_conditionControllerOrderIsDefend = function() {
		var order = this.getParameter("sotl_currentControllerOrder");
		return order && order.order == "DEFEND";
	};

	lib.prototype.sotl_conditionControllerOrderIsRecall = function() {
		var order = this.getParameter("sotl_currentControllerOrder");
		return order && order.order == "RECALL";
	};



	lib.prototype.sotl_conditionControllerReadyToSendTorusIntercept = function() {
		return this.getParameter("sotl_controllerScan") != null;
	};


	lib.prototype.sotl_conditionControllerHasSurplusPatrols = function() {
		// if more patrols than required are under local control
		if (this.ship.script.$sotl_patrolGroups.length > this.ship.script.$sotl_patrolsWanted) {
			var groups = this.ship.script.$sotl_patrolGroups;
			var orders = this.ship.script.$sotl_patrolGroupOrders;

			// if group 0 is not on active mission
			var gl = groups.length - 1;
			if (orders[groups[0].name].order == "RECALL" && this.distance(groups[0].ships[0]) < 25E3) {
				// and its replacement has arrived on station
				if (orders[groups[gl].name].order == "RECALL" && this.distance(groups[gl].ships[0]) < 25E3) {
					return true;
				}
			}
		}
		return false;
	};


	lib.prototype.sotl_conditionControllerHasInsufficientPatrols = function() {
		// if more patrols than required are under local control
		return (this.ship.script.$sotl_patrolGroups.length < this.ship.script.$sotl_patrolsWanted);
	};


	lib.prototype.sotl_conditionControllerHasOldPatrols = function() {
		// if more patrols than required are under local control
		return (this.ship.script.$sotl_lastPatrolChange + 3600 < clock.adjustedSeconds);
	};


	/* Configurations */

	lib.prototype.sotl_configurationMarkGroupMembersAsEscorts = function() {
		if (this.__ltcache.sotlGroupEscorts) {
			// don't need to recheck this every time - new group members
			// will be rare
			return;
		}
		this.__ltcache.sotlGroupEscorts = 1;
		var s = this.ship.group.ships;
		var eg = this.ship.escortGroup;
		for (var i=0;i<s.length;i++) {
			if (s[i] != this.ship && !eg.containsShip(s[i])) {
				var tmp = s[i].primaryRole;
				s[i].primaryRole = "sotl-escort-temp";
				// only needs to match when actually adding the escort
				eg.addShip(s[i]);
				s[i].primaryRole = tmp;
			}
		}
	};


	lib.prototype.sotl_configurationSetResupplyFinalDocking = function() {
		var rtarget = this.ship.script.$sotlResupplyTarget;
		this.ship.destination = this.sotl_utilDockingEndPosition(rtarget);
		this.ship.desiredRange = 5;
		var cspeed = this.cruiseSpeed();
		this.ship.desiredSpeed = Math.min(cspeed,50);
		// must add collision exception, or trying to fly to the
		// destination will also try to avoid this ship...
		this.ship.addCollisionException(rtarget);
	};

	lib.prototype.sotl_configurationSetResupplyMidDocking = function() {
		var rtarget = this.ship.script.$sotlResupplyTarget;
		if (this.ship.destination.distanceTo(this.sotl_utilDockingMidPosition(rtarget)) < 10 || this.ship.destination.distanceTo(this.sotl_utilDockingEndPosition(rtarget)) < 10) {
			this.ship.destination = this.sotl_utilDockingEndPosition(rtarget);
		} else {
			this.ship.destination = this.sotl_utilDockingMidPosition(rtarget);
		}
		this.ship.desiredRange = 5;
		var cspeed = this.cruiseSpeed();
		this.ship.desiredSpeed = Math.min(cspeed,50);
		// must add collision exception, or trying to fly to the
		// destination will also try to avoid this ship...
		this.ship.addCollisionException(rtarget);
	};

	lib.prototype.sotl_configurationSetResupplyBeginDocking = function() {
		var rtarget = this.ship.script.$sotlResupplyTarget;
		this.ship.destination = this.sotl_utilDockingStartPosition(rtarget);
		this.ship.desiredRange = 2;
		this.ship.desiredSpeed = this.cruiseSpeed();
		// remove collision exception if set earlier
		this.ship.removeCollisionException(rtarget);
	};


	// spread them out around the station, rather than having them all pile up
	// on the witchpoint side
	lib.prototype.sotl_configurationSetDestinationToResupplyPoint = function() {
		var station = this.getParameter("oolite_selectedStation");
		this.ship.destination = station.position.add(this.sotl_utilPersonalVector().multiply(10E3+station.collisionRadius));
		this.ship.desiredRange = 100;
		this.ship.desiredSpeed = this.cruiseSpeed();
	};

	lib.prototype.sotl_configurationSetDestinationToClearSpace = function() {
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

	lib.prototype.sotl_configurationSelectMainTradingStation = function() {
		// TODO: more options than this
		this.setParameter("oolite_selectedStation",system.mainStation);
	};

	lib.prototype.sotl_configurationSelectRefuellingStation = function() {
		var opts = [];
		var ss = system.stations;
		for (var i=0;i<ss.length;i++) {
			if (this.friendlyStation(ss[i])) {
				if (ss[i].market["sotl-fuel"].quantity > 0) {
					opts.push(ss[i]);
				}
			}
		}
		if (ss.length > 0) {
			this.setParameter("oolite_selectedStation",opts[Math.floor(Math.random()*opts.length)]);
		}
	};

	lib.prototype.sotl_configurationSetTradeRouteNextSystem = function() {
		var next = this.getParameter("sotl_nextSystem");
		if (next === null || next == system.ID) {
			var routes = system.info.sotl_economy_onroutes.split(";");
			for (var i=0;i<routes.length;i++) {
				var route = routes[i].split(",");
				if (parseInt(route[route.length-1]) == this.ship.destinationSystem) {
					for (var j=0;j<route.length;j++) {
						if (route[j] == system.ID) {
							this.setParameter("sotl_nextSystem",route[j+1]);
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

	lib.prototype.sotl_configurationFreighterNewTradeRoute = function() {
		this.setParameter("sotl_freighterObjective","TRAVEL");
		this.ship.homeSystem = system.ID;
		
		var exports = system.info.sotl_economy_exportsto.split(";");
		if (system.info.sotl_economy_exportsto.split != "") {
			this.ship.destinationSystem = parseInt(exports[Math.floor(Math.random()*exports.length)]);
		} else {
			var dist = 7;
			do {
				var systems = system.info.systemsInRange(dist);
				for (var i=0;i<systems.length;i++) {
					if (systems[i].sotl_economy.exportsto != "") {
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

	lib.prototype.sotl_configurationFreighterAbortMission = function() {
		this.setParameter("sotl_freighterObjective","SURVIVE");
	};

	lib.prototype.sotl_configurationFreighterObjectiveTravel = function() {
		this.setParameter("sotl_freighterObjective","TRAVEL");
	};

	lib.prototype.sotl_configurationBeginWitchspaceCountdown = function() {
		// also discards stale countdowns
		if (!this.getParameter("sotl_witchspaceCountdownStarted") || this.getParameter("sotl_witchspaceCountdownStarted") - clock.absoluteSeconds > 60) {
			this.setParameter("sotl_witchspaceCountdownStarted",clock.absoluteSeconds);
		}
		this.ship.destination = this.ship.position.add(this.ship.vectorForward.multiply(1E6));
		this.ship.desiredSpeed = this.cruiseSpeed();
		this.ship.desiredRange = 1E3;
	};

	lib.prototype.sotl_configurationBeginRefuellingCountdown = function() {
		// also discards stale countdowns
		if (!this.getParameter("sotl_refuellingCountdownStarted") || this.getParameter("sotl_refuellingCountdownStarted") - clock.absoluteSeconds > 900) {
			this.setParameter("sotl_refuellingCountdownStarted",clock.absoluteSeconds);
		}
	};

	lib.prototype.sotl_configurationRefuel = function() {
		/* TODO: consume a tonne of fuel from hold to do this */
		this.ship.fuel = 7;
	}


	lib.prototype.sotl_configurationSetDestinationToController = function() {
		var centre = this.ship.script.$sotl_patrolControl.position;
		// spread out of masslock range ready to intercept
		// matches sotl-populator setupCheckpointPatrols
		/* TODO: currently only works for controllers guarding the positive z-axis */
		this.ship.destination = centre.add([40000*Math.sin(this.ship.entityPersonality),40000*Math.cos(this.ship.entityPersonality),-15000]);
		this.ship.desiredRange = 1000;
		this.ship.desiredSpeed = this.cruiseSpeed();
	}

	lib.prototype.sotl_configurationSetDestinationToControllerClose = function() {
		this.ship.destination = this.ship.script.$sotl_patrolControl;
		this.ship.desiredRange = 5000;
		this.ship.desiredSpeed = this.cruiseSpeed();
	}

	lib.prototype.sotl_configurationSetDestinationToCheckPosition = function() {
		var order = this.getParameter("sotl_currentControllerOrder");
		this.ship.destination = order.target;
		this.ship.desiredRange = 5000;
		this.ship.desiredSpeed = this.cruiseSpeed();
	}

	lib.prototype.sotl_configurationSetDestinationToInterceptPosition = function() {
		var order = this.getParameter("sotl_currentControllerOrder");
		log(this.name,"Patrol at "+this.ship.position+" executing intercept of "+order.target);
		if (order.target.isValid) {
			if (order.target.isPlayer) {
				this.ship.destination = order.target.position.add(order.target.vectorForward.multiply(order.target.speed*5));
			} else {
				this.ship.destination = order.target.position.add(order.target.script.$ship.vectorForward.multiply(order.target.script.$speed*5));
			}
		} else {
			this.ship.destination = order.backup;
		}
		this.ship.desiredRange = 5000;
		this.ship.desiredSpeed = this.cruiseSpeed();
	}


	lib.prototype.sotl_configurationGetControllerOrder = function() {
		var ctl = this.ship.script.$sotl_patrolControl.script.$sotl_patrolGroupOrders;
		var gn = this.ship.group.name;
		this.setParameter("sotl_currentControllerOrder",ctl[gn]);
	};

	lib.prototype.sotl_configurationControllerValidateGroups = function() {
		var groups = this.ship.script.$sotl_patrolGroups;
		var orders = this.ship.script.$sotl_patrolGroupOrders;
		for (var i=groups.length-1;i>=0;i--) {
//			log(this.name,"Controller at "+this.ship.position+" is controlling group "+groups[i].name);
			if (groups[i].count == 0) {
				// clean up empty groups
				delete orders[groups[i].name];
				groups.splice(i,1);
			} else if (!orders[groups[i].name]) {
				// ensure some orders specified for all groups
				orders[groups[i].name] = { order: "RECALL" };
			} else if (orders[groups[i].name].order == "INTERCEPT") {
				// manage intercept orders
				var target = orders[groups[i].name].target;
				if (!target.isValid || (target.isPlayer && !target.torusEngaged)) {
					// convert to check if torus effect ends
					orders[groups[i].name] = { order: "CHECK", target: orders[groups[i].name].backup };
				} else if (this.distance(target) > 750E3) {
					// getting too far away - give up pursuit
					// to avoid running into a trap
					orders[groups[i].name] = { order: "RECALL" };
				} else {
					// otherwise take a position backup in case it ends later
					orders[groups[i].name].backup = orders[groups[i].name].target.position;
				}
			}
		}
		
	}


	lib.prototype.sotl_configurationControllerScanForTorusForCheckpoint = function() {
		var objects = system.allVisualEffects;
		if (player.ship.torusEngaged) {
			objects.push(player.ship);
		}
		log(this.name,"Pre-scan check gives "+objects.length+" objects");

		var groups = this.ship.script.$sotl_patrolGroups;
		var orders = this.ship.script.$sotl_patrolGroupOrders;
		var tracked = [];
		for (var i=groups.length-1;i>=0;i--) {
			if (orders[groups[i].name].order == "INTERCEPT" && orders[groups[i].name].target) {
				tracked.push(orders[groups[i].name].target);
			}
		}

		for (var i=0;i<objects.length;i++) {
			var object = objects[i];
			if ((object.dataKey == "sotl-torus-effect" && object.script.$ship.script.$sotlFaction != this.ship.script.$sotlFaction) || object.isPlayer) {
				// intercept within 500km, if not known already
				if (this.distance(object.position) < 500E3) {
					log(this.name,"Controller at "+this.ship.position+" assessing sensor trace at "+object.position);
					// don't *start* intercepts of ships which have
					// passed the checkpoint
					if (object.position.z < this.ship.position.z) {
//						log(this.name,"...is outwards");
						// and ignore ones heading outbound
						if (object.orientation.vectorForward().z > 0) {
//							log(this.name,"...and heading inwards");
							// and ignore ones already being intercepted
							if (tracked.indexOf(object) == -1) {
//								log(this.name,"...and not already tracked");
								this.setParameter("sotl_controllerScan",object);
								return;
							}
						}
					}
				}
			}
		}
		this.setParameter("sotl_controllerScan",null);
	}

	/* Behaviours */

	// use instead of destroy in almost all circumstances
	lib.prototype.sotl_behaviourDisableCurrentTarget = function() {
		this.setParameter("oolite_witchspaceEntry",null);

		var handlers = {};
		this.responsesAddStandard(handlers);
		this.applyHandlers(handlers);
		var target = this.ship.target
		if (!target || !target.isValid || !target.isShip)
		{
			this.reconsiderNow();
			return;
		}

		if (this.getParameter("oolite_flag_noSpecialThargoidReaction") != null)
		{
			if (this.ship.scanClass != "CLASS_THARGOID" && target.scanClass != "CLASS_THARGOID" && target.target.scanClass == "CLASS_THARGOID")
			{
				this.respondToThargoids(target.target,true);
				this.ship.performAttack();
				return;
			}
		}

		if (this.sotl_utilHasSurrendered(target))
		{
			// succeeded
			if (this.ship.escortGroup)
			{
				// also tell escorts to stop attacking it
				for (var i = 0 ; i < this.ship.escortGroup.ships.length ; i++)
				{
					this.ship.escortGroup.ships[i].removeDefenseTarget(target);
					if (this.ship.escortGroup.ships[i].target == target)
					{
						this.ship.escortGroup.ships[i].target = null;
					}
				}
			}
			this.ship.removeDefenseTarget(target);
			this.ship.target = null;
		}
		else
		{
			if (!this.ship.hasHostileTarget)
			{
				// entering attack mode
				this.broadcastAttackMessage(this.ship.target,"beginning",3);
				this.ship.requestHelpFromGroup();
			}
			else if (this.ship.target)
			{
				this.broadcastAttackMessage(this.ship.target,"continuing",4);
			}
			if (this.ship.energy == this.ship.maxEnergy && this.getParameter("oolite_flag_escortsCoverRetreat") && this.ship.escortGroup.count > 1)
			{
				// if has escorts, and is not yet taking damage, run and let
				// the escorts take them on
				this.ship.performFlee();
				return;
			}
			this.ship.performAttack();
		}

	};


	lib.prototype.sotl_behaviourSurrender = function() {
		this.ship.target = null;
		this.ship.clearDefenseTargets();

		var handlers = {};
		this.responsesAddStandard(handlers);
		this.applyHandlers(handlers);
		this.communicate("sotl_surrender",null,1);
		this.performStop();
	};

	lib.prototype.sotl_behaviourDemandTargetSurrender = function() {
		this.ship.target.script.$sotlSurrenderFaction = this.ship.script.$sotlFaction;

		var handlers = {};
		this.responsesAddStandard(handlers);
		this.applyHandlers(handlers);
		this.communicate("sotl_demandSurrender",null,1);
		/* TODO: make target aware of demand without immediately
		 * attacking */
		this.ship.performAttack();
	};


	lib.prototype.sotl_behaviourSurviveCombat = function() {
		if (this.ship.energy < 64) {
			if (this.ship.hasEquipmentProviding("EQ_ESCAPE_POD")) {
				this.ship.abandonShip();
			} else {
				this.setParameter("sotl_surrendered",true);
				this.ship.target = null;
				this.ship.clearDefenseTargets();

				var handlers = {};
				this.responsesAddStandard(handlers);
				this.applyHandlers(handlers);
				this.communicate("sotl_surrender",null,1);
				this.ship.performStop();
			}
		} else {
			// try to flee
			this.behaviourFleeCombat();
		}
	};


	lib.prototype.sotl_behaviourChargeWitchspaceDrive = function() {
		// for now, just fly forward-ish
		this.behaviourApproachDestination();
	};

	lib.prototype.sotl_behaviourEnterWitchspace = function() {
		var destID = this.getParameter("sotl_nextSystem");
		var result = this.ship.exitSystem(destID);
		this.setParameter("sotl_witchspaceCountdownStarted",null);
		// if it doesn't, we'll get blocked
		if (result)
		{
			this.ship.notifyGroupOfWormhole();
		}
		var handlers = {};
		this.responsesAddStandard(handlers);
		this.applyHandlers(handlers);
	};

	lib.prototype.sotl_behaviourRequestResupply = function() {
		var s = this.getParameter("oolite_selectedStation");
		if (s.alertCondition > 1) {
			// not right now!
			return;
		}
		var resupply = pop._launchShipsFromStation(s,"sotl-transport-insystem","sotl-freighter-resupply",true,1,10)[0];
		if (resupply) {
			this.setParameter("sotl_freighterResupplyShip",resupply);
			resupply.script.$sotlResupplyTarget = this.ship;
		}
		var handlers = {};
		this.responsesAddStandard(handlers);
		this.applyHandlers(handlers);
	};


	lib.prototype.sotl_behaviourTransferResupply = function() {
		var needs = this.getParameter("sotl_resupplyLevel");
		var resupply = this.getParameter("sotl_freighterResupplyShip");
		var has = resupply.AIScript.oolite_priorityai.getParameter("sotl_resupplyLevel");
		if (needs > 0 && has > 0) {
			// transfer one unit of cargo
			// TODO: actually swap hold cargo based on what this ship wants
			this.setParameter("sotl_resupplyLevel",needs-1);
			resupply.AIScript.oolite_priorityai.setParameter("sotl_resupplyLevel",has-1);
			// and start refuelling
			this.sotl_configurationBeginRefuellingCountdown();
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

	lib.prototype.sotl_behaviourPriorityFaceDestinationForResupplyDock = function() {
		// face destination, ignoring everything else until done
		var handlers = {
			shipNowFacingDestination : function() {
				this.reconsiderNow();
			}
		};
		this.applyHandlers(handlers);
		this.ship.performFaceDestination();
	};


	lib.prototype.sotl_behaviourTorusToDestination = function() {
		var t = this.getParameter("sotl_torusEffect");
		if (!(t&&t.isValid)) {
			var torus = system.addVisualEffect("sotl-torus-effect",this.ship.position);
			torus.script.$destination = this.ship.destination;
			torus.script.$ship = this.ship;
			torus.script.$maxSpeed = this.ship.maxSpeed * 32;
			this.setParameter("sotl_torusEffect",torus);
		} else {
			t.script.$destination = this.ship.destination;
		}
		var handlers = {};
		this.responsesAddStandard(handlers);
		this.applyHandlers(handlers);
		this.ship.performFaceDestination();
	};


	lib.prototype.sotl_behaviourEscortTorus = function() {
		var handlers = {};
		this.responsesAddStandard(handlers);
		this.applyHandlers(handlers);
		this.ship.performStop();
	};

	/* -- Controller behaviours */

	lib.prototype.sotl_behaviourControllerSetDefend = function() {
		var handlers = {};
		this.responsesAddStandard(handlers);
		this.applyHandlers(handlers);

		var groups = this.ship.script.$sotl_patrolGroups;
		var orders = this.ship.script.$sotl_patrolGroupOrders;
		for (var i=0;i<groups.length;i++) {
			orders[groups[i].name] = { order: "DEFEND" };
		}
	};


	lib.prototype.sotl_behaviourControllerSendTorusIntercept = function() {
		var handlers = {};
		this.responsesAddStandard(handlers);
		this.applyHandlers(handlers);

		var target = this.getParameter("sotl_controllerScan");

		var groups = this.ship.script.$sotl_patrolGroups;
		var orders = this.ship.script.$sotl_patrolGroupOrders;
		for (var i=0;i<groups.length;i++) {
			if (orders[groups[i].name].order == "RECALL" && this.distance(groups[i].ships[0]) < 60E3) {
				// find a nearby one on recall orders and send it
				log(this.name,"Checkpoint at "+this.ship.position+" sending intercept to "+target.script.$ship+" at "+target.position);
				orders[groups[i].name] = { order: "INTERCEPT", target: target, backup: target.position };
				// force reconsideration
				groups[i].ships[0].AIScriptWakeTime = clock.seconds;
				break;
			}
		}
		// can't find one? will have to wait until can find one
	}
	

	lib.prototype.sotl_behaviourControllerReleaseOnePatrol = function() {
		var handlers = {};
		this.responsesAddStandard(handlers);
		this.applyHandlers(handlers);

		var groups = this.ship.script.$sotl_patrolGroups;
		var release = groups[0];
		groups.splice(0,1); // remove group from list
		// orders list will be cleaned up automatically
		// delink the ships from the controller
		for (var i=0;i<release.ships.length;i++) {
			delete release.ships[i].script.$sotl_patrolControl;
		}
	};


	lib.prototype.sotl_behaviourControllerRequestOnePatrol = function() {
		var handlers = {};
		this.responsesAddStandard(handlers);
		this.applyHandlers(handlers);
		
		var group = pop._launchNewCheckpointPatrol();
		var groups = this.ship.script.$sotl_patrolGroups;
		var orders = this.ship.script.$sotl_patrolGroupOrders;
		groups.push[group];
		orders[group.name] = { order: "RECALL" };

		for (var i=0;i<group.ships.length;i++) {
			group.ships[i].script.$sotl_patrolControl = this.ship;
		}
	};

	lib.prototype.sotl_behaviourSetRecallOrdersForSelf = function() {
		var handlers = {};
		this.responsesAddStandard(handlers);
		this.applyHandlers(handlers);
		
		var ctl = this.ship.script.$sotl_patrolControl.script.$sotl_patrolGroupOrders;
		var gn = this.ship.group.name;
		ctl[gn] = { order: "RECALL" };
	};


	/* -- Station behaviours */

	lib.prototype.sotl_behaviourStationFight = function() {
		if (!this.__ltcache.sotl_launched_ship) {
			if (this.ship.script.$defenseShipCounter > 0) {
				this.sotl_utilLaunchDefenseShips();
			}
		}
		var handlers = {};
		this.responsesAddStation(handlers);
		this.applyHandlers(handlers);
	};

	lib.prototype.sotl_behaviourStationRespondToDistressCall = function() {
		// check factions of both parties, then take action
		var aggressor = this.getParameter("oolite_distressAggressor");
		var sender = this.getParameter("oolite_distressSender");
		var f1 = this.ship.script.$sotlFaction;
		var fa = aggressor.script.$sotlFaction;
		var fs = sender.script.$sotlFaction;
		var coma = this.sotl_utilCompareFactions(f1,fa);
		var coms = this.sotl_utilCompareFactions(f1,fs);
		if (coma > coms) {
			// reverse the two
			var tmp = sender;
			sender = aggressor;
			aggressor = tmp;
			tmp = coms;
			coms = coma;
			coma = tmp;
		}
		log(this.name,"Station to responding to distress call: Sender "+sender+" has faction "+coms+", Aggressor "+aggressor+" has faction "+coma);
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
	
	lib.prototype.sotl_behaviourStationWarnOrAttackHostileFaction = function() {
		var f1 = this.ship.script.$sotlFaction;
		var f2 = this.ship.target.script.$sotlFaction;
		var compare = this.sotl_utilCompareFactions(f1,f2);
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
				this.sotl_utilWarnTarget();
			}
		}
		var handlers = {};
		this.responsesAddStation(handlers);
		this.applyHandlers(handlers);
	};

	lib.prototype.sotl_behaviourStationLaunchSalvager = function() {
		if (this.ship.script.$salvageShipCounter > 0) {
			this.sotl_utilLaunchSalvageShip();
		}
		var handlers = {};
		this.responsesAddStation(handlers);
		this.applyHandlers(handlers);
	};

	lib.prototype.sotl_behaviourStationLaunchDefense = function() {
		if (!this.__ltcache.sotl_launched_ship) {
			if (this.ship.script.$defenseShipCounter > 0) {
				this.sotl_utilLaunchDefenseShips();
			}
		}
		// TODO: if total defense ship count is too low
		// then may initiate an "escort the refill" mission
		var handlers = {};
		this.responsesAddStation(handlers);
		this.applyHandlers(handlers);
	};

	lib.prototype.sotl_behaviourStationIdle = function() {
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
	lib.prototype.sotl_utilCompareFactions = function(f1,f2) {
		if (f1 == f2) { return 3; }
		if (worldScripts["SOTL Priority AI Extensions"].$factionTable[f1][f2]) {
			return worldScripts["SOTL Priority AI Extensions"].$factionTable[f1][f2];
		}
		return 0; // temp
	};

	lib.prototype.sotl_utilLaunchDefenseShips = function() {
		this.__ltcache.sotl_launched_ship = 1;
		var attempt = Math.min(3,this.ship.script.$defenseShipCounter);
		var ships = pop._launchShipsFromStation(this.ship,"sotl-fighter-superiority","sotl-station-defense-ship",true,attempt,attempt*this.getParameter("sotl_defenseShipStrength"));
		if (ships) {
			this.ship.script.$defenseShipCounter -= ships.length;
		}
	};

	lib.prototype.sotl_utilLaunchSalvageShips = function() {
		this.__ltcache.sotl_launched_ship = 1;
		// TODO: actually launch ships
	};

	lib.prototype.sotl_utilWarnTarget = function() {
		// TODO: actually warn target
	};

	lib.prototype.sotl_utilPersonalVector = function() {
		var v = this.getParameter("sotl_personalVector");
		if (!v) {
			v = Vector3D.randomDirection();
			this.setParameter("sotl_personalVector",v);
		}
		return v;
	};

	lib.prototype.sotl_utilDockingStartPosition = function(ship) {
		return this.sotl_utilDockingEndPosition(ship).add(ship.vectorForward.multiply(-1*(ship.boundingBox.z+this.ship.boundingBox.z+500)));
	};

	// this is used to get the turning to face destination right for ship
	// orientation
	lib.prototype.sotl_utilDockingMidPosition = function(ship) {
		return this.sotl_utilDockingEndPosition(ship).add(ship.vectorUp.multiply(500));
	};

	lib.prototype.sotl_utilDockingEndPosition = function(ship) {
		return ship.position.add(ship.vectorUp.multiply((ship.boundingBox.y+this.ship.boundingBox.y)/2));
	};

	lib.prototype.sotl_utilHasSurrendered = function(ship) {
		if (ship.isPlayer) {
			log(this.ship,"Assessing player surrender: "+(ship.speed == 0 && !ship.weaponsOnline));
			// TODO: allow explicit surrender
			return ship.speed == 0 && !ship.weaponsOnline
		} else {
			return ship.AIScript.oolite_priorityai.getParameter("sotl_surrendered") || ship.isHulk;
		}
	};


	// Core utility override
	lib.prototype.friendlyStation = function(station) {
		var f1 = this.ship.script.$sotlFaction;
		var f2 = station.script.$sotlFaction;
		var compare = this.sotl_utilCompareFactions(f1,f2);
		return compare >= 0;
	};

	// Core utility override
	lib.prototype.hostileStation = function(station) {
		var f1 = this.ship.script.$sotlFaction;
		var f2 = station.script.$sotlFaction;
		var compare = this.sotl_utilCompareFactions(f1,f2);
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
			var relation = this.sotl_utilCompareFactions(this.ship.script.$sotlFaction,player.ship.script.$sotlFaction);
			if (relation >= 1) {
				// only allow one!
				this.setParameter("oolite_playerFriendlyFireAlready",true);
				return true;
			}
		}
		return false;
	}

	/* Templates */

	lib.prototype.sotl_templateApproachStation = function() {
		return [
			{
				label: "Approach station",
				configuration: this.configurationSetDestinationToSelectedStation,
				truebranch: this.sotl_templateTravelToDestination()
			}
		];
	};


	lib.prototype.sotl_templateTravelToDestination = function() {
		return [
			{
				label: "Approach destination normally",
				notcondition: this.sotl_conditionLocalSpaceClear,
				behaviour: this.behaviourApproachDestination,
				reconsider: 30
			},
			{
				// don't use torus for short journeys
				label: "Destination nearby",
				condition: this.sotl_conditionDestinationIsNearby,
				behaviour: this.behaviourApproachDestination,
				reconsider: 30
			},
			{
				label: "Approach destination on torus",
				behaviour: this.sotl_behaviourTorusToDestination,
				reconsider: 30
			}
		];
	};


	/* Like traveltodestination, but with much faster reconsideration */
	lib.prototype.sotl_templateTravelToIntercept = function() {
		return [
			{
				label: "Approach destination normally",
				notcondition: this.sotl_conditionLocalSpaceClear,
				behaviour: this.behaviourApproachDestination,
				reconsider: 5
			},
			{
				label: "Approach destination on torus",
				behaviour: this.sotl_behaviourTorusToDestination,
				reconsider: 5
			}
		];
	};


	lib.prototype.sotl_templateReturnToBase = function()
	{
		return [
			{
				label: "Return to base",
				condition: this.conditionHasSelectedStation,
				truebranch: [
					{
						condition: this.conditionSelectedStationNearby,
						configuration: this.configurationSetSelectedStationForDocking,
						behaviour: this.behaviourDockWithStation,
						reconsider: 30
					},
					{
						configuration: this.configurationSetDestinationToSelectedStation,
						truebranch: this.sotl_templateTravelToDestination()
					}
				],
				falsebranch: [
					{
						condition: this.conditionFriendlyStationExists,
						configuration: this.sotl_configurationSelectFriendlyStation,
						behaviour: this.behaviourReconsider
					},
					{
						condition: this.conditionHasSelectedPlanet,
						truebranch: [
							{
								preconfiguration: this.configurationSetDestinationToSelectedPlanet,
								condition: this.conditionNearDestination,
								behaviour: this.behaviourLandOnPlanet
							},
							{
								truebranch: this.sotl_templateTravelToDestination()
							}
						]
					},
					{
						condition: this.conditionPlanetExists,
						configuration: this.configurationSelectPlanet,
						behaviour: this.behaviourReconsider
					}
				]
			},
			/* 
			{
			TODO: fallback for no station or planet
			}
			*/
		];


	};


	lib.prototype.sotl_templateResupplyOperation = function() {
		/* 1) Come to complete stop
		 * 2) If no resupplier, request one
		 * 3) If resupplier docked, transfer one unit of resupply
		 * 4) Otherwise wait
		 */
		return [
			{
				label: "Approach designated resupply point",
				notcondition: this.sotl_conditionInResupplyRange,
				configuration: this.sotl_configurationSetDestinationToResupplyPoint,
				behaviour: this.behaviourApproachDestination,
				reconsider: 20
			},
			{
				label: "Stop close to station",
				condition: this.sotl_conditionIsMoving,
				behaviour: this.behaviourWaitHere,
				reconsider: 20
			},
			{
				label: "Request resupply ship",
				notcondition: this.sotl_conditionFreighterResupplierAssigned,
				behaviour: this.sotl_behaviourRequestResupply,
				reconsider: 60 // it'll take a while for one to get here, anyway
			},
			{
				label: "Carry out resupply transfers",
				condition: this.sotl_conditionFreighterResupplierDocked,
				behaviour: this.sotl_behaviourTransferResupply,
				reconsider: 60
			},
			{
				label: "Wait",
				behaviour: this.behaviourWaitHere,
				reconsider: 60
			}
		];
	};

	lib.prototype.sotl_templateMakeWitchspaceJump = function() {
		return [
			{
				label: "Complete witchspace countdown",
				condition: this.sotl_conditionWitchspaceCountdownComplete,
				behaviour: this.sotl_behaviourEnterWitchspace,
				reconsider: 5
			},
			{
				label: "Begin witchspace countdown",
				configuration: this.sotl_configurationBeginWitchspaceCountdown,
				behaviour: this.sotl_behaviourChargeWitchspaceDrive,
				reconsider: 15
			}
		];
	};

	lib.prototype.sotl_templateRefuelInFlight = function() {
		return [
			{
				// if refuelling countdown complete
				// set fuel to full and reconsider
				label: "Complete refuelling operation",
				condition: this.sotl_conditionRefuellingCountdownComplete,
				configuration: this.sotl_configurationRefuel,
				behaviour: this.behaviourWaitHere,
				reconsider: 5
			},
			{
				label: "Reach clear space and refuel",
				preconfiguration: this.sotl_configurationBeginRefuellingCountdown,
				condition: this.sotl_conditionInClearSpace,
				// if refuelling countdown not started, start it
				// if too near witchpoint, fly forwards
				configuration: this.sotl_configurationSetDestinationToClearSpace,
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

	lib.prototype.sotl_templateEscortMothership = function() {
		return [
			{
				condition: this.sotl_conditionMothershipUsingTorus,
				behaviour: this.sotl_behaviourEscortTorus,
				reconsider: 5
			},
			{
				behaviour: this.behaviourEscortMothership,
				reconsider: 60
			}
		];
	};

	/* Waypoint generators */

	lib.prototype.sotl_waypointsStationPatrol = function() {
		// needs to depend on station security level
		// stations with more ships on patrol can have more complex routes
		var patrol = this.ship.script.$sotlPatrolZoneNumber;
		var gs = this.ship.group.ships;
		var nums = [];
		var onpatrol = 1;
		// find patrol numbers for other ships in groups (1-indexed)
		for (var i=gs.length-1;i>=0;i--) {
			if (gs[i].AIScript.oolite_priorityai) {
				var pzn = gs[i].script.$sotlPatrolZoneNumber;
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
			this.ship.script.$sotlPatrolZoneNumber = patrol;
		}

		var station = this.ship.group.leader;
		
		// check length each time - will reorganise if ships lost
		var pos = pop._stationPatrolLocation(station,patrol,onpatrol);
		
		this.setParameter("oolite_waypointRange",500);
		this.setParameter("oolite_waypoint",pos);
	};

};