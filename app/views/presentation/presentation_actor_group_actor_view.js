// This view is the equivalent of the actor group actor view. 

var View = require('../view');
var PresentationActorView = require('./presentation_actor_view');

module.exports = View.extend({

  tagName: 'li',
  
  className: 'actor-group-actor actor',
  template : require('views/templates/presentation/presentation_actor_group_actor'),
  
  width: 134,
  height: 45,

  events: {
    'click': 'showDetails'
  },

  showDetails: PresentationActorView.prototype.showDetails

});