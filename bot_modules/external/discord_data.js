/*
   Discord-Data
   Authorization, special channels, whatever
   Moved to a separate module so any method can be used without having to constantly update bot.js

   This bot was developed at/for Heroku, but it should be usable somewhere else as well.
*/

var tmpToken = '';       //Bot Token
var tmpservID = '';      //Server ID

var tmpclipChan = '';    //Channel where clipped commands are allowed (translation command ? for example)
var tmpbTChan = '';      //Channel for beqTalk - system messages should go there
var tmpdevBuild = '';    //Flag that tells us if this bot runs as developer toy or productive assistant
var tmpKWOTDChan = '';   //Which channel should we post the KWOTD message to?
var tmpnoPulse   = '';   //Disable Event-Timer pulse during testing
var tmpWeatherMap = '';  //ID for openWeatherMap
var tmpLMChannel = '';   //Channel ID for Letter to Maltz
var tmpANChannel = '';   //Channel ID for Announcements
var tmpStammChan = '';   //Channel ID for Stammtisch (Text)
var tmpStoreServer = ''; //URL to the server(file) to store/retrieve data


var useHeroku = true;   //Change this to false if you don't use Heroku, so we won't try to get the Heroku data

if (useHeroku === true)
{
	//process.env comes from Heroku
	tmpToken = process.env.token;
	tmpservID = process.env.servID;
	
	tmpclipChan = process.env.clipChan;
	tmpbTChan = process.env.bTChan;
	
	tmpKWOTDChan = process.env.KWOTDChan;
	
	tmpdevBuild = process.env.devBuild;        //Dev build, enable special checks
	tmpnoPulse  = process.env.noPulse;         //Don't write into the log once per event timer
	
	tmpLMChannel = process.env.LMChannel;      //Letter to Maltz channel
	tmpANChannel = process.env.ANChannel;      //Announcements-Channel
	
	tmpWeatherMap = process.env.openWeatherMap;
	
	tmpStammChan   = process.env.StammChan;
	tmpStoreServer = process.env.StoreServ;
}
else
{
	//Hardcode your own variables, or take them from somewhere else
}

module.exports.token = tmpToken;
module.exports.servID = tmpservID;

module.exports.devBuild = tmpdevBuild;
module.exports.noPulse = tmpnoPulse;
module.exports.clipChan = tmpclipChan;
module.exports.bTChan = tmpbTChan;
module.exports.KWOTDChan = tmpKWOTDChan;
module.exports.openWeatherMap = tmpWeatherMap;
module.exports.LMChan = tmpLMChannel;
module.exports.ANChan = tmpANChannel;
module.exports.StammChan = tmpStammChan;
module.exports.StoreServ = tmpStoreServer;


