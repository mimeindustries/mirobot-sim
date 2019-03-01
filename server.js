#!/usr/bin/env node

var Server  = require('ws').Server,
    s       = new Server({port: 8899}),
    Mirobot = require('./lib/mirobot.js').Mirobot,
    m       = new Mirobot(),
    http    = require('http');

s.on('connection', function(ws) {
  console.log("New Connection");
  
  var respond = function(msg){
    try{
      ws.send(JSON.stringify(msg));
    }catch(err){
      console.dir("Connection closed");
    }
  }
  
  ws.on('message', function(data, flags) {
    msg = JSON.parse(data)
    m.handle_msg(msg, respond);
  });
});

// send request to the discovery server every 30 minutes
var sendDiscovery = function(name){
  name = name || 'Mirobot-sim';
  console.log("Sending discovery request for " + name);
  var post_options = {
    host: 'local.mirobot.io',
    port: '80',
    path: '/?address=localhost&name=' + name,
    method: 'POST'
  };

  var post_req = http.request(post_options, function(res) {
    res.on('data', function () {});
  });

  post_req.on('error', function(e){
    console.log("Error sending discovery request");
  });

  post_req.end();
}

sendDiscovery();
setInterval(sendDiscovery, 1800000);
/*
for(var i = 0; i< 5; i++){
  for(var j = 0; j< 10; j++){
    sendDiscovery('Room%20' + i + '%3AMirobot-' + j);
  }
}
*/