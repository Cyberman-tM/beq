/*
    Timings for KWOTD
    
    Easier to maintain if in a separate file :-)
    
    Meaning of time: at this time the KWOTD should run - note JavaScript notation: 0-23, 0-59
    Meaning of type: type of word like in boQwI', except when preceded by a !, then it's negated
    
    The KWOTD event will check the time, and if it's less than a minute after it, it'll run    
*/

module.exports.KWOTDTimings = JSON.stringify(
[
   { "time": "08:00",
     "type": "n" },
   { "time": "19:00", "type": "n" },
    { "time": "19:10", "type": "v" },
    { "time": "19:20", "type": "n" },
    { "time": "19:30", "type": "vp" },
    { "time": "19:40", "type": "np" },
    { "time": "19:50", "type": "vs" },
  { "time": "16:00",
     "type": "v" },
  { "time": "24:00",
     "type": "!n,v" },
]);
