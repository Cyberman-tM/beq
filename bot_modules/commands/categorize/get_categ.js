/*
   Re-Read categorization data, reorganize if necessary
*/

var winston = require('winston');
var logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});
var requestify = require('requestify'); 
var xmldoc = require('xmldoc');

module.exports = function(beq_engine)
{
	//Reorg call for categorized words
	requestify.get('http://www.tlhingan.at/Misc/beq/wordCat/beq_reorgCat.php').then(function (response)
	{
		//Re-Read call
		//Response from reorg is irrelevant, but there's no use reading the XML before it has been created...
		requestify.get('http://www.tlhingan.at/Misc/beq/wordCat/beq_Categories.txt').then(function (response)
		{

			// Get the response body
			var document = new xmldoc.XmlDocument(response.getBody());

			//Reset, just to be sure
			beq_engine.catDataWords = {};
			beq_engine.catDataCategs = {};
			
			var words = document.childrenNamed("w");
			words.forEach(function (word)
			{
				//We had to encode the apostrophe
				var wordName = word.attr.name.replace(/X-Z/g, "'");
				var wordCats = word.val.replace(/X-Z/g, "'");

				//Worte sollten einzigartig sein
				beq_engine.catDataWords[wordName] = wordCats;
				
				//Kategorien sind definitiv nicht einzigartig
				var categs = wordCats.split(";");
				categs.forEach(function (oneCateg)
				{
					var catList = beq_engine.catDataCategs[oneCateg];
					if (catList == null)
					{
						beq_engine.catDataCategs[oneCateg] = [];
					}
					beq_engine.catDataCategs[oneCateg].push(wordName);
				}
				);			
				
			}
			);
		}
		)
	}
	)
    //Re-Read category descriptions
    .then(function ()
    {   
	requestify.get('http://www.tlhingan.at/Misc/beq/wordCat/beq_CatDesc.txt').then(function (response)
	{
    	// Get the response body
		var document = new xmldoc.XmlDocument(response.getBody());
        
        //Reset data
        beq_engine.catDesc = {};
        var catDescs = document.childrenNamed("cat");
        catDescs.forEach(function(item)
        {
            beq_engine.catDesc[item.attr.name] = item.val;
        });
        logger.info(beq_engine.catDataCategs);
        //Go through existing categories to mark the automatically created ones
        Object.keys(beq_engine.catDataCategs).forEach(function (item)
        {
            if (beq_engine.catDesc[item] == undefined)
            {
                if (item.contains("boQwI'"))
                    beq_engine.catDesc[item] = "Auto-generated from boQwI' data";
                else
                    beq_engine.catDesc[item] = "Description missing!";
            }
        });
        
    })});
};














