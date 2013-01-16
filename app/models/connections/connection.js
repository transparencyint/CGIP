var Model = require('models/model');

module.exports = Model.extend({
  lockable: true,
  
  url: function(){
    if(!this.has('country')) throw('In order to create a connection you have to specify a country.');
    var url = '/' + this.get('country') + '/connections';
    if(this.id)
      url += '/' + this.id
    return url;
  },

  defaults: function(){
    return {
      type: 'connection',
      from: null,
      to: null,
      source: null,
      hasCorruptionRisk: false
    }
  },

  validate: function(attributes){
    if(attributes.from == attributes.to)
      return 'A connection has to have two different actors. Or at least one set to "none".';
  },

  pickOutActors: function(actors, actorGroups){
    var connection = this;

    if(this.has('to')){
      var toActor = actors.get(this.get('to')) || actorGroups.get(this.get('to'));
      if(toActor)
        connection.setToActor(toActor);
    }
    
    if(this.has('from')){
      var fromActor = actors.get(this.get('from')) || actorGroups.get(this.get('from'));;
      if(fromActor)
        connection.setFromActor(fromActor);
    }
  },

  _setActor: function(field, actor){
    if(!actor.id) throw('In order to set an actor for a connection, the actor needs an id!', actor);

    if(this[field] != null)
      this[field].off(null, null, this);
    
    this[field] = actor;
    this.set(field, actor.id);
    this[field].on('destroy', this._destroy, this);
    this[field].on('moveToGroup', this._destroy, this);
  },

  _destroy: function(){
    this.destroy();
  },

  setFromActor: function(actor){
    this._setActor('from', actor);
  },

  setToActor: function(actor){
    this._setActor('to', actor);
  }

});