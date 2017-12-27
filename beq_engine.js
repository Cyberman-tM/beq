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
	"lookLang": "",               // the language the word you want translated is in
	"lookWord": "",               // the word you are looking for
	"transLang": "",              // the language you want as result
	"command": "",                // the actual command, like "mugh"
	"wordType1": null,            // some commands or functions allow to limit the word type, for example KWOTD does that
	"wordType2": null,            // use the word types as defined by boQwI', i.e. "sen:sp" for "sentence, secret proverb"
	"startRes": '0',              // used in createTranslation, if you know there are more than "limitRes" results, you can specify a starting number
	"limitRes": '20',             // in some cases (Discord) you may not want to get ALL the results, but only up to "limitRes"
	"newline": "\n",              // When formatted text is returned, this will be used as newline - i.e. Text output or HTML output
	"result": [{ "type":"",       // the translation results are returned in this JSON array. Type is the word type, see boQwI'
	            "tlh":"",         // the klingon word
				"en":"",          // the english word
				"de":""           // the german word
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
		module.exports.versInt = '0.0.3	- complete rework, separate project!';
		module.exports.startDateTime = new Date().toLocaleString();
		module.exports.KDBVer = fs.readFileSync('./KDB/VERSION', 'utf8');
		
		module.exports.KDBJSon = new Array();           //Generic database of all words
		module.exports.KDBPHJSon = new Array();         //All phrases
		module.exports.KDBVPJSon = new Array();         //All verb prefixes
		module.exports.KDBVSSon = new Array();          //All verb suffixes
		module.exports.KDBNSJSon = new Array();         //All noun suffixes
			
		//Load XML data
		readXML(module.exports.KDBJSon, module.exports.KDBPHJSon, module.exports.KDBPHVPJSon, module.exports.KDBPHVSJSon, module.exports.KDBPHNSJSon);
	}
	
	var tmpTxt = "";	
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
				beqTalk.result.push( {"tlh":tmpWord.tlh, "en":tmpWord.en,"de":tmpWord.de, "type": tmpWord.type});
				beqTalk.gotResult = true;
			}

			break;
			
		case "yIcha'":
			switch(args[1])
			{
				case 'prefix':
				case 'moHaq':
				case 'type=v:pref':
					beqTalk.result = module.exports.KDBVPJSon;				   
				break;
			}
		break;
		case 'mugh':
			var results = null;
			beqTalk.result = new Array();

			//Case INSensitive search in klingon is useless (qaH is different from QaH)
			if (beqTalk.lookLang == 'tlh')
				beqTalk.wCase = false;
			
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
					
					//Apparently we tried case and fuzzy - nothing to find here :-(
					break;
				}
			}
			
			if (results != null && results.length > 0)
			{
				beqTalk.gotResult = true;
				results.forEach(function (item)
				{
					beqTalk.result.push( {"tlh":item.tlh, "en":item.en,"de":item.de, "type": item.type});
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
	"lookLang": "",
	"lookWord": "",
	"transLang": "",
	"command": "",
	"wordType1": null,
	"wordType2": null,
	"startRes": '0',
	"limitRes": '20',
	"newline": "\n",
	"result": [{ "type":"",
	            "tlh":"",
				"en":"",
				"de":""
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

			sndMessage += item[beqTalk.lookLang] + beqTalk.newline;
			sndMessage += '==> ' + item[beqTalk.transLang] + beqTalk.newline;
			
			//Special case (stupid case, but nonetheless)
			if ( (beqTalk.lookLang == 'en' && beqTalk.transLang == 'de') ||
				 (beqTalk.lookLang == 'de' && beqTalk.transLang == 'en'))
				 sndMessage += '==> ' + item.tlh + beqTalk.newline;
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

//Get SENTENCE type - needed for KWOTD
function getSType(wType, tranLang)
{
	var wTypeW = wType.split(':')[0];
	var wTypeS = wType.split(':')[1];
	
	var tmpRet = "";
	
	if (wTypeW != "sen")
		return "Wrong type!";
	
	if (tranLang == 'de')
	{
		if (wTypeS == 'rp')
			tmpRet = 'Replacement proverb';
		else if (wTypeS == 'sp')
			tmpRet = 'Secret proverb';
		else
			wTypeL = 'unsupported yet';
	}
	else if (tranLang == 'en')
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


function readXML(KDBJSon, KDBPHJSon, KDBVPJSon, KDBVSSon, KDBNSJSon)
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
		notes: 'notes'
	};

	document.children[1].childrenNamed("table").forEach(function (headItem)
	{
		emptyStruct = new Array(
			{
				tlh: '',
				en: '',
				de: '',
				type: '',
				notes: ''
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