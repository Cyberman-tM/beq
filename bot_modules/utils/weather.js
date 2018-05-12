/*
   Weather forecast, translated into klingon
   
*/

var TDData  = require('./../external/discord_data.js');
var request = require('request-promise');
var logger = require('winston');

//We have partial asynchronous behaviour, we need a global variable to check progress
var weatherResponse = null;
module.exports.getWeather = function(cityIDs)
{	

	//Initialize for this run
	weatherResponse = null;
	var weatherErr = null;
	var weatherURL = 'http://api.openweathermap.org/data/2.5/weather?id=cityID&appid=_APPID_';
	
	logger.info("wetter");

	weatherURL = weatherURL.replace('cityID', cityIDs);
	weatherURL = weatherURL.replace('_APPID_', TDData.openWeatherMap);
	logger.info(weatherURL);
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
	
	logger.info("x");
	const request = async () => {
    const response = await fetch('https://api.com/values/1');
    const json = await response.json();
    logger.info(json);
}

request();
logger.info("y");
	
	logger.info('end');
	logger.info(weatherErr);
	logger.info(weatherResponse);
	
}
