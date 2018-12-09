/*
   Just one big string.
   Use <BR> as newline, it will be replaced within the beq engine
*/

module.exports.cmdlist = 'ping - simple response test, replies "pong"<BR>'
+ 'tlhIngan - replies "maH!"<BR>'
+ 'yIngu\' - Name and version of the bot & database version<BR>'
+ 'CMDLIST - this here (also called when you use "help")<BR>'
+ 'Le\'rat<BR>'
+ '<BR>'
+ 'setTLang - set your translation language to the argument, i.e. "setTLang en" for english translations<BR>'
+ 'setFuzzy on/off<BR>'
+ 'showMySettings<BR>'
+ 'setDefaultTLang de/tlh/en<BR>'				 
+ 'KWOTD one parameter: word type as in boQwI\'<BR>'
+ 'n2w, w2n Number to Word, Word to Number: translates for example 123 into wa\'vetlh cha\'maH wej and vice versa<BR>'
+ '<BR>'
+ 'mugh - translation lookup, uses the boQwI\' database to find the search item.<BR>'
+ '       Multiple words have to be separated by a _!<BR>'
+ '       Example: !mugh (tlh|de|en) (klingon, english or german word) [tlh,de,en] [fuzzy] [case] [startRes=nn] [type=(n,v,adv,sen,ques,...)]<BR>'
+ '       the first parameter has to be the language the word you want translated is in. Mandatory<BR>'
+ '       the second parameter is the word, or phrase, you\'re looking for, also mandatory<BR>'
+ '       [tlh,de,en] - the language you want the translation to be in. If none is supplied, the default (yours, if defined) is used. If uses, must be the third parameter<BR>'
+ '       the rest of the parameters are optional and be used in any order or not at all<BR>'				 
+ '       [fuzzy] - normally only exact matches are returned. If you want to find anything that contains the term, add the keyword fuzzy<BR>'
+ '       [case] - by default, case is NOT ignored. If you want to ignore case, add this keyboard. Not applicable to klingon<BR>'
+ '       [startRes=nn] - the number of results is limited to 20, if you had a previous search and want to see the next 20 entries,<BR>'
+ '                       add this parameter with the number or results you want to skip<BR>'
+ '       [type=(n,v,adv,sen,ques,...)] - the program will look for ANY word that fits your search term, with this you can limit it. Uses the notation of boQwI\'<BR>'
+ '<BR>'
+ 'yIqaw - Remember! Adds a note in the "Letter to Maltz" channel, so we can ask for clarification/words when the opportunity shows itself.<BR>'
+ '<BR>'
+'<BR>';
