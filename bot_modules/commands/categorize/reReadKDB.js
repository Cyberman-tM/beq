/*
   Re-Read KDB (boqwi DB) and check if there are words that haven't been categorized yet
   (boqwi uses a simple categorization system itself)
   
*/
var requestify = require('requestify'); 
var kTranscode = require('./../../utils/recode.js');
var logger = require('winston');

module.exports = function(beq_engine)
{
    //This will probably take some time...
    logger.info("reread");
    beq_engine.KDBJSon.forEach(function (item)
    {
	//In-memory, everything is normal, but we store uhmal
        var chkWord = item.tlh + ";;" + item.type;
        var newCategory = "";
        
        //Primitive, but it should do
        if (item.type.includes("anim"))
            newCategory += ";Animal_boqwi";
        if (item.type.includes("being"))
           newCategory += ";being_boqwi";
        if (item.type.includes("archaic"))
            newCategory += ";Archaic_boqwi";
        if (item.type.includes("deriv"))
            newCategory += ";derived_boqwi";
        if (item.type.includes("reg"))
            newCategory += ";regional_boqwi";
        if (item.type.includes("food"))
            newCategory += ";food_boqwi";
        if (item.type.includes("inv"))
            newCategory += ";invectives_boqwi";
        if (item.type.includes("slang_boqwi"))
            newCategory += ";slang_boqwi";
        if (item.type.includes("weap"))
            newCategory += ";weapon_boqwi";
       
       //Besserer Weg?
       if (newCategory.substr(0,1) == ';')
          newCategory = newCategory.substr(1,9999);
        
       newCategory = newCategory.toUpperCase();
        if (newCategory != "")
            //Word is not categorized yet
            if (beq_engine.catDataWords == null ||
                beq_engine.catDataWords[chkWord] == undefined || 
               !beq_engine.catDataWords[chkWord].includes(newCategory))
	    {
		//Store as uhmal
	        chkWord = kTranscode.RCtlh2u(item.tlh) + ";;" + item.type;		    
                requestify.get("http://www.tlhingan.at/Misc/beq/wordCat/beq_addCategory.php?wordKey=" + chkWord +  "&wordCat=" + newCategory);
	    }
    });
};

