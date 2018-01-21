/*
  wa', cha', wa'maH
  a game by Joel Peter Anderson
  
  http://mrklingo.freeshell.org/aol/JPKlingon/game/index.html
*/


var userGames = new Array();
var aIdx = null;
var gameTalkDef = "";

var userGameDef = JSON.stringify(
{
	"userID": "",
	"curCount": 0
});

module.exports.preGame = 'maj. DaH maQujchoH!\n';
module.exports.preGame += 'Rules: write % and either wa\' or cha\', followed by a blank and the TOTAL score so far.\n';
module.exports.preGame += "Whoever reaches wa'maH first has won. If you want beq to begin, start with *%pagh pagh*";

//Does this overwrite other run exports?
module.exports.run = function(gameTalk)
{
	//All we should get is two numbers
	var args = gameTalk.cmd.split(' ');
	var num1 = args[0];
	var num2 = args[1];
	
	gameTalk.message = "wa'maH game was called, but did nothing?";
	
	//We need TWO parameters
	if (num1 == undefined || num2 == undefined)
	{
		gameTalk.noGame = true;
		gameTalk.message = "Missing parameters, try again!";
	}
	else if (!isNaN(num1) || !isNaN(num2))
	{
		gameTalk.noGame = true;
		gameTalk.message = "Qo'! tlhIngan Hol yIghItlhnIS!";
	}	
	
	//Only if we didn't already determine the input is faulty
	if (gameTalk.noGame == false)
	{
		//This also sets aIdx!
		var userGame = getUserGame(gameTalk.userID);	
		if (aIdx == null)
		{
			//Prepare new game board
			var UG = JSON.parse(userGameDef);
			UG.userID = gameTalk.userID;
			UG.curCount = 0;
			userGames.push(UG);
			
			userGame = getUserGame(gameTalk.userID);			
		}
		
		userGame = userGame[0];
		var userVal = translateWord2Number(num1);
		var userScore = translateWord2Number(num2);
		
		if (userVal > 2 ||
			( userGame.curCount + userVal !=  userScore ) ||
			userScore > 10 )
		{
			gameTalk.message = "Qo'! bIluj.";
			gameTalk.noGame = true;
		}
		else if ( userScore == 10 )
		{
			gameTalk.message = "*wa'maH!*  majQa'!";
			gameTalk.noGame = true;
		}
		else
		{
			userGame.curCount = userScore;
			
			//Lets play
			var RNG = Math.random() * 100;
			var aiScore = 0;
			
			if (userGame.curCount < 8)				
				if (RNG > 50)
					aiScore = 2;
				else
					aiScore = 1;
			else
				aiScore = 10 - userGame.curCount;
			
			userGame.curCount += aiScore;			
					
			if (userGame.curCount == 10)
				gameTalk.message = "Qapla'! jIDunqu'! :-)";
			else
				if (userGame.curCount == 10)
				{
					gameTalk.message = "*wa'maH!* jIQap!";
					gameTalk.message += gameTalk.newline + "maj";
					gameTalk.noGame = true;
				}
				else
				{
					gameTalk.message = "My move: " + translateNumber2Word(aiScore) + ' ' + translateNumber2Word(userGame.curCount);					
				}
		}
	}
	
	if (gameTalk.message == undefined)
		gameTalk.message = "nope";

	//Remove user	
	if (gameTalk.noGame == true)
		userGames = userGames.splice(aIdx, 1);

	
return gameTalk;
}


//Return the actual "run" routine that does the game work
module.exports.init = function(p_gameTalkDef)
{
	gameTalkDef = p_gameTalkDef;
	return module.exports.run;
}

function getUserGame(userID)
{
	return userGames.filter(function (UG, iIdx)
	{
		if (UG.userID == userID)
		{
			aIdx = iIdx;
			return UG
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

function translateNumber2Word(num)
{
	switch(num)
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













