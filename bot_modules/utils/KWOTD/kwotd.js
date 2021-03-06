/*
   KWOTD
   Klingon Word Of The Day
   
   A timed function that will create a message 3 times a day, with a randomly selected word
   
*/

var boQwITranslate = require('./../boQwI_translate.js');
var KWOTDTimings = require('./kwotd_timings.js');
var beq = require ('./../../personality/beq_person.js');
var botSendMessage = require ('./../sendMessage.js');
var myTimings   = null;
var mybeqEngine = null;
var myBot       = null;
var myChannel   = null;
var myTestFlag  = false;

//For testing
var logger = require('winston');

module.exports.KWOTDInit = function(beqEngine, bot, mesChan, devTest)
{
	//Lets see if there are any timings to run at all
	myTimings = JSON.parse(KWOTDTimings.KWOTDTimings);
	if (myTimings.length == 0 || devTest == "True")
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
	   var tmpTim = item.time.split(':');
	   waHour = tmpTim[0];
	   waMinu = tmpTim[1];
	   if (waHour == myHour && waMinu == myMinute)
	   {
	      var beqTalk = JSON.parse(mybeqEngine.beqTalkDef);
	      beqTalk.command = 'KWOTD';
	      beqTalk.lookLang = 'tlh';
		  
	      //Either item type, or source - not both, for now
	      if (item.type != undefined)
		   beqTalk.wordType1 = beqTalk.wordType2 = item.type;
	      else if (item.source != undefined)
		      beqTalk.lookSource = item.source;
		   
	      //Let the engine do its magic :-)
	      var talkBeq = mybeqEngine.Engine(beqTalk);			
	      var sndMessage = talkBeq.message;

 	      //There should be only one
 	      //beqTalk.result.forEach(function (item)
	      talkBeq.result.forEach(function (item)
	      {
		      sndMessage = module.exports.KWOTDTranslate(talkBeq, item);
	      });
//	      logger.info(sndMessage);

		botSendMessage(1, myBot, myChannel, sndMessage);
		//myBot.sendMessage({
			//to: myChannel,
			//message: sndMessage
		//});		
	   }
	});	
}

module.exports.KWOTDTranslate = function(beqTalk, item)
{
	var sndMessage = "";
	         //sndMessage  = beqTalk.newline + '**KWOTD** - Klingon Word Of The Day - *beq edition*' + beqTalk.newline;
	sndMessage  = beqTalk.newline + '**KWOTD** - *beq edition*' + beqTalk.newline;
	//Get a little bit of smalltalk :-)
		 sndMessage += beq.getLine(3, true, true, beqTalk.newline) + beqTalk.newline;

		 var wordType = '';
		 //TODO: get language somehow?
		 if (item.type.startsWith('sen'))
		     wordType = boQwITranslate.getSType(item.type, 'en');
		 else
		     wordType = boQwITranslate.getWType(item.type, 'en');		      

	//Klingonflag -> move to external resource, maintain in Heroku?
		 sndMessage += '<:klingonflag:387667578572636160> ** *' + item.tlh + '* **' + beqTalk.newline + beqTalk.newline;
	
		 sndMessage += 'Type of word: *' + wordType + '*' + beqTalk.newline;
		 sndMessage += '🇺🇸 *' + item.en + '*' + beqTalk.newline;
		 sndMessage += '🇩🇪 *' + item.de + '*' + beqTalk.newline;
		 sndMessage += beqTalk.newline;
		if (item.notes != '')
			sndMessage += 'Notes: ' + item.notes + beqTalk.newline;
		if (item.notes_de != '')
			sndMessage += 'Notes de: ' + item.notes_de + beqTalk.newline;
		if (item.hidden_notes != '')
			sndMessage += 'Hidden notes: ' + item.hidden_notes + beqTalk.newline;
		if (item.source != '')
			sndMessage += 'Source: ' + item.source + beqTalk.newline;
	return sndMessage;
}
