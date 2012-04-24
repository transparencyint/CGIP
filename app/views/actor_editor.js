var View = require('./view');
var Actors = require('models/actors');
var ActorView = require('./actor_view');

module.exports = View.extend({
  id: 'actor_editor',
  
  template: require('./templates/actor_editor'),
  
  initialize: function(){
    this.collection = new Actors();
    
  },
  
  render: function(){
    var editor = this;
    
    this.collection.forEach(function(model){
      var actor = new ActorView({ model : model });
      actor.render();
      editor.$el.append(actor.el);
    });
    
  },
});
