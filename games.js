var wamaH = require('./wamaH.js');

/*
  Generic game interface
*/

//This structure is used for the bot to talk with the GAme Engine and vice versa
//It is NOT used by the game internally
module.exports.gameTalkDef = JSON.stringify(
{
	"userID": "",         //Current user
	"playGame": "",       //Game he wants to play
	"cmd": "",            //command or parameters to the game
	"message": "",        //Return message of the game (current score, you win, etc...)
	"noGame": false,      //No game was requested, error
	"newline": "\n",      //newline character - \n for text, or <br> for web, or whatever
	"reserved": "nothing" //There may be more to come	
});


var userGameList = new Array();
var aIdx = null;

module.exports.runGames = function(bot, userID, message)
{
	var args = message.substring(1).split(' ');
	var cmd = args[0];
	var gameTalk = JSON.parse(module.exports.gameTalkDef);
	gameTalk.userID = userID;
	
	gameTalk.message = "You should never see this! Something went wrong...";
		//This also sets aIdx!
	var userGame = getUGL(userID);
	if (aIdx == null)
	{
		//Kein aktives Spiel gefunden => Liste der Spiele
		//Momentan das einzige Spiel
		if (cmd == undefined || cmd != 'wa\'maH')
		{
			sndMessage  = 'Do you want to play a game? Currently, I only know *wa\' cha\' wa\'maH*.\n';
			sndMessage += 'Please use the command *%wa\'maH* to start the game';
		}
		else
		{
			var gameRun = wamaH.init(module.exports.gameTalkDef);
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
			userGameList.splice(aIdx);
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