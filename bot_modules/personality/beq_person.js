/*
   Personality file
   (sounds grander than it is)
   
   A collection of lines beq may say, or react to   

*/
var beqLines = require('./beq_lines.js');
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

//A function that picks a line at random or returns an empty string
module.exports.getLine = function(lineType, addNewLine, addItalic, newLine, italics = '*')
{
	var tmpRet = "";
	var oneLine = "";
	var lineNum = 0;
	var myLines = "";
	
	//LineType - what kind of line? Idle, bored, whatever?
	if (lineType == 1)
		myLines = JSON.parse(beqLines.idleLines);
	else if (lineType == 2)
		myLines = JSON.parse(beqLines.boredLines);
	else if (lineType == 3)
		myLines = JSON.parse(beqLines.KWOTDLines);
	else if (lineType == 4)
		myLines = JSON.parse(beqLines.KWOTDFailure);
	else if (lineType == 5)
		myLines = JSON.parse(beqLines.MemorizeDone);
	else if (lineType == 6)
		myLines = JSON.parse(beqLines.ProclaimDone);
	
	if (myLines.length == 0)
		oneLine = "";
	else
	{
		lineNum = Math.floor(Math.random() * myLines.length);
		oneLine = myLines[lineNum];
	}
	
	//This applies to all types of lines
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
