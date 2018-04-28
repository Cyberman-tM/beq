var Discord = require('discord.io');
var logger = require('winston');
var beq = require('./beq_engine.js');
var DData = require('./bot_modules/external/discord_data.js');
var extCmds = require('./bot_modules/external/ext_commands.js');
var rules = require('./rules.js');
var games = require('./bot_modules/games/games.js');
var NumWords = require('./bot_modules/utils/number_translate.js');

//Internal version - package.json would contain another version, but package.json should never reach the client,
//so it's easier to just have another version number in here...
var versInt = '2.1.1 - Beq engine forever!';

//Can be changed
var defaultTranslation = 'en';

//Keep track of the language the user wants us to use
var userTranLang = new Array();

//Keep track of the fuzzy/non-fuzzy search settings for the users
var userFuzzy = new Array();

//Generic index for search/replace in array
var aIdx = null;

//We can use these languages (dependent on boQwI')
var knownLangs = ['de', 'en', 'tlh'];

//Communication structure for beq engine
//This is not used, it's just to announce that it exists
var beqTalkRaw = JSON.parse(beq.beqTalkDef);

//Special variable to turn testing features on and off
var devTest = false;

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console,
{
	colorize: true
}
);
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client(
	{
		token: DData.token,
		autorun: true
	}
	);

bot.on('ready', function (evt)
{
	logger.info('Connected');
	logger.info('Logged in as: ');
	logger.info(bot.username + ' - (' + bot.id + ')');
	logger.info('Version:' + versInt);	
	
	var beqTalk = JSON.parse(beq.beqTalkDef);
	beqTalk.command = "yIngu'";
	beqTalk = beq.Engine(beqTalk);
	logger.info(beqTalk.message);
}
);

