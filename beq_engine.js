/*

Beq-Engine

Functions to use:

Engine:
Main function, does the heavy lifting. Translate, identify(yIngu'), KWOTD


createTranslation:
As the name says, it translates the beqTalk result into a readable string
Must be called manually, since the result is not useful everywhere, while the beqTalk-Result is JSON
The result will be NULL if beqTalk-gotResult is set to NULL
=>This method is intended for Discord-Bots or Text output!

IMPORTANT STUFF:

The beq-engine talks through the beqTalk structure - a JSON construct that is modified and returned:
You must initialize it before calling beq! Some fields may have default entries!

	"fuzzy": false,               // "fuzzy" searching, i.e. no word boundaries  => true/false
	"wCase": false,               // search ignoring case                        => true/false
	"remPref": false,             // Remove prefix if no result is found otherwise
	"lookLang": "",               // the language the word you want translated is in  (or the type of source)
	"lookWord": "",               // the word you are looking for                     (or the source value)
	"lookSource": "",             // sources you're looking in (TKD, qep'a', 2018, etc...) - KWTOD for now!
	"transLang": "",              // the language you want as result
	"command": "",                // the actual command, like "mugh"
	"simple": "",                 // true/false -> Keep the output simple, no personality, no fluff
	"special": "",                // special commands, untested, unlisted, etc...
	"showNotes": ""               // Show notes, if available? => true/false
	"showSource": ""              // Show source, if available => true/false
	"wordType1": null,            // some commands or functions allow to limit the word type, for example KWOTD does that
	"wordType2": null,            // use the word types as defined by boQwI', i.e. "sen:sp" for "sentence, secret proverb"
	"startRes": '0',              // used in createTranslation, if you know there are more than "limitRes" results, you can specify a starting number
	"limitRes": '20',             // in some cases (Discord) you may not want to get ALL the results, but only up to "limitRes"
	"newline": "\n",              // When formatted text is returned, this will be used as newline - i.e. Text output or HTML output
	"result": [{ "type":"",       // the translation results are returned in this JSON array. Type is the word type, see boQwI'
	            "tlh":"",         // the klingon word
				"en":"",          // the english word
				"de":""           // the german word
				"ru":""           // the russian word
				"slang":""        // Flag, is this is slang word? => true/false
				"deriv":""        // Flag, is this entry derived from other words? => true/false
				"notes":""        // Notes to the word (slang, where from, etc..)
				"notes_de":""     // Notes in german - if available!
				"hidden_notes":"" // "Hidden" notes that are shown in small font in boQwI'
				"source":""       // Where the text comes from
			  }],                 //
    "message": "",                // some functions or commands may return a message, it will be in here
	"gotResult": false,           // indicates if the search was successful => true/false
	"failure":false               // indicates if there was a problem (i.e. command not found) => true/false

*/
var kTranscode = require('./bot_modules/utils/recode.js');
var fs = require('fs');
var xmldoc = require('xmldoc');

//Testing
var logger = require('winston');

