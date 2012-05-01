var View = require('./view');

module.exports = View.extend({
  
  template: require('./templates/connection'),
  
  className : 'connection',
  tagName : 'canvas',

  events : {
    mousedown : "startToDrag",
  },

  initialize: function(options){
    if(arguments.length > 0){
      this.from = options.from;
      this.to = options.to;      
    }
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
    return this.from.toJSON();
  },
  
  afterRender: function(){
    var posFrom = this.from.get('pos');    
    var posTo = this.to.get('pos');

    this.update(posFrom.x, posFrom.y, posTo.x, posTo.y, '3', 'white');
  },

  update: function(x0, y0, x1, y1, size, color){
    this.size = size || this.size;
    this.color = color || this.color;
    this.pos = {
      x : Math.min(x0, x1),
      y : Math.min(y0, y1)
    }
    this.start = {
      x : x0 - this.pos.x,
      y : y0 - this.pos.y,
    };
    this.end = {
      x : x1 - this.pos.x,
      y : y1 - this.pos.y,
    };
    
    this.width = Math.abs(this.end.x - this.start.x);
    this.height = Math.abs(this.end.y - this.start.y);
     
    this.cp1 = {
      x : this.start.x,
      y : this.end.y,
    };
    this.cp2 = {
      x : this.end.x,
      y : this.start.y,
    };
    
    this.renderCanvas();
  },
  
  renderCanvas: function(){
    this.ctx = this.$el.get(0).getContext('2d');
    
    this.$el.attr({
      'width': this.width,
      'height': this.height
    });
    this.$el.css({
      'left': this.pos.x + "px",
      'top': this.pos.y + "px"
    });
    
    this.ctx.lineWidth = this.size;
    this.ctx.strokeStyle = this.color;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.start.x, this.start.y);
    this.ctx.bezierCurveTo(this.cp1.x, this.cp1.y, this.cp2.x, this.cp2.y, this.end.x, this.end.y);
    this.ctx.stroke();

  },

});

