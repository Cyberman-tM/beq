const beqTalkDef = JSON.stringify(
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



class beq_engine
{
	constructor()
	{}
	
beqEngine(beqTalk)
{
	var versInt = '123';
	var startDateTime = "456";
	var KDBVer = "sdlfkj";
	
	var tmpTxt = "";	
	switch (beqTalk.command)
	{
		case 'yIngu\'':
			tmpTxt  = 'beq \'oH pongwIj\'e\'.';
			tmpTxt += beqTalk.newline + 'Version: ' + versInt;
			tmpTxt += beqTalk.newline + 'I am a helper bot. Use "CMDLIST" for a list of commands.' + beqTalk.newline;
			tmpTxt += beqTalk.newline + 'I am active since ' + startDateTime + beqTalk.newline;
			tmpTxt += beqTalk.newline + 'I\'m using the database of De\'vIDs boQwI\', ' + KDBVer + beqTalk.newline;
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
}
}


//TESTIGN
var beqTalk = JSON.parse(beqTalkDef);

beqTalk.command = 'yIngu\'';
var BE = new beq_engine();
var resbeq = BE.beqEngine(beqTalk);
console.log(resbeq);

process.exit();

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

function createTranslation(lookWord, lookLang, lookTran, results, useFuzzy, useCase, startRes)
{
	var sndMessage = '';
	sndMessage += '\nYou asked for \'' + lookWord + '\' - I found ' + results.length + ' possible results';
	if (useFuzzy == true)
		sndMessage += ' using fuzzy searching';
	
	if (useCase == true)
		sndMessage += ' ignoring case';
	
	sndMessage += ':\n';
	if (startRes > 0)
		sndMessage += '(Starting from result #' + startRes + ')\n';
	var count = 0;
	var startCount = startRes;

	results.forEach(function (item)
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
	}
	)
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
