/*
Split a text into syllables/words
For example:
tlhIngan vIjatlh vIneH
->tlhIngan vI- jatlh neH

 */
var winston = require('winston');
var logger = winston.createLogger(
	{
		level: 'info',
		format: winston.format.json(),
		transports: [
			new winston.transports.Console()
		]
	}
	);

//Local copy of transcoder
var kTranscodeX = require('./recode.js');

module.exports.versInt = '0.1';
module.exports.nameInt = 'Klingon text split';

module.exports.kSplit = function (raw_text)
{
	var tmpText = "";
	logger.info(raw_text);
	//Alle nicht-Worte durch Leerzeichen ersetzen (Punkt, Beistrich, etc...)
	var wordsOnly = raw_text.replace(/[^a-zA-Z0-9\\']/g, ' ');

logger.info(wordsOnly);

	//We have uhmal 3 for this stuff now
	//uhmal  replaces double-letters with single letters
	//uhmal2 replaces vowels with numbers
	//uhmal3 replaces consonant clusters with AEI
	var wordsUhmal3 = kTranscodeX.RCtlh2u3(wordsOnly);

	//Split into obvious separate words and remove duplicates
	var wordList = wordsUhmal3.split(' ');
	if (wordList.length > 0)
		wordList = arrayUnique(wordList);
	else
		wordList = [wordsUhmal3];

	var prefix = "";
	wordList.forEach(function (oneWord)
	{
		if (oneWord == "")
			return;

		prefix = "";
		if (oneWord.length >= 5)
		{
			if (parseInt(oneWord.substring(3, 4)) > 0 &&
				kTranscodeX.prefixListu3.indexOf(oneWord.substring(0, 2)) != -1)
			{
				prefix = oneWord.substring(0, 2);
				oneWord = oneWord.substring(2, 9999);
			}
		}

		logger.info(oneWord);

		//TODO: unmögliche Silben nicht spalten: tlhIng-an kann nicht sein
		//VK geht nicht - nur KV!
		//var syls = oneWord.split(/([a-zA-Z][1-5][a-zA-Z])/);
		var syls = oneWord.match(/(?:[a-zA-Z][1-5][a-zA-Z](?:[1-5][a-zA-Z])?(?<!4y))|4y/g);
		if (syls != null && syls.length > 0)
		{
			oneWord = "";
			syls.forEach(function (syllable)
			{
				logger.info(syllable);
				if (syllable == "")
					return;

				oneWord = oneWord + "-" + syllable + "-";
			}
			);
		}
		tmpText += prefix + "-" + oneWord;
	}
	);
	
	//Now we have to re-translate this all :-/
        tmpText = kTranscodeX.RCu32tlh(tmpText);
	return tmpText;
};

//Utility :-)
var arrayUnique = function (arr)
{
	return arr.filter(function (item, index)
	{
		return arr.indexOf(item) >= index;
	}
	);
};
