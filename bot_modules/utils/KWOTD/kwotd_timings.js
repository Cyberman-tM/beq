/*
    Timings for KWOTD
    
    Easier to maintain if in a separate file :-)
    
    Meaning of time: at this time the KWOTD should run - note JavaScript notation: 0-23, 0-59
    Meaning of type: type of word like in boQwI', except when preceded by a !, then it's negated
    
    The KWOTD event will check the time, and if it's less than a minute after it, it'll run    
*/

module.exports.KWOTDTimings = JSON.stringify(
[
   { "time": "6:1", "type": "n" },
   { "time": "8:1", "type": "v" },
   { "time": "10:1", "type": "v:pref" },
   { "time": "12:1", "type": "v:suff" },
   { "time": "14:1", "type": "n:suff" },
   { "time": "20:1", "type": "sen" },
]);
