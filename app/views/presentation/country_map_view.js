var View = require('../view');
var ActorEditor = require('../actor_editor');
var PresentationConnectionView = require('./presentation_connection_view');
var PresentationActorView = require('./presentation_actor_view');
var PresentationActorGroupView = require('./presentation_actor_group_view');

module.exports = View.extend({
  
  id: 'actorPresentation',

  template: require('views/templates/presentation/country_map'),

  initialize: function(){
		this.initializeProperties();
    this.initializeDimensions();

		_.bindAll(this, 'appendActor', 'appendActorGroup', 'appendConnection', 'realignOrigin', 'moveTo');
  
  },

  initializeProperties: ActorEditor.prototype.initializeProperties,
  offsetToCoords: ActorEditor.prototype.offsetToCoords,
  //realignOrigin: ActorEditor.prototype.realignOrigin,
  moveTo: ActorEditor.prototype.moveTo,
  initializeDimensions: ActorEditor.prototype.initializeDimensions,

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

    //check if monitoring role is hidden and hide monitoring elements
    if(!this.country.get('showMonitoring')){
      this.$('#toggleMonitoringText').html('Off').removeClass('active');
      this.$('#monitoring').css({'display': 'none'});
      this.$('.draghandle.last').hide();
      this.$('span[rel=monitoring]').hide();
    }
  },

});