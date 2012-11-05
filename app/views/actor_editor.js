var View = require('./view');
var Actor = require('models/actor');
var Actors = require('models/actors');
var ActorView = require('./actor_view');
var ActorGroupView = require('./actor_group_view');
var Connection = require('models/connections/connection');
var ConnectionView = require('./connection_view');
var ConnectionMode = require('./editor_modes/connection_mode')

// TODO: find a better place for `transEndEventNames`

module.exports = View.extend({
  id: 'actorEditor',
  
  template: require('./templates/actor_editor'),
  
  events: {
    'click .newActor:not(.sliding, .slideUp) .description': 'slideActorIn',
    'click .connection': 'toggleMode',
    'click .connection .eye': 'toggleVisibility',
    'mousedown .zoom.in': 'zoomIn',
    'mousedown .zoom.out': 'zoomOut'
  },
  
  transEndEventNames: {
    'WebkitTransition' : 'webkitTransitionEnd',
    'MozTransition'    : 'transitionend',
    'OTransition'      : 'oTransitionEnd',
    'msTransition'     : 'MSTransitionEnd',
    'transition'       : 'transitionend'
  },
  
  initialize: function(options){
    this.country = options.country;
    this.radius = 60;
    this.smallRadius = 40;
    
    this.transEndEventName = this.transEndEventNames[ Modernizr.prefixed('transition') ];

    // initialize the collections
    this.actors = options.actors;
    this.actorGroups = this.actors.filterGroups();
    this.connections = options.connections;
    var filteredConnections = this.connections.filterConnections();
    this.moneyConnections = filteredConnections.money;
    this.accountabilityConnections = filteredConnections.accountability;
    this.selectedActors = [];
    this.zoom = 1;
    this.maxZoom = 1.75;
    this.zoomStep = 0.25;
    
    // subscribe to add events
    this.actors.on('add', this.appendNewActor, this);
    this.accountabilityConnections.on('add', this.appendConnection, this);
    this.moneyConnections.on('add', this.appendConnection, this);

    _.bindAll(this, 'appendActor', 'createActorAt', 'appendConnection', 'appendActorGroup', '_keyUp', 'unselect', 'zoomIn', 'zoomOut');
  },
  
  zoomIn: function(){
    if ( (this.zoom + this.zoomStep) <= this.maxZoom ) {
      this.$el.removeClass('zoom'+ (this.zoom*100));
      
      this.zoom += this.zoomStep;
      this.workspace.css('webkitTransform', 'scale('+ this.zoom +')');
      
      this.$el.addClass('zoom' + (this.zoom*100));
    }
  },

  deleteOnDelKey: function(){
    if(this.selectedActors != []) {
      _.each(this.selectedActors, function(actor){
        actor.destroy();
      });
    }
  },
  
  zoomOut: function(){
    if ( (this.zoom - this.zoomStep) >= this.zoomStep ) {
      this.$el.removeClass('zoom'+ (this.zoom*100));
      
      this.zoom -= this.zoomStep;
      this.workspace.css('webkitTransform', 'scale('+ this.zoom +')');
      
      this.$el.addClass('zoom' + (this.zoom*100));
    }
  },
  
  unselect: function(){
    this.workspace.find('.contextMenu').removeClass('visible');
    if(this.mode) this.mode.unselect();
    this.selectedActors = [];
  },

  dragGroup: function(delta){
    _.each(this.selectedActors, function(actor){
      actor.moveByDelta(delta);
    });
  },
  
  createActorAt: function(x, y){
    var editor = this;
    
    var actor = new Actor();
    actor.save({
      country: editor.country,
      pos : { x : x, y : y }
    },{
      success : function(){
        editor.actors.add(actor);
    }});
  },
  
  appendNewActor: function(actor){
    this.appendActor(actor, true);
  },

  appendActor: function(actor, startEdit){
    var actorView = new ActorView({ model : actor, editor: this});
    actorView.render();
    this.workspace.append(actorView.el);
    if(startEdit === true) actorView.startEditName();
  },

  appendActorGroup: function(actorGroup){
    var actorView = new ActorGroupView({ model : actorGroup, editor: this});
    actorView.render();
    this.workspace.append(actorView.el);
  },

  appendConnection: function(connection){
    connection.pickOutActors(this.actors);
    var connView = new ConnectionView({ model : connection });
    connView.render();  
    this.workspace.append(connView.el);

    if(connection.showMetadataForm)
      connView.showMetadataForm();
  },

  actorSelected: function(actorView){
    if(this.selectedActors.length <= 1)
      this.selectedActors = [actorView.model];
    else{
      var found = _.find(this.selectedActors, function(actor){ return actor.id == actorView.model.id; });
      if(!found)
        this.selectedActors = [actorView.model]
    }
    if(this.mode)
      this.mode.actorSelected(actorView);
  },

  toggleMode: function(event){
    this.$('.connection').removeClass('active');
    var target = $(event.target);
    var selectedElement = target.hasClass('.connection') ? target : target.parents('.connection');
    var connectionType = selectedElement.attr('data-connectionType');
    var collection = this[ connectionType + "Connections" ];
    
    if(this.mode){
      this.deactivateMode();
    }
    
    selectedElement.addClass('active');
    this.mode = new ConnectionMode(this.workspace, collection, connectionType, this);

    // disable all draggables during mode
    this.trigger('disableDraggable');
    // disable the select mode
    this.workspace.selectable('disable');
  },

  deactivateMode: function(){
    this.$('.connections li').removeClass('active');
    this.mode.abort();
    this.mode = null;

    // re-enable draggables
    this.trigger('enableDraggable');
    // re-enable select mode
    this.workspace.selectable('enable');
  },

  _keyUp: function(event){
    if(this.mode)
      this.deactivateMode();

    //On del key remove selected actors
    if(event.keyCode === 46){
      event.preventDefault();
      this.deleteOnDelKey();
    }
  },
  
  toggleVisibility: function(event){
    event.stopPropagation();
    var parent = $(event.target).parent().toggleClass('invisible');
    var connectionType = parent.attr('data-connectionType');
    var hideClass = 'hide-' + connectionType;
    
    if(parent.hasClass('invisible')){
      // invisible
      this.workspace.addClass( hideClass );
    } else {
      this.workspace.removeClass( hideClass );
    };
  },
  
  slideActorIn: function(){
    var editor = this;
    var newActor = this.$el.find('.newActor');
    
    newActor.one(this.transEndEventName, function(){
      var offset = $(this).find('.actor').offset();
      var x = offset.left + editor.radius;
      var y = offset.top + editor.radius;
      editor.createActorAt(x, y);
      
      _.delay(function(){
        newActor.addClass('curtainDown');
        newActor.removeClass('slideIn').addClass('slideUp');

        document.redraw();

        newActor.removeClass('curtainDown');
        newActor.removeClass('slideUp');
      }, 100);
    });
    
    newActor.addClass('slideIn');
  },
  
  render: function(){
    var editor = this;
    
    this.$el.html( this.template() );
    this.workspace = this.$el.find('.workspace');
    this.newActor = this.$el.find('.controls .actor');
    this.cancel = this.$el.find('.controls .cancel');
    
    this.actors.each(this.appendActor);
    this.actorGroups.each(this.appendActorGroup);

    //this.accountabilityConnections.each(this.appendAccountabilityConnection);
    this.connections.each(this.appendConnection);

    this.afterRender();
  },
  
  afterRender: function(){
    var editor = this;

    $(document).bind('keyup', this._keyUp);

    this.newActor.draggable({
      stop : function(){ $(this).data('stopped', null); },
      revert : true,
      revertDuration : 1
    });

    this.cancel.droppable({
      greedy: true,
      drop: function(event, ui){ $(ui.draggable).data('stopped', true); }
    });

    //this.workspace.draggable();

    this.workspace.droppable({
      drop : function(event, ui){
        var draggable = $(ui.draggable);
        if(draggable.hasClass('new') && !draggable.data('stopped')){
          /* TODO: fix after implementing pan&zoom */
          var x = draggable.offset().left + editor.smallRadius;
          var y = draggable.offset().top + editor.smallRadius;

          editor.createActorAt(x, y);
        }
      }
    });

    this.workspace.selectable({
      filter: '.actor',
      cancel: 'path',
      selected: function(event, ui){
        var selectedElements = $('.ui-selected');
        var selectedActors = [];
        selectedElements.each(function(index, el){
          var actor = editor.actors.get(el.id);
          if(actor)
            selectedActors.push(actor);
        });
        editor.selectedActors = selectedActors;
      },
      unselected: editor.unselect
    });
  },

  destroy: function(){
    View.prototype.destroy.call(this);

    $(document).unbind('keyup', this._keyUp);
  }
});