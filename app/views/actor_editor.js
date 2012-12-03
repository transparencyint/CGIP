var View = require('./view');
var Actor = require('models/actor');
var Actors = require('models/actors');
var ActorView = require('./actor_view');
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
    'click .zoom.in': 'zoomIn',
    'click .zoom.out': 'zoomOut',
    'click .fit.screen': 'fitToScreen',
    'mousedown': 'dragStart',
    'mousedown .bar': 'stopPropagation'
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
    
    // padding for fit-to-screen
    this.padding = 5;
    
    this.transEndEventName = this.transEndEventNames[ Modernizr.prefixed('transition') ];

    // initialize the collections
    this.actors = options.actors;
    this.connections = options.connections;
    var filteredConnections = this.connections.filterConnections();
    this.moneyConnections = filteredConnections.money;
    this.accountabilityConnections = filteredConnections.accountability;
    this.selectedActors = [];
    this.zoom = {
      value: 1,
      step: 0.25,
      min: 0.25,
      max: 1.75
    };
    
    this.offset = {
      left: 0,
      top: 0
    };
    
    this.gridSize = this.radius;
    
    // subscribe to add events
    this.actors.on('add', this.appendNewActor, this);
    this.accountabilityConnections.on('add', this.appendConnection, this);
    this.moneyConnections.on('add', this.appendConnection, this);

    _.bindAll(this, 'initializeDimensions', 'alignCenter', 'appendActor', 'createActorAt', 'appendConnection', 'keyUp', 'unselect', 'saveGroup', 'slideZoom', 'dragStop', 'drag');
  },
  
  stopPropagation: function(event){
    event.stopPropagation();
  },
  
  deleteOnDelKey: function(){
    if(this.selectedActors != []) {
      _.each(this.selectedActors, function(actor){
        actor.destroy();
      });
    }
  },
  
  slideZoom: function(event, ui){
    event.stopPropagation();
    
    this.$el.removeClass('zoom'+ (this.zoom.value*100));

    this.zoom.value = ui.value;

    this.workspace.css( Modernizr.prefixed('transform'), 'scale('+ this.zoom.value +')');
    //this.$el.addClass('zoom' + (this.zoom.value*100));
    this.$el.css('background-size', this.zoom.value*10);
  },
  
  zoomTo: function(value){
    this.slider.slider("value", value);
  },
  
  zoomIn: function(){
    this.zoomTo(this.zoom.value + this.zoom.step);
  },
  
  zoomOut: function(){
    this.zoomTo(this.zoom.value - this.zoom.step);
  },
  
  fitToScreen: function(){
    var boundingBox = this.getBoundingBox();
    
    // center workspace
    this.moveTo(0, 0);
    
    // center actors as a whole
    var dx = - (boundingBox.left + boundingBox.width/2);
    
    this.actors.each(function(actor){
      actor.moveByDelta(dx, 0);
      actor.save();
    });
    
    var horizontalRatio = this.$el.width() / (boundingBox.width + this.padding*2);
    var verticalRatio = this.$el.height() / (boundingBox.height + this.padding*2);
    
    // use the smaller ratio
    var fitZoom = Math.min(horizontalRatio, verticalRatio);
    
    // round it to our zoom.step
    fitZoom = Math.floor( fitZoom / this.zoom.step ) * this.zoom.step;
    
    // keep it inside our zoom boundaries
    fitZoom = Math.max(this.zoom.min, Math.min(this.zoom.max, fitZoom));
    
    this.zoomTo(fitZoom);
  },
  
  getBoundingBox: function(){
    var left = Infinity;
    var right = 0;
    var top = Infinity;
    var bottom = 0;
    
    this.actors.each(function(actor){
      var pos = actor.get('pos');
      
      if(pos.y < top) top = pos.y;
      if(pos.y > bottom) bottom = pos.y;
      if(pos.x < left) left = pos.x;
      if(pos.x > right) right = pos.x;
    });
    
    return {
      left: left,
      top: top,
      width: right - left,
      height: bottom - top,
      bottom: bottom,
      right: right
    };
  },
  
  unselect: function(){
    if(this.mode) this.mode.unselect();
    this.selectedActors = [];
  },

  dragGroup: function(dx, dy){
    _.each(this.selectedActors, function(actor){
      actor.moveByDelta(dx, dy);
    });
  },
  
  saveGroup: function(dx, dy){
    _.each(this.selectedActors, function(actor){
      actor.save();
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

  appendConnection: function(connection){
    connection.pickOutActors(this.actors);
    var connView = new ConnectionView({ model : connection, editor : this });
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
  },

  deactivateMode: function(){
    this.$('.connection').removeClass('active');
    this.mode.abort();
    this.mode = null;

    // re-enable draggables
    this.trigger('enableDraggable');
  },

  keyUp: function(event){
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
  
  dragStart: function(event){
    event.stopPropagation();
    
    this.startX = event.pageX - this.offset.left;
    this.startY = event.pageY - this.offset.top;
    
    $(document).on('mousemove.global', this.drag);
    $(document).one('mouseup', this.dragStop);
  },

  drag: function(event){ 
    var x = (event.pageX - this.offset.left - this.startX);
    var y = (event.pageY - this.offset.top - this.startY);
    
    this.panBy(x, y);
  },
  
  panBy: function(x, y){
    this.offset.left += (x / this.zoom.value);
    this.offset.top += (y / this.zoom.value);
    
    // dont let the user pan above y = 0
    if(this.offset.top >= 0){
      this.offset.top = 0;
      this.startY += y;
    }
    
    // snap to center
    if(x !== 0 && Math.abs(this.offset.left) < 10)
      this.offset.left = 0;
      
    this.moveTo(this.offset.left, this.offset.top);
  },
  
  moveTo: function(x, y){
    this.offset.left = x;
    this.offset.top = y;
    
    x += this.center;
    
    this.workspace.css({
      left: x,
      top: y
    });
    
    this.$el.css({
      backgroundPositionX: x,
      backgroundPositionY: y
    });
    
    this.$('.centerLine').css('left', x);
  },
  
  dragStop : function(){
    $(document).unbind('mousemove.global');
  },
  
  alignCenter: function(){
    var nextCenter = this.$el.width()/2;
    var dx = nextCenter - this.center;
    this.center = nextCenter;
    
    this.panBy(0, 0);
  },
  
  render: function(){
    var editor = this;
    
    this.$el.html( this.template() );
    this.workspace = this.$('.workspace');
    this.newActor = this.$('.controls .actor');
    this.cancel = this.$('.controls .cancel');
    
    this.actors.each(this.appendActor);

    //this.accountabilityConnections.each(this.appendAccountabilityConnection);
    this.connections.each(this.appendConnection);

    this.afterRender();
    
    // call this slightly delayed to give the browser
    // time to layout the html changes
    // source: http://stackoverflow.com/questions/8225869/how-can-i-get-size-height-width-information-in-backbone-views
    _.defer(this.initializeDimensions);
  },
  
  initializeDimensions: function(){
    this.center = this.$el.width()/2;
  },
  
  afterRender: function(){
    var editor = this;

    $(document).bind('keyup', this.keyUp);
    $(window).resize(this.alignCenter);

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
          // TODO: fix after implementing pan&zoom
          var x = draggable.offset().left + editor.smallRadius;
          var y = draggable.offset().top + editor.smallRadius;

          editor.createActorAt(x, y);
        }
      }
    });
    
    this.slider = this.$('.bar').slider({ 
      orientation: "vertical",
      min: this.zoom.min,
      max: this.zoom.max,
      step: this.zoom.step,
      value: this.zoom.value,
      slide: this.slideZoom,
      change: this.slideZoom
    });
  },

  destroy: function(){
    View.prototype.destroy.call(this);
    $(document).unbind('keyup', this.keyUp);
  }
});