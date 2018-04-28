/*
   Copied from https://github.com/devsnek/googlebot/tree/master
   (and adapted for my uses)
*/
module.exports = (beqTalk) => {
var klingon = '';
var english = '';
var german = '';
var color = 0;

var video;
var image;
var link;

if (beqTalk.gotResult == false)
    return "Nothing found.";
else
{

var resText  = "{color: color, description: 'Experimental translation result', link, video: { video }, image: { image },";
    resText += "fields:[{ name: 'type', value: item.type, inline: false}";
	
beqTalk.result.forEach(function (item)
{
            resText += ",{name: 'tlhingan', value:" + item.tlh + ", inline: true }";
	    resText += ",{name:'english',   value:" + item.en + ", inline: true}";
            resText += ",{name:'german',    value:" + item.de + ", inline: true}";
});
resText += "], footer: { text: 'foot'}}";
}
return JSON.parse(resText);
};
