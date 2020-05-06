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

var playDataStrucDef = null;
playDataStrucDef.playerID = "";
playDataStrucDef.playerName = "";
playDataStrucDef.playerPoints = 0;

var playDataStruc = JSON.stringify(playDataStrucDef);

var intPlayers = [];

module.exports.players = intPlayers;

module.exports.restart = function () {
    intPlayers = null;
};

module.exports.addPlayer = function (i_userID, i_userName) {
    var newPlayer = JSON.parse(playDataStruc);

    newPlayer.playerID = i_userID;
    newPlayer.playerName = i_userName;
    //Only new players should be added
    if (!intPlayers.find(function (myObj) { if (myObj.playerID == i_userID) return myOjb; }))
        intPlayers.push(newPlayer);
};

module.exports.listPlayers = function () {
    var tmpRet = "";
    intPlayers.forEach(function (item) { tmpRet += item.playerName; });

    return tmpRet;
};