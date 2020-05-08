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
var bT = require('./../utils/boQwI_translate.js');

var playDataStruc = '{ "playDataStrucDef": { "playerID": "", "playerPoints": "0;",  "playerObj": ""  } }';
var intPlayers = {};
var intPlayerNames = [];
var GM = null;
var targetPoints = 0;

module.exports.players = intPlayers;

module.exports.restart = function () {
    intPlayers = {};
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

module.exports.sendQuestion = function (i_user, i_question) {
    if (i_user.userid == GM.userid)
        notifyPlayers(i_question);
};

module.exports.sendAnswer = function (i_user, i_answer) {
    GM.send("New answer from" + i_user.username + ": " + i_answer);
};

//Manual scoring
module.exports.givePoints = function (i_user, i_pointlist) {
    //pointlist is a a string of name:points;
    var pointList = (i_pointlist + ";").split(';');
    var winner = null;

    pointList.forEach(function (player) {
        var pointName = player.split(':');
        if (intPlayers[pointName[0]] != null) {
            intPlayers[pointName[0]].playerPoints += parseInt(pointName[1]);
            if (intPlayers[pointName[0]].playerPoints >= targetPoints)
                winner = pointName[0];
        }
    });

    if (winner == null)
        notifyPlayersPoints();
    else
        notifyPlayers("Player " + winner + " has reached " + intPlayers[winner].playerPoints + " of " + targetPoints + " points! Congratulations!");
};

module.exports.setTarget = function (i_user, i_maxPoints) {
    //Nur GM
    if (i_user.userid == GM.userid) {
        targetPoints = i_maxPoints;
        notifyPlayers("GM set new target points: " + i_maxPoints);
    }
};

module.exports.getQuestion = function (KDBJSon, i_numResults) {
    var rawQuestion = getRandomWords(KDBJSon, i_numResults);
    var finText = "";

    var ans = [];
    while (ans.length < 4)
    {
        var r = Math.floor(Math.random() * 4);
        if (ans.indexOf(r) == -1)
            ans.push(r);
    }
    var ans1 = ans[0];
    var ans2 = ans[1];
    var ans3 = ans[2];
    var ans4 = ans[3];

    var rawText = "";
    rawText += "Translate the following from klingon:\r\n";
    rawText += "(Type: " + bT.getWType(rawQuestion[0].type, "en") + ")\r\n";
    rawText += "\r\n";
    rawText += "==> " + rawQuestion[0].tlh + "\r\n";
    rawText += "\r\n";
    rawText += "Possible answers:\r\n";
    rawText += "a)" + rawQuestion[ans1].en + "\r\n";
    rawText += "b)" + rawQuestion[ans2].en + "\r\n";
    rawText += "c)" + rawQuestion[ans3].en + "\r\n";
    rawText += "d)" + rawQuestion[ans4].en + "\r\n";
    rawText += "\r\n";
    rawText += "DO NOT COPY: ANSWER:" + rawQuestion[0].en + "\r\n";

    finText = rawText;

    return finText;
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
        intPlayers[name].playerObj.send("Current points: " + intPlayers[name].playerPoints);
    });
}

//Get a random word, then get additional results to offer multiple choice
function getRandomWords(KDBJSon, i_numResults) {
    var numQuests = -1;
    var tmpWord = "";
    var quests = {};

    //Initial question
    //TODO: check for hyp/derived - integrate in loop?
    quests[++numQuests] = KDBJSon[Math.floor(Math.random() * (KDBJSon.length))];
    do {
        //Get additional questions
        tmpWord = KDBJSon[Math.floor(Math.random() * (KDBJSon.length))];

        //Same type, but different word?
        if (tmpWord.type == quests[0].type && tmpWord.tlh != quests[0].tlh)
            //Not hypothetical or derived?
            if (!(bT.isHyp(tmpWord.type) && bT.isDerived(tmpWord.type)))
                quests[++numQuests] = tmpWord;
    }
    while (numQuests < i_numResults);
    /*
        numQuests = 0;
        do {
            logger.info(quests[++numQuests].tlh);
        }
        while (numQuests < i_numResults);
    */
    return quests;
}