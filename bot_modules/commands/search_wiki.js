var logger = require('winston');
var DData = require('./../external/discord_data.js');
var wikiLink = "http://www.klingonwiki.net/";

module.exports = (bot, args, messageDJS) => 
{
   var tmpRet = "";
   
   var lang = args[1].toLowerCase();
   if (lang != 'de' && lang != 'en' && lang != 'fr' && lang != 'nl' && lang != 'es')
      lang = 'de';
   
   lang.substring(0,1) = lang.substring(0,1).toUpperCase();
   
   tmpRet = wikiLink + lang + '/' + args[2];
   
   return tmpRet;
}
