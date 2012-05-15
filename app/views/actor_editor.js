var View = require('./view');
var Actor = require('models/actor');
var Actors = require('models/actors');
var ActorView = require('./actor_view');
var ConnectionView = require('./connection_view');

module.exports = View.extend({
  id: 'actorEditor',
  
  template: require('./templates/actor_editor'),
  
  events: {
    'click .workspace': 'unselect'
  },
  
  initialize: function(){
    _.bindAll(this, 'appendActor', 'createActor');
    this.collection.on('add', this.appendActor, this);
  },
  
  unselect: function(){
    this.workspace.find('.actor').removeClass('selected');
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
    this.newActor = this.$el.find('.controls .actor');
    this.cancel = this.$el.find('.controls .cancel');
    
    this.collection.forEach(this.appendActor);

    this.collection.forEach(function(model){
      var connections = model.get('accountable_to');
      var to = editor.collection.find(function(searchedModel){
        var found = false;

        for(var i = 0; i<connections.length; i++){
          if(searchedModel.id == connections[i].id){
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
    var editor = this;

    this.newActor.draggable({
      stop : function(){ $(this).data('stopped', null); },
      revert : true,
      revertDuration : 1
    });

    this.cancel.droppable({
      greedy: true,
      drop: function(event, ui){ $(ui.draggable).data('stopped', true); }
    });

    this.workspace.droppable({
      drop : function(event, ui){
        var draggable = $(ui.draggable);
        if(draggable.hasClass('new') && !draggable.data('stopped')){
          editor.createActor(event);
        }
      }
    });
  }
});