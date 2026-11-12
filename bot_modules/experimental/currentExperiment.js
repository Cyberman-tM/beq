var logger = require('winston');
var DData = require('./../external/discord_data.js');

module.exports = (bot, args, messageDJS) => 
{
  var LMChannel = bot.channels.cache.get(DData.LMChan);
  
  //curMessage hat noch den Befehl - wie werden wir den los?
  var curMessage = messageDJS.content;
  
  //Holen wir uns die gepinnten Nachrichten aus dem Letter to Maltz Channel
  LMChannel.messages.fetchPinned()
  .then(function(messages)
  {
	//Wir haben schon Nachrichten, wir nehmen momentan nur die erste!
    if (messages.size > 0)
    {
		//Bestehende Nachricht mit neuer Nachricht verknüpfen:
		var pinnedMessage = messages.first();
		var newMessage = pinnedMessage.content + '\n' + curMessage;
		
		//Bestehende Nachricht editieren
		pinnedMessage.edit(newMessage)
	    .then()
	    .catch(console.error);
    }
    else		
    {
      //New pinned message
	  LMChannel.send(messageDJS.content)
	  .then(function(message)
      {message.pin();})
	  .catch(console.error);
    }
  })
}
