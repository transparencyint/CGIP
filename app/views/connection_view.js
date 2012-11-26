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

    this.model.on('change:amount', this.updateStrokeWidth, this);
    this.model.on('change:amount', this.updateAmount, this);
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
    this.selectStyle = 'hsl(205,100%,55%)';
    
    this.updateStrokeWidth();

    this.path = "";
    this.$el.svg();
    this.$el.attr('id', this.model.id);

    this.svg = this.$el.svg('get');
    this.defs = this.svg.defs();
        
    switch(this.model.get("connectionType")){
      case 'accountability':
        this.strokeStyle = 'white';
        break;
      case 'monitoring':
        this.strokeStyle = 'black';
        break;
      case 'money':
        // yellow
        //this.strokeStyle = '#f8df47';
        this.createCoinDefinitions();
        break;
    }
    
    if(this.model.get("connectionType") === 'money'){
      this.pathSettings = {
        'marker-end': "url(#"+ this.coinReference +")",
        'marker-start': "url(#"+ this.coinReference +")",
        'marker-mid': "url(#"+ this.coinReference +")",
        'stroke-width': this.strokeWidth
      };
    } else {
      this.pathSettings = {
        'marker-end': 'url(#'+ this.model.id +')',
        'stroke': this.strokeStyle,
        'stroke-width': this.strokeWidth
      };
    }
    
    var arrow = this.svg.marker(this.defs, this.model.id, 1, this.markerSize/2, this.markerSize/2, this.markerSize/2, 'auto', { viewBox: '0 0 ' + this.markerSize + ' ' + this.markerSize});
    this.svg.use(arrow, 0, 0, this.markerSize, this.markerSize, '#trianglePath', { fill: this.strokeStyle });

    this.g = this.svg.group();
    createGlobalDefs(this.markerSize, this.strokeStyle, this.selectStyle);
    this.update();
    
    // offset svg
    this.$el.css('margin', -(this.strokeWidth/2 + this.offsetDistance) + 'px 0 0 '+ -(this.strokeWidth/2 + this.offsetDistance) + 'px');
    this.$el.addClass( this.model.get("connectionType") );
  },
  
  createCoinDefinitions: function(){
    // coin definition
    this.coinSizeFactor = 1;
    this.coinDistance = 4 * this.coinSizeFactor;
    this.coinReference = this.model.id + "-coin";
  
    var coinWidth = 7 * this.coinSizeFactor;
    var coinHeight = 12 * this.coinSizeFactor;
    var coin = this.svg.marker(this.defs, this.coinReference, coinWidth/2, coinHeight/2, coinWidth, coinHeight, "auto");
    this.svg.use(coin, 0, 0, 6, 11, '#coinSymbol');
    
    this.strokeWidth = 1;
  },

  hasBothConnections: function(){
    return (this.model.from && this.model.to);
  },

  update: function(){
    var from = this.model.from.get('pos');    
    var to = this.model.to.get('pos');
    this.edgeRadius = 10;
    
    
    var pos = {
      x : Math.min(from.x, to.x),
      y : Math.min(from.y, to.y)
    }    
    // round because our positions are float, not integer
    var start = {
      x : Math.round(from.x - pos.x) + this.strokeWidth/2 + this.offsetDistance,
      y : Math.round(from.y - pos.y) + this.strokeWidth/2 + this.offsetDistance
    };
    var end = {
      x : Math.round(to.x - pos.x) + this.strokeWidth/2 + this.offsetDistance,
      y : Math.round(to.y - pos.y) + this.strokeWidth/2 + this.offsetDistance
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
    var start2, end2;

    //case 1
    if(start.x < end.x && start.y <= end.y){
      //case 1f
      //
      // ────➝
      //
      if(start.y == end.y){
        start2 = {
          x : start.x - this.edgeRadius,
          y : start.y
        };
        end2 = {
          x : end.x + this.edgeRadius,
          y : end.y
        };
        this.definePath1Line(start2, end2);
      }
      //case 1c
      //
      // ──┐
      //   └──➝
      //  
      else if(end.y - start.y <= this.actorRadius){
        start.x += this.actorRadius;
        end.x -= this.actorRadius + this.markerSize + this.strokeWidth/2;
        halfX = (end.x - start.x)/2 + start.x;
        if(end.y - start.y < 2* this.edgeRadius)
          this.edgeRadius = (end.y - start.y) / 2;
        start2 = {
          x : start.x,
          y : start.y + this.edgeRadius
        };
        end2 = {
          x : end.x,
          y : end.y - this.edgeRadius
        };
        var halfX2 = halfX - this.edgeRadius;
        var halfX3 = halfX + this.edgeRadius;
        console.log("case 1c");
        this.definePath3LinesX(start, halfX, end, start2, end2, halfX2, halfX3, 1, 0, this.edgeRadius);
      }
      //case 1d
      //  
      //  │
      //  └┐
      //   ↓
      //
      else if(end.x - start.x <= this.actorRadius){
        start.y += this.actorRadius;
        end.y -= this.actorRadius + this.markerSize + this.strokeWidth/2;
        halfY = (end.y - start.y)/2 + start.y;
        if(end.x - start.x < 2 * this.edgeRadius)
          this.edgeRadius = (end.x - start.x) / 2;
        start2 = {
          x : start.x + this.edgeRadius,
          y : start.y
        };
        end2 = {
          x : end.x - this.edgeRadius,
          y : end.y
        };
        var halfY2 = halfY - this.edgeRadius;
        var halfY3 = halfY + this.edgeRadius;
        this.definePath3LinesY(start, halfY, end, start2, end2, halfY2, halfY3, 0, 1, this.edgeRadius);
      }
      //case 1a+b
      //  
      //  ──┐
      //    ↓
      //
      else {
        start.x += this.actorRadius;
        end.y -= this.actorRadius + this.markerSize + this.strokeWidth/2;
        start2 = {
          x : start.x,
          y : start.y + this.edgeRadius
        };
        end2 = {
          x : end.x - this.edgeRadius,
          y : end.y - this.edgeRadius
        };
        this.definePath2Lines(start, end, start2, end2, 1, this.edgeRadius);
      }
    }
    //case 2
    else if(start.x <= end.x && start.y > end.y){
      //case 2f
      //  
      //  │
      //  ↓
      //
      if(start.x == end.x){
        start2 = {
          x : start.x,
          y : start.y - this.edgeRadius
        };
        end2 = {
          x : end.x,
          y : end.y + this.edgeRadius
        };
        this.definePath1Line(start2, end2);
      }
      //case 2c
      //
      //   ┌──➝
      // ──┘
      //
      else if(start.y - end.y < this.actorRadius){
        start.x += this.actorRadius;
        end.x -= this.actorRadius + this.markerSize + this.strokeWidth/2;
        halfX = (end.x - start.x)/2 + start.x;
        if (start.y - end.y < 2 * this.edgeRadius)
          this.edgeRadius = (start.y - end.y) / 2;
        start2 = {
          x : start.x,
          y : start.y - this.edgeRadius
        };
        end2 = {
          x : end.x,
          y : end.y + this.edgeRadius
        };
        var halfX2 = halfX - this.edgeRadius;
        var halfX3 = halfX + this.edgeRadius;
        console.log("case 2c");
        this.definePath3LinesX(start, halfX, end, start2, end2, halfX2, halfX3, 0, 1, this.edgeRadius);
      }
      //case 2d
      //  
      //   ↑
      //  ┌┘
      //  │
      //
      else if(end.x - start.x < this.actorRadius){
        start.y -= this.actorRadius;
        end.y += this.actorRadius + this.markerSize + this.strokeWidth/2;
        halfY = (start.y - end.y)/2 + end.y;
        if (end.x - start.x < 2 * this.edgeRadius)
          this.edgeRadius = (end.x - start.x) / 2;
        start2 = {
          x : start.x + this.edgeRadius,
          y : start.y
        };
        end2 = {
          x : end.x - this.edgeRadius,
          y : end.y
        };
        var halfY2 = halfY + this.edgeRadius;
        var halfY3 = halfY - this.edgeRadius;
        this.definePath3LinesY(start, halfY, end, start2, end2, halfY2, halfY3, 1, 0, this.edgeRadius);
      }
      //case 2a+b
      //  
      //    ↑
      //  ──┘
      //  
      else {
        start.x += this.actorRadius;
        end.y += this.actorRadius + this.markerSize + this.strokeWidth/2;
        start2 = {
          x : start.x,
          y : start.y - this.edgeRadius
        };
        end2 = {
          x : end.x - this.edgeRadius,
          y : end.y - 10
        };
        this.definePath2Lines(start, end, start2, end2, 0, this.edgeRadius);
      }
    }
    //case 3
    else if(start.x > end.x && start.y <= end.y){
      //case 3f
      //  
      //  ←──
      //
      if(start.y == end.y){
        start2 = {
          x : start.x - this.edgeRadius,
          y : start.y
        };
        end2 = {
          x : end.x + this.edgeRadius,
          y : end.y
        };
        console.log("case 3f");
        this.definePath1Line(start2, end2);
      }
      //case 3c
      else if(end.y - start.y < this.actorRadius){
        start.x -= this.actorRadius;
        end.x += this.actorRadius + this.markerSize + this.strokeWidth/2;
        halfX = (start.x - end.x)/2 + end.x;
        if (end.y - start.y < 2 * this.edgeRadius)
          this.edgeRadius = (end.y - start.y) / 2;
        start2 = {
          x : start.x,
          y : start.y + this.edgeRadius
        };
        end2 = {
          x : end.x,
          y : end.y - this.edgeRadius
        };
        var halfX2 = halfX + this.edgeRadius;
        var halfX3 = halfX - this.edgeRadius;
        console.log("case 3c");
        this.definePath3LinesX(start, halfX, end, start2, end2, halfX2, halfX3, 0, 1, this.edgeRadius);
      }
      //case 3d
      else if(start.x - end.x < this.actorRadius){
        start.y += this.actorRadius;
        end.y -= this.actorRadius + this.markerSize + this.strokeWidth/2;
        halfY = (end.y - start.y)/2 + start.y;
        if (start.x - end.x < 2 * this.edgeRadius)
          this.edgeRadius = (start.x - end.x) / 2;
        start2 = {
          x : start.x - this.edgeRadius,
          y : start.y
        };
        end2 = {
          x : end.x + this.edgeRadius,
          y : end.y
        };
        var halfY2 = halfY - this.edgeRadius;
        var halfY3 = halfY + this.edgeRadius;
        this.definePath3LinesY(start, halfY, end, start2, end2, halfY2, halfY3, 1, 0, this.edgeRadius);
      }
      //case 3a+b
      else {
        start.y += this.actorRadius;
        end.x += this.actorRadius + this.markerSize + this.strokeWidth/2;
        start2 = {
          x : start.x - this.edgeRadius,
          y : start.y
        };
        end2 = {
          x : end.x,
          y : end.y - this.edgeRadius
        };
        this.definePath2Lines(start, end, start2, end2, 1, this.edgeRadius);
      }
    }
    //case 4
    else{
      //case 1f
      //connections are on the same line
      if(start.x == end.x){
        start2 = {
          x : start.x,
          y : start.y + this.edgeRadius
        };
        end2 = {
          x : end.x,
          y : end.y - this.edgeRadius
        };
        this.definePath1Line(start2, end2);
      }
      //case 4c
      else if(start.y - end.y < this.actorRadius){
        start.x -= this.actorRadius;
        end.x += this.actorRadius + this.markerSize + this.strokeWidth/2;
        halfX = (start.x - end.x)/2 + end.x;
        if (start.y - end.y < 2 * this.edgeRadius)
          this.edgeRadius = (start.y - end.y) / 2;
        start2 = {
          x : start.x,
          y : start.y - this.edgeRadius
        };
        end2 = {
          x : end.x,
          y : end.y + this.edgeRadius
        };
        var halfX2 = halfX + this.edgeRadius;
        var halfX3 = halfX - this.edgeRadius;
        console.log("case 4c");
        this.definePath3LinesX(start, halfX, end, start2, end2, halfX2, halfX3, 1, 0, this.edgeRadius);
      }
      //case 4d
      else if(start.x - end.x < this.actorRadius){
        start.y -= this.actorRadius;
        end.y += this.actorRadius + this.markerSize + this.strokeWidth/2;
        halfY = (start.y - end.y)/2 + end.y;
        if (start.x - end.x < 2 * this.edgeRadius)
          this.edgeRadius = (start.x - end.x) / 2;
        start2 = {
          x : start.x - this.edgeRadius,
          y : start.y
        };
        end2 = {
          x : end.x + this.edgeRadius,
          y : end.y
        };
        var halfY2 = halfY + this.edgeRadius;
        var halfY3 = halfY - this.edgeRadius;
        this.definePath3LinesY(start, halfY, end, start2, end2, halfY2, halfY3, 0, 1, this.edgeRadius);
      }
      //case 4a+b
      else {
        start.y -= this.actorRadius;
        end.x += this.actorRadius + this.markerSize + this.strokeWidth/2;
        start2 = {
          x : start.x - this.edgeRadius,
          y : start.y
        };
        end2 = {
          x : end.x,
          y : end.y + this.edgeRadius
        };
        this.definePath2Lines(start, end, start2, end2, 0, this.edgeRadius);
      }
    }

    if(this.pathElement) this.svg.remove(this.pathElement);
    
    this.pathElement = this.svg.path(this.g, this.path, this.pathSettings);
  },

  /* 
   * Define the thickness of the money line.
   */
  updateStrokeWidth: function(){

    var minAmount = 0;
    var maxAmount = 20000000;

    var minStroke = 6;
    var maxStroke = 40;

    var amount = this.model.get('amount') || 0;

    var percent = amount * 100 / maxAmount;
    var strokeWidth = percent * maxStroke / 100;

    if(strokeWidth < minStroke)
      strokeWidth = minStroke;

    this.strokeWidth = strokeWidth;

    this.$el.find('path').attr('stroke-width', this.strokeWidth);
  },

  updateAmount: function(){
    this.$('.connection-metadata').text(this.model.get('amount'));
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
    if(this.model.get('amount')){
      var metadata = this.$el.find('.connection-metadata');
      metadata.css({left: e.offsetX + 30, top: e.offsetY + 10});
      metadata.fadeIn(0);
    }
  },

  hideMetadata: function(e){   
    var metadata = this.$el.find('.connection-metadata');
    metadata.fadeOut(0);  
  },
  
  // slices a line from a to b into segments
  // returns a space seperated string of numbers
  slicedPathSegments: function(a, b, distance){
    var length = Math.abs(b - a);
    var sign = a > b ? -1 : 1;
    var count = Math.floor(length / distance);
    var segments = [];
    
    for(var i=1; i<count; i++){
      segments.push(a + sign*i*distance);
    }
    
    return segments.join(" ");
  },

  definePath1Line: function(start, end){
    console.log("definePath1Line");
    this.path = 'M ' + start.x + ',' + start.y;

    if(start.y === end.y){
      // path goes horizontal
      this.path += " H " + this.slicedPathSegments(start.x, end.x, this.coinDistance);
    } else {
      // path goes vertical
      this.path += " V "  + this.slicedPathSegments(start.y, end.y, this.coinDistance);
    }
  },
  
  definePath2Lines: function(start, end, start2, end2, sweepFlag, edgeRadius){
    console.log("definePath2Lines");
    if(start.x < end.x){
      //this.path = 'M' + start.x + ',' + start.y + ' L' + end.x + ',' + start.y + ' L' + end.x + ',' + end.y;
      this.path = 'M ' + start.x + ',' + start.y + ' L ' + end2.x + ',' + start.y + ' A ' + edgeRadius + ',' + edgeRadius + ' ' + 0 + ' ' + 0 + ' ' + sweepFlag + ' ' + end.x + ',' + start2.y + ' L ' + end.x + ',' + end.y;
    }
    else{
      //this.path = 'M' + start.x + ',' + start.y + ' L' + start.x + ',' + end.y + ' L' + end.x + ',' + end.y;
      this.path = 'M ' + start.x + ',' + start.y + ' L ' + start.x + ',' + end2.y + ' A ' + edgeRadius + ',' + edgeRadius + ' ' + 0 + ' ' + 0 + ' ' + sweepFlag + ' ' + start2.x + ',' + end.y + ' L ' + end.x + ',' + end.y;
    }
  },

  definePath3LinesX: function(start, halfX, end, start2, end2, halfX2, halfX3, sweepFlag1, sweepFlag2, edgeRadius){
    console.log("definePath3LinesX");
    //this.path = 'M' + start.x + ',' + start.y + ' L' + halfX + ',' + start.y +  'L' + halfX + ',' + end.y + ' L' + end.x + ',' + end.y;
    this.path = 'M ' + start.x + ',' + start.y + ' L ' + halfX2 + ',' + start.y + ' A '  + edgeRadius + ',' + edgeRadius + ' ' + 0 + ' ' + 0 + ' ' + sweepFlag1 + ' ' + halfX + ',' + start2.y + ' L ' + halfX + ',' + end2.y + ' A '  + edgeRadius + ',' + edgeRadius + ' ' + 0 + ' ' + 0 + ' ' + sweepFlag2 + ' ' + halfX3 + ',' + end.y + ' L ' + end.x + ',' + end.y; 
  },

  definePath3LinesY: function(start, halfY, end, start2, end2, halfY2, halfY3, sweepFlag1, sweepFlag2, edgeRadius){
    console.log("definePath3LinesY");
    //this.path = 'M' + start.x + ',' + start.y + ' L' + start.x + ',' + halfY +  'L' + end.x + ',' + halfY + ' L' + end.x + ',' + end.y;
    this.path = 'M ' + start.x + ',' + start.y + ' L ' + start.x + ',' + halfY2 + ' A '  + edgeRadius + ',' + edgeRadius + ' ' + 0 + ' ' + 0 + ' ' + sweepFlag1 + ' ' + start2.x + ',' + halfY + ' L ' + end2.x + ',' + halfY + ' A '  + edgeRadius + ',' + edgeRadius + ' ' + 0 + ' ' + 0 + ' ' + sweepFlag2 + ' ' + end.x + ',' + halfY3 + ' L ' + end.x + ',' + end.y; 
  }
});

