var View = require('./view');

module.exports = View.extend({
  
  template : require('./templates/actor'),
  
  className : 'actor',

  events: {
    'mousedown .name': 'dontDrag',
    'touchstart .name': 'dontDrag'
  },
  
  initialize: function(){
    _.bindAll(this, 'stopMoving');
    this.model.on('change', this.render, this);
  },

  dontDrag: function(event){
    event.stopPropagation();
  },
  
  stopMoving : function(){
    this.model.save({ 
      'pos' : {
        x : this.$el.offset().left + this.$el.width()/2,
        y : this.$el.offset().top + this.$el.height()/2
      }
    });
  },
  
  getRenderData : function(){
    return this.model.toJSON();
  },
  
  afterRender: function(){
    var pos = this.model.get('pos');
    var name = this.model.get('name');
    
    this.$el.css({
      left : pos.x,
      top : pos.y
    });

    this.$el.draggable('disable');
    this.$el.draggable({
      stop: this.stopMoving
    });

    this.$el.find('.name').text(name);
  },
});