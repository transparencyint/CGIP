var View = require('./view');
var ConnectionFormView = require('views/connection_form_view');

module.exports = View.extend({

  template: require('./templates/connection'),

  tagName : 'div',
  className : 'connection',

  events: {
    'mouseover path' : 'showMetadata',
    'mouseout path' : 'hideMetadata',
    'dblclick svg' : 'showMetadataForm'
  },

  initialize: function(options){

    this.edgeRadius = 10;
    this.coinSizeFactor = 1;
    this.strokeWidth = 6;
    this.markerRatio = 2.5;

    this.minCoinSizeFactor = 1;
    this.maxCoinSizeFactor = 4;

    this.actorRadius = 60;
    this.markerSize = 4;

    this.editor = options.editor;

    if(options.noClick)
      this.$el.unbind('click');

    if(this.model.from)
      this.model.from.on('change:pos', this.update, this);
      
    if(this.model.to)
      this.model.to.on('change:pos', this.update, this);

    this.model.on('destroy', this.destroy, this);

    if(this.model.get("connectionType") === 'money') { 
      this.model.on('change:disbursed', this.updateStrokeWidth, this);
      this.model.on('change:disbursed', this.updateDisbursed, this);
      this.model.on('change:pledged', this.updateStrokeWidth, this);
      this.editor.on('change:moneyConnectionMode', this.updateStrokeWidth, this);
    }
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
  
  destroy: function(){
    if(this.model.from)
      this.model.from.off('change:pos', this.update, this);
      
    if(this.model.to)
      this.model.to.off('change:pos', this.update, this);
      
    View.prototype.destroy.call(this);
  },
  
  afterRender: function(){
    //this.selectStyle = 'hsl(205,100%,55%)';

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
        this.$el.addClass(this.editor.moneyConnectionMode);
        this.updateStrokeWidth();
        this.isMoney = true;
        this.strokeWidth = 1;
        break;
    }
    
    // also creates something crucial for the other connections
    this.createCoinDefinitions();
    
    //if(this.isMoney && this.editor)
      //this.updateStrokeWidth();
    
    if(this.model.get("connectionType") === 'money'){
      this.pathSettings = {
        'marker-end': "url(#"+ this.coinReference +")",
        'marker-start': "url(#"+ this.coinReference +")",
        'marker-mid': "url(#"+ this.coinReference +")",
        'stroke-width': this.strokeWidth
      };
      this.markerSize = 0;
    } else {
      this.pathSettings = {
        'marker-end': 'url(#'+ this.model.id +')',
        'stroke': this.strokeStyle,
        'stroke-width': this.strokeWidth
      };
      
      this.markerSize = this.strokeWidth/2 * this.markerRatio;
      if(!this.isMoney){
        var arrow = this.svg.marker(this.defs, this.model.id, this.markerRatio/2, this.markerRatio/2, this.markerRatio, this.markerRatio);
        this.svg.use(arrow, 0, 0, this.markerRatio, this.markerRatio, '#trianglePath', { fill: this.strokeStyle, overflow:"visible" });
      }
    }

    this.g = this.svg.group();
    createGlobalDefs();
    this.update();
    
    this.$el.addClass( this.model.get("connectionType") );
  },
  
  createCoinDefinitions: function(){
    // case: coin size gets changed
    // then: remove coinMarker if its already there
    if(this.coinMarker)
      this.svg.remove(this.coinMarker);
    
    // coin definition
    this.coinDistance = 4 * this.coinSizeFactor;
    this.coinReference = this.model.id + "-coin";
  
    this.coinWidth = 7 * this.coinSizeFactor;
    this.coinHeight = 12 * this.coinSizeFactor;
    //only set the marker if it is a money connection
    if(this.isMoney){
      this.coinMarker = this.svg.marker(this.defs, this.coinReference, this.coinWidth/2, this.coinHeight/2, this.coinWidth, this.coinHeight, "auto");
      this.svg.use(this.coinMarker, 0, 0, this.coinWidth, this.coinHeight, '#coinSymbol');
    }
  },

  hasBothConnections: function(){
    return (this.model.from && this.model.to);
  },

  update: function(){
    // return if not a valid connection
    if(!this.hasBothConnections()) return

    var from = this.model.from.get('pos');    
    var to = this.model.to.get('pos');
    
    this.offset = 2*(this.strokeWidth + this.markerSize);
    
    if(this.isMoney)
      this.offset = this.coinHeight*2;
    
    var pos = {
      x : Math.min(from.x, to.x),
      y : Math.min(from.y, to.y)
    }
    
    // round because our positions are float, not integer
    var start = {
      x : Math.round(from.x - pos.x),
      y : Math.round(from.y - pos.y)
    };
    var end = {
      x : Math.round(to.x - pos.x),
      y : Math.round(to.y - pos.y)
    };
    
    //var alpha = Math.atan2(end.y - start.y, end.x - start.x);
    
    var width = Math.abs(from.x - to.x)  + this.offset;
    var height = Math.abs(from.y - to.y) + this.offset;
    
    // resize it
    this.svg.configure({
      'width' : width,
      'height' : height
    }, true);
    
    this.$('g').attr('transform', 'translate('+ this.offset/2 +' '+ this.offset/2 +')');
    
    this.$el.css({
      'left': pos.x,
      'top': pos.y,
      'marginTop': -this.offset/2,
      'marginLeft': -this.offset/2,
      'width': width,
      'height': height
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
        start.x += this.editor.radius;
        end.x -= this.editor.radius + this.markerSize;
        this.definePath1Line(start, end);
      }
      //case 1c
      //
      // ──┐
      //   └──➝
      //  
      else if(end.y - start.y <= this.editor.radius+this.edgeRadius){
        start.x += this.editor.radius;
        end.x -= this.editor.radius + this.markerSize;
        this.definePath3LinesX(start, end, 1, 0);
      }
      //case 1d
      //  
      //  │
      //  └┐
      //   ↓
      //
      else if(end.x - start.x <= this.editor.radius+this.edgeRadius){
        start.y += this.editor.radius;
        end.y -= this.editor.radius + this.markerSize;
        this.definePath3LinesY(start, end, 0, 1);
      }
      //case 1a+b
      //  
      //  ──┐
      //    ↓
      //
      else {
        start.x += this.editor.radius;
        end.y -= this.editor.radius + this.markerSize;
        start2 = {
          x : start.x,
          y : start.y + this.edgeRadius
        };
        end2 = {
          x : end.x - this.edgeRadius,
          y : end.y - this.edgeRadius
        };
        this.definePath2Lines(start, end, start2, end2, 1, this.edgeRadius, false);
      }
    }
    //case 2
    else if(start.x <= end.x && start.y > end.y){
      //case 2f
      //  
      //  ↑
      //  │
      //
      if(start.x == end.x){
        start.y -= this.editor.radius;
        end.y += this.editor.radius + this.markerSize;
        this.definePath1Line(start, end);
      }
      //case 2c
      //
      //   ┌──➝
      // ──┘
      //
      else if(start.y - end.y < this.editor.radius+this.edgeRadius){
        start.x += this.editor.radius;
        end.x -= this.editor.radius + this.markerSize;
        this.definePath3LinesX(start, end, 0, 1);
      }
      //case 2d
      //  
      //   ↑
      //  ┌┘
      //  │
      //
      else if(end.x - start.x < this.editor.radius+this.edgeRadius){
        start.y -= this.editor.radius;
        end.y += this.editor.radius + this.markerSize;
        this.definePath3LinesY(start, end, 1, 0);
      }
      //case 2a+b
      //  
      //    ↑
      //  ──┘
      //  
      else {
        start.x += this.editor.radius;
        end.y += this.editor.radius + this.markerSize;
        start2 = {
          x : start.x,
          y : start.y - this.edgeRadius
        };
        end2 = {
          x : end.x - this.edgeRadius,
          y : end.y - 10
        };
        this.definePath2Lines(start, end, start2, end2, 0, this.edgeRadius, false);
      }
    }
    //case 3
    else if(start.x > end.x && start.y <= end.y){
      //case 3f
      //  
      //  ←──
      //
      if(start.y == end.y){
        start.x -= this.editor.radius;
        end.x += this.editor.radius + this.markerSize;
        this.definePath1Line(start, end);
      }
      //case 3c
      //
      //    ┌──
      //  ←─┘
      //
      else if(end.y - start.y < this.editor.radius+this.edgeRadius){
        start.x -= this.editor.radius;
        end.x += this.editor.radius + this.markerSize;
        this.definePath3LinesX(start, end, 0, 1);
      }
      //case 3d
      //
      //    │
      //  ┌─┘
      //  ↓
      //
      else if(start.x - end.x < this.editor.radius+this.edgeRadius){
        start.y += this.editor.radius;
        end.y -= this.editor.radius + this.markerSize;
        this.definePath3LinesY(start, end, 1, 0);
      }
      //case 3a+b
      //
      //    │
      //  ←─┘
      //
      else {
        start.y += this.editor.radius;
        end.x += this.editor.radius + this.markerSize;
        start2 = {
          x : start.x - this.edgeRadius,
          y : start.y
        };
        end2 = {
          x : end.x,
          y : end.y - this.edgeRadius
        };
        this.definePath2Lines(start, end, start2, end2, 1, this.edgeRadius, true);
      }
    }
    //case 4
    else {
      //case 1f
      //
      //  │
      //  ↓
      //
      if(start.x == end.x){
        start.y += this.editor.radius;
        end.y -= this.editor.radius + this.markerSize;
        this.definePath1Line(start, end);
      }
      //case 4c
      //
      //  ←─┐
      //    └──
      //
      else if(start.y - end.y < this.editor.radius+this.edgeRadius){
        start.x -= this.editor.radius;
        end.x += this.editor.radius + this.markerSize;
        this.definePath3LinesX(start, end, 1, 0);
      }
      //case 4d
      //
      //    ↑
      //    └┐
      //     │
      //
      else if(start.x - end.x < this.editor.radius+this.edgeRadius){
        start.y -= this.editor.radius;
        end.y += this.editor.radius + this.markerSize;
        this.definePath3LinesY(start, end, 0, 1);
      }
      //case 4a+b
      //
      //  ←─┐
      //    │
      //
      else {
        start.y -= this.editor.radius;
        end.x += this.editor.radius + this.markerSize;
        start2 = {
          x : start.x - this.edgeRadius,
          y : start.y
        };
        end2 = {
          x : end.x,
          y : end.y + this.edgeRadius
        };
        this.definePath2Lines(start, end, start2, end2, 0, this.edgeRadius, true);
      }
    }

    if(this.pathElement) this.svg.remove(this.pathElement);
    
    this.pathElement = this.svg.path(this.g, this.path, this.pathSettings);
  },

  /* 
   * Define the thickness of the money line.
   */
  updateStrokeWidth: function(){

    var editor = this.editor;

    var amountType;
    var amount;
    if(editor.moneyConnectionMode === 'pledgedMode'){
      amount = this.model.get('pledged') || 0;
      this.$el.removeClass('disbursedMode');
      this.$el.addClass('pledgedMode');
      amountType = 'pledged';
    } else {
      amount = this.model.get('disbursed') || 0;
      this.$el.removeClass('pledgedMode');
      this.$el.addClass('disbursedMode');
      amountType = 'disbursed';
    }

    console.log("--------------------");
    console.log("amount"+amount);
    var maxMoneyAmount = 0;
    var minMoneyAmount = 0;

    var size = editor.moneyConnections.models.length;
    
    //there is at least 1 other money connection on the map already
    if(size > 1){
      maxMoneyAmount = editor.maxMoneyConnection.attributes[ amountType ];
      minMoneyAmount = editor.minMoneyConnection.attributes[ amountType ];

      //current connection will influence others only if it is the min or maxConnection
      var isMinOrMax = false; 
      if(this.id === editor.maxMoneyConnection.id){
        isMinOrMax = true;
        if(amount > maxMoneyAmount)
          maxMoneyAmount = amount;
        else if(amount < maxMoneyAmount) //another connection could be the new maxConnection
          maxMoneyAmount = editor.getMaxConnection().attributes[ amountType ];
      }else if(this.id === editor.minMoneyConnection.id){
        isMinOrMax = true;
        if(amount < minMoneyAmount)
          minMoneyAmount = amount;
        else if(amount > minMoneyAmount)//another connection could be the new minMoneyConnection
          minMoneyAmount = editor.getMinConnection().attributes[ amountType ];
      }

      console.log("minMoneyAmount"+minMoneyAmount);
      console.log("maxMoneyAmount"+maxMoneyAmount);

      var isMinMaxEqual = minMoneyAmount === maxMoneyAmount;

      var minCoinFactor = this.minCoinSizeFactor;

      //connections have at least 1 different money value
      //moneyRange can't be 0, because in a later calculation divide by 0 is not possible
      if(!isMinMaxEqual){
        var factorRange = this.maxCoinSizeFactor - this.minCoinSizeFactor; 
        var moneyRange = maxMoneyAmount - minMoneyAmount;

        console.log("factorRange"+factorRange);
        console.log("moneyRange"+moneyRange);

        if(isMinOrMax) {
          // go through all moneyConnections and recalc all coinSizeFactors
          $.each(editor.moneyConnections.models, function(key, value){
            var amountDif = value.attributes[ amountType ] - minMoneyAmount;
            value.coinSizeFactor = amountDif / moneyRange * factorRange + minCoinFactor;
            console.log("value.coinSizeFactor"+value.coinSizeFactor);
          });
        } else { //otherwise just calc for the current connection 
          var amountDif = amount - minMoneyAmount;
          this.coinSizeFactor = amountDif / moneyRange * factorRange + minCoinFactor;
          console.log("this.coinSizeFactor"+this.coinSizeFactor);
        } 

      } else { //there is at least 2 connection and all with the same money Amount
        $.each(editor.moneyConnections.models, function(key, value){
          value.coinSizeFactor = minCoinFactor;
          console.log("value.coinSizeFactor"+value.coinSizeFactor);
        });
      }

    } else { // set minCoinSize for the first money connection
      editor.maxMoneyConnection = this.model;
      editor.minMoneyConnection = this.model;
      this.coinSizeFactor = this.minCoinSizeFactor;
    }

    this.createCoinDefinitions();
    this.update();
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
      var cfw = new ConnectionFormView({ model: this.model, editor: this.editor });
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
  },
  
  // slices a line from a to b into segments
  // returns 
  //    segments: a space seperated string of numbers
  //    endPosition: the last position on the path (rest)
  slicedPathSegments: function(a, b, distance){
    var length = Math.abs(b - a);
    var sign = a > b ? -1 : 1;
    var count = Math.floor(length / distance);
    var segments = [];
    
    for(var i=1; i<=count; i++){
      segments.push(a + sign*i*distance);
    }
    
    //segments.push(b);
    
    return segments.join(" ");
  },
  
  /*
    sweepFlag 
      0: anti-clockwise
      1: clockwise
  */
  slicedQuarterCircleSegments: function(x0, y0, x1, y1, radius, sweepFlag, distance, hasRightDirection){
    var length = Math.PI/2 * radius;
    //REMOVE THE LINE BELOW TO GET THE ORIGINAL COIM DISTANCE, JUST A HACK TO MAKE BIG LINES NICER
    distance /= 2;
    var count = Math.floor(length / distance);
    var segments = [];
    var signX = 1;
    var signY = 1;
    var alpha = 2 * Math.asin(distance / (2*radius));
    var dx, dy;
    var sumX = 0;
    var sumY = 0;
 
    if(x1 < x0){
      signX *= -1;
    }
    if(y1 < y0){
      signY *= -1;
    }

    var path = ' a ' + radius + ' ' + radius + ' 0 0 ' + sweepFlag + ' ';
    
    for(var i=1; i<=count; i++){  

      if(hasRightDirection){
        dx = radius * (1-Math.cos (i*alpha)) - sumX;
        dy = radius * Math.sin (i*alpha) - sumY;
      }
      else{
        dx = radius * Math.sin (i*alpha) - sumX;
        dy = radius * (1-Math.cos (i*alpha)) - sumY;
      }

      sumX += dx;
      sumY += dy;
      
      segments.push(path + signX*dx + ' ' + signY*dy);
    }
    
    // move back to last
    segments.push(path + signX*(radius-sumX) + ' ' + signY*(radius-sumY));
    
    return segments.join(" ");
  },

  definePath1Line: function(start, end){
    // start path
    this.path = 'M ' + start.x + ' ' + start.y;

    if(start.y === end.y){
      // path goes horizontal
      this.path += ' H ' + this.slicedPathSegments(start.x, end.x, this.coinDistance);
    } else {
      // path goes vertical
      this.path += ' V '  + this.slicedPathSegments(start.y, end.y, this.coinDistance);
    }
  },
  

  definePath2Lines: function(start, end, start2, end2, sweepFlag, edgeRadius, hasRightDirection){

    this.path = 'M ' + start.x + ' ' + start.y;
    
    if(start.x < end.x){
      this.addPathSegment(start.x, end2.x, this.coinDistance, ' H ');
      this.path += this.slicedQuarterCircleSegments(end2.x, start.y, end.x, start2.y, edgeRadius, sweepFlag, this.coinDistance, hasRightDirection);
      this.addPathSegment(start2.y, end.y, this.coinDistance, ' V ');
    }
    else{
      this.addPathSegment(start.y, end2.y, this.coinDistance, ' V ');
      this.path += this.slicedQuarterCircleSegments(start.x, end2.y, start2.x, end.y, edgeRadius, sweepFlag, this.coinDistance, hasRightDirection);
      this.addPathSegment(start2.x, end.x, this.coinDistance, ' H ');
    }
  },

  definePath3LinesX: function(start, end, sweepFlag1, sweepFlag2){
    var edgeRadius = this.edgeRadius;
    var halfX = start.x + (end.x - start.x)/2;
    var firstY, secondY, firstX, secondX;
    var dy = Math.abs(end.y - start.y);
    
    if(dy/2 < edgeRadius)
      edgeRadius = dy/2;
    
    if(end.y - start.y > 0){
      firstY = start.y + edgeRadius;
      secondY = end.y - edgeRadius;
    } else {
      firstY = start.y - edgeRadius;
      secondY = end.y + edgeRadius;
    }
    
    if(end.x - start.x > 0){
      firstX = halfX - edgeRadius;
      secondX = halfX + edgeRadius;
    } else {
      firstX = halfX + edgeRadius;
      secondX = halfX - edgeRadius;
    }
      
    this.path = 'M ' + start.x + ' ' + start.y;
    this.addPathSegment(start.x, firstX, this.coinDistance, ' H ');
    this.path += this.slicedQuarterCircleSegments(firstX, start.y, halfX, firstY, edgeRadius, sweepFlag1, this.coinDistance, false);
    this.addPathSegment(firstY, secondY, this.coinDistance, ' V ');
    this.path += this.slicedQuarterCircleSegments(halfX, secondY, secondX, end.y, edgeRadius, sweepFlag2, this.coinDistance, true);
    this.addPathSegment(secondX, end.x, this.coinDistance, ' H ');
  },

  definePath3LinesY: function(start, end, sweepFlag1, sweepFlag2){
    var edgeRadius = this.edgeRadius;
    var halfY = start.y + (end.y - start.y)/2;
    var firstX, secondX, firstY, secondY;
    var dx = Math.abs(end.x - start.x);

    if(dx/2 < edgeRadius)
      edgeRadius = dx/2;

    if(end.x - start.x > 0){
      firstX = start.x + edgeRadius;
      secondX = end.x - edgeRadius;
    }
    else{
      firstX = start.x - edgeRadius;
      secondX = end.x + edgeRadius;
    }

    if(end.y - start.y > 0){
      firstY = halfY - edgeRadius;
      secondY = halfY + edgeRadius;
    }
    else{
      firstY = halfY + edgeRadius;
      secondY = halfY - edgeRadius;
    }

    this.path = 'M ' + start.x + ' ' + start.y;
    this.addPathSegment(start.y, firstY, this.coinDistance, ' V ');
    this.path += this.slicedQuarterCircleSegments(start.x,firstY,firstX,halfY,edgeRadius, sweepFlag1, this.coinDistance, true);
    this.addPathSegment(firstX, secondX, this.coinDistance, ' H ');
    this.path += this.slicedQuarterCircleSegments(secondX,halfY,end.x,secondY,edgeRadius, sweepFlag2, this.coinDistance, false);
    this.addPathSegment(secondY, end.y, this.coinDistance, ' V ');
  },

  addPathSegment: function(start, end, distance, direction){
    var pathSegments = this.slicedPathSegments(start, end, distance);
    //console.log("pathSegment", typeof pathSegments);
    //console.log(direction + " '" + pathSegments + "'");
    if (pathSegments && pathSegments != " " && pathSegments != "" && pathSegments != undefined)
      this.path += direction + pathSegments;
  }
});

