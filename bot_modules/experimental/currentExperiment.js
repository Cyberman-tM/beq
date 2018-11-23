var logger = require('winston');
var DData = require('./../external/discord_data.js');

module.exports = (bot, args, messageDJS) => 
{
  var LMChannel = bot.channels.get(DData.LMChan);
  
  //Holen wir uns die gepinnten Nachrichten aus dem Letter to Maltz Channel
  LMChannel.fetchPinnedMessages()
  .then(function(messages)
  {
    messages[0].content += "testing123";
  })
  /*
  messageDJS.channel.fetchPinnedMessages()
    .then(function(messages)
          {
          logger.info(`Received ${messages.size} messages`);
          logger.info(messages.array()[0].content);
          })    
    .catch(console.error);
  */
  
  
  
  
}
