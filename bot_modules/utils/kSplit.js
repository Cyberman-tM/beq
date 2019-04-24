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
  
  var wordsOnly = sourcestring.replace(onlyWordsRE, ' ');
  var wordList = wordsOnly.split(' ');
  


}
