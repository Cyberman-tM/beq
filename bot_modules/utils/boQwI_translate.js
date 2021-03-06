/*

Translation functions for the various boQwI' types (like word types)

 */
var logger = require('winston');

//Check if the word is actually a derived definition
module.exports.isDerived = function (wType)
{
	if (wType.indexOf("deriv") != -1)
		return true;
	else
		return false;
};

//Check if entry is hyptothetical
module.exports.isHyp = function (wType)
{
	if (wType.indexOf("hyp") != -1)
		return true;
	else
		return false;
};

//Check if entry is regional
module.exports.isReg = function(wType)
{
	if (wType.indexOf("reg") != -1)
		return true;
	else
		return false;
};

//Check if entry is alternate spelling
module.exports.isAlt = function(wType) {
	if (wType.indexOf("alt") != -1)
		return true;
	else
		return false;
};

//Get (translate) word Type
module.exports.getWType = function (wType, tranLang)
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
		else if (wTypeS == 'reg')
			wTypeL = 'Regional';
		else if (wTypeS == 'excl')
			wTypeL = 'Ausruf';
		else if (wTypeS == 'adv')
			wTypeL = 'Adverb';
		else if (wTypeS == 'conj')
			wTypeL = 'Bindewort';
		else if (wTypeS == 'ques')
			wTypeL = 'Frage';
		else if (wTypeS == 'phr')
			wTypeL = "Generic Phrase";
		else if (wTypeS == 'toast')
			wTypeL = "Toast";
		else if (wTypeS == 'eu')
			wTypeL = "EU";
		else if (wTypeS == 'idiom')
			wTypeL = "Idiom";
		else if (wTypeS == 'mv')
			wTypeL = "mu'qaD veS";
		else if (wTypeS == 'nt')
			wTypeL = "nentay";
		else if (wTypeS == 'prov')
			wTypeL = "Proverb";
		else if (wTypeS == 'Ql')
			wTypeL = "QI'lop";
		else if (wTypeS == 'rej')
			wTypeL = "Rejection";
		else if (wTypeS == 'rp')
			wTypeL = "Replacement proverb";
		else if (wTypeS == 'sp')
			wTypeL = "Secret Proverb";
		else if (wTypeS == 'lyr')
			wTypeL = "Lyrics";
		else if (wTypeS == 'archaic')
			wTypeL = "Archaic";
		else
			wTypeL = 'unsupported yet!';
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
		else if (wTypeS == 'reg')
			wTypeL = 'Regional';
		else if (wTypeS == 'excl')
			wTypeL = 'Exclamation';
		else if (wTypeS == 'adv')
			wTypeL = 'Adverb';
		else if (wTypeS == 'conj')
			wTypeL = 'Conjunction';
		else if (wTypeS == 'ques')
			wTypeL = 'Question';
		else if (wTypeS == 'phr')
			wTypeL = "Generic Phrase";
		else if (wTypeS == 'toast')
			wTypeL = "Toast";
		else if (wTypeS == 'eu')
			wTypeL = "EU";
		else if (wTypeS == 'idiom')
			wTypeL = "Idium";
		else if (wTypeS == 'mv')
			wTypeL = "mu'qaD veS";
		else if (wTypeS == 'nt')
			wTypeL = "nentay";
		else if (wTypeS == 'prov')
			wTypeL = "Proverb";
		else if (wTypeS == 'Ql')
			wTypeL = "QI'lop";
		else if (wTypeS == 'rej')
			wTypeL = "Rejection";
		else if (wTypeS == 'rp')
			wTypeL = "Replacement proverb";
		else if (wTypeS == 'sp')
			wTypeL = "Secret Proverb";
		else if (wTypeS == 'lyr')
			wTypeL = "Lyrics";
		else if (wTypeS == 'archaic')
			wTypeL = "Archaic";
		else
			wTypeL = 'unsupported yet!';
	}
	
	//Get better description for sentences
	if (wTypeS == "sen")
	   wTypeL += ' (' + module.exports.getSType(wType, tranLang) + ')';
	
	return wTypeL;
};

