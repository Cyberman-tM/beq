/*
   Reload categorization
*/
var requestify = require('requestify'); 
var catAPI = require('./../../external/cat_api.js');

var winston = require('winston');
var logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

module.exports = function(beq_engine)
{
    var tmpRet = "";    
    logger.info("in func");

    requestify.get(catAPI.catGetData + "&dataID=categs").then(function (response)
    {
        /*
        KID
        [
           KID (again)
           fn - fullname
           WIDS
           [
              WID
              JDescs[lang] text
           ]
        ]
        */
        // Get the response body
        var  catData = JSON.parse(response.getBody());
        logger.info(catData.KID);
        logger.info(catData[0].fn);
        logger.info(catData[0].WIDS[0].JDescs.en);

    });
    tmpRet = "done?";
    return tmpRet;
}