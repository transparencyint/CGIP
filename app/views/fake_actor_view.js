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
    
    this.width = this.options.editor.fakeActorWidth;
    this.height = this.options.editor.fakeActorHeight;

    DraggableView.prototype.initialize.call(this);
  },

  // moves the view back to the starting point
  reset: function(){
    this.dragging = false;
    this.model.set({ pos: { x:0, y:0 }});
    this.$el.css('opacity', 1);
  },

  dragByDelta: function(dx, dy){
    this.model.moveByDelta(dx, dy);
  }
});