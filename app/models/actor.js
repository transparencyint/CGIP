var Model = require('./model');
var Dialog = require('../views/dialog_view');

module.exports = Model.extend({
  lockable: true,

  url: function(){
    if(!this.has('country')) throw(t('In order to create an actor you have to specify a country.'));
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
    organizationType: '',
    purpose: [],
    role: []
  },

  initialize: function(values){
    Model.prototype.initialize.call(this, values);
    
    this.margins = {top: 27, right: 72, bottom: 28, left: 72};
  },

  moveByDelta: function(dx, dy){
    var thisPos = _.clone(this.get('pos'));
    thisPos.x += dx;
    thisPos.y += dy;
    this.set('pos', thisPos);
  },

  hasConnections: function(connections){
    return  (connections.where({'from': this.id}).length > 0 || 
            (connections.where({'to': this.id})).length > 0);
  },

  turnIntoGroup: function(options){
    var firstActor = options.firstActor;
    var connections = options.connections;
    var success = options.success;
    var _this = this;
    
    // prevent the creation of a group if any of the actors has connections and the editor declines it
    if(this.hasConnections(connections) || firstActor.hasConnections(connections)){
      new Dialog({ 
        title: t('Add to Group'),
        text: t('This will delete all connections. Are you sure you want to proceed?'),
        verb: t('Proceed'),
        success: function(){ _this.formGroup(firstActor, success); }
      });
    } else {
      this.formGroup(firstActor, success);
    }
  },
  
  formGroup: function(firstActor, success){
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
    
    success(newGroup);
  }

});