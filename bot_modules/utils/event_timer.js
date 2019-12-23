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
var noPulse = '';

//TODO: Do we want each timing event to have access to the whole bot?

module.exports.versName = 'Event Timer';
module.exports.versInt  = '0.01';

module.exports.startEventTimer = function(beqEngine, bot)
{
	//Special variable to turn testing features on and off
	devTest = false;
	if (TDData.devBuild == "true")
	   devTest = true;
	
	//Disable log-pulse, to keep the log clean?
	noPulse = false;
	if (TDData.noPulse == "true")
	   noPulse = true;
	
	//Call it once a minute
	eventTimer = setInterval(actualEventTimer, 60 * 1000);
	
	//Call init function of individual timers
	cusTimer.runCustInit(beqEngine, bot, devTest);
	
	//Hardcoded timers
	KWOTD.KWOTDInit(beqEngine, bot, TDData.KWOTDChan, devTest);
	
	//During tests, give a lifesign
	if (devTest == true)
	{
	   var thisDate = new Date();
	   var thisHour = thisDate.getHours();
	   var thisMinu = thisDate.getMinutes();
	   logger.info('Event timer start:' + thisHour + ':' + thisMinu);
	}
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
	
	//During tests, give a lifesign, unless we want a clean log
	if (devTest == true && noPulse == false)
	   logger.info(thisHour + ':' + thisMinu);
	
	//Call custom timer functions
	cusTimer.runCusTimer(thisDate, thisHour, thisMinu);
	
	//Call hardcoded stuff we know we have
	KWOTD.KWOTD(thisDate, thisHour, thisMinu);
}
