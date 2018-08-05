/*
    Timings for KWOTD
    
    Easier to maintain if in a separate file :-)
    
    Since this will only be read during startup, it doesn't matter that it's basically
    an include - a text file might seem better, but it would require a re-start routine.
    
    Meaning of time: at this time the KWOTD should run - note JavaScript notation: 0-23, 0-59
    Meaning of type: type of word like in boQwI', separate multiple choices with a |
    
    The KWOTD event will check the time, and if it's less than a minute after it, it'll run
    A note for Heroku: currently Heroku is 2 hours behind my time (Vienna time).
    So there's probably a shift at least once a year, this is not accounted for. Yet :-)
*/

module.exports.KWOTDTimings = JSON.stringify(
[
    { "time": "17:1", "source": "2018" } 
]);
