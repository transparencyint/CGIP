var ConnectionView = require('views/connection_view');
var ConnectionFormView = require('views/connection_form_view');

var ConnectionMode = function(workspace, collection, connectionType, editor){
  this.workspace = workspace;
  this.collection = collection;
  this.editor = editor;
  this.connectionType = connectionType;
  this.reset();

  _.bindAll(this, '_moveDummy', '_keyUp');
};

ConnectionMode.prototype.reset = function(){
  this.selectedActors = [];
  this.connection = new Backbone.Model();
  this.connection.id = 1337;
  this.connection.from = new Backbone.Model();
  this.connection.to = new Backbone.Model();
  this.connection.amount = 0;
  this.isActive = true;
  this.connection.set('connectionType', this.connectionType);

  $(document).unbind('mousemove', this._moveDummy);
  $(document).unbind('keyup', this._keyUp);
};

ConnectionMode.prototype.actorSelected = function(actor){
  this.selectedActors.push(actor.model);
  
  if(this.selectedActors.length === 1){
    this.connection.from = actor.model;
    this.connection.to.set('pos', this.connection.from.get('pos'));
    this.connectionView = new ConnectionView({model: this.connection, noClick: true});
    this.connectionView.render();
    this.workspace.append(this.connectionView.el);
    $(document).bind('mousemove', this._moveDummy);
    $(document).bind('keyup', this._keyUp);
  
  }else if(this.selectedActors.length === 2){

    var newConnection = new this.collection.model({
      country: this.selectedActors[0].get('country'),
      from: this.selectedActors[0].id,
      to: this.selectedActors[1].id
    });

    var mode = this;

    if(newConnection.get('connectionType') === 'money')
      newConnection.showMetadataForm = true;

    newConnection.save(null, {
      success: function(){
        mode.collection.add(newConnection);
      }
    });

    this.editor.deactivateMode()
    this.connectionView.destroy();
    this.reset();
  }
};

ConnectionMode.prototype.cancel = function(){
  if(this.connectionView)
    this.connectionView.destroy();
  this.reset();
};

ConnectionMode.prototype.abort = function(){
  this.cancel();
  this.isActive = false;
};

ConnectionMode.prototype.unselect = function(){
  this.cancel();
};

ConnectionMode.prototype._moveDummy = function(event){
  this.connection.to.set({
    pos: {
      x: event.clientX,
      y: event.clientY
    }
  });
};

ConnectionMode.prototype._keyUp = function(event){
  if(event.keyCode === 27) this.cancel(); // cancel on ESC
};

module.exports = ConnectionMode;