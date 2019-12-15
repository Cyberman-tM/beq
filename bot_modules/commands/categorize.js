
/*
  Categorize - sort words into different categories, addendum to boQwI' database
*/
var logger = require('winston');

module.exports = function(beq_engine, dataString)
{
    //First word will be the word we want to categorize, second word (after blank)
    //will be the categorie we want to add
    var args = dataString.split(' ');
    
    logger.info(beq_engine.KDBJSon);
    logger.info(beq_engine.exports.KDBJSon);
    
    return dataString;
}
