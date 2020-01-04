/*
   extMemory
   External memory for beq
   
   function STORE    => send JSON object to another server for safekeeping
   function RETRIEVE => get  JSON object from another server
*/

var requestify = require('requestify');
var DData = require('/bot_modules/external/discord_data.js');

module.exports.store = function(objName, objData)
{
	
};

//Returns objData
module.exports.retrieve = function(objName)
{
	var tmpRet = null;
	
};