function createGlobalDefs(){
  if(this.svg === undefined){
    $('body').svg().find('> svg').attr('id', 'svgDefinitions');
    this.svg = $('body').svg('get');
    var defs = this.svg.defs();
    
    // marker definition
    var markerSymbol = this.svg.symbol(defs, 'trianglePath', 0, 0, 1, 1);
    this.svg.path(markerSymbol, 'M 0 0 L 1 0.5 L 0 1 z');
    
    // coin definition
    var yellowStops = [['0%', '#fbd54d'], ['25%', '#fae167'], ['50%', '#fcd852'], ['100%', '#f7eb7a']];
    this.svg.linearGradient(defs, 'moneyGradient', yellowStops, 0, 0, 0, "100%");
    
    var highlightStop = [['0%', 'white'], ['100%', 'white', '0']];
    this.svg.linearGradient(defs, 'whiteToTransparent', highlightStop, "100%", 0, 0, "100%");
    
    var highlightMask = this.svg.mask(defs, 'coinHighlightMask', 0, 0, 6, 11);
    this.svg.rect(highlightMask, 1, 1, 6, 11, 1.5, 1.5, { fill: 'white' });
    this.svg.rect(highlightMask, -2, 1, 6, 11, 1.5, 1.5, { fill: 'black' });
    
    var coinSymbol = this.svg.symbol(defs, 'coinSymbol', 0, 0, 6, 11);
    this.svg.rect(coinSymbol, 0.5, 0.5, 6, 11, 2, 2, { fill: 'url(#moneyGradient)', stroke: '#eaab51', 'stroke-width': 1 });
    this.svg.rect(coinSymbol, -1, 1, 6, 11, 1.5, 1.5, { fill: 'url(#whiteToTransparent)',  mask: 'url(#coinHighlightMask)' }); 
  }
}