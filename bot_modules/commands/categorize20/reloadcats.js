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

    requestify.get(catAPI.catGetData + "?dataID=categs").then(function (response)
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
        beq_engine.catEx = (response.getBody());       

        logger.info(beq_engine.catEx);
        logger.info("sf");

    });


    tmpRet = "done?";
    return tmpRet;
}