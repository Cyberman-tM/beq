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
var kTranscode = require('./../../utils/recode.js');

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
				var wordName = word.attr.name;
				var wordCats = word.val;
				
				//KLingon word is stored as uhmal
				var fragments = wordName.split(";;");
				fragments[0] = kTranscode.RCu2tlh(fragments[0]);
				wordName = fragments.join(";;");

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
		
	   var catList = beq_engine.catDataCategs[item.attr.name];
	   if (catList == null)
		beq_engine.catDataCategs[item.attr.name] = [];
        });

        //Go through existing categories to mark the automatically created ones
        Object.keys(beq_engine.catDataCategs).forEach(function (item)
        {
            if (beq_engine.catDesc[item] == undefined)		    
            {
                if (item.includes("BOQWI"))
                    beq_engine.catDesc[item] = "Auto-generated from boQwI' data";
		else if (item.startsWith("SOURCE"))
		{
		   beq_engine.catDesc[item] = "Source of definition comes from ";
		   if (item.includes("TKD"))
		       beq_engine.catDesc[item] += "The Klingon Dictionary (Addendum)";
		   else if (item.includes("TKW"))
		       beq_engine.catDesc[item] += "The Klingon Way";
		   else if (item.includes("KGT"))
		       beq_engine.catDesc[item] += "Klingon for the Galactic Traveller";
		   else if (item.includes("CK"))
		       beq_engine.catDesc[item] += "Conversational Klingon";
		   else if (item.includes("PK"))
		       beq_engine.catDesc[item] += "Power Klingon";
		   else if (item.includes("KCD"))
		       beq_engine.catDesc[item] += "Klingon CD (game)";
		   else if (item.includes("TNK"))
		       beq_engine.catDesc[item] += "Talk Now! Klingon";
		   else if (item.includes("HQ"))
		       beq_engine.catDesc[item] += "HolQeD";
		   else if (item.includes("SKYBOX"))
		       beq_engine.catDesc[item] += "SkyBox";
		   else if (item.includes("BOP"))
		       beq_engine.catDesc[item] += "Bird Of Prey poster";
		   else if (item.includes("MSN"))
		       beq_engine.catDesc[item] += "MSN expert forum";
		   else if (item.includes("S.E"))
		       beq_engine.catDesc[item] += "Star trek Expert forum";
		   else if (item.includes("S.K"))
		       beq_engine.catDesc[item] += "Star trek Klingon newsgroup";
		   else if (item.includes("FTG"))
		       beq_engine.catDesc[item] += "Federation Travel Guide";
		   else if (item.includes("KLI_MAILLIST"))
		       beq_engine.catDesc[item] += "KLI Mailing list";
		   else if (item.includes("QEPHOM"))
		       beq_engine.catDesc[item] += "qepHom Saarbrücken";
		   else
		       beq_engine.catDesc[item] += "unknown sources";
		}
                else
                    beq_engine.catDesc[item] = "Description missing!";		  
		    
            }
        });
        
    })
	})
});
};














