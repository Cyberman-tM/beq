/*
   Save data on external server
   The data is not processed, just stored in a file with the keyname
*/

var winston = require('winston');
var logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});
var requestify = require('requestify'); 

module.exports = function(dataKey, dataData)
{
    var dataString = JSON.stringify(dataData);
    logger.info("instore");
    //Daten irgendwie ändern? Prüfen? Blubb
    requestify.post("http://www.tlhingan.at/Misc/beq/storage/store?key="+dataKey, { daten: dataString}).then(function(response)
                                                                                                             {
    logger.info("response");
       logger.info(response.getBody());
    })
    .fail(function(response)
    {logger.info("fail");
    logger.info(response.getCode())});
}
