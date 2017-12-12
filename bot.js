var Discord = require('discord.io');
var logger = require('winston');
var fs = require('fs');
const parseStringSync = require('xml2js-parser').parseStringSync;

//Read boQwI' xml files to build up internal JSON database
var xmlFiles = fs.readdirSync('./KDB/');
var xml = '';
xmlFiles.forEach(function (item)
{
   xml += fs.readFileSync(('./KDB/'+item), 'utf8');
});
var json = parseStringSync((xml));

//Clear as much memory as possible
xmlFiles = null;
xml = null;
fs = null;

//The JSON contains a LOT of (to us) useless information, in a useless format
//We have to reformat it, and drop everything we don't need while at it
//Current format:
//console.log(json.sm_xml_export.database[0].table[0].column[1]._);   TLH
//console.log(json.sm_xml_export.database[0].table[0].column[2]._);   TYPE
//console.log(json.sm_xml_export.database[0].table[0].column[3]._);   EN
//console.log(json.sm_xml_export.database[0].table[0].column[4]._);   DE
//Wanted format:
//{"tlh":"bay","de":"der Konsonant {b:sen:nolink}","en":"the consonant {b:sen:nolink}","type":"n"},

var KDBJSon = new Array();
var KDBPHJSon = new Array();

json.sm_xml_export.database[0].table.forEach(function (item)
{
	//Sometimes the german translation is missing - use the english translation, so we don't get any errors
	if (item.column[4]._ == null)
		item.column[4]._ = item.column[3]._;
	
	KDBJSon.push(
	{
		'tlh':item.column[1]._,
		'type':item.column[2]._,
		'en':item.column[3]._,
		'de':item.column[4]._
	});

    //Add a separate array for phrases	
	if (item.column[2]._.startsWith('sen'))
		KDBPHJSon.push(
		{
			'tlh':item.column[1]._,
			'type':item.column[2]._,
			'en':item.column[3]._,
			'de':item.column[4]._
		});		
});

json = null;

//Internal version - package.json would contain another version, but package.json should never reach the client,
//so it's easier to just have another version number in here...
var versInt = '1.2.1	 - Finally on Heroku (and gitHub)!';
var startDateTime = new Date().toLocaleString();

//Can be changed
var defaultTranslation = 'en';

//Keep track of the language the user wants us to use
var userTranLang = new Array();

//Keep track of the fuzzy/non-fuzzy search settings for the users
var userFuzzy = new Array();

//Generic index for search/replace in array
var aIdx = null;

var knownLangs = ['de', 'en', 'tlh'];

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
    token: process.env.token,
    autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
	logger.info('Version:' + versInt);
});

