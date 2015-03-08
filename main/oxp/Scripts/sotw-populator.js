this.name = "SOTW Populator Script";

/* Populator set up */

// TODO: system populator and repopulator goes here

this.systemWillPopulate = function() {

	// remake trade routes array
	this.$tradeRoutes = [];
	this.$tradeRouteTotalWeight = 0;
	if (system.info.sotw_economy_onroutes != "") {
		var routes = system.info.sotw_economy_onroutes.split(";");
		for (var i=0;i<routes.length;i++) {
			var route = routes[i].split(",");
			var rstart = route[0];
			var rend = route[route.length-1];
			var rscale = Math.min(
				System.infoForSystem(galaxyNumber,rstart).productivity,
				System.infoForSystem(galaxyNumber,rend).productivity,
				3E6 // no individual trade route bigger than 3E6 (match in planetinfo.js in the builder)
			);
			this.$tradeRouteTotalWeight += rscale;
			this.$tradeRoutes.push({
				start: rstart,
				end: rend,
				weight: rscale
			});
		}
	}
	log(this.name,"Trade route density "+this.$tradeRouteTotalWeight);

	system.setPopulator("sotw-witchpoint",{
		callback: this._setupWitchpoints.bind(this),
		priority: 5,
		location: "WITCHPOINT"
	});

	system.setPopulator("sotw-main-station",{
		callback: this._setupMainStation.bind(this),
		priority: 10,
		location: "STATION_AEGIS"
	});

	system.setPopulator("sotw-traderoute-freighters",{
		callback: this._setupFreighters.bind(this),
		priority: 10,
		location: "LANE_WP"
	});

};

// every 20 seconds
this.systemWillRepopulate = function() {
	if (system.info.population > 10) {
		// 10 = uninhabited planet, orbital only
		this._repopulateShuttles();
	}
	if (system.info.sotw_economy_onroutes != "") {
		// no point if there's no actual routes
		this._repopulateFreighters();
	}
};

// system populator utils

this._setupWitchpoints = function() {
	system.setWaypoint("witchpoint-primary",[0,0,0],[0,0,0,0],{
		size: 10E3,
		beaconCode: "W",
		beaconLabel: "Witchpoint"
	});

}.bind(this);


this._setupMainStation = function() {
	// step 1: realign main station so rightvector points at planet
	system.mainStation.orientation = new Quaternion().rotateY(Math.PI/2).multiply(system.mainStation.orientation);

	// step 2: patrols
	var shipStrength = system.info.sotw_system_stability;
	var shipNumbers = system.info.sotw_system_stability * 2;

	for (var i=1;i<=shipNumbers;i++) {
		var ships = this._addShipsToSpace(this._stationPatrolLocation(system.mainStation,i,shipNumbers),"sotw-fighter-superiority","sotw-station-defense-ship",1,shipStrength);
		// group the ship to the station, and set the patrol numbers
		if (ships) {
			var ship = ships[0];
			system.mainStation.group.addShip(ship);
			ship.group = system.mainStation.group;
			ship.script.$sotwFaction = system.mainStation.script.$sotwFaction;
			ship.script.$sotwPatrolZoneNumber = i;
			// make sure they don't all go off patrol at once!
			ship.script.$sotwPopulationPatrolAdjust = Math.random()*3E6;
		}
	}

	
}.bind(this);


this._repopulateShuttles = function() {
	// 16 - 2401 per five days
	var rate = (system.info.population*system.info.population*system.info.population*system.info.population/10000);
	// one every eight hours - one every three minutes
	// larger systems will require extra and multidock stations
	rate /= 21600; // (5*24*60*3)
	if (Math.random() < rate) {
		var stations = system.stations.filter(function(s) {
			return (s.position.distanceTo(system.mainPlanet) < system.mainPlanet.radius*4);
		});
		var station = stations[Math.floor(Math.random()*stations.length)];
		if (Math.random() < 0.5) {
			// launch from station
			this._launchShipsFromStation(station,"sotw-transport-insystem","sotw-shuttle",false,1,10);
		} else {
			// launch from planet
			this._launchShipsFromPlanet(system.mainPlanet,station.position.subtract(system.mainPlanet.position).direction(),"sotw-transport-insystem","sotw-shuttle",1,10);
		
		}
	}
}


