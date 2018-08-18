//send method, wrapper for discord.js (or whatever follows? :-)
   var logger = require('winston');
module.exports = function(messageType, bot, channelID, messageString)
{

   logger.info(channelID);
   logger.info(messageString);
   logger.info(bot.channels);
   //This should work in discord.js
   if (messageType == 1)
      bot.channels[channelID].send(messageString);   
   else
      //Die silently...
      return;
};
