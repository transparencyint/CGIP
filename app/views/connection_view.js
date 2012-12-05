var View = require('./view');
var ConnectionFormView = require('views/connection_form_view');

module.exports = View.extend({

  template: require('./templates/connection'),

  tagName : 'div',
  className : 'connection',

  events: {
    'mouseover path' : 'showMetadata',
    'mouseout path' : 'hideMetadata',
    'dblclick path' : 'showMetadataForm',
  },

  initialize: function(options){
    this.actorRadius = 60;
    this.markerSize = 4;
    this.edgeRadius = 10;
    this.offsetDistance = 15;
    this.edgeRadius = 10;
    
    if(options.noClick)
      this.$el.unbind('click')

    if(this.model.from)
      this.model.from.on('change:pos', this.update, this);
      
    if(this.model.to)
      this.model.to.on('change:pos', this.update, this);

    this.model.on('destroy', this.destroy, this);

    this.model.on('change:disbursed', this.updateStrokeWidth, this);
    this.model.on('change:disbursed', this.updateDisbursed, this);
  },

  getRenderData : function(){
    return this.model.toJSON();
  },

  select: function(event){
    if(!this.$el.hasClass("ui-selected")){
      this.$el.addClass("ui-selected").siblings().removeClass("ui-selected");
    }
  },

  render: function(){
    // only render if it's a valid view
    if(this.hasBothConnections())
      View.prototype.render.call(this)
  },
  
  afterRender: function(){
    var connectionType = this.model.get("connectionType");
    if(connectionType === 'accountability')
      this.strokeStyle = 'white';
    else if(connectionType === 'monitoring')
      this.strokeStyle = 'black';
    else 
      this.strokeStyle = '#f8df47';

    this.selectStyle = 'hsl(205,100%,55%)';
    
    this.updateStrokeWidth();

    this.path = "";
    this.$el.css('margin', -(this.strokeWidth/2 + this.offsetDistance) + 'px 0 0 '+ -(this.strokeWidth/2 + this.offsetDistance) + 'px');
    this.$el.svg();
    this.$el.attr('id', this.model.id);

    this.svg = this.$el.svg('get');
    var defs = this.svg.defs();
    var marker = this.svg.marker(defs, this.model.id, 1, this.markerSize/2, this.markerSize/2, this.markerSize/2, 'auto', { viewBox: '0 0 ' + this.markerSize + ' ' + this.markerSize});
    this.svg.use(marker, 0, 0, this.markerSize, this.markerSize, '#trianglePath', { fill: this.strokeStyle });

    this.g = this.svg.group();
    createDefs(this.markerSize, this.strokeStyle, this.selectStyle);
    this.update();

    this.$el.addClass( this.model.get("connectionType") );
  },

  hasBothConnections: function(){
    return (this.model.from && this.model.to);
  },

  update: function(){
    // return if not a valid connection
    if(!this.hasBothConnections()) return

    var from = this.model.from.get('pos');    
    var to = this.model.to.get('pos');
    this.edgeRadius = 10;
    
    
    var pos = {
      x : Math.min(from.x, to.x),
      y : Math.min(from.y, to.y)
    }    
    var start = {
      x : from.x - pos.x + this.strokeWidth/2 + this.offsetDistance,
      y : from.y - pos.y + this.strokeWidth/2 + this.offsetDistance
    };
    var end = {
      x : to.x - pos.x + this.strokeWidth/2 + this.offsetDistance,
      y : to.y - pos.y + this.strokeWidth/2 + this.offsetDistance
    };
    
    var width = Math.abs(from.x - to.x) + this.strokeWidth;
    var height = Math.abs(from.y - to.y) + this.strokeWidth;
      
    this.svg.configure({
      'width' : width+ this.strokeWidth + this.offsetDistance,
      'height' : height + this.strokeWidth + this.offsetDistance
    }, true);
    this.$el.css({
      'left': pos.x + "px",
      'top': pos.y + "px",
      'width': width+this.strokeWidth,
      'height': height+this.strokeWidth
    });

    var halfX;
    var halfY;

    //case 1
    if(start.x < end.x && start.y <= end.y){
      //case 1f
      //connections are on the same line
      if(start.y == end.y){
        var start2 = {
          x : start.x - this.edgeRadius,
          y : start.y
        };
        var end2 = {
          x : end.x + this.edgeRadius,
          y : end.y
        };
        definePath1Line(start2, end2);
      }
      //case 1c
      else if(end.y - start.y <= this.actorRadius){
        start.x += this.actorRadius;
        end.x -= this.actorRadius + this.markerSize + this.strokeWidth/2;
        halfX = (end.x - start.x)/2 + start.x;
        if(end.y - start.y < 2* this.edgeRadius)
          this.edgeRadius = (end.y - start.y) / 2;
        var start2 = {
          x : start.x,
          y : start.y + this.edgeRadius
        };
        var end2 = {
          x : end.x,
          y : end.y - this.edgeRadius
        };
        var halfX2 = halfX - this.edgeRadius;
        var halfX3 = halfX + this.edgeRadius;
        definePath3LinesX(start, halfX, end, start2, end2, halfX2, halfX3, 1, 0, this.edgeRadius);
      }
      //case 1d
      else if(end.x - start.x <= this.actorRadius){
        start.y += this.actorRadius;
        end.y -= this.actorRadius + this.markerSize + this.strokeWidth/2;
        halfY = (end.y - start.y)/2 + start.y;
        if(end.x - start.x < 2 * this.edgeRadius)
          this.edgeRadius = (end.x - start.x) / 2;
        var start2 = {
          x : start.x + this.edgeRadius,
          y : start.y
        };
        var end2 = {
          x : end.x - this.edgeRadius,
          y : end.y
        };
        var halfY2 = halfY - this.edgeRadius;
        var halfY3 = halfY + this.edgeRadius;
        definePath3LinesY(start, halfY, end, start2, end2, halfY2, halfY3, 0, 1, this.edgeRadius);
      }
      //case 1a+b
      else{
        start.x += this.actorRadius;
        end.y -= this.actorRadius + this.markerSize + this.strokeWidth/2;
        var start2 = {
          x : start.x,
          y : start.y + this.edgeRadius
        };
        var end2 = {
          x : end.x - this.edgeRadius,
          y : end.y - this.edgeRadius
        };
        definePath2Lines(start, end, start2, end2, 1, this.edgeRadius);
      }
    }
    //case 2
    else if(start.x <= end.x && start.y > end.y){
      //case 2f
      //connections are on the same line
      if(start.x == end.x){
        var start2 = {
          x : start.x,
          y : start.y - this.edgeRadius
        };
        var end2 = {
          x : end.x,
          y : end.y + this.edgeRadius
        };
        definePath1Line(start2, end2);
      }
      //case 2c
      if (start.y - end.y < this.actorRadius){
        start.x += this.actorRadius;
        end.x -= this.actorRadius + this.markerSize + this.strokeWidth/2;
        halfX = (end.x - start.x)/2 + start.x;
        if (start.y - end.y < 2 * this.edgeRadius)
          this.edgeRadius = (start.y - end.y) / 2;
        var start2 = {
          x : start.x,
          y : start.y - this.edgeRadius
        };
        var end2 = {
          x : end.x,
          y : end.y + this.edgeRadius
        };
        var halfX2 = halfX - this.edgeRadius;
        var halfX3 = halfX + this.edgeRadius;
        definePath3LinesX(start, halfX, end, start2, end2, halfX2, halfX3, 0, 1, this.edgeRadius);
      }
      //case 2d
      else if(end.x - start.x < this.actorRadius){
        start.y -= this.actorRadius;
        end.y += this.actorRadius + this.markerSize + this.strokeWidth/2;
        halfY = (start.y - end.y)/2 + end.y;
        if (end.x - start.x < 2 * this.edgeRadius)
          this.edgeRadius = (end.x - start.x) / 2;
        var start2 = {
          x : start.x + this.edgeRadius,
          y : start.y
        };
        var end2 = {
          x : end.x - this.edgeRadius,
          y : end.y
        };
        var halfY2 = halfY + this.edgeRadius;
        var halfY3 = halfY - this.edgeRadius;
        definePath3LinesY(start, halfY, end, start2, end2, halfY2, halfY3, 1, 0, this.edgeRadius);
      }
      //case 2a+b
      else{
        start.x += this.actorRadius;
        end.y += this.actorRadius + this.markerSize + this.strokeWidth/2;
        var start2 = {
          x : start.x,
          y : start.y - this.edgeRadius
        };
        var end2 = {
          x : end.x - this.edgeRadius,
          y : end.y - 10
        };
        definePath2Lines(start, end, start2, end2, 0, this.edgeRadius);
      }
    }
    //case 3
    else if(start.x > end.x && start.y <= end.y){
      //case 3f
      //connections are on the same line
      if(start.y == end.y){
        var start2 = {
          x : start.x - this.edgeRadius,
          y : start.y
        };
        var end2 = {
          x : end.x + this.edgeRadius,
          y : end.y
        };
        definePath1Line(start2, end2);
      }
      //case 3c
      if(end.y - start.y < this.actorRadius){
        start.x -= this.actorRadius;
        end.x += this.actorRadius + this.markerSize + this.strokeWidth/2;
        halfX = (start.x - end.x)/2 + end.x;
        if (end.y - start.y < 2 * this.edgeRadius)
          this.edgeRadius = (end.y - start.y) / 2;
        var start2 = {
          x : start.x,
          y : start.y + this.edgeRadius
        };
        var end2 = {
          x : end.x,
          y : end.y - this.edgeRadius
        };
        var halfX2 = halfX + this.edgeRadius;
        var halfX3 = halfX - this.edgeRadius;
        definePath3LinesX(start, halfX, end, start2, end2, halfX2, halfX3, 0, 1, this.edgeRadius);
      }
      //case 3d
      else if(start.x - end.x < this.actorRadius){
        start.y += this.actorRadius;
        end.y -= this.actorRadius + this.markerSize + this.strokeWidth/2;
        halfY = (end.y - start.y)/2 + start.y;
        if (start.x - end.x < 2 * this.edgeRadius)
          this.edgeRadius = (start.x - end.x) / 2;
        var start2 = {
          x : start.x - this.edgeRadius,
          y : start.y
        };
        var end2 = {
          x : end.x + this.edgeRadius,
          y : end.y
        };
        var halfY2 = halfY - this.edgeRadius;
        var halfY3 = halfY + this.edgeRadius;
        definePath3LinesY(start, halfY, end, start2, end2, halfY2, halfY3, 1, 0, this.edgeRadius);
      }
      //case 3a+b
      else{
        start.y += this.actorRadius;
        end.x += this.actorRadius + this.markerSize + this.strokeWidth/2;
        var start2 = {
          x : start.x - this.edgeRadius,
          y : start.y
        };
        var end2 = {
          x : end.x,
          y : end.y - this.edgeRadius
        };
        definePath2Lines(start, end, start2, end2, 1, this.edgeRadius);
      }
    }
    //case 4
    else{
      //case 1f
      //connections are on the same line
      if(start.x == end.x){
        var start2 = {
          x : start.x,
          y : start.y + this.edgeRadius
        };
        var end2 = {
          x : end.x,
          y : end.y - this.edgeRadius
        };
        definePath1Line(start2, end2);
      }
      //case 4c
      if(start.y - end.y < this.actorRadius){
        start.x -= this.actorRadius;
        end.x += this.actorRadius + this.markerSize + this.strokeWidth/2;
        halfX = (start.x - end.x)/2 + end.x;
        if (start.y - end.y < 2 * this.edgeRadius)
          this.edgeRadius = (start.y - end.y) / 2;
        var start2 = {
          x : start.x,
          y : start.y - this.edgeRadius
        };
        var end2 = {
          x : end.x,
          y : end.y + this.edgeRadius
        };
        var halfX2 = halfX + this.edgeRadius;
        var halfX3 = halfX - this.edgeRadius;
        definePath3LinesX(start, halfX, end, start2, end2, halfX2, halfX3, 1, 0, this.edgeRadius);
      }
      //case 4d
      else if(start.x - end.x < this.actorRadius){
        start.y -= this.actorRadius;
        end.y += this.actorRadius + this.markerSize + this.strokeWidth/2;
        halfY = (start.y - end.y)/2 + end.y;
        if (start.x - end.x < 2 * this.edgeRadius)
          this.edgeRadius = (start.x - end.x) / 2;
        var start2 = {
          x : start.x - this.edgeRadius,
          y : start.y
        };
        var end2 = {
          x : end.x + this.edgeRadius,
          y : end.y
        };
        var halfY2 = halfY + this.edgeRadius;
        var halfY3 = halfY - this.edgeRadius;
        definePath3LinesY(start, halfY, end, start2, end2, halfY2, halfY3, 0, 1, this.edgeRadius);
      }
      //case 4a+b
      else{
        start.y -= this.actorRadius;
        end.x += this.actorRadius + this.markerSize + this.strokeWidth/2;
        var start2 = {
          x : start.x - this.edgeRadius,
          y : start.y
        };
        var end2 = {
          x : end.x,
          y : end.y + this.edgeRadius
        };
        definePath2Lines(start, end, start2, end2, 0, this.edgeRadius);
      }
    }

    if(this.path) this.svg.remove(this.path);
    this.path = this.svg.path(this.g, path, {
      fill : 'none', 
      stroke : this.strokeStyle,
      'stroke-width' : this.strokeWidth, 
      'marker-end' : 'url(#'+ this.model.id +')'
    });
  },

  /* 
   * Define the thickness of the money line.
   */
  updateStrokeWidth: function(){

    var minAmount = 0;
    var maxAmount = 20000000;

    var minStroke = 6;
    var maxStroke = 40;

    var amount = this.model.get('disbursed') || 0;

    var percent = amount * 100 / maxAmount;
    var strokeWidth = percent * maxStroke / 100;

    if(strokeWidth < minStroke)
      strokeWidth = minStroke;

    this.strokeWidth = strokeWidth;

    this.$el.find('path').attr('stroke-width', this.strokeWidth);
  },

  updateDisbursed: function(){ 
    this.$('.connection-metadata').text('$' + this.model.get('disbursed'));
  },

  showMetadataInput: function(){   
    this.$el.find('.overlay-form-container').fadeIn(100);
  },

  showMetadataForm: function(){
    if(this.model.get('connectionType') === "money"){
      //Remove all other forms
      $('.connection-form-container').remove();
      var model = this.model;
      var cfw = new ConnectionFormView({ model: model });
      $(document.body).append(cfw.render().el);  
    }

    //remove all activeClasses from the connections
    $('.connection').each(function(){ $(this).removeClass('activeConnection') });

    if(!this.$el.hasClass('activeConnection'))
      this.$el.addClass('activeConnection');
    else
      this.$el.removeClass('activeConnection');
  },

  showMetadata: function(e){
    if(this.model.get('disbursed')){
      var metadata = this.$el.find('.connection-metadata');
      metadata.css({left: e.offsetX + 30, top: e.offsetY + 10});
      metadata.fadeIn(0);
    }
  },

  hideMetadata: function(e){   
    var metadata = this.$el.find('.connection-metadata');
    metadata.fadeOut(0);  
  }

});

