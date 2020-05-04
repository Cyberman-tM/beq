/*
   Shell function for re-categorization of KDB
*/
var requestify = require('requestify');
var catAPI = require('./../../external/cat_api.js');
var kTranscode = require('./../../utils/recode.js');
var winston = require('winston');
var logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console()
    ]
});

var reLink = require('./catword_boqwi.js');
var reIndex = require('./indexKDB.js');
var reCat = require('./categorize_boqwi.js');

module.exports = function(beq_engine, phase)
{
    tmpRet = "";
    if (phase == "")
       return "Please indicate phase: 1 - words, 2- categories, 3 categorization";

    if (phase == "1")
    {
        reIndex(beq_engine);
        tmpRet = "Indexing started. Please give enough time for completion!";

    }
    else if (phase == "2")
    {
        reCat(beq_engine);
        tmpRet = "Category creation started. Shouldn't take too long";

    }
    else if (phase == "3")
    {
        reLink(beq_engine);
        tmpRet = "Linking started. Give it time.";
    }   

    return tmpRet;
};