var View = require('../view');
var ActorEditor = require('../actor_editor');
var PresentationConnectionView = require('./presentation_connection_view');
var PresentationActorView = require('./presentation_actor_view');
var PresentationActorGroupView = require('./presentation_actor_group_view');

module.exports = View.extend({
  
  id: 'actorPresentation',

  template: require('views/templates/presentation/country_map'),

  events: {
    // view controls
    'click .zoom.in': 'zoomIn',
    'click .zoom.out': 'zoomOut',
    'click .fit.screen': 'fitToScreen',
    
    // start to pan..
    'mousedown': 'dragStart',
    
    // ..except when your mouse touches the controls
    'mousedown .controls': 'stopPropagation',
    'click .controls': 'stopPropagation',
  },

  initialize: function(){
		this.initializeProperties();
    this.initializeDimensions();

		_.bindAll(this, 'appendActor', 'appendActorGroup', 'appendConnection', 'realignOrigin', 'moveTo', 'slideZoom');
  
  },

  initializeProperties: ActorEditor.prototype.initializeProperties,
  offsetToCoords: ActorEditor.prototype.offsetToCoords,
  moveTo: ActorEditor.prototype.moveTo,
  initializeDimensions: ActorEditor.prototype.initializeDimensions,

  //zoomFunctions
  zoomIn: ActorEditor.prototype.zoomIn,
  zoomOut: ActorEditor.prototype.zoomOut,
  zoomTo: ActorEditor.prototype.zoomTo,
  slideZoom: ActorEditor.prototype.slideZoom,
  fitToScreen: ActorEditor.prototype.fitToScreen,
  dragStart: ActorEditor.prototype.dragStart,
  stopPropagation: ActorEditor.prototype.stopPropagation,
  getBoundingBox: ActorEditor.prototype.getBoundingBox,

  appendActor: function(actor){
		var presentationActorView = new PresentationActorView({ model : actor, editor: this});
		presentationActorView.render();
		this.workspace.append(presentationActorView.el);
  },

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
    this.accountabilityConnections.each(this.appendConnection);
    this.moneyConnections.each(this.appendConnection);
    this.monitoringConnections.each(this.appendConnection);

    this.afterRender();

    _.defer(this.realignOrigin);
  },

  afterRender: function(){
    $(window).resize(this.realignOrigin);

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

});