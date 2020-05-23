/*
   New game experiment - "register" multiple players
*/
var requestify = require('requestify');
var winston = require('winston');
var logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console()
    ]
});
var bT = require('../utils/boQwI_translate.js');
var kTranscode = require('./../utils/recode.js');

var myKDBJSon = null;

//Basic data structure - similar to beqTalk with the beq engine
var gameTalk = {
    intPlayers: [{
        playerObj: {},
        playerPoints: 0,
        lastAnswer: ""
    }],
    questObj: {},                      //Type questObj, see below
    curPlayer: {},
    numPlayers: 0,
    playersAnswered: 0,
    lastQuestFinished: true,           //Initial value needs to be true
    questFinished: false,
    command: "",
    args: {},
    targetPoints: 0,                   //Not used anymore!
    retMes: "empty message",
    sentQuest: false,                  //NOt used anymore!
    lastQuest: null,                   //Not used anymore!
    specChannel: []
};
module.exports.gameTalkDef = JSON.stringify(gameTalk);

var allQuests = [];

//Testobjekt - enthält Fragen und administrative Daten
var questObj = {
    daten: [{
        questType: 0,      //1 - Übersetzung, 2 - komplexe Aufgabe
        questQuestion: "", //Bei Typ 1 das klingonische Wort das übersetzt wird, bei Typ 2 die Frage/Aufgabe, wird direkt ausgegeben
        questAnswer: "",   //nur für questType 2 relevant! Das ist die erwartete Antwort, bei 1 wird die Antowort automatisch gefunden
        questDupes: 3,     //Anzahl "falscher" Antworten, nur bei questType 1 relevant!
        questObj: {},      //Bei Typ 1: Array mit richtiger und falschen Antworten, um sie am Ende anzuzeigen
        answerType: 0,     //Art der Antwort: Multiple Choice tlh->en, 2) Multiple Choice en->tlh, 3) en anzeigen, klingonisches Wort eingeben 4) direkte Eingabe der Antwort
        questPoints: 10     //Punkte die diese Frage wert ist
    }],
    allowRandom: false,    //Should we shuffle the questions?
    curQuest: -1,           //Index of current question, not set by creator but used by engine, needs to be -1 because of increment
    points2Win: 100
};
module.exports.questObjDef = JSON.stringify(questObj);

//Called when the bot starts up - prepare data for later
module.exports.initGame = function (KDBJSon) {
    myKDBJSon = null;
    myKDBJSon = KDBJSon;
};

//Similar to the beqEngine, this is the GameEngine
module.exports.GameEngine = function (gameTalk) {

    //Default message, in case the function doesn't set anything...
    gameTalk.retMes = "Everything fine, I guess?";
    //Generic functions that can be called by anyone
    if (gameTalk.command == "NOP") {
        //Do nothing, this is something that needs to be done in the bot
    }
    else if (gameTalk.command == "add")
        gameTalk = addPlayer(gameTalk);
    else if (gameTalk.command == "spectate")
        gameTalk = addSpectator(gameTalk);
    else if (gameTalk.command == "load")
        intLoadQuest(gameTalk);

    //Functions that need an active player
    if (getCurPlayerIndex(gameTalk) != -1) {
        if (gameTalk.command == "sendanswer")
            gameTalk = sendAnswer(gameTalk);
        else if (gameTalk.command == "getquestion")
            gameTalk = getQuestion(gameTalk);
        else if (gameTalk.command == "start")
            gameTalk = startQuest(gameTalk);
    }

    //We just processed a command - make sure it doesn't get processed again
    //if the main program doesn't clean up
    gameTalk.command = "NOP";

    return gameTalk;
};

function startQuest(gameTalk)
{
    gameTalk.retMes = "Quest not found. Try again.";
    var myQuest = allQuests.find(function (item) {
        if (item.name == gameTalk.args)
            return true;
    });

    if (myQuest != undefined)
    {
        gameTalk = intLoadQuestObj(gameTalk, myQuest)
        gameTalk.retMes = "Questionaire loaded, ready to start!";
    }

    return gameTalk;
}

