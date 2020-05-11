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
var bT = require('../utils/boQwI_translate.js');
var myKDBJSon = null;

var singleGame = {};
singleGame.intPlayers = {};
singleGame.intPlayerNames = [];
singleGame.GM = null;
singleGame.targetPoints = 0;
singleGame.playersAnswered = 0;
singleGame.sentQuest = false;
singleGame.lastQuest = null;
singleGame.specChannel = [];

//Basic data structure - similar to beqTalk with the beq engine
module.exports.gameTalkDef = '{"intPlayers":{},"intPlayerNames":[],"GM":null, "curPlayer":{}, "command": "", "args": {}, "retMes": "Empty message", "targetPoints":0,"playersAnswered":0,"sentQuest":false,"lastQuest":null,"specChannel":[]}';

//Called when the bot starts up - prepare data for later
module.exports.initGame = function (KDBJSon) {
    myKDBJSon = null;
    myKDBJSon = KDBJSon;
};

//Similar to the beqEngine, this is the GameEngine
module.exports.Engine = function (gameTalk) {
    if (gameTalk.command == "NOP") {
        //Do nothing, this is something that needs to be done in the bot
    }
    else if (gameTalk.command == "add")
        gameTalk = addPlayer(gameTalk);
    else if (gameTalk.command == "sendanswer")
        gameTalk = sendAnswer(gameTalk);
    else if (gameTalk.command == "getquestion")
        gameTalk = getQuestion(gameTalk);

    return gameTalk;
};

module.exports.restart = function () {
    singleGame = {};
    singleGame.intPlayers = {};
    singleGame.GM = null;
    singleGame.intPlayerNames = [];
    singleGame.targetPoints = 0;
    singleGame.playersAnswered = 0;
    singleGame.sentQuest = false;
    singleGame.lastQuest = null;
    singleGame.specChannel = [];
};

function addPlayer(singleGame) {
    var uName = singleGame.curPlayer.username;

    //Only new players should be added
    if (singleGame.intPlayers[uName] == undefined) {

        singleGame.intPlayers[uName] = {};
        singleGame.intPlayers[uName].playerID = singleGame.curPlayer.id;
        singleGame.intPlayers[uName].playerPoints = -1;
        singleGame.intPlayers[uName].playerObj = singleGame.curPlayer;
        singleGame.intPlayers[uName].lastAnswer = "";

        //Echtes Array mit Namen, um auf das falsche Array zugreifen zu können
        singleGame.intPlayerNames.push(uName);

        singleGame.curPlayer.send("Ready to play?");

        singleGame.retMes = "player added, I think?";
    }

    return singleGame;
}

module.exports.removePlayer = function (i_user) {
    if (singleGame.intPlayers[i_user.username] != undefined) {
        singleGame.intPlayers[i_user.username] = null;
        var playerIndex = singleGame.intPlayerNames.indexOf(i_user.username);
        singleGame.intPlayerNames = singleGame.intPlayerNames.slice(playerIndex, 1);

        i_user.send("It was fun playing with you!");
    }
};

module.exports.addGM = function (i_user) {
    var tmpRet = "";
    if (singleGame.GM == null) {
        singleGame.GM = i_user;
        tmpRet = "You are GM now";
    }
    else
        tmpRet = "We already have a GM:" + singleGame.GM.username;

    return tmpRet;
};

module.exports.listPlayers = function () {
    var tmpRet = "";
    singleGame.intPlayerNames.forEach(function (name) {
        tmpRet += name;
        tmpRet += "\n" + singleGame.intPlayers[name].playerPoints;
    });

    return tmpRet;
};

module.exports.GMsendQuestion = function (i_user, i_question) {
    if (singleGame.GM != null && i_user.userid == singleGame.GM.userid) {
        notifyPlayers(i_question);
        singleGame.playersAnswered = 0;
        singleGame.sentQuest = false;

        notifySpectators("GM sent a new question: " + i_question + "\r\n");
    }
};

//TODO: remove from GM utils, move to automatic
module.exports.GMsendVocQuest = function (i_user, i_question) {
    var l_question = i_question;
    if (l_question == "")
        l_question = this.getQuestion(4);

    if (i_user.userid == singleGame.GM.userid) {
        notifyPlayers(l_question);
        singleGame.playersAnswered = 0;
        singleGame.sentQuest = true;

        notifySpectators("GM sent a new question: " + i_question + "\r\n");
    }
};

