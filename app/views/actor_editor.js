var View = require('./view');
var Actor = require('models/actor');
var Actors = require('models/actors');
var ActorView = require('./actor_view');
var ConnectionView = require('./connection_view');

module.exports = View.extend({
  id: 'actorEditor',
  
  template: require('./templates/actor_editor'),
  
  initialize: function(){
    _.bindAll(this, 'appendActor', 'createActor');
    this.collection.on('add', this.appendActor, this);
  },
  
  createActor: function(event){
    var editor = this;
    
    var actor = new Actor();
    actor.save({
      pos : {
        x : event.clientX,
        y : event.clientY
      }
    },{
      success : function(){
        editor.collection.add(actor);
    }});
  },
  
  appendActor: function(model){
    var actor = new ActorView({ model : model });
    actor.render();
    this.workspace.append(actor.el);
  },
  
  render: function(){
    var editor = this;
    
    this.$el.html( this.template() );
    this.workspace = this.$el.find('.workspace');
    this.newActor = this.$el.find('.newActor .actor');
    
    this.collection.forEach(this.appendActor);

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
        editor.workspace.append(connection.el);
      }
        
    });
    
    this.afterRender();
  },
  
  afterRender: function(){
    this.newActor.draggable({
      start : function(){ $(this).addClass('dragging') }
    });
    var editor = this;
    this.workspace.droppable({
      drop : function(event, ui){
        if($(ui.draggable).hasClass('new'))
          editor.createActor(event);
      }
    });
  }
});