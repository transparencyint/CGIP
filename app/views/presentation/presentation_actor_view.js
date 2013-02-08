var View = require('../view');
var ActorView = require('../actor_view');
var PresentationActorDetailsView = require('views/presentation/presentation_actor_details_view');

module.exports = View.extend({

	template : require('views/templates/presentation/presentation_actor'),

	className : 'actor',

	events: {
		'click': 'showDetails'
	},

	initialize: function(options){
		this.width = options.editor.actorWidth;
    this.height = options.editor.actorHeight;

    this.initOrganizationType();
    
  	_.bindAll(this, 'showDetails');
	},

	determineName: ActorView.prototype.determineName,
  getRenderData: ActorView.prototype.getRenderData,
	initOrganizationType: ActorView.prototype.initOrganizationType,
  updateCorruptionRisk: ActorView.prototype.updateCorruptionRisk,

	showDetails: function(){
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

	afterRender: function(){
		this.updatePosition();
    this.updateCorruptionRisk();
    this.$el.attr('id', this.model.id);
  },

});