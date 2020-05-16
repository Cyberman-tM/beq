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

//Basic data structure - similar to beqTalk with the beq engine
var gameTalk = {
    intPlayers: [{
        playerObj: {},
        playerPoints: 0,
        isGM: false,
        lastAnswer: ""
    }],
    curPlayer: {},
    numPlayers: 0,
    playersAnswered: 0,
    command: "",
    args: {},
    retMes: "empty message",
    sentQuest: false,
    targetPoints: 50,
    lastQuest: null,
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

    //Generic functions that can be called by anyone
    if (gameTalk.command == "NOP") {
        //Do nothing, this is something that needs to be done in the bot
    }
    else if (gameTalk.command == "add")
        gameTalk = addPlayer(gameTalk);
    else if (gameTalk.command == "spectate")
        gameTalk = addSpectator(gameTalk);

    //Functions that need an active player
    if (getCurPlayerIndex(gameTalk) != -1) {

        if (getCurPlayerData(gameTalk).isGM) {
            //GM functions
        }
        else {

            if (gameTalk.command == "sendanswer")
                gameTalk = sendAnswer(gameTalk);
            else if (gameTalk.command == "getquestion")
                gameTalk = getQuestion(gameTalk);
            else if (gameTalk.command == "newtarget")
                gameTalk = setTarget(gameTalk);
        }
    }

    //We just processed a command - make sure it doesn't get processed again
    //if the main program doesn't clean up
    gameTalk.command = "NOP";

    return gameTalk;
};

function addPlayer(gameTalk) {
    var newPlayer = getCurPlayerData(gameTalk);
    if (newPlayer == null) {

        //If this is the first time, the zero entry is likely the empty object - we should remove it, no one needs it anymore
        //(It only exists so that the structure above is listed and we can check for *something*)
        if (gameTalk.intPlayers[0].playerObj.id == undefined)
            gameTalk.intPlayers.splice(0, 1);

        //Make sure this is the same structure as above!
        newPlayer = {};
        newPlayer.playerObj = gameTalk.curPlayer;
        newPlayer.playerPoints = 0;
        newPlayer.isGM = false;
        newPlayer.lastAnswer = "";

        gameTalk.intPlayers.push(newPlayer);
        gameTalk.numPlayers++;
        gameTalk.curPlayer.send("Get ready to play!");
        gameTalk.retMes = "Player " + newPlayer.playerObj.username + " added to game.";
    }

    return gameTalk;
}

function removePlayer(gameTalk) {
    var playerData = getCurPlayerData(gameTalk);

    if (playerData != null) {
        var playerIndex = getCurPlayerIndex(gameTalk);

        playerData.playerObj.send("It was fun playing with you!");
        gameTalk.intPlayers.playerObj = null;
        gameTalk.intPlayers.splice(playerIndex, 1);
    }
}