module.exports.Engine = function(beqTalk)
{
	//Startup function (constructor, basically)
	if (module.exports.versInt == undefined)
	{
		var fs = require('fs');
		module.exports.versInt = '1.1.2	- The beq Engine lives!';
		module.exports.startDateTime = new Date().toLocaleString();
		module.exports.KDBVer = fs.readFileSync('./KDB/VERSION', 'utf8');
		
		module.exports.KDBJSon = new Array();           //Generic database of all words
		module.exports.KDBPHJSon = new Array();         //All phrases
		module.exports.KDBVPJSon = new Array();         //All verb prefixes
		module.exports.KDBVSJSon = new Array();          //All verb suffixes
		module.exports.KDBNSJSon = new Array();         //All noun suffixes
			
		//Load XML data
		readXML(module.exports.KDBJSon, module.exports.KDBPHJSon, module.exports.KDBVPJSon, module.exports.KDBVSJSon, module.exports.KDBNSJSon);
	}
	
	var tmpTxt = "";
	var isSlang = false;	
	var isDeriv = false;
	switch (beqTalk.command)
	{
		case 'yIngu\'':
		   tmpTxt  = 'Beq engine, version ' + module.exports.versInt + beqTalk.newline;
		   tmpTxt += 'Text recoding version: ' + kTranscode.versInt +  beqTalk.newline;
		   tmpTxt += 'Running since ' + module.exports.startDateTime + beqTalk.newline;		   
		   tmpTxt += beqTalk.newline + 'Klingon Database from De\'vIDs boQwI\', ' + module.exports.KDBVer + beqTalk.newline;
		   tmpTxt += module.exports.KDBJSon.length + ' words in database.' + beqTalk.newline;
		   tmpTxt += beqTalk.newline;
		   beqTalk.message = tmpTxt;
		break;
		
		case 'KWOTD':			
			//TODO: KWOTD - random word/sentence, type of word as parameter
			//Die Wortart in boQwI' ist "sen:rp" für Ersatz-Sprichwörter, "sen:sp" für Geheimnis-Sprichwörte
			beqTalk.result = new Array();
			
			//Default-Wordtypes?
			if (beqTalk.wordType1 == null)
			   beqTalk.wordType1 = 'sen:rp';

			var tmpWord = null;
			var useArray = new Array();
			
			//Sources we're looking in
			var lookSource = beqTalk.lookSource;
			
			//Default case, look through specific arrays
			if (lookSource == undefined || lookSource == "")
			{
				//Multiple categories can be combined via |
				var allCat = beqTalk.wordType1.split('|');
				allCat.forEach(function(itemCat)
				{			
				//We have to decide which array we're going to use
				var tmpWPref = itemCat.split(':')[0];

				if (tmpWPref == 'sen')
				   useArray = useArray.concat(module.exports.KDBPHJSon);
				else if (tmpWPref == 'vs' || itemCat == 'v:suff')
				   useArray = useArray.concat(module.exports.KDBVSJSon);
				else if (tmpWPref == 'vp' || itemCat == 'v:pref')
				   useArray = useArray.concat(module.exports.KDBVPJSon);
				else if (tmpWPref == 'ns' || itemCat == 'n:suff')
				   useArray = useArray.concat(module.exports.KDBNSJSon);
				else if (tmpWPref == 'n' || tmpWPref == 'v')
				   useArray = useArray.concat(module.exports.KDBJSon);

				//boQwI' uses different notation, but vp is easier to write than v:pref :-)
				if (tmpWPref == 'vs')
				   tmpWPref = 'v:suff';
				else if (tmpWPref == 'vp')
				   tmpWPref = 'v:pref';
				else if (tmpWPref == 'ns')
				   tmpWPref = 'n:suff';
				});  //allCat forEach

				for (i = 0; i < useArray.length; i++)			
				{
					//We already preselected the array, so can we go wrong by taking any entry?
					tmpWord = useArray[Math.floor(Math.random() * (useArray.length + 1))];				
					if (tmpWord != null && isHyp(tmpWord.type) == false && isAlt(tmpWord.type) == false)
						break;
					tmpWord = null;
				}
			}  //lookSource != undefined
			else
			{
			   //lookSource might have spaces, which are replaced with _
			   lookSource = lookSource.replace(/_/g, ' ');
			   //We are looking for a word in a specific source
			   var allWordsNum = module.exports.KDBJSon.length;

			   //Try it 500 times at most
			   for (i = 0; i < 500; i++)
			   {
				   tmpWord = module.exports.KDBJSon[Math.floor(Math.random() * (allWordsNum + 1))];
				   if (tmpWord != null && tmpWord.source.includes(lookSource))
					   break;
				   tmpWord = null;
			   }
			}

			if (tmpWord != null)
			{
				//Specially mark slang words
				isSlang = false;
				if (tmpWord.type.indexOf("slang") >= 0)
					isSlang = true;
				
				//Derived entries are not 100% canon, but most likely
				isDeriv = isDerived(tmpWord.type);
				
				beqTalk.result.push( {"tlh":tmpWord.tlh,
									   "en":tmpWord.en,
									   "de":tmpWord.de,
						                           "ru":tmpWord.ru,

									   "type": tmpWord.type,
									   "slang": isSlang,
									   "deriv": isDeriv,
									   
									   "notes":tmpWord.notes,
									   "notes_de":tmpWord.notes_de,
									   "hidden_notes":tmpWord.hidden_notes,
									   "source":tmpWord.source});
				beqTalk.gotResult = true;
			}
			break;
			
		case "recode":
		  var tmpText = '';
		  var encoding = '';
		  
		  //lookLang and transLang are NOT language IDs here, but they mark the original "encoding" of the text in lookWord (also not just a word)
		  if (beqTalk.lookLang == 'tlhIngan' && ( beqTalk.transLang == 'xifan' || beqTalk.transLang == 'XIFAN'))
		  {			  
			  if (beqTalk.transLang == 'XIFAN')
			  {
				  encoding = 'tlhIngan > XIFAN';
				  tmpText = kTranscode.RCtlh2x(beqTalk.lookWord, true);
			  }
			  else
			  {
				  encoding = 'tlhIngan > xifan';
				  tmpText = kTranscode.RCtlh2x(beqTalk.lookWord, false);
			  }
		  }
		  else if ((beqTalk.lookLang == 'xifan' || beqTalk.lookLang == 'XIFAN') && ( beqTalk.transLang == 'tlhIngan'))
			  tmpText = kTranscode.RCx2tlh(beqTalk.lookWord);
		  else if (beqTalk.lookLang == 'tlhIngan' && beqTalk.transLang == 'uhmal')
			  tmpText = kTranscode.RCtlh2u(beqTalk.lookWord);
		  else if (beqTalk.lookLang == 'uhmal' && beqTalk.transLang == 'tlhIngan')
			  tmpText = kTranscode.RCu2tlh(beqTalk.lookWord);
		  else if (beqTalk.lookLang == 'tlhIngan' && beqTalk.transLang == 'TIxan')
			  tmpText = kTranscode.RCtlh2T(beqTalk.lookWord);
  		  else if (beqTalk.lookLang == 'TIxan' && beqTalk.transLang == 'tlhIngan')
			  tmpText = kTranscode.RCT2tlh(beqTalk.lookWord);
		  
		  if (tmpText != '')
		  {
			  //This might change later on, I'm unsure if the createTranslation method should be able to use this or not...
			  beqTalk.result = new Array();
			  beqTalk.result.push( {"tlh":beqTalk.lookWord, "en":tmpText,"de":'', "type": 'RECODE', "slang": false, "notes":'', "notes_de":'', "hidden_notes":''});
			  beqTalk.lookWord = new String('recoding');
			  beqTalk.gotResult = true;
		  }
		  else
		  {
			  beqTalk.gotResult = false;
			  beqTalk.failure = true;
			  beqTalk.message  = 'Recoding is only possible between these "languages"' + beqTalk.newline + '(supply them in lookLang for source, and transLang for destination)';
			  beqTalk.message += beqTalk.newline;
			  beqTalk.message += 'tlhIngan <> xifan/XIFAN' + beqTalk.newline;
			  beqTalk.message += 'tlhIngan <> uhmal' + beqTalk.newline;
			  beqTalk.message += 'tlhIngan <> TIxan' + beqTalk.newline;
		  }
		break;		
		case 'mugh':
			var results = null;
			var sumRes = new Array();
			var allResult  = new Array();
			beqTalk.result = new Array();

			//Case INSensitive search in klingon is useless (qaH is different from QaH)
			if (beqTalk.lookLang == 'tlh')
				beqTalk.wCase = false;

			//If we're looking for a phrase, any space has to have been replaced with _
			beqTalk.lookWord = beqTalk.lookWord.replace(/_/g, ' ');
			
			//Klingon usually uses the straight apostrophe, ', but sometimes a ´ or ` is used
			beqTalk.lookWord = beqTalk.lookWord.replace(/\´/g, '\'');
  		        beqTalk.lookWord = beqTalk.lookWord.replace(/\`/g, '\'');
			beqTalk.lookWord = beqTalk.lookWord.replace(/\‘/g, '\'');			

			//Maybe we are looking for multiple words at once?
			var multiWord = beqTalk.lookWord.split('|');
			
			for (var i = 0; i < multiWord.length; i++)
			{
				beqTalk.lookWord = multiWord[i];
				while (results == null || results.length == 0)
				{			

					var regexLook = beqTalk.lookWord;
					var regexFlag = '';
					
					//Case sensitive?
					if (beqTalk.wCase == true)
						regexFlag += 'i';
					
					//Not fuzzy == exact match
					if (beqTalk.fuzzy == false)
						regexLook = '^' + regexLook + '$';
					
					//TODO: search with boundary? only single word?
					var RE = new RegExp(regexLook, regexFlag);
					results = module.exports.KDBJSon.filter(function (item)
					{
						return item[beqTalk.lookLang].match(RE);
					});

					if (beqTalk.wordType1 != null)
					{
						var resultW = results.filter(function (item)
						{
							return item.type.split(':')[0] == beqTalk.wordType1;
						});
						results = resultW;
					}
					
					//No results? Maybe with different parameters!
					if (results == null || results.length == 0)
					{
						//First try it without case (unless it's klingon, that always uses case)
						if (beqTalk.wCase == false && beqTalk.lookLang != 'tlh')
						{
							beqTalk.wCase = true;
							continue;
						}
						
						//Still nothing? Try fuzzy search
						if (beqTalk.fuzzy == false)
						{
							beqTalk.fuzzy = true;
							continue;
						}
						
						//Even after case and fuzzy we didn't find anything?
						//Try to remove the prefix:
						if (beqTalk.lookLang == 'tlh' && beqTalk.remPref == false)
						{
							//A verb + prefix has at least 4 characters: 2prefix, 2verb
							if (beqTalk.lookWord.length > 3)
							{
								//Sind das eh alle Prefixe?
								var tmpVerb = beqTalk.lookWord.replace(/^(HI|gho|yI|tI|pe|qa|Sa|vI|jI|pI|re|wI|DI|ma|cho|ju|Da|bI|tu|che|bo|mu|nu|Du|lI|nI|lI)/, '');

								//Simple checks, shortest syllable has 2 characters
								if (tmpVerb.length >= 2 &&
								    //and has to start with a consonant
								    tmpVerb.search(/^b|ch|D|gh|H|j|l|m|n|ng|p|q|Q|r|S|t|tlh|v|w|y|’/) > -1)
									beqTalk.lookWord = tmpVerb;
							}
							
							//If it has a prefix, it can only be a verb!
							beqTalk.wordType1 = 'v';
							beqTalk.remPref = true;
							continue;
						}
						
						//Apparently we tried case and fuzzy (and removal of prefix) - nothing to find here :-(
						break;
					}
				}
				sumRes = sumRes.concat(results);
				results = new Array();
			}
			results = sumRes;
			
			if (results != null && results.length > 0)
			{
				beqTalk.gotResult = true;
				results.forEach(function (item)
				{
					//Specially mark slang words
					isSlang = false;
					if (item.type.indexOf("slang") >= 0)
						isSlang = true;

					beqTalk.result.push( {"tlh":item.tlh, "en":item.en,"de":item.de,"ru":item.ru, "type": item.type, "slang": isSlang, "notes":item.notes, "notes_de":item.notes_de, "hidden_notes":item.hidden_notes});
				});
			}
			else
				beqTalk.gotResult = false;
		break;
		case "yIcha'":
			if (beqTalk.wordType1 == "prefix")
			{
				//Simply export all prefixes
				//Do a loop because we might want to limit it some day (i.e. all prefixes using "he", for example)
				module.exports.KDBVPJSon.foreach(function(onePref)
				{
					beqTalk.result.push(onePref);
				});
			}
			else if (beqTalk.wordType1 == "verbsuffix")
			{
			}
		break;
	default:
	   beqTalk.gotResult = false;
	   beqTalk.failure = true;
	}
	return beqTalk;
};

//Declarations have to be at the end?
module.exports.beqTalkDef = JSON.stringify(
{
	"fuzzy": false,
	"wCase": false,
	"remPref": false,
	"lookLang": "",
	"lookWord": "",
	"transLang": "",
	"command": "",
	"simple": "",
	"special": "",
	"showNotes": false,
	"wordType1": null,
	"wordType2": null,
	"startRes": '0',
	"limitRes": '20',
	"newline": "\n",
	"result": [{ "type":"",
	            "tlh":"",
				"en":"",
				"de":"",
		                "ru":"",
				"notes":"",
				"notes_de":"",
				"hidden_notes":"",
		                "source":""
			  }],
    "message": "",
	"gotResult": false,
	"failure":false
});

module.exports.createTranslation = function(beqTalk)
{
	if (beqTalk.gotResult == false)
		return "Nothing found." + beqTalk.newline;
	
	if (beqTalk.lookSource != undefined && beqTalk.lookSource != null)
	   beqTalk.showSource = true;
	
	var sndMessage = '';
	var infTips = "";
	//Maybe we can use this for multi-language?
	var intText =
	{
		"resStart": 'You asked for "&1 ", I found &2 possible results',
		"resFuzz": " using fuzzy searching",
		"resCase": ", ignoring case",
		"remPref": ", removing possible prefixes",
		"resSTR": "(Starting from result #&1)",
		"resTMR": "...too many results. Stopping list.",
		"resDeriv": "(Derived translation from other entries.)",
		"resSlang": "(Slang!)",
		"resHyp": "(Hypothesised entry, doesn't exist in canon on its own)",
		"resSrc": "Source:"
	};
	
	if (beqTalk.command == "mugh")
	{
		if (beqTalk.simple != true)
		{
			sndMessage = intText.resStart;
			sndMessage = sndMessage.replace("&1", beqTalk.lookWord);
			sndMessage = sndMessage.replace("&2", beqTalk.result.length);
			if (beqTalk.fuzzy == true)
				sndMessage += intText.resFuzz;
			if (beqTalk.wCase == true)
				sndMessage += intText.resCase;
			if (beqTalk.remPref == true)
				sndMessage += intText.remPref;
			sndMessage += beqTalk.newline + beqTalk.newline;
		}
	}

	var count = 0;
	var startCount = beqTalk.startRes;
	
	//Maybe the user though we'd get more results?
	if (startCount > beqTalk.result.length)
		startCount = beqTalk.startRes = 0;
	
	if (startCount > 0)
	{
		sndMessage += intText.resSTR;
		sndMessage = sndMessage.replace("&1", startCount);
		sndMessage += beqTalk.newline;
	}
	
	//We need either DE or EN as language for the word types
	var listLang = beqTalk.transLang;
	if (listLang == 'tlh')
		listLang = 'en';

	beqTalk.result.forEach(function (item)
	{
		startCount--;
		
		if (startCount <= 0 && count < beqTalk.limitRes)
		{
			count++;
			sndMessage += (+beqTalk.startRes + +count).toString() + ') ' + getWType(item.type, listLang) + ': ';
			
			sndMessage += item[beqTalk.lookLang] + beqTalk.newline;
			sndMessage += '==> ' + item[beqTalk.transLang] + beqTalk.newline;
			
			//Special case (stupid case, but nonetheless)
			if ( (beqTalk.lookLang == 'en' && beqTalk.transLang == 'de') ||
				 (beqTalk.lookLang == 'de' && beqTalk.transLang == 'en'))
				 sndMessage += '==> ' + item.tlh + beqTalk.newline;
				 
			if (beqTalk.showNotes == true)
			{
				if (item.notes != '')
					sndMessage += 'Notes: ' + item.notes + beqTalk.newline;
				if (item.notes_de != '')
					sndMessage += 'Notes de: ' + item.notes_de + beqTalk.newline;
				if (item.hidden_notes != '')
					sndMessage += 'Hidden notes: ' + item.hidden_notes + beqTalk.newline;
			}
			if (beqTalk.showSource == true)
				sndMessage += intText.resSrc + " " + item.shource + beqTalk.newline;
			
			//Tips about the word, is it slang, is it derived, are there notes, etc...
			infTips = "";			
			if (item.slang == true)
				infTips = '(slang)';				
			if (item.deriv == true)
				infTips += '(deriv)';
			if (isHyp(item.type))
				infTips += '(hyp)';
			if (beqTalk.showNotes != true &&
			   ( item.notes != "" || item.notes_de != "" || item.hidden_notes != "" ))
				infTips += '(notes)';
			
			if (infTips != "")
			   sndMessage += '===>*' + infTips + '*' + beqTalk.newline;
		}
	}
	)
	if (count >= beqTalk.limitRes)
		sndMessage += intText.resTMR + beqTalk.newline;

	return sndMessage;
}

module.exports.createTranslationList = function(beqTalk)
{
	if (beqTalk.gotResult == false)
		return "Nothing found." + beqTalk.newline;
	
	var sndMessage = '';
	
	//We need either DE or EN as language for the word types
	var listLang = beqTalk.transLang;
	if (listLang == 'tlh')
		listLang = 'en';

	beqTalk.result.forEach(function (item)
			       {
		sndMessage += item.tlh + '\t' + getWType(item.type, listLang) + ': ' + item.en + beqTalk.newline;
	});

		return sndMessage;
}

//Check if the word is actually a derived definition
function isDerived(wType)
{
	if (wType.indexOf("deriv") != -1)
		return true;
	else
		return false;
}

//Check if entry is hyptothetical
function isHyp(wType)
{
	if (wType.indexOf("hyp") != -1)
		return true;
	else
		return false;
}

//Check if entry is alternate spelling
function isAlt(wType)
{
	if (wType.indexOf("alt") != -1)
		return true;
	else
		return false;
}

//Get (translate) word Type
function getWType(wType, tranLang)
{
	var wTypeS = wType.split(':')[0];
	var wTypeL = '';

	if (tranLang == 'de')
	{
		if (wTypeS == 'n')
		{
			wTypeL = 'Nomen';
			if (wType == 'n:suff')
				wTypeL = 'Nomen Suffix';
		}
		else if (wTypeS == 'v')
		{
			wTypeL = 'Verb';
			if (wType == 'v:pref')
				wTypeL = 'Verb Prefix';
			else if (wType == 'v:suff')
				wTypeL = 'Verb Suffix';
		}
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
		{
			wTypeL = 'Noun';
			if (wType == 'n:suff')
				wTypeL = 'Noun Suffix';
		}
		else if (wTypeS == 'v')
		{
			wTypeL = 'Verb';
			if (wType == 'v:pref')
				wTypeL = 'Verb Prefix';
			else if (wType == 'v:suff')
				wTypeL = 'Verb Suffix';
		}
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

//Get SENTENCE type - needed for KWOTD
function getSType(wType, tranLang)
{
	var wTypeW = wType.split(':')[0];
	var wTypeS = wType.split(':')[1];
	
	var tmpRet = "";
	
	if (wTypeW != "sen")
		return "Wrong type!";

	if (tranLang == 'en')
	{
		if (wTypeS == 'rp')
			tmpRet = 'Replacement proverb';
		else if (wTypeS == 'sp')
			tmpRet = 'Secret proverb';
		else
			wTypeL = 'unsupported yet';
	}
	else if (tranLang == 'de')
	{
		if (wTypeS == 'rp')
			tmpRet = 'Ersatzsprichwort';
		else if (wTypeS == 'sp')
			tmpRet = 'Geheimnissprichwort';
		else
			wTypeL = 'unsupported yet';
	}

	return tmpRet;
}


function readXML(KDBJSon, KDBPHJSon, KDBVPJSon, KDBVSJSon, KDBNSJSon)
{
	//Read boQwI' xml files to build up internal JSON database
	var xmlFiles = fs.readdirSync('./KDB/');
	var xml = '';
	xmlFiles.forEach(function (item)
	{
		if (item.substr(-4) == '.xml')
		   xml += fs.readFileSync(('./KDB/' + item), 'utf8');    
	}
	);
	var KDBVer = fs.readFileSync('./KDB/VERSION', 'utf8');

	var document = new xmldoc.XmlDocument(xml);

	//Wanted format:
	//{"tlh":"bay","de":"der Konsonant {b:sen:nolink}","en":"the consonant {b:sen:nolink}","type":"n"},
	var emptyStruct =
	{
		tlh: 'tlhIngan',
		en: 'klingon',
		de: 'Klingone',
		ru: '',
		type: 'n',
		notes: 'notes',
		notes_de: 'notes_de',
		hidden_notes: 'hidden_notes',
		source: 'source'
	};

	document.children[1].childrenNamed("table").forEach(function (headItem)
	{
		emptyStruct = new Array(
			{
				tlh: '',
				en: '',
				de: '',
				ru: '',
				type: '',
				notes: '',
				notes_de: '',
				hidden_notes: '',
				source: ''
			}
			);

		//Transfer only the data we actually want
		headItem.childrenNamed("column").forEach(function (item)
		{
			if (item.firstChild != null)
			{
				switch (item.attr.name)
				{
				case 'entry_name':
					emptyStruct.tlh = item.firstChild.text;
					break;
				case 'part_of_speech':
					emptyStruct.type = item.firstChild.text;
					break;
				case 'definition':
					emptyStruct.en = item.firstChild.text;
					break;
				case 'definition_de':
					emptyStruct.de = item.firstChild.text;
					break;
				case 'definition_ru':
					emptyStruct.ru = item.firstChild.text;
					break;
				case 'notes':
					emptyStruct.notes = item.firstChild.text;
					break;
				case 'notes_de':
					emptyStruct.notes_de = item.firstChild.text;
					break;
				case 'hidden_notes':
					emptyStruct.hidden_notes = item.firstChild.text;
					break;
				case 'source':
					emptyStruct.source = item.firstChild.text;
					break;			
				}
			}
		}
		);

		//Make sure everything's here (sometimes the german is missing)
		if (emptyStruct.de == '' || emptyStruct.de == undefined)
			emptyStruct.de = emptyStruct.en;
		//New languages are definitely sometimes missing
		if (emptyStruct.ru == '' || emptyStruct.ru == undefined)
			emptyStruct.ru = emptyStruct.en;

		//Just to be sure...
		if (emptyStruct.en == undefined)
			emptyStruct.en = '';
		if (emptyStruct.tlh == undefined)
			emptyStruct.tlh = '';
		if (emptyStruct.ru == undefined)
			emptyStruct.ru = '';
		if (emptyStruct.notes == undefined)
			emptyStruct.notes = '';
		if (emptyStruct.notes_de == undefined)
			emptyStruct.notes_de = '';
		if (emptyStruct.hidden_notes == undefined)
			emptyStruct.hidden_notes = '';
		if (emptyStruct.source == undefined)
			emptyStruct.source = '';
		
		//Cleanup - boQwI' contains links to other, related words - we don't use them, so I throw them away
		var regClean = /(\:[a-zA-Z0-9]*)/g;
		emptyStruct.notes        = emptyStruct.notes.replace(regClean, '');
		emptyStruct.notes_de     = emptyStruct.notes_de.replace(regClean, '');
		emptyStruct.hidden_notes = emptyStruct.hidden_notes.replace(regClean, '');
		emptyStruct.source       = emptyStruct.source.replace(regClean, '');
		
		var regClean2 = ",nolink";
		emptyStruct.notes        = emptyStruct.notes.replace(regClean2, '');
		emptyStruct.notes_de     = emptyStruct.notes_de.replace(regClean2, '');
		emptyStruct.hidden_notes = emptyStruct.hidden_notes.replace(regClean2, '');
		emptyStruct.source       = emptyStruct.source.replace(regClean2, '');
		
		//Now we replace the paranthesis with stars, so we have a nice italic font in Discord, and mark the words in other cases
		var regMark = /{|}/g;
		emptyStruct.notes        = emptyStruct.notes.replace(regMark, '*');
		emptyStruct.notes_de     = emptyStruct.notes_de.replace(regMark, '*');
		emptyStruct.hidden_notes = emptyStruct.hidden_notes.replace(regMark, '*');
		emptyStruct.source       = emptyStruct.source.replace(regMark, '*');

		//Push it into the array
		KDBJSon.push(emptyStruct);

		//We have several separate arrays for quick access to predefined word types
		if (emptyStruct.type.startsWith('sen'))
			KDBPHJSon.push(emptyStruct);
		else if (emptyStruct.type.startsWith('v:pref'))
			KDBVPJSon.push(emptyStruct);
		else if (emptyStruct.type.startsWith('v:suff'))
			KDBVSJSon.push(emptyStruct);
		else if (emptyStruct.type.startsWith('n:suff'))
			KDBNSJSon.push(emptyStruct);
	}
	);

//Clear as much memory as possible
xmlFiles = null;
xml = null;
fs = null;
}
