var DraggableView = require('./draggable_view');

module.exports = DraggableView.extend({
  className: 'actor-group',
  template : require('./templates/actor_group'),

  events: function(){
    var parentEvents = DraggableView.prototype.events;
    // merge the parent events and the current events
    return _.defaults({
      'click'             : 'highlightGroup',
      'mousedown .caption': 'select'
    }, parentEvents);
  },

  afterRender: function(){
    this.updatePosition();
  },

  highlightGroup: function(){
    alert('This group contains ' + this.model.actors.length + ' valid actor(s): ' + this.model.get('actors').join(','));
  }
});