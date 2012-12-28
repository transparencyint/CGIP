var DraggableView = require('./draggable_view');

module.exports = DraggableView.extend({
  noGridlines: true,
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
    this.$el.addClass('dragging');

    var offset = this.$el.offset();
    var coords = this.editor.offsetToCoords(offset);
    this.model.set('pos', { x: coords.x, y: coords.y });
    
    this.detached = this.$el.detach();
    this.detached.appendTo($('.workspace'));

    DraggableView.prototype.dragStart.call(this, event);
  },

  dragStop: function(){
    debugger
    this.$el = this.detached;

    DraggableView.prototype.dragStop.call(this);
    this.$el.removeClass('dragging');
  },

  showInfo: function(event){
    event.stopPropagation();
    console.log('info');
    return false;
  }

});