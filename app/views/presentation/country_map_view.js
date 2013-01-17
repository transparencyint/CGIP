var View = require('../view');
var ActorEditor = require('../actor_editor');
var ActorPresentationView = require('./actor_presentation_view');
var ActorPresentationGroupView = require('./actor_presentation_group_view');

module.exports = View.extend({

  template: require('views/templates/presentation/country_map'),

  initialize: function(){
		this.initializeProperties();

		_.bindAll(this, 'appendActor', 'appendActorGroup');
  
  },

  initializeProperties: ActorEditor.prototype.initializeProperties,

  appendActor: function(actor){
		var actorPresentationView = new ActorPresentationView({ model : actor, editor: this});
		actorPresentationView.render();
		this.workspace.append(actorPresentationView.el);
  },

  appendActorGroup: function(actorGroup){
    var actorPresentationGroupView = new ActorPresentationGroupView({ model : actorGroup, editor: this});
    actorPresentationGroupView.render();
    this.workspace.append(actorPresentationGroupView.el);
    this.actorGroupViews[actorGroup.id] = actorPresentationGroupView;
  },

  render: function(){
		this.$el.html( this.template() );

		this.workspace = this.$('.workspace');
		this.actors.each(this.appendActor);
		this.actorGroups.each(this.appendActorGroup);
  },

});