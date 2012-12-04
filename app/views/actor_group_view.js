var DraggableView = require('./draggable_view');

module.exports = DraggableView.extend({
  className: 'actor-group',
  template : require('./templates/actor_group'),

  initialize: function(){
    DraggableView.prototype.initialize.call(this);

    _.bindAll(this, 'checkHover', 'checkDrop');

    this.$document = $(document);

    this.$document.on('viewdrag', this.checkHover);
    this.$document.on('mouseup', this.checkDrop);
  },

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

  checkHover: function(event, eventData){
    if(eventData.view.$el.hasClass('actor')){
      var myPos = this.$el.offset();
      var view = eventData.view;
      var viewPos = view.$el.offset();

      var myWidth = this.$el.outerWidth();
      var myHeight = this.$el.outerHeight();
      var overlaps =   (viewPos.left < myPos.left + myWidth)
                    && (viewPos.left + view.width > myPos.left)
                    && (viewPos.top < myPos.top + myHeight)
                    && (viewPos.top + view.height > myPos.top);
                    
      console.log(overlaps)
      
    }
  },

  checkDrop: function(event){
    //this.$el.removeClass('hovered');
  },

  highlightGroup: function(){
    alert('This group contains ' + this.model.actors.length + ' valid actor(s): ' + this.model.get('actors').join(','));
  },

  destroy: function(){
    DraggableView.prototype.destroy.call(this);

    this.$document.off('viewdrag', this.checkHover);
    this.$document.off('mouseup', this.checkDrop);
  }
});