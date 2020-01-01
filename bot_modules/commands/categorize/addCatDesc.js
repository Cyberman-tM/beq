/*

Add a description to the category

 */
var requestify = require('requestify'); 
var logger = require('winston');

module.exports = function (beq_engine, beqMessage)
{
	var tmpRet = "";
	var args = beqMessage.split(" ");
	var category = args[1].toUpper();
	
	//Clear command and category
	args[0] = "";
	args[1] = "";
	
	var catDesc = args.join(" ");
	
	//Apostroph austauschen - XML macht sonst Ärger. Ist ev. nicht die beste Variante?
	catDesc = catDesc.replace("'", "X-Z");

	//TODO: re-read xml
	var addCatLink = "http://www.tlhingan.at/Misc/beq/wordCat/beq_addcatdesc.php?category=" + category + "&description=" + catDesc;
	requestify.get(addCatLink);

	tmpRet = "Done.";
	return tmpRet;
}
