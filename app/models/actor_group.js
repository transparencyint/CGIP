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

    // remove the actor from the array
    this.actors.on('remove', this.removeFromGroup, this);
  },

  // adds an actor to this group
  addToGroup: function(actor){
    var actors = this.get('actors') || [];
    var alreadyAdded = _.contains(actors, actor.id);
    if(!alreadyAdded){
      // add actor to the model
      actors.push(actor.id);

      // add actor to the models' collectios
      this.actors.add(actor);
    }
  },

  removeFromGroup: function(){
    this.set('actors', this.actors.pluck('_id'));
    this.save();
  }
});