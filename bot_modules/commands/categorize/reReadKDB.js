/*
   Re-Read KDB (boQwI' DB) and check if there are words that haven't been categorized yet
   (boQwI' uses a simple categorization system itself)
   
*/
var requestify = require('requestify'); 

module.exports = function(beq_engine)
{
    //This will probably take some time...
    
    beq_engine.KDBJSon.forEach(function (item)
    {
        var chkWord = item.tlh + ";;" + item.type;
        var newCategory = "";
        
        //Primitive, but it should do
        if (item.type.includes("anim"))
            newCategory = "Animal";
        else if (item.type.includes("archaic"))
            newCategory = "Archaic";
        else if (item.type.includes("deriv"))
            newCategory = "derived";
        else if (item.type.includes("reg"))
            newCategory = "regional";
        else if (item.type.includes("food"))
            newCategory = "food";
        else if (item.type.includes("inv"))
            newCategory = "invectives";
        else if (item.type.includes("slang"))
            newCategory = "slang";
        else if (item.type.includes("weap"))
            newCategory = "weapon";
        else
            newCategory = "";
        
        if (newCategory != "")        
            //Word is not categorized yet
            if (beq_engine.catDataWords[wordName] == undefined)
                requestify.get("http://www.tlhingan.at/Misc/beq/wordCat/beq_addCategory.php?wordKey=" + chkWord +  "&wordCat=" + newCategory);
    });
};

