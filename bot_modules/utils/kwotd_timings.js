/*
    Timings for KWOTD
    
    Easier to maintain if in a separate file :-)
    
    Meaning of type: type of word like in boQwI', except when preceded by a !, then it's negated
    
    The KWOTD event will check the time, and if it's less than a minute after it, it'll run    
*/

module.export.KWOTDTimings = JSON.stringify(
[
   { "time": "08:00",
     "type": "n" },
  { "time": "16:00",
     "type": "v" },
  { "time": "24:00",
     "type": "!n,v" },
]);
