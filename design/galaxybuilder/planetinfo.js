/** Planet information data store
 * Methods so far: 
 * set(galaxy,system,property,value)
 * get(galaxy,system,property)
 *
 * Lots more methods will be needed later
 *
 */
"use strict";

(function() {

	var planetdata = [[],[],[],[],[],[],[],[]];

	var $plist = function(k,v) {
		console.log("\t\""+k+"\" = \""+v+"\";");
	}

	for (var g=0;g<8;g++) {
		for (var i=0;i<256;i++) {
			planetdata[g][i] = {};
		}
	}

	var planetinfo = {};

	planetinfo.$debug = 0;

	planetinfo.galaxies = 8;
	planetinfo.systems = 256;

	planetinfo.set = function(g,s,p,v) {
		planetdata[g][s][p] = v;
	};

	planetinfo.get = function(g,s,p) {
		return planetdata[g][s][p];
	};


	var $buildConnectivity = function(g) {
		var distance = function(s1,s2) {
			var dx = planetdata[g][s1].coordinates[0] - planetdata[g][s2].coordinates[0];
			var dy = Math.floor((planetdata[g][s1].coordinates[1] - planetdata[g][s2].coordinates[1])/2);
			if ((dx*dx)+(dy*dy) < 324) {
				return true;
			}
			return false;
		}
		var connectivity = [];
		for (var i=0;i<planetinfo.systems;i++) {
			connectivity.push([]);
		}
		for (i=0;i<planetinfo.systems;i++) {
			for (var j=i+1;j<planetinfo.systems;j++) {
				if (distance(i,j)) {
					connectivity[i].push(j)
					connectivity[j].push(i);
				}
			}
		}
		for (i=0;i<planetinfo.systems;i++) {
			planetdata[g][i].connectedSystems = connectivity[i];
		}
		return connectivity;
	}

	var $intersect = function(a1, a2) {
		for (var i=0;i<a1.length;i++) {
			if (a2.indexOf(a1[i]) != -1) {
				return true;
			}
		}
		return false;
	};

	planetinfo.ensureConnectivity = function(g) {
		var connectivity = $buildConnectivity(g);
		var found = false;
		var connected = [0];
		var i;
		do {
			found = false;
			for (i=1;i<planetinfo.systems;i++) {
				if (connected.indexOf(i) == -1) {
					if ($intersect(connectivity[i],connected)) {
						connected.push(i);
						found = true;
					}
				}
			}
			// until we don't find any more connected systems
		} while (found);
		found = false;
		for (i=1;i<planetinfo.systems;i++) {
			if (connected.indexOf(i) == -1) {
//				console.error("Galaxy "+g+": Moving system "+i+" for connectivity");
				planetdata[g][i].coordinates[0] = Math.floor((128+planetdata[g][i].coordinates[0])/2);
				planetdata[g][i].coordinates[1] = Math.floor((128+planetdata[g][i].coordinates[1])/2);
				found = true;
			}
		}
		if (found) {
			// need to rebuild connectivity map
			connectivity = $buildConnectivity(g);
		}
	}


	planetinfo.dump = function(g,s) {
		var fix = function(a,b) {
			return a.toFixed(b);
		}
		var color = function(a) {
			return fix(a[0],3)+" "+fix(a[1],3)+" "+fix(a[2],3);
		}

		var info = planetdata[g][s];
		console.log("\""+g+" "+s+"\" = {");
		$plist("coordinates",info.coordinates[0]+" "+info.coordinates[1]);
		$plist("name",info.name);
		$plist("sun_radius",info.star.radius);
		$plist("corona_flare",fix(info.star.coronaFlare,2));
		$plist("corona_shimmer",fix(info.star.coronaShimmer,2));
		$plist("corona_hues",fix(info.star.coronaHues,2));
		$plist("sun_color",color(info.star.colour));
		$plist("sun_distance",info.planet.orbitalRadius);
		$plist("sun_name",info.star.sequence);

		$plist("planet_distance",fix(info.planet.zpos,0));
		$plist("radius",fix(info.planet.radius,0));
		$plist("percent_land",fix(100*info.planet.percentLand,2));
		$plist("percent_ice",fix(100*info.planet.percentIce,2));
		$plist("percent_cloud",fix(100*info.planet.percentCloud,2));
		$plist("cloud_alpha",fix(info.planet.cloudAlpha,2));
		$plist("rotational_velocity",fix(info.planet.rotationalVelocity,7));
		$plist("atmosphere_rotational_velocity",fix(info.planet.atmosphereVelocity,7));

		$plist("land_color",color(info.planet.landColour));
		$plist("polar_land_color",color(info.planet.polarLandColour));
		$plist("sea_color",color(info.planet.seaColour));
		$plist("polar_sea_color",color(info.planet.polarSeaColour));
		$plist("cloud_color",color(info.planet.cloudColour));
		$plist("polar_cloud_color",color(info.planet.polarCloudColour));

		if (this.$debug) {
			$plist("mineral_wealth",fix(info.planet.mineralWealth,2));
			$plist("planet_surface_temperature",fix(info.planet.temperature,0));
			$plist("planet_surface_radiation",fix(info.planet.surfaceRadiation,3));
			$plist("planet_surface_gravity",fix(info.planet.surfaceGravity,2));
			$plist("planet_seismic_instability",fix(info.planet.seismicInstability,3));
			$plist("planet_wind_speeds",fix(info.planet.windFactor,3));
			$plist("star_instability",fix(info.star.instability,2));
			$plist("hab_b",fix(info.habitability.Bird,1));
			$plist("hab_fe",fix(info.habitability.Feline,1));
			$plist("hab_fr",fix(info.habitability.Frog,1));
			$plist("hab_h",fix(info.habitability.Human,1));
			$plist("hab_i",fix(info.habitability.Insect,1));
			$plist("hab_li",fix(info.habitability.Lizard,1));
			$plist("hab_lo",fix(info.habitability.Lobster,1));
			$plist("hab_r",fix(info.habitability.Rodent,1));
			$plist("description","Habitability: "+fix(info.habitability.worst,0)+"-"+fix(info.habitability.average,0)+"-"+fix(info.habitability.best,0)+". Sun: "+info.star.sequence+". Radiation: "+fix(info.planet.surfaceRadiation,3)+". Minerals: "+fix(info.planet.mineralWealth,2)+". Earthquakes: "+fix(info.planet.seismicInstability,3)+". Flares: "+fix(info.star.instability,2)+". Land: "+fix(info.planet.landFraction,2)+". Wind speed: "+fix(info.planet.windFactor,2)+". Temperature: "+fix(info.planet.temperature,0)+". Gravity: "+fix(info.planet.surfaceGravity,2));
		}

		console.log("};");
	};



	module.exports = planetinfo;


}());