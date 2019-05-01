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
	
  wordsOnly = kTranscodeX.RCu22tlh(wordsOnly);
	
  //Split into obvious separate words and remove duplicates
  var wordList = wordsOnly.split(' ');  
  wordList = arrayUnique(wordList);
	
 return wordList.join();


}

var arrayUnique = function (arr) {
	return arr.filter(function(item, index){
		return arr.indexOf(item) >= index;
	});
};
