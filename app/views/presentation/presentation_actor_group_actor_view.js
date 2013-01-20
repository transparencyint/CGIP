var View = require('../view');
var ActorView = require('../actor_view');

module.exports = View.extend({

  tagName: 'li',
  
  className: 'actor-group-actor',
	template : require('views/templates/presentation/presentation_actor_group_actor'),

  width: 110,
  height: 30,

	events: {},

});