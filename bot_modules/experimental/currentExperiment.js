var logger = require('winston');
var DData = require('./../external/discord_data.js');

module.exports = (args, messageDJS) => 
{
  messageDJS.channel.fetchPinnedMessages()
    .then(function(messages)
          {
          logger.info(`Received ${messages.size} messages`);
          logger.info(messages.array()[0].content);
          })    
    .catch(console.error);
  
  logger.info(bot.channels.get(LMChannel));
}
