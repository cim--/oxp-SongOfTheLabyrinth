"use strict";

this.name = "SOTL Gravitational Sensor equipment script";

this.activated = function() {
	worldScripts["SOTL Equipment Management"]._gravSensorButton1();
};

this.mode = function() {
	worldScripts["SOTL Equipment Management"]._gravSensorButton2();
};