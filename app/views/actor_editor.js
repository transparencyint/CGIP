var View = require('./view');
var Actor = require('models/actor');
var ActorGroupView = require('./actor_group_view');
var Actors = require('models/actors');
var ActorView = require('./actor_view');
var FakeActorView = require('./fake_actor_view');
var Connection = require('models/connections/connection');
var ConnectionView = require('./connection_view');
var ConnectionMode = require('./editor_modes/connection_mode')

// TODO: find a better place for `transEndEventNames`

module.exports = View.extend({
  id: 'actorEditor',
  
  template: require('./templates/actor_editor'),
  
  events: {
    'click .newActor:not(.sliding, .slideUp) .description': 'slideActorIn',
    'click .tool .connection': 'toggleMode',
    'click .tool .moneyMode .small': 'toggleMoneyMode',
    'click .tool .connection .eye': 'toggleVisibility',
    'click .zoom.in': 'zoomIn',
    'click .zoom.out': 'zoomOut',
    'click .fit.screen': 'fitToScreen',
    'mousedown': 'dragStart',
    'mousedown .bar': 'stopPropagation',
    'click': 'unselect'
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
    this.smallRadius = 44;

    this.moneyConnectionMode = 'disbursedMode'; //default
    
    // padding for fit-to-screen
    this.padding = this.radius/2;
    
    this.transEndEventName = this.transEndEventNames[ Modernizr.prefixed('transition') ];

    // initialize the collections
    this.actors = options.actors;
    this.actorViews = {};

    // filter the actor groups
    this.actorGroups = this.actors.filterGroups();
    this.actorGroupViews = {};

    this.connections = options.connections;
    var filteredConnections = this.connections.filterConnections();
    this.moneyConnections = filteredConnections.money;
    this.accountabilityConnections = filteredConnections.accountability;
    this.monitoringConnections = filteredConnections.monitoring;

    this.zoom = {
      value: 1,
      sqrt: 1,
      step: 0.25,
      min: 0.25,
      max: 1.75
    };
    
    this.offset = {
      left: 0,
      top: 0
    };
    
    this.gridSize = this.radius;
    
    // add an actor view when a new one is added
    this.actors.on('add', this.appendNewActor, this);
    // remove actor view when actor is removed
    this.actors.on('remove', this.removeActor, this);

    this.accountabilityConnections.on('add', this.appendConnection, this);
    this.monitoringConnections.on('add', this.appendConnection, this);
    this.moneyConnections.on('add', this.appendConnection, this);

    this.on('change:moneyConnectionMode', this.toggleActiveMoneyMode, this);

    this.hideGridLine = _.debounce(this.hideGridLine, 500);

    _.bindAll(this, 'checkDrop', 'actorSelected', 'calculateGridLines', 'realignCenter', 'appendActor', 'createActorAt', 'appendConnection', 'appendActorGroup', 'keyUp', 'unselect', 'slideZoom', 'dragStop', 'drag', 'placeActorDouble', 'slideInDouble');
  
    // gridlines
    $(document).on('viewdrag', this.calculateGridLines);
    // actor selection
    $(document).on('viewSelected', this.actorSelected);
  },
  
  stopPropagation: function(event){
    event.stopPropagation();
  },
  
  deleteOnDelKey: function(){
    if(this.selectedActorView)
      this.selectedActorView.model.destroy();
  },
  
  slideZoom: function(event, ui){
    event.stopPropagation();
    
    this.$el.removeClass('zoom'+ (this.zoom.value*100));

    this.zoom.value = ui.value;
    this.zoom.sqrt = Math.sqrt(ui.value);

    this.workspace.css( Modernizr.prefixed('transform'), 'scale('+ this.zoom.value +')');
    
    this.$el.css('background-size', this.zoom.value*10);
  },
  
  zoomTo: function(value){
    this.slider.slider("value", value);
    this.moveTo(this.offset.left, this.offset.top);
  },
  
  zoomIn: function(){
    this.zoomTo(this.zoom.value + this.zoom.step);
  },
  
  zoomOut: function(){
    this.zoomTo(this.zoom.value - this.zoom.step);
  },
  
  fitToScreen: function(){
    
    // don't do anything when there are no actors
    if(this.actors.length === 0)
      return false;
    
    var boundingBox = this.getBoundingBox();
    
    // center workspace
    this.moveTo(0, 0);
    
    // check if the actors as a whole are not centered
    // if thats the case, move them to the left
    if(boundingBox.left !== boundingBox.width/2){
      
      // calculate center offset
      var dx = boundingBox.left + boundingBox.width/2;
      
      this.actors.each(function(actor){
        actor.moveByDelta(-dx, 0);
        actor.save();
      });
    }
    
    var horizontalRatio = this.$el.width() / (boundingBox.width + this.radius*2 + this.padding*2);
    var verticalRatio = this.$el.height() / (boundingBox.top + boundingBox.height + this.radius + this.padding*2);
    
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
  
  actorSelected: function(event, actorView){
    if(actorView.$el.hasClass('actor')){
      this.selectedActorView = actorView;
      if(this.mode)
        this.mode.actorSelected(actorView);
    }
  },

  unselect: function(){
    this.selectedActorView = null;
    if(this.mode) this.mode.unselect();
    $('.selected').removeClass('selected');
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
    this.actorViews[actor.id] = actorView;
    if(startEdit === true) actorView.startEditName();
  },

  // when an actor is removed, destroy its view
  removeActor: function(actor){
    console.log('remove actor', actor);
    var view = this.actorViews[actor.id];
    if(view) view.destroy();
  },

  appendActorGroup: function(actorGroup){
    var actorGroupView = new ActorGroupView({ model : actorGroup, editor: this});
    actorGroupView.render();
    this.workspace.append(actorGroupView.el);
    this.actorGroupViews[actorGroup.id] = actorGroupView;
  },

  appendConnection: function(connection){
    connection.pickOutActors(this.actors);
    var connView = new ConnectionView({ model : connection, editor: this});
    connView.render();  
    this.workspace.append(connView.el);

    if(connection.showMetadataForm)
      connView.showMetadataForm();
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

  toggleMoneyMode: function(event){
    var target = $(event.target);

    var currentID = target.attr('id');
    if(currentID === 'disbursedMoney')
      this.moneyConnectionMode = 'disbursedMode';
    else if(currentID === 'pledgedMoney')
      this.moneyConnectionMode = 'pledgedMode';

    this.trigger('change:moneyConnectionMode');
    console.log(this.moneyConnectionMode);
  },

  toggleActiveMoneyMode: function(){
    if(this.moneyConnectionMode === 'disbursedMode')
      this.$('#disbursedMoney').addClass("active").siblings().removeClass("active");
    else if(this.moneyConnectionMode === 'pledgedMode')
      this.$('#pledgedMoney').addClass("active").siblings().removeClass("active");

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

  checkDrop: function(event, view){
    if(event.isPropagationStopped()) return;

    // only check for new actors now
    if(!view.$el.hasClass('new')) return;
    
    // check if the new actor overlaps with one of the groups
    var overlapsWithOthers = false;
    _.each(this.actorGroupViews, function(groupView){
      if(!overlapsWithOthers)
        overlapsWithOthers = groupView.overlapsWith(view);
    });

    // create a new actor when it doesn't over lap with others
    if(!overlapsWithOthers){
      var offset = view.$el.offset();
      var x = (offset.left - this.center + this.radius*this.zoom.value - this.offset.left) / this.zoom.value; 
      var y = (offset.top + this.radius*this.zoom.value - this.offset.top) / this.zoom.value;
      this.createActorAt(x, y);
      view.model.set({pos: {x: 0, y:0 }});
    }
  },
  
  slideActorIn: function(){
    this.addActor.one(this.transEndEventName, this.placeActorDouble);
    
    // triggere animation
    var diameter = 2 * this.radius * this.zoom.value;
    var marginLeft = this.smallRadius - diameter/2;
    
    this.actorDouble.css({marginLeft: marginLeft, width: diameter, height: diameter });
    this.addActor.addClass('slideIn');
  },

  offsetToCoords: function(offset, radius){
    var x = (offset.left - this.center + (radius || 0) * this.zoom.value - this.offset.left) / this.zoom.value; 
    var y = (offset.top + (radius || 0) * this.zoom.value - this.offset.top) / this.zoom.value;
    return { x: x, y: y };
  },
  
  placeActorDouble: function(){
    var offset = this.actorDouble.offset();
    var coords = this.offsetToCoords(offset, this.radius);
    
    this.createActorAt(coords.x, coords.y);
    
    // move actorDouble back to its origin by sliding it in from the top
    _.delay(this.slideInDouble, 100);
  },
  
  slideInDouble: function(){
    this.addActor.addClass('curtainDown');
    this.addActor.removeClass('slideIn').addClass('slideUp');
    // reset css
    this.actorDouble.css({ marginLeft: "", width: "", height: "" });

    document.redraw();

    this.addActor.removeClass('curtainDown');
    this.addActor.removeClass('slideUp');
  },
  
  dragStart: function(event){
    event.stopPropagation();
    
    this.startX = event.pageX - this.offset.left;
    this.startY = event.pageY - this.offset.top;
    
    $(document).on('mousemove.global', this.drag);
    $(document).one('mouseup', this.dragStop);
  },

  drag: function(event, silent){
    if(silent === undefined) 
      silent = true;
    
    var x = (event.pageX - this.startX) * this.zoom.sqrt;
    var y = (event.pageY - this.startY) * this.zoom.sqrt;
    
    this.moveTo(x, y, silent);
  },
  
  moveTo: function(x, y, silent){
    // dont let the user pan above y = 0
    if(y >= 0)
      y = 0;
    
    // snap to center
    if(x !== 0 && Math.abs(x) < 10)
      x = 0;
    
    // save new offset  
    // but not when panning (only when we finished panning)
    if(!silent){
      this.offset.left = x / this.zoom.sqrt;
      this.offset.top =  y / this.zoom.sqrt;
    }
    
    x += this.center;
    
    this.workspace.css({
      left: x,
      top: y
    });
    
    this.$el.css('background-position', x +'px, '+ y + 'px');
    
    this.$('.centerLine').css('left', x);
  },
  
  dragStop : function(event){
    this.drag(event, false);
    
    $(document).unbind('mousemove.global');
  },

  calculateGridLines: function(event, view){
    if(view.noGridlines) return;

    var pos = view.model.get('pos');

    var x = Math.round(pos.x / this.gridSize) * this.gridSize;
    var y = Math.round(pos.y / this.gridSize) * this.gridSize;

    var foundGridX = false;
    var foundGridY = false;

    //check if there is an actor at the nearest grid point
    this.actors.each(function(actor){
      var currentPos = actor.get('pos');
      var actorX = Math.round(currentPos.x);
      var actorY = Math.round(currentPos.y);

      if(view.model.id != actor.id){
        if(actorX == x)
          foundGridX = true;
        if(actorY == y)
          foundGridY = true;
      }
    });

    this.showGridLine(x, y, foundGridX, foundGridY);
    this.hideGridLine(); // hiding is a delayed function
  },

  showGridLine: function(x, y, gridX, gridY){
    if(gridX){
      this.gridlineV.css({'left': this.offset.left + this.center + x});
      this.gridlineV.show();
    }
    else if(!gridX)
      this.gridlineV.hide();

    if(gridY){
      this.gridlineH.css({'top': this.offset.top + y});
      this.gridlineH.show();
    }
    else if(!gridY)
      this.gridlineH.hide();
  },

  hideGridLine: function(){
    this.gridlineV.fadeOut(400);
    this.gridlineH.fadeOut(400);
  },
  
  realignCenter: function(){
    this.center = this.$el.width()/2;
    
    this.moveTo(0, 0);
  },
  
  render: function(){
    var editor = this;

    this.$el.html( this.template() );
    this.fakeActorView = new FakeActorView({editor: this});
    this.fakeActorView.render();
    this.$('.newActor .dock').append(this.fakeActorView.el);

    this.workspace = this.$('.workspace');
    this.addActor = this.$('.controls .newActor');
    this.actorDouble = this.$('.controls .actor.new');
    this.cancel = this.$('.controls .cancel');
    this.gridlineV = this.$('#gridlineV');
    this.gridlineH = this.$('#gridlineH');

    this.actors.each(this.appendActor);
    this.actorGroups.each(this.appendActorGroup);

    //this.accountabilityConnections.each(this.appendAccountabilityConnection);
    this.connections.each(this.appendConnection);

    this.afterRender();
    
    // call this slightly delayed to give the browser
    // time to layout the html changes
    // source: http://stackoverflow.com/questions/8225869/how-can-i-get-size-height-width-information-in-backbone-views
    _.defer(this.realignCenter);
  },
  
  afterRender: function(){
    var editor = this;

    $(document).on('viewdragstop', this.checkDrop);

    this.$('#disbursedMoney').addClass("active");

    $(document).bind('keyup', this.keyUp);
    $(window).resize(this.realignCenter);
    
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
    
    // remove all actor views
    _.each(this.actorViews, function(view){
      view.destroy();
    });

    // remove all actor group views
    _.each(this.actorGroupViews, function(view){
      view.destroy();
    });
    
    $(document).unbind('mousemove.global', this.drag);
    $(document).unbind('keyup', this.keyUp);
    $(document).off('viewdrag', this.calculateGridLines);
    $(document).off('viewSelected', this.actorSelected);
    $(document).off('viewdragstop', this.checkDrop)
    $(window).unbind('resize', this.realignCenter);
  }
});