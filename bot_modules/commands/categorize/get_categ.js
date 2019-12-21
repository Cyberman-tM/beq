var logger = require('winston');
var requestify = require('requestify'); 
var xmldoc = require('xmldoc');

module.exports = function(beq_engine)
{
	//Reorg call
	requestify.get('http://www.tlhingan.at/Misc/beq/wordCat/beq_reorgCat.php').then(function (response)
	{
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
				//We had to encode the special characters, now we have to decode them
				var wordName = unEscapeHtml(word.attr.name);
				var wordCats = unEscapeHtml(word.val);
				logger.info(wordName);

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
	);
};

function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}


function unEscapeHtml(text) {
  var map = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;':'>' ,
    '&quot;': '"',
    '&#039;': "'"
  };

  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
