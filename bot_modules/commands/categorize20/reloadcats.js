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
        var catList = JSON.parse(response.getBody());

        tmpRet = catList[0].KID + catList[0].fn;

    });

    return tmpRet;
}