function definePath1Line(start, end){
    this.path = 'M' + start.x + ',' + start.y + ' L' + end.x + ',' + end.y;
     this.pathShadow = 'M' + start.x + ',' + start.y + ' L' + end.x + ',' + end.y;
}

function definePath2Lines(start, end, start2, end2, sweepFlag, edgeRadius){
  if(start.x < end.x){
    //this.path = 'M' + start.x + ',' + start.y + ' L' + end.x + ',' + start.y + ' L' + end.x + ',' + end.y;
    this.path = 'M' + start.x + ',' + start.y + ' L' + end2.x + ',' + start.y + ' A' + edgeRadius + ',' + edgeRadius + ' ' + 0 + ' ' + 0 + ' ' + sweepFlag + ' ' + end.x + ',' + start2.y + ' L' + end.x + ',' + end.y;
  }
  else{
    //this.path = 'M' + start.x + ',' + start.y + ' L' + start.x + ',' + end.y + ' L' + end.x + ',' + end.y;
    this.path = 'M' + start.x + ',' + start.y + ' L' + start.x + ',' + end2.y + ' A' + edgeRadius + ',' + edgeRadius + ' ' + 0 + ' ' + 0 + ' ' + sweepFlag + ' ' + start2.x + ',' + end.y + ' L' + end.x + ',' + end.y;
  }
}

