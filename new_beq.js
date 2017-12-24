
var beq = require('./beq_engine.js');

var beqTalk = JSON.parse(beq.beqTalkDef);
beqTalk.command = "yIngu'";

var talkBeq = beq.Engine(beqTalk);

console.log(talkBeq);