var logger = require('winston');

module.exports = (args, messageDJS) => 
{
  logger.info(args[0]);
  messageDJS.channel.fetchPinnedMessages().then(messages => console.log(`Received ${messages.size} messages`)).catch(console.error);
  messageDJS.channel.fetchMessages().then(messages => console.log(`Received ${messages.size} messages`)).catch(console.error);
}
