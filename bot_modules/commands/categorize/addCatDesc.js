/*

Add a description to the category

 */
var requestify = require('requestify'); 
var logger = require('winston');

module.exports = function (beq_engine, beqMessage)
{
	var tmpRet = "";
	var args = beqMessage.split(" ");
	var category = args[1];
	
	logger.info(category);
	logger.info(beqMessage);

	//Clear command and category
	args[0] = "";
	args[1] = "";
	

	var catDesc = args.join(" ");

	//TODO: write to file, re-read xml
	var addCatLink = "http://www.tlhingan.at/Misc/beq/wordCat/beq_catadddesc.php?category=" + category + "&description=" + catDesc;
	requestify.get(addCatLink);

	return tmpRet;
}
