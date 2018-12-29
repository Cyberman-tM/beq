var logger = require('winston');
var DData = require('./../external/discord_data.js');
var wikiLink = "http://www.klingonwiki.net/";

module.exports = (bot, args, messageDJS) => 
{
   var tmpRet = "";
   
   var lang = args[1].toLowerCase();
   if (lang != 'de' && lang != 'en' && lang != 'fr' && lang != 'nl' && lang != 'es')
   {
      lang = 'de';
      args[1] = args[2];
   }
   
   lang = lang.substring(0,1).toUpperCase() + lang.substring(1,lang.length);
   
   tmpRet = wikiLink + lang + '/' + args[2];
   
   return tmpRet;
}
