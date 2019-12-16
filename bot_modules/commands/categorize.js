
/*
  Categorize - sort words into different categories, addendum to boQwI' database
*/
var logger = require('winston');
var requestify = require('requestify'); 

module.exports = function(beq_engine, dataString)
{
    var tmpRet = "";
    var newCategory = args[1].toUpperCase();
    
    //First word will be the word we want to categorize, second word (after blank)
    //will be the categorie we want to add
    //third, if exists, is the number of the result we want
    var args = dataString.split(' ');
    
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
        tmpRet = "Multiple matches!" + "\n";
        
        if (args[2] != null)
        {
            realResult = results[args[2]];
            if (realResult == undefined)
                tmpRet += "Requested match #" + args[2] + "not found.";
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
                tmpRet += "Category already noted.";
        }
        
        if (foundCat == false)
        {
            tmpRet += "Category added. Please reorganize to see it.";
            var addCatLink = "http://www.tlhingan.at/Misc/beq/wordCat/beq_addCategory.php?wordKey=" + chkWord +  "&wordCat=" + newCategory;
            requestify.get(addCatLink);
        }
    }
    
    return tmpRet;
}
