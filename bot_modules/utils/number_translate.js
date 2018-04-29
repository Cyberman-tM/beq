/*
   "Translate" numbers to words and vice versa
   The resultant WORDS are always Number+multiplier, with no space between them, while the words themselves
   have a space:
   wa'vetlh cha'maH loS
   
   functions: Word2Num
              Num2Word
*/
module.exports.versInt = 'Number translator 0.5';

module.exports.Word2Num = function(numWord)
{
	//We expect numbers to be separated by spaces
	var words = numWord.split(" ");
	var tmpRet = 0;
	var tmpNum = 0;
	var tmpMul = 0;
	
	words.forEach(function(item)
	{		
		if (item.startsWith("wa'"))
		   tmpNum = 1;
	    else if (item.startsWith("cha'"))
   		   tmpNum = 2;
	    else if (item.startsWith("wej"))
   		   tmpNum = 3;
	    else if (item.startsWith("loS"))
   		   tmpNum = 4;
	    else if (item.startsWith("vagh"))
   		   tmpNum = 5;
	    else if (item.startsWith("jav"))
   		   tmpNum = 6;
	    else if (item.startsWith("Soch"))
   		   tmpNum = 7;
	    else if (item.startsWith("chorgh"))
   		   tmpNum = 8;
	    else if (item.startsWith("Hut"))
   		   tmpNum = 9;
	   
	   tmpMul = 1;
	   if (item.endsWith("maH"))
		   tmpMul = 10;
	   else if (item.endsWith("vatlh"))
		   tmpMul = 100;
	   else if (item.endsWith("SaD") || item.endsWith("SanID"))
		   tmpMul = 1000;
	   else if (item.endsWith("netlh"))
		   tmpMul = 10000;
	   else if (item.endsWith("bIp"))
		   tmpMul = 100000;
	   else if (item.endsWith("'uy'"))
		   tmpMul = 1000000;
	   
	   tmpRet += tmpNum * tmpMul;
	});
	
	return tmpRet;
}

module.exports.Num2Word = function(number)
{
	var numString = number.toString();
	var strLen = numString.length;
	var curPos = strLen - 1;
	var oneNum = '';
	var tmpRet = "";
	var tmpNum = "";
	
	if (strLen == 0)
	   return 'pagh';
	
	for(i = 0; i < strLen; i++)
	{
  	   oneNum = numString.substr(curPos, 1);


       tmpNum = digit2Word(oneNum);
       tmpNum += getMultiWord(i);
	
	   //Bei mehr als einer Zahl darf der Text nicht mit pagh beginnen
	   if (!(strLen > 1 && oneNum == '0'))
          tmpRet = tmpNum + ' ' + tmpRet;

	   curPos -= 1;
	}
	
	//Check i (number of tens), if > 1M => use lower + uy?
	
	//Numbers bigger than 10 million don't work :-(
	if (number > 10000000)
		tmpRet += '(Numbers this big may be incorrectly translated!)';
	
	return tmpRet;
}

function getMultiWord(numMulti)
{
	var tmpRet = "";
	var RNG = Math.random() * 100;	
	
	switch(numMulti)
	{
	   case 0:
	    tmpRet = "";
	    break;
	   case 1:
	    tmpRet = 'maH';
	    break;
	   case 2:
	    tmpRet = 'vatlh';
		break;
	   case 3:
	    if (RNG > 50)
	      tmpRet = 'SaD';
	    else
		  tmpRet = 'SanID';
		break;
	   case 4:
	    tmpRet = 'netlh';
		break;
	   case 5:
	    tmpRet = 'bIp';
		break;
	   case 6:
	    tmpRet = "'uy'";
		break;
	}

	return tmpRet;
}

function digit2Word(Num)
{
   var tmpRet = "";
   
   switch(Num)
   {
	case '0':
	   tmpRet =  "pagh";
	   break;
	case '1':
	   tmpRet =  "wa'";
	   break;
	case '2':
	   tmpRet =  "cha'";
	   break;
	case '3':
	   tmpRet =  "wej";
	   break;
	case '4':
	   tmpRet =  "loS";
	   break;
	case '5':
	   tmpRet =  "vagh";
	   break;
	case '6':
	   tmpRet =  "jav";
	   break;
	case '7':
	   tmpRet =  "Soch";
	   break;
	case '8':
	   tmpRet =  "chorgh";
	   break;
	case '9':
	   tmpRet =  "Hut";
	   break;
	case '10':
	   tmpRet =  "wa'maH";
	break;
   }
   if (tmpRet == "")
	   tmpRet = '%%%'; 
   
   return tmpRet;
}

function word2Digit(word)
{
   var tmpRet = "";
	switch(word)
	{
	case "pagh":
	   tmpRet = 0;
	   break;
	case "wa'":
	   tmpRet = 1;
	   break;
	case "cha'":
	   tmpRet = 2;
	   break;
	case "wej":
	   tmpRet = 3;
	   break;
	case "loS":
	   tmpRet = 4;
	   break;
	case "vagh":
	   tmpRet = 5;
	   break;
	case "jav":
	   tmpRet = 6;
	   break;
	case "Soch":
	   tmpRet = 7;
	   break;
	case "chorgh":
	   tmpRet = 8;
	   break;
	case "Hut":
	   tmpRet = 9;
	   break;
	case "wa'maH":
	   tmpRet = 10;
	break;
	}
	
return tmpRet;
}
