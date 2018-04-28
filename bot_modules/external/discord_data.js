/*
   Discord-Data
   Authorization, special channels, whatever
   Moved to a separate module so any method can be used without having to constantly update bot.js

   This bot was developed at/for Heroku, but it should be usable somewhere else as well.
*/

var tmpToken = '';      //Bot Token
var tmpservID = '';        //Server ID

var tmpclipChan = '';   //Channel where clipped commands are allowed (translation command ? for example)
var tmpbTChan = '';     //Channel for beqTalk - system messages should go there
var tmpdevBuild = '';   //Flag that tells us if this bot runs as developer toy or productive assistant

var useHeroku = true;   //Change this to false if you don't use Heroku, so we won't try to get the Heroku data

if (useHeroku === true)
{
	//process.env comes from Heroku
	tmpToken = process.env.token;
	tmpservID = process.env.servID;
	
	tmpclipChan = process.env.clipChan;
	tmpbTChan = process.env.bTChan;
	
	tmpdevBuild = process.env.devBuild;        //Dev build, enable special checks
}
else
{
	//Hardcode your own variables, or take them from somewhere else
}

//Soon to be phased out, these are leftovers of a previous attempt
module.exports.klinRole = process.env.klinRole;        //Klingonist role == default role
module.exports.makeKlinKey = process.env.makeKlinKey;  //Keyword to automagically make the user a klingonist
