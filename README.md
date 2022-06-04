# beq

This repository contains:
1) Discord bot, based upon example bot: https://medium.com/@renesansz/tutorial-creating-a-simple-discord-bot-9465a2764dc0
2) rest-like service, "Ask beq" (somewhat discontinued - may not work as it should, so be careful)
3) Beq-Engine, does the actual work for the bot and Ask Beq.

Written in JS/Node.js

Feel free to make use of it.

# 1) A simple bot mainly used to look up klingon words in De'vIDs boQwI' database
Can look up words in any of the languages boQwI' supports, i.e. klingon, english, german. Delivers translation in requested language.

Can also deliver proverbs on demand (punnily named KWOTD, although it doesn't deliver a word but a phrase), also taken from boQwI'.

Actual work is done by the beq Engine, see #3.

# 2) A web service made with the "Restify" module (very nice to use!) which takes URL parameters and returns a JSON-Objekt.
(This is basically dead.)
Basically the same functionality as the bot, at least with regard to translation.
This is because:

# 3) The beq Engine - the part that actually reads the XML files and provides the words.
Look for the beqTalk-structure - all communication done with the beq Engine is done via that.
(Well, except for the translation method, that RETURNS a string, but it takes beqTalk in.)

The beq Engine reads in the XML, processes it into an internal format, and offers various functions, mostly the lookup of words in the dictionary.
The return can then either be processed by the caller, or given to the engine again to be formed into a human-readable string.


I'm currently using Heroku to host the bot and the service - if you do so too, a note of warning: don't put the web service and bot in the same app!
When the web service goes to sleep, it'll take the bot with it. You can use the same Github repository for two apps on Heroku.
