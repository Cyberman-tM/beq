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

module.exports.sendQuestion = function(i_user, i_question)
{
    if (i_user.userid == GM.userid)
        notifyPlayers(i_question);
};

module.exports.sendAnswer = function(i_user, i_answer)
{
    GM.send("New answer from" + i_user.username + ":" + "i_answer");
};

//Manual scoring
module.exports.givePoints = function (i_user, i_pointlist) {
    //pointlist is a a string of name:points;
    var pointList = (i_pointlist+";").split(';');
    var winner = null;

    pointList.forEach(function (player) {
        var pointName = player.split(':');
        if (intPlayerNames[pointName[0]] != undefined)
        {
            intPlayers[intPlayerNames[pointName[0]]].playerPoints += pointName[1];
            if (intPlayers[intPlayerNames[pointName[0]]].playerPoints >= targetPoints)
                winner = pointName[0];
        }
    });

    if (winner == null)
        notifyPlayersPoints();
    else
       notifyPlayers("Player" + winner + "has reached" + intPlayers[intPlayerNames[winner]].playerPoints + "of" + targetPoints + "points! Congratulations!");
};

module.exports.setTarget = function (i_user, i_maxPoints) {
    //Nur GM
    if (i_user.userid == GM.userid) {
        targetPoints = i_maxPoints;
        notifyPlayers("GM set new target points: " + i_maxPoints);
    }
};

//Utilities
module.exports.myPoints = function (i_user) {
    i_user.send(intPlayers[i_user.username].playerPoints);
};

function notifyPlayers(i_text) {
    intPlayerNames.forEach(function (name) {
        intPlayers[name].playerObj.send(i_text);
    });
}

function notifyPlayersPoints() {
    intPlayerNames.forEach(function (name) {
        intPlayers[name].playerObj.send("Current points:" + intPlayers[name].playerPoints);
    });
}