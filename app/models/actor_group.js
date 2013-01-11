var Actor = require('./actor');

module.exports = Actor.extend({
  defaults: function(){
    return {
      actors: []
    };
  },

  initialize: function(){
    // todo: create custom collection
    this.actors = new Backbone.Collection();
    this.actors.model = Actor;

    // needed for calculations
    this.margins = {top: 20, right: 60, bottom: 20, left: 60};

    // remove the actor from the array
    this.actors.on('remove', this.removeFromGroup, this);
  },

  // adds an actor to this group
  addToGroup: function(actor){
    var actors = this.get('actors') || [];
    var alreadyAdded = _.contains(actors, actor.id);
    if(!alreadyAdded){
      // remove it from its current collection
      actor.collection.remove(actor);

      // add actor to the model
      actors.push(actor.id);

      // add actor to the models' collectios
      this.actors.add(actor);

      // trigger that the actor was moved to this group
      actor.trigger('moveToGroup', this);
    }
  },

  removeFromGroup: function(){
    this.set('actors', this.actors.pluck('_id'));
    this.save();
  }
});