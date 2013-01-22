var DraggableView = require('./draggable_view');

module.exports = DraggableView.extend({
  // the classes of views that are allowed to be dropped
  dropClasses: [],

  initialize: function(options){
    DraggableView.prototype.initialize.call(this, options);
    
    // the current hover state
    this.hovered = false;

    if(!this.$document) this.$document = $(document);

    _.bindAll(this, 'checkHover', '_checkDrop');

    this.$document.on('viewdrag', this.checkHover);
    this.$document.on('viewdragstop', this._checkDrop);
  },

  checkHover: function(event, view){
    // return if it's this view
    if(view === this) return

    var isAllowedToDrop = false;
    _.each(this.dropClasses, function(dropClass){ 
      if(view.$el.hasClass(dropClass))
        isAllowedToDrop = true;
    });

    if(isAllowedToDrop){
      // if it overlaps, give feedback
      if(this.overlapsWith(view))
        this._dragHover(view);
      else
        if(this.hovered){
          this._dragOut();
        }
    }
  },

  _dragHover: function(view){
    this.hovered = true;
    this.hoveredView = view;
    this.hoveredView.$el.css('opacity', .5);
    this.dragHover();
  },

  dragHover: function(){},

  _dragOut: function(){
    this.hovered = false;
    if(this.hoveredView){
      this.hoveredView.$el.css('opacity', 1);
      this.hoveredView = null;
    }
    this.dragOut();
  },

  dragOut: function(){},

  checkHover: function(){},

  _checkDrop: function(event, view){
    if(this.model.isLocked()) return; // return if model is locked
    if(event.isPropagationStopped()) return; // return if others stopped the propagation
    
    // return if it's this view
    if(view === this) return;

    this.checkDrop(event, view);

    if(this.hovered)
      this.dragOut();
  },

  checkDrop: function(){},

  destroy: function(){
    DraggableView.prototype.destroy.call(this);

    this.$document.off('viewdrag', this.checkHover);
    this.$document.off('viewdragstop', this.checkDrop);
  }
});