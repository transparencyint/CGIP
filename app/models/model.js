// Base class for all models.
module.exports = Backbone.Model.extend({
  // Should the model be lockable?
  lockable: false,

  initialize: function(values){
    Backbone.Model.prototype.initialize.call(this, values);

    this.registerLockEvents();
  }

  toJSON: function(){
    var data = Backbone.Model.prototype.toJSON.call(this);
    
    // remove the lock state
    delete data.locked;
    
    return data;
  },

  // Returns the current lock-state
  // TODO: add list of locked models
  isLocked: function(){
    return this.get('locked') === true;
  },

  // Locks the model
  lock: function(){
    this.set('locked', true);
    socket.emit('lock', this.id);
  },

  // unlocks the model
  unlock: function(){
    this.set('locked', false);
    socket.emit('unlock', this.id);
  },

  registerLockEvents: function(){
    if(socket && this.id && this.lockable == true){
      debugger
      var model = this;
      socket.on('lock:' + this.id, function(){ model.set('locked', true) });
      socket.on('unlock:' + this.id, function(){ model.set('locked', false) });
    }
  },

  unregisterLockEvents: function(){
    socket.removeAllListeners('lock:' + this.id);
    socket.removeAllListeners('unlock:' + this.id);
  }
});