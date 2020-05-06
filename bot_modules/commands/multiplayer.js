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


var playDataStruc = '{     "playDataStrucDef": {     "playerID": "",     "playerName": "",     "playerPoints": "0;",     "playerObj": ""   }   }';

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

    //Only new players should be added
    if (!intPlayers.find(function (myObj) { if (myObj.playerID == newPlayer.playerID) return myObj; }))
        intPlayers.push(newPlayer);
};

module.exports.listPlayers = function () {
    var tmpRet = "";
    intPlayers.forEach(function (item) { tmpRet += item.playerName; });

    return tmpRet;
};

module.exports.myPoints = function (i_user) {
    i_user.send("my points?");
};