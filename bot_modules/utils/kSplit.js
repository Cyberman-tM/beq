/*
Split a text into syllables/words
For example:
tlhIngan vIjatlh vIneH
->tlhINgan vI- jatlh neH

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
	//Alle nicht-Worte durch Leerzeichen ersetzen (Punkt, Beistrich, etc...)
	var wordsOnly = raw_text.replace(/[^a-zA-Z0-9']/g, ' ');

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
			continue;

		if (oneWord.length >= 5)
		{
			if (parseInt(oneWord.substring(3, 4)) > 0 &&
				kTranscodeX.prefixListu3.indexOf(oneWord.substring(0, 2)) != -1)
			{
				prefix = oneWord.substring(0, 2);
				oneWord = oneWord.substring(2, 9999);
			}
			prefix = prefix.replace('g', '6');
		}

		var syls = oneWord.split(/([a-z][1-5][a-z])/);
		if (syls.length > 0)
		{
			oneWord = "";
			syls.forEach(function (syllable)
			{
				if (syllable == "")
					continue;

				oneWord = oneWord + "-" + syllable + "-";
			}
			);
		}
		tmpText += prefix + "-" + oneWord;
	}
	);

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
