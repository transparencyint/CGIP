var DraggableView = require('./draggable_view');

module.exports = DraggableView.extend({
  saveAfterSnap: false,

  tagName: 'li',
  className: 'actor-group-actor',
  template: require('./templates/actor_group_actor'),
  
  width: 110,
  height: 30,


  clone: function(){
    this.cloned = true;
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
  },

  dragByDelta: function(dx, dy){
    if(!this.cloned) this.clone();
    this.model.moveByDelta(dx, dy);
  },

  dragStop: function(){
    DraggableView.prototype.dragStop.call(this);
    
    this.$el.remove();
    this.$el = this.originalElement;
    this.$el.removeClass('hidden');
    this.cloned = false;
  },

  updatePosition: function(){
    if(this.isDragging)
      DraggableView.prototype.updatePosition.call(this);
  },

  destroy: function(){
    DraggableView.prototype.destroy.call(this);
    if(this.originalElement){
      this.originalElement.remove(); 
    }
  }

});