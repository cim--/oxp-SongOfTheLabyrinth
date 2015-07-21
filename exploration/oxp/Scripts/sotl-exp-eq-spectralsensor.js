"use strict";

this.name = "SOTL Spectroscopic Sensor equipment script";

this.activated = function() {
	worldScripts["SOTL Equipment Management"]._spectralSensorButton1();
};

this.mode = function() {
	worldScripts["SOTL Equipment Management"]._spectralSensorButton2();
};