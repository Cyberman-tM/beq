/*
   Links to the categorization API, taken from Heroku
*/

var tmpAddDesc = process.env.cat_addesc;
var tmpAddWord = process.env.cat_addword;
var tmpCreateCat = process.env.cat_create;
var tmpW2C = process.env.cat_w2c;
var tmpWakeup = process.env.cat_wakeup;
var tmpGetData = process.env.cat_getdata;

module.exports.catAddDesc  = tmpAddDesc;
module.exports.catAddWord   = tmpAddWord;
module.exports.catCreateCat = tmpCreateCat;
module.exports.catW2C       = tmpW2C;
module.exports.catWakeup    = tmpWakeup;
module.exports.catGetData   = tmpGetData;