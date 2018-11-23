var logger = require('winston');

module.exports = (args, messageDJS) => 
{
  logger.info(args[0]);
  messageDJS.channel.fetchPinnedMessages()
    .then(function(messages)
          {
          logger.info(`Received ${messages.size} messages`);
          logger.info(messages.array()[0].content);
          })    
    .catch(console.error);
}
