/*
   Personality lines - all the texts that beq is supposed to say
   Moved to a separate file for easier sharing
   
   (Note: not all texts are here, some are hardcoded to commands, so makes no sense to move them to a different file)
*/

//A JSON string containing an array with lines beq can say whenever he likes (usually after a translation)
//Use <BR> as linebreak - this WILL be replaced with a fitting newline character.
//Add empty lines to reduce the chance of a line being returned (i.e. more silence)
module.exports.idleLines = JSON.stringify(
[
	"toy'meH jIHtaH.",
	"jIvum, jIbech, 'ach SaH pagh.",
	"Dal 'oH. qaD 'oHbe'...",
	"pItlh",
	"",
	"",
	"",
	"",
	""
]);
 
 
//If no one talks for a minute or more, he becomes boredLines
//and sends messages of his own
module.exports.boredLines = JSON.stringify(
[
	"test bored",
	"bored test",
	"boring",
	"waiting",
	"nothing to do"
]);