//TODO: rework, simplify - do we need GM as a user object? why not flag?
module.exports.addGM = function (i_user) {
    var tmpRet = "";
    if (singleGame.isGM == null) {
        singleGame.isGM = i_user;
        tmpRet = "You are GM now";
    }
    else
        tmpRet = "We already have a GM:" + singleGame.isGM.username;

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
    if (singleGame.isGM != null && i_user.userid == singleGame.isGM.userid) {
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

    if (i_user.userid == singleGame.isGM.userid) {
        notifyPlayers(l_question);
        singleGame.playersAnswered = 0;
        singleGame.sentQuest = true;

        notifySpectators("GM sent a new question: " + i_question + "\r\n");
    }
};

function sendAnswer(gameTalk) {
    var tmpText = "";
    var playerData = getCurPlayerData(gameTalk);
    var uName = playerData.playerObj.username;
    var winner = null;

    if (playerData.playerObj.username == undefined)
        return;

    if (playerData.lastAnswer == "") {
        playerData.lastAnswer = gameTalk.args;
        gameTalk.playersAnswered++;

        notifyGM(gameTalk, "New answer from " + uName + ": " + gameTalk.args);

        notifySpectators(gameTalk, "New answer from " + uName + ": " + gameTalk.args);

        //All players sent an answer, and we previously sent a vocabulary question
        if (gameTalk.playersAnswered == gameTalk.numPlayers && gameTalk.sentQuest == true) {
            tmpText = "Question was to translate: " + gameTalk.lastQuest[gameTalk.lastQuest.theQuest].tlh + "\r\n";
            tmpText += "The correct answer was: " + gameTalk.lastQuest[gameTalk.lastQuest.theQuest].en + "\r\n";
            tmpText += "\r\n";
            tmpText += "The other possible answers have been:\r\n";

            gameTalk.lastQuest.forEach(function (item, index) {
                if (index == gameTalk.lastQuest.theQuest)
                    return;
                tmpText += item.tlh + " => " + item.en + "\r\n";
            });

            gameTalk.intPlayers.forEach(function (player) {
                tmpText += "\r\n Player " + player.playerObj.username + " answered: " + player.lastAnswer;
                if (player.lastAnswer == gameTalk.lastQuest.theQuest)
                    intGivePoints2CurPlayer(gameTalk, 5);
                tmpText += " (points now: " + player.playerPoints + ")";
                tmpText += "\r\n";

                if (player.PlayerPoints >= gameTalk.targetPoints)
                    winner.push(player);
            });

            //Check for winner and prepare congratulations
            if (winner != null)
                if (winner.length > 0) {
                    tmpText += "Point limit of " + gameTalk.targetPoints + " reached!\r\n";
                    tmpText += "Congratulations, ";
                    if (winner.length > 1)
                        winner.forEach(function (aWinner) {
                            tmpText += aWinner.playerObj.username + ",";
                        });
                    else
                        tmpText += winner[0].playerObj.username;

                    tmpText += "!\r\n";
                }

            notifyPlayers(gameTalk, tmpText);
            notifyGM(gameTalk, tmpText);
            notifySpectators(gameTalk, tmpText);

            //Reset data
            gameTalk.sendQuest = false;
            gameTalk.playersAnswered = 0;
            gameTalk.lastQuest = null;
        }

        gameTalk.retMes = "Answer sent.";
    }
    else
        gameTalk.retMes = "You already answered!";

    return gameTalk;
}

function addSpectator(gameTalk) {
    if (gameTalk.specChannel.indexOf(gameTalk.args) == -1) {
        gameTalk.specChannel.push(gameTalk.args);
        gameTalk.args.send("This channel is now set to spectate the spectacle!");
    }
}

function intGivePoints2CurPlayer(gameTalk, i_points) {
    var playerData = getCurPlayerData(gameTalk);
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
    if (gameTalk.curPlayer.userid == gameTalk.isGM.userid) {
        gameTalk.targetPoints = gameTalk.args;
        notifyPlayers(gameTalk, "GM set new target points: " + gameTalk.args);
        notifySpectators(gameTalk, "GM set new target points: " + gameTalk.args);
    }
}

function getQuestion(gameTalk) {
    var rawQuestion;
    var curPlayer = getCurPlayerData(gameTalk);

    //Only get a new question if all have answered the last question already
    if (gameTalk.playersAnswered == 0 && gameTalk.lastQuest == null) {
        rawQuestion = gameTalk.lastQuest = getRandomWords(gameTalk.args);
        //This is the question we ask, the correct answer
        rawQuestion.theQuest = Math.floor(Math.random() * (gameTalk.args));

        var finText = "";

        var rawText = "";
        rawText += "Translate the following from klingon:\r\n";
        rawText += "(Type: " + bT.getWType(rawQuestion[rawQuestion.theQuest].type, "en") + ")\r\n";
        rawText += "\r\n";
        rawText += "==> " + rawQuestion[rawQuestion.theQuest].tlh + "\r\n";
        rawText += "\r\n";
        rawText += "Possible answers:\r\n";
        var listCount = 0;
        rawQuestion.forEach(function (item) {
            listCount++;
            rawText += listCount + ") " + item.en + "\r\n";
        });
        rawText += "\r\n";
        if (curPlayer.isGM == true) {
            rawText += "DO NOT COPY: ANSWER:" + rawQuestion[rawQuestion.theQuest].en + "\r\n";
        }
        finText = rawText;

        gameTalk.sentQuest = true;
        gameTalk.retMes = finText;

        //Rest last answers
        gameTalk.intPlayers.forEach(function (item) {
            item.lastAnswer = "";
        });
        gameTalk.playersAnswered = 0;
    }
    else
        gameTalk.retMes = "Previous question has not been completed!";

    return gameTalk;
}

//Utilities
module.exports.myPoints = function (i_user) {
    i_user.send(singleGame.intPlayers[i_user.username].playerPoints);
};

//Get current player's data
function getCurPlayerData(gameTalk) {
    var tmpRet = null;
    gameTalk.intPlayers.forEach(function (player) {
        if (player.playerObj.id == gameTalk.curPlayer.id)
            tmpRet = player;
    });

    return tmpRet;
}

//Get current player's INDEX
function getCurPlayerIndex(gameTalk) {
    var tmpRet = -1;
    gameTalk.intPlayers.forEach(function (player, myIndex) {
        if (player.playerObj.id == gameTalk.curPlayer.id)
            tmpRet = myIndex;
    });

    return tmpRet;
}

//GetGM
function getGM(gameTalk) {
    var tmpRet = null;
    gameTalk.intPlayers.forEach(function (player) {
        if (player.isGM)
            tmpRet = player;
    });

    return tmpRet;
}

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
    var GM = getGM(gameTalk);
    if (GM != null)
        GM.playerObj.send(i_text);
}

//Get a random word, then get additional results to offer multiple choice
function getRandomWords(i_numResults) {
    var quests = [];

    do {
        //Get additional questions
        var tmpWord = myKDBJSon[Math.floor(Math.random() * (myKDBJSon.length))];

        //Not hypothetical or derived? Or reginal?
        if (!(bT.isHyp(tmpWord.type) || bT.isDerived(tmpWord.type) || bT.isReg(tmpWord.type)))
            //Weitere Einschränkungen - Wortart, Herkunft? Nur Worte von XXXX?
            if (1 == 1) {
                var noGood = false;
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