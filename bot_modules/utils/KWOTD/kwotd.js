/*
   KWOTD
   Klingon Word Of The Day
   
   A timed function that will create a message 3 times a day, with a randomly selected word
   
*/

var boQwITranslate = require('./../boQwI_translate.js');
var KWOTDTimings = require('./kwotd_timings.js');
var myTimings   = null;
var mybeqEngine = null;
var myBot       = null;
var myChannel   = null;
var myTestFlag  = false;

//Testing
var logger = require('winston');

module.exports.KWOTDInit = function(beqEngine, bot, mesChan, devTest)
{
	//Lets see if there are any timings to run at all
	myTimings = JSON.parse(KWOTDTimings.KWOTDTimings);
	if (myTimings.length == 0)
	   return;
	
	mybeqEngine = beqEngine;
	myTestFlag  = devTest;
	myBot       = bot;
	myChannel   = mesChan;
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
              beqTalk.wordType1 = beqTalk.wordType2 = item.type;
	      beqTalk.lookLang = 'tlh';
		   
	      //Let the engine do its magic :-)
	      var talkBeq = mybeqEngine.Engine(beqTalk);			
	      var sndMessage = '';

 	      //There should be only one
 	      beqTalk.result.forEach(function (item)
	      {
	         sndMessage  = 'KWOTD - Klingon Word Of The Day' + beqTalk.newline;
		 sndMessage += 'beq edition' + beqTalk.newline + beqTalk.newline;
		 var wordType = '';
		 //TODO: get language somehow?
		 if (item.type.startsWith('sen'))
		     wordType = boQwITranslate.getSType(item.type, 'en');
		 else
		     wordType = boQwITranslate.getWType(item.type, 'en');
		      
		 sndMessage += 'Type of word: ' + wordType + beqTalk.newline;
		 sndMessage += 'tlhIngan: ' + item.tlh + beqTalk.newline;
		 sndMessage += 'Deutsch: ' + item.de + beqTalk.newline;
		 sndMessage += 'English: ' + item.en + beqTalk.newline;		 
	      });
	      logger.info(sndMessage);
/*
		myBot.sendMessage({
			to: myChannel,
			message: sndMessage
		});
		*/
	   }
	});	
}
