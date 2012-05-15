var View = require('./view');

module.exports = View.extend({
  
  template : require('./templates/actor'),
  
  className : 'actor',
  
  events : {
    mousedown : "startToDrag",
    touchstart : "startToDrag"
  },
  
  initialize: function(){
    _.bindAll(this, 'render');

    this.model.on('change', this.render);
  },
  
  startToDrag : function(event){
    event.preventDefault();
    
    if(event.button === 2) return true; // right-click
    
    var myOffset = this.$el.offset();
    startPos = { 
      x : normalizedX(event) - myOffset.left - this.$el.width()/2,
      y : normalizedY(event) - myOffset.top - this.$el.height()/2
    };
    $(document).bind(inputMove, $.proxy( this, "moveElement"));
    $(document).one(inputUp, $.proxy( this, "stopMoving"));
    this.moveElement(event);
  },

  moveElement : function(event){
    this.$el.css({ 
      top : normalizedY(event) - startPos.y,
      left : normalizedX(event) - startPos.x,
      'WebkitTransition' : ''
    });
  },
  
  stopMoving : function(){
    $(document).unbind(inputMove);
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
      top : pos.y,
      WebkitTransition : '500ms'
    });

    this.$el.find('.name').text(name);
  },
});

var inputDown, inputMove, inputUp;

if (window.Touch) {
	inputDown = "touchstart";
	inputMove = "touchmove";
	inputUp = "touchend";
}
else {
	inputDown = "mousedown";
	inputMove = "mousemove";
	inputUp = "mouseup";
}

function normalizedX(event){
	return window.Touch ? event.originalEvent.touches[0].pageX : event.pageX;
}	

function normalizedY(event){
	return window.Touch ? event.originalEvent.touches[0].pageY : event.pageY;
}