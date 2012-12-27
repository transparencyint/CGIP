var DraggableView = require('./draggable_view');

module.exports = DraggableView.extend({
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
    var pos = this.model.get('pos');
    console.log(event.pageX - pos.x );
    DraggableView.prototype.dragStart.call(this, event);
  },

  dragStop: function(){
    DraggableView.prototype.dragStop.call(this);
    this.$el.removeClass('dragging');
  },

  showInfo: function(event){
    event.stopPropagation();
    console.log('info');
    return false;
  }

});