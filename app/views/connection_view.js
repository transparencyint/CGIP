var View = require('./view');

module.exports = View.extend({
  
  template: require('./templates/connection'),
  
  className : 'connection',

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
    var pos = this.model.get('pos');    
    var connections = this.model.get('connections');
    
    this.$el.append($('<canvas id="connection' + this.model.get('id') + '"></canvas>'));

    actorConnection = document.getElementById("myCanvas");  
    ctx = $(actorConnection).get(0).getContext('2d');  
    ctx.lineWidth = 6;  
    ctx.strokeStyle = "#333";   
    ctx.beginPath();  
    //ctx.moveTo(pos.x, pos.y);  
    ctx.bezierCurveTo(150, 100, 350, 100, 493, 389);  
    ctx.stroke();   
     */
  },
});

