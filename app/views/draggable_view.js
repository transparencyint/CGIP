var View = require('./view');

module.exports = View.extend({
  events: {
    'click' : 'dontUnselect'
  },

  initialize: function(){
    View.prototype.initialize.call(this);
    _.bindAll(this, 'dragStop', 'drag');

    this.editor = this.options.editor;
    
    this.wasOrIsDragging = false;
    this.dragDistance = 0;
    this.dragThreshold = 5;

    this.editor.on('disableDraggable', this.disableDraggable, this);
    this.editor.on('enableDraggable', this.enableDraggable, this);

    this.model.on('change:pos', this.updatePosition, this);
  },
  
  dontUnselect: function(event){
    event.stopPropagation();
  },

  disableDraggable: function(){
    this.dontDrag = true;
  },

  enableDraggable: function(){
    this.dontDrag = false;
  },

  dragStart: function(event){
    if(this.model && this.model.isLocked()) return;

    if(this.model && this.model.lockable)
      this.model.lock();
    
    this.select();

    if(!this.dontDrag){
      event.stopPropagation();
      event.preventDefault();
      
      this.dragDistance = 0;
      this.wasOrIsDragging = false;
      
      var pos = this.model.get('pos');
      
      this.startX = this.normalizedX(event) - pos.x;
      this.startY = this.normalizedY(event) - pos.y;
    
      $(document).on(this.inputMoveEvent, this.drag);
      $(document).one(this.inputUpEvent, this.dragStop);
    }
  },

  drag: function(event){ 
    var pos = this.model.get('pos');
    
    var dx = (this.normalizedX(event) - pos.x - this.startX) / this.editor.zoom.value;
    var dy = (this.normalizedY(event) - pos.y - this.startY) / this.editor.zoom.value;
    
    this.dragDistance += Math.sqrt(dx*dx + dy*dy);
    
    if(this.dragDistance > this.dragThreshold)
      this.wasOrIsDragging = true;

    this.dragByDelta(dx, dy);

    // emit a global drag event
    $(document).trigger('viewdrag', this);
  },
  
  dragByDelta: function(dx, dy){
    throw('dragByDelta is not implemented.')
  },

  updatePosition: function(){
    var pos = this.model.get('pos');
    
    this.$el.css(Modernizr.prefixed('transform'), 'translate3d('+ pos.x +'px,'+ pos.y +'px,0)');
  },
  
  dragStop : function(){
    if(this.model && this.model.lockable)
      this.model.unlock();

    if(this.isDragging){
      this.snapToGrid();
      // emit a global dragstop event
      $(document).trigger('viewdragstop', this);
    }
      
    $(document).off(this.inputMoveEvent, this.drag);
  },

  overlapsWith: function(view){
    var myPos = this.$el.offset();
    var viewPos = view.$el.offset();
    var myWidth = this.$el.outerWidth();
    var myHeight = this.$el.outerHeight();

    // check if have an intersection
    var overlaps =   (viewPos.left < myPos.left + myWidth)
                  && (viewPos.left + view.width > myPos.left)
                  && (viewPos.top < myPos.top + myHeight)
                  && (viewPos.top + view.height > myPos.top);
    return overlaps;
  },

  snapToGrid: function(){
    if(this.dontSnap) return;
    //make drag available along a simple grid
    var gridSize = this.editor.gridSize;
    var pos =  this.model.get('pos');     

    //move the actor to the nearest grid point
    var x = Math.round(pos.x / gridSize) * gridSize;
    var y = Math.round(pos.y / gridSize) * gridSize;

    var dx = x - pos.x;
    var dy = y - pos.y;
    
    if(dx !== 0 || dy !== 0){
      var view = this;

      $({percent: 0}).animate({percent: 1}, {
        step: function(){
          var stepX = this.percent * dx;
          var stepY = this.percent * dy;

          view.dragByDelta(stepX, stepY);

          dx -= stepX;
          dy -= stepY;
        },
        duration: 100,
        complete: function(){

          //fix the last animation step to generate integer values
          view.model.save({
            pos : {
              x: x,
              y: y
            }
          });
        }
      });
    } else {
      view.model.save();
    }
  },

  destroy: function(){
    View.prototype.destroy.call(this);
    $(document).off('mousemove.global', this.drag);
    $(document).off('mouseup', this.dragStop);
    this.model.unregisterLockEvents();
  }
});