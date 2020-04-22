/*
   Reload categorization
*/
var requestify = require('requestify'); 
var catAPI = require('./../../external/cat_api.js');

module.exports = function(beq_engine)
{
    var tmpRet = "";    

    requestify.get(catAPI.catGetData + "?dataID=categs").then(function (response)
    {
        /*
        KID
        [
           KID (again)
           fn - fullname
           WIDS
           [
              WID
              JDescs[lang] text
           ]
        ]
        */
        // Get the response body
        beq_engine.catEx = (response.getBody());       

    });


    tmpRet = "done?";
    return tmpRet;
}