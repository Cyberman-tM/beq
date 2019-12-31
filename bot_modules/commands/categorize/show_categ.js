/*
   Show all words (klingon/english) in a specific category

   Categorie can sub "subcategories", separated by _
   for example:
      COMPUTER
      COMPUTER_COMMUNICATION
      COMPUTER_GRAPHICS
 */
var logger = require('winston');

var boQwI_translate = require('./../../utils/boQwI_translate.js');

module.exports = function(beq_engine, lookWord)
{
    var tmpRet = "";
    lookWord = lookWord.toUpperCase();
    
    //Any specific category should include implicit subcategories
    var foundCats = beq_engine.catDataCategs.filter(function(item)
    {
      if (item.startsWith(lookWord))
         return true;
      else
         return false;
    });
    
    //Collect all words of all subcategories
    foundCats.forEach(function(item)
    {
       tmpRet += getSingleCategory(beq_engine, item); 
    });
    
}

function getSingleCategory (beq_engine, lookWord)
{
	var tmpRet = "";

	if (beq_engine.catDataCategs[lookWord] == undefined)
		tmpRet = "Category " + lookWord + " not yet defined!\n";
	else
	{

		tmpRet = "Words in category " + lookWord + "\n";
		beq_engine.catDataCategs[lookWord].forEach(function (item)
		{
			var tmpCat = item.split(";;");
			//KDBJson ist ein Array von Objekten - kein String als Index
			var regexLook = '^' + tmpCat[0] + '$';
			var RE = new RegExp(regexLook, '');
			var results = beq_engine.KDBJSon.filter(function (item)
				{
					return item["tlh"].match(RE);
				}
				);
			var tmpTrans = "";
			results.forEach(function (item)
			{
				if (item.type == tmpCat[1])
					tmpTrans = item.en;
			}
			);

			tmpRet += tmpCat[0] + ": " + tmpTrans + " -> " + boQwI_translate.getWType(tmpCat[1].substr(0, 1), "en") + "\n";
		}
		);
	}
	return tmpRet;
}
