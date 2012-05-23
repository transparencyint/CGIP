var View = require('./view');
var Actor = require('models/actor');
var Actors = require('models/actors');
var ActorView = require('./actor_view');
var Connection = require('models/connection');
var ConnectionView = require('./connection_view');

module.exports = View.extend({
  id: 'actorEditor',
  
  template: require('./templates/actor_editor'),
  
  events: {
    'click .workspace': 'unselect'
  },
  
  initialize: function(options){

    // initialize the collections
    this.actors = options.actors;
    this.connections = options.connections;
    var filteredConnections = this.connections.filterConnections();
    this.moneyConnections = filteredConnections.money;
    this.accountabilityConnections = filteredConnections.accountability;
    
    this.actors.on('add', this.appendActor, this);

    _.bindAll(this, 'appendActor', 'createActor');
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
        editor.actors.add(actor);
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
    
    this.actors.forEach(this.appendActor);

    this.connections.each(function(connection){
      connection.pickOutActors(editor.actors);
      var connView = new ConnectionView({ model : connection });
      connView.render();  
      editor.workspace.append(connView.el);
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