var View = require('./view');
var Actor = require('models/actor');
var Actors = require('models/actors');
var ActorView = require('./actor_view');
var Connection = require('models/connections/connection');
var ConnectionView = require('./connection_view');
var ConnectionMode = require('./editor_modes/connection_mode')

module.exports = View.extend({
  id: 'actorEditor',
  
  template: require('./templates/actor_editor'),
  
  events: {
    'click .workspace': 'unselect',
    'click .connections .accountability': 'activateAccountabilityMode'
  },
  
  initialize: function(options){
    // initialize the collections
    this.actors = options.actors;
    this.connections = options.connections;
    var filteredConnections = this.connections.filterConnections();
    this.moneyConnections = filteredConnections.money;
    this.accountabilityConnections = filteredConnections.accountability;
    
    // subscribe to add events
    this.actors.on('add', this.appendActor, this);
    this.accountabilityConnections.on('add', this.appendAccountabilityConnection, this);

    _.bindAll(this, 'appendActor', 'createActor', 'appendAccountabilityConnection');
  },
  
  unselect: function(){
    this.workspace.find('.actor').removeClass('selected');
    if(this.mode) this.mode.unselect();
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
  
  appendActor: function(actor){
    var actorView = new ActorView({ model : actor, editor: this});
    actorView.render();
    this.workspace.append(actorView.el);
  },

  appendAccountabilityConnection: function(connection){
    connection.pickOutActors(this.actors);
    var connView = new ConnectionView({ model : connection });
    connView.render();  
    this.workspace.append(connView.el);
  },

  actorSelected: function(actorView){
    if(this.mode)
      this.mode.actorSelected(actorView);
  },

  activateAccountabilityMode: function(event){
    this.$('.connections li').removeClass('active');
    var thisEl = this.$('.connections .accountability');
    if(this.mode){
      this.mode.cancel();
      this.mode.abort()
      this.mode = null;
    }else{
      thisEl.addClass('active');
      this.mode = new ConnectionMode(this.workspace, this.accountabilityConnections);
    }
  },
  
  render: function(){
    var editor = this;
    
    this.$el.html( this.template() );
    this.workspace = this.$el.find('.workspace');
    this.newActor = this.$el.find('.controls .actor');
    this.cancel = this.$el.find('.controls .cancel');
    
    this.actors.each(this.appendActor);

    this.connections.each(this.appendAccountabilityConnection);
    
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