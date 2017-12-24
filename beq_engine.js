module.exports.Engine = function(beqTalk)
{
	
	//Startup function (constructor, basically)
	if (module.exports.versInt == undefined)
	{
		module.exports.versInt = '0.0.1	 - beq engine!';
		module.exports.startDateTime = new Date().toLocaleString();
		module.exports.KDBVer = "";
		
		var KDBJSon = new Array();
		var KDBPHJSon = new Array();
			
		//Load XML data
		readXML(KDBJSon, KDBPHJSon);
	}
	
	var tmpTxt = "";	
	switch (beqTalk.command)
	{
		case 'yIngu\'':
			tmpTxt  = 'beq \'oH pongwIj\'e\'.';
			tmpTxt += beqTalk.newline + 'Version: ' + module.exports.versInt;
			tmpTxt += beqTalk.newline + 'I am a helper bot. Use "CMDLIST" for a list of commands.' + beqTalk.newline;
			tmpTxt += beqTalk.newline + 'I am active since ' + module.exports.startDateTime + beqTalk.newline;
			tmpTxt += beqTalk.newline + 'I\'m using the database of De\'vIDs boQwI\', ' + module.exports.KDBVer + beqTalk.newline;
			tmpTxt += beqTalk.newline;
			tmpTxt += beqTalk.newline + '*naDev jItoy\'taHpa\', SuvwI\'\'a\' jIH\'e\'.\nLe\'rat, Tignar tuq, jIH.';
			tmpTxt += beqTalk.newline + beqTalk.newline + 'toH. yInvetlh \'oHta\'*' + beqTalk.newline;
			
			beqTalk.gotResult = true;
			beqTalk.message = tmpTxt;
		break;
		
		case 'tlhIngan':
		   tmpTxt = 'maH!'
		break;
		
		case 'le\'rat':
		case 'Le\'rat':
			tmpTxt += 'Qo\'! pongwIj \'oHbe\'! DaH, *beq* HIpong jay\'!' + beqTalk.newline;
		break;
		
		case 'KWOTD':
			//TODO: KWOTD - random word/sentence, type of word as parameter
			//Die Wortart in boQwI' ist "sen:rp" für Ersatz-Sprichwörter, "sen:sp" für Geheimnis-Sprichwörte
			
			//Default-Wordtypes?
			if (beqTalk.wordType1 == null || beqTalk.wordType1 == 'n')
				beqTalk.wordType1 = 'sen:rp';
			if (beqTalk.wordType2 == null || beqTalk.wordType2 == 'n')
				beqTalk.wordType2 = 'sen:sp';
			
			var tmpWord = "";

			//We look in KDBPHJSon - which only contains phrases/sentences
			for (i = 0; i < KDBPHJSon.length; i++)			
			{
				tmpWord = KDBPHJSon[Math.floor(Math.random() * (KDBPHJSon.length + 1))];
				if (tmpWord != null && (tmpWord.type == beqTalk.wordType1 || tmpWord.type == beqTalk.wordType2))
					break;
				tmpWord = null;
			}

			if (tmpWord != null)
			{
				beqTalk.result = new Array();
				beqTalk.result.push( {"word_tlh":tmpWord.tlh, "word_en":tmpWord.en,"word_de":tmpWord.de, "type": tmpWord.type});
			}
			break;
			
		case 'mugh':
			var results = null;

			//Case INSensitive search in klingon is useless (qaH is different from QaH)
			if (beqTalk.lookLang == 'tlh')
				beqTalk.wCase = false;
			
			while (results == null || results.length == 0)
			{				
				var regexLook = lookWord;
				var regexFlag = '';
				
				//Case sensitive?
				if (beqTalk.wCase == true)
					regexFlag += 'i';
				
				//Not fuzzy == exact match
				if (beqTalk.fuzzy == false)
					regexLook = '^' + regexLook + '$';
				
				//TODO: search with boundary? only single word?
				var RE = new RegExp(regexLook, regexFlag);
				results = KDBJSon.filter(function (item)
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
			if (results != null)
			{
				beqTalk.gotResult = true;
				beqTalk.result = new Array();
				results.forEach(function (item)
				{
					beqTalk.result.push( {"word_tlh":item.tlh, "word_en":item.en,"word_de":item.de, "type": item.type});
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
	"lookLang": "tlh",
	"transLang": "de",
	"command": "yIngu\'",
	"wordType1": "n",
	"wordType2": "sen:rp",
	"startRes": '0',
	"limitRes": '20',
	"newline": "\n",
	"result": [{ "type":"n",
	            "word_tlh":"tlhIngan",
				"word_en":"word",
				"word_de":"wort"
			  }],
    "message": "",
	"gotResult": false,
	"failure":false
});

function readXML(KDBJSon, KDBPHJSon)
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

		//Maybe it was a sentence? Separate array for that
		if (emptyStruct.type.startsWith('sen'))
			KDBPHJSon.push(emptyStruct);
}
);

//Clear as much memory as possible
xmlFiles = null;
xml = null;
fs = null;
}