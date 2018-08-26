//This structure is used for the bot to talk with the GAme Engine and vice versa
//It is NOT used by the game internally

module.exports =
{
	"userID": "",         //Current user
	"playGame": "",       //Game he wants to play
	"cmd": "",            //command or parameters to the game
	"message": "",        //Return message of the game (current score, you win, etc...)
	"noGame": false,      //No game was requested, error
	"newline": "\n",      //newline character - \n for text, or <br> for web, or whatever
	"reserved": "nothing" //There may be more to come	
};
