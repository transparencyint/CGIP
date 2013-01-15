var View = require('./view');
var ConnectionDetailsView = require('views/connection_details');

module.exports = View.extend({
  selectable: true,

  template: require('./templates/connection'),

  tagName : 'div',
  className : 'connection',
  selectable : true,

  events: {
    'mouseover' : 'showMetadata',
    'mousemove' : 'stickMetadata',
    'mouseout' : 'hideMetadata',
    'mousedown' : 'hideMetadata',
    'dblclick' : 'showDetails',
    'click' : 'select'
  },

  initialize: function(options){

    this.model.coinSizeFactor = 1;
    this.edgeRadius = 10;
    this.strokeWidth = 6;
    this.markerRatio = 2.5;
    this.markerSize = 4;
    
    this.selectionBorderSize = 4;
    this.clickAreaRadius = 40;

    this.editor = options.editor;

    if(options.noClick)
      this.$el.unbind('click');

    if(this.model.from)
      this.model.from.on('change:pos', this.update, this);
      
    if(this.model.to)
      this.model.to.on('change:pos', this.update, this);

    this.model.on('destroy', this.destroy, this);
    
    this.isMoney = this.model.get('connectionType') === 'money';
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
    
    this.path = "";
    this.$el.svg();

    this.svg = this.$el.svg('get');
    this.defs = this.svg.defs();
    
    this.$el.addClass(this.model.get('connectionType'));
    
    this.pathSettings = {
      class_: 'path', 
      strokeWidth: this.isMoney ? 1 : this.strokeWidth
    };
    
    this.selectSettings = {
      class_: 'selectPath'
    };
    
    if(this.isMoney){
      this.$el.addClass(config.get('moneyConnectionMode'));
      this.model.calculateCoinSize();

      this.createCoinDefinitions();
      
      this.pathSettings['marker-start'] = "url(#"+ this.coinReference +")";
      this.pathSettings['marker-mid'] = "url(#"+ this.coinReference +")";
      this.pathSettings['marker-end'] = "url(#"+ this.coinReference +")";

      this.markerSize = 0;

      this.model.on('change:disbursed', this.updateDisbursed, this);
      this.model.on('change:coinSizeFactor', this.updateConnection, this);

    } else {
      // also creates something crucial for the other connections
      this.createCoinDefinitions();
      
      this.markerSize = this.strokeWidth/2 * this.markerRatio;
      
      var arrow = this.svg.marker(this.defs, this.model.id +'-arrow', this.markerRatio/2, this.markerRatio/2, this.markerRatio, this.markerRatio, 'auto', { class_: 'arrow' });
      this.svg.path(arrow, 'M 0 0 L '+ this.markerRatio +' '+ this.markerRatio/2 +' L 0 '+ this.markerRatio +' z');
      
      var selectedArrowSize = this.markerRatio - 0.5;
      
      var selectedArrow = this.svg.marker(this.defs, this.model.id +'-selected-arrow', selectedArrowSize/2.5, selectedArrowSize/2, selectedArrowSize, selectedArrowSize, 'auto', { class_: 'selected-arrow' });
      this.svg.path(selectedArrow, 'M 0 0 L '+ selectedArrowSize +' '+ selectedArrowSize/2 +' L 0 '+ selectedArrowSize +' z');

      this.pathSettings['marker-end'] = 'url(#'+ this.model.id + '-arrow)';
      this.selectSettings['marker-end'] = 'url(#'+ this.model.id + '-selected-arrow)';
    }

    this.g = this.svg.group();    
    createGlobalDefs();

    this.update();

    this.$el.addClass( this.model.get("connectionType") );
  },

  updateConnection: function(){
    this.createCoinDefinitions();
    this.update();
  },
  
  createCoinDefinitions: function(){
    // case: coin size gets changed
    // then: remove coinMarker if its already there
    if(this.coinMarker)
      this.svg.remove(this.coinMarker);
    
    // coin definition
    this.coinDistance = 4 * this.model.coinSizeFactor;
    this.coinReference = this.model.id + "-coin";
  
    this.coinWidth = 7 * this.model.coinSizeFactor;
    this.coinHeight = 12 * this.model.coinSizeFactor;

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

    var fromMargins = this.model.from.margins;
    var toMargins = this.model.to.margins;
    
    var overlap = Math.max(this.strokeWidth + this.markerSize + this.selectionBorderSize, this.clickAreaRadius);
    this.offset = 2 * overlap;
    
    if(this.isMoney)
      this.offset = this.coinHeight*2;
    
    this.pos = {
      x : Math.min(from.x, to.x),
      y : Math.min(from.y, to.y)
    }
    
    // round because our positions are float, not integer
    var start = {
      x : Math.round(from.x - this.pos.x),
      y : Math.round(from.y - this.pos.y)
    };
    var end = {
      x : Math.round(to.x - this.pos.x),
      y : Math.round(to.y - this.pos.y)
    };
    
    var width = Math.abs(from.x - to.x)  + this.offset;
    var height = Math.abs(from.y - to.y) + this.offset;

    // resize it
    this.svg.configure({
      'width' : width,
      'height' : height
    }, true);
    
    this.$('g').attr('transform', 'translate('+ this.offset/2 +' '+ this.offset/2 +')');
    
    this.$el.css({
      'left': this.pos.x,
      'top': this.pos.y,
      'marginTop': -this.offset/2,
      'marginLeft': -this.offset/2,
      'width': width,
      'height': height
    });

    var halfX;
    var halfY;
    var start2, end2;

    //checking in which relation the start and end actor are
    //case 1
    if(start.x < end.x && start.y <= end.y){
      //case 1f
      //
      // ────➝
      //
      if(start.y == end.y){
        start.x += fromMargins.right;
        end.x -= toMargins.left + this.markerSize;
        this.definePath1Line(start, end, 1);
      }
      //case 1c
      //
      // ──┐
      //   └──➝
      //  
      else if(end.y - start.y <= (fromMargins.bottom + toMargins.top)/2+this.edgeRadius){
        start.x += fromMargins.right;
        end.x -= toMargins.left + this.markerSize;
        this.definePath3LinesX(start, end, 1, 0, 1);
      }
      //case 1d
      //  
      //  │
      //  └┐
      //   ↓
      //
      else if(end.x - start.x <= (fromMargins.right + toMargins.left)/2 + this.edgeRadius){
        start.y += fromMargins.bottom;
        end.y -= toMargins.top + this.markerSize;
        this.definePath3LinesY(start, end, 0, 1, 2);
      }
      //case 1a+b
      //  
      //  ──┐
      //    ↓
      //
      else {
        start.x += fromMargins.right;
        end.y -= toMargins.top + this.markerSize;
        start2 = {
          x : start.x,
          y : start.y + this.edgeRadius
        };
        end2 = {
          x : end.x - this.edgeRadius,
          y : end.y - this.edgeRadius
        };
        this.definePath2Lines(start, end, start2, end2, 1, this.edgeRadius, false, 2);
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
        start.y -= fromMargins.top;
        end.y += toMargins.bottom + this.markerSize;
        this.definePath1Line(start, end, 0);
      }
      //case 2c
      //
      //   ┌──➝
      // ──┘
      //
      else if(start.y - end.y <  (fromMargins.top + toMargins.bottom)/2 + this.edgeRadius*3){
        start.x += fromMargins.right;
        end.x -= toMargins.left + this.markerSize;
        this.definePath3LinesX(start, end, 0, 1, 1);
      }
      //case 2d
      //  
      //   ↑
      //  ┌┘
      //  │
      //
      else if(end.x - start.x < (fromMargins.right + toMargins.left)/2 + this.edgeRadius){
        start.y -= fromMargins.top;
        end.y += toMargins.bottom + this.markerSize;
        this.definePath3LinesY(start, end, 1, 0, 0);
      }
      //case 2a+b
      //  
      //    ↑
      //  ──┘
      //  
      else {
        start.x += fromMargins.right;
        end.y += toMargins.bottom + this.markerSize;
        start2 = {
          x : start.x,
          y : start.y - this.edgeRadius
        };
        end2 = {
          x : end.x - this.edgeRadius,
          y : end.y - 10
        };
        this.definePath2Lines(start, end, start2, end2, 0, this.edgeRadius, false, 0);
      }
    }
    //case 3
    else if(start.x > end.x && start.y <= end.y){
      //case 3f
      //  
      //  ←──
      //
      if(start.y == end.y){
        start.x -= fromMargins.right;
        end.x += toMargins.left + this.markerSize;
        this.definePath1Line(start, end, 3);
      }
      //case 3c
      //
      //    ┌──
      //  ←─┘
      //
      else if(end.y - start.y < (fromMargins.bottom + toMargins.top)/2 + this.edgeRadius){
        start.x -= fromMargins.left;
        end.x += toMargins.right + this.markerSize;
        this.definePath3LinesX(start, end, 0, 1, 3);
      }
      //case 3d
      //
      //    │
      //  ┌─┘
      //  ↓
      //
      else if(start.x - end.x < (fromMargins.left + toMargins.right)/2 + 3*this.edgeRadius){
        start.y += fromMargins.bottom;
        end.y -= toMargins.top + this.markerSize;
        this.definePath3LinesY(start, end, 1, 0, 2);
      }
      //case 3a+b
      //
      //    │
      //  ←─┘
      //
      else {
        start.y += fromMargins.bottom;
        end.x += toMargins.right + this.markerSize;
        start2 = {
          x : start.x - this.edgeRadius,
          y : start.y
        };
        end2 = {
          x : end.x,
          y : end.y - this.edgeRadius
        };
        this.definePath2Lines(start, end, start2, end2, 1, this.edgeRadius, true, 3);
      }
    }
    //case 4
    else {
      //case 4f
      //
      //  │
      //  ↓
      //
      if(start.x == end.x){
        start.y += fromMargins.bottom;
        end.y -= toMargins.top + this.markerSize;
        this.definePath1Line(start, end, 2);
      }
      //case 4c
      //
      //  ←─┐
      //    └──
      //
      else if(start.y - end.y < (fromMargins.top + toMargins.bottom)/2 + this.edgeRadius){
        start.x -= fromMargins.left;
        end.x += toMargins.right + this.markerSize;
        this.definePath3LinesX(start, end, 1, 0, 3);
      }
      //case 4d
      //
      //    ↑
      //    └┐
      //     │
      //
      else if(start.x - end.x < (fromMargins.left + toMargins.right)/2 + 3*this.edgeRadius){
        start.y -= fromMargins.top;
        end.y += toMargins.bottom + this.markerSize;
        this.definePath3LinesY(start, end, 0, 1, 0);
      }
      //case 4a+b
      //
      //  ←─┐
      //    │
      //
      else {
        start.y -= fromMargins.top;
        end.x += toMargins.right + this.markerSize;
        start2 = {
          x : start.x - this.edgeRadius,
          y : start.y
        };
        end2 = {
          x : end.x,
          y : end.y + this.edgeRadius
        };
        this.definePath2Lines(start, end, start2, end2, 0, this.edgeRadius, true, 3);
      }
    }
    
    // remove path and its clones
    if(this.pathSymbol) this.svg.remove(this.pathSymbol);
    if(this.selectPath) this.svg.remove(this.selectPath);
    if(this.pathElement) this.svg.remove(this.pathElement);
    if(this.clickArea) this.svg.remove(this.clickArea);
    
    // recalculate select-border size (depending on strokeWidth)
    var pathWidth = this.isMoney ? this.coinHeight : this.strokeWidth;
    this.selectSettings['stroke-width'] = pathWidth + 2 * this.selectionBorderSize;

    // render all paths and clones
    // (tried to do this just once and then only update the path but that produced unwanted 'ghost' connections)
    this.pathSymbol = this.svg.path(this.g, this.path, { 'id': this.model.id });
    this.selectPath = this.svg.use(this.g, 0, 0, "100%", "100%", '#' + this.model.id, this.selectSettings);
    this.pathElement = this.svg.use(this.g, 0, 0, "100%", "100%", '#' + this.model.id, this.pathSettings);
    this.clickArea = this.svg.use(this.g, 0, 0, "100%", "100%", '#' + this.model.id, { class_: 'clickBorder', strokeWidth: this.clickAreaRadius });
  },

  updateDisbursed: function(){ 
    this.$('.metadata').text('$' + this.model.get('disbursed'));
  },

  showDetails: function(){
    if(this.isMoney){
      var cfw = new ConnectionDetailsView({ model: this.model, editor: this.editor, connection: this });
      this.editor.$el.append(cfw.render().el);
    }
  },

  showMetadata: function(e){
    if(this.model.get('disbursed')){
      var metadata = this.$('.metadata');
      metadata.css({left: e.offsetX + 30, top: e.offsetY + 10});
      metadata.show();
    }
  },
  
  stickMetadata: function(e){
    var x = e.pageX - this.editor.center - this.editor.offset.left - this.pos.x;
    var y = e.pageY - this.editor.offset.top - this.pos.y;
    
    this.$('.metadata').css({
      left: x + 30, 
      top: y + 10
    });
  },

  hideMetadata: function(e){ 
    var metadata = this.$('.metadata');
    metadata.hide();  
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
    //calculation the coin distance depending on the money connection thickness
    //if the maximum money connection is changed the multiplied value may be changed
    var dis = distance / (this.model.coinSizeFactor*1.0);

    var length = Math.PI/2 * radius;
    var count = Math.floor(length / dis);
    var segments = [];
    var signX = 1;
    var signY = 1;
    var alpha = 2 * Math.asin(dis / (2*radius));
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
    
    //drawing every single path segment
    for(var i=1; i<=count; i++){ 
      //getting the right circle direction 
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

    slicedEdgeCircleSegments: function(x0, y0, x1, y1, radius, sweepFlag, distance, hasRightDirection){
    //calculation the coin distance depending on the money connection thickness
    //if the maximum money connection is changed the multiplied value may be changed
    var dis = distance / (this.model.coinSizeFactor*1.0);

    var length = Math.PI/2 * radius;
    var count = Math.floor(length / dis);
    var segments = [];
    var signX = 1;
    var signY = 1;
    var alpha = 2 * Math.asin(dis / (2*radius));
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
    
    //drawing every single path segment
    for(var i=1; i<=count; i++){ 
      //getting the right circle direction 
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
      
      segments.push(path + signX*dx*1.5 + ' ' + signY*dy);
    }
    
    // move back to last
    segments.push(path + signX*(radius-sumX) + ' ' + signY*(radius-sumY));
    
    return segments.join(" ");
  },

  definePath1Line: function(start, end, direction){
    // start path
    this.path = 'M ' + start.x + ' ' + start.y;

    if(this.model.get("connectionType") === 'money'){
      if(start.y === end.y){
        // path goes horizontal
        this.path += ' H ' + this.slicedPathSegments(start.x, end.x, this.coinDistance);
      } else {
        // path goes vertical
        this.path += ' V '  + this.slicedPathSegments(start.y, end.y, this.coinDistance);
      }
    }
    else{
      this.path += ' L ' + end.x + ' ' + end.y;
      if(navigator.userAgent.indexOf('Firefox') != -1){
        this.addArrowFirefox(end, direction);
      }
    }
  },
  

  definePath2Lines: function(start, end, start2, end2, sweepFlag, edgeRadius, hasRightDirection, direction){

    this.path = 'M ' + start.x + ' ' + start.y;

    if(start.x < end.x){
      if(this.model.get("connectionType") === 'money'){
        this.addPathSegment(start.x, end2.x, this.coinDistance, ' H ');
        this.path += this.slicedQuarterCircleSegments(end2.x, start.y, end.x, start2.y, edgeRadius, sweepFlag, this.coinDistance, hasRightDirection);
        this.addPathSegment(start2.y, end.y, this.coinDistance, ' V ');
      }
      else{
        this.path += ' L ' + end2.x + ' ' + start.y;
        this.path += ' A ' + edgeRadius + ' ' + edgeRadius + ' ' + 0  + ' ' + 0 + ' ' + sweepFlag + ' ' + end.x + ' ' + start2.y;
        this.path += ' L ' + end.x + ' ' + end.y; 
        
      }
    }
    else{
      if(this.model.get("connectionType") === 'money'){
        this.addPathSegment(start.y, end2.y, this.coinDistance, ' V ');
        this.path += this.slicedQuarterCircleSegments(start.x, end2.y, start2.x, end.y, edgeRadius, sweepFlag, this.coinDistance, hasRightDirection);
        this.addPathSegment(start2.x, end.x, this.coinDistance, ' H ');
        //TO DO: ADD HERE THE DRAWING OF THE MONEY CONNECTION ARROW (AS A FUNCTION CALL)
      }
      else{
        this.path += ' L ' + start.x + ' ' + end2.y;
        this.path += ' A ' + edgeRadius + ' ' + edgeRadius + ' ' + 0  + ' ' + 0 + ' ' + sweepFlag + ' ' + start2.x + ' ' + end.y;
        this.path += ' L ' + end.x + ' ' + end.y; 
        
      }
    }
    if(navigator.userAgent.indexOf('Firefox') != -1){
          this.addArrowFirefox(end, direction);
        }
  },

  definePath3LinesX: function(start, end, sweepFlag1, sweepFlag2, direction){
    var edgeRadius = this.edgeRadius;
    var halfX = start.x + (end.x - start.x)/2;
    var firstY, secondY, firstX, secondX;
    var dy = Math.abs(end.y - start.y);
    
    if(dy/2 < edgeRadius)
      edgeRadius = dy/2;
    
    //define the waypoints of the connection
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
      
    //add all connection parts
    this.path = 'M ' + start.x + ' ' + start.y;

    if(this.model.get("connectionType") === 'money'){
      this.addPathSegment(start.x, firstX, this.coinDistance, ' H ');
      this.path += this.slicedQuarterCircleSegments(firstX, start.y, halfX, firstY, edgeRadius, sweepFlag1, this.coinDistance, false);
      this.addPathSegment(firstY, secondY, this.coinDistance, ' V ');
      this.path += this.slicedQuarterCircleSegments(halfX, secondY, secondX, end.y, edgeRadius, sweepFlag2, this.coinDistance, true);
      this.addPathSegment(secondX, end.x, this.coinDistance, ' H ');
    }
    else{
      this.path += ' L ' + firstX + ' ' + start.y;
      this.path += ' A ' + edgeRadius + ' ' + edgeRadius + ' ' + 0  + ' ' + 0 + ' ' + sweepFlag1 + ' ' + halfX + ' ' + firstY;
      this.path += ' L ' + halfX + ' ' + secondY;
      this.path += ' A ' + edgeRadius + ' ' + edgeRadius + ' ' + 0  + ' ' + 0 + ' ' + sweepFlag2 + ' ' + secondX + ' ' + end.y;
      this.path += ' L ' + end.x + ' ' + end.y; 
      if(navigator.userAgent.indexOf('Firefox') != -1){
        this.addArrowFirefox(end, direction);
      }
    }
  },

  definePath3LinesY: function(start, end, sweepFlag1, sweepFlag2, direction){
    var edgeRadius = this.edgeRadius;
    var halfY = start.y + (end.y - start.y)/2;
    var firstX, secondX, firstY, secondY;
    var dx = Math.abs(end.x - start.x);

    if(dx/2 < edgeRadius)
      edgeRadius = dx/2;

    //define the waypoints of the connection
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

    //add all connection parts
    this.path = 'M ' + start.x + ' ' + start.y;

    if(this.model.get("connectionType") === 'money'){
      this.addPathSegment(start.y, firstY, this.coinDistance, ' V ');
      this.path += this.slicedQuarterCircleSegments(start.x,firstY,firstX,halfY,edgeRadius, sweepFlag1, this.coinDistance, true);
      this.addPathSegment(firstX, secondX, this.coinDistance, ' H ');
      this.path += this.slicedQuarterCircleSegments(secondX,halfY,end.x,secondY,edgeRadius, sweepFlag2, this.coinDistance, false);
      this.addPathSegment(secondY, end.y, this.coinDistance, ' V ');
    }
    else{
      this.path += ' L ' + start.x + ' ' + firstY;
      this.path += ' A ' + edgeRadius + ' ' + edgeRadius + ' ' + 0  + ' ' + 0 + ' ' + sweepFlag1 + ' ' + firstX + ' ' + halfY;
      this.path += ' L ' + secondX + ' ' + halfY;
      this.path += ' A ' + edgeRadius + ' ' + edgeRadius + ' ' + 0  + ' ' + 0 + ' ' + sweepFlag2 + ' ' + end.x + ' ' + secondY;
      this.path += ' L ' + end.x + ' ' + end.y;
      if(navigator.userAgent.indexOf('Firefox') != -1){
        this.addArrowFirefox(end, direction);
      }
    }
  },

  //creates a straight line
  addPathSegment: function(start, end, distance, direction){
    var pathSegments = this.slicedPathSegments(start, end, distance);
    if (pathSegments && pathSegments != " " && pathSegments != "" && pathSegments != undefined)
      this.path += direction + pathSegments;
  },

  //creates the arrows for non-money-connections in firefox
  //direction:
  // 0: top, 1: right, 2: bottom, 3: left
  addArrowFirefox: function(end, direction){
    var prefix = 1;
    if (direction == 0 || direction == 3){
      prefix = -1;
    }

    //top or bottom
    if (direction == 0 || direction == 2){
      //go to the real endpoint
      this.path += ' L ' + end.x + ' ' + (end.y + prefix * this.markerSize/2);
      //draw 3 lines for the arrow
      this.path += ' L ' + (end.x + this.markerSize/4) + ' ' + end.y;
      this.path += ' L ' + (end.x - this.markerSize/4) + ' ' + end.y;
      this.path += ' L ' + end.x + ' ' + (end.y + prefix * this.markerSize/2);
    }
    //left or right
    else{
      //go to the real endpoint
      this.path += ' L ' + (end.x + prefix * this.markerSize/2) + ' ' + end.y;
      //draw 3 lines for the arrow
      this.path += ' L ' + end.x + ' ' + (end.y - this.markerSize/4);
      this.path += ' L ' + end.x + ' ' + (end.y + this.markerSize/4);
      this.path += ' L ' + (end.x + prefix * this.markerSize/2) + ' ' + end.y;
    }
  }
});

function createGlobalDefs(){
  if(this.svg === undefined){
    $('body').svg().find('> svg').attr('id', 'svgDefinitions');
    this.svg = $('body').svg('get');
    var defs = this.svg.defs();
    
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