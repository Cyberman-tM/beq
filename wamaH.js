/*
  wa', cha', wa'maH
  a game by Joel Peter Anderson
  
  http://mrklingo.freeshell.org/aol/JPKlingon/game/index.html
*/


var userGames = new Array();
var aIdx = null;

module.exports.initGame = 'maj. DaH maQujchoH!\n';
module.exports.initGame += 'Rules: write % and either wa\' or cha\', followed by a blank and the TOTAL score so far.\n';
module.exports.initGame += "Whoever reaches wa'maH first has won. If you want beq to begin, start with *%pagh pagh*";

//Does this overwrite other run exports?
module.exports.run = function(bot, userID, message, sndMessage)
{
	var args = message.substring(1).split(' ');
	var cmd = args[0];
	
	//This also sets aIdx!
	var userGame = getUserGame(userID);
	if (aIdx == null)
	{
	}
	else
	{
		var userVal = translateWord2Number(args[1]);
		var userScore = translateWord2Number(args[2]);
		if (userVal > 2 ||
		    ( userGame.score + userVal !=  userScore ) ||
			userScore > 10 )
		{
			sndMessage = "Qo'! bIluj.";
			
			//Remove user
			userGames = userGames.splice(aIdx, 1);
		}
		else if ( userScore == 10 )
		{
			sndMessage = "majQa'!";
		}
		else
		{
			//Lets play
			var RNG = Math.random() * 100;
			var aiScore = 0;
			
			if (userGames.score < 8)				
				if (RNG > 50)
					aiScore = 2;
				else
					aiScore = 1;
			else
				aiScore = 10 - userGames.score;
			
			userGames.score += aiScore;
					
			if (userGames.score == 10)
				sndMessage = "Qapla'! jIDunqu'! :-)";
			else
				sndMessage = translateWord2Number(aiScore) + ' ' + translateWord2Number(userGames.score);
		}
	}	
}


function getUserGame(userID)
{
	return userGames.filter(function (UG, iIdx)
	{
		if (UG.userID == userID)
		{
			aIdx = iIdx;
			return UT
		}
	}
	);
}

function translateWord2Number(word)
{
	switch(word)
	{
	case "pagh":
	   return 0;
	   break;
	case "wa'":
	   return 1;
	   break;
	case "cha'":
	   return 2;
	   break;
	case "wej":
	   return 3;
	   break;
	case "loS":
	   return 4;
	   break;
	case "vagh":
	   return 5;
	   break;
	case "jav":
	   return 6;
	   break;
	case "Soch":
	   return 7;
	   break;
	case "chorgh":
	   return 8;
	   break;
	case "Hut":
	   return 9;
	   break;
	case "wa'maH":
	   return 10;
	break;
	}

//Should never happen
return null;	
}

function translateNumber2Word(Number)
{
	switch(Number)
	{
	case 0:
	   return "pagh";
	   break;
	case 1:
	   return "wa'";
	   break;
	case 2:
	   return "cha'";
	   break;
	case 3:
	   return "wej";
	   break;
	case 4:
	   return "loS";
	   break;
	case 5:
	   return "vagh";
	   break;
	case 6:
	   return "jav";
	   break;
	case 7:
	   return "Soch";
	   break;
	case 8:
	   return "chorgh";
	   break;
	case 9:
	   return "Hut";
	   break;
	case 10:
	   return "wa'maH";
	break;
	}

//Should never happen
return null;	
}













