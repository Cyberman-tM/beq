var logger = require('winston');
var DData = require('./../external/discord_data.js');

module.exports = (bot, args, messageDJS) => 
{
  var LMChannel = bot.channels.get(DData.LMChan);
  
  ////curMessage hat noch den Befehl - wie werden wir den los?
  //var curMessage = messageDJS.content;
  //Probieren wirs so:
  args[0] = "";
  var curMessage = args.join(' ');
	
  curMessage = curMessage.replace("\n", '\n');
  
  //Holen wir uns die gepinnten Nachrichten aus dem Letter to Maltz Channel
  LMChannel.fetchPinnedMessages()
  .then(function(messages)
  {
	//Wir haben schon Nachrichten, wir nehmen momentan nur die erste!
    if (messages.size > 0)
    {
		//Bestehende Nachricht mit neuer Nachricht verknüpfen:
		var newMessage = messages.array()[0].content + '\n';
	        newMessage += "Asked by:" + messageDJS.author + '\n' + curMessage;
		
		//Bestehende Nachricht editieren
		messages.array()[0].edit(newMessage)
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
