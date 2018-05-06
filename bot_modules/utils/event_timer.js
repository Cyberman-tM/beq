/*
   A global generic timer that ticks once per minute (or so)
   calls other functions that are defined in 
*/
var cusTimer = require('./..custom_modules/custom_timers.js');
var KWOTD = require('kwotd.js');

var eventTimer = null;

module.exports.startEventTimer = function(beqEngine)
{
	//Call it once a minute
	eventTimer = setInterval(actualEventTimer, 60 * 1000);
	
	//Call init function of individual timers
	cusTimer.runCustInit(beqEngine);
	
	//Hardcoded timers
	KWOTD.init(beqEngine);
}

module.exports.stopEventTimer = function()
{
	if (eventTimer != null)
		clearInterval(eventTimer);
}

function actualEventTimer()
{
	var thisDate = Date();
	var thisHour = thisDate.getHours();
	var thisMinu = thisDate.getMinutes();
	
	//Call custom timer functions
	cusTimer.runCusTimer(thisDate, thisHour, thisMinu);
	
	//Call hardcoded stuff we know we have
	KWOTD.KWOTD(thisDate, thisHour, thisMinu);
}
