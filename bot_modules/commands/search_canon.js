var logger = require('winston');
var DData = require('./../external/discord_data.js');
var klingonskaCanonLink = "http://klingonska.org/canon/search/?q=";

module.exports = (bot, args, messageDJS) => 
{
   var tmpRet = "";
   
   //Assume anything beyond the parameter itself is supposed to be the argument for the Klingonska Canon search
   args[0] = "";
   var searchWords = args.join();  //Separator?
   tmpRet = klingonskaCanonLink + searchWords;   
   
   return tmpRet;
}