this._setupFreighters = function(pos) {
	/* 3 million weight is one per hour, but a freighter will probably
	 * be in the system for several hours - cargo transfers probably
	 * take ~5 hours for a large freighter, and in-system travel could
	 * take a couple of hours too. So for a populated system, there's
	 * probably approximately one freighter in the system for every
	 * 0.5 million weight. */
	var fcount = this.$tradeRouteTotalWeight / 0.5E6;
	fcount *= 1+Math.random()-Math.random();
	while (fcount > 0) {
		// fractional bits
		if (Math.random() < fcount) {
			if (Math.random() < 0.25) {
				// somewhere between the witchpoint and the station
				var pos = system.mainStation.position.multiply(0.1+(Math.random()*0.9));
				this._addFreighter(pos);
			} else {
				// already at the station, being resupplied
				var dir = Vector3D.randomDirection();
				var f = this._addFreighter(system.mainStation.position.add(dir.multiply(12E3)));
				f.script.$sotwPersonalVector = dir;
				var r = this._addResupplyShip(system.mainStation.position.add(dir.multiply(12E3)),system.mainStation);
				r.position = f.position.add(f.vectorUp.multiply((f.boundingBox.y+r.boundingBox.y)/2));
				r.orientation = f.orientation;
				f.script.$sotwResupplyShip = r;
				r.script.$sotwResupplyTarget = f;
				f.addCollisionException(r);
				// debug
				r.displayName += " "+Math.floor(Math.random()*10000);
			}

		}
		fcount--;
	}

};


this._repopulateFreighters = function() {
	// top trade route is probably about 10 million weight
	// and ~1 every 20 minutes would be reasonable there
	// so 1 every 20 seconds would require about 600 million weight
	var trchance = this.$tradeRouteTotalWeight / 600E6;
//	log(this.name,"Freighter chance = 1/"+Math.floor(1/trchance));
	// an *average* trade route, though, is probably around 40 thousand weight
	// and gets one freighter every few days - these ships are *important*
	if (Math.random() < trchance) {
		this._addFreighter([0,0,0]);
	}
};


this._addFreighter = function(position) {
	// TODO: should decide route *first* and adjust the freighter
	// size accordingly - but that can wait until there's more than
	// one freighter
	var gsize = 60;
	// TODO: if the route *starts* here should handle it a bit differently
	var ship = this._addShipsToSpace(position,"sotw-freighter","sotw-long-range-trader",1,gsize)[0];
	if (ship) {
		
		var route = Math.random()*this.$tradeRouteTotalWeight;
		var acc = 0;
		for (var i=0;i<this.$tradeRoutes.length;i++) {
			acc += this.$tradeRoutes[i].weight;
			if (acc >= route) {
				ship.homeSystem = this.$tradeRoutes[i].start;
				ship.destinationSystem = this.$tradeRoutes[i].end;
//				log(this.name,"Freighter heading from "+System.infoForSystem(galaxyNumber,ship.homeSystem).name+" to "+System.infoForSystem(galaxyNumber,ship.destinationSystem).name);
				break;
			}
		}
		
		gsize -= ship.scriptInfo.sotw_npc_popval;
		while (gsize >= 3) {
			var eposition = ship.position.add(Vector3D.randomDirection(2000));
			var escort = this._addShipsToSpace(position,"sotw-fighter-escort","sotw-escort",1,gsize)[0];
			if (escort) {
				gsize -= escort.scriptInfo.sotw_npc_popval;
				
				escort.offerToEscort(ship);

			} else {
				break;
			}
		}

	}
	return ship;
};

this._addResupplyShip = function(position,station) {
	var ship = this._addShipsToSpace(position,"sotw-transport-insystem","sotw-freighter-resupply",1,10)[0];
//	log("Resupply ship","=>"+ship);
	station.group.addShip(ship);
	ship.group = station.group;
	ship.script.$sotwFaction = station.script.$sotwFaction;
	return ship;
};


