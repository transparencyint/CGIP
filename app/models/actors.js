var Actor = require('./actor');
var Collection = require('./collection');

module.exports = Collection.extend({
  model: Actor,
  urlPart: '/actors',
  initialize: function(){
    // call super initialize
    Collection.prototype.initialize.call(this);
    
  },

  /** returns a collection with all actor groups */
  filterGroups: function(){
    // todo: create custom collection and custom model
    var actorGroups = new Backbone.Collection();
    var actorCollection = this;

    // 1) iterate over all actors to filter out the groups
    this.each(function(actor){
      // remove the group from the actors collection and add it to the groups collection
      if(actor.has('actorType') && actor.get('actorType') === 'group'){
        actorCollection.remove(actor, {silent: true});
        actorGroups.add(actor.toJSON(), {silent: true});
      }
    });

    // 2) iterate over the actor groups and fill them with their actors
    actorGroups.each(function(actorGroup){
      // if the group has actors, find and add them
      if(actorGroup.has('actors') && actorGroup.get('actors').length > 0){
        // todo: create custom collection
        actorGroup.actors = new Backbone.Collection();
        actorGroup.actors.model = Actor;
        // find the actors, remove them from the normal collection and
        // add them to the actor group
        _.each(actorGroup.get('actors'), function(actorId){
          var actor = actorCollection.get(actorId);
          if(actor){
            actorCollection.remove(actor, {silent: true});
            actorGroup.actors.add(actor, {silent: true});
          }
        });
      }
    });

    return actorGroups;
  }
});