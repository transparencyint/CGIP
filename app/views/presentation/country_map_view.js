// This view is the equivalent to the actor editor view just without the edit-functions.

var View = require('../view');
var ActorEditor = require('../actor_editor');
var PresentationConnectionView = require('./presentation_connection_view');
var PresentationActorView = require('./presentation_actor_view');
var PresentationActorGroupView = require('./presentation_actor_group_view');
var PresentationRoleBackgroundView = require('./presentation_role_background_view');
var SettingsView = require('./presentation_settings_view');

module.exports = View.extend({
  
  id: 'actorPresentation',

  template: require('views/templates/presentation/country_map'),

  events: function(){
    var _events = {

      // view controls
      'click .zoom.in': 'zoomIn',
      'click .zoom.out': 'zoomOut',
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

  initialize: function(){

		this.initializeProperties();
    this.initializeDimensions();
    this.initializeConfig();

		_.bindAll(this, 'scopeElements', 'selected', 'unScopeElements', 'closeMoneyModal', 'appendActor', 'appendActorGroup', 'appendConnection', 'realignOrigin', 'moveTo', 'slideZoom', 'panStop', 'pan');

    // disable scope mode
    $(document).on('viewdrag', this.unScopeElements);
    // actor selection
    $(document).on('viewSelected', this.selected);
  },

  // The country map borrows some of the functionality of the actor editor.
  initializeProperties: ActorEditor.prototype.initializeProperties,
  offsetToCoords: ActorEditor.prototype.offsetToCoords,
  moveTo: ActorEditor.prototype.moveTo,
  initializeDimensions: ActorEditor.prototype.initializeDimensions,
  initializeConfig: ActorEditor.prototype.initializeConfig,

  //zoomFunctions
  zoomIn: ActorEditor.prototype.zoomIn,
  zoomOut: ActorEditor.prototype.zoomOut,
  zoomTo: ActorEditor.prototype.zoomTo,
  slideZoom: ActorEditor.prototype.slideZoom,
  fitToScreen: ActorEditor.prototype.fitToScreen,
  showMoneyModal: ActorEditor.prototype.showMoneyModal,
  chooseMoneyMode: ActorEditor.prototype.chooseMoneyMode,
  closeMoneyModal: ActorEditor.prototype.closeMoneyModal,
  stopPropagation: ActorEditor.prototype.stopPropagation,
  getBoundingBox: ActorEditor.prototype.getBoundingBox,
  toggleActiveMoneyMode: ActorEditor.prototype.toggleActiveMoneyMode,
  updateWorkspace: ActorEditor.prototype.updateWorkspace,

  //enable panning
  panStart: ActorEditor.prototype.panStart,
  pan: ActorEditor.prototype.pan,
  panStop: ActorEditor.prototype.panStop,
  place: ActorEditor.prototype.place,

  pinchStart: ActorEditor.prototype.pinchStart,
  pinch: ActorEditor.prototype.pinch,
  dontPan: ActorEditor.prototype.dontPan,

  // Scope the editor's container
  scopeElements: function(view){

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
    this.unScopeElements();
    this.selectedActorView = null;
    this.selectedConnectionView = null;
    if(this.mode) this.mode.unselect();
    $('.selected').removeClass('selected');
  },

  stopPropagation: function(event){
    event.stopPropagation();
  },

  // Adds and renders an actor
  appendActor: function(actor){
		var presentationActorView = new PresentationActorView({ model : actor, editor: this});
		presentationActorView.render();
		this.workspace.append(presentationActorView.el);
  },

  // Adds and renders an actor group
  appendActorGroup: function(actorGroup){
    var presentationActorGroupView = new PresentationActorGroupView({ model : actorGroup, editor: this});
    presentationActorGroupView.render();
    this.workspace.append(presentationActorGroupView.el);
    this.actorGroupViews[actorGroup.id] = presentationActorGroupView;
  },

  appendConnection: function(connection){
    connection.pickOutActors(this.actors, this.actorGroups);

    var connView = new PresentationConnectionView({ model : connection, editor: this});

    connView.render();  
    this.workspace.append(connView.el);
  },

  realignOrigin: function(){
    this.origin.left = this.$el.width()/2;
    this.moveTo(0, 0);
  },

  render: function(){
    this.$el.html( this.template() );

		this.workspace = this.$('.workspace');

    //render the actors and actor groups
		this.actors.each(this.appendActor);
		this.actorGroups.each(this.appendActorGroup);

    //render the connections
    //-accountablity this.accountabilityConnections.each(this.appendConnection);
    this.moneyConnections.each(this.appendConnection);
    this.monitoringConnections.each(this.appendConnection);

    //display the role backgrounds
    this.presentationRoleBackgroundView = new PresentationRoleBackgroundView({ editor: this });
    this.workspace.before(this.presentationRoleBackgroundView.render()); 

    this.settings = new SettingsView({ editor: this });
    this.$('.topBar').append(this.settings.render().el);

    this.afterRender();

    _.defer(this.realignOrigin);
  },

  afterRender: function(){

    this.$('#disbursedMoney').addClass("active");
    
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

  }

});