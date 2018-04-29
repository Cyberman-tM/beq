/*
   A global generic timer that ticks once per minute (or so)
   calls other functions that are defined in 
*/

var eventTimer = null;

module.exports.startEventTimer = function()
{
	eventTimer = setInterval(actualEventTimer, 60 * 1000);
}

module.exports.stopEventTimer = function()
{
	if (eventTimer != null)
		clearInterval(eventTimer);
}

function actualEventTimer()
{
	
}