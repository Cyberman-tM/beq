var logger = require('winston');
var DData = require('./../external/discord_data.js');
var wikiLink = "http://www.klingonwiki.net/";

module.exports = (bot, args, messageDJS) => 
{
   var tmpRet = "";
   
   //first parameter MUST be the language - we'll simply assume it is, and that it's an existing language
   var lang = args[1].toLowerCase();
   lang.substring(0,1) = lang.substring(0,1).toUpperCase();
   
   tmpRet = wikiLink + lang + '/' + args[2];
   
   return tmpRet;
}
