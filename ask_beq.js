//Internal version - package.json would contain another version, but package.json should never reach the client,
//so it's easier to just have another version number in here...
var versInt = '0.0.2	- Using the beq Engine!';
var startDateTime = new Date().toLocaleString();

var url = require('url');
var restify = require('restify');
var beq = require('./beq_engine.js');
var beqTalkRaw = JSON.parse(beq.beqTalkDef);   //Example

//The parameters are sent via URL parameters, the return will be a JSON object (stringified)


function respond(req, res, next) {
  var URLParam = req.url;
  var retMes = 'nuqjatlh?';

  var beqTalk = JSON.parse(beq.beqTalkDef);
  var talkBeq = null;
  parAr = url.parse(URLParam, true).query;

  //Common parameters
  beqTalk.newline = '<br />';
  beqTalk.limitRes = 999;           //No reason for a limit, is there?
  
  beqTalk.transLang = parAr.transLang;
  if (beqTalk.transLang == undefined)
	  beqTalk.transLang = 'en';

  beqTalk.lookLang = parAr.lookLang;
  if (beqTalk.lookLang == undefined)
	  beqTalk.lookLang = 'tlh';

  if (parAr.showNotes != undefined)
	  beqTalk.showNotes = true;
  
  if (parAr.wordType1 != undefined)
	  beqTalk.wordType1 = parAr.wordType1;
    if (parAr.wordType2 != undefined)
	  beqTalk.wordType2 = parAr.wordType2;

  
  //The commands have no parameters, they just are
  if (parAr.mugh != undefined)
  {
	  beqTalk.command = 'mugh';
	  beqTalk.lookWord = parAr.lookWord;
	  if (parAr.fuzzy != undefined)
		  beqTalk.fuzzy = true;
	  if (parAr.wCase != undefined)
		  beqTalk.wCase = true;

		//Let the engine do its magic :-)
		talkBeq = beq.Engine(beqTalk);
  }
  else if (parAr.KWOTD != undefined)
  {
	  beqTalk.command = 'KWOTD';
	  beqTalk.lookLang = 'tlh';
	  talkBeq = beq.Engine(beqTalk);
  }
  
  
  if (parAr.help != undefined)
  {
	 retMes  = 'Ask beq' + '<br />';
	 retMes += 'All parameters must be encoded into the URL, like this:' + '<br />';
	 retMes += '/ask_beq?mugh&lookLang=tlh&lookWord=mugh&transLang=de&getJSON' + '<br />';
	 retMes += '(This will get you the german translation of the klingon word "mugh", the return is the JSON-object of beqTalk.)' + '<br />';
	 retMes += 'Some of the parameters need to have values, like "lookLang", while others just have to BE there, like "getJSON".' + '<br />';
	 retMes += '' + '<br />';
	 retMes += 'Possible parameters:' + '<br />';
	 retMes += 'mugh - no value, return will be a translation' + '<br />';
	 retMes += 'KWOTD - no value, return will be a random proverb' + '<br />';
	 retMes += 'help - you\'re looking at it' + '<br />';
	 retMes += 'getJSON - no value, return is a JSON object of beqTalk, instead of a preformatted string (still in a JSON object)' + '<br />';
	 retMes += 'fuzzy - no value, don\'t limit the search to word boundaries' + '<br />';
	 retMes += 'wCase - no value, ignore case' + '<br />';
 	 retMes += 'lookWord - the word you want translated as value' + '<br />';
 	 retMes += 'lookLang - the language the word you want translated is in' + '<br />';
 	 retMes += 'transLang - the language you want the translation in' + '<br />';
	 retMes += 'wordType1 - you can use this to limit the results to a specific word type' + '<br />';
	 retMes += 'wordType2 - the word type is the same as in boQwI\'' + '<br />';
	 retMes += '' + '<br />';
	 
	 //Special case, normally we only send JSON
	 res.setHeader('Content-Type', 'text/html');
	 res.end(retMes);
  }
  else
  {
	//Get either the JSON object itself, or a nice string
	if (parAr.getJSON != undefined)
		retMes = talkBeq;
	else
		retMes = beq.createTranslation(talkBeq);
	
	res.send(retMes);
  }
	
  
  next();
}

var server = restify.createServer();

server.get('ask_beq', respond);
server.head('ask_beq', respond);

server.listen(process.env.PORT || 5000, function()
{
  console.log('%s listening at %s', server.name, server.url);
  console.log("Version: " + versInt);
  
	var beqTalk = JSON.parse(beq.beqTalkDef);
	beqTalk.command = "yIngu'";
	beqTalk = beq.Engine(beqTalk);
	console.log(beqTalk.message);
});

//--------------------------------------