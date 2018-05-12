/*
   Weather forecast, translated into klingon
   
*/

var TDData  = require('./../external/discord_data.js');
var logger = require('winston');

//We have partial asynchronous behaviour, we need a global variable to check progress
var weatherResponse = null;
module.exports.getWeather = function(cityIDs)
{	
	//Initialize for this run
	weatherResponse = null;
	var weatherErr = null;
	var weatherURL = 'http://api.openweathermap.org/data/2.5/weather?id=cityID&appid=_APPID_';
	
	/*
	const response = await fetch('https://api.com/values/1');
	const resp = await request(weatherURL, function (err, resp, body)
			{	weatherErr = err;
				weatherResponse = body;
				logger.info(body);
				logger.info("GotData");
				return body;
			});
	logger.info(resp);
	
	readWeather();
	*/
	

}

