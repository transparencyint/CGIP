var Model = require('./model');

module.exports = Model.extend({
  lockable: true,

  url: function(){
    if(!this.has('country')) throw('In order to create an actor you have to specify a country.');
    var url = '/' + this.get('country') + '/actors';
    if(this.id)
      url += '/' + this.id
    return url;
  },

  defaults : {
    name: '',
    abbreviation: '',
    type: 'actor',
    hasCorruptionRisk: false,
    pos: {x: 0, y: 0},
    purpose: [],
    role: []
  },

  initialize: function(values){
    Model.prototype.initialize.call(this, values);
    
    this.margins = {top: 20, right: 60, bottom: 20, left: 60};
  },

  moveByDelta: function(dx, dy){
    var thisPos = _.clone(this.get('pos'));
    thisPos.x += dx;
    thisPos.y += dy;
    this.set('pos', thisPos);
  },

  turnIntoGroup: function(firstActor){
    // remove them both from their collections
    firstActor.collection.trigger('remove', firstActor);
    this.collection.remove(this);

    // simulate a destroy event in order to clean up the views
    // and also tell the other clients that it moved to a group
    firstActor.trigger('moveToGroup');
    socket.emit('moveToGroup', firstActor.id);
    
    // create the actor group from the data of this actor
    var ActorGroup = require('./actor_group');
    var newData = this.toJSON();
    delete newData._id;
    delete newData._rev;

    var newGroup = new ActorGroup(_.clone(newData));
    newGroup.set('actors', [firstActor.id]);
    newGroup.save().done(function(){
      socket.emit('new_model', newGroup.toJSON());
    });
    this.destroy();
    return newGroup;
  }

});