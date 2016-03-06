var Mirobot = function(){
  var self = this;
  
  var immediate = ['version', 'collideNotify', 'followNotify', 'collide', 'follow', 'ping', 'pause', 'resume']
  
  this.handle_msg = function(msg, cb){
    console.log(msg);
    // Send an accepted message if necessary
    if(immediate.indexOf(msg.cmd) < 0) cb({status: 'accepted', id: msg.id});
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
    if(this.delayTimeout) clearTimeout(this.delayTimeout)
    this.complete({id: msg.id}, 0, cb);
  }
  
  this.pause = function(msg, cb){
    if(this.delayTimeout) clearTimeout(this.delayTimeout)
    // work out how much time left to run
    this.delayDuration -= ((new Date()).getTime() - this.delayStart)
    console.log(this.delayDuration);
    this.complete({id: msg.id}, 0, cb);
  }
  
  this.resume = function(msg, cb){
    if(this.delayCb){
      // resume the paused function
      this.delayFn();
    }
    this.complete({id: msg.id}, 0, cb);
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
}

exports.Mirobot = Mirobot;