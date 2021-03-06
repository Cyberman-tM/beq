/*
Show all words (klingon/english) in a specific category

Categorie can sub "subcategories", separated by _
for example:
COMPUTER
COMPUTER_COMMUNICATION
COMPUTER_GRAPHICS 
 */
var winston = require('winston');
var logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});
var beqPerson = require('./../../personality/beq_person.js');
var boQwI_translate = require('./../../utils/boQwI_translate.js');

module.exports = function (beq_engine, lookWord)
{
	var tmpRet = "";
	lookWord = lookWord.toUpperCase();
	
	if (lookWord == 'SOURCE')
	{
		tmpRet = "Sorry, this category is HUGE, it cannot be displayed. Chose a subcategory!";
		return tmpRet;
	}

	//Any specific category should include implicit subcategories
	var allCat = Object.keys(beq_engine.catDataCategs);

	//Es wäre besser das woanders zu machen, nicht immer jedesmal aufs neue...
	allCat.sort(function (firstEl, secEl)
	{
		var tmpRet = 1;
        
		if (firstEl < secEl)
			tmpRet = -1;
        
            if (firstEl.includes("_"))
                if (firstEl.startsWith(secEl))
                   tmpRet = 1;
            else if (secEl.includes("_"))
                if (secEl.startsWith(firstEl))
                    tmpRet = -1;

		return tmpRet;
	}
	);

	allCat.forEach(function (item)
	{
		if (item == lookWord || item.startsWith(lookWord + "_"))
		{
			tmpRet += getSingleCategory(beq_engine, item) + "\n";
		}
	}
	);

	if (tmpRet == "")
		tmpRet = "Category not found.";

	tmpRet += "\n" + beqPerson.getLine(7, true, true, "\n");

	return tmpRet;
}

function getSingleCategory(beq_engine, lookWord)
{
	var tmpRet = "";
	var tmpCatDesc = "";

	if (beq_engine.catDataCategs[lookWord] == undefined)
		tmpRet = "Category " + lookWord + " not yet defined!\n";
	else
	{
		tmpCatDesc = beq_engine.catDesc[lookWord];

		tmpRet = "Category " + lookWord + "\n";
		if (tmpCatDesc != undefined)
			tmpRet += "*" + tmpCatDesc.trim() + "*\n\n";

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

			tmpRet += tmpCat[0] + ": " + tmpTrans + " -> " + boQwI_translate.getWType(tmpCat[1], "en") + "\n";
		}
		);
	}
	return tmpRet;
}