bot.on('message', function (user, userID, channelID, message, evt)
{
	var sndMessage = '';
	
    // Our bot needs to know if it needs to execute a command
    // for this script it will listen for messages that will start with `!`
	// Expected format: COMMAND ARG1 ARG2 ARG3
	// For example: mugh tlh Suv
	// That is: command (translate) language (klingon) word (Suv)
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        switch(cmd) {
            // !ping - Standardtest um zu sehen ob er aktiv ist
            case 'ping':
                sndMessage = 'pong';
            break;
			case 'yIngu\'':
			   sndMessage = 'beq \'oH pongwIj\'e\'.\nVersion: ' + versInt + '\nI am a helper bot. Use "CMDLIST" for a list of commands.\n'
			   sndMessage += 'I am active since ' + startDateTime + '\n';
			   sndMessage += 'I\'m using the database of De\'vIDs boQwI\'\n';
			   sndMessage += '\n';
			   sndMessage += '*naDev jItoy\'taHpa\', SuvwI\'\'a\' jIH\'e\'.\nLe\'rat, Tignar tuq, jIH.\n\n toH. yInvetlh \'oHta\'*\n';
			break;
			
			//Liste der Befehle - muß von Hand aktualisiert werden!
			case 'CMDLIST':
			   sndMessage = 'ping - simple response test\n'
			              + 'yIngu\' - Name and version of the bot\n'
						  + 'CMDLIST - this here\n'
						  + 'tlhIngan - replies "maH!"\n'
						  + 'mugh - translation lookup, is intended to look up single words in the boQwI\' database\n'
						  + '       sentences have to have their spaces replaced with _ !'
						  + 'mugh tlh - look up klingon->english(or german)\n'
						  + 'mugh en  - look up english->klingon\n'
						  + 'mugh de  - look up german->klingon\n'
						  + 'setTLang - set translation language to the argument, i.e. "setTLang en" for english translations\n'
						  + 'OUTDATED!\n';
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
				     userTranLang.push({userID:userID, lang:workLang});

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
				   userFuzzy.push({userID:userID, fuzzy:newFuzz});
			   
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
				//TODO: KWOTD - random word/sentence, type of word as parameter
				//Die Wortart in boQwI' ist "sen:rp" für Ersatz-Sprichwörter, "sen:sp" für Geheimnis-Sprichwörte				
				
				var tmpWord = '';
				var wordType = args[1];
				if (wordType == null)
					wordType = 'sen:rp';

			   aIdx = null;
			   var ULang = getUserTranLang(userID);
				
				//We look in KDBPHJSon - which only contains phrases/sentences
				for (i = 0; i < KDBPHJSon.length; i++)
				{
					tmpWord = KDBPHJSon[Math.floor(Math.random() * (KDBPHJSon.length + 1))];
					if (tmpWord != null && tmpWord.type == wordType)
						break;
				}
				
				if (aIdx != null)
				   sndMessage += tmpWord[ULang[0].lang] + '\n';
			    else
					sndMessage += tmpWord.en + '\n';
				sndMessage += '=>' + tmpWord.tlh + '\n';
			break;

		
			//Übersetzungen
			case 'mugh':
			//TODO: aufräumen, das ganze "null/nicht null" durch true/false ersetzen
			   var p_lookLang = args[1];
			   var p_lookWord = args[2];
			   var p_lookTran = args[3];   //This argument can also be any of the later ones, if the language is taken from default
			   var p_lookFuzz = args[4];
			   var p_lookCase = args[5];   //Makes no sense - 4 doesn't check for value, so you'd always have to use fuzzy
			   var p_startRes = args[6];
			   var p_filtWord = args[7];

			   var lookLang = null;
			   var lookWord = null;
			   var lookTran = null;
			   var lookFuzz = null;
			   var lookCase = null;
			   var startRes = null;
			   var filtWord = null;

			   if (p_lookTran == null)
			      p_lookTran = '';
			   if (p_lookCase == null)
			      p_lookCase = '';
			   if (p_lookFuzz == null)
			      p_lookFuzz = '';
			   if (p_startRes == null)
		        p_startRes = '';
         if (p_filtWord == null)
		        p_filtWord = '';
			   
			   var dynArg = p_lookTran + '|' + p_lookFuzz + '|' + p_lookCase + '|' + p_startRes + '|' + p_filtWord;

			   if (dynArg.indexOf('case') >= 0)
			      lookCase = 'case';
			   if (dynArg.indexOf('fuzzy') >= 0)
			      lookFuzz = true;
            
         //These paramters have parameters in themselves
         //always an equal sign without spaces and the value following it
			   if (dynArg.indexOf('type') >= 0)
			      filtWord = dynArg.split('type=')[1].split('|')[0];
			   if (dynArg.indexOf('startRes') >= 0)
				   startRes = dynArg.split('startRes=')[1].split('|')[0];
			   
				lookLang = p_lookLang;
				lookWord = p_lookWord;
				lookTran = p_lookTran;
				
				//If we have no parameter, we use the user default
				if (lookFuzz == null)
				{
					aIdx = null;
					var uFuzz = getUserFuzzy(userID);
					if (aIdx != null)
						lookFuzz = uFuzz[0].fuzzy;
				}
					
			   if ((p_lookTran+p_lookFuzz+p_lookCase).indexOf('nofuzz') >= 0)
			      lookFuzz = false;
			  
			   if (lookFuzz == null)
				   lookFuzz = false;

			   //Translation language
			   //as requested
			   //same as lookup language
			   //user Default
			   //program default, if all else fails
			   
			   if (lookTran == null || langKnown(lookTran.toLowerCase()) != true)
			   {
				  aIdx = null;
				  var ULang = getUserTranLang(userID);
				
				  if (aIdx == null)
				  {
					 if (lookLang != 'tlh')
						lookTran = lookLang;
					 else
					    lookTran = defaultTranslation;
				  }
				  else
					lookTran = ULang[0].lang;
			   }

     		   lookLang = lookLang.toString().toLowerCase();
			   if (langKnown(lookLang) != true)
			      sndMessage += 'Requested language not supported!\n';
			   else
			   {		
			      var results = null;
				  lookWord = lookWord.replace("_", " ");

				  //Case INSensitive search in klingon is useless (qaH is different from QaH)
				  if (lookLang == 'tlh')
				     lookCase = '';

				  var regexLook = lookWord;
				  var regexFlag = '';

				  if (lookCase == 'case')
				     regexFlag += 'i';

				  //Not fuzzy == exact match
				  if (lookFuzz == false)
					 regexLook = '^' + regexLook + '$';

				  //TODO: search with boundary? only single word?
				    
				  var RE = new RegExp(regexLook, regexFlag);
				  results = KDBJSon.filter(function(item){ return item[lookLang].match(RE);});
          
          if (filtWord != null)
          {
            var resultW = results.filter(function(item){return item.type.split(':')[0] == filtWord});
            results = resultW;
          }

				   if (results != null)
				      sndMessage += createTranslation(lookWord, lookLang, lookTran, results, lookFuzz, lookCase, startRes, filtWord);
				   else
				      sndMessage += 'Sorry, nothing found.\n';
			   }

			break;
            default:
                sndMessage = '\'e\' vIyajbe\' :-( \n (unknown command)';
        }
		bot.sendMessage({ to: channelID, message: sndMessage });
		
        args = args.splice(1);
    }
});

