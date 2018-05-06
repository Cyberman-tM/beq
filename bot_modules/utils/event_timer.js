/*
   A global generic timer that ticks once per minute (or so)
   calls other functions that are defined in 
*/

//This is also included in the main bot file, but we don't have easy access to it, and we need the devBeq flag
var TDData   = require('./../external/discord_data.js');
//Read in custom timers
var cusTimer = require('./../custom_modules/custom_timers.js');

var KWOTD = require('./KWOTD/kwotd.js');
var logger = require('winston');

var eventTimer = null;
var devTest = '';

module.exports.versName = 'Event Timer';
module.exports.versInt  = '0.01';

module.exports.startEventTimer = function(beqEngine)
{
	//Special variable to turn testing features on and off
	if (TDData.devBuild == "true")
	   devTest = true;
	else
	   devTest = false;
	
	//Call it once a minute
	eventTimer = setInterval(actualEventTimer, 60 * 1000);
	
	//Call init function of individual timers
	cusTimer.runCustInit(beqEngine, devTest);
	
	//Hardcoded timers
	KWOTD.KWOTDInit(beqEngine, devTest);
	
	//During tests, give a lifesign
	if (devTest == true)
	   logger.info(thisHour + ':' + thisMinu);
}

module.exports.stopEventTimer = function()
{
	if (eventTimer != null)
		clearInterval(eventTimer);
}

function actualEventTimer()
{
	var thisDate = new Date();
	var thisHour = thisDate.getHours();
	var thisMinu = thisDate.getMinutes();
	
	//During tests, give a lifesign
	if (devTest == true)
	   logger.info(thisHour + ':' + thisMinu);
	
	//Call custom timer functions
	cusTimer.runCusTimer(thisDate, thisHour, thisMinu);
	
	//Call hardcoded stuff we know we have
	KWOTD.KWOTD(thisDate, thisHour, thisMinu);
}