function definePath3LinesX(start, halfX, end, start2, end2, halfX2, halfX3, sweepFlag1, sweepFlag2, edgeRadius){
  //this.path = 'M' + start.x + ',' + start.y + ' L' + halfX + ',' + start.y +  'L' + halfX + ',' + end.y + ' L' + end.x + ',' + end.y;
  this.path = 'M' + start.x + ',' + start.y + ' L' + halfX2 + ',' + start.y + ' A'  + edgeRadius + ',' + edgeRadius + ' ' + 0 + ' ' + 0 + ' ' + sweepFlag1 + ' ' + halfX + ',' + start2.y + ' L' + halfX + ',' + end2.y + ' A'  + edgeRadius + ',' + edgeRadius + ' ' + 0 + ' ' + 0 + ' ' + sweepFlag2 + ' ' + halfX3 + ',' + end.y + ' L' + end.x + ',' + end.y; 
}

function definePath3LinesY(start, halfY, end, start2, end2, halfY2, halfY3, sweepFlag1, sweepFlag2, edgeRadius){
   //this.path = 'M' + start.x + ',' + start.y + ' L' + start.x + ',' + halfY +  'L' + end.x + ',' + halfY + ' L' + end.x + ',' + end.y;
   this.path = 'M' + start.x + ',' + start.y + ' L' + start.x + ',' + halfY2 + ' A'  + edgeRadius + ',' + edgeRadius + ' ' + 0 + ' ' + 0 + ' ' + sweepFlag1 + ' ' + start2.x + ',' + halfY + ' L' + end2.x + ',' + halfY + ' A'  + edgeRadius + ',' + edgeRadius + ' ' + 0 + ' ' + 0 + ' ' + sweepFlag2 + ' ' + end.x + ',' + halfY3 + ' L' + end.x + ',' + end.y; 
}

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