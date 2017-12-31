//Internal version - package.json would contain another version, but package.json should never reach the client,
//so it's easier to just have another version number in here...
var versInt = '0.0.1	- Using the beq Engine!';
var startDateTime = new Date().toLocaleString();

var url = require('url');
var restify = require('restify');
var beq = require('./beq_engine.js');
var beqTalkRaw = JSON.parse(beq.beqTalkDef);   //Example

//The parameters are sent via URL parameters, the return will be a JSON object (stringified)

function respond(req, res, next) {
  var URLParam = req.url;

  var beqTalk = JSON.parse(beq.beqTalkDef);
  parAr = url.parse(URLParam, true).query;
  console.log(parAr);

 
 
  next();
}

var server = restify.createServer();

server.get('beq', respond);
server.head('beq', respond);

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