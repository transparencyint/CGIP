// Base class for all models.
module.exports = Backbone.Model.extend({

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
  }
  
});