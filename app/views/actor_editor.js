var View = require('./view');
var Actor = require('models/actor');
var ActorGroup = require('models/actor_group');
var ActorGroupView = require('./actor_group_view');
var Actors = require('models/actors');
var ActorView = require('./actor_view');
var ActorGroupActorView = require('./actor_group_actor_view');
var FakeActorView = require('./fake_actor_view');
var Connection = require('models/connections/connection');
var ConnectionView = require('./connection_view');
var ConnectionMode = require('./editor_modes/connection_mode');
var RoleBackgroundView = require('./role_background_view');
var SettingsView = require('./settings_view');
var clickCatcher = require('./click_catcher_view');

module.exports = View.extend({
  id: 'actorEditor',
  
  template: require('./templates/actor_editor'),
  
  events: function(){
    var _events = {
      // tool controls
      'click .newActor:not(.sliding, .slideUp) .description': 'slideActorIn',
      'click .tool .connection': 'toggleMode',
      'click .tool .connection .eye': 'toggleVisibility',
    
      // view controls
      'click .zoom .in': 'zoomIn',
      'click .zoom .out': 'zoomOut',
      'click .fit.screen': 'fitToScreen',
      'click .moneyMode .icon': 'showMoneyModal',
      'click .moneyMode .option': 'chooseMoneyMode',
      
      // zoom gesture
      'gesturestart': 'pinchStart',
      'gesturechange': 'pinch'
    };
    
    // add dynamic input event handler (touch or mouse)
    _events[ this.inputDownEvent ] = 'panStart';
    
    // ..and prevent them on controls
    _events[ this.inputDownEvent + ' .controls' ] = 'dontPan';
    
    return _events;
  },

  initializeProperties: function(){
    this.country = this.options.country;
    this.actorHeight = 55;
    this.actorWidth = 144;

    this.fakeActorWidth = 134;
    this.fakeActorHeight = 45;

    this.zoom = {
      value: 1,
      sqrt: 1,
      step: 0.1,
      min: 0.25,
      max: 1.75
    };
    
    // the static origin of the workspace
    // 'left' gets updated to be 50% from the left
    this.origin = {
      left: 0,
      top: 78
    };
    
    // the dynamic offset of the workspace
    this.offset = {
      left: 0,
      top: 0
    };
    
    // make the grid size as large as the blue background grid
    this.gridSize = 10;
    
    // padding for fit-to-screen and for placing the details
    this.padding = this.actorWidth/4;

    // initialize the collections
    this.actors = this.options.actors;
    this.actorViews = {};

    // filter the actor groups
    this.actorGroups = this.actors.filterGroups();
    this.actorGroupViews = {};

    // filter the connections
    this.connections = this.options.connections;
    var filteredConnections = this.connections.filterConnections();
    this.moneyConnections = filteredConnections.money;
    this.accountabilityConnections = filteredConnections.accountability;
    this.monitoringConnections = filteredConnections.monitoring;

  },

  initialize: function(options){
    // initialize all of the editor's properties
    this.initializeProperties();
    
    // add an actor view when a new one is added
    this.actors.on('add', this.appendNewActor, this);
    // remove actor view when actor is removed
    this.actors.on('remove', this.removeActor, this);
    // add ActorGroups when they're added
    this.actorGroups.on('add', this.appendActorGroup, this);
    // remove actorGroups when they're deleted
    this.actorGroups.on('remove', this.removeActorGroup, this);

    this.accountabilityConnections.on('add', this.appendConnection, this);
    this.monitoringConnections.on('add', this.appendConnection, this);
    this.moneyConnections.on('add', this.appendConnection, this);

    this.initializeConfig();

    this.hideGridLine = _.debounce(this.hideGridLine, 500);

    _.bindAll(this, 'unScopeElements', 'addActorGroupFromRemote', 'addActorWithoutPopup', 'closeMoneyModal', 'checkDrop', 'selected', 'calculateGridLines', 'realignOrigin', 'appendActor', 'createActorAt', 'appendConnection', 'appendActorGroup', 'keyUp', 'slideZoom', 'panStop', 'pan', 'placeActorDouble', 'slideInDouble');
  
    // gridlines
    $(document).on('viewdrag', this.calculateGridLines);
    // disable scope mode
    $(document).on('viewdrag', this.unScopeElements);
    // actor selection
    $(document).on('viewSelected', this.selected);

    // react to socket events
    var country = this.country.get('abbreviation');
    socket.on(country + ':actor', this.addActorWithoutPopup);
    socket.on(country + ':actor:group', this.addActorGroupFromRemote);
    socket.on(country + ':connection:money', this.moneyConnections.add.bind(this.moneyConnections));
    socket.on(country + ':connection:accountability', this.accountabilityConnections.add.bind(this.accountabilityConnections));
    socket.on(country + ':connection:monitoring', this.monitoringConnections.add.bind(this.monitoringConnections));
  },

  addActorGroupFromRemote: function(actorGroup){
    var actorGroup = new ActorGroup(actorGroup);
    this.appendActorGroup(actorGroup);
  },

  addActorWithoutPopup: function(actor){
    this.actors.add(actor, {silent: true});
    this.appendActor(this.actors.get((actor._id || actor.id)), false);
  },
  
  dontPan: function(event){
    event.stopPropagation();
  },
  
  deleteOnDelKey: function(){
    var selectedElement = this.workspace.find('.selected');
    var selectedView = null;

    if(selectedElement.hasClass('connection'))
      selectedView = this.selectedConnectionView;
    else
      selectedView = this.selectedActorView;

    if(selectedView && selectedView.$el.hasClass('selected'))
      selectedView.model.destroy();
  },
  
  // pinch gesture for zooming on mobile 
  // moving two fingers together or apart
  pinchStart: function(event){
    this.startZoom = this.zoom.value;
  },
  
  pinch: function(event){
    this.zoomTo(this.startZoom + (1 - event.originalEvent.scale)/5);
  },
  
  slideZoom: function(event, ui){
    event.stopPropagation();
    var x = this.origin.left + this.offset.left;
    var y = this.origin.top + this.offset.top;
    
    this.$el.removeClass('zoom'+ (this.zoom.value*100));

    var zoomBefore = this.zoom.value;
    this.zoom.value = ui.value;
    this.zoom.sqrt = Math.sqrt(ui.value);

    this.trigger('zoom', this.zoom.value - zoomBefore);
    
    this.updateWorkspace(x, y, this.zoom.value);
    
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
  
  updateWorkspace: function(x, y, scale){
    this.workspace.css(Modernizr.prefixed('transform'), 'translate3d('+ Math.round(x) +'px,'+ Math.round(y) +'px,0) scale('+ scale +')');
  },
  
  fitToScreen: function(){
    
    // don't do anything when there are no actors
    if(this.actors.length === 0)
      return false;
    
    var boundingBox = this.getBoundingBox();
    
    // center workspace
    this.moveTo(0, 0);
    
    // calculate offset of the center
    var offsetX = Math.abs(boundingBox.left + boundingBox.width/2);
    
    var horizontalRatio = this.$el.width() / ( 2 * (offsetX + boundingBox.width/2 + this.actorWidth + this.padding) );
    var verticalRatio = this.$el.height() / (boundingBox.top + boundingBox.height + this.actorHeight + this.padding*2);
    
    // use the smaller ratio
    var fitZoom = Math.min(horizontalRatio, verticalRatio);
    
    this.zoomTo(fitZoom);
  },
  
  getBoundingBox: function(){
    var left = Infinity;
    var right = 0;
    var top = Infinity;
    var bottom = 0;
    
    var checkPos = function(actor){
      var pos = actor.get('pos');
      
      if(pos.y < top) top = pos.y;
      if(pos.y > bottom) bottom = pos.y;
      if(pos.x < left) left = pos.x;
      if(pos.x > right) right = pos.x;
    };
    
    this.actors.each(checkPos);
    this.actorGroups.each(checkPos);
    
    return {
      left: left,
      top: top,
      width: right - left,
      height: bottom - top,
      bottom: bottom,
      right: right
    };
  },

  // Scope the editor's container
  scopeElements: function(view){

    console.log('scoping');
    // set the state
    this.isScoped = true;

    var type = view.model.get('type');
    var scopedElements = [];

    // decide on the scope method based on the views type and get the elements in the current scope
    if(type == 'actor'){
      scopedElements = this.scopeFromActor(view.model);
    }else if(type == 'connection'){
      if(view.model.get('connectionType') == 'money')
        scopedElements = this.scopeFromMoneyConnection(view.model);
      else
        scopedElements = this.scopeFromConnection(view.model);
    }

    if(scopedElements.length == 1) return this.unScopeElements(); // don't scope when only one element in scope

    // set all elements to outOfScope
    if(type == 'actor' || type == 'connection')
      this.workspace.find('.actor,.connection,.actor-group').addClass('outOfScope');

    // set the found elements to 'inScope'
    var elements = $();
    
    _.each(scopedElements, function(model){
      elements = elements.add('#' + model.id);
    });
    
    elements.removeClass('outOfScope');
  },

  // Scope by showing all directly connected elements
  scopeFromActor: function(startActor){
    var scopedElements = [startActor];

    var selectScopeElements = function(connections, direction){
      _.each(connections, function(connection){
        var next = connection.get(direction);
        next = this.actors.get(next) || this.actorGroups.get(next);
        
        if(!next || next == startActor) return; // stop if no next actor or self again
        
        scopedElements.push(connection);
        scopedElements.push(next);    
      }.bind(this))
    }.bind(this);

    // elements that come from this actor
    var outgoingConnections = this.connections.where({from: startActor.id});
    selectScopeElements(outgoingConnections, 'to');
    
    // elements that point to this actor
    var incoming = this.connections.where({to: startActor.id});
    selectScopeElements(incoming, 'from');

    return scopedElements;
  },

  // Scope by selecting the connection and both connected actors
  scopeFromConnection: function(connection){
    var scopedElements = [connection];
    if(connection.to) scopedElements.push(connection.to);
    if(connection.from) scopedElements.push(connection.from);
    return scopedElements;
  },

  // Scope elements based on their money relationships
  // -> Display the complete flow of the money in this connection:
  // - Iterates up to the root source
  // - Iterates down to the last receiver
  scopeFromMoneyConnection: function(connection){
    var scopedElements = [connection];
    var currentActor = null;
    
    // get all actors and connections that lead here
    if(connection.from){
      this._scopeFromMoneyConnection(connection.from, scopedElements, 'to', 'from');
    }

    // get all actors and connections that start from here
    if(connection.to){
      this._scopeFromMoneyConnection(connection.to, scopedElements, 'from', 'to');
    }

    return scopedElements;
  },

  // Recursively iterate up or down the money connection tree
  _scopeFromMoneyConnection: function(startActor, scopedElements, dir1, dir2){
    scopedElements.push(startActor);
    // get all connections that point into dir1 from the startActor
    var query = {};
    query[dir1] = startActor.id;
    var connections = this.moneyConnections.where(query);
    // add each connection and all actors
    _.each(connections, function(conn){
      scopedElements.push(conn);
      var next = this.actors.get(conn.get(dir2)) || this.actorGroups.get(conn.get(dir2));
      if(next && _.indexOf(scopedElements, next) < 0){
        this._scopeFromMoneyConnection(next, scopedElements, dir1, dir2);
      }
    }.bind(this));
  },

  // Resets the scope, so that all elements are shown as before the scope
  unScopeElements: function(){
    if(this.isScoped){
      this.workspace.find('.outOfScope').removeClass('outOfScope');
      this.isScoped = false;
    }
  },

  selected: function(event, view){
    var type = view.model.get('type');
    
    if(this.mode && this.mode.isActive){
      this.mode.viewSelected(view);
    }else{
      this.scopeElements(view)
    }

    if(type == 'actor'){
      this.actorSelected(event, view);
    }else if(type == 'connection'){
      this.connectionSelected(event, view);
    }
  },

  actorSelected: function(event, view){
    this.selectedActorView = view;
    if(this.mode)
      this.mode.viewSelected(view);
  },

  connectionSelected: function(event, view){
    this.selectedConnectionView = view;
  },

  unselect: function(){
    if(this.mode)
      this.deactivateMode();
    
    this.$('.selected').removeClass('selected');
    this.selectedActorView = null;
    this.selectedView = null;
    this.selectedActorView = null;
  },

  unselect: function(){
    this.unScopeElements();
    this.selectedActorView = null;
    this.selectedConnectionView = null;
    if(this.mode) this.mode.unselect();
    $('.selected').removeClass('selected');
  },

  createActorAt: function(x, y){
    var editor = this;
  
    var actor = new Actor();
    actor.save({
      country: editor.country.get('abbreviation'),
      pos : { x : x, y : y }
    },{
      success : function(){
        editor.actors.add(actor);
        socket.emit('new_model', actor.toJSON());
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
    if(startEdit === true){
      actorView.select();
      actorView.showDetails();
      this.trigger('actorCreated', actorView);
    }
  },

  // when an actor is removed, destroy its view
  removeActor: function(actor){
    var view = this.actorViews[actor.id];
    if(view) view.destroy();
    delete this.actorViews[actor.id];
  },

  appendActorGroup: function(actorGroup){
    actorGroup.pickOutActors(this.actors);
    var actorGroupView = new ActorGroupView({ model : actorGroup, editor: this});
    actorGroupView.render();
    this.workspace.append(actorGroupView.el);
    this.actorGroupViews[actorGroup.id] = actorGroupView;
  },

  removeActorGroup: function(actorGroup){
    var view = this.actorGroupViews[actorGroup.id];
    if(view) view.destroy();
    delete this.actorGroupViews[actorGroup.id];
  },

  appendConnection: function(connection){
    this.connections.add(connection);
    connection.pickOutActors(this.actors, this.actorGroups);

    var connView = new ConnectionView({ model : connection, editor: this});

    connView.render();  
    this.workspace.append(connView.el);

    if(connection.showMetadataForm && connView.showMetadataForm)
      connView.showMetadataForm();
  },

  toggleMode: function(event){
    event.stopPropagation();
    var target = $(event.target);
    var selectedElement = target.hasClass('.connection') ? target : target.parents('.connection');
    var connectionType = selectedElement.attr('data-connectionType');
    var collection = this[ connectionType + "Connections" ];
    
    if(this.mode)
      this.deactivateMode();
    
    selectedElement.addClass('active');
    this.mode = new ConnectionMode(this.workspace, collection, connectionType, this);

    // disable all draggables during mode
    this.trigger('disableDraggable');
  },

  deactivateMode: function(){
    console.log("disable mode");
    this.$('.connection.active').removeClass('active');
    
    // re-enable draggables
    this.trigger('enableDraggable');
    
    this.mode.cancel();
    this.mode = null;
    this.unselect();
  },

  showMoneyModal: function(event){
    this.$('.moneyMode').addClass('open');
    
    // wherever you click around the modal
    // will close the modal (also the button)
    new clickCatcher({ callback: this.closeMoneyModal, holder: this.$el });
  },
  
  closeMoneyModal: function(){
    this.$('.moneyMode').removeClass('open');
  },
  
  chooseMoneyMode: function(event){
    event.stopPropagation();
    var mode = $(event.currentTarget).data('mode');
    
    config.set({moneyConnectionMode: mode});
  },

  toggleActiveMoneyMode: function(){
    var mode = config.get('moneyConnectionMode');
    var option = this.$('.option[data-mode='+ mode +']');
    
    // change point color
    option.parent().siblings('.point').attr('data-mode', mode);
    
    // highlight current option
    option.addClass('active').siblings('.active').removeClass('active');
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

    if(view instanceof FakeActorView)
      this.newActorDropped(view);
    else if(view instanceof ActorGroupActorView)
      this.actorGroupActorDropped(view)
  },

  // the fake actor view has been dropped here
  newActorDropped: function(view){
    // check if the new actor overlaps with one of the groups
    var overlapsWithOthers = false;
    _.each(this.actorGroupViews, function(groupView){
      if(!overlapsWithOthers)
        overlapsWithOthers = groupView.overlapsWith(view);
    });

    // create a new actor when it doesn't over lap with others
    if(!overlapsWithOthers){
      var offset = view.$el.offset();
      var coords = this.offsetToCoords(offset, view.width, view.height);
      this.createActorAt(coords.x, coords.y);
      
      // move actorDouble back to its origin by sliding it in from the top
      _.delay(this.slideInDouble, 120, view);
    }
  },

  // an actor view from a group has been dragged here
  actorGroupActorDropped: function(view){
    var newActor = view.model.toJSON();
    delete newActor._id;
    delete newActor._rev;
    delete newActor.locked;
    var newActor = new Actor(newActor);
    var editor = this;

    view.model.destroy().done(function(){
      newActor.save().done(function(){
        // add it to the editor's actors
        editor.addActorWithoutPopup(newActor);
        socket.emit('new_model', newActor.toJSON())
      });
    });
  },
  
  slideActorIn: function(){
    this.addActor.one(this.transEndEventName, this.placeActorDouble);
    
    // triggere animation
    var width = this.actorWidth * this.zoom.value;
    var height = this.actorHeight * this.zoom.value
    var marginLeft = this.fakeActorWidth/2 - width/2;
    
    this.actorDouble.css({
      marginLeft: marginLeft, 
      width: width, 
      height: height
    });
    this.addActor.addClass('slideIn');
  },

  offsetToCoords: function(offset, width, height){
    var x = (offset.left - this.origin.left + (width/2 || 0) * this.zoom.value - this.offset.left) / this.zoom.value; 
    var y = (offset.top - this.origin.top + (height/2 || 0) * this.zoom.value - this.offset.top) / this.zoom.value;
    return { x: x, y: y };
  },
  
  placeActorDouble: function(){
    var offset = this.actorDouble.offset();
    var coords = this.offsetToCoords(offset, this.actorWidth, this.actorHeight);
    this.createActorAt(coords.x, coords.y);
    
    // move actorDouble back to its origin by sliding it in from the top
    _.delay(this.slideInDouble, 120);
  },
  
  slideInDouble: function(view){
    this.addActor.addClass('curtainDown');
    this.addActor.removeClass('slideIn').addClass('slideUp');
    // reset css
    this.actorDouble.css({ marginLeft: '', width: '', height: '' });

    document.redraw();

    this.addActor.removeClass('curtainDown');
    this.addActor.removeClass('slideUp');
    if(view) view.model.set({pos: {x: 0, y:0 }});
  },
  
  panStart: function(event){
    event.preventDefault();
    event.stopPropagation();
    
    // unselect when clicking into empty space
    this.unselect();
    
    this.startX = this.normalizedX(event) - this.offset.left;
    this.startY = this.normalizedY(event) - this.offset.top;
    
    $(document).on(this.inputMoveEvent, this.pan);
    $(document).one(this.inputUpEvent, this.panStop);
  },

  pan: function(event){
    this.panX = (this.normalizedX(event) - this.startX) * this.zoom.sqrt;
    this.panY = (this.normalizedY(event) - this.startY) * this.zoom.sqrt;
  
    this.moveTo(this.panX, this.panY, true);
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

    x += this.origin.left;
    y += this.origin.top;

    this.updateWorkspace(x, y, this.zoom.value);
    
    this.trigger('pan', x, y);
    this.$el.css('background-position', x +'px '+ y + 'px');
    
    this.$('.centerLine').css('left', x);
    
  },
  
  panStop : function(event){
    // always unbind the inputMoveEvent
    $(document).unbind(this.inputMoveEvent, this.pan);

    // if the editor hasn't been panned, return and do nothing
    if(!this.panX || !this.panY) return;

    // move the canvas
    this.moveTo(this.panX, this.panY);
  },

  calculateGridLines: function(event, view){
    if(view.noGridlines) return;

    var pos = view.model.get('pos');

    var x = Math.round(pos.x / this.gridSize) * this.gridSize;
    var y = Math.round(pos.y / this.gridSize) * this.gridSize;

    var foundGridX = false;
    var foundGridY = false;

    //check if there is an actor at the nearest grid point
    var actorCheck = function(actor){
      var currentPos = actor.get('pos');
      var actorX = Math.round(currentPos.x);
      var actorY = Math.round(currentPos.y);

      if(view.model.id != actor.id){
        if(actorX == x)
          foundGridX = true;
        if(actorY == y)
          foundGridY = true;
      }
    }
    this.actors.each(actorCheck);
    this.actorGroups.each(actorCheck);

    this.showGridLine(x, y, foundGridX, foundGridY);
    this.hideGridLine(); // hiding is a delayed function
  },

  showGridLine: function(x, y, gridX, gridY){

    if(gridX){
      this.gridlineV.css({'left': (this.offset.left*this.zoom.sqrt + this.origin.left + x*this.zoom.value)});
      this.gridlineV.show();
    }
    else if(!gridX)
      this.gridlineV.hide();

    if(gridY){
      this.gridlineH.css({'top': this.offset.top*this.zoom.sqrt + y*this.zoom.value});
      this.gridlineH.show();
    }
    else if(!gridY)
      this.gridlineH.hide();
  },

  hideGridLine: function(){
    this.gridlineV.hide();
    this.gridlineH.hide();
  },
  
  realignOrigin: function(){
    this.origin.left = this.$el.width()/2;
    
    this.moveTo(0, 0);
  },
  
  render: function(){
    this.$el.html( this.template( this.getRenderData() ) );
    this.fakeActorView = new FakeActorView({ editor: this });
    this.fakeActorView.render();
    this.$('.newActor .dock').append(this.fakeActorView.el);

    this.workspace = this.$('.workspace');
    this.addActor = this.$('.controls .newActor');
    this.actorDouble = this.$('.controls .actor.new');
    this.cancel = this.$('.controls .cancel');
    this.gridlineV = this.$('#gridlineV');
    this.gridlineH = this.$('#gridlineH');

    this.rbw = new RoleBackgroundView({ editor: this });
    this.workspace.before(this.rbw.render()); 
    
    this.settings = new SettingsView({ editor: this });
    this.$('.topBar').append(this.settings.render().el);

    this.actors.each(this.appendActor);
    this.actorGroups.each(this.appendActorGroup);

    // append all connections
    this.accountabilityConnections.each(this.appendConnection);
    this.moneyConnections.each(this.appendConnection);
    this.monitoringConnections.each(this.appendConnection);

    this.afterRender();
    
    // call this slightly delayed to give the browser
    // time to layout the html changes
    // source: http://stackoverflow.com/questions/8225869/how-can-i-get-size-height-width-information-in-backbone-views
    _.defer(this.realignOrigin);
  },
  
  initializeDimensions: function(){
    this.origin.left = this.$el.width()/2;
  },
  
  getRenderData: function() {
    return { gestureSupport: Modernizr.gesture };
  },

  initializeConfig: function(){
    config.on('change:moneyConnectionMode', this.toggleActiveMoneyMode, this);
  },

  afterRender: function(){
    $(document).on('viewdragstop', this.checkDrop);

    this.$('#disbursedMoney').addClass("active");

    $(document).bind('keyup', this.keyUp);
    $(window).resize(this.realignOrigin);
    
    this.slider = this.$('.view.controls .bar').slider({ 
      orientation: "vertical",
      min: this.zoom.min,
      max: this.zoom.max,
      step: this.zoom.step,
      value: this.zoom.value,
      slide: this.slideZoom,
      change: this.slideZoom
    });

    //check if monitoring role is hidden and hide monitoring elements
    if(!this.country.get('showMonitoring')){
      this.$('#toggleMonitoringText').html('Off').removeClass('active');
      this.$('#monitoring').css({'display': 'none'});
      this.$('.draghandle.last').hide();
      this.$('span[rel=monitoring]').hide();
    }
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
    
    $(document).unbind(this.inputMoveEvent, this.pan);
    $(document).unbind('keyup', this.keyUp);
    $(document).off('viewdrag', this.calculateGridLines);
    $(document).off('viewSelected', this.viewSelected);
    $(document).off('viewdragstop', this.checkDrop);

    $(window).unbind('resize', this.realignOrigin);

    var country = this.country.get('abbreviation');
    socket.removeAllListeners(country + ':actor');
    socket.removeAllListeners(country + ':actor_group');
    socket.removeAllListeners(country + ':connection_money');
    socket.removeAllListeners(country + ':connection_accountability');
    socket.removeAllListeners(country + ':connection_monitoring');
  }
});