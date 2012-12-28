var DraggableView = require('./draggable_view');

module.exports = DraggableView.extend({
  noGridlines: true,
  selectable: true,

  tagName: 'li',
  className: 'actor-group-actor',
  template : require('./templates/actor_group_actor'),

  events: function(){
    var parentEvents = DraggableView.prototype.events;
    // merge the parent events and the current events
    return _.defaults({
      'mousedown' : 'dragStart',
      'click'     : 'showInfo'
    }, parentEvents);
  },

  dragStart: function(event){
    this.originalElement = this.$el;
    
    this.$el = this.$el.clone();
    this.$el.addClass('dragging');

    var offset = this.originalElement.offset();
    var coords = this.editor.offsetToCoords(offset);
    this.model.set('pos', { x: coords.x, y: coords.y });
    
    this.$el.appendTo($('.workspace'));

    DraggableView.prototype.dragStart.call(this, event);
  },

  dragStop: function(){
    this.$el.remove();
    this.$el = this.originalElement;

    DraggableView.prototype.dragStop.call(this);
  },

  showInfo: function(event){
    event.stopPropagation();
    console.log('info');
    return false;
  },

  destroy: function(){
    DraggableView.prototype.destroy.call(this);
    this.originalElement = null;
  }

});