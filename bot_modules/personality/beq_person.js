/*
   Personality file
   (sounds grander than it is)
   
   A collection of lines beq may say, or react to   

*/

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
}