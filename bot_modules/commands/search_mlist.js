var logger = require('winston');
var DData = require('./../external/discord_data.js');
var oldKLIMailList = "https://www.kli.org/sphider/search.php?query=[query]&search=1";
var newKLIMailList = "http://lists.kli.org/mmsearch.cgi/tlhingan-hol-kli.org?config=tlhingan-hol-kli.org&restrict=&exclude=&method=and&format=short&sort=score&words=[query]";

module.exports = (bot, args, messageDJS) => 
{
   var tmpRet = "";
   
   //Assume anything beyond the parameter itself is supposed to be the argument for the search
   args[0] = "";
   var searchWords = args.join('');  //Separator?
   
   tmpRet = "KLI Mailing List, up to 2015:\n";
   tmpRet += oldKLIMailList.replace("[query]", searchWords);
   tmpRet += "\n\n";
   tmpRet += "KLI Mailing List, beyond 2015:\n";
   tmpRet += newKLIMailList.replace("[query]", searchWords);
   tmpRet += "\n\n";
   
   //Add in personality lines
   
   return tmpRet;
}
