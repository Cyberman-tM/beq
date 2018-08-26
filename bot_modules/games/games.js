var logger = require('winston');

var wamaH = require('./wamaH.js');
var gameTalkDef = require('./gameTalkDef.js');

/*
  Generic game interface
*/

module.exports.verGame = "Game Engine 0.0.1 - the beginning\n";
module.exports.verGame += wamaH.gameInfo;
//gameTalkDef = JSON.stringify(gameTalkDef);

var userGameList = new Array();
var aIdx = null;

module.exports.runGames = function(bot, userID, message)
{
	var args = message.substring(1).split(' ');
	var cmd = args[0];
	var gameTalk = gameTalkDef;
	gameTalk.userID = userID;
	
	gameTalk.message = "You should never see this! Something went wrong...";
	aIdx = null;
	var userGame = getUGL(userID);
	if (aIdx == null)
	{
		//Kein aktives Spiel gefunden => Liste der Spiele
		//Momentan das einzige Spiel
		if (cmd == undefined || cmd != 'wa\'maH')
		{
			gameTalk.message  = 'Do you want to play a game? Currently, I only know *wa\' cha\' wa\'maH*.\n';
			gameTalk.message += 'Please use the command *%wa\'maH* to start the game';
		}
		else
		{
			var gameRun = wamaH.init(gameTalkDef);
			//Noch kein aktives Spiel, User will Spiel XY aktivieren:
			userGameList.push(
			{
				userID: userID,
				game: "wa'maH",
				cmd: gameRun
			});
			gameTalk.message = wamaH.preGame;
			gameTalk.playGame = "wa'maH";
		}		
	}
	else
	{
		//We know the user is currently playing a game				
		userGame = userGame[0];
		gameTalk.cmd = message.substring(1);
		
		gameTalk = userGame.cmd(gameTalk);
		
		if (gameTalk.noGame == true)
			userGameList.splice(aIdx,1);
	}	

	return gameTalk;
}

function getUGL(userID)
{
	return userGameList.filter(function (UG, iIdx)
	{
		if (UG.userID == userID)
		{
			aIdx = iIdx;
			return UG
		}
	}
	);
}
