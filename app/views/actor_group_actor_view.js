var DraggableView = require('./draggable_view');
var GroupActorDetailsView = require('./actor_group_actor_details');

module.exports = DraggableView.extend({
  saveAfterSnap: false,

  tagName: 'li',
  className: 'actor-group-actor',
  template: require('./templates/actor_group_actor'),
  
  width: 110,
  height: 30,

  events: function(){
    var parentEvents = DraggableView.prototype.events;
    // merge the parent events and the current events
    return _.defaults({
      'mousedown' : 'dragStart',
      'click'     : 'showDetails'
    }, parentEvents);
  },

  dragStart: function(event){
    // small actor version
    this.originalElement = this.$el;
    
    // normally-sized actor for dragging
    this.$el = this.$el.clone();
    this.$el.addClass('dragging');

    var offset = this.originalElement.offset();
    var coords = this.editor.offsetToCoords(offset, this.width, this.height);
    this.model.set('pos', coords);
    
    this.$el.appendTo($('.workspace'));
    this.originalElement.addClass('hidden');

    DraggableView.prototype.dragStart.call(this, event);
  },

  dragByDelta: function(dx, dy){
    this.model.moveByDelta(dx, dy);
  },

  dragStop: function(){
    DraggableView.prototype.dragStop.call(this);
    
    this.$el.remove();
    this.$el = this.originalElement;
    this.$el.removeClass('hidden');
  },

  updatePosition: function(){
    // don't update it's position
  },

  showDetails: function(event){
    event.stopPropagation();
    // add code for info display here
    this.modal = new GroupActorDetailsView({ model: this.model, actor: this, editor: this.options.editor });
    this.options.editor.$el.append(this.modal.render().el);
    return false;
  },

  destroy: function(){
    DraggableView.prototype.destroy.call(this);
    if(this.originalElement){
      this.originalElement.remove(); 
    }
  }

});