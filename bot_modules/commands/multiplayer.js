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

var intPlayers = {};
var intPlayerNames = [];
var GM = null;
var targetPoints = 0;
var playersAnswered = 0;
var myKDBJSon = null;
var sentQuest = false;
var lastQuest = null;

module.exports.players = intPlayers;

module.exports.restart = function () {
    intPlayers = {};
    GM = null;
    intPlayerNames = [];
    targetPoints = 0;
    playersAnswered = 0;
    myKDBJSon = null;
    sentQuest = false;
    lastQuest = null;
};

module.exports.initGame = function (KDBJSon) {
    myKDBJSon = KDBJSon;
};

module.exports.addPlayer = function (i_user) {

    //Only new players should be added
    if (intPlayers[i_user.username] == undefined) {

        intPlayers[i_user.username] = {};
        intPlayers[i_user.username].playerID = i_user.id;
        intPlayers[i_user.username].playerPoints = -1;
        intPlayers[i_user.username].playerObj = i_user;
        intPlayers[i_user.username].lastAnswer = "";

        //Echtes Array mit Namen, um auf das falsche Array zugreifen zu können
        intPlayerNames.push(i_user.username);

        i_user.send("Ready to play?");
    }
};

module.exports.removePlayer = function (i_user) {
    if (intPlayers[i_user.username] != undefined) {
        intPlayers[i_user.username] = null;
        var playerIndex = intPlayerNames.indexOf(i_user.username);
        intPlayerNames = intPlayerNames.slice(playerIndex, 1);

        i_user.send("It was fun playing with you!");
    }
};

module.exports.addGM = function (i_user) {
    var tmpRet = "";
    if (GM == null) {
        GM = i_user;
        tmpRet = "You are GM now";
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

module.exports.sendQuestion = function (i_user, i_quest, i_question) {
    if (i_user.userid == GM.userid) {
        notifyPlayers(i_question);
        playersAnswered = 0;

        sentQuest = false;
        if (i_quest == "true")
            sentQuest = true;
    }
};

module.exports.sendAnswer = function (i_user, i_answer) {
    var tmpText = "";

    intPlayers[i_user.username].lastAnswer = i_answer;
    playersAnswered++;

    if (GM != null)
        GM.send("New answer from" + i_user.username + ": " + i_answer);

    //All players sent an answer, and we previously sent a vocabulary question
    if (playersAnswered == intPlayerNames.length && sentQuest == true) {
        tmpText = "Question was to translate: " + lastQuest[0].tlh + "\r\n";
        tmpText += "The correct answer was: " + lastQuest[0].en + "\r\n";
        tmpText += "\r\n";
        tmpText += "The other possible answers have been:\r\n";
        tmpText += lastQuest[1].tlh + " => " + lastQuest[1].en + "\r\n";
        tmpText += lastQuest[2].tlh + " => " + lastQuest[2].en + "\r\n";
        tmpText += lastQuest[3].tlh + " => " + lastQuest[3].en + "\r\n";

        for (X = 0; X < intPlayerNames.length; X++)
            tmpText += "\r\n Player " + intPlayerNames[X] + " answered: " + intPlayers[intPlayerNames[X]].lastAnswer + "\r\n";
        notifyPlayers(tmpText);
    }
};

//Manual scoring
module.exports.givePoints = function (i_pointlist) {
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

module.exports.getQuestion = function (i_numResults) {
    var rawQuestion;
    rawQuestion = lastQuest = getRandomWords(i_numResults);
    var finText = "";

    //Randomize the order of answers, question is always entry 0
    var ans = [];
    while (ans.length < 4) {
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
    rawText += "a) " + rawQuestion[ans1].en + "\r\n";
    rawText += "b) " + rawQuestion[ans2].en + "\r\n";
    rawText += "c) " + rawQuestion[ans3].en + "\r\n";
    rawText += "d) " + rawQuestion[ans4].en + "\r\n";
    rawText += "\r\n";
    rawText += "DO NOT COPY: ANSWER:" + rawQuestion[0].en + "\r\n";
    rawText += "debug:" + ans1 + ans2 + ans3 + ans4;

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
function getRandomWords(i_numResults) {
    var numQuests = -1;
    var tmpWord = "";
    var quests = [];
    var noGood = false;

    do {
        //Get additional questions
        tmpWord = myKDBJSon[Math.floor(Math.random() * (myKDBJSon.length))];

        //Not hypothetical or derived? Or reginal?
        if (!(bT.isHyp(tmpWord.type) || bT.isDerived(tmpWord.type) || bT.isReg(tmpWord.type)))
            if (quests.length == 0)
                quests.push(tmpWord);
            else {
                noGood = false;
                quests.forEach(function (item) {
                    if (item.type != tmpWord.type || item.tlh == tmpWord.tlh || item.en == tmpWord.en)
                        noGood = true;
                });
                if (noGood == false)
                    quests.push(tmpWord);
            }
    }
    while (quests.length < i_numResults);
    /*
        quests.forEach(function (item) {
            logger.info(item.tlh);
        });
    */


    return quests;
}