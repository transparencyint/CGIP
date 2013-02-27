var Actor = require('./actor');
var dialog = require('../views/dialog_view');

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
    this.margins = {top: 27, right: 72, bottom: 28, left: 72};

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
  tryAddToGroup: function(options){
    var actor = options.actor;
    var connections = options.connections;
    var success = options.success;
    var _this = this;
    var actors = this.get('actors') || [];
    var alreadyAdded = _.contains(actors, actor.id);

    if(actor.hasConnections(connections)){
      new dialog({ 
        title: t('Add to Group'),
        text: t('This will erase all related connections of both actors. Are you sure you want to proceed?'),
        verb: t('Erase Connections'),
        success: function(){ _this.AddToGroup(actor, success); }
      });
    } else if(!alreadyAdded){
      this.AddToGroup(actor, success);
    }
  },
    
  AddToGroup: function(actor, success){
    var actors = this.get('actors') || [];
    
    // remove it from its current collection, if there is one
    if(actor.collection)
      actor.collection.remove(actor);
      
    // add actor to the model
    actors.push(actor.id);
    
    // add actor to the models' collectios
    this.actors.add(actor);

    // trigger that the actor was moved to 'this' group
    // and also publish this to the other clients via the socket
    actor.trigger('moveToGroup', actor);
    socket.emit('moveToGroup', actor.id);

    success();
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
    var actorsLength = this.get('actors').length;
    if(actorsLength < 2 || (actorsLength > 1 && confirm(t('delete_all_group_actors')))){
      this.actors.each(function(actor){ actor.destroy({silent: true}); });
      Actor.prototype.destroy.call(this);
    }
  }

});