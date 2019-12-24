/*
   Reminder for Stammtisch, send a message
*/

var myBot = null;
var myBeq = null;
var sendChannel = null;
var stammData = null;

module.exports.Init = function(bot, beq_engine, devTest, logger)
{
   if (devTest = true)
      logger.info("Stammtisch-Reminder init");
      
   myBot = bot;
//   myBeq = beq_engine;
   
   sendChannel = beq_engine.StammChan   
   
   //Get timings
   stammData = require('./stammtisch_notes.js');
};

module.exports.remind = function(myDate, myHour, myMinute)
{
   
   stammData.items.forEach(function (item)
   {
      
   });
   //myBot.botSendMessage(1, myBot, sendChannel, sendMessage);

};
