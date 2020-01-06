/*
   Retrieve data from external server
   
   IMPORTANT: like all Javascript, this is asynchronous!
*/

var winston = require('winston');
var logger = winston.createLogger(
	{
		level: 'info',
		format: winston.format.json(),
		transports: [
			new winston.transports.Console()
		]
	}
	);
var requestify = require('requestify');

module.exports = function (dataKey)
{
    var tmpRet = null;
	//Daten irgendwie ändern? Prüfen? Blubb
	requestify.get("http://www.tlhingan.at/Misc/beq/storage/retrieve.php?dataKey=" + dataKey)
	.then(function (response)
	{
        tmpRet = JSON.parse(response);
	});
    
    return tmpRet;
};

