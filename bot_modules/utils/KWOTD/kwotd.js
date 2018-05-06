/*
   KWOTD
   Klingon Word Of The Day
   
   A timed function that will create a message 3 times a day, with a randomly selected word
   
*/

var KWOTDTimings = require('./kwotd_timings.js');
var myTimings = null;
var mybeqEngine = null;

module.exports.KWOTD.init = function(beqEngine)
{
	//Lets see if there are any timings to run at all
	myimings = JSON.parse(KWOTDTimings.KWOTDTimings);
	if (myTimings.length == 0)
	   return;
	
	mybeqEngine = beqEngine;
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
	myTimings.forEach(item)
	{
	   waHour = item.time.substr(0,2);
	   waMinu = item.time.substr(3,2);
	   if (waHour == myHour && waMinu == myMinute)
	   {
	      var beqTalk = JSON.parse(mybeqEngine.beqTalkDef);
	      beqTalk.command = 'KWOTD';
              beqTalk.wordType1 = item.type;
	   }
	}
	
	
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
