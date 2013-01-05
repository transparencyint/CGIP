var DraggableView = require('./draggable_view');
var Actor = require('models/actor');

module.exports = DraggableView.extend({
  noGridlines: true,
  dontSnap: true,

  className: 'actor new',
  template: require('./templates/fake_actor'),

  events: {
    'mousedown .inner'  : 'dragStart'
  },

  initialize: function(){
    // a fake actor model
    this.model = new Actor();
    // stub the save function
    this.model.save = function(){};

    DraggableView.prototype.initialize.call(this);
  },

  dragByDelta: function(dx, dy){
    this.model.moveByDelta(dx, dy);
  }
});