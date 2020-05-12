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
var gameTalk = {
    intPlayers: [{
        playerObj: {},
        playerPoints: 0,
        GM: false,
        lastAnswer: ""
    }],
    curPlayer: {},
    numPlayers: 0,
    playersAnswered: 0,
    command: "",
    args: {},
    retMes: "empty message",
    sentQuest: false,
    lastQuest: {},
    corAnswer: 0,
    specChannel: []
};
module.exports.gameTalkDef = JSON.stringify(gameTalk);

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
    else if (gameTalk.command == "spectate")
        gameTalk = addSpectator(gameTalk);
    else if (gameTalk.command == "newtarget")
        gameTalk = setTarget(gameTalk);

    //We just processed a command - make sure it doesn't get processed again
    //if the main program doesn't clean up
    gameTalk.command = "NOP";

    return gameTalk;
};

//Get current player's data
function getCurPlayer(gameTalk) {
    var tmpRet = null;
    gameTalk.intPlayers.forEach(function (player) {
        if (player.playerObj.id == gameTalk.curPlayer.id)
        {
            logger.info(player);
            tmpRet = player;
        }
    });

    return tmpRet;
}

function addPlayer(gameTalk) {
    var newPlayer = getCurPlayer(gameTalk);
    if (newPlayer.playerObj.username == undefined) {
        newPlayer.playerObj = gameTalk.curPlayer;
        newPlayer.playerPoints = 0;
        newPlayer.GM = false;
        newPlayer.lastAnswer = "";

        gameTalk.intPlayers.push(newPlayer);
        gameTalk.numPlayers++;
        gameTalk.curPlayer.send("Get ready to play!");
        gameTalk.retMes = "Player " + newPlayer.playerObj.username + " added to game.";
    }

    return gameTalk;
}

module.exports.removePlayer = function (i_user) {
    if (singleGame.intPlayers[i_user.username] != undefined) {
        singleGame.intPlayers[i_user.username] = null;
        var playerIndex = singleGame.intPlayerNames.indexOf(i_user.username);
        singleGame.intPlayerNames = singleGame.intPlayerNames.slice(playerIndex, 1);

        i_user.send("It was fun playing with you!");
    }
};

//TODO: rework, simplify - do we need GM as a user object? why not flag?
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
    var playerData = getCurPlayer(gameTalk);
    var uName = playerData.playerObj.username;

    if (playerData.playerObj.username == undefined)
        return;

    //TODO: check if player has answered already
    playerData.lastAnswer = gameTalk.args;
    gameTalk.playersAnswered++;

    if (playerData.GM == true)
        gameTalk.GM.send("New answer from " + uName + ": " + gameTalk.args);

    notifySpectators(gameTalk, "New answer from " + uName + ": " + gameTalk.args);

logger.info(gameTalk.playersAnswered);
logger.info(gameTalk.intPlayers.length);

    //TODO: change from intPlayerNames.length to count variable?
    //All players sent an answer, and we previously sent a vocabulary question
    if (gameTalk.playersAnswered == gameTalk.intPlayers.length && gameTalk.sentQuest == true) {
        tmpText = "Question was to translate: " + gameTalk.lastQuest[0].tlh + "\r\n";
        tmpText += "The correct answer was: " + gameTalk.lastQuest[0].en + "\r\n";
        tmpText += "\r\n";
        tmpText += "The other possible answers have been:\r\n";
        tmpText += gameTalk.lastQuest[1].tlh + " => " + gameTalk.lastQuest[1].en + "\r\n";
        tmpText += gameTalk.lastQuest[2].tlh + " => " + gameTalk.lastQuest[2].en + "\r\n";
        tmpText += gameTalk.lastQuest[3].tlh + " => " + gameTalk.lastQuest[3].en + "\r\n";

        gameTalk.intPlayers.forEach(function (player){
            tmpText += "\r\n Player " + player.playerObj.username +  " answered: " + player.lastAnswer + "\r\n";
            if (player.lastAnswer == gameTalk.corAnswer)
                intGivePoints2CurPlayer(gameTalk, 5);
        });

        notifyPlayers(gameTalk, tmpText);
        notifyGM(gameTalk, tmpText);
        notifySpectators(gameTalk, tmpText);
    }

    gameTalk.retMes = "Answer sent.";
    return gameTalk;
}

function addSpectator(gameTalk) {
    if (gameTalk.specChannel.indexOf(gameTalk.args) == -1) {
        gameTalk.specChannel.push(gameTalk.args);
        gameTalk.args.send("This channel is now set to spectate the spectacle!");
    }
}

function intGivePoints2CurPlayer(gameTalk, i_points) {
    var playerData = getCurPlayer(gameTalk);
    playerData.playerPoints += i_points;
}

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

function setTarget(gameTalk) {
    //Nur GM
    if (gameTalk.curPlayer.userid == gameTalk.GM.userid) {
        gameTalk.targetPoints = gameTalk.args;
        notifyPlayers(gameTalk, "GM set new target points: " + gameTalk.args);
        notifySpectators(gameTalk, "GM set new target points: " + gameTalk.args);
    }
}

function getQuestion(gameTalk) {
    var rawQuestion;
    var curPlayer = getCurPlayer(gameTalk);

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
    if (curPlayer.GM == true) {
        rawText += "DO NOT COPY: ANSWER:" + rawQuestion[0].en + "\r\n";
        rawText += "debug:" + ans1 + ans2 + ans3 + ans4;
    }
    finText = rawText;

    gameTalk.sentQuest = true;
    //Store correct answer as abcd to check later
    if (ans1 == 0)
        gameTalk.corAnswer = "a";
    else if (ans2 == 0)
        gameTalk.corAnswer = "b";
    else if (ans3 == 0)
        gameTalk.corAnswer = "c";
    else if (ans4 == 0)
        gameTalk.corAnswer = "d";

    gameTalk.retMes = finText;
    return gameTalk;
}

//Utilities
module.exports.myPoints = function (i_user) {
    i_user.send(singleGame.intPlayers[i_user.username].playerPoints);
};

function notifyPlayers(gameTalk, i_text) {
    gameTalk.intPlayers.forEach(function (player) {
        player.playerObj.send(i_text);
    });
}

function notifySpectators(gameTalk, i_text) {
    gameTalk.specChannel.forEach(function (channel) {
        channel.send(i_text);
    });
}

function notifyPlayersPoints(gameTalk) {
    gameTalk.intPlayers.forEach(function (player) {
        player.playerObj.send("Current points: " + player.playerPoints);
    });
}

function notifyGM(gameTalk, i_text) {
    if (gameTalk.GM != null)
        gameTalk.GM.send(i_text);
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

    return quests;
}