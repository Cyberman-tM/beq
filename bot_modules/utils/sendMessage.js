//send method, wrapper for discord.js (or whatever follows? :-)

module.exports.botSendMailText = function(bot, channelID, messageString)
{
   //This should work in discord.js
   bot.channels[channelID].send(messagestring);   
}
