/*
  Split a text into syllables/words
  For example:
  tlhIngan vIjatlh vIneH
  ->tlhINgan vI- jatlh neH
  
*/
var logger = require('winston');
//Local copy of transcoder
var kTranscodeX  = require('./recode.js');

module.exports.versInt = '0.1';
module.exports.nameInt = 'Klingon text split';

module.exports.kSplit = function(raw_text, split_syls)
{
  var rawRecode = kTranscodeX.RCu22tlh(raw_text);
  
  //Alle nicht-Worte durch Leerzeichen ersetzen (Punkt, Beistrich, etc...)
  var onlyWordsRE = new RegExp(/[^a-zA-Z0-9]/, 'g');
  var wordsOnly = raw_text.replace(onlyWordsRE, ' ');

  //tlhIngan nach umahl2 umwandeln
  wordsOnly = kTranscodeX.RCtlh2u2(wordsOnly);
	
  //Split into obvious separate words and remove duplicates
  var wordList = wordsOnly.split(' ');  
  wordList = arrayUnique(wordList);
	
//Sort through the wordlist:
var undefList = [];
var verbList = [];
var prefList = [];
var checkSuff = false;
	
wordList.forEach(function(oneWord)
{
  //We have to check for the entire word in any case, unfortunately
  undefList.push(oneWord);
	
  //Always assume suffixes
  checkSuff = true;

  if (oneWord.length <= 3)
  {
      //Whatever it is, it cannot have affixes, so we don't know if it's noun or verb or whatever
      checkSuff = false;
  }
 //Longer than 3 characters, might have a prefix, which means 4th place must be a number
 else if (oneWord.substring(3,4) > 0)
  {
	  logger.info(oneWord.substring(0,1));
	  //Quite likely a prefix, therefore verb (or a nounified verb)
	  //We already will check the whole word, so lets see if we find a verb prefix:
	  switch (oneWord.substring(0,1))
	  {
		//Prefixes in Uhmal 2
		case 'b3':
		case 'b4':
		case 'c2':
		case 'c4':
		case 'd1':
		case 'd3':
		case 'd5':
		case 'f4':
		case 'g3':
		case 'i3':
		case 'i5':
		case 'j3':
		case 'j5':
		case 'k1':
		case 'k5':
		case 'l3':
		case 'l5':
		case 'o2':
		case 'o3':
		case 'q1':
		case 'r2':
		case 's1':
		case 's5':
		case 't3':
		case 't5':
		case 'w3':
		case 'x3':
		case 'y3':
		   prefList.push(oneWord.substring(0,1));
		   oneWord = oneWord.substring(1);
		  break;
	  }
  }
         //Check if the first letter CANNOT be a prefix:
  else if (oneWord.substring(0,1) == "u" || 
           oneWord.substring(0,1) == "Q")
  {
      //Might be a noun, might be a verb - we don't know
  }
 });
	
 return prefList.join();


}

var arrayUnique = function (arr) {
	return arr.filter(function(item, index){
		return arr.indexOf(item) >= index;
	});
};
