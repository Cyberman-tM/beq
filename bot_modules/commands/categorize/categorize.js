/*
  Categorize - sort words into different categories, addendum to boQwI' database
*/
var logger = require('winston');
var requestify = require('requestify'); 
var beqPerson = require('./../../personality/beq_person.js');

module.exports = function(beq_engine, dataString)
{
    //First word will be the word we want to categorize, second word (after blank)
    //will be the categorie we want to add
    //third, if exists, is the number of the result we want
    var args = dataString.split(' ');
	
    var tmpRet = "";
    var newCategory = args[1].toUpperCase();   
   
	//TODO: search with boundary? only single word?
    var regexLook = '^' + args[0] + '$';
	var RE = new RegExp(regexLook, '');
	var results = beq_engine.KDBJSon.filter(function (item)
	{
        //Always look in klingon!
		return item["tlh"].match(RE);
	});

    var realResult = null;
    //results hat jetzt möglicherweise mehrere Einträge
    if (results.length > 1)
    {
        //TODO: newline - where from? beqtalk?
        tmpRet = "Multiple matches for " + args[0] + "!\n";
        
        if (args[2] != null)
        {
            //Javascript ist 0-basierend, boQwI' nicht
            var resNum = parseInt(args[2]) - 1;
                realResult = results[resNum];
                if (realResult == undefined)
                    tmpRet += "Requested match #" + resNum + "not found for word " + args[0];
                else
                    tmpRet += "Requested match #" + resNum + "found and used.";
        }
        else
           tmpRet += "Please specify number of result to use";
    }
    else if (results.length == 0)
        tmpRet = "\n Not found!";
    else
       realResult = results[0];
   
    if (realResult != null)
    {
        var chkWord = realResult.tlh + ";;" + realResult.type;
        var foundCat = false;
        if (beq_engine.catDataWords[chkWord] != undefined)
        {
            var wordCategs = beq_engine.catDataWords[chkWord].split(';');
            wordCategs.forEach(function(catItem)
            {
                if (catItem == newCategory)
                    foundCat = true;
            });
            if (foundCat == true)
                tmpRet += "Category " + newCategory + " already noted for " + realResult.tlh + ".";
        }
        
        if (foundCat == false)
        {
            tmpRet += "Category " + newCategory + " added to word " + realResult.tlh + ".";
            var addCatLink = "http://www.tlhingan.at/Misc/beq/wordCat/beq_addCategory.php?wordKey=" + chkWord +  "&wordCat=" + newCategory;
            requestify.get(addCatLink);
        }
    }
	
  //Add in some personality
  tmpRet += beqPerson.getLine(7, true, true, "\n");
    
    return tmpRet;
}
