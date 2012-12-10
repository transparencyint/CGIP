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

    this.$document = $(document);
  },

  disableDraggable: function(){
    this.dontDrag = true;
  },

  enableDraggable: function(){
    this.dontDrag = false;
  },

  dragStart: function(event){
    this.select(); // always select actor before dragging

    if(!this.dontDrag){
      event.stopPropagation();
      
      var pos = this.model.get('pos');
      
      this.startX = event.pageX - pos.x;
      this.startY = event.pageY - pos.y;
    
      this.$document.on('mousemove.global', this.drag);
      this.$document.one('mouseup', this.dragStop);
    }
  },

  drag: function(event){ 
    var pos = this.model.get('pos');
    
    var dx = (event.pageX - pos.x - this.startX) / this.editor.zoom.value;
    var dy = (event.pageY - pos.y - this.startY) / this.editor.zoom.value;
    
    this.findNearestGridPoint();
    this.editor.dragGroup(dx, dy);

    // emit a global drag event
    this.$document.trigger('viewdrag', this);
  },
  
  updatePosition: function(){
    var pos = this.model.get('pos');
    
    this.$el.css({
      left: pos.x,
      top: pos.y
    });
  },
  
  dragStop : function(){
    this.snapToGrid();
    // emit a global dragstop event
    this.$document.trigger('viewdragstop', this);
    $(document).off('mousemove.global', this.drag);
  },

  select: function(event){
    if(!this.$el.hasClass("ui-selected")){
      this.$el.addClass("ui-selected").siblings().removeClass("ui-selected");
    }
    this.editor.actorSelected(this);
  },

  findNearestGridPoint: function(){
    var gridSize = this.editor.gridSize;
    var pos = this.model.get('pos');

    var x = Math.round(pos.x / gridSize) * gridSize;
    var y = Math.round(pos.y / gridSize) * gridSize;

    var editor = this.editor;
    var currentActor =  this;
    var foundGridX = false;
    var foundGridY = false;

    //check if there is an actor at the nearest grid point
    var actors = this.editor.actors.models;

    _.each(actors, function(actor){
      var actorX = Math.round(actor.attributes.pos.x);
      var actorY = Math.round(actor.attributes.pos.y);

      if(currentActor.model.id != actor.id){
        if(actorX == x)
          foundGridX = true;
        if(actorY == y)
          foundGridY = true;
      }
    });

    editor.showGridLine(x, y, foundGridX, foundGridY);
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
    
    if(dx !== 0 || dy !== 0){
      var editor = this.editor;

      $({percent: 0}).animate({percent: 1}, {
        step: function(){
          var stepX = this.percent * dx;
          var stepY = this.percent * dy;

          editor.dragGroup(stepX, stepY);

          dx -= stepX;
          dy -= stepY;
        },
        duration: 100,
        complete: function(){
          editor.saveGroup();

          // hide grid line
          editor.hideGridLine();
        }
      });
    } else {
      this.editor.saveGroup();
    }
  },

  destroy: function(){
    View.prototype.destroy.call(this);
    this.$document.off('mousemove.global', this.drag);
    this.$document.off('mouseup', this.dragStop);
  }
});