function createGlobalDefs(markerSize, strokeStyle, selectStyle){
  if(this.svg === undefined){
    $('body').svg().find('> svg').attr('id', 'svgDefinitions');
    this.svg = $('body').svg('get');
    var defs = this.svg.defs();
    
    // marker definition
    var markerSymbol = this.svg.symbol(defs, 'trianglePath', 0, 0, markerSize, markerSize);
    this.svg.path(markerSymbol, 'M 0 0 L '+ markerSize +' '+ markerSize/2 +' L 0 '+ markerSize +' z');

    // selected marker definition
    var selectedMarker = this.svg.marker(defs, 'selectedTriangle', 1, markerSize/2, markerSize/2, markerSize/2, 'auto', { viewBox: '0 0 ' + markerSize + ' ' + markerSize });
    this.svg.use(selectedMarker, 0, 0, markerSize, markerSize, '#trianglePath', { fill: selectStyle });
    
    // coin definition
    var yellowStops = [['0%', '#fbd54d'], ['25%', '#fae167'], ['50%', '#fcd852'], ['100%', '#f7eb7a']];
    this.svg.linearGradient(defs, 'moneyGradient', yellowStops, 0, 0, 0, "100%");
    
    var highlightStop = [['0%', 'white'], ['100%', 'white', '0']];
    this.svg.linearGradient(defs, 'whiteToTransparent', highlightStop, "100%", 0, 0, "100%");
    
    var highlightMask = this.svg.mask(defs, 'coinHighlightMask', 0, 0, 6, 11);
    this.svg.rect(highlightMask, 1, 1, 6, 11, 1.5, 1.5, { fill: 'white' });
    this.svg.rect(highlightMask, -2, 1, 6, 11, 1.5, 1.5, { fill: 'black' });
    
    var coinSymbol = this.svg.symbol(defs, 'coinSymbol', 0, 0, markerSize, markerSize);
    this.svg.rect(coinSymbol, 0.5, 0.5, 6, 11, 2, 2, { fill: 'url(#moneyGradient)', stroke: '#eaab51', 'stroke-width': 1 });
    this.svg.rect(coinSymbol, -1, 1, 6, 11, 1.5, 1.5, { fill: 'url(#whiteToTransparent)',  mask: 'url(#coinHighlightMask)' }); 
  }
}