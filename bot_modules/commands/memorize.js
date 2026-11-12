var logger = require('winston');
var DData = require('./../external/discord_data.js');

module.exports = (bot, args, messageDJS) => 
{
  var LMChannel = bot.channels.cache.get(DData.LMChan);
  
  ////curMessage hat noch den Befehl - wie werden wir den los?
  //var curMessage = messageDJS.content;
  //Probieren wirs so:
  args[0] = "";
  var curMessage = args.join(' ');
  var newMessage = "";
  curMessage = curMessage.replace("\n", '\n');
  
  //Holen wir uns die gepinnten Nachrichten aus dem Letter to Maltz Channel
  LMChannel.messages.fetchPinned()
  .then(function(messages)
  {
	//Wir haben schon Nachrichten, wir nehmen momentan nur die erste!
    if (messages.size > 0)
    {
		//Bestehende Nachricht mit neuer Nachricht verknüpfen:
		var pinnedMessage = messages.first();
		newMessage = pinnedMessage.content + '\n';
	        newMessage += "Asked by:" + messageDJS.author + '\n' + curMessage;
		
		//Bestehende Nachricht editieren
		pinnedMessage.edit(newMessage)
	    .then()
	    .catch(console.error);
    }
    else		
    {
      //New pinned message
        newMessage += "Asked by:" + messageDJS.author + '\n' + curMessage;
	  LMChannel.send(newMessage)
	  .then(function(message)
      {message.pin();})
	  .catch(console.error);
    }
  })
}
