var Mirobot = function(){
  var self = this;
  
  var moveCal = -1.0;

  var immediate = ['version', 'collideNotify', 'followNotify', 'collide', 'follow', 'ping', 'pause', 'resume', 'stop', 'moveCalibration', 'calibrateMove', 'turnCalibration', 'calibrateTurn', 'slackCalibration', 'calibrateSlack', 'resetCalibration']
  
  this.handle_msg = function(msg, cb){
    console.log(msg);
    if(immediate.indexOf(msg.cmd) < 0){
      if(this.delayCb){
        // We're already waiting for a command to execute
        return cb({status: 'error', msg:"Previous command not finished", id: msg.id});
      }else{
        // Send an accepted message
        cb({status: 'accepted', id: msg.id});
      }
    }
    // Handle the message
    if(typeof this[msg.cmd] !== 'undefined'){
      this[msg.cmd](msg, cb);
    }else{
      this.immediateComplete(msg, cb);
    }
  }
  
  this.immediateComplete = function(msg, cb){
    this.complete({id: msg.id}, 0, cb);
  }
  
  this.delayCb = undefined;
  this.delayTimeout = undefined;
  this.delayStart = undefined;
  this.delayDuration = undefined;
  this.delayFn = function(cb, delay){
    if(typeof cb !== 'undefined') this.delayCb = cb;
    if(typeof delay !== 'undefined') this.delayDuration = delay;
    this.delayStart = (new Date()).getTime();
    this.delayTimeout = setTimeout(function(){
      self.delayCb();
      self.delayCb = undefined;
    }, this.delayDuration);
  }
  
  this.complete = function(msg, delay, cb){
    msg.status = 'complete';
    if(delay > 0){
      this.delayFn(function(){ cb(msg) }, delay);
    }else{
      cb(msg);
    }
  }
  
  this.version = function(msg, cb){
    this.complete({msg: "2.0.9", id: msg.id}, 0, cb);
  }
  
  this.forward = function(msg, cb){
    this.complete({id: msg.id}, msg.arg * 30, cb);
  }
  this.back = this.forward;
  this.left = this.forward;
  this.right = this.forward;
  
  this.penup = function(msg, cb){
    this.complete({id: msg.id}, 250, cb);
  }
  this.pendown = this.penup;
  
  this.beep = function(msg, cb){
    this.complete({id: msg.id}, msg.arg, cb);
  }
  
  this.stop = function(msg, cb){
    this.complete({id: msg.id}, 0, cb);
    if(this.delayTimeout){
      clearTimeout(this.delayTimeout)
      this.delayTimeout = null;
      this.delayCb && this.delayCb();
      this.delayCb = null;
    }
  }
  
  this.pause = function(msg, cb){
    if(this.delayTimeout) clearTimeout(this.delayTimeout)
    // work out how much time left to run
    this.delayDuration -= ((new Date()).getTime() - this.delayStart)
    this.complete({id: msg.id}, 0, cb);
  }
  
  this.resume = function(msg, cb){
    if(this.delayCb){
      // resume the paused function
      this.delayFn();
    }
    this.complete({id: msg.id}, 0, cb);
  }

  this.slackCalibration = function(msg, cb){
    this.complete({id: msg.id, msg:"10"}, 0, cb);
  }

  this.moveCalibration = function(msg, cb){
    this.complete({id: msg.id, msg: moveCal}, 0, cb);
  }

  this.calibrateMove = function(msg, cb){
    moveCal = Number(msg.arg);
    this.immediateComplete(msg, cb);
  }

  this.turnCalibration = function(msg, cb){
    this.complete({id: msg.id, msg:"1.0"}, 0, cb);
  }

  this.resetCalibration = function(msg, cb){
    moveCal = -1.0;
    this.immediateComplete(msg, cb);
  }

  this.collideState = function(msg, cb){
    state = ['none', 'left', 'right', 'both'][Math.floor(Math.random() * 4)]
    this.complete({id: msg.id, msg: state}, 0, cb);
  }

  this.followState = function(msg, cb){
    state = Math.floor(Math.random() * 100) - 50;
    this.complete({id: msg.id, msg: state}, 0, cb);
  }

  this.notify = function(type, value, cb){
    cb({status: 'notify', id: type, msg: value});
  }

  this.notifyCollide = false;
  this.collideTimeout = undefined;
  
  this.collideNotifier = function(cb){
    if(self.notifyCollide){
      state = ['left', 'right', 'both'][Math.floor(Math.random() * 3)]
      this.notify('collide', state, cb);
      this.collideTimeout = setTimeout(function(){ self.collideNotifier(cb) }, Math.floor(Math.random() * 5000));
    }
  } 
  
  this.collideNotify = function(msg, cb){
    this.complete({id: msg.id}, 0, cb);
    this.notifyCollide = (msg.arg === 'true');
    if(this.notifyCollide){
      setTimeout(function(){ self.collideNotifier(cb) }, Math.floor(Math.random() * 5000));
    }else{
      clearTimeout(this.collideTimeout);
    }
  }
  
  this.notifyFollow = false;
  this.followTimeout = undefined;
  
  this.followNotifier = function(cb){
    if(self.notifyFollow){
      state = Math.floor(Math.random() * 100) - 50;
      this.notify('follow', state, cb);
      this.followTimeout = setTimeout(function(){ self.followNotifier(cb) }, Math.floor(Math.random() * 5000));
    }
  } 
  
  this.followNotify = function(msg, cb){
    this.complete({id: msg.id}, 0, cb);
    this.notifyFollow = (msg.arg === 'true');
    if(this.notifyFollow){
      setTimeout(function(){ self.followNotifier(cb) }, Math.floor(Math.random() * 5000));
    }else{
      clearTimeout(this.followTimeout);
    }
  }

  this.startWifiScan = function(msg, cb){
    this.complete({id: msg.id}, 0, cb);
    setTimeout(() => {
      this.notify('wifiScan', [["SKY76A2F",true,-63],["VM0993366",true,-92],["Virgin Media",true,-86],["BTWifi-with-FON",false,-94],["devolo-bcf2afd3b9a6",true,-89]], cb);
    }, 500);
    setTimeout(() => {
      this.notify('wifiScan', [["25Villiers",true,-42],["DIRECT-C6-HP ENVY 4520 series",true,-82],["Denzel.b",false,-53],["VM7965307",true,-73],["VM3525088",true,-92]], cb);
    }, 700);
    setTimeout(() => {
      this.notify('wifiScan', [["VM4690183",true,-77],["VM7917781",true,-85],["VM215626-2G",true,-74],["BTHub6-6WR8",true,-85],["virginmedia6360480",true,-90]], cb);
    }, 900);
    setTimeout(() => {
      this.notify('wifiScan', [["VM1875496",true,-78]], cb);
    }, 1100);
  }

  this.getConfig = function(msg, cb){
    this.complete({id: msg.id, msg: {"sta_ssid":"","sta_dhcp":true,"sta_rssi":31,"sta_ip":"0.0.0.0","ap_ssid":"Mirobot-2EDA","ap_encrypted":false,"wifi_mode":"APSTA"}}, 0, cb);
  }
}

exports.Mirobot = Mirobot;