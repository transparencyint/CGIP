var View = require('views/view');
var ConnectionView = require('views/connection_view');

var connectionTypes = {
  money: require('models/connections/money_connection'),
  accountability: require('models/connections/accountability_connection'),
  monitoring: require('models/connections/monitoring_connection')
};

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
  this.connection = new connectionTypes[this.connectionType]();
  this.connection.id = 1337;
  this.connection.from = new Backbone.Model();
  this.connection.to = new Backbone.Model();
  this.connection.disbursed = 0;
  this.connection.pledged = 0;
  this.connection.set('connectionType', this.connectionType);

  $(document).unbind(View.prototype.inputMoveEvent, this._moveDummy);
  $(document).unbind('keyup', this._keyUp);
};

ConnectionMode.prototype.actorSelected = function(actor){  
  //connection to the same actor (itself) is not possible
  if(this.connection.from !== actor.model){
    this.selectedActors.push(actor.model);
  }else
    return;
  
  if(this.selectedActors.length === 1){
    this.connection.from = actor.model;
    this.connection.to.set('pos', _.clone(this.connection.from.get('pos')));
    this.connection.to.margins = { top: 0, right:0, bottom:0, left:0 };
    this.connection.to.width = 0;
    this.connection.to.height = 0;
    this.connectionView = new ConnectionView({model: this.connection, editor: this.editor, noClick: true});
    this.connectionView.render();
    this.workspace.append(this.connectionView.el);
    $(document).bind(View.prototype.inputMoveEvent, this._moveDummy);
    $(document).bind('keyup', this._keyUp);
  
  }else if(this.selectedActors.length === 2){
    // unlock the first actor
    this.selectedActors[0].unlock();
    
    this.connection.to = actor.model;
    var mode = this;
    //check whether or not same from-to connection already exists
    var connectionAlreadyExists = false;
    this.collection.each(function(connection){
      if(connection.from === mode.connection.from && connection.to === mode.connection.to){
        connectionAlreadyExists = true;
        return false;
      }
    });

    if(!connectionAlreadyExists){
      var newConnection = new this.collection.model({
        country: this.selectedActors[0].get('country'),
        from: this.selectedActors[0].id,
        to: this.selectedActors[1].id
      });

      newConnection.showMetadataForm = true;

      newConnection.save(null, {
        success: function(){
          socket.emit('new_model', newConnection.toJSON());
          mode.collection.add(newConnection);
        }
      });
    }

    this.editor.deactivateMode()
    this.connectionView.destroy();
    this.reset();

    //TODO 
    //add a nice feedback notification to tell that this connection already Exists 
  }
};

ConnectionMode.prototype.cancel = function(){
  if(this.connectionView)
    this.connectionView.destroy();
  this.reset();
};

ConnectionMode.prototype._moveDummy = function(event){
  var pos = this.connection.to.get('pos');
  var dx = (View.prototype.normalizedX(event) - pos.x - this.editor.offset.left - this.editor.origin.left) / this.editor.zoom.value;
  var dy = (View.prototype.normalizedY(event) - pos.y - this.editor.offset.top - this.editor.origin.top) / this.editor.zoom.value;

  this.connection.to.set({
    pos: {
      x: pos.x + dx,
      y: pos.y + dy
    }
  });
};

ConnectionMode.prototype._keyUp = function(event){
  if(event.keyCode === 27) this.cancel(); // cancel on ESC
};

module.exports = ConnectionMode;