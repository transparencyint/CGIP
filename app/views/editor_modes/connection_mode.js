var ConnectionView = require('views/connection_view');

var ConnectionMode = function(workspace, collection){
  this.workspace = workspace;
  this.collection = collection;
  this.reset();

  _.bindAll(this, '_moveDummy');
};

ConnectionMode.prototype.reset = function(){
  this.selectedActors = [];
  this.connection = new Backbone.Model();
  this.connection.id = 1337;
  this.connection.from = new Backbone.Model();
  this.connection.to = new Backbone.Model();
  this.isActive = true;

  $(document).unbind('mousemove', this._moveDummy);
};

ConnectionMode.prototype.actorSelected = function(actor){
  this.selectedActors.push(actor.model);
  
  if(this.selectedActors.length === 1){
    this.connection.from = actor.model;
    this.connection.to.set('pos', this.connection.from.get('pos'));
    this.connectionView = new ConnectionView({model: this.connection});
    this.connectionView.render();
    this.workspace.append(this.connectionView.el);
    $(document).bind('mousemove', this._moveDummy);
  
  }else if(this.selectedActors.length === 2){

    var newConnection = new this.collection.model({
      from: this.selectedActors[0].id,
      to: this.selectedActors[1].id
    });

    var mode = this;

    newConnection.save(null, {
      success: function(){
        mode.collection.add(newConnection);
      }
    });

    this.connectionView.destroy();
    this.reset();
  }
};

ConnectionMode.prototype.cancel = function(){
  this.reset();
};

ConnectionMode.prototype.abort = function(){
  this.cancel();
  this.isActive = false;
};

ConnectionMode.prototype._moveDummy = function(event){
  this.connection.to.set({
    pos: {
      x: event.clientX,
      y: event.clientY
    }
  });
};

module.exports = ConnectionMode;