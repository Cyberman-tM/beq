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

var playDataStrucDef = "";
playDataStrucDef.playerID = "";
playDataStrucDef.playerName = "";
playDataStrucDef.playerPoints = 0;
playDataStrucDef.playerObj = null;

var playDataStruc = JSON.stringify(playDataStrucDef);

var intPlayers = [];

module.exports.players = intPlayers;

module.exports.restart = function () {
    intPlayers = null;
};

module.exports.addPlayer = function (i_user) {
    var newPlayer = JSON.parse(playDataStruc);

    newPlayer.playerID = i_user.id;
    newPlayer.playerName = i_user.username;
    newPlayer.playerObj = i_user;

    logger.info(i_user.username);
    logger.info(newPlayer.player);

    //Only new players should be added
    if (!intPlayers.find(function (myObj) { if (myObj.playerID == newPlayer.userID) return myOjb; }))
        intPlayers.push(newPlayer);
};

module.exports.listPlayers = function () {
    var tmpRet = "";
    intPlayers.forEach(function (item) { tmpRet += item.playerName; });

    return tmpRet;
};

module.exports.myPoints = function(i_user)
{
    i_user.send("my points?");
};