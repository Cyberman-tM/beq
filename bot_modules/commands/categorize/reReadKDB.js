/*
   Re-Read KDB (boqwi DB) and check if there are words that haven't been categorized yet
   (boqwi uses a simple categorization system itself)
   
*/
var requestify = require('requestify'); 
var kTranscode = require('./../../utils/recode.js');
var logger = require('winston');

module.exports = function(beq_engine)
{
    //This will probably take some time...
    beq_engine.KDBJSon.forEach(function (item)
    {
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
	    newCategory += ";sentence_muqad_ves_boqwi";
	if (item.type == 'sen:nt')
	    newCategory += ";sentence_nentay_boqwi";
	if (item.type == 'sen:phr')
	    newCategory += ";sentence_phrase_boqwi";
	if (item.type == 'sen:prov')
	    newCategory += ";sentence_proverb_boqwi";
	if (item.type == 'sen:Ql')
	    newCategory += ";sentence_qilop_boqwi";
	if (item.type == 'sen:rej')
	    newCategory += ";sentence_rejection_boqwi";
	if (item.type == 'sen:rp')
	    newCategory += ";sentence_replacement_proverb_boqwi";
	if (item.type == 'sen:sp')
	    newCategory += ";sentence_secret_proverb_boqwi";
	if (item.type == 'sen:lyr')
	    newCategory += ";sentence_lyrics_boqwi";
	    
	    logger.info(item.source);
	if (item.source.includes("TKD"))
	    newCategory +=";source_tkd";
	if (item.source.includes("TKW"))
	    newCategory +=";source_tkw";
	if (item.source.includes("DSC"))
	    newCategory +=";source_discovery";
	if (item.source.includes("KGT"))
	    newCategory +=";source_kgt";
	if (item.source.includes("CK"))
	    newCategory +=";source_ck";
	if (item.source.includes("PK"))
	    newCategory +=";source_pk";
	if (item.source.includes("KCD"))
	    newCategory +=";source_kcd";
	if (item.source.includes("TNK"))
	    newCategory +=";source_tnk";
	if (item.source.includes("HQ"))
	    newCategory +=";source_hq";
	if (item.source.includes("SkyBox"))
	    newCategory +=";source_skybox";
	if (item.source.includes("BoP"))
	    newCategory +=";source_bp";
	if (item.source.includes("msn"))
	    newCategory +=";source_msn";
	if (item.source.includes("s.e"))
	    newCategory +=";source_s.e";
	if (item.source.includes("s.k"))
	    newCategory +=";source_s.k";
	if (item.source.includes("FTG"))
	    newCategory +=";source_ftg";

	if (item.source.includes("KLI mailing list"))
	{	   
		logger.info(item.source);
	    var regexLook = '(?:KLI mailing list) ([0-9]{4})';
	    var RE = new RegExp(regexLook, '');
	    var result = item.source.match(RE);
	    if (result.length > 1)
 	       newCategory +=";source_kli_maillist_" + result[1];
	}
       //Besserer Weg?
       if (newCategory.substr(0,1) == ';')
          newCategory = newCategory.substr(1,9999);
        
       newCategory = newCategory.toUpperCase();
        if (newCategory != "")
            //Word is not categorized yet
            if (beq_engine.catDataWords == null ||
                beq_engine.catDataWords[chkWord] == undefined || 
               !beq_engine.catDataWords[chkWord].includes(newCategory))
	    {
		//Store as uhmal
	        chkWord = kTranscode.RCtlh2u(item.tlh) + ";;" + item.type;		    
                requestify.get("http://www.tlhingan.at/Misc/beq/wordCat/beq_addCategory.php?wordKey=" + chkWord +  "&wordCat=" + newCategory);
	    }
    });
};

