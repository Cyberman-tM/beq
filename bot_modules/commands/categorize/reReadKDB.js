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
            newCategory += ";Animal";
        if (item.type.includes("being"))
           newCategory += ";being";
        if (item.type.includes("archaic"))
            newCategory += ";Archaic";
        if (item.type.includes("deriv"))
            newCategory += ";derived";
        if (item.type.includes("reg"))
            newCategory += ";regional";
        if (item.type.includes("food"))
            newCategory += ";food";
        if (item.type.includes("inv"))
            newCategory += ";invectives";
        if (item.type.includes("slang"))
            newCategory += ";slang";
        if (item.type.includes("weap"))
            newCategory += ";weapon";
       
       //Besserer Weg?
       if (newCategory.substr(0,1) == ';')
          newCategory = newCategory.substr(1,9999);

        
        if (newCategory != "")        
            //Word is not categorized yet
            if (beq_engine.catDataWords[chkWord] == undefined)
                requestify.get("http://www.tlhingan.at/Misc/beq/wordCat/beq_addCategory.php?wordKey=" + chkWord +  "&wordCat=" + newCategory);
    });
};

