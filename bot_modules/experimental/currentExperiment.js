var logger = require('winston');
var DData = require('./../external/discord_data.js');

module.exports = (bot, args, messageDJS) => 
{
  var LMChannel = bot.channels.get(DData.LMChan);
  
  //Holen wir uns die gepinnten Nachrichten aus dem Letter to Maltz Channel
  LMChannel.fetchPinnedMessages()
  .then(function(messages)
  {
    if (messages.size > 0)
    {
    //Derzeit kann es nur eine geben!
    var newMessage = messages.array()[0].content + messageDJS.content;    
    logger.info(newMessage);
    messages.array()[0].edit(newMessage)
  .then(msg => console.log(`New message content: ${msg}`))
  .catch(console.error);
    }
    else
    {
      //New message
      // Send a basic message
channel.send(messageDJS.content)
  .then(function(message)
        {
      message.pin();
      })
  .catch(console.error);
    }
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
