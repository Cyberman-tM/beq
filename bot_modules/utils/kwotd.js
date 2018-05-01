/*
   KWOTD
   Klingon Word Of The Day
   
   A timed function that will create a message 3 times a day, with a randomly selected word
   
*/

var KWOTDTimings = require('./kwotd_timings.js');

module.exports.KWOTD = function()
{
	var thisDate = Date();
	
	//We are called by the universal timer - which runs once a minute
	//So we need to check if we are supposed to start yet
	
	//First lets see if there are any timings to run at all
	var myTimings = JSON.parse(KWOTDTimings.KWOTDTimings);
	if (myTimings.length == 0)
	   return;
	var myHour = thisDate.getHours();
	var myMinu = thisDate.getMinutes();
	var waHour = '';
	var waMinu = '';
	
	myTimings.forEach(item)
	{
	   waHour = item.time.substr(0,2);
	   waMinu = item.time.substr(3,2);
	   if (waHour == myHour && waMinu == myMinu)
	   {
	      //Run KWOTD, send to channel
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
