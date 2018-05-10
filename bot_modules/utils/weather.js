/*
   Weather forecast, translated into klingon
   
*/

var TDData   = require('./../external/discord_data.js');

//For testing
var logger = require('winston');

module.exports.getWeather = function(cityIDs)
{	
	var weatherResponse = null;
	var weatherErr = null;
	var weatherURL = 'http://api.openweathermap.org/data/2.5/weather?id=cityID&appid=_APPID_';
	
	logger.info("wetter");

	weatherURL = weatherURL.replace('cityID', cityIDs);
	weatherURL = weatherURL.replace('_APPID_', TDData.openWeatherMap);
	logger.info(weatherURL);
	
	
	request(weatherURL, {json: true}, (err, res, body) => 
	{
		weatherErr = err;
		weatherResponse = body;
		logger.info(body);
	});	
	
	//Set body to ANY value after 1 second
	setTimeout(function(body){if (body == null) body="nope";}, 1000);
	while(body == null)
	{
		//Yup, we're blocking the whole bot until we get a result...
	}
	
	logger.info(weatherErr);
	logger.info(weatherResponse);
	
}