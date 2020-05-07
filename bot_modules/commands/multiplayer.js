/*
   New game experiment - "register" multiple players
*/
var winston = require('winston');
var logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console()
    ]
});

var playDataStruc = '{ "playDataStrucDef": { "playerID": "", "playerPoints": "0;",  "playerObj": ""  } }';
var intPlayers = {};
var intPlayerNames = [];
var GM = null;
var targetPoints = 0;

module.exports.players = intPlayers;

module.exports.restart = function () {
    intPlayers = null;
    GM = null;
};

module.exports.addPlayer = function (i_user) {
    var newPlayer = JSON.parse(playDataStruc);

    //Only new players should be added
    if (intPlayers[i_user.username] == undefined) {

        intPlayers[i_user.username] = {};
        intPlayers[i_user.username].playerID = i_user.id;
        intPlayers[i_user.username].playerPoints = -1;
        intPlayers[i_user.username].playerObj = i_user;

        //Echtes Array mit Namen, um auf das falsche Array zugreifen zu können
        intPlayerNames.push(i_user.username);
    }
};

module.exports.addGM = function (i_user) {
    var tmpRet = "";
    if (GM == null) {
        GM = i_user;
        tmpRet = "You are GM now.";
    }
    else
        tmpRet = "We already have a GM:" + GM.username;

    return tmpRet;
};

module.exports.listPlayers = function () {
    var tmpRet = "";
    intPlayerNames.forEach(function (name) {
        tmpRet += name;
        tmpRet += "\n" + intPlayers[name].playerPoints + "-" + intPlayers[name].playerID;
    });

    return tmpRet;
};

module.exports.myPoints = function (i_user) {
    i_user.send(intPlayers[i_user.username].playerPoints);
};

//Manual scoring
module.exports.givePoints = function (i_pointlist) {
    //pointlist is a a string of name:points;
    var pointList = i_pointlist.split(';');
    pointList.forEach(function (player) {


    });
};

module.exports.setTarget = function (i_user, i_maxPoints) {
    //Nur GM
    if (i_user.userid == GM.userid) {
        targetPoints = i_maxPoints;
        notifyPlayers("GM set new target points: " + i_maxPoints);
    }
};


//Utilities
function notifyPlayers(i_text) {
    intPlayerNames.forEach(function (name) {
        intPlayers[name].playerObj.send(i_text);
    });
}