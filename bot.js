var Discord = require('discord.js');
var logger = require('winston');
var beq = require('./beq_engine.js');
var DData = require('./bot_modules/external/discord_data.js');
var extCmds = require('./bot_modules/external/ext_commands.js');
var cmdList = require('./bot_modules/cmdlist.js');
var rules = require('./rules.js');
var games = require('./bot_modules/games/games.js');
var gameTalkDef = require('./bot_modules/games/gameTalkDef.js');
var NumWords = require('./bot_modules/utils/number_translate.js');
var beqPerson = require('./bot_modules/personality/beq_person.js');
var evTimer = require('./bot_modules/utils/event_timer.js');
var KWOTD = require('./bot_modules/utils/KWOTD/kwotd.js');
var botSendMessage = require('./bot_modules/utils/sendMessage.js');
var memorize = require('./bot_modules/commands/memorize.js');
var proclaim = require('./bot_modules/commands/proclaim.js');
var searchCanon = require('./bot_modules/commands/search_canon.js');
var searchMList = require('./bot_modules/commands/search_mlist.js');
var searchWiki = require('./bot_modules/commands/search_wiki.js');
var cat = require('./bot_modules/commands/categorize20/cat20.js');
var questGame = require('./bot_modules/commands/questGame.js');

//Internal version - package.json would contain another version, but package.json should never reach the client,
//so it's easier to just have another version number in here...
var versInt = '2.2.6 - Beq engine forever!';

//Can be changed
var defaultTranslation = 'en';

//Keep track of the language the user wants us to use
var userTranLang = [];

//Generic index for search/replace in array
var aIdx = null;

//We can use these languages (dependent on boQwI')
var knownLangs = ['de', 'en', 'tlh'];

//Communication structure for beq engine
//This is not used, it's just to announce that it exists
var beqTalkRaw = JSON.parse(beq.beqTalkDef);

//Special variable to turn testing features on and off
var devTest = false;

//User <> Game tracking
//userGame.userID == gameID
var userGame = {};

//Game <> Game ID tracking
//gameData.gameID == gameObject (gameTalk)
var gameData = [];

// Configure logger settings
logger.remove(logger.transports.Console);
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client();
bot.login(DData.token);
devTest = DData.devBuild;
//		autorun: true


bot.on('ready', function (evt) {
	logger.info('Connected');
	logger.info('Logged in as: ');
	logger.info(bot.user.username + ' - (' + bot.user.id + ')');
	logger.info('Version:' + versInt);

	var beqTalk = JSON.parse(beq.beqTalkDef);
	beqTalk.command = "yIngu'";
	beqTalk = beq.Engine(beqTalk);
	logger.info(beqTalk.message);

	//Initialize question game
	questGame.initGame(beq.KDBJSon);

	//Timer runs once a minute (KWOTD excepted)
	evTimer.startEventTimer(beq, bot);

	//Notice that we're devBuild
	if (DData.devBuild == "true")
		logger.info("Development edition!");
}
);

bot.on('messageUpdate', function (oldMessage, newMessage) {
	processMessage(this, newMessage);
});

bot.on('message', function (messageDJS) {
	processMessage(this, messageDJS);
});