function intLoadQuest(gameTalk) {
    var myQuest = gameTalk.args.split(",")[0];
    var myUrl = gameTalk.args.split(",")[1];
    var infoPlayer = gameTalk.curPlayer;

    //If we have nothing in myUrl, then something went wrong
    if (myUrl != undefined) {
        gameTalk.curPlayer.send("Loading Quest " + myQuest + " with URL " + myUrl);

        requestify.get(myUrl).then(function (response) {
            var tmpQO = response.getBody();

            //Do we have a quest with this name already?
            var newQuest = allQuests.find(function (item) {
                if (item.name == myQuest)
                    return true;
            });

            //Yes, overwrite
            if (newQuest != undefined)
                newQuest.quest = tmpQO;
            else {
                //No, create new entry in array
                newQuest = {};
                newQuest.name = myQuest;
                newQuest.quest = tmpQO;
                allQuests.push(newQuest);
            }
            infoPlayer.send("Quest received and stored as " + myQuest);
        });
    }
}

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
        newPlayer.lastAnswer = "";

        gameTalk.intPlayers.push(newPlayer);
        gameTalk.numPlayers++;
        gameTalk.curPlayer.send("Get ready to play!");
        gameTalk.retMes = "Player " + newPlayer.playerObj.username + " added to game.";
    }

    return gameTalk;
}
function intLoadQuestObj(gameTalk, myquestObj) {

    if (myquestObj.allowRandom == true)
        shuffleArray(myquestObj.daten);

    gameTalk.questObj = myquestObj;
    gameTalk.playersAnswered = 0;
    return gameTalk;
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
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

/*
module.exports.listPlayers = function () {
    var tmpRet = "";
    singleGame.intPlayerNames.forEach(function (name) {
        tmpRet += name;
        tmpRet += "\n" + singleGame.intPlayers[name].playerPoints;
    });

    return tmpRet;
};
*/

function sendAnswer(gameTalk) {
    var tmpText = "";
    var playerData = getCurPlayerData(gameTalk);
    var curQuest = gameTalk.questObj.daten[gameTalk.questObj.curQuest];
    var corAnswer = false;
    var corAnswerText = "";

    gameTalk.retMes = "Catastrophic error! You should NEVER see this. sendAnswer error.";

    if (playerData.playerObj.username == undefined) {
        gameTalk.retMes = "You are not currently playing?";
        return gameTalk;
    }

    if (playerData.lastAnswer == "") {
        playerData.lastAnswer = gameTalk.args;
        gameTalk.playersAnswered++;

        //Multiple Choice - translate answer to word
        if (curQuest.answerType == 1)
            playerData.lastAnswer = curQuest.questObj[playerData.lastAnswer].en;
        else if (curQuest.answerType == 2)
            playerData.lastAnswer = curQuest.questObj[playerData.lastAnswer].tlh;

        if (curQuest.questType == 1) {
            if (curQuest.answerType == 2 || curQuest.answerType == 3) {
                corAnswerText = curQuest.questAnswer.tlh;
                if (playerData.lastAnswer == corAnswerText)
                    corAnswer = true;
            }
            else if (curQuest.answerType == 1) {
                corAnswerText = curQuest.questAnswer.en;
                if (playerData.lastAnswer == corAnswerText)
                    corAnswer = true;
            }
        }
        else if (curQuest.questType == 2 && curQuest.answerType == 4) {
            corAnswerText = curQuest.questAnswer;
            if (playerData.lastAnswer == curQuest.questAnswer)
                corAnswer = true;
        }

        if (corAnswer == false)
            tmpText = "Sorry, that answer was wrong.\r\n";
        else {
            tmpText = "Great, that was the correct answer!\r\n";
            playerData.playerPoints += curQuest.questPoints;
        }

        if (gameTalk.playersAnswered == gameTalk.intPlayers.length) {
            tmpText += "Task was: *" + curQuest.questQuestion + "*\r\n";
            tmpText += "Correct answer was: " + corAnswerText + "\r\n";
            tmpText += "Answers given: \r\n";
            gameTalk.intPlayers.forEach(function (item) {
                tmpText += item.playerObj.username + ": " + item.lastAnswer + "\r\n";
            });
            gameTalk.playersAnswered = 0;
            gameTalk.lastQuestFinished = true;

            notifyPlayers(gameTalk, tmpText);
            notifySpectators(gameTalk, tmpText);
            tmpText = "pItlh";

            //All questions answered - show final points
            if (gameTalk.questFinished == true) {
                var tmpText2 = "";
                tmpText2 = "That have been all the questions! Final points total:\r\n";
                gameTalk.intPlayers.forEach(function (item) {
                    tmpText2 += item.playerObj.username + ": " + item.playerPoints;
                    if (item.playerPoints >= gameTalk.questObj.targetPoints)
                        tmpText2 += "<== Reached target Points! majQa\'!";
                    tmpText2 += "\r\n";
                });

                notifyPlayers(gameTalk, tmpText2);
                notifySpectators(gameTalk, tmpText2);
            }

        }
        else
            tmpText += "\r\nThe correct answer will be revealed once all have answered!";

        gameTalk.retMes = tmpText;
    }
    else
        gameTalk.retMes = "You already answered!";

    return gameTalk;
}
function sendAnswerOld(gameTalk) {
    var tmpText = "";
    var playerData = getCurPlayerData(gameTalk);
    var uName = playerData.playerObj.username;
    var winner = null;

    if (playerData.playerObj.username == undefined)
        return;

    if (playerData.lastAnswer == "") {
        playerData.lastAnswer = gameTalk.args;
        gameTalk.playersAnswered++;

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
                    player.playerPoints += 5;

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
    if (gameTalk.intPlayers.length > 0)
        if (gameTalk.specChannel.indexOf(gameTalk.args) == -1) {
            gameTalk.specChannel.push(gameTalk.args);
            gameTalk.args.send("This channel is now set to spectate the spectacle!");
        }
        else
            gameTalk.retMes = "No one is playing right now.";
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
    }
};


function getQuestion(gameTalk) {
    var tmpText = "";
    var questWord = [];

    gameTalk.retMes = "Catastrophic error! You should NEVER see this. getQuestion error.";

    //Only get a new question if all have answered the last question already
    if (gameTalk.playersAnswered == 0 && gameTalk.lastQuestFinished == true && gameTalk.questFinished == false) {
        var nextQuest = gameTalk.questObj.daten[++gameTalk.questObj.curQuest];
        if (gameTalk.questObj.curQuest == (gameTalk.questObj.daten.length - 1))  //Index is zero based, length is 1based
            gameTalk.questFinished = true;

        //Translation
        if (nextQuest.questType == 1) {
            //Get complete word - is there a better way?`
            var klingonWord = kTranscode.RCu32tlh(nextQuest.questQuestion.split(';;')[0]);
            var typeWord = nextQuest.questQuestion.split(';;')[1];

            questWord.push(myKDBJSon.find(function (item) {
                if (item.tlh == klingonWord && item.type == typeWord)
                    return true;
            }));
            intGetRandomWords(questWord, nextQuest.questDupes);
            nextQuest.questAnswer = questWord[0];
            nextQuest.questObj = questWord;

            //Shuffle answers to make sure everything is random
            shuffleArray(questWord);
        }

        //Construct question text:
        if (nextQuest.questType == 1) {
            tmpText = "Object to translate: ";
            nextQuest.questQuestion = "Translate: ";
        }
        else {
            tmpText = "Solve this: ";
            nextQuest.questQuestion = "Answer: " + nextQuest.questQuestion;
        }

        if (nextQuest.answerType == 1) {
            tmpText += nextQuest.questAnswer.tlh;
            tmpText += "\r\nSelect the correct english answer:\r\n";
            nextQuest.questQuestion += nextQuest.questAnswer.tlh;
        }
        else if (nextQuest.answerType == 2) {
            tmpText += nextQuest.questAnswer.en;
            tmpText += "\r\nSelect the correct klingon answer:\r\n";
            nextQuest.questQuestion += nextQuest.questAnswer.en;
        }
        else if (nextQuest.answerType == 3) {
            tmpText += nextQuest.questAnswer.en;
            tmpText += "\r\nEnter the correct klingon answer:\r\n";
            nextQuest.questQuestion += nextQuest.questAnswer.en;
        }
        else if (nextQuest.answerType == 2) {
            tmpText += nextQuest.questQuestion;
            tmpText += "\r\nEnter the correct answer:\r\n";
        }

        //Multiple Choice -> offer choices
        if (nextQuest.questType == 1 && nextQuest.answerType != 3) {
            questWord.forEach(function (item, index) {
                tmpText += index + ") ";

                if (nextQuest.answerType == 1)
                    tmpText += item.en;
                else if (nextQuest.answerType == 2)
                    tmpText += item.tlh;

                tmpText += "\r\n";
            });
        }

        gameTalk.retMes = tmpText;
        gameTalk.playersAnswered = 0;
        gameTalk.lastQuestFinished = false;

        //Reset last answers
        gameTalk.intPlayers.forEach(function (item) {
            item.lastAnswer = "";
        });

    }
    else if (gameTalk.questFinished == true)
        gameTalk.retMes = "Questionaire is finished! Start another?";
    else
        gameTalk.retMes = "Previous question has not been answered!";

    return gameTalk;
}

//Old system
function getQuestionOld(gameTalk) {
    var rawQuestion;
    var curPlayer = getCurPlayerData(gameTalk);

    //Only get a new question if all have answered the last question already
    if (gameTalk.playersAnswered == 0 && gameTalk.lastQuest == null) {
        rawQuestion = gameTalk.lastQuest = intGetRandomWords(gameTalk.args);
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
    if (gameTalk.intPlayers != undefined && gameTalk.intPlayer != null)
        if (gameTalk.intPlayers.length > 0)
            gameTalk.intPlayers.forEach(function (player, myIndex) {
                if (player.playerObj.id == gameTalk.curPlayer.id)
                    tmpRet = myIndex;
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

//Get a random word, then get additional results to offer multiple choice
function intGetRandomWords(i_quests, i_numResults) {

    do {
        //Get additional questions
        var tmpWord = myKDBJSon[Math.floor(Math.random() * (myKDBJSon.length))];

        //Not hypothetical or derived? Or reginal?
        if (!(bT.isHyp(tmpWord.type) || bT.isDerived(tmpWord.type) || bT.isReg(tmpWord.type)))
            //Weitere Einschränkungen - Wortart, Herkunft? Nur Worte von XXXX?
            if (1 == 1) {
                var noGood = false;
                i_quests.forEach(function (item) {
                    if (item.type != tmpWord.type || item.tlh == tmpWord.tlh || item.en == tmpWord.en)
                        noGood = true;
                });
                if (noGood == false)
                    i_quests.push(tmpWord);
            }
    }
    while (i_quests.length < i_numResults);

    return i_quests;
}