//Get SENTENCE type - needed for KWOTD
module.exports.getSType = function (wType, tranLang)
{
	var wTypeW = wType.split(':')[0];
	var wTypeS = wType.split(':')[1];

	var tmpRet = "";

	if (wTypeW != "sen")
		return "Wrong type!";

	//TODO: phr,archaic => zweimal spalten? phr extra auflösen?
	
	if (tranLang == 'en')
	{
		if (wTypeS == 'rp')
			tmpRet = 'Replacement proverb';
		else if (wTypeS == 'sp')
			tmpRet = 'Secret proverb';
		else if (wTypeS == 'phr')
			tmpRet = 'Phrase';
		else if (wTypeS == 'eu')
			tmpRet = 'Empire Union Day expression';
		else if (wTypeS == 'alt')
			tmpRet = 'Alternate spelling! Treat carefully!';
		else if (wTypeS == 'rej')
			tmpRet = 'Rejection';
		else if (wTypeS == 'phr')
			tmpRet = "Generic Phrase";
		else if (wTypeS == 'toast')
			tmpRet = "Toast";
		else if (wTypeS == 'eu')
			tmpRet = "EU";
		else if (wTypeS == 'idiom')
			tmpRet = "Idium";
		else if (wTypeS == 'mv')
			tmpRet = "mu'qaD veS";
		else if (wTypeS == 'nt')
			tmpRet = "nentay";
		else if (wTypeS == 'prov')
			tmpRet = "Proverb";
		else if (wTypeS == 'Ql')
			tmpRet = "QI'lop";
		else if (wTypeS == 'rej')
			tmpRet = "Rejection";
		else if (wTypeS == 'rp')
			tmpRet = "Replacement proverb";
		else if (wTypeS == 'sp')
			tmpRet = "Secret Proverb";
		else if (wTypeS == 'lyr')
			tmpRet = "Lyrics";
		else if (wTypeS == "archaic")
			tmpRet = "Archaic";
		else if (wTypeS == "bc")
			tmpRet = "Beginner\'s conversation";
		else
			tmpRet = wTypeS;
	}
	else if (tranLang == 'de')
	{
		if (wTypeS == 'rp')
			tmpRet = 'Ersatzsprichwort';
		else if (wTypeS == 'sp')
			tmpRet = 'Geheimnissprichwort';
		else if (wTypeS == 'phr')
			tmpRet = 'Phrase';
		else if (wTypeS == 'eu')
			tmpRet = 'Empire Union Day Ausdruck';
		else if (wTypeS == 'alt')
			tmpRet = 'Alternative Schreibweise! Vorsicht!';
		else if (wTypeS == 'rej')
			tmpRet = 'Zurückweisung';
		else if (wTypeS == 'phr')
			tmpRet = "Generic Phrase";
		else if (wTypeS == 'toast')
			tmpRet = "Toast";
		else if (wTypeS == 'eu')
			tmpRet = "EU";
		else if (wTypeS == 'idiom')
			tmpRet = "Idium";
		else if (wTypeS == 'mv')
			tmpRet = "mu'qaD veS";
		else if (wTypeS == 'nt')
			tmpRet = "nentay";
		else if (wTypeS == 'prov')
			tmpRet = "Proverb";
		else if (wTypeS == 'Ql')
			tmpRet = "QI'lop";
		else if (wTypeS == 'rej')
			tmpRet = "Rejection";
		else if (wTypeS == 'rp')
			tmpRet = "Replacement proverb";
		else if (wTypeS == 'sp')
			tmpRet = "Secret Proverb";
		else if (wTypeS == 'lyr')
			tmpRet = "Lyrics";
		else if (wTypeS == "archaic")
			tmpRet = "Archaic";
		else if (wTypeS == "bc")
			tmpRet = "Beginner\'s conversation";
		else
			tmpRet = wTypeS;
	}

	return tmpRet;
};
