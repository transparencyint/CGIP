var View = require('./view');

module.exports = View.extend({
  
  template: require('./templates/actor'),
  
  className : 'actor',
  
  events : {
    mousedown : "startToDrag",
  },
  
  initialize: function(){

  },
  
  startToDrag : function(event){
    event.preventDefault();
    
    if(event.button === 2) return true; // right-click
    
    var myOffset = this.$el.offset();
    startPos = { 
      x : normalizedX(event) - myOffset.left,
      y : normalizedY(event) - myOffset.top
    };
    $(document).bind(inputMove, $.proxy( this, "moveElement"));
    this.moveElement(event);
  },

  moveElement : function(event){
      this.$el.css({ 
        top : normalizedY(event) - startPos.y,
        left : normalizedX(event) - startPos.x
      });
  },
  
  getRenderData : function(){
    return this.model.toJSON();
  },
  
  afterRender: function(){
    var pos = this.model.get('pos');
    this.$el.css({
      left : pos.x,
      top : pos.y,
    });
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

$(document).bind(inputUp, function(){ $(this).unbind(inputMove); });

function normalizedX(event){
	return window.Touch ? event.originalEvent.touches[0].pageX : event.pageX;
}	

function normalizedY(event){
	return window.Touch ? event.originalEvent.touches[0].pageY : event.pageY;
}