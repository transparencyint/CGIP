// Base class for all models.
module.exports = Backbone.Model.extend({
  // Should the model be lockable?
  lockable: false,

  initialize: function(values){
    Backbone.Model.prototype.initialize.call(this, values);

    // check if model is in the initially locked models
    if(this.id){
      var id = this.id;
      var isLocked = _.find(lockedModels, function(model){ if(model) return model == id; });
      if(isLocked) this.set('locked', true);
    }

    this.registerRealtimeEvents();
  },

  // Generates a JSON representation of this model
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

  // Register all realtime events for this specific model
  registerRealtimeEvents: function(){
    if(window.socket && config.isRealtimeEnabled() && this.id && this.lockable == true){
      var model = this;
      socket.on('lock:' + this.id, function(){ model.set('locked', true) });
      socket.on('unlock:' + this.id, function(){ model.set('locked', false) });
      socket.on('change:' + this.id, function(attrs){ model.set(attrs); });
      // we can't call the normal model.destroy() here because it'll be already deleted on the server
      // instead we just trigger the destroy event, which will have the same effect
      socket.on('destroy:' + this.id, function(){ model.trigger('destroy'); });
      socket.on('moveToGroup:' + this.id, function(){ model.trigger('moveToGroup'); });
    }
  },

  // Remove the realtime listeners for this model
  unregisterRealtimeEvents: function(){
    if(window.socket){
      socket.removeAllListeners('lock:' + this.id);
      socket.removeAllListeners('unlock:' + this.id);
      socket.removeAllListeners('change:' + this.id);
      socket.removeAllListeners('destroy:' + this.id);
      socket.removeAllListeners('moveToGroup:' + this.id);
    }
  }
});