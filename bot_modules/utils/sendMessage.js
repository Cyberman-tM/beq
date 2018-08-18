//send method, wrapper for discord.js (or whatever follows? :-)

module.exports.botSendMailText = function(messageType, bot, channelID, messageString)
{
   //This should work in discord.js
   if (messageType == 1)
      bot.channels[channelID].send(messageString);   
   else
      //Die silently...
      return;
};