// TODO: uninhabited system populator goes here


this.uninhabitedSystemWillPopulate = function() {
	
	system.setPopulator("sotw-witchpoint",{
		callback: this._setupWitchpoints,
		priority: 5,
		location: "WITCHPOINT"
	});

	system.setPopulator("sotw-main-station",{
		callback: function() {
			if (player.ship.dockedStation == system.mainStation) {
				// shouldn't be necessary
				player.ship.launch();
			}
			system.mainStation.remove();
		},
		priority: 10,
		location: "WITCHPOINT"
	});

}


// TODO: interstellar populator and repopulator goes here

// TODO: blank nova populator and repopulator goes here
// (unlikely to be necessary yet)

/* Utility functions */

this.$shipClassCache = {};
// like autoAI
this.$aiMap = {
	"sotw-station-defense-ship": "sotw-station-defenseAI.js",
	"sotw-station-defense-platform": "sotw-station-defenseAI.js",
	"sotw-shuttle": "sotw-orbital-shuttleAI.js",
	"sotw-escort": "sotw-escortAI.js",
	"sotw-long-range-trader": "sotw-traderoute-freighterAI.js",
	"sotw-freighter-resupply": "sotw-station-resupplyAI.js"
};

this._launchShipFromStation = function(station, shipRole) {
	return station.launchShipWithRole(shipRole);
};

this._setUpShipAs = function(ship, primaryRole) {
//	log(this.name,"Setting "+ship.displayName+" as "+primaryRole); 
	ship.primaryRole = primaryRole;
	if (ship.autoAI) {
		var ai = this.$aiMap[primaryRole];
		if (ai) {
//			log(this.name,"Setting AI "+ai);
			ship.setAI(ai);
		}
	}
};

this._buildClassCache = function(shipClass) {
	var keys = Ship.keysForRole(shipClass);
	var result = [];
	for (var i=0;i<keys.length;i++) {
		var entry = { 
			key: keys[i],
			keyRole: "["+keys[i]+"]",
			cost: Ship.shipDataForKey(keys[i]).script_info.sotw_npc_popval
		};
		result.push(entry);
	}
	$shipClassCache[shipClass] = result;
}

this._selectShipOfType = function(shipClass,maxValue) {
	if (!$shipClassCache[shipClass]) {
		this._buildClassCache(shipClass);
	}
	var opts = [];
	for (var i=0; i<$shipClassCache[shipClass].length; i++) {
		if ($shipClassCache[shipClass][i].cost < maxValue) {
			opts.push($shipClassCache[shipClass][i]);
		}
	}
	if (opts.length > 0) {
		return opts[Math.floor(Math.random()*opts.length)];
	}
	return false;
};

this._launchShipsFromStation = function(station,shipClass,shipRole,groupToStation,maxCount,maxValue) {
	var shipRoleData = this._selectShipOfType(shipClass,maxValue);
	if (!shipRoleData) { return false; }
	var shipsAllowed = Math.floor(maxValue / shipRoleData.cost);
	if (shipsAllowed > maxCount) {
		shipsAllowed = maxCount;
	}
	var spareVal = maxValue - shipsAllowed*shipRoleData.cost;
	var result = [];
	for (var i=0;i<shipsAllowed;i++) {
		var ship = this._launchShipFromStation(station,shipRoleData.keyRole);
		if (ship) {
			this._setUpShipAs(ship,shipRole);
			// TODO: use spareVal to upgrade ships if autoWeapons
			// can't upgrade a ship more than its initial popval
			result.push(ship);
			if (groupToStation) {
				station.group.addShip(ship);
				ship.group = station.group;
				ship.script.$sotwFaction = station.script.$sotwFaction;
			}
		}
	}
	return result;
};


this._launchGroupFromStation = function(station,shipClass,shipRole,maxCount,maxValue) {

};


this._launchEscortGroupFromStation = function(station,shipClass,shipRole,escortClass,maxCount,maxValue) {

};


