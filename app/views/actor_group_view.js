var DraggableView = require('./draggable_view');

module.exports = DraggableView.extend({
  className: 'actor-group',
  template : require('./templates/actor_group'),

  initialize: function(){
    DraggableView.prototype.initialize.call(this);

    _.bindAll(this, 'checkHover', 'checkDrop');

    // the current hover state
    this.hovered = false;
    this.$document = $(document);

    this.$document.on('viewdrag', this.checkHover);
    this.$document.on('viewdragstop', this.checkDrop);
  },

  events: function(){
    var parentEvents = DraggableView.prototype.events;
    // merge the parent events and the current events
    return _.defaults({
      'mousedown .caption': 'select',
      'mouseover'         : 'showActors'
    }, parentEvents);
  },

  getRenderData: function(){
    var data = DraggableView.prototype.getRenderData.call(this);
    data.actors = this.model.actors.toJSON();
    return data;
  },

  afterRender: function(){
    this.updatePosition();
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

  checkHover: function(event, view){
    if(view.$el.hasClass('actor')){
      // if it overlaps, give feedback
      if(this.overlapsWith(view))
        this.dragHover(view);
      else
        if(this.hovered){
          this.dragOut();
        }
    }
  },

  dragHover: function(view){
    this.hovered = true;
    this.hoveredView = view;
    this.hoveredView.$el.css('opacity', .5);
    this.$el.addClass('show-actors');
  },

  dragOut: function(){
    this.hovered = false;
    this.$el.removeClass('show-actors');
    if(this.hoveredView){
      this.hoveredView.$el.css('opacity', 1);
      this.hoveredView = null;  
    }
  },

  checkDrop: function(event, view){
    if(this.overlapsWith(view))
      console.log('overlap');
    this.dragOut();      
  },

  showActors: function(){

  },

  destroy: function(){
    DraggableView.prototype.destroy.call(this);

    this.$document.off('viewdrag', this.checkHover);
    this.$document.off('viewdragstop', this.checkDrop);
  }
});