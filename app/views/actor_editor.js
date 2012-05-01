var View = require('./view');
var Actors = require('models/actors');
var ActorView = require('./actor_view');
var ConnectionView = require('./connection_view');

module.exports = View.extend({
  id: 'actor_editor',
  
  template: require('./templates/actor_editor'),
  
  initialize: function(){

  },
  
  render: function(){
    var editor = this;
    
    this.collection.forEach(function(model){
      var actor = new ActorView({ model : model });
      actor.render();
      editor.$el.append(actor.el);
    });
    //console.log(this.collection.length);

    this.collection.forEach(function(model){
      var connections = model.get('connections');
      var to = editor.collection.find(function(searchedModel){
        var found = false;

        for(var i = 0; i<connections.length; i++){
          if(searchedModel.id == connections[i].to){
            found = true;
            break;
          }
        }

        return found;
      });

      if(to){
        var connection = new ConnectionView({ from : model, to: to });
        connection.render();  
        editor.$el.append(connection.el);
      }
        
    });

  },
});
