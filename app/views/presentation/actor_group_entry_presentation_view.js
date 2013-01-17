var View = require('../view');
var ActorView = require('../actor_view');

module.exports = View.extend({

  tagName: 'li',
  
  className: 'actor-group-actor',
  template : require('views/templates/presentation/actor_group_entry_presentation'),

  width: 110,
  height: 30,

  events: {},

});