function sendAnswer(gameTalk) {
    var tmpText = "";
    var uName = singleGame.curPlayer.username;

    if (gameTalk.intPlayers[uName] == undefined)
        return;

    gameTalk.intPlayers[uName].lastAnswer = gameTalk.args;
    gameTalk.playersAnswered++;

    if (gameTalk.GM != null)
        gameTalk.GM.send("New answer from " + uName + ": " + gameTalk.args);

    notifySpectators("New answer from " + uName + ": " + gameTalk.args);

    //All players sent an answer, and we previously sent a vocabulary question
    if (gameTalk.playersAnswered == gameTalk.intPlayerNames.length && gameTalk.sentQuest == true) {
        tmpText = "Question was to translate: " + gameTalk.lastQuest[0].tlh + "\r\n";
        tmpText += "The correct answer was: " + gameTalk.lastQuest[0].en + "\r\n";
        tmpText += "\r\n";
        tmpText += "The other possible answers have been:\r\n";
        tmpText += gameTalk.lastQuest[1].tlh + " => " + gameTalk.lastQuest[1].en + "\r\n";
        tmpText += gameTalk.lastQuest[2].tlh + " => " + gameTalk.lastQuest[2].en + "\r\n";
        tmpText += gameTalk.lastQuest[3].tlh + " => " + gameTalk.lastQuest[3].en + "\r\n";

        for (X = 0; X < gameTalk.intPlayerNames.length; X++)
            tmpText += "\r\n Player " + gameTalk.intPlayerNames[X] + " answered: " + gameTalk.intPlayers[gameTalk.intPlayerNames[X]].lastAnswer + "\r\n";

        notifyPlayers(tmpText);
        notifyGM(tmpText);
        notifySpectators(tmpText);
    }

    return gameTalk;
}

module.exports.addSpectator = function (i_channel) {
    if (singleGame.specChannel.indexOf(i_channel) == -1) {
        singleGame.specChannel.push(i_channel);
        i_channel.send("This channel is now set to spectate the spectacle!");
    }
};

//Manual scoring
module.exports.givePoints = function (i_pointlist) {
    //pointlist is a a string of name:points;
    var pointList = (i_pointlist + ";").split(';');
    var winner = null;

    pointList.forEach(function (player) {
        var pointName = player.split(':');
        if (singleGame.intPlayers[pointName[0]] != null) {
            singleGame.intPlayers[pointName[0]].playerPoints += parseInt(pointName[1]);
            if (singleGame.intPlayers[pointName[0]].playerPoints >= singleGame.targetPoints)
                winner = pointName[0];
        }
    });

    if (winner == null)
        notifyPlayersPoints();
    else {
        var winText = "Player " + winner + " has reached " + singleGame.intPlayers[winner].playerPoints + " of " + singleGame.targetPoints + " points! Congratulations!";
        notifyPlayers(winText);
        notifyGM(winText);
    }
};

module.exports.setTarget = function (i_user, i_maxPoints) {
    //Nur GM
    if (i_user.userid == singleGame.GM.userid) {
        singleGame.targetPoints = i_maxPoints;
        notifyPlayers("GM set new target points: " + i_maxPoints);
        notifySpectators("GM set new target points: " + i_maxPoints);
    }
};

function getQuestion(gameTalk) {
    var rawQuestion;
    rawQuestion = gameTalk.lastQuest = getRandomWords(gameTalk.args);
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

    gameTalk.retMessage = finText;
    return gameTalk;
}

//Utilities
module.exports.myPoints = function (i_user) {
    i_user.send(singleGame.intPlayers[i_user.username].playerPoints);
};

function notifyPlayers(i_text) {
    singleGame.intPlayerNames.forEach(function (name) {
        singleGame.intPlayers[name].playerObj.send(i_text);
    });
}

function notifySpectators(i_text) {
    singleGame.specChannel.forEach(function (channel) {
        channel.send(i_text);
    });
}

function notifyPlayersPoints() {
    singleGame.intPlayerNames.forEach(function (name) {
        singleGame.intPlayers[name].playerObj.send("Current points: " + singleGame.intPlayers[name].playerPoints);
    });
}

function notifyGM(i_text) {
    if (singleGame.GM != null)
        singleGame.GM.send(i_text);
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