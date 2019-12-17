
/*
  Show all words (without translation) in a specific category
*/

var boQwI_translate = require('./../../utils/boQwI_translate.js');

module.exports = function(beq_engine, lookWord)
{
    var tmpRet = "";
    
    lookWord = lookWord.toUpperCase();
    tmpRet = "Words in category " + lookWord + "\n";
    beq_engine.catDataCategs[lookWord].forEach(function(item)
    {
    //TODO: prepare output
      var tmpCat = item.split(";;");
       tmpRet += tmpCat[0] + boQwI_translate.getWType(tmpCat[1].substr(0,1), "en") + "\n";
    });
    
    return tmpRet;    
}
