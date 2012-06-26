var View = require('./view');
var ContextMenuView = require('./contextmenu_view');

module.exports = View.extend({

  template: require('./templates/connection'),

  tagName : 'div',
  className : 'connection hasContextMenu',

  initialize: function(options){
    if(options.noClick)
      this.$el.unbind('click')

    if(this.model.from)
      this.model.from.on('change:pos', this.update, this);
      
    if(this.model.to)
      this.model.to.on('change:pos', this.update, this);

    this.model.on('destroy', this.destroy, this);
  },

  getRenderData : function(){
    return {};
  },

  select: function(event){
    if(!this.$el.hasClass("ui-selected")){
      this.$el.addClass("ui-selected").siblings().removeClass("ui-selected");
    }
  },
  
  afterRender: function(){
    this.strokeStyle = this.model.get("connectionType") === 'accountability' ? 'white' : '#f8df47'; // yellow
    this.selectStyle = 'hsl(205,100%,55%)';
    this.strokeWidth = 4;
    this.actorRadius = 60;
    this.markerSize = 4;
    this.$el.css('margin', -this.strokeWidth/2 + 'px 0 0 '+ -this.strokeWidth/2 + 'px');
    this.$el.svg();
    this.svg = this.$el.svg('get');
    var defs = this.svg.defs();
    var marker = this.svg.marker(defs, this.model.id, 1, this.markerSize/2, this.markerSize/2, this.markerSize/2, 'auto', { viewBox: '0 0 ' + this.markerSize + ' ' + this.markerSize});
    this.svg.use(marker, 0, 0, this.markerSize, this.markerSize, '#trianglePath', { fill: this.strokeStyle });
    
    this.g = this.svg.group();
    createDefs(this.markerSize, this.strokeStyle, this.selectStyle);
    this.update();

    this.contextmenu = new ContextMenuView({model: this.model, parent_el: this.$('path')});
    this.$el.append(this.contextmenu.render().el);
    
    this.$el.addClass( this.model.get("connectionType") );
  },

  update: function(){
    var from = this.model.from.get('pos');    
    var to = this.model.to.get('pos');
    
    var pos = {
      x : Math.min(from.x, to.x),
      y : Math.min(from.y, to.y)
    }    
    var start = {
      x : from.x - pos.x + this.strokeWidth/2,
      y : from.y - pos.y + this.strokeWidth/2
    };
    var end = {
      x : to.x - pos.x + this.strokeWidth/2,
      y : to.y - pos.y + this.strokeWidth/2
    };
    
    var width = Math.abs(from.x - to.x) + this.strokeWidth;
    var height = Math.abs(from.y - to.y) + this.strokeWidth;
      
    this.svg.configure({
      'width' : width,
      'height' : height
    }, true);
    this.$el.css({
      'left': pos.x + "px",
      'top': pos.y + "px",
      'width': width,
      'height': height
    });
    
    var angle = Math.atan(height/width); // * 180/Math.PI
    var endOffset = (this.actorRadius+(this.markerSize*this.strokeWidth/2));
    
    if(start.x < end.x){
      start.x += this.actorRadius*Math.cos(angle);
      end.x -= endOffset * Math.cos(angle);
    } else {
      start.x -= this.actorRadius*Math.cos(angle);
      end.x += endOffset * Math.cos(angle);
    }
    if(start.y < end.y){
      start.y += this.actorRadius*Math.sin(angle);
      end.y -= endOffset*Math.sin(angle);
    } else {
      start.y -= this.actorRadius*Math.sin(angle);
      end.y += endOffset*Math.sin(angle);
    }
    
    var cp1 = {
      x : start.x,
      y : end.y,
    };
    var cp2 = {
      x : end.x,
      y : start.y,
    };
    
    if (this.model.get("connectionType") === 'accountability'){

      //find the other edge length
      var a = 30;
      var b = getB(a);
      a = a/2;
      b = b/2;

      var midpoint = getMidpoint(start, end);

      var distance = getDistance(start, end);
      distance = distance/5;

      cp1 = getControlPoint1(start, end, midpoint, a, b, distance);
      cp2 = getControlPoint2(start, end, midpoint, a, b, distance);

    }
    else
    {
      //find the other edge length
      var a = 50;
      var b = getB(a);
      a = a/1.8;
      b = b/1.8;

      var midpoint = getMidpoint(start, end);

      var distance = getDistance(start, end);
      distance = distance/5;

      cp1 = getControlPoint1(start, end, midpoint, a, b, distance);
      cp2 = getControlPoint2(start, end, midpoint, a, b, distance);
    }

    var path = 'M'+ start.x +','+start.y+' C'+cp1.x+','+cp1.y+' '+cp2.x+','+cp2.y+' '+end.x+','+end.y;

    if(this.path) this.svg.remove(this.path);
    this.path = this.svg.path(this.g, path, {
      fill : 'none', 
      stroke : this.strokeStyle,
      'stroke-width' : this.strokeWidth, 
      'marker-end' : 'url(#'+ this.model.id +')'
    });
    
    //this.ctx.lineWidth = 2;
    //this.ctx.strokeStyle = 'white';
    //this.ctx.lineCap = 'round';
    //this.ctx.lineJoin = 'round';
    
    //this.ctx.beginPath();
    //this.ctx.moveTo(start.x, start.y);
    //this.ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    //this.ctx.stroke();
  }

});

