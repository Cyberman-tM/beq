/*
   Custom timers
*/

var logger = require('winston');
var stammtischReminder = require('./stammtisch.js');

//Initialize the custom timer, reserver space, etc..
module.exports.runCustInit = function(bot, beq_engine, devTest, logger)
{
	if (devTest == true)
	   logger.info("Custom Timer init");
	
	stammtischReminder.Init(bot, beq_engine, devTest);
}

//The name is mandatory!
//myDate is a Date object, myHour and myMinute are Date.getHours and Date.getMinutes
module.exports.runCusTimer = function(myDate, myHour, myMinute)
{	
	//You get no other parameters, you are just called with the current time
	//Now include whatever coding you want to run - maybe call another module?
	
	stammtischReminder.remind(myDate, myHour, myMinute);
}