function getUserTranLang(userID)
{
   return userTranLang.filter(function(UT, iIdx) {if (UT.userID == userID) {aIdx = iIdx;  return UT}});
}

function getUserFuzzy(userID)
{
   return userFuzzy.filter(function(item, iIdx) {if (item.userID == userID) {aIdx = iIdx;  return item}});
}

function langKnown(language)
{
   var langFound = knownLangs.filter(function(lang){ if (lang == language) return true;});

   if (langFound.length > 0)
      return true;
   else
      return false;
}

function createTranslation(lookWord, lookLang, lookTran, results, useFuzzy, useCase, startRes)
{
var sndMessage = '';
	sndMessage += '\nYou asked for \'' + lookWord + '\' - I found ' + results.length + ' possible results:\n';
	if (startRes > 0)
		sndMessage += '(Starting from result #' + startRes + '\n';
	var count = 0;
	var startCount = startRes;

	results.forEach(function(item)					  
	{
	   startCount--;
	   if (startCount <= 0 && count < 20)
	   {
	   	   count++;
		   sndMessage += (+startRes + +count).toString() + ') ' + getWType(item.type, lookTran) + ': ';

	//     Wenn auf klingonisch gesucht wurde, in DE/EN übersetzen,
	//     andernfalls immer das klingonische zurückgegeben
		   if (lookLang == 'tlh')
		   {
			  if (lookTran == 'en')
				 sndMessage += item.en + '\n';
			  else if (lookTran == 'de')
				 sndMessage += item.de + '\n';

			  if (useFuzzy == true)
			     sndMessage += '==> ' + item.tlh + '\n';
		   }
		   else
		   {
			  sndMessage += item.tlh + '\n';
			  if (useFuzzy == true || useCase != null)
			  {
  				  if (lookTran == 'en')
					 sndMessage += '==> ' + item.en + '\n';
				  else if (lookTran == 'de')
					 sndMessage += '==> ' + item.de + '\n';
			  }
			}
 	   }
	})
	if (count >= 20)
	   sndMessage += '...too many results. Stopping list.\n';

return sndMessage;
}

function getWType(wType, tranLang)
{
  var wTypeS = wType.split(':')[0];
  var wTypeL = '';

  if (tranLang == 'de')
  {
     if (wTypeS == 'n')
        wTypeL = 'Nomen';
     else if (wTypeS == 'v')
        wTypeL = 'Verb';
     else if (wTypeS == 'sen')
	    wTypeL = 'Satz';
     else if (wTypeS == 'excl')
	    wTypeL = 'Ausruf';
     else if (wTypeS == 'adv')
	    wTypeL = 'Adverb';
	 else if (wTypeS == 'conj')
   	    wTypeL = 'Bindewort';
	 else if (wTypeS == 'ques')
   	    wTypeL = 'Frage';
     else
        wTypeL = 'unsupported yet';
  }
  else if (tranLang == 'en')
  {
     if (wTypeS == 'n')
        wTypeL = 'Noun';
     else if (wTypeS == 'v')
        wTypeL = 'Verb';
     else if (wTypeS == 'sen')
	    wTypeL = 'Sentence';
     else if (wTypeS == 'excl')
	    wTypeL = 'Exclamation';
     else if (wTypeS == 'adv')
	    wTypeL = 'Adverb';
	 else if (wTypeS == 'conj')
		wTypeL = 'Conjunction';
	 else if (wTypeS == 'ques')
   	    wTypeL = 'Question';
     else
        wTypeL = 'unsupported yet';
  }

   return wTypeL;
}
