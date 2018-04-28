/*
   Personality file
   (sounds grander than it is)
   
   A collection of lines beq may say, or react to   

*/
var logger = require('winston');
module.exports.versInt = '0.1';
module.exports.nameInt = 'beq Personality';

//Text that is to be added to yIngu' only
module.exports.yIngu = '*naDev jItoy\'taHpa\', SuvwI\'\'a\' jIH\'e\'.\nle\'rat, tIghnar tuq, jIH.\n\n toH. yInvetlh \'oHta\'*\n';

//This function will be called during bot command interpretation, and can be used to give the bot specific commands that are about his personalbar
//i.e. call him by name and have him react
module.exports.checkCMD = function(command)
{
	var tmpRet = false;
	switch (command)
	{
		case 'le\'rat':
		case 'Le\'rat':
			tmpRet = 'Qo\'! pongwIj \'oHbe\'! DaH, *beq* HIpong jay\'!\n';
		break;
	}

	return tmpRet;
};

//A JSON string containing an array with lines beq can say whenever he likes (usually after a translation)
//Use <BR> as linebreak - this WILL be replaced with a fitting newline character.
module.exports.idleLines = JSON.stringify(
[
	"toy'meH jIHtaH.",
	"jIvum, jIbech, 'ach SaH pagh.",
	"Dal 'oH. qaD 'oHbe'...",
	"pItlh",
	""
]);
 
//A function that picks a line at random or returns an empty string
module.exports.getLine = function(lineType, addNewLine, addItalic, newLine, italics = '*')
{
	var tmpRet = "";
	var oneLine = "";
	
	//LineType - what kind of line? Idle, bored, whatever?
	if (lineType == 1)
	{
		var myLines = JSON.parse(module.exports.idleLines);
		if (myLines.length == 0)
			oneLine = "";
		else
		{
			var lineNum = Math.floor(Math.random() * myLines.length);
			oneLine = myLines[lineNum];
		}
	}
	
	if (oneLine != "")
	{
		tmpRet = oneLine.replace("<BR>", newLine);
		
		if (addItalic == true)
			tmpRet = italics + tmpRet + italics;
		
		if (addNewLine == true)
			tmpRet += newLine;
	}
	
   return tmpRet;
}