//Actual message processing
function processMessage(bot, messageDJS) {
	var sndMessage = '';
	var userTLang = null;
	var beqTalk = JSON.parse(beq.beqTalkDef);
	var cmdFound = true;
	var user = messageDJS.author.username;
	var userID = messageDJS.author.id;
	var channelID = messageDJS.channel.id;
	var message = messageDJS.content;
	var cmdMagic = ''; //Magic character that tells us its a command

	//Any message shorter than 2 characters cannot be sent to us
	//That would leave one character for "Hey bot!" and one character for the command
	if (message.length < 3)
		return;

	//Regular use: first char is bot-command
	cmdMagic = message.substring(0, 1);
	message = message.substring(1, 99999);

	//Dev build only, first char is dev-marker($)
	if (DData.devBuild == "true") {
		if (cmdMagic == '$') {
			cmdMagic = message.substring(0, 1);
			message = message.substring(1, 99999);
		}
		else
			return;
	}
	else
		//Maybe it's a command to devBeq, in which case we ignore it
		if (cmdMagic == '$')
			return;

	if (DData.devBuild == "true")
		logger.info(cmdMagic);

	//GEneral info: ! => default command indicator
	//              ? => shorthand for translation (mugh)
	//              % => default GAME indicator
	//              $ => Categorize words

	// Our bot needs to know if it needs to execute a command
	// for this script it will listen for messages that will start with `!`
	// Expected format: COMMAND ARG1 ARG2 ARG3
	// For example: mugh tlh Suv
	// That is: command (translate) language (klingon) word (Suv)
	//Special processing, there are shortcut commands, we have to translate them to normal commands
	if (cmdMagic == '?') {
		//Ask beq or Stammtisch
		if (channelID == DData.clipChan ||
			channelID == DData.StammChan) {
			//Inside the "ask beq" Channel, we always want to show notes when asking for a klingon word:
			if (message.substring(0, 3) == 'tlh')
				beqTalk.showNotes = true;
		}
		//A ? always means "mugh", translate. And must be followed by the language, without space.
		//So we can simply replace the ? with "mugh " and the rest will work normally
		message = "mugh " + message;
		cmdMagic = '!';
	}

	var args = message.substring(0).split(' ');
	var cmd = args[0];
	if (DData.devBuild == "true")
		logger.info(cmd);

	if (cmdMagic == '!') {
		//Some functions need the entire argument string, unprocessed
		var firstBlank = message.indexOf(' ');
		var onePar = message.substr(firstBlank, message.length - firstBlank);
		var tmpText = "";

		switch (cmd) {
			//Experiment
			/*
			case 'newGame':				
				var gameTalk = {};
				//Check if user already has a game open
				if (userGame[messageDJS.author.userID] != undefined && userGame[messageDJS.author.userID] != null)
					gameTalk = userGame[messageDJS.author.userID];
				else
					userGame[messageDJS.author.userID] = JSON.parse(questGame.gameTalkDef);

				sndMessage = "Done, I hope?";
				if (args[1] == "add")
				{
					if (args[2] != undefined)
					{
						gameID = args[2];
						questGame.loadGame(gameID);
					}
					else
					{

					}
					questGame.addPlayer(messageDJS.author);
				}
				else if (args[1] == "remove")
					questGame.removePlayer(messageDJS.author);
				else if (args[1] == "newGame") {
					questGame.restart();
					questGame.initGame(beq.KDBJSon);
				}
				else if (args[1] == "list")
					sndMessage = questGame.listPlayers();
				else if (args[1] == "myPoints")
					questGame.myPoints(messageDJS.author);
				else if (args[1] == "addGM")
					sndMessage = questGame.addGM(messageDJS.author);
				else if (args[1] == "givePoints")
					questGame.givePoints(args[2]);
				else if (args[1] == "setTarget")
					questGame.setTarget(messageDJS.author, args[2]);
				else if (args[1] == "sendQuestion")
					questGame.GMsendQuestion(messageDJS.author, args.slice(2, 999).join(' '));
				else if (args[1] == "sendVoc")
					questGame.GMsendVocQuest(messageDJS.author, args.slice(2, 999).join(' '));
				else if (args[1] == "sendAnswer")
					questGame.sendAnswer(messageDJS.author, args.slice(2, 999).join(' '));
				else if (args[1] == "getQuestion")
					sndMessage = questGame.getQuestion(4);
				else if (args[1] == "spectate")
					questGame.addSpectator(messageDJS.channel);
				else
					sndMessage = "Command not found.";

				if (gameID > 0)
					questGame.saveGame(gameID);

				break;
				*/
			case 'reKDB':
				sndMessage = cat.reKDB(beq, args[1]);
				break;

			case 'noShort':
				sndMessage = 'Sorry, shorthand commands are only allowed in certain channels (ask_beq).';
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
						sndMessage = rules.de;
				break;

			//Liste der Befehle - muß von Hand aktualisiert werden!
			case 'CMDLIST':
			case 'cmdlist':
			case 'help':
			case 'HELP':
			case 'QaH':
				sndMessage = cmdList.cmdlist;
				sndMessage = sndMessage.replace(/<BR>/g, beqTalk.newline);
				break;

			case 'yIngu\'':
				sndMessage = 'beq \'oH pongwIj\'e\'.\nVersion: ' + versInt + '\nI am a helper bot. Use "CMDLIST" for a list of commands.\n';

				beqTalk.command = "yIngu'";
				beqTalk = beq.Engine(beqTalk);
				sndMessage += beqTalk.message + beqTalk.newline;
				sndMessage += games.verGame + beqTalk.newline;
				sndMessage += NumWords.versInt + beqTalk.newline;
				sndMessage += beqPerson.nameInt + ': ' + beqPerson.versInt + beqTalk.newline;

				sndMessage += beqTalk.newline;
				sndMessage += 'Known channels:' + beqTalk.newline;
				sndMessage += 'Ask beq: ' + DData.clipChan + beqTalk.newline;
				sndMessage += 'BeqTalk: ' + DData.bTChan + beqTalk.newline;
				sndMessage += 'Letter to Maltz: ' + DData.LMChan + beqTalk.newline;
				sndMessage += 'Anouncements: ' + DData.ANChan + beqTalk.newline;
				sndMessage += 'Stammtisch: ' + DData.StammChan + beqTalk.newline + beqTalk.newline;

				sndMessage += beqPerson.yIngu;

				if (DData.devBuild == "true")
					sndMessage += "(Development edition)";
				break;
			//"Lustige" Meldungen
			case 'tlhIngan':
				sndMessage += 'maH!\n';
				break;
			case 'KWOTD':
				beqTalk.command = 'KWOTD';

				var tmpWord = '';
				beqTalk.wordType1 = null;
				beqTalk.wordType2 = null;

				if (args[1] == null)
					beqTalk.wordType1 = 'sen:rp';
				else if (args[1].startsWith("source")) {
					beqTalk.lookSource = args[1].split('=')[1];
					args[1] = null;
				}
				else
					beqTalk.wordType1 = args[1];

				beqTalk.lookLang = 'tlh';
				if (userTLang == null)
					beqTalk.transLang = defaultTranslation;
				else
					beqTalk.transLang = userTLang;

				//Let the engine do its magic :-)
				talkBeq = beq.Engine(beqTalk);

				talkBeq.result.forEach(function (item) {
					sndMessage = KWOTD.KWOTDTranslate(beqTalk, item);
				}
				);

				//No KWOTD? Special message:
				if (sndMessage == "") {
					sndMessage += "no result" + beqTalk.newline + beqTalk.newline;
					sndMessage += beqTalk.newline + beqPerson.getLine(4, true, true, beqTalk.newline);
				}
				break;
			case "yIcha'":
				var showAType = "";
				var showNumRange = 0;

				//The XML data is only in the beg-engine, so we can't really access it. Or can we?
				//We have to pre-sort the parameters - and find a way to communicate them through beqTalk.
				//Parameters:
				//Example call: !yIcha' moHaq de
				//Expected result: show all prefixes, translated to german
				//Other example: !yIcha' verbsuffix en 2
				//Expected result: show all type 2 verb suffixes in english

				//Zeroeth parameter will always be yIcha' (by definition)
				//First and second parameter SHOULD be type of affix and language
				//the third parameter could be the number (for suffixes)

				//TODO: more synonyms
				showAType = args[1];
				if (showAType == "moHaq" || showAType == "prefixes" || showAType == "prefix")
					showAType = "prefix";
				else if (showAType == "mojaq" || showAType == "suffix") {
					sndMessage += "Hrmp. Discord doesn't allow a list of ALL suffixes. Ask for verb or noun suffixes.";
					args[1] = "ERROR";
				}
				else if (showAType == "verbsuffix" || showAType == "verb-suffix" || showAType == "vs" || showAType == "DIp-mojaq")
					showAType = "verbSuffix";
				else if (showAType == "nounsuffix" || showAType == "noun-suffix" || showAType == "ns" || showAType == "wot-mojaq")
					showAType = "nounSuffix";
				else {
					sndMessage = "nuqjatlh?";
					args[1] = "ERROR";
				}

				if (args[1] != "ERROR") {
					beqTalk.limitRes = 999;
					beqTalk.startRes = 0;
					beqTalk.lookLang = "tlh";
					beqTalk.transLang = args[2];
					if (langKnown(args[2]) == false) {
						beqTalk.transLang = 'en'; //Use EN as default
						//Since 3 isn't the language, it's probably the number
						args[3] = args[2];
					}
					showNumRange = args[3];
					if (showNumRange == undefined || showNumRange == "")
						showNumRange = "0-9";

					beqTalk.wordType1 = showAType;
					beqTalk.wordType2 = showNumRange;

					beqTalk.command = "yIcha'";

					//Let the engine do its magic :-)
					talkBeq = beq.Engine(beqTalk);
					sndMessage = beq.createTranslation(talkBeq);
				}
				break;
			//Number to Word
			case 'n2w':
				sndMessage = NumWords.Num2Word(parseInt(onePar));
				break;

			//Word to Number
			case 'w2n':
				sndMessage = NumWords.Word2Num(onePar).toString();
				break;
			//tlhIngan->xifan etc...
			case 'recode':
				beqTalk.transLang = args[1];
				beqTalk.lookLang = 'tlhIngan'; //Kann nichts anderes sein, transLang muß etwas wie x2tlh enthalten für die Rückcodierung
				beqTalk.lookWord = args.slice(2, 999).join(' ');
				beqTalk.command = 'recode';
				talkBeq = beq.Engine(beqTalk);
				if (talkBeq.failure == true)
					sndMessage = talkBeq.message;
				else
					sndMessage = beq.createTranslation(talkBeq);
				break;
			case 'yIqaw':
				memorize(bot, args, messageDJS);
				sndMessage += beqTalk.newline + beqPerson.getLine(5, true, true, beqTalk.newline);
				break;
			case 'yImaq':
				proclaim(bot, args, messageDJS);
				sndMessage += beqTalk.newline + beqPerson.getLine(6, true, true, beqTalk.newline);
				break;
			//Search canon
			case 'canon':
				sndMessage = searchCanon(bot, args, messageDJS);
				break;
			//Search Mailing list
			case 'mlist':
				sndMessage = searchMList(bot, args, messageDJS);
				break;
			//Search Wiki
			case 'wiki':
				sndMessage = searchWiki(bot, args, messageDJS);
				break;
			//Übersetzungen
			case 'mugh':
				var talkBeq = JSON.parse(beq.beqTalkDef);

				//The first two arguments after "mugh" are NOT optional!
				if (args[2] == undefined) {
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
				var p_showNotes = args[8]; //show notes, if available
				var p_beSimple = args[9]; //Simple output - no frills, delete command message
				var p_showS = args[10]; //Show sources (if available)
				var p_showC = args[11]; //Show Category
				var p_special = args[12]; //Unlisted commands, directly given to the beq Engine, must be prefixed by "spec="

				if (beqTalk.transLang == undefined)
					beqTalk.transLang = null;

				//Since the parameters can arrive in any range, we simply have to search for the manually - they are all named, fortunately
				var dynArg = beqTalk.transLang + '|' + p_lookFuzz + '|' + p_lookCase + '|' + p_startRes + '|' + p_filtWord + '|' + p_showNotes + '|' + p_special + '|' + p_beSimple + '|' + p_showS + '|' + p_showC;
				if (dynArg.indexOf('case') >= 0)
					beqTalk.wCase = true;

				if (dynArg.indexOf('fuzzy') >= 0)
					beqTalk.fuzzy = true;
				else
					beqTalk.fuzzy = false;

				if (dynArg.indexOf('notes') >= 0)
					beqTalk.showNotes = true;

				if (dynArg.indexOf('spec=') >= 0)
					beqTalk.special = dynArg.split('spec=')[1].split('|')[0];

				if ((dynArg).indexOf('nofuzzy') >= 0)
					beqTalk.fuzzy = false;

				if ((dynArg).indexOf('simple') >= 0 ||
					channelID == DData.StammChan)
					beqTalk.simple = true;

				//Delete original message, we don't need it.
				if (beqTalk.simple == true)
					messageDJS.delete();

				if ((dynArg).indexOf('source') >= 0)
					beqTalk.showSource = true;

				if ((dynArg).indexOf('cat') >= 0)
					beqTalk.showCat = true;

				//These parameters have parameters in themselves
				//always an equal sign without spaces and the value following it
				if (dynArg.indexOf('type') >= 0)
					beqTalk.wordType1 = dynArg.split('type=')[1].split('|')[0];
				if (dynArg.indexOf('startRes') >= 0)
					beqTalk.startRes = dynArg.split('startRes=')[1].split('|')[0];

				if (beqTalk.transLang == null || langKnown(beqTalk.transLang.toLowerCase()) != true) {
					if (userTLang == null) {
						if (beqTalk.lookLang != 'tlh')
							beqTalk.transLang = 'tlh';
						else
							beqTalk.transLang = defaultTranslation;
					}
					else
						beqTalk.transLang = userTLang;
				}

				if (langKnown(beqTalk.lookLang) != true) {
					beqTalk.failure = true;
					beqTalk.gotResult = false;
					beqTalk.message = "Language not supported!";
				}
				else {
					//Let the engine do its magic :-)
					talkBeq = beq.Engine(beqTalk);

					//Make sure the showSource flag stays
					talkBeq.showSource = beqTalk.showSource;
				}

				sndMessage = beq.createTranslation(talkBeq);

				if (beqTalk.simple != true) {
					//Add some personality if requested:
					sndMessage += beqTalk.newline + beqPerson.getLine(1, true, true, beqTalk.newline);
				}

				break;
			case 'split':
				//No parameters possible!
				var splitRaw = message.substring(5); //!split
				beqTalk = JSON.parse(beq.beqTalkDef);
				beqTalk.command = 'split';
				beqTalk.lookWord = splitRaw;
				beqTalk = beq.Engine(beqTalk);
				sndMessage += beqTalk.message;
				break;
			default:
				//This MUST return false if nothing was done!
				cmdFound = extCmds.extCommands(bot, userID, message, sndMessage);

				//Lets give the personality module a try at the command
				if (cmdFound == false)
					sndMessage = beqPerson.checkCMD(cmd);

				if (sndMessage != false)
					cmdFound = true;

				break;
		}
	}
	//Game
	else if (cmdMagic == '%') {
		/*
			Possible commands
			JOIN - join an existing game, parameter is game number
			CREATE - create a new game
			SPECTATE - send game messages to current channel, optional parameter is game number, otherwise players number
		
		*/
		if (args[1] != undefined && args[1] != null)
			args[1] = args[1].toLowerCase();

		var gameTalk = {};
		var userGameID = userGame[messageDJS.author.userID];
		sndMessage = "Wrong command";

		//User does not have a game running?
		if (userGameID == undefined)
			userGameID = null;

		//Special case: spectate
		if (args[0] == "spectate")
			if (args[1] != undefined)
				userGameID = args[1];

		//No user game ID yet - join or create?
		if (userGameID == null) {
			//If we have an ID given, we might want to join a game?
			if (args[0] == "join")
				userGameID = args[1];
			//Or we actually don't have an ID, so we want to create a game?
			else if (args[0] == "create") {
				gameTalk = JSON.parse(questGame.gameTalkDef);

				//Return is length of array - first index is 0
				userGameID = userGame[messageDJS.author.userID] = (gameData.push(gameTalk)) - 1;
			}
		}

		//By now we should have an existing game ID!
		if (userGameID != null) {
			gameTalk = gameData[userGameID];
			gameTalk.curPlayer = messageDJS.author;
			gameTalk.retMes = "";
			gameTalk.command = "";
logger.info(args[0] + "_" + args[1] + "_" + args[2]);
			//Now to check the rest of the commands
			if (args[0] == "join" || args[0] == "create") {
				gameTalk.command = "add";				
			}
			else if (args[0] == "targetpoints"){
				gameTalk.command = "settarget";
				gameTalk.args = args[1];
			}
			else if (args[0] == "::") {
				gameTalk.command = "sendanswer";
				gameTalk.args = args.slice(1, 999).join(' ');
			}
			else if (args[0] == "++")
			{
				gameTalk.command = "getquestion";
				gameTalk.args = 4;
			}
			else if (args[0] == "??")
			{
				gameTalk.command = "NOP";
				gameTalk.retMes = "Game ID: " + userGameID;
			}				
			else if (args[0] == "spectate")
			{
				gameTalk.command = "spectate";
				gameTalk.args = messageDJS.channel;
			}

			gameTalk = questGame.Engine(gameTalk);
			gameData[userGameID] = gameTalk;
			sndMessage = gameTalk.retMes;
		}





		//wa', cha', wa'maH is disabled for now
		/*
				var gameTalk = gameTalkDef;
				gameTalk = games.runGames(bot, userID, message);
				sndMessage = gameTalk.message;
		*/
	}
	//Categorize
	else if (cmdMagic == '$') {
		beqTalk = JSON.parse(beq.beqTalkDef);
		//Re-org command
		if (message.substring(0, 3) == "***") {
			beqTalk.command = 'cat_reorg';
		}
		else if (message.substring(0, 3) == "+++")
			beqTalk.command = 'rereadkdb';
		else {
			beqTalk.command = 'categorize';
			beqTalk.lookWord = message;
		}
		beqTalk = beq.Engine(beqTalk);
		sndMessage += beqTalk.message;
	}

	if (cmdMagic == '!' || cmdMagic == '?' || cmdMagic == '%' || cmdMagic == '$') {
		if (cmdFound == false)
			sndMessage = '\'e\' vIyajbe\' :-( \n (unknown command)';

		if (sndMessage == '')
			sndMessage = 'ERROR - no message?';

		//Nachricht > 2000 Zeichen aufteilen
		while (sndMessage.length > 0) {
			var sendMessage = sndMessage.substr(0, 1700);
			sndMessage = sndMessage.substr(1700, sndMessage.length);

			//Prevent break of text
			var nextBR = sndMessage.indexOf('\n');
			if (nextBR != -1) {
				//JS starts with 0, and we want to have the \n
				nextBR += 1;
				sendMessage += sndMessage.substr(0, nextBR);
				sndMessage = sndMessage.substr(nextBR, sndMessage.length);
			}
			botSendMessage(1, bot, messageDJS.channel.id, sendMessage);
		}
	}
}

function langKnown(language) {
	var langFound = knownLangs.filter(function (lang) {
		if (lang == language)
			return true;
	}
	);

	if (langFound.length > 0)
		return true;
	else
		return false;
}

function BTalk(message) {
	//Macht Ärger?
	botSendMessage(1, bot, DData.bTChan, message);
}



