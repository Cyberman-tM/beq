/*
   A global generic timer that ticks once per minute (or so)
   calls other functions that are defined in 
*/
var cusTimer = require('./..custom_modules/custom_timers.js');
var KWOTD = require('kwotd.js');

var eventTimer = null;

//TODO: Init routine for timed events, to set up their stuff
//example: KWOTD: read in timing list
//TODO: add parameter to timers? current date?


module.exports.startEventTimer = function()
{
	//Call it once a minute
	eventTimer = setInterval(actualEventTimer, 60 * 1000);
}

module.exports.stopEventTimer = function()
{
	if (eventTimer != null)
		clearInterval(eventTimer);
}

function actualEventTimer()
{
	//Call custom timer functions
	cusTimer.runCusTimer();
	
	//Call hardcoded stuff we know we have
	KWOTD.KWOTD();	
}
