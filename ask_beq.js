/*
   "Translate" numbers to words and vice versa
*/

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
	   /*
	   tmpNum = digit2Word(oneNum);
	   tmpNum = getMultiWord(i) + tmpNum;
	   
	   tmpRet += tmpNum;
	   */
	   tmpRet += oneNum;
	   
	   curPos -= 1;
	}	
	
	return tmpRet;
	return 
}

function getMultiWord(numMulti)
{
	var tmpRet = "";
	var RNG = Math.random() * 100;
	
	
	switch(numMulti)
	{
	   case '0':
	    tmpRet = "";
	    break;
	   case '1':
	    tmpRet = 'maH';
	    break;
	   case '2':
	    tmpRet = 'vatlh';
		break;
	   case '3':
	    if (RNG > 50)
	      tmpRet = 'SaD';
	    else
		  tmpRet = 'SanID';
		break;
	   case '4':
	    tmpRet = 'netlh';
		break;
	   case '5':
	    tmpRet = 'bIp';
		break;
	   case '6':
	    tmpRet = "'uy'";
		break;
	}
	if (numMulti != '0' && tmpRet == "")
		tmpRet = '%%%';
	
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
tmpRet = tmpRet;
}
