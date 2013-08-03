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

  scopeElements: ActorEditor.prototype.scopeElements,
  scopeFromActor: ActorEditor.prototype.scopeFromActor,
  scopeFromConnection: ActorEditor.prototype.scopeFromConnection,
  scopeFromMoneyConnection: ActorEditor.prototype.scopeFromMoneyConnection,
  _scopeFromMoneyConnection: ActorEditor.prototype._scopeFromMoneyConnection,
  unScopeElements: ActorEditor.prototype.unScopeElements,

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