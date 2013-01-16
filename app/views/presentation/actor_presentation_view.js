var View = require('../view');
var ActorView = require('../actor_view');

module.exports = View.extend({

	template : require('views/templates/presentation/actor_presentation'),

	className : 'actor',

	events: {},

	initialize: function(){

	},

	determineName: ActorView.prototype.determineName,
	getRenderData: ActorView.prototype.getRenderData,

	updatePosition: function(){
    var pos = this.model.get('pos');
    
    this.$el.css({
      left: pos.x,
      top: pos.y
    });
  },

	afterRender: function(){
		this.updatePosition();
    this.$el.attr('id', this.model.id);
  },

});