/*
   Weather forecast, translated into klingon
   
*/

var TDData  = require('./../external/discord_data.js');
var request = require('request');
//For testing
var logger = require('winston');

//We have partial asynchronous behaviour, we need a global variable to check progress
var weatherResponse = null;
module.exports.getWeather = function(cityIDs)
{	
	setTimeout(function(){logger.info("1st");},1000);
	
	//Initialize for this run
	weatherResponse = null;
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
		logger.info("GotData");
	});	
	
	//Set body to ANY value after 1 second
	setTimeout(function(){logger.info("test!"); if (weatherResponse == null) weatherResponse="nope";}, 1000);

	logger.info('end');
	logger.info(weatherErr);
	logger.info(weatherResponse);
	
}
