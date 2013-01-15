// Base class for all models.
module.exports = Backbone.Model.extend({
  // Should the model be lockable?
  lockable: false,

  initialize: function(values){
    Backbone.Model.prototype.initialize.call(this, values);

    // check if model is in the initially locked models
    if(this.id){
      var id = this.id;
      var isLocked = _.find(lockedModels, function(model){ return model.model_id == id; });
      if(isLocked) this.set('locked', true);
    }

    this.registerLockEvents();
  },

  toJSON: function(){
    var data = Backbone.Model.prototype.toJSON.call(this);
    
    // remove the lock state
    delete data.locked;
    
    return data;
  },

  // Returns the current lock-state
  // TODO: add list of locked models
  isLocked: function(){
    return this.lockable && this.get('locked') === true;
  },

  // Locks the model
  lock: function(){
    socket.emit('lock', this.id);
  },

  // unlocks the model
  unlock: function(){
    socket.emit('unlock', this.id);
  },

  registerLockEvents: function(){
    if(socket && this.id && this.lockable == true){
      var model = this;
      socket.on('lock:' + this.id, function(){ model.set('locked', true) });
      socket.on('unlock:' + this.id, function(){ model.set('locked', false) });
      socket.on('change:' + this.id, function(attrs){ model.set(attrs); });
      // we can't call the normal model.destroy() here because it'll be already deleted on the server
      // instead we just trigger the destroy event, which will have the same effect
      socket.on('destroy:' + this.id, function(){ model.trigger('destroy'); });
    }
  },

  unregisterLockEvents: function(){
    socket.removeAllListeners('lock:' + this.id);
    socket.removeAllListeners('unlock:' + this.id);
    socket.removeAllListeners('change:' + this.id);
    socket.removeAllListeners('destroy:' + this.id);
  }
});