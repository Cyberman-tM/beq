/*

  Recode text into a different "encoding".
  For example:
  tlhIngan Hol => xifan hol
  
  This is useful for the various pIqaD fonts that use "normal" letters for klingon glyphs
  
  uhmal gnj by Philip Newton
  https://metacpan.org/pod/Lingua::Klingon::Recode
  
  Now new: Dialect recoding!
  Now even newer: Recode to Unicode! (pIqaD)

*/
var winston = require('winston');
var logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

//List of prefixes, might be useful :-)
//uhmal2 encoded!
module.exports.prefixListu3 = "b3-b4-c2-c4-D1-D3-D5-f4-g3-i3-i5-j3-j5-k1-k5-l3-l5-o2-o3-q1-r2-S1-S5-t3-t5-w3-x3-y3";

module.exports.versInt = '1.0';
module.exports.nameInt = 'Text recoder (tlhIngan<>xIfan and more)';
module.exports.shortDesc = 'Encode between different variations of representing klingon characters.\r\n';
module.exports.shortHelp = 'recode *targetencoding*  text-to-encode\r\n';
module.exports.example = 'Example: "recode uhmal tlhIngan Hol" brings "uhmal gnj\r\n"';

module.exports.longHelp = 'Basic operation is simple: *recode* encoding text-to-encode\r\n' +
						  'The encoding is either the name of the possible encodings, or their special codeword for going back from encoded text to pure tlhIngan, if available.\r\n' +
						  'Ciphers (letter to letter exchange):' +
						  '\r\n' +
						  '* TIxan\r\n'+
						  '  A very basic encoding, tlh=>T, ch=>c, gh=>g, ng=>x, q=>k.\r\n' +
						  '  The rest remains the same, case remains as in klingon.\r\n' +
						  '  tixan <> T2tlh\r\n' +
						  '\r\n' +
						  '* xifan\r\n' +
						  '  Basically the same as tixan, but the tlh becomes an x, and the ng is turned into f.\r\n' +
						  '  Can be upper or lower case\r\n' +
						  '  xifan/XIFAN <> x2tlh \r\n' +
						  '\r\n' +
						  '* uhmal\r\n' +
						  '  A rather complex cipher, invented to solve the problem of automated sorting with klingon letters,\r\n' +
						  '  the result can be sorted with standard sorting methods while obeying klingon rules.\r\n' +
						  '  Rather hard to read, but useful in computing, see below.\r\n' +
						  '  uhmal <> u2tlh\r\n' +
						  '\r\n' +
						  '* uhmal2\r\n' +
						  '  Basically the same as regular uhmal, but vowels are replaced by numbers.\r\n' +
						  '  That way a quick check for syllables is easier (just check for number).\r\n' +
						  '  uhaml2 <> u22tlh\r\n' +
						  '\r\n' +
						  '* uhmal3\r\n' +
						  '  Going a step further, this also encodes consonant clusters into upper case letters A, E, I.\r\n' +
						  '  Probably only useful in computing, it ensures that a single klingon letter WILL BE a single letter.\r\n' +
						  '  uhmal3 <> u32tlh\r\n' +
						  '\r\n' +
						  '* Unicode (unicode)\r\n' +
						  '  Translates the characters into their (non-standard) unicode codepoints, so that you can see the pIqaD letters.\r\n' +
						  '  It should work with most if not all currently available fonts.\r\n' +
						  '  unicode <> n/a\r\n' +
						  '\r\n' +
						  'Dialects (more transformative than ciphers):\r\n' +
						  '\r\n' +
						  '* Krotmag (Qotmag)\r\n' +
						  '  "Translates" the text into Krotmag dialect, i.e. "Dabom" becomes "NaMoM".\r\n' +
						  '  Qotmag <> n/a\r\n' +
						  '\r\n' +
						  '* Tak\'ev (taq\'ev)\r\n' +
						  '  "Dabom" becomes "nDaMBom"\r\n' +
						  '  taq\'ev <> n/a\r\n' +
						  '\r\n' +
						  '* Morska (mo\'rISqa\')\r\n' +
						  '  "tlhIngan Hol majatlh" becomes "ghlIngan hol majats"\r\n' +
						  '  mo\'rISqa\' <> n/a\r\n' +
						  '\r\n' +
						  '\r\n';


///tlhIngan Hol => xifan hol or XIFAN HOL
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
};

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
};

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

	//Nicht umgesetzt: a, e, q, Q, D, r, S, t
	  
	  //tmpText = tmpText.toLowerCase();
	 return tmpText;
};

//tlhIngan => uhmal with numbers instead of vocals
//Usable for easier identifying of CVC - any V will be a number
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
	  
	  //tmpText = tmpText.toLowerCase();
	 return tmpText;
};

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
};

//uhmal3 - uhmal2 + consonant clusters rewritten as AEI
module.exports.RCtlh2u3 = function(orig_text)
{
	var tmpText = "";
	  tmpText = module.exports.RCtlh2u2(orig_text);

	tmpText = tmpText.replace(/(?<=[a-zA-Z][1-5])rf(?=[^1-5]|$)/g, 'A');
	tmpText = tmpText.replace(/(?<=[a-zA-Z][1-5])xz(?=[^1-5]|$)/g, 'E');
	tmpText = tmpText.replace(/(?<=[a-zA-Z][1-5])yz(?=[^1-5]|$)/g, 'I');
	
	return tmpText;
};

