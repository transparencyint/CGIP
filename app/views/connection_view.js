var View = require('./view');

module.exports = View.extend({
  
  template: require('./templates/connection'),
  
  tagName : 'canvas',

  initialize: function(options){
    if(arguments.length > 0){
      this.from = options.from;
      this.to = options.to;      
    }

    if(this.from)
      this.from.on('change:pos', this.update, this);
      
    if(this.to)
      this.to.on('change:pos', this.update, this);
  },

  getRenderData : function(){
    return this.from.toJSON();
  },
  
  afterRender: function(){
    this.ctx = this.$el.get(0).getContext('2d');
    this.update();
  },

  update: function(){
    var from = this.from.get('pos');    
    var to = this.to.get('pos');
    
    var pos = {
      x : Math.min(from.x, to.x),
      y : Math.min(from.y, to.y)
    }
    var start = {
      x : from.x - pos.x,
      y : from.y - pos.y,
    };
    var end = {
      x : to.x - pos.x,
      y : to.y - pos.y,
    };
    
    this.width = Math.abs(end.x - start.x);
    this.height = Math.abs(end.y - start.y);
     
    var cp1 = {
      x : start.x,
      y : end.y,
    };
    var cp2 = {
      x : end.x,
      y : start.y,
    };
      
    this.$el.attr({
      'width': this.width,
      'height': this.height
    }).css({
      'left': pos.x + "px",
      'top': pos.y + "px"
    });
    
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = 'white';
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    this.ctx.stroke();
  }

});