/*

  Recode text into a different "encoding".
  For example:
  tlhIngan Hol => xifan hol
  
  This is useful for the various pIqaD fonts that use "normal" letters for klingon glyphs

*/

module.exports.versInt = '0.7';
module.exports.nameInt = 'Text recoder (tlhIngan<>xIfan and more)';

//tlhIngan Hol => xifan hol or XIFAN HOL
module.exports.RCtlh2x = function(orig_text, upper_case)
{
	var tmpText = "";
	//Is there a better way?
	tmpText = orig_text.replace(/tlh/g, 'x');
	tmpText = tmpText.replace(/ch/g, 'c');
	tmpText = tmpText.replace(/q/g, 'k');
	tmpText = tmpText.replace(/ng/g, 'f');
	tmpText = tmpText.replace(/gh/g, 'g');
	
	if (upper_case == true)
	   tmpText = tmpText.toUpperCase();
	else
	   tmpText = tmpText.toLowerCase();
   
   return tmpText;
}

//xifan hol => tlhIngan Hol
module.exports.RCx2tlh = function(orig_text)
{
	var tmpText = "";
	  tmpText = orig_text.toLowerCase();
	  //Restore upper case letters
	  tmpText = tmpText.replace(/d/g, 'D');
	  tmpText = tmpText.replace(/i/g, 'I');
	  tmpText = tmpText.replace(/h/g, 'H');
	  tmpText = tmpText.replace(/q/g, 'Q');
	  tmpText = tmpText.replace(/s/g, 'S');
	  
	  //Is there a better way?
	  tmpText = tmpText.replace(/x/g, 'tlh');
	  tmpText = tmpText.replace(/c/g, 'ch');
	  tmpText = tmpText.replace(/k/g, 'q');
	  tmpText = tmpText.replace(/g/g, 'gh');
	  tmpText = tmpText.replace(/f/g, 'ng');
	return tmpText;
}

//tlhIngan => uhmal
module.exports.RCtlh2u = function(orig_text)
{
	var tmpText = "";
	  tmpText = orig_text;
	  tmpText = tmpText.replace(/w/g, 'x');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/y/g, 'y');
	  tmpText = tmpText.replace(/'/g, 'z');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/I/g, 'h');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/j/g, 'i');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/gh/g, 'f');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/m/g, 'k');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/v/g, 'w');
	  tmpText = tmpText.replace(/u/g, 'v');
	  tmpText = tmpText.replace(/tlh/g, 'u');
	  tmpText = tmpText.replace(/ch/g, 'c');
	  tmpText = tmpText.replace(/ng/g, 'm');
	  tmpText = tmpText.replace(/H/g, 'g');
	  tmpText = tmpText.replace(/l/g, 'j');
	  tmpText = tmpText.replace(/n/g, 'l');
	  tmpText = tmpText.replace(/o/g, 'n');
	  tmpText = tmpText.replace(/p/g, 'o');
	  
	  tmpText = tmpText.toLowerCase();
	 return tmpText;
}
//tlhIngan => uhmal with numbers instead of vocals
module.exports.RCtlh2u2 = function(orig_text)
{
	var tmpText = "";
	  tmpText = orig_text;
	  tmpText = tmpText.replace(/w/g, 'x');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/y/g, 'y');
	  tmpText = tmpText.replace(/'/g, 'z');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/I/g, '3');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/j/g, 'i');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/gh/g, 'f');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/m/g, 'k');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/v/g, 'w');
	  tmpText = tmpText.replace(/u/g, '5');
	  tmpText = tmpText.replace(/tlh/g, 'u');
	  tmpText = tmpText.replace(/ch/g, 'c');
	  tmpText = tmpText.replace(/ng/g, 'm');
	  tmpText = tmpText.replace(/H/g, 'g');
	  tmpText = tmpText.replace(/l/g, 'j');
	  tmpText = tmpText.replace(/n/g, 'l');
	  tmpText = tmpText.replace(/o/g, '4');
	  tmpText = tmpText.replace(/p/g, 'o');
	  tmpText = tmpText.replace(/a/g, '1');
	  tmpText = tmpText.replace(/e/g, '2');
	  
	  tmpText = tmpText.toLowerCase();
	 return tmpText;
}

//uhmal2 => tlhIngan
module.exports.RCu22tlh = function(orig_text)
{
	var tmpText = "";
	  tmpText = orig_text;
	  tmpText = tmpText.replace(/o/g, 'p');
	  tmpText = tmpText.replace(/4/g, 'o');
	  tmpText = tmpText.replace(/l/g, 'n');	
	  tmpText = tmpText.replace(/j/g, 'l');
	  tmpText = tmpText.replace(/g/g, 'H');
	  tmpText = tmpText.replace(/m/g, 'ng');			  
	  tmpText = tmpText.replace(/3/g, 'I');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/c/g, 'ch');
	  tmpText = tmpText.replace(/u/g, 'tlh');
	  tmpText = tmpText.replace(/5/g, 'u');
	  tmpText = tmpText.replace(/w/g, 'v');
	  tmpText = tmpText.replace(/k/g, 'm');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/f/g, 'gh');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/i/g, 'j');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/z/g, '\'');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/y/g, 'y');
	  tmpText = tmpText.replace(/x/g, 'w');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/d/g, 'D');
	  tmpText = tmpText.replace(/1/g, 'a');
	  tmpText = tmpText.replace(/2/g, 'e');
	return tmpText;
}


//uhmal => tlhIngan
module.exports.RCu2tlh = function(orig_text)
{
	var tmpText = "";
	  tmpText = orig_text;
	  tmpText = tmpText.replace(/o/g, 'p');
	  tmpText = tmpText.replace(/n/g, 'o');
	  tmpText = tmpText.replace(/l/g, 'n');	
	  tmpText = tmpText.replace(/j/g, 'l');
	  tmpText = tmpText.replace(/g/g, 'H');
	  tmpText = tmpText.replace(/m/g, 'ng');			  
	  tmpText = tmpText.replace(/h/g, 'I');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/c/g, 'ch');
	  tmpText = tmpText.replace(/u/g, 'tlh');
	  tmpText = tmpText.replace(/v/g, 'u');
	  tmpText = tmpText.replace(/w/g, 'v');
	  tmpText = tmpText.replace(/k/g, 'm');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/f/g, 'gh');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/i/g, 'j');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/z/g, '\'');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/y/g, 'y');
	  tmpText = tmpText.replace(/x/g, 'w');       //Kein klingonischer Buchstabe!
	  tmpText = tmpText.replace(/d/g, 'D');
	return tmpText;
}

// tlhIngan => TIxan
module.exports.RCtlh2T = function(orig_text)
{
	var tmpText = "";
	//Very simple transcript, only tlh, ng, gh, ch are replaced
	tmpText = orig_text.replace(/ch/g, 'c');
	tmpText = tmpText.replace(/gh/g, 'g');
	tmpText = tmpText.replace(/ng/g, 'x');
	tmpText = tmpText.replace(/tlh/g, 'T');
	return tmpText;
}

// TIxan => tlhIngan
module.exports.RCT2tlh = function(orig_text)
{
	var tmpText = "";

	  //Very simple transcript, only tlh, ng, gh, ch are replaced
	  tmpText = orig_text.replace(/c/g, 'ch');
	  tmpText = tmpText.replace(/g/g, 'gh');
	  tmpText = tmpText.replace(/x/g, 'ng');
	  tmpText = tmpText.replace(/T/g, 'tlh');
	 return tmpText;
}
