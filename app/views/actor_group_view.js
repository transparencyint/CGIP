var DraggableView = require('./draggable_view');

module.exports = DraggableView.extend({
  template : require('./templates/actor_group'),

  events: function(){
    var parentEvents = DraggableView.prototype.events;
    // merge the parent events and the current events
    return _.defaults({
      'click'         : 'highlightGroup'
    }, parentEvents);
  },

  highlightGroup: function(){
    alert('This group contains ' + this.model.actors.length + ' valid actor(s): ' + this.model.get('actors').join(','));
  }
});