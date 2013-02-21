var View = require('../view');
var ActorView = require('../actor_view');
var ActorGroupView = require('../actor_group_view');
var PresentationActorGroupActorView = require('./presentation_actor_group_actor_view');

module.exports = View.extend({

  className: 'actor-group actor-holder',

	template : require('views/templates/presentation/presentation_actor_group'),

	events: {
		'click .dropdown-control' : 'toggle'
	},

  initialize: function(){
    View.prototype.initialize.call(this);
    _.bindAll(this, 'addSubActorView');
  },

  determineName: ActorView.prototype.determineName,
  getRenderData: ActorGroupView.prototype.getRenderData,

  updatePosition: function(){
    var pos = this.model.get('pos');
    
    this.$el.css({
      left: pos.x,
      top: pos.y
    });
  },

  addSubActorView: function(actor){
    var newView = new PresentationActorGroupActorView({model: actor, editor: this.editor});
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
    this.actorViews = {};

    this.model.actors.each(this.addSubActorView);
    this.$el.attr('id', this.model.id);
  },

});