var logger = require('winston');
var DData = require('./../external/discord_data.js');

var isLink = false;

module.exports = (bot, args, messageDJS) => 
{
  var ANChannel = bot.channels.get(DData.ANChan);
  
  //Probieren wirs so:
  args[0] = "";
  if (args[1].toLowerCase() == 'link')
  {
	  isLink = true;
	  args[1] = "";
  }
  else
	  isLink = false;
	
  var curMessage = args.join(' ');
  var newMessage = "";
  curMessage = curMessage.replace("\n", '\n');
  
if (isLink)
	newMessage += messageDJS.author + 'recommends: \n' + curMessage;
else
	newMessage += messageDJS.author + 'says: \n' + curMessage;
	
//neue Nachricht senden und anpinnen:
ANChannel.send(newMessage)
  .then(function(message)
   {message.pin();})
  .catch(console.error);
	
}

