/*
   Just one big string.
   Use <BR> as newline, it will be replaced within the beq engine
*/

module.exports.cmdlist = ''
+ '(You can call this list with !cmdlist, !QaH or !help)<BR>'
+ '**How to interact with beq**<BR><BR>'
+ 'beq will by definition "read" every message, but reacts only to those that start with'
+ 'a specific character: !, ?, or in some special cases % or $ (ignore those for now)<BR><BR>'
+ 'Generally speaking ! is for normal functions, while ? is a specialized shorthand for translations. Both are available everywhere.<BR><BR>'
+ '**Translation:**<BR>'
+ 'If you want to look for a klingon word, you can simply enter<BR>'
+ '?tlh klingon-word<BR>'
+ 'and beq will try to find the correct translation.<BR>'
+ 'If you want to find the translation of an english or german word, you have to replace the "tlh" with either "en" or "de".<BR><BR>'
+ 'For more control of the output and search, use the following parameters - except for the first one, the order doesn\'t matter:<BR>'
+ 'de/en - give the german/english translation. Default is english<BR>'
+ 'case - enforce case sensitivity, default for klingon<BR>'
+ 'fuzzy - use "fuzzy" searching, i.e. accept results that CONTAIN the word (e.g. "ngan" would also bring "tlhIngan")<BR>'
+ 'type=(n,v,adv,sen,ques,...) - search only for specific word types, use the notation of boQwI\'<BR>'
+ 'startRes=nn - start with the nnth result (by default only the first 20 results are shown)<BR>'
+ '**Note:** If you are looking for a phrase, you have to replace the blanks ( ) with underscore (_) - otherwise the program cannot know if'
+ ' the word is part of the command or what you\'re looking for.<BR>'
+ '<BR>'
+ '<BR>'
+ '**Utilities**<BR>'
+ '(these all use !)<BR>'
+ '*KWOTD*<BR>'
+ 'Shows a random Klingon Word Of The Day, just like the timed version.<BR>'
+ '(n,v,adv,sen,ques,...) - if you want to get a specific type of word, just add it to the command (separated by a blank)<BR><BR>'
+ '*Numbers to Words (and back)*<BR>'
+ 'n2w any-number-you-like - this will "translate" the number to a word, so 123 will become "wa\'vatlh cha\'maH wej"<BR>'
+ 'w2n any-number-word-you-like - this will "translate" a number word back to the value (<- currently broken) '
+ '<BR>'
+ '*Wiki, Canon, Mailing list*<BR>'
+ 'Unfortunately, beq cannot read these websites. But he can generate a link for you, so all you have to do is click it!<BR>'
+ 'wiki en/de word-you\'re-looking-for If you don\'t supply either de or en, de will be taken by default.<BR>'
+ 'canon/mlist word-you\'re-looking-for<BR>'
+ '<BR>'
+ '*Categorization*<BR>'
+ 'TO BE ADDED'
+ '<BR>'
+ '<BR>'
+ '**Other stuff**<BR>'
+ 'yIngu\' - beq will identify itself.<BR>'
+ '          Name, version, date/time it started, version of boQwI\' database used, etc...<BR>'
+ '          Useful to see if a new version is active, or how new or old the database is.<BR>'
+ '          Also identifies itself as devBeq if it is.<BR><BR>'
+ 'Le\'rat<BR>'
+ 'Rumors say that this may be beq\'s true name. Try it! :-)'
