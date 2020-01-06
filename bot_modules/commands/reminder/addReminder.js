/*

   Add another reminder
   Read in stored reminder, add this one
   
   Parameters:
   Time to display
   Which channel
   Message
   Repeat how often (once per day at the time of the reminder)
  
*/

module.exports = function(myMinute, myHour, myDate, myChannel, myMessage, myRepeats)
{
    var newReminder =
    {
        "myMinute": myMinute,
        "myHour": myHour,
        "myDate": myDate,
        "myChannel": myChannel,
        "myMessage": myMessage,
        "myRepeats": myRepeats
    }
    
}
