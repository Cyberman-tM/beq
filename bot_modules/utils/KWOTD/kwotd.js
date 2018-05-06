/*
   KWOTD
   Klingon Word Of The Day
   
   A timed function that will create a message 3 times a day, with a randomly selected word
   
*/

var KWOTDTimings = require('./kwotd_timings.js');
var myTimings = null;
var mybeqEngine = null;
var myTestFlag = false;

//Testing
var logger = require('winston');

module.exports.KWOTDInit = function(beqEngine, devTest)
{
	//Lets see if there are any timings to run at all
	myTimings = JSON.parse(KWOTDTimings.KWOTDTimings);
	if (myTimings.length == 0)
	   return;
	
	mybeqEngine = beqEngine;
	myTestFlag = devTest;
}

//We are called by the universal timer - which runs once a minute
module.exports.KWOTD = function(myDate, myHour, myMinute)
{
	//Lets check if we have any timings
	if (myTimings == null || myTimings.length == 0)
	   return;
	
	var waHour = '';
	var waMinu = '';
	//Check if we are supposed to start yet
	myTimings.forEach(function (item) 
	{
	   waHour = item.time.substr(0,2);
	   waMinu = item.time.substr(3,2);
	   if (waHour == myHour && waMinu == myMinute)
	   {
	      var beqTalk = JSON.parse(mybeqEngine.beqTalkDef);
	      beqTalk.command = 'KWOTD';
              beqTalk.wordType1 = item.type;
	      beqTalk.lookLang = 'tlh';
		   
	      //Let the engine do its magic :-)
	      var talkBeq = mybeqEngine.Engine(beqTalk);			
	      var sndMessage = '';
 	      beqTalk.result.forEach(function (item)
	      {
	         sndMessage += 'tlh:' + item.tlh + beqTalk.newline + 'de:' + item.de + beqTalk.newline + 'en:' + item.en;
	      });
	      logger.info(sndMessage);
	   }
	});	
}

/*
Hints:
KWOTD:

timeout -> setinterval

alle 8 STunden => 3 jobs?
Message zu ?incoming?

Abfolge:

3xTag:

Noun
Verb
Everything else

Message:

KWOTD => Funktion in beq_engine!

Aussehen:

KWOTD
This is your daily type-of-word (in klingon!)

klingon-word
english-word
german-word

notes/source
*/
