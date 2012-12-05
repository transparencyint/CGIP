var Actor = require('./actor');

module.exports = Actor.extend({  
  defaults: function(){
    return {
      actors: []
    };
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
  }
});