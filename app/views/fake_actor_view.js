var DraggableView = require('./draggable_view');
var Actor = require('models/actor');

module.exports = DraggableView.extend({
  noGridlines: true,
  dontSnap: true,

  className: 'actor new',
  template: require('./templates/fake_actor'),

  events: {
    'mousedown'  : 'dragStart'
  },

  initialize: function(){
    // a fake actor model
    this.model = new Actor();
    // stub the save function
    this.model.save = function(){};
    
    this.width = this.options.editor.smallActorWidth;
    this.height = this.options.editor.smallActorHeight;

    DraggableView.prototype.initialize.call(this);
  },

  dragByDelta: function(dx, dy){
    this.model.moveByDelta(dx, dy);
  }
});