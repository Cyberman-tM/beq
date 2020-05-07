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
var intPlayers = [];
var GM = null;

module.exports.players = intPlayers;

module.exports.restart = function () {
    intPlayers = null;
    GM = null;
};

module.exports.addPlayer = function (i_user) {
    var newPlayer = JSON.parse(playDataStruc);

    newPlayer[i_user.username] = {};
    newPlayer[i_user.username].playerID = i_user.id;
    newPlayer.username = i_user.username;
    newPlayer.playerID = i_user.id;
    newPlayer.playerObj = i_user;

    //Only new players should be added
    if (!intPlayers.find(function (myObj) { if (myObj.playerID == newPlayer.playerID) return myObj; }))
        intPlayers.push(newPlayer);
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
    intPlayers.forEach(function (item) {
        tmpRet += item;
        tmpRet += "\n" + item.playerPoints + "-" + item.playerID;
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