bot.on('message', function (user, userID, channelID, message, evt)
{
	var sndMessage = '';
	var userTLang = null;
	var beqTalk = JSON.parse(beq.beqTalkDef);
	var cmdFound = true;
		
	//Any message shorter than 2 characters cannot be sent to us
	//That would leave one character for "Hey bot!" and one character for the command
	if (message.length < 3)
	   return;
	
	
	aIdx = null;
	var ULang = getUserTranLang(userID);
	if (aIdx != null)
		userTLang = ULang[0].lang;
	
	//Dev build	only
	if ( DData.devBuild == "true" )
	{
		if ( message.substring(0, 1) == '$' )
		   message = message.substring(1);
	    else 
		   message = message.substring(1);
	}

	//GEneral info: ! => default command indicator
	//              ? => shorthand for translation (mugh), only applicable in certain channels
	//              % => default GAME indicator

	// Our bot needs to know if it needs to execute a command
	// for this script it will listen for messages that will start with `!`
	// Expected format: COMMAND ARG1 ARG2 ARG3
	// For example: mugh tlh Suv
	// That is: command (translate) language (klingon) word (Suv)
	if ( message.substring(0, 1) == '!' || message.substring(0, 1) == '?')
	{		
		//Special processing, there are shortcut commands, we have to translate them to normal commands
		if (message.substring(0, 1) == '?')
		{
			if (channelID == DData.clipChan)
			{
				//A ? always means "mugh", translate. And must be followed by the language, without space.
				//So we can simply replace the ? with "!mugh " and the rest will work normally
				message = message.replace('?', "!mugh ");
			}
			else
				message = '!noShort';
		}
	
		var args = message.substring(1).split(' ');
		var cmd = args[0];
		
		//Some functions need the entire argument string, unprocessed
		var firstBlank = message.indexOf(' ');
		var onePar = message.substr(firstBlank, message.length - firstBlank);
		
		switch (cmd)
		{
		case 'testing':
		   //sndMessage = bot.DiscordClient.servers[0].Server.members.toString();
		   if (args[1] == 'on')
			   devTest = true;
		   else
			   devTest = false;
				
		   sndMessage = 'Test mode == ' + devTest;
		break;
		case 'noShort':
		   sndMessage = 'Sorry, shorthand commands are only allowed in certain channels (ask_beq).';
		break;
		
		case 'makeMember':		
			if (args[1] == DData.makeKlinKey)
			{
				var isKlingonist = bot.servers[DData.servID].members[userID].roles.filter(function (role)
				{
					if (role == DData.klinRole)
						return role
				});
				if (isKlingonist.length <= 0)
				{
					bot.addToRole({"serverID": DData.servID, "userID": userID, "roleID": DData.klinRole},
					              function(err, response){console.log(err); console.log(response);});
					sndMessage = 'You should now be a Klingonist!';
				}
				else
					sndMessage = 'You already are a klingonist!';
			}			
			else
				sndMessage = 'Wrong password.';
		break;
			
			// !ping - Standardtest um zu sehen ob er aktiv ist
		case 'ping':
			sndMessage = 'pong';
			break;
			
		//Regeln ausgeben
		case 'HIghojmoH':
		  if (args[1] != null && langKnown(args[1]) == true)
			  sndMessage = rules[args[1]];
		  else
			  if (userTLang != null)
				sndMessage = rules[userTLang];
			  else
				sndMessage = rules['de'];
		break;			
				
			//Liste der Befehle - muß von Hand aktualisiert werden!
		case 'CMDLIST':
			sndMessage = 'ping - simple response test, replies "pong"\n'
				 + 'tlhIngan - replies "maH!"\n'
				 + 'yIngu\' - Name and version of the bot & database version\n'
				 + 'CMDLIST - this here\n'
				 + 'Le\'rat\n'
				 + '\n'
				 + 'setTLang - set your translation language to the argument, i.e. "setTLang en" for english translations\n'
				 + 'setFuzzy on/off\n'
				 + 'showMySettings\n'
				 + 'setDefaultTLang de/tlh/en\n'				 
				 + 'KWOTD two parameters, both word type (boQwI\'), only "sen:" is used for return!\n'
				 + 'n2w, w2n Number to Word, Word to Number: translates for example 123 into wa\'vetlh cha\'maH wej and vice versa\n'
				 + '\n'
				 + 'mugh - translation lookup, uses the boQwI\' database to find the search item.\n'
				 + '       Multiple words have to be separated by a _!\n'
				 + '       Example: !mugh (tlh|de|en) (klingon, english or german word) [tlh,de,en] [fuzzy] [case] [startRes=nn] [type=(n,v,adv,sen,ques,...)]\n'
				 + '       the first parameter has to be the language the word you want translated is in. Mandatory\n'
				 + '       the second parameter is the word, or phrase, you\'re looking for, also mandatory\n'
				 + '       [tlh,de,en] - the language you want the translation to be in. If none is supplied, the default (yours, if defined) is used. If uses, must be the third parameter\n'
				 + '       the rest of the parameters are optional and be used in any order or not at all\n'				 
				 + '       [fuzzy] - normally only exact matches are returned. If you want to find anything that contains the term, add the keyword fuzzy\n'
				 + '       [case] - by default, case is NOT ignored. If you want to ignore case, add this keyboard. Not applicable to klingon\n'
				 + '       [startRes=nn] - the number of results is limited to 20, if you had a previous search and want to see the next 20 entries,\n'
				 + '                       add this parameter with the number or results you want to skip\n'
				 + '       [type=(n,v,adv,sen,ques,...)] - the program will look for ANY word that fits your search term, with this you can limit it. Uses the notation of boQwI\'\n';
			break;

		case 'yIngu\'':
			sndMessage  = 'beq \'oH pongwIj\'e\'.\nVersion: ' + versInt + '\nI am a helper bot. Use "CMDLIST" for a list of commands.\n'
			
			beqTalk.command = "yIngu'";
			beqTalk = beq.Engine(beqTalk);
			sndMessage += beqTalk.message + beqTalk.newline;
			sndMessage += games.verGame + beqTalk.newline;
			sndMessage += NumWords.versInt + beqTalk.newline;
			
			sndMessage += beqTalk.newline;
			sndMessage += '*naDev jItoy\'taHpa\', SuvwI\'\'a\' jIH\'e\'.\nle\'rat, tIghnar tuq, jIH.\n\n toH. yInvetlh \'oHta\'*\n';
			
				if ( DData.devBuild == "true" )
					sndMessage += "(Development edition)";
			break;

		case 'showMySettings':
			aIdx = null;
			var ULang = getUserTranLang(userID);
			if (aIdx != null)
				sndMessage += 'Your translation language is set to \'' + ULang[0].lang + '\'\n';
			else
				sndMessage += 'You do not have a default translation language, so the default of \'' + defaultTranslation + '\' is used.\n';

			aIdx = null;
			var uFuzz = getUserFuzzy(userID);
			if (aIdx != null)
				sndMessage += 'Fuzzy search for translation is set to: \'' + uFuzz[0].fuzzy + '\'\n';
			else
				//Maybe later it'll be true as default? Make it a variable some time
				sndMessage += 'Fuzzy search for translation is set to system default: \'' + false + '\'\n';

			break;

		case 'setDefaultTLang':
			if (args[1] != null && langKnown(args[1]) == true)
				defaultTranslation = args[1];
			else
				defaultTranslation = 'en';

			sndMessage += 'Default language is now \'' + defaultTranslation + '\'';
			break;

		case 'setTLang':
			var workLang = args[1];
			if (workLang != null && langKnown(workLang) == true)
			{
				aIdx = null;
				var ULang = getUserTranLang(userID);

				if (aIdx != null)
					userTranLang[aIdx].lang = workLang;
				else
					userTranLang.push(
					{
						userID: userID,
						lang: workLang
					}
					);

				sndMessage += 'Translation language is set to \'' + workLang + '\' for ' + user + '\n';
			}
			else
				sndMessage += 'nuqjatlh? Hol \'oHbe\' ' + args[1] + '!\n';
			break;

		case 'setFuzzy':
			var newFuzz = null;

			if (args[1] == 'on')
				newFuzz = true;
			else if (args[1] == 'off')
				newFuzz = false;

			aIdx = null;
			var uFuzz = getUserFuzzy(userID);
			if (aIdx != null)
				userFuzzy[aIdx].fuzzy = newFuzz;
			else
				userFuzzy.push(
				{
					userID: userID,
					fuzzy: newFuzz
				}
				);

			if (newFuzz == true)
				sndMessage += 'Translation search will use fuzzy search from now on.';
			else if (newFuzz == false)
				sndMessage += 'Translation search will use strict search from now on.';
			break;

			//"Lustige" Meldungen
		case 'tlhIngan':
			sndMessage += 'maH!\n';
			break;

		case 'le\'rat':
		case 'Le\'rat':
			sndMessage += 'Qo\'! pongwIj \'oHbe\'! DaH, *beq* HIpong jay\'!\n';
			break;
		case 'KWOTD':
			beqTalk.command = 'KWOTD';
			
			var tmpWord = '';
			beqTalk.wordType1 = null;
			beqTalk.wordType2 = null;

			if (args[1] == null)
				beqTalk.wordType1 = 'sen:rp';
			if (args[2] == null)
				beqTalk.wordType2 = 'sen:sp';
			
			beqTalk.lookLang = 'tlh';
			if (userTLang == null)
				beqTalk.transLang = defaultTranslation;
			else
				beqTalk.transLang = userTLang;
			
			//Let the engine do its magic :-)
			talkBeq = beq.Engine(beqTalk);
			
			sndMessage = beq.createTranslation(talkBeq);	
			break;
		case "yIcha'":
			var talkBeq = JSON.parse(beq.beqTalkDef);
			beqTalk.command = "yIcha'";			
			beqTalk.lookLang = 'tlh';
			if (userTLang == null)
				beqTalk.transLang = defaultTranslation;
			else
				beqTalk.transLang = userTLang;
			
			//No use in limiting the number of results...
			beqTalk.limitRes = 50;
			
			switch (args[1])
			{
				case 'prefix':
				case 'moHaq':
				case 'type=v:pref':
				   beqTalk.wordType1 = 'v:pref';
				break;				
			}
			
			//Let the engine do its magic :-)
			talkBeq = beq.Engine(beqTalk);

			sndMessage = beq.createTranslation(talkBeq);	
		break;			
		case 'linkMe':
		   var ListLink1 = args[1];
		   
		   if (ListLink1 == 'list')
			   sndMessage += JSON.stringify(links);
		
		break;
		//Number to Word
		case 'n2w':
		  sndMessage = NumWords.Num2Word(parseInt(onePar));
		break;
		
		//Word to Number
		case 'w2n':
		   sndMessage = NumWords.Word2Num(onePar);
		break;
			//Übersetzungen
		case 'mugh':
			var talkBeq = JSON.parse(beq.beqTalkDef);
		
			//The first two arguments after "mugh" are NOT optional!
		        if (args[2] == undefined)			
			{
			   sndMessage = 'Incomplete parameters! Use !CMDLIST for a list of commands and parameters.';
			   break;
			}
				
			beqTalk.command = 'mugh';
			beqTalk.lookLang = args[1];
			beqTalk.lookWord = args[2];
			beqTalk.transLang = args[3]; //This argument can also be any of the later ones, if the language is taken from default
			var p_lookFuzz = args[4]; //The naming of these variables is only to see what the possible parameters are
			var p_lookCase = args[5];
			var p_startRes = args[6];
			var p_filtWord = args[7];
			var p_showNotes = args[8];  //show notes, if available
			var p_special   = args[9];  //Unlisted commands, directly given to the beq Engine, must be prefixed by "spec="
				
	
			if (beqTalk.transLang == undefined)
				beqTalk.transLang = null;
				
			//Since the parameters can arrive in any range, we simply have to search for the manually - they are all named, fortunately
			var dynArg = beqTalk.transLang + '|' + p_lookFuzz + '|' + p_lookCase + '|' + p_startRes + '|' + p_filtWord + '|' + p_showNotes + '|' + p_special;
			if (dynArg.indexOf('case') >= 0)
				beqTalk.wCase = true;

			if (dynArg.indexOf('fuzzy') >= 0)
				beqTalk.fuzzy = true;
			else
			{
				aIdx = null;
				var uFuzz = getUserFuzzy(userID);
				if (aIdx != null)
					beqTalk.fuzzy = uFuzz[0].fuzzy;
			}
			
			if (dynArg.indexOf('notes') >= 0)
				beqTalk.showNotes = true;
			
			if (dynArg.indexOf('spec=') >= 0)
				beqTalk.special = dynArg.split('spec=')[1].split('|')[0];
			
			if ((dynArg).indexOf('nofuzz') >= 0)
				beqTalk.fuzzy = false;
		
			//These parameters have parameters in themselves
			//always an equal sign without spaces and the value following it
			if (dynArg.indexOf('type') >= 0)
				beqTalk.wordType1 = dynArg.split('type=')[1].split('|')[0];
			if (dynArg.indexOf('startRes') >= 0)
				beqTalk.startRes = dynArg.split('startRes=')[1].split('|')[0];
			
			if (beqTalk.transLang == null || langKnown(beqTalk.transLang.toLowerCase()) != true)
			{
				if (userTLang == null)
				{
					if (beqTalk.lookLang != 'tlh')
						beqTalk.transLang = 'tlh';
					else
						beqTalk.transLang = defaultTranslation;
				}
				else
					beqTalk.transLang = userTLang;
			}

			if (langKnown(beqTalk.lookLang) != true)
			{
				beqTalk.failure = true;
				beqTalk.gotResult = false;
				beqTalk.message = "Language not supported!";
			}
			else
			{
				//Let the engine do its magic :-)
				talkBeq = beq.Engine(beqTalk);
			}

			sndMessage = beq.createTranslation(talkBeq);		
		
			break;
		default:
		    //This MUST return false if nothing was done!
			cmdFound = extCmds.extCommands(bot, userID, message, sndMessage);
		}
	}
	else if (message.substring(0, 1) == '%')
	{
		var gameTalk = JSON.parse(games.gameTalkDef);
		gameTalk = games.runGames(bot, userID, message);
		sndMessage = gameTalk.message;
	}


	if ( message.substring(0, 1) == '!' || message.substring(0, 1) == '?' || message.substring(0, 1) == '%')
	{
		if (cmdFound == false)		
			sndMessage = '\'e\' vIyajbe\' :-( \n (unknown command)';
			
		if (sndMessage == '')
			sndMessage = 'ERROR - no message?';
		
		bot.sendMessage(
		{
			to: channelID,
			message: sndMessage
		}
		);
	}
}
);

/*
//I don't trust this - it doesn't trigger often enough, maybe the heartbeat rate for the servers
//has to be changed?
bot.on('any', function(event)
{
	if (devTest == true)
	{
	   bot.sendMessage({to: DData.bTChan, message: event.t});
	   if (event.t != 'MESSAGE_CREATE' || event.d.author.bot == false)
	      bot.sendMessage({to: DData.bTChan, message: JSON.stringify(event)});
	}
	
});
*/
function getUserTranLang(userID)
{
	return userTranLang.filter(function (UT, iIdx)
	{
		if (UT.userID == userID)
		{
			aIdx = iIdx;
			return UT
		}
	}
	);
}

function getUserFuzzy(userID)
{
	return userFuzzy.filter(function (item, iIdx)
	{
		if (item.userID == userID)
		{
			aIdx = iIdx;
			return item
		}
	}
	);
}

function langKnown(language)
{
	var langFound = knownLangs.filter(function (lang)
		{
			if (lang == language)
				return true;
		}
		);

	if (langFound.length > 0)
		return true;
	else
		return false;
}
