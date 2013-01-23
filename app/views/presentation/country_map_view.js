var View = require('../view');
var ActorEditor = require('../actor_editor');
var PresentationConnectionView = require('./presentation_connection_view');
var PresentationActorView = require('./presentation_actor_view');
var PresentationActorGroupView = require('./presentation_actor_group_view');
var PresentationRoleBackgroundView = require('./presentation_role_background_view');

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
    'click .tool .moneyMode .small': 'toggleMoneyMode',
  },

  initialize: function(){
		this.initializeProperties();
    this.initializeDimensions();
    this.initializeConfig();

		_.bindAll(this, 'appendActor', 'appendActorGroup', 'appendConnection', 'realignOrigin', 'moveTo', 'slideZoom', 'dragStop', 'drag');
  
  },

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
  stopPropagation: ActorEditor.prototype.stopPropagation,
  getBoundingBox: ActorEditor.prototype.getBoundingBox,


  //enable panning
  dragStart: ActorEditor.prototype.dragStart,
  drag: ActorEditor.prototype.drag,
  dragStop: ActorEditor.prototype.dragStop,

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
		var editor = this;

    this.$el.html( this.template() );

		this.workspace = this.$('.workspace');

    //render the actors and actor groups
		this.actors.each(this.appendActor);
		this.actorGroups.each(this.appendActorGroup);

    //render the connections
    this.accountabilityConnections.each(this.appendConnection);
    this.moneyConnections.each(this.appendConnection);
    this.monitoringConnections.each(this.appendConnection);

    //display the role backgrounds
    this.presentationRoleBackgroundView = new PresentationRoleBackgroundView({ editor: editor });
    this.workspace.before(this.presentationRoleBackgroundView.render()); 

    this.afterRender();

    _.defer(this.realignOrigin);
  },

  afterRender: function(){

    this.$('#disbursedMoney').addClass("active");
    
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

  toggleMoneyMode: function(event){
    var target = $(event.target);

    var currentID = target.attr('id');
    if(currentID === 'disbursedMoney')
      config.set('moneyConnectionMode','disbursedMode'); 
    else if(currentID === 'pledgedMoney')
      config.set('moneyConnectionMode','pledgedMode'); 
  },

  toggleActiveMoneyMode: function(){
    if(config.get('moneyConnectionMode') === 'disbursedMode')
      this.$('#disbursedMoney').addClass("active").siblings().removeClass("active");
    else 
      this.$('#pledgedMoney').addClass("active").siblings().removeClass("active");
  }

});