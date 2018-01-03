/*
   Discord-Data
   Authorization, special channels, whatever
   Moved to a separate module so any method can be used without having to constantly update bot.js
*/

//process.env comes from Heroku
module.exports.token = process.env.token;
module.exports.clipChan = process.env.clipChan;
module.exports.bTChan = process.env.bTChan;
