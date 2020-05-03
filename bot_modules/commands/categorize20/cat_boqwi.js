/*
   Auto-Categorize words from boQwI'
*/
var requestify = require('requestify');
var catAPI = require('./../../external/cat_api.js');
var kTranscode = require('./../../utils/recode.js');
var winston = require('winston');
var logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console()
    ]
});

var bulkCatData = [];
var bulkWordData = [];
var bulkC2W = [];

var bulkCmpCD = [];
var bulkCmpWD = [];
var bulkCmpC2W = [];


module.exports = function (beq_engine, startLetters) {
    var regexLook = "";
    var RE = "";
    var result = "";

    bulkCatData = [];
    bulkWordData = [];
    bulkC2W = [];

    bulkCmpCD = [];
    bulkCmpWD = [];
    bulkCmpC2W = [];

    //Make sure we ALWAYS have enough entries
    startLetters += "x;x;x;x;x;x"
    sLetter = startLetters.split(';');

    //This will probably take some time...
    beq_engine.KDBJSon.forEach(function (item) {

        //Ridiculous way to make sure we don't overwhelm the table storage...
        if (!(item.tlh.startsWith(sLetter[0]) ||
            item.tlh.startsWith(sLetter[1]) ||
            item.tlh.startsWith(sLetter[2]) ||
            item.tlh.startsWith(sLetter[3]) ||
            item.tlh.startsWith(sLetter[4]) ||
            item.tlh.startsWith(sLetter[5]) ||
            item.tlh.startsWith(sLetter[6])))
            return;

        //In-memory, everything is normal, but we store uhmal
        var chkWord = item.tlh + ";;" + item.type;
        var newCategory = "";

        //Primitive, but it should do
        if (item.type.includes("anim"))
            newCategory += ";Animal_boqwi";
        if (item.type.includes("being"))
            newCategory += ";being_boqwi";
        if (item.type.includes("archaic"))
            newCategory += ";Archaic_boqwi";
        if (item.type.includes("deriv"))
            newCategory += ";derived_boqwi";
        if (item.type.includes("reg"))
            newCategory += ";regional_boqwi";
        if (item.type.includes("food"))
            newCategory += ";food_boqwi";
        if (item.type.includes("inv"))
            newCategory += ";invectives_boqwi";
        if (item.type.includes("slang_boqwi"))
            newCategory += ";slang_boqwi";
        if (item.type.includes("weap"))
            newCategory += ";weapon_boqwi";
        if (item.type == 'sen:phr')
            newCategory += ";sentence_phrase_boqwi";
        if (item.type == 'sen:toast')
            newCategory += ";sentence_toast_boqwi";
        if (item.type == 'sen:eu')
            newCategory += ";sentence_eu_boqwi";
        if (item.type == 'sen:idiom')
            newCategory += ";sentence_idiom_boqwi";
        if (item.type == 'sen:mv')
            newCategory += ";sentence_muqadves_boqwi";
        if (item.type == 'sen:nt')
            newCategory += ";sentence_nentay_boqwi";
        if (item.type == 'sen:prov')
            newCategory += ";sentence_proverb_boqwi";
        if (item.type == 'sen:Ql')
            newCategory += ";sentence_qilop_boqwi";
        if (item.type == 'sen:rej')
            newCategory += ";sentence_rejection_boqwi";
        if (item.type == 'sen:rp')
            newCategory += ";sentence_proverb_replacement_boqwi";
        if (item.type == 'sen:sp')
            newCategory += ";sentence_proverb_secret_boqwi";
        if (item.type == 'sen:lyr')
            newCategory += ";sentence_lyrics_boqwi";

        if (item.source.includes("TKD"))
            newCategory += ";source_tkd";
        if (item.source.includes("TKW"))
            newCategory += ";source_tkw";
        if (item.source.includes("DSC"))
            newCategory += ";source_discovery";
        if (item.source.includes("KGT"))
            newCategory += ";source_kgt";
        if (item.source.includes("CK"))
            newCategory += ";source_ck";
        if (item.source.includes("PK"))
            newCategory += ";source_pk";
        if (item.source.includes("KCD"))
            newCategory += ";source_kcd";
        if (item.source.includes("TNK"))
            newCategory += ";source_tnk";
        if (item.source.includes("HQ"))
            newCategory += ";source_hq";
        if (item.source.includes("SkyBox"))
            newCategory += ";source_skybox";
        if (item.source.includes("BoP"))
            newCategory += ";source_bop";
        if (item.source.includes("msn"))
            newCategory += ";source_msn";
        if (item.source.includes("s.e"))
            newCategory += ";source_s.e";
        if (item.source.includes("s.k"))
            newCategory += ";source_s.k";
        if (item.source.includes("FTG"))
            newCategory += ";source_ftg";

        if (item.source.includes("KLI mailing list")) {
            regexLook = '(?:KLI mailing list) ([0-9]{4})';
            RE = new RegExp(regexLook, '');
            result = item.source.match(RE);
            if (result.length > 1)
                newCategory += ";source_kli_maillist_" + result[1];
        }

        if (item.source.includes("qepHom'a'")) {
            regexLook = "(?:Saarbrücken qepHom'a') ([0-9]{4})";
            RE = new RegExp(regexLook, '');
            result = item.source.match(RE);
            if (result.length > 1)
                newCategory += ";source_qephom_" + result[1];
        }


        //Besserer Weg?
        if (newCategory.substr(0, 1) == ';')
            newCategory = newCategory.substr(1, 9999);

        if (newCategory != "") {
            logger.info(newCategory);
            var newCats = newCategory.split(";");
            newCats.forEach(function (itemCat) {
                catFound = false;
                //Store as uhmal3
                chkWord = kTranscode.RCtlh2u3(item.tlh) + ";;" + item.type;

                //Add to category bulk array
                createCat(itemCat, "en", "Taken from boQwI\'");
                addBulkWord(chkWord);
                addBulkC2W(itemCat, chkWord);
            });
        }
    });

    //Call bulk functions
    //First: call with basic categories
    //Then:  call with categories for boQwI' subcategories
    //Next:  call with words we want to categorize
    //Finally: call with category <> words
    logger.info(bulkWordData.length);
    logger.info(bulkC2W);

    reCreateBaseCats();
    requestify.get(catAPI.catWakeup).then(function () {
        requestify.post(catAPI.catCreateCatBulk, bulkCatData)
            .then(function () {
                requestify.post(catAPI.catAddWordBulk, bulkWordData).then(function () {
                    logger.info("words");
                    //requestify.post(catAPI.catW2CBulk, bulkC2W);
                });
            });
    });

};


