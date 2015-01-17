this.name = "SOTW Populator Script";

/* Populator set up */

// TODO: system populator and repopulator goes here

this.systemWillPopulate = function() {

	system.setPopulator("sotw-witchpoint",{
		callback: this._setupWitchpoints,
		priority: 5,
		location: "WITCHPOINT"
	});

	system.setPopulator("sotw-main-station",{
		callback: this._setupMainStation,
		priority: 10,
		location: "STATION_AEGIS"
	});

	

};

// every 20 seconds
this.systemWillRepopulate = function() {
	if (system.info.population > 10) {
		// 10 = uninhabited system
		this._repopulateShuttles();
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
	var shipStrength = system.info.government;
	var shipNumbers = system.info.government * 2;

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

};

this._launchShipFromStation = function(station, shipRole) {
	return station.launchShipWithRole(shipRole);
};

this._setUpShipAs = function(ship, primaryRole) {
	log(this.name,"Setting "+ship.displayName+" as "+primaryRole); 
	ship.primaryRole = primaryRole;
	if (ship.autoAI) {
		var ai = this.$aiMap[primaryRole];
		if (ai) {
			log(this.name,"Setting AI "+ai);
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
		var ship = system.addShips(shipRoleData.keyRole,1,position,1E3);
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
	
	var aspeed = speed/radius;
	var angle = clock.absoluteSeconds*aspeed;
	var sinx = vx.multiply(Math.sin(angle)*radius);
	var cosx = vy.multiply(Math.cos(angle)*radius);
	var pos = centre.add(sinx).add(cosx);

	return pos;
}

