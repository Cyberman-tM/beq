/*
   Index words from boQwI'
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

var bulkWordData = [];
var bulkCmpWD = [];

module.exports = function (beq_engine) {

    beq_engine.KDBJSon.forEach(function (item) {
        //Store as uhmal
        var chkWord = kTranscode.RCtlh2u(item.tlh) + ";;" + item.type;

        addBulkWord(chkWord);
    });
    requestify.get(catAPI.catWakeup).then(function () {
        requestify.post(catAPI.catAddWordBulk, bulkWordData);
    });
};

function addBulkWord(name) {

    //Fragezeichen und Rufzeichen machen in Azure Table STorage Ärger!
    name = name.replace(/[?!]/g, ' ');
    if (bulkCmpWD.indexOf(name) < 0) {
        bulkWordData.push({ "n": name });
        bulkCmpWD.push(name);
    }
}