function reCreateBaseCats() {
    //Call order is intended - superkategories need to exist before the subkategorie is created
    createCat("sentence", "en", "Whole sentences that are canon.");
    createCat("source", "en", "First instance of the word, origin.");
    createCat("animal", "en", "Animal names and everything related");
    createCat("being", "en", "Beings, as opposed to things.");
    createCat("archaic", "en", "Words rarely used, or outdated versions.");
    createCat("derived", "en", "These words are probably canon, but we don\'t really have confirmation.");
    createCat("regional", "en", "Similar to slang, they\'re canon, but not everyone knows or uses them.");
    createCat("food", "en", "Anything related to stuff you can eat.");
    createCat("invectives", "en", "Insults and the like.");
    createCat("slang", "en", "Similar to regional words, it\'s canon, but not everyone knows or uses it.");
    createCat("weapon", "en", "Anything related to weapons, be they handheld or ship-mounted.");
    createCat("sentence_proverb", "en", "%%fill in better description");
    createCat("source_kli", "en", "%%fill in better description");
    createCat("source_qephom", "en", "Revealed at a qepHom, year see category name");
    createCat("sentence_phrase", "en", "Generic phrases.");
    createCat("sentence_toast", "en", "Toasts");
    createCat("sentence_eu", "en", "Empire Unification");
    createCat("sentence_idiom", "en", "Idioms, sayings that have more than the literal meaning.");
    createCat("sentence_muqadves", "en", "mu\'qaD veS - insult war");
    createCat("sentence_nentay", "en", "The rite of ascension.");
    createCat("sentence_qilop", "en", "%%fill in better description");
    createCat("sentence_rejection", "en", "%%fill in better description");
    createCat("sentence_proverb_secret", "en", "%%fill in better description");
    createCat("sentence_proverb_replacement", "en", "%%fill in better description");
    createCat("sentence_lyrics", "en", "Song texts.");
}

function addBulkWord(name) {
    if (bulkCmpWD.indexOf(name) < 0) {
        bulkWordData.push({ "n": name });
        bulkCmpWD.push(name);
    }
}

function addBulkC2W(nameCat, nameWord) {
    newObjStr = nameCat + nameWord;
    if (bulkCmpC2W.indexOf(newObjStr) < 0) {
        bulkC2W.push({ "k": nameCat, "w": nameWord });
        bulkCmpC2W.push(newObjStr);
    }
}

function createCat(name, langu, desc) {
    //No creation anymore, just collect for bulk creation
    name = name.toUpperCase();

    //Doppelte vermeiden - wird hier ev. langsamer, aber dann im Azure schneller
    newObjStr = name + langu + desc;
    if (bulkCmpCD.indexOf(newObjStr) < 0) {
        bulkCatData.push({ "n": name, "l": langu, "d": desc });
        bulkCmpCD.push(newObjStr);
    }

}

