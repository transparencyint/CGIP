var Actor = require('./actor');

module.exports = Actor.extend({

  // adds an actor to this group
  addToGroup: function(actor){
    var actors = this.get('actors') || [];
    var alreadyAdded = _.contains(actors, actor.id);
    if(!alreadyAdded){
      actors.push(actor.id);
      this.actors.add(actor);
      this.save();
    }
  }
});