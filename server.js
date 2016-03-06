#!/usr/bin/env node

var Server  = require('ws').Server,
    s       = new Server({port: 8899}),
    Mirobot = require('./lib/mirobot.js').Mirobot,
    m       = new Mirobot();

s.on('connection', function(ws) {
  console.log("New Connection");
  
  var respond = function(msg){
    ws.send(JSON.stringify(msg));
  }
  
  ws.on('message', function(data, flags) {
    msg = JSON.parse(data)
    m.handle_msg(msg, respond);
  });
});