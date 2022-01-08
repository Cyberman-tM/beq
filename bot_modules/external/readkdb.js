/*
   Moved outside of beq_engine.js for easier maintainance

   read in boQwI' xml, update with ID from Azure storage
*/

var fs = require('fs');
var xmldoc = require('xmldoc');
var catAPI = require('./../external/cat_api.js');
var kTranscode = require('./../utils/recode.js');
var requestify = require('requestify');
var winston = require('winston');
var logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = function (KDBJSon, KDBPHJSon, KDBVPJSon, KDBVSJSon, KDBNSJSon, KDBNCount, KDBVCount) {
    //Read boQwI' xml files to build up internal JSON database
    var xmlFiles = fs.readdirSync('./KDB/');
    var xml = '';
    xmlFiles.forEach(function (item) {
        if (item.substr(-4) == '.xml')
            xml += fs.readFileSync(('./KDB/' + item), 'utf8');
    }
    );
    var KDBVer = fs.readFileSync('./KDB/VERSION', 'utf8');

    var document = new xmldoc.XmlDocument(xml);

    //Wanted format:
    //{"tlh":"bay","de":"der Konsonant {b:sen:nolink}","en":"the consonant {b:sen:nolink}","type":"n"},
    var emptyStruct =
    {
        tlh: 'tlhIngan',
        en: 'klingon',
        de: 'Klingone',
        ru: '',
        id: '',
        type: 'n',
        notes: 'notes',
        notes_de: 'notes_de',
        hidden_notes: 'hidden_notes',
        source: 'source'
    };

    document.children[1].childrenNamed("table").forEach(function (headItem) {
        emptyStruct = new Array(
            {
                tlh: '',
                en: '',
                de: '',
                ru: '',
                id: '',
                type: '',
                notes: '',
                notes_de: '',
                hidden_notes: '',
                source: ''
            }
        );

        //Transfer only the data we actually want
        headItem.childrenNamed("column").forEach(function (item) {
            if (item.firstChild != null) {
                switch (item.attr.name) {
                    case 'entry_name':
                        emptyStruct.tlh = item.firstChild.text;
                        break;
                    case 'part_of_speech':
                        emptyStruct.type = item.firstChild.text;
                        if (emptyStruct.type == "n" || emptyStruct.type.startsWith("n:") )
                           KDBNCount++;
                        else if (emptyStruct.type == "v" || emptyStruct.type.startsWith("v:") )
                           KDBVCount++;
                      
                        break;
                    case 'definition':
                        emptyStruct.en = item.firstChild.text;
                        break;
                    case 'definition_de':
                        emptyStruct.de = item.firstChild.text;
                        break;
                    case 'definition_ru':
                        emptyStruct.ru = item.firstChild.text;
                        break;
                    case 'notes':
                        emptyStruct.notes = item.firstChild.text;
                        break;
                    case 'notes_de':
                        emptyStruct.notes_de = item.firstChild.text;
                        break;
                    case 'hidden_notes':
                        emptyStruct.hidden_notes = item.firstChild.text;
                        break;
                    case 'source':
                        emptyStruct.source = item.firstChild.text;
                        break;
                }
            }
        }
        );
       
       logger.info(KDBNCount);

        //Make sure everything's here (sometimes the german is missing)
        if (emptyStruct.de == '' || emptyStruct.de == undefined)
            emptyStruct.de = emptyStruct.en;
        //New languages are definitely sometimes missing
        if (emptyStruct.ru == '' || emptyStruct.ru == undefined)
            emptyStruct.ru = emptyStruct.en;

        //Just to be sure...
        if (emptyStruct.en == undefined)
            emptyStruct.en = '';
        if (emptyStruct.tlh == undefined)
            emptyStruct.tlh = '';
        if (emptyStruct.ru == undefined)
            emptyStruct.ru = '';
        if (emptyStruct.notes == undefined)
            emptyStruct.notes = '';
        if (emptyStruct.notes_de == undefined)
            emptyStruct.notes_de = '';
        if (emptyStruct.hidden_notes == undefined)
            emptyStruct.hidden_notes = '';
        if (emptyStruct.source == undefined)
            emptyStruct.source = '';
        if (emptyStruct.id == undefined)
            emptyStruct.id = '';

        //Cleanup - boQwI' contains links to other, related words - we don't use them, so I throw them away
        var regClean = /(\:[a-zA-Z0-9]*)/g;
        emptyStruct.notes = emptyStruct.notes.replace(regClean, '');
        emptyStruct.notes_de = emptyStruct.notes_de.replace(regClean, '');
        emptyStruct.hidden_notes = emptyStruct.hidden_notes.replace(regClean, '');
        emptyStruct.source = emptyStruct.source.replace(regClean, '');

        var regClean2 = ",nolink";
        emptyStruct.notes = emptyStruct.notes.replace(regClean2, '');
        emptyStruct.notes_de = emptyStruct.notes_de.replace(regClean2, '');
        emptyStruct.hidden_notes = emptyStruct.hidden_notes.replace(regClean2, '');
        emptyStruct.source = emptyStruct.source.replace(regClean2, '');

        //Now we replace the paranthesis with stars, so we have a nice italic font in Discord, and mark the words in other cases
        var regMark = /{|}/g;
        emptyStruct.notes = emptyStruct.notes.replace(regMark, '*');
        emptyStruct.notes_de = emptyStruct.notes_de.replace(regMark, '*');
        emptyStruct.hidden_notes = emptyStruct.hidden_notes.replace(regMark, '*');
        emptyStruct.source = emptyStruct.source.replace(regMark, '*');

        //Push it into the array
        KDBJSon.push(emptyStruct);

        //We have several separate arrays for quick access to predefined word types
        if (emptyStruct.type.startsWith('sen'))
            KDBPHJSon.push(emptyStruct);
        else if (emptyStruct.type.startsWith('v:pref'))
            KDBVPJSon.push(emptyStruct);
        else if (emptyStruct.type.startsWith('v:suff')) {
            //emptyStruct wird in jedem Durchlauf neu angelegt, es sollte daher kein Problem
            //sein jetzt ein Feld einzufügen, oder?
            switch (emptyStruct.tlh) {
                case "-'egh":
                case "-chuq":
                    emptyStruct.suffixNum = 1;
                    break;

                case "-nIS":
                case "-qang":
                case "-rup":
                case "-beH":
                case "-vIp":
                    emptyStruct.suffixNum = 2;
                    break;

                case "-choH":
                case "-qa'":
                    emptyStruct.suffixNum = 3;
                    break;

                case "-moH":
                    emptyStruct.suffixNum = 4;
                    break;

                case "-lu'":
                case "-laH":
                    emptyStruct.suffixNum = 5;
                    break;

                case "-chu'":
                case "-bej":
                case "-ba'":
                case "-law'":
                    emptyStruct.suffixNum = 6;
                    break;

                case "-pu'":
                case "-ta'":
                case "-taH":
                case "-lI'":
                    emptyStruct.suffixNum = 7;
                    break;

                case "-neS":
                    emptyStruct.suffixNum = 8;
                    break;

                case "-DI'":
                case "-chugh":
                case "-pa'":
                case "-vIS":
                case "-mo'":
                case "-bogh":
                case "-meH":
                case "-'a'":
                case "-jaj":
                case "-wI'":
                case "-ghach":
                    emptyStruct.suffixNum = 9;
                    break;

                case "-be'":
                case "-Qo'":
                case "-Ha'":
                case "-qu'":
                    emptyStruct.suffixNum = "R";
                    break;
            }

            KDBVSJSon.push(emptyStruct);
        }
        else if (emptyStruct.type.startsWith('n:suff')) {
            //emptyStruct wird in jedem Durchlauf neu angelegt, es sollte daher kein Problem
            //sein jetzt ein Feld einzufügen, oder?
            switch (emptyStruct.tlh) {
                case "-'a'":
                case "-Hom":
                case "-oy":
                    emptyStruct.suffixNum = 1;
                    break;

                case "-pu'":
                case "-Du'":
                case "-mey":
                    emptyStruct.suffixNum = 2;
                    break;

                case "-qoq":
                case "-Hey":
                case "-na'":
                    emptyStruct.suffixNum = 3;
                    break;

                case "-wIj":
                case "-wI'":
                case "-maj":
                case "-ma'":
                case "-lIj":
                case "-lI'":
                case "-raj":
                case "-ra'":
                case "-Daj":
                case "-chaj":
                case "-vam":
                case "-vetlh":
                    emptyStruct.suffixNum = 4;
                    break;

                case "-Daq":
                case "-vo'":
                case "-mo'":
                case "-vaD":
                case "-'e'":
                    emptyStruct.suffixNum = 5;
                    break;
            }
            KDBNSJSon.push(emptyStruct);
        }
    }
    );

    //Clear as much memory as possible
    xmlFiles = null;
    xml = null;
    fs = null;
/*
    //Get IDs from external, must be asynchronous because of JavaScript...
    requestify.get(catAPI.catWakeup).then(function () {
        logger.info("wake");
        requestify.get(catAPI.catGetData + "&dataType=WordN2I").then(            
            function (wordData) {
                logger.info("words");
                try
                {
                var wData = JSON.parse(wordData);
                }
                catch(error)
                {
                    logger.info(error);
                }
                logger.info("afterparse");
                //KDBJSon, KDBPHJSon, KDBVPJSon, KDBVSJSon, KDBNSJSon              

                KDBJSon.foreach(function(item, index){


                    var chkWord = kTranscode.RCtlh2u3(item.tlh) + ";;" + item.type;
                    chkWord = chkWord.replace(/[?!]/g, '');
                    item.id = wData[chkWord];

                    //zurückschreiben
                    KDBJSon[index] = item;
                });

            });
    });
    */
};
