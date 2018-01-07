/*
	External Commands
	Put any custom commands for the bot here, it'll be executed IF NO OTHER command is found firstChild
	
	You have to return either TRUE if a command was executed, or FALSE if nothing was done

*/


//bot - the bot itself
//message - the message the bot determined to be for him, unchanged, but prefiltered, i.e. only !command will get through to here
//sndmessage - the return message
module.exports.extCommands = function(bot, message, sndMessage)
{
	return false;
}