var wamaH = require('./wamaH.js');

/*
  Generic game interface
*/
var userGameList = new Array();
var aIdx = null;

module.exports.runGames = function(bot, userID, message, sndMessage)
{
	var args = message.substring(1).split(' ');
	var cmd = args[0];
	
		//This also sets aIdx!
	var userGame = getUGL(userID);
	if (aIdx == null)
	{
		//Momentan das einzige Spiel
		if (args[1] == undefined || args[1] != 'wa\'maH')
		{
			sndMessage  = 'Do you want to play a game? Currently, I only know *wa\' cha\' wa\'maH*.\n';
			sndMessage += 'Please use the command *%wa\'maH* to start the game';
		}
		else
		{
			userGameList.push(
			{
				userID: userID,
				game: "wa'maH",
				cmd: "wamaH",
				score: '0'				
			});
			sndMessage = wamaH.initGame;
		}		
	}
	else
	{
		//We know the user is currently playing a game
		userGame[cmd]();
	}
	
	sndMessage = 'Testing';
}


function getUGL(userID)
{
	return userGameList.filter(function (UG, iIdx)
	{
		if (UG.userID == userID)
		{
			aIdx = iIdx;
			return UT
		}
	}
	);
}