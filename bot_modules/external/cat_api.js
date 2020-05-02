/*
   Links to the categorization API, taken from Heroku
*/

//var tmpAddDesc = process.env.cat_addesc;
var tmpAddWord = process.env.cat_addword;
var tmpCreateCat = process.env.cat_create;
var tmpW2C = process.env.cat_w2c;
var tmpCreateCatBulk = process.env.cat_createBulk;
var tmpAddWordBulk = process.env.cat_addWordBulk;
var tmpW2CBulk = process.env.cat_w2cBulk;
var tmpWakeUp = process.env.cat_wakeup;
//var tmpGetData = process.env.cat_getdata;

//module.exports.catAddDesc  = tmpAddDesc;
module.exports.catAddWord = tmpAddWord;
module.exports.catCreateCat = tmpCreateCat;
module.exports.catW2C = tmpW2C;
module.exports.catCreateCatBulk = tmpCreateCatBulk;
module.exports.catAddWordBulk = tmpAddWordBulk;
module.exports.cat_w2cBulk = tmpW2CBulk;
module.exports.catWakeup    = tmpWakeUp;
//module.exports.catGetData   = tmpGetData;