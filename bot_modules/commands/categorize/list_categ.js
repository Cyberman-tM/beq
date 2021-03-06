
/*
  List available categories, without words
  Sorted alphabetically
*/

module.exports = function(beq_engine)
{
    var tmpRet = "";
    
    var allCats = Object.keys(beq_engine.catDataCategs).sort();
    var lastChar = '';
    
    tmpRet = "Currently available categories:\n";
    allCats.forEach(function(item)
    {
      //Woher kommt der leere Eintrag?
      if (item != "")
      {
        if (item.substr(0,1) != lastChar)
        {
            lastChar = item.substr(0,1);
            tmpRet += "**Categories starting with " + lastChar + "**\n";
        }
        tmpRet += item + " (" + beq_engine.catDataCategs[item].length  + ")\n";
      }
    });
    return tmpRet;    
}