function createDefs(markerSize, strokeStyle, selectStyle){
  if(this.svg === undefined){
    $('body').svg().find('> svg').attr('id', 'svgDefinitions');
    this.svg = $('body').svg('get');
    var defs = this.svg.defs();
    var markerSymbol = this.svg.symbol(defs, 'trianglePath', 0, 0, markerSize, markerSize);
    this.svg.path(markerSymbol, 'M 0 0 L '+ markerSize +' '+ markerSize/2 +' L 0 '+ markerSize +' z');

    var selectedMarker = this.svg.marker(defs, 'selectedTriangle', 1, markerSize/2, markerSize/2, markerSize/2, 'auto', { viewBox: '0 0 ' + markerSize + ' ' + markerSize });
    this.svg.use(selectedMarker, 0, 0, markerSize, markerSize, '#trianglePath', { fill: selectStyle });
  }
}

function getB(a){
  var c = 100;
  var gamma = 90;

  var alpha = a * Math.asin(a * Math.sin(gamma) / c);
  var beta = 180 - alpha - gamma;
  var b =  a * Math.sin(beta) / Math.sin(alpha);

  return b;
}

function getMidpoint(start, end){
  var midpoint = {
    x : (start.x + end.x)/2,
    y : (start.y + end.y)/2,
  };
  return midpoint;
}

function getDistance(start, end){
  return Math.sqrt((start.x-end.x)*(start.x-end.x) + (start.y - end.y)*(start.y - end.y));
}

function getControlPoint1(start, end, midpoint, a, b, distance){
var cp1 = {
      x : start.x,
      y : end.y,
    };

  if(start.x < end.x){
        if (start.y < end.y){
          cp1.x = midpoint.x - a - distance;
          cp1.y = midpoint.y + b - distance;
        }else{
          cp1.x = midpoint.x + a - distance;
          cp1.y = midpoint.y + b + distance;
        }
      }
      else{
        if (start.y < end.y){
          cp1.x = midpoint.x - a + distance;
          cp1.y = midpoint.y - b - distance;
        }else{
          cp1.x = midpoint.x + a + distance;
          cp1.y = midpoint.y - b + distance;
        }
      }

      return cp1;
}

function getControlPoint2(start, end, midpoint, a, b, distance){
var cp2 = {
      x : start.x,
      y : end.y,
    };

  if(start.x < end.x){
        if (start.y < end.y){
          cp2.x = midpoint.x - a + distance;
          cp2.y = midpoint.y + b + distance;
        }else{
          cp2.x = midpoint.x + a + distance;
          cp2.y = midpoint.y + b - distance;
        }
      }
      else{
        if (start.y < end.y){
          cp2.x = midpoint.x - a - distance;
          cp2.y = midpoint.y - b + distance;
        }else{
          cp2.x = midpoint.x + a - distance;
          cp2.y = midpoint.y - b - distance;
        }
      }

  return cp2;
}