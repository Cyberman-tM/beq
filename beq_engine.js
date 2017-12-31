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
	"lookLang": "",               // the language the word you want translated is in
	"lookWord": "",               // the word you are looking for
	"transLang": "",              // the language you want as result
	"command": "",                // the actual command, like "mugh"
	"special": "",                // special commands, untested, unlisted, etc...
	"showNotes": ""               // Show notes, if available? => true/false
	"wordType1": null,            // some commands or functions allow to limit the word type, for example KWOTD does that
	"wordType2": null,            // use the word types as defined by boQwI', i.e. "sen:sp" for "sentence, secret proverb"
	"startRes": '0',              // used in createTranslation, if you know there are more than "limitRes" results, you can specify a starting number
	"limitRes": '20',             // in some cases (Discord) you may not want to get ALL the results, but only up to "limitRes"
	"newline": "\n",              // When formatted text is returned, this will be used as newline - i.e. Text output or HTML output
	"result": [{ "type":"",       // the translation results are returned in this JSON array. Type is the word type, see boQwI'
	            "tlh":"",         // the klingon word
				"en":"",          // the english word
				"de":""           // the german word
				"slang":""        // Flag, is this is slang word? => true/false
				"notes":""        // Notes to the word (slang, where from, etc..)
				"notes_de":""     // Notes in german - if available!
				"hidden_notes":"" // "Hidden" notes that are shown in small font in boQwI'
			  }],                 //
    "message": "",                // some functions or commands may return a message, it will be in here
	"gotResult": false,           // indicates if the search was successful => true/false
	"failure":false               // indicates if there was a problem (i.e. command not found) => true/false

*/

module.exports.Engine = function(beqTalk)
{
	//Startup function (constructor, basically)
	if (module.exports.versInt == undefined)
	{
		var fs = require('fs');
		module.exports.versInt = '1.0.1	- The beq Engine lives!';
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
	switch (beqTalk.command)
	{
		case 'yIngu\'':
		   tmpTxt  = 'Beq engine, version ' + module.exports.versInt + beqTalk.newline;
		   tmpTxt += 'Running since ' + module.exports.startDateTime + beqTalk.newline;
		   tmpTxt += beqTalk.newline + 'Klingon Database from De\'vIDs boQwI\', ' + module.exports.KDBVer + beqTalk.newline;
		   tmpTxt += module.exports.KDBJSon.length + ' words in database.' + beqTalk.newline;
		   
		   beqTalk.message = tmpTxt;
		break;
		
		case 'KWOTD':
			//TODO: KWOTD - random word/sentence, type of word as parameter
			//Die Wortart in boQwI' ist "sen:rp" für Ersatz-Sprichwörter, "sen:sp" für Geheimnis-Sprichwörte
			beqTalk.result = new Array();
			
			//Default-Wordtypes?
			if (beqTalk.wordType1 == null || beqTalk.wordType1 == 'n')
				beqTalk.wordType1 = 'sen:rp';
			if (beqTalk.wordType2 == null || beqTalk.wordType2 == 'n')
				beqTalk.wordType2 = 'sen:sp';
			
			var tmpWord = "";

			//We look in KDBPHJSon - which only contains phrases/sentences
			for (i = 0; i < module.exports.KDBPHJSon.length; i++)			
			{
				tmpWord = module.exports.KDBPHJSon[Math.floor(Math.random() * (module.exports.KDBPHJSon.length + 1))];
				if (tmpWord != null && (tmpWord.type == beqTalk.wordType1 || tmpWord.type == beqTalk.wordType2))
					break;
				tmpWord = null;
			}

			if (tmpWord != null)
			{
				//Specially mark slang words
				isSlang = false;
				if (tmpWord.type.indexOf("slang") >= 0)
					isSlang = true;
				
				beqTalk.result.push( {"tlh":tmpWord.tlh, "en":tmpWord.en,"de":tmpWord.de, "type": tmpWord.type, "slang": isSlang, "notes":tmpWord.notes, "notes_de":tmpWord.notes_de, "hidden_notes":tmpWord.hidden_notes});
				beqTalk.gotResult = true;
			}

			break;
			
		case "yIcha'":
			switch(beqTalk.wordType1)
			{
				case 'v:pref':
					beqTalk.result = module.exports.KDBVPJSon;
					beqTalk.gotResult = true;
				break;
			}
		break;
		
		case "recode":
		  var tmpText = '';
		  var encoding = '';
		  
		  //lookLang and transLang are NOT language IDs here, but they mark the original "encoding" of the text in lookWord (also not just a word)
		  if (beqTalk.lookLang == 'tlhIngan' && ( beqTalk.transLang == 'xifan' || beqTalk.transLang == 'XIFAN'))
		  {
			  //Is there a better way?
			  tmpText = beqTalk.lookWord.replace(/tlh/g, 'x');
			  tmpText = tmpText.replace(/ch/g, 'c');
			  tmpText = tmpText.replace(/q/g, 'k');
			  tmpText = tmpText.replace(/ng/g, 'f');
			  tmpText = tmpText.replace(/gh/g, 'g');
			  
			  if (beqTalk.transLang == 'XIFAN')
			  {
				  encoding = 'tlhIngan > XIFAN';
				  tmpText = tmpText.toUpperCase();
			  }
			  else
			  {
				  encoding = 'tlhIngan > xifan';
				  tmpText = tmpText.toLowerCase();
			  }
		  }
		  else if ((beqTalk.lookLang == 'xifan' || beqTalk.lookLang == 'XIFAN') && ( beqTalk.transLang == 'tlhIngan'))
		  {
			  tmpText = beqTalk.lookWord.toLowerCase();
			  //Is there a better way?
			  tmpText = tmpText.replace(/x/g, 'tlh');
			  tmpText = tmpText.replace(/c/g, 'ch');
			  tmpText = tmpText.replace(/k/g, 'q');
			  tmpText = tmpText.replace(/g/g, 'gh');
			  tmpText = tmpText.replace(/f/g, 'ng');
			  
			  //Restore upper case letters
			  tmpText = tmpText.replace(/d/g, 'D');
			  tmpText = tmpText.replace(/i/g, 'I');
			  tmpText = tmpText.replace(/h/g, 'H');
			  tmpText = tmpText.replace(/q/g, 'Q');			  
			  tmpText = tmpText.replace(/s/g, 'S');
		  }
		  //This might change later on, I'm unsure if the createTranslation method should be able to use this or not...
		  beqTalk.result = new Array();
		  beqTalk.result.push( {"tlh":beqTalk.lookWord, "en":tmpText,"de":'', "type": 'RECODE', "slang": false, "notes":'', "notes_de":'', "hidden_notes":''});
		  beqTalk.lookWord = new String('recoding');
		  beqTalk.gotResult = true;

		
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

					beqTalk.result.push( {"tlh":item.tlh, "en":item.en,"de":item.de, "type": item.type, "slang": isSlang, "notes":item.notes, "notes_de":item.notes_de, "hidden_notes":item.hidden_notes});
				});
			}
			else
				beqTalk.gotResult = false;
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
				"notes":"",
				"notes_de":"",
				"hidden_notes":""
			  }],
    "message": "",
	"gotResult": false,
	"failure":false
});

