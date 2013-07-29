// This view is the equivalent of the actor group view. 

var View = require('../view');
var ActorView = require('../actor_view');
var ActorGroupView = require('../actor_group_view');
var PresentationActorDetailsView = require('./presentation_actor_details_view');
var PresentationActorGroupActorView = require('./presentation_actor_group_actor_view');

module.exports = View.extend({

  className: 'actor-group actor-holder',

	template : require('views/templates/presentation/presentation_actor_group'),

	events: {
		'click .dropdown-control' : 'toggle',
    'dblclick' : 'showDetails'
	},

  initialize: function(options){
    View.prototype.initialize.call(this);

    this.width = options.editor.actorWidth;
    this.height = options.editor.actorHeight;

    _.bindAll(this, 'addSubActorView');
  },

  determineName: ActorView.prototype.determineName,
  getRenderData: ActorGroupView.prototype.getRenderData,
  updateRole: ActorView.prototype.updateRole,

  showDetails: function(event){
    this.modal = new PresentationActorDetailsView({ model: this.model, actor: this, editor: this.options.editor });
    this.options.editor.$el.append(this.modal.render().el);
  },

  updatePosition: function(){
    var pos = this.model.get('pos');
    
    this.$el.css({
      left: pos.x,
      top: pos.y
    });
  },

  addSubActorView: function(actor){
    var newView = new PresentationActorGroupActorView({model: actor, editor: this.options.editor});
    this.$('.actors').append(newView.render().el);
    this.actorViews[actor.id] = newView;
    
    this.$el.removeClass('empty');
  },

  toggle: function(){
    this.$('.actors').toggle();
    this.$('.arrow').toggleClass('toggleArrow');
  },

  afterRender: function(){
    this.updatePosition(); 
    this.updateRole();   
    this.actorViews = {};

    this.model.actors.each(this.addSubActorView);
    this.$el.attr('id', this.model.id);
  },

});