//uhmal3 => tlhIngan
module.exports.RCu32tlh = function(orig_text)
{
	var tmpText = "";
	
	tmpText = orig_text.replace(/A/g, 'rf');
	tmpText = tmpText.replace(/E/g, 'xz');
	tmpText = tmpText.replace(/I/g, 'yz');
	
	tmpText = module.exports.RCu22tlh(tmpText);
	
	return tmpText;
};

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
};

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
};

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
};

//Dialekte - http://www.klingonwiki.net/De/Dialekt

// ta' Hol => Krotmag
module.exports.RC2Qot = function(orig_text)
{
	var tmpText = "";
	tmpText = orig_text.replace(/m/g, 'M');
	tmpText = tmpText.replace(/b/g, 'M');
	tmpText = tmpText.replace(/D/g, 'N');
	
	return tmpText;
};

// ta' Hol => Tak'ev
module.exports.RC2taq = function(orig_text)
{
	var tmpText = "";
	tmpText = orig_text.replace(/b/g, 'MB');
	tmpText = tmpText.replace(/D/g, 'nD');
	
	return tmpText;
};

// ta' Hol => Morska
module.exports.RC2Morska = function(orig_text)
{
	var fullText = module.exports.RCtlh2u2(orig_text);
	var tmpText = "";

	//Satzzeichen sind leider ein PRoblem, die müssen weg
	fullText = fullText.replace('.', '');
	fullText = fullText.replace('!', '');
	fullText = fullText.replace('?', '');
	fullText = fullText.replace(';', '');
	fullText = fullText.replace(':', '');
	fullText = fullText.replace(',', '');
	
	var manyWords = fullText.split(' ');
	fullText = "";
	manyWords.forEach(function(tmpText)
	{
	var prefix = '';
	if (tmpText.length >= 5)
	{
		if (parseInt(tmpText.substring(3,4)) > 0 &&
		    module.exports.prefixListu3.indexOf(tmpText.substring(0,2)) != -1 )
		{
			prefix = tmpText.substring(0,2);
			tmpText = tmpText.substring(2,9999);	
		}		
		prefix = prefix.replace('g', '6');
	}
	
	tmpText = tmpText.replace(/(?<=[1-5])g/g, '');
        tmpText = tmpText.replace(/g(?=[1-5])/g, '6');
	
	tmpText = tmpText.replace(/Q(?=[1-5])/g, '7');	
	tmpText = tmpText.replace(/u(?=[1-5])/g, '8');
	
	tmpText = tmpText.replace(/(?<=[1-5])u/g, '9');
	
	tmpText = prefix + tmpText;
	
	tmpText = module.exports.RCu22tlh(tmpText);
	
	tmpText = tmpText.replace(/6/g, 'h');
        tmpText = tmpText.replace(/7/g, 'H');
	tmpText = tmpText.replace(/8/g, 'ghl');
	tmpText = tmpText.replace(/9/g, 'ts');
		
	//Morska verwendet das Topifizierungs-Suffix nicht
	tmpText = tmpText.replace(/(?=.*)\'e\'/g, '');		
	
	fullText = fullText + " " + tmpText;
	});
	return fullText;
};


//NEU: Unicode
module.exports.RCtlh2Uni = function(orig_text)
{
   tmpText = "";
   //Konvertierung auf UHMAL -> jeder Buchstabe ein Buchstabe :-)
   tmpText = module.exports.RCtlh2u(orig_text);


   tmpText = tmpText.replace(/o/g, '\uF8DE');
   tmpText = tmpText.replace(/n/g, '\uF8DD');
   tmpText = tmpText.replace(/l/g, '\uF8DB');	
   tmpText = tmpText.replace(/j/g, '\uF8D9');
   tmpText = tmpText.replace(/g/g, '\uF8D6');
   tmpText = tmpText.replace(/m/g, '\uF8DC');			  
   tmpText = tmpText.replace(/h/g, '\uF8D7');       //Kein klingonischer Buchstabe!
   tmpText = tmpText.replace(/c/g, '\uF8D2');
   tmpText = tmpText.replace(/u/g, '\uF8E4');
   tmpText = tmpText.replace(/v/g, '\uF8E5');
   tmpText = tmpText.replace(/w/g, '\uF8E6');
   tmpText = tmpText.replace(/k/g, '\uF8DA');       //Kein klingonischer Buchstabe!
   tmpText = tmpText.replace(/f/g, '\uF8D5');       //Kein klingonischer Buchstabe!
   tmpText = tmpText.replace(/i/g, '\uF8D8');       //Kein klingonischer Buchstabe!
   tmpText = tmpText.replace(/z/g, '\uF8E9');       //Kein klingonischer Buchstabe!
   tmpText = tmpText.replace(/y/g, '\uF8E8');
   tmpText = tmpText.replace(/x/g, '\uF8E7');       //Kein klingonischer Buchstabe!
   tmpText = tmpText.replace(/d/g, '\uF8D3');

   tmpText = tmpText.replace(/a/g, '\uF8D0');
   tmpText = tmpText.replace(/e/g, '\uF8D4');
   tmpText = tmpText.replace(/q/g, '\uF8DF');
   tmpText = tmpText.replace(/Q/g, '\uF8E0');
   tmpText = tmpText.replace(/D/g, '\uF8D3');
   tmpText = tmpText.replace(/r/g, '\uF8E1');
   tmpText = tmpText.replace(/S/g, '\uF8E2');
   tmpText = tmpText.replace(/t/g, '\uF8E3'); 

   return tmpText;
};