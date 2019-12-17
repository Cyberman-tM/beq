
/*
  Show all words (without translation) in a specific category
*/

module.exports = function(beq_engine, lookWord)
{
    var tmpRet = "";
    
    lookWord = lookWord.toUpperCase();
    tmpRet = "Words in category " + lookWord + "\n";
    beq_engine.catDataCategs[lookWord].forEach(function(item)
    {
    //TODO: prepare output
       tmpRet += item + "\n";
    });
    
    return tmpRet;    
}
