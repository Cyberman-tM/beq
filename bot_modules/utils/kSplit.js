/*
  Split a text into syllables/words
  For example:
  tlhIngan vIjatlh vIneH
  ->tlhINgan vI- jatlh neH
  
*/
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
	
wordList.forEach(function(oneWord)
{
  if (oneWord.length <= 3)
  {
      //Whatever it is, it cannot have affixes, so we don't know if it's noun or verb or whatever
      undefList.push(oneWord);	  
  }
        //Check if the first letter CANNOT be a prefix:
  elseif (oneWord.substring(0,1) == "u" || 
          oneWord.substring(0,1) == "Q")
  {
      //Might be a noun, might be a verb - we don't know
  }
  else
  {
      //Longer than 3 characters, might have a prefix
      if (oneWord.substring(3,1) > 0)
      {
	  //Quite likely a prefix, therefore verb
	  verbList.push(oneWord);
      }
  }
 });
	
 return verbList.join();


}

var arrayUnique = function (arr) {
	return arr.filter(function(item, index){
		return arr.indexOf(item) >= index;
	});
};
