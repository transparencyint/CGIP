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
    
    this.pos = {
      x : Math.min(from.x, to.x),
      y : Math.min(from.y, to.y)
    }
    this.start = {
      x : from.x - this.pos.x,
      y : from.y - this.pos.y,
    };
    this.end = {
      x : to.x - this.pos.x,
      y : to.y - this.pos.y,
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
      
    this.$el.attr({
      'width': this.width,
      'height': this.height
    }).css({
      'left': this.pos.x + "px",
      'top': this.pos.y + "px"
    });
    
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = 'white';
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.start.x, this.start.y);
    this.ctx.bezierCurveTo(this.cp1.x, this.cp1.y, this.cp2.x, this.cp2.y, this.end.x, this.end.y);
    this.ctx.stroke();
  }

});