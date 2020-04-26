/*
   Categorization 2.0 - Azure Table Storage

*/

var catAPI = require('./../../external/cat_api.js');

var tmpReload = require('./reloadcats.js');
var tmpCatBoq = require('./cat_boqwi.js');

module.exports.catReLoad = tmpReload;
module.exports.catReKDB = tmpCatBoq;