
/*
  Show all words (klingon/english) in a specific category
*/
var logger = require('winston');

var boQwI_translate = require('./../../utils/boQwI_translate.js');

module.exports = function(beq_engine, lookWord)
{
    var tmpRet = "";
    
    lookWord = lookWord.toUpperCase();
    tmpRet = "Words in category " + lookWord + "\n";
    beq_engine.catDataCategs[lookWord].forEach(function(item)
    {
    //TODO: prepare output, add translation?
      var tmpCat = item.split(";;");
       tmpRet += tmpCat[0] + " " + boQwI_translate.getWType(tmpCat[1].substr(0,1), "en") + "\n";
       //+ beq_engine.KDBJSon[tmpCat[0]].en 
      //KDBJson ist ein Array von Objekten - kein String als Index
          var regexLook = '^' + tmpCat[0] + '$';
	var RE = new RegExp(regexLook, '');
	var results = beq_engine.KDBJSon.filter(function (item)
	{
		return item.match(RE);
	});
      
      logger.info(results[0]);
    });
    
    return tmpRet;    
}
