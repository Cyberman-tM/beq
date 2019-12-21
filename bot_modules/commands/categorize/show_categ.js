
/*
  Show all words (klingon/english) in a specific category
*/

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
       tmpRet += tmpCat[0] + " " + beq_engine.KDBJSon[tmpCat[0]].en + boQwI_translate.getWType(tmpCat[1].substr(0,1), "en") + "\n";
    });
    
    return tmpRet;    
}
