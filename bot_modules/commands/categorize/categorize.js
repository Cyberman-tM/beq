/*
  Categorize - sort words into different categories, addendum to boQwI' database
*/
var logger = require('winston');
var requestify = require('requestify'); 
var beqPerson = require('./../../personality/beq_person.js');
var kTranscode = require('./../utils/recode.js');

module.exports = function(beq_engine, dataString)
{
    var tmpRet = "";
    
    //First word will be the word we want to categorize, second word (after blank)
    //will be the categorie we want to add
    //third, if exists, is the number of the result we want
    var args = dataString.split(' ');

    //Maybe the user left a blank between the magic character and the klingon word
    if (args[0] == "")
	    args.shift();
	
    var newCategory = args[1].toUpperCase();   
    
    //We have main categories and subcategories
    //don't allow a subcategory to be created without explicitely
    //creating the main category
    if (newCategory.includes('_'))
    {
        var mainCat = newCategory.split('_')[0];
        if (beq_engine.catDataCategs[mainCat] == undefined)
        {
            tmpRet = "Category " + newCategory + " looks like a subcategory of " + mainCat +
                     ", but the main category is not yet defined!\n Please define that first.\n";
            return tmpRet;
        }
    }   

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
                    tmpRet += "Requested match #" + args[2] + "not found for word " + args[0] + "\n";
                else
                    tmpRet += "Requested match #" + args[2] + "found and used." + "\n";
        }
        else
           tmpRet += "Please specify number of result to use";
    }
    else if (results.length == 0)
        tmpRet = "\n Word" + args[0] + "could not be found!\n";
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
	   //Apostrophe in Attributen sind in XML nicht erlaubt!
	   //Wandeln wir das klingonische Wort in UHMAL um
	   chkWord = kTranscode.RCtlh2u(chkWord);
		
            var addCatLink = "http://www.tlhingan.at/Misc/beq/wordCat/beq_addCategory.php?wordKey=" + chkWord +  "&wordCat=" + newCategory;
            requestify.get(addCatLink);
		
            tmpRet += "Category " + newCategory + " added to word " + realResult.tlh + ".\n";
        }
    }
	
  //Add in some personality
  tmpRet += beqPerson.getLine(7, true, true, "\n");
    
    return tmpRet;
}
