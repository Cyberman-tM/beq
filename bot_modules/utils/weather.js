/*
   Weather forecast, translated into klingon
   
*/

/* Restart work if necessary

var request = require('request');
var TDData   = require('./../external/discord_data.js');

//For testing
var logger = require('winston');

module.exports.getWeather = function(cityIDs)
{	
	var weatherResponse = null;
	var weatherErr = null;
	var weatherURL = 'http://api.openweathermap.org/data/2.5/weather?id=cityID&appid=_APPID_';
	weatherURL = weatherURL.replace('cityID', cityIDs);
	weatherURL = weatherURL.replace('_APPID', TDData.openWeatherMap);
	
	request(weatherURL, {json: true}, (err, res, body) => 
	{
		weatherErr = err;
		weatherResponse = body;
	});
	
	logger.info(weatherResponse);
	
}

*/
