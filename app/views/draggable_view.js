var View = require('./view');

module.exports = View.extend({
  events: {},

  initialize: function(){
    View.prototype.initialize.call(this);
    _.bindAll(this, 'dragStop', 'drag');

    this.editor = this.options.editor;
    this.dontDrag = false;

    this.editor.on('disableDraggable', this.disableDraggable, this);
    this.editor.on('enableDraggable', this.enableDraggable, this);

    this.model.on('change:pos', this.updatePosition, this);
  },

  disableDraggable: function(){
    this.dontDrag = true;
  },

  enableDraggable: function(){
    this.dontDrag = false;
  },

  dragStart: function(event){
    this.select();

    if(!this.dontDrag){
      event.stopPropagation();
      var pos = this.model.get('pos');
      
      this.startX = event.pageX - pos.x;
      this.startY = event.pageY - pos.y;
    
      $(document).on('mousemove.global', this.drag);
      $(document).one('mouseup', this.dragStop);
    }
  },

  drag: function(event){ 
    var pos = this.model.get('pos');
    
    this.dragging = true;
    var dx = (event.pageX - pos.x - this.startX) / this.editor.zoom.value;
    var dy = (event.pageY - pos.y - this.startY) / this.editor.zoom.value;

    this.model.moveByDelta(dx, dy);

    // emit a global drag event
    $(document).trigger('viewdrag', this);
  },
  
  updatePosition: function(){
    var pos = this.model.get('pos');
    
    this.$el.css({
      left: pos.x,
      top: pos.y
    });
  },
  
  dragStop : function(){
    if(this.isDragging)
      this.snapToGrid();
    
    // emit a global dragstop event
    $(document).trigger('viewdragstop', this);
    $(document).off('mousemove.global', this.drag);

    this.isDragging = false;
  },

  snapToGrid: function(){
    //make drag available along a simple grid
    var gridSize = this.editor.gridSize;
    var pos =  this.model.get('pos');     

    //move the actor to the nearest grid point
    var x = Math.round(pos.x / gridSize) * gridSize;
    var y = Math.round(pos.y / gridSize) * gridSize;
    
    var dx = x - pos.x;
    var dy = y - pos.y;
    
    var actor = this.model;

    if(dx !== 0 || dy !== 0){
      var editor = this.editor;
      
      $({percent: 0}).animate({percent: 1}, {
        step: function(){
          var stepX = this.percent * dx;
          var stepY = this.percent * dy;

          actor.moveByDelta(stepX, stepY);

          dx -= stepX;
          dy -= stepY;
        },
        duration: 100,
        complete: function(){
          actor.save();

          // hide grid line
          editor.hideGridLine();
        }
      });
    } else {
      actor.save();
    }
  },

  destroy: function(){
    View.prototype.destroy.call(this);
    $(document).off('mousemove.global', this.drag);
    $(document).off('mouseup', this.dragStop);
  }
});