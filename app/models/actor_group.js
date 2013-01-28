var Actor = require('./actor');

module.exports = Actor.extend({
  defaults: function(){
    return {
      actors: [],
      actorType: 'group'
    };
  },

  initialize: function(options){
    Actor.prototype.initialize.call(this, options);
    // todo: create custom collection
    this.actors = new Backbone.Collection();
    this.actors.model = Actor;

    // needed for calculations
    this.margins = {top: 20, right: 60, bottom: 20, left: 60};

    // remove the actor from the array
    this.actors.on('remove', this.removeFromGroup, this);
  },

  // picks out all actors from the given collection
  pickOutActors: function(actorsCollection){
    var actorsInGroup = this.get('actors');
    if(actorsInGroup.length == 0) return; // no need to process if no actors in group
    
    var actorGroup = this;

    _.each(actorsInGroup, function(actorId){
      var foundActor = actorsCollection.get(actorId);
      if(foundActor){
        actorsCollection.remove(foundActor);
        actorGroup.actors.add(foundActor, {silent: true})
      }
    });
  },

  // adds an actor to this group
  addToGroup: function(actor){
    var actors = this.get('actors') || [];
    var alreadyAdded = _.contains(actors, actor.id);
    if(!alreadyAdded){
      // remove it from its current collection, if there is one
      if(actor.collection)
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
    if(!_.isEmpty(this.get('actors')))
      this.save();
  },

  turnIntoNormalActor: function(){
    var myData = this.toJSON();
    
    // delete actor group specific data
    delete myData.actors;
    delete myData.actorType;
    delete myData.locked;
    delete myData._id;
    delete myData._rev;
    
    // remove it from the collection
    if(this.collection)
      this.collection.remove(this);

    this.destroy();

    return new Actor(myData);
  },

  destroy: function(){
    if(confirm('This will also delete all included actors of this group. Proceed?')){
      this.actors.each(function(actor){ actor.destroy({silent: true}); });
      Actor.prototype.destroy.call(this);
    }
  }
});