this._launchShipsFromPlanet = function(planet,launchVector,shipClass,shipRole,maxCount,maxValue) {
	var shipRoleData = this._selectShipOfType(shipClass,maxValue);
	if (!shipRoleData) { return false; }
	var shipsAllowed = Math.floor(maxValue / shipRoleData.cost);
	if (shipsAllowed > maxCount) {
		shipsAllowed = maxCount;
	}
	var spareVal = maxValue - shipsAllowed*shipRoleData.cost;
	var result = [];
	var position = planet.position.add(launchVector.multiply(planet.radius+1E3));
	for (var i=0;i<shipsAllowed;i++) {
		var ship = system.addShips(shipRoleData.keyRole,1,position,1E2);
		if (ship && ship[0]) {
			ship[0].orientation = launchVector.rotationTo([0, 0, 1]);

			this._setUpShipAs(ship[0],shipRole);
			// TODO: use spareVal to upgrade ships if autoWeapons
			// can't upgrade a ship more than its initial popval
			result.push(ship[0]);
		}
	}
	return result;
};


this._addShipsToSpace = function(position,shipClass,shipRole,maxCount,maxValue) {
	var shipRoleData = this._selectShipOfType(shipClass,maxValue);
	if (!shipRoleData) { return false; }
	var shipsAllowed = Math.floor(maxValue / shipRoleData.cost);
	if (shipsAllowed > maxCount) {
		shipsAllowed = maxCount;
	}
	var spareVal = maxValue - shipsAllowed*shipRoleData.cost;
	var result = [];
	for (var i=0;i<shipsAllowed;i++) {
		var ship = system.addShips(shipRoleData.keyRole,1,position,1E3*i);
		if (ship && ship[0]) {
			this._setUpShipAs(ship[0],shipRole);
			// TODO: use spareVal to upgrade ships if autoWeapons
			// can't upgrade a ship more than its initial popval
			result.push(ship[0]);
		}
	}
	return result;
};


/* Coordinate utility functions */

this.$stationPatrolLocations = [
	[0],
	[0,0],
	[0,0,0],
	[0,0,1,1],
	[0,0,0,1,1], //5 
	[0,0,0,1,1,1],
	[0,0,2,2,1,1,1],
	[0,0,2,2,1,1,3,3],
	[0,0,0,2,2,1,1,3,3],
	[0,0,2,2,1,1,3,3,4,4], //10
	[0,0,2,2,1,1,3,3,3,4,4],
	[0,0,2,2,2,1,1,3,3,3,4,4],
	[0,0,2,2,2,1,1,1,3,3,3,4,4],
	[0,0,0,2,2,2,1,1,1,3,3,3,4,4],
	[0,0,0,2,2,2,1,1,1,3,3,3,4,4,4], // 15
	[0,0,0,2,2,2,1,1,1,3,3,3,4,4,5,5], // this high should never be needed
	[0,0,0,2,2,2,1,1,1,3,3,3,4,4,4,5,5], 
	[0,0,0,2,2,2,1,1,1,3,3,3,4,4,4,5,5,5]
];


this._stationPatrolLocation = function(station,patrolidx,outof) {
	var centre, speed, radius, vx, vy;

	var patrol = this.$stationPatrolLocations[outof-1][patrolidx-1];

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
	case 4:
		// planetary patrol
		centre = station.position.add(station.vectorRight.multiply(20E3));
		speed = 200;
		radius = 5E3;
		vx = station.vectorForward;
		vy = station.vectorUp;
		break;
	case 5:
		// docking patrol
		centre = station.position.add(station.vectorForward.multiply(10E3));
		speed = 200;
		radius = 5E3;
		vx = station.vectorRight;
		vy = station.vectorUp;
		break;
	}
	
	if (!vx) {
		log(this.name,"No vx: at "+station+" patrol "+patrolidx+" out of "+outof);
	}

	var aspeed = speed/radius;
	var angle = clock.absoluteSeconds*aspeed;
	var sinx = vx.multiply(Math.sin(angle)*radius);
	var cosx = vy.multiply(Math.cos(angle)*radius);
	var pos = centre.add(sinx).add(cosx);

	return pos;
}

