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
playDataStrucDef.playerName = "dummy";
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
    logger.info(playDataStruc);

    logger.info(newPlayer.playerName);
    newPlayer.playerID = i_user.id;
    newPlayer.playerName = i_user.username;
    newPlayer.playerObj = i_user;

    dummy = i_user.username;
    newPlayer.playerName = dummy;
    newPlayer.playerName = "fuck you js";
    logger.info(newPlayer);
    logger.info(dummy); 
    logger.info(i_user.username);
    logger.info(newPlayer.playerName);

    //Only new players should be added
    if (!intPlayers.find(function (myObj) { if (myObj.playerID == newPlayer.userID) return myObj; }))
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