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
   
   //Vorerst nehmen wir die DAten direkt aus dem Verzeicnis,
   //d.h. keine dynamische Änderung, und bei jeder Änderung
   //muß der Bot neu gestartet werden
   //Alternative: mit requestify eine Datei von woanders einlesen   
   stammData = require('./stammtisch_notes.js');
};

module.exports.remind = function(myDate, myHour, myMinute)
{
   stammData.items.forEach(function (item)
   {
       //Achtung: JS startet die Woche mit 0!
       if (myDate.getDay() == item.weekday)
       {
           if (myHour == item.hour && myMinute == item.myMinute)
           {
              myBot.botSendMessage(1, myBot, item.channel, item.message);
           }               
       }      
   });

};