module.exports.createTranslation = function(beqTalk)
{
	if (beqTalk.gotResult == false)
		return "Nothing found.";
	
	var sndMessage = '';
	//Maybe we can use this for multi-language?
	var intText =
	{
		"resStart": 'You asked for "&1 ", I found &2 possible results',
		"resFuzz": " using fuzzy searching",
		"resCase": ", ignoring case",
		"remPref": ", removing possible prefixes",
		"resSTR": "(Starting from result #&1)",
		"resTMR": "...too many results. Stopping list."
	};
	
	if (beqTalk.command == "mugh")
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

	var slangWord = '';
	beqTalk.result.forEach(function (item)
	{
		startCount--;
		
		if (startCount <= 0 && count < beqTalk.limitRes)
		{
			count++;
			if (beqTalk.command == "mugh")
				sndMessage += (+beqTalk.startRes + +count).toString() + ') ' + getWType(item.type, listLang) + ': ';
			else if (beqTalk.command == "KWOTD")
				sndMessage += getSType(item.type, listLang) + ':' + beqTalk.newline;
			
			slangWord = '';
			if (item.slang == true)
				slangWord = ' *(slang!)*';

			sndMessage += item[beqTalk.lookLang] + slangWord + beqTalk.newline;
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
		}
	}
	)
	if (count >= beqTalk.limitRes)
		sndMessage += intText.resTMR + beqTalk.newline;
	
	if (beqTalk.result.length > beqTalk.limitRes)
	{
		sndMessage += beqTalk.newline;
		sndMessage += "*toy'meH jIHtaH.*";
	}

	return sndMessage;
}

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
	var fs = require('fs');
	var xmldoc = require('xmldoc');
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
		type: 'n',
		notes: 'notes',
		notes_de: 'notes_de',
		hidden_notes: 'hidden_notes'
	};

	document.children[1].childrenNamed("table").forEach(function (headItem)
	{
		emptyStruct = new Array(
			{
				tlh: '',
				en: '',
				de: '',
				type: '',
				notes: '',
				notes_de: '',
				hidden_notes: ''
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
				case 'notes':
					emptyStruct.notes = item.firstChild.text;
					break;
				case 'notes_de':
					emptyStruct.notes_de = item.firstChild.text;
					break;
				case 'hidden_notes':
					emptyStruct.hidden_notes = item.firstChild.text;
					break;
				}
			}
		}
		);		
		//Make sure everything's here (sometimes the german is missing)
		if (emptyStruct.de == '' || emptyStruct.de == undefined)
			emptyStruct.de = emptyStruct.en;

		//Just to be sure...
		if (emptyStruct.en == undefined)
			emptyStruct.en = '';
		if (emptyStruct.tlh == undefined)
			emptyStruct.tlh = '';
		if (emptyStruct.notes == undefined)
			emptyStruct.notes = '';
		if (emptyStruct.notes_de == undefined)
			emptyStruct.notes_de = '';
		if (emptyStruct.hidden_notes == undefined)
			emptyStruct.hidden_notes = '';
		
		//Cleanup - boQwI' contains links to other, related words - we don't use them, so I throw them away
		var regClean = /(\:[a-zA-Z0-9]*)/g;
		emptyStruct.notes        = emptyStruct.notes.replace(regClean, '');
		emptyStruct.notes_de     = emptyStruct.notes_de.replace(regClean, '');
		emptyStruct.hidden_notes = emptyStruct.hidden_notes.replace(regClean, '');
		
		//Now we replace the paranthesis with stars, so we have a nice italic font in Discord, and mark the words in other cases
		var regMark = /{|}/g;
		emptyStruct.notes        = emptyStruct.notes.replace(regMark, '*');
		emptyStruct.notes_de     = emptyStruct.notes_de.replace(regMark, '*');
		emptyStruct.hidden_notes = emptyStruct.hidden_notes.replace(regMark, '*');

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