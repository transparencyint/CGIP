// Each connection is visualized as a coloured line with an arrow indicating the direction of the relation.
// Additionally, a possible corruption risk will be displayed with an exclamation mark. 

var View = require('./view');
var ConnectionDetailsView = require('views/connection_details');

module.exports = View.extend({

  template: require('./templates/connection'),

  tagName : 'div',
  className : 'connection',
  selectable : true,

  events: function(){
    var _events = {
      'click': 'select',
      'dblclick': 'showDetails'
    };
    
    _events[ this.inputDownEvent ] = 'inputDown';
    _events[ this.inputUpEvent ] = 'cancelLongPress';
    
    return _events;
  },

  initialize: function(options){
    View.prototype.initialize.call(this, options);
    
    _.bindAll(this, 'showDetails','select');

    this.initializeProperties(options);
    
    if(this.isMoney)
      config.on('change:moneyConnectionMode', this.updateConnectionMode, this);
    
    this.model.on('change:hasCorruptionRisk', this.updateCorruptionRisk, this);

    if(options.noClick)
      this.$el.unbind('click');

    if(this.model.from){
      this.model.from.on('change:pos', this.update, this);
    }
      
    if(this.model.to){
      this.model.to.on('change:pos', this.update, this);
    }

    this.model.on('destroy', this.destroy, this);
    this.model.on('inScope', this.inScope, this);
  },

  initializeProperties: function(options){
    this.model.thicknessFactor = 1;
    this.edgeRadius = 10;
    this.strokeWidth = 6;
    this.markerRatio = 2.5;
    this.markerSize = 4;
    this.longPressDelay = 500;

    this.selectionBorderSize = 4;
    this.clickAreaRadius = 40;

    this.editor = options.editor;

    this.isSecondConnection = false;
    this.distanceSecond = 0;

    this.corruptionRisk = this.model.get('hasCorruptionRisk');

    this.isMoney = this.model.get('connectionType') === 'money';
  },

  test: function(strokeWidth, id){
    if(this.model.id == id) return;
    this.isSecondConnection = true;
    this.distanceSecond = strokeWidth;

    this.update();
  },
  
  stopPropagation: function(event){
    event.stopPropagation();
  },

  render: function(){
    // Only render it if it is a valid view
    if(this.hasBothConnections())
      View.prototype.render.call(this)
  },
  
  destroy: function(){
    if(this.model.from)
      this.model.from.off('change:pos', this.update, this);
      
    if(this.model.to)
      this.model.to.off('change:pos', this.update, this);
    
    this.model.unregisterRealtimeEvents();
    
    View.prototype.destroy.call(this);
  },
  
  afterRender: function(){
    
    this.$el.attr('id', this.model.id);
    
    this.path = "";
    this.$el.svg();

    this.svg = this.$el.svg('get');
    this.defs = this.svg.defs();
  
    this.selectSettings = {
      class_: 'selectPath'
    };

    // The thickness of the money connection is calculated
    // depending on the thickest money connection in the map 
    if(this.isMoney){
      this.updateConnectionMode();
      this.model.calculateLineThickness();
      this.strokeWidth = this.strokeWidth * this.model.thicknessFactor;
    }

    this.pathSettings = {
      class_: 'path', 
      strokeWidth: this.strokeWidth
    };

    this.selectedArrowSize = this.markerRatio - 1.0;

    this.arrow = this.svg.marker(this.defs, this.model.id +'-arrow', this.markerRatio/2, this.markerRatio/2, this.markerRatio, this.markerRatio, 'auto', { class_: 'arrow' });
    this.selectedArrow = this.svg.marker(this.defs, this.model.id +'-selected-arrow', this.selectedArrowSize/2.5, this.selectedArrowSize/2, this.selectedArrowSize, this.selectedArrowSize, 'auto', { class_: 'selected-arrow' });

    if(this.isMoney){
      this.model.on('change:isEmptyAmount', this.toggleEmptyAmountConnection, this)
      this.model.on('change:thicknessFactor', this.update, this);
    }

    this.g = this.svg.group();    
 
    this.update();

    this.$el.addClass( this.model.get("connectionType") );
  },

  inScope: function(){ this.$el.removeClass('outOfScope'); },

  // This function is called when the user changes the values
  // of the checkbox for the corruption risk of a connection
  updateCorruptionRisk: function(){
    this.corruptionRisk = this.model.get('hasCorruptionRisk');
    if(this.corruptionRisk)
      this.update();
    else
      this.$('.corruptionRisk').hide();
  },

  updateConnectionMode: function(){
    this.$el.attr('data-mode', config.get('moneyConnectionMode'));
  },

  toggleEmptyAmountConnection: function(){
    this.$el.removeClass('amountUnknown');
    if(this.model.isEmptyAmount) {
      this.$el.addClass('amountUnknown');
    }
  },

  hasBothConnections: function(){
    return (this.model.from && this.model.to);
  },

  // In this function the core calculation for drawing the connections (lines) is done.
  // Everytime an actor is moved around or a connection is edited the lines are redrawn accordingly.
  update: function(){

    // Return if it isn't a valid connection.
    if(!this.hasBothConnections()) return

    // When it is a money connection
    // the line thickness and the arrow size have to be recalculated.
    if(this.isMoney){
      this.strokeWidth = 6 * this.model.thicknessFactor;
    }

    // If it is a monitoring connection
    // we are going through the list of all money connections
    // and check if there are any money connections with the same start and end point.
    // If we found such a connection we move the line so that they are parallel.
    if(this.model.get('connectionType') === 'monitoring'){
      for (var i = 0; i < this.editor.moneyConnections.models.length; i++) {
        if((this.model.from.id == this.editor.moneyConnections.models[i].attributes.from &&
          this.model.to.id == this.editor.moneyConnections.models[i].attributes.to) ||
          (this.model.from.id == this.editor.moneyConnections.models[i].attributes.to &&
          this.model.from.id == this.editor.moneyConnections.models[i].attributes.to)){
          this.isSecondConnection = true;
          this.distanceSecond = -10;
        }
      };
      //If there is no equal money connection we check for equal accountability connections
      //and move them if they have the same start and end point.
      if(!this.isSecondConnection){
        //-accountablity
        /*
        for (var i = 0; i < this.editor.accountabilityConnections.models.length; i++) {
          if((this.model.from.id == this.editor.accountabilityConnections.models[i].attributes.from &&
            this.model.to.id == this.editor.accountabilityConnections.models[i].attributes.to) ||
            (this.model.from.id == this.editor.accountabilityConnections.models[i].attributes.to &&
            this.model.from.id == this.editor.accountabilityConnections.models[i].attributes.to)){
            this.distanceSecond = -10;
          }
        }*/
      }
    }

    //This function is only called for the initalizing.
    //When it is an accountability connection
    //we check if there are any money or monitoring connections with the same start and end point.
    //If we found such a connection we move the line so that they are parallel.
    if(!this.isSecondConnection){
      //-accountablity
      /*
      if(this.model.get('connectionType') === 'accountability'){
        for (var i = 0; i < this.editor.connections.models.length; i++) {
          if(((this.model.from.id === this.editor.connections.models[i].attributes.from &&
            this.model.to.id === this.editor.connections.models[i].attributes.to) ||
            (this.model.from.id === this.editor.connections.models[i].attributes.to &&
            this.model.to.id === this.editor.connections.models[i].attributes.from)) && 
            this.model.id != this.editor.connections.models[i].attributes.id){
            this.distanceSecond = 10;
          }
        };
      }*/
    }  

    this.pathSettings = {
      class_: 'path', 
      strokeWidth: this.strokeWidth
    };

    this.markerSize = this.strokeWidth/2 * this.markerRatio;

    this.svg.path(this.arrow, 'M 0 0 L '+ this.markerRatio +' '+ this.markerRatio/2 +' L 0 '+ this.markerRatio +' z');

    this.toggleEmptyAmountConnection();
      
    this.svg.path(this.selectedArrow, 'M 0 0 L '+ this.selectedArrowSize +' '+ this.selectedArrowSize/2 +' L 0 '+ this.selectedArrowSize +' z');

    this.pathSettings['marker-end'] = 'url(#'+ this.model.id + '-arrow)';
    this.selectSettings['marker-end'] = 'url(#'+ this.model.id + '-selected-arrow)';

    //The select-border size which depends on the strokeWidth is recalculated.
    var pathWidth = this.strokeWidth;
    this.selectSettings['stroke-width'] = pathWidth + 2 * this.selectionBorderSize;

    //Here we are getting the positions of both actors.
    var from = this.model.from.get('pos');    
    var to = this.model.to.get('pos');

    var fromMargins = this.model.from.margins;
    var toMargins = this.model.to.margins;
    
    var overlap = Math.max(this.strokeWidth + this.markerSize + this.selectionBorderSize, this.clickAreaRadius);
    this.offset = 2 * overlap;
    
    this.pos = {
      x : Math.min(from.x, to.x),
      y : Math.min(from.y, to.y)
    }
    
    // We round the position values because our positions are float values not integer.
    // We need the rounded values for the comparison of the actor positions later.
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

    // The waypoints for the connection path are defined.
    var halfX;
    var halfY;
    var start2;
    var end2;

    // The following lines check the relation between the start and the end actor.
    // Depending on the position of each actor we decide which type of connection they have.
    // There can be straigt lines which only contain one line segment when they have either the same x or y position,
    // two lines with one rounded corner between them
    // or three line segments with two rounded corners if either the horizontal or vertical distance is very small.
    
    // Case 1:
    // The start actor is left to and above the end actor.
    if(start.x < end.x && start.y <= end.y){
      // Case 1a: straight line
      //
      // ────➝
      //
      if(start.y == end.y){
        start.x += fromMargins.right;
        end.x -= toMargins.left + this.markerSize;
        start.y -= this.distanceSecond;
        end.y -= this.distanceSecond;
        this.definePath1Line(start, end);
      }
      // Case 1b: three line segments
      //
      // ──┐
      //   └──➝
      //  
      else if(end.y - start.y <= (fromMargins.bottom + toMargins.top)/2+this.edgeRadius*3){
        start.x += fromMargins.right;
        end.x -= toMargins.left + this.markerSize;
        this.definePath3LinesX(start, end, 1, 0, -1);
      }
      // Case 1c: three line segments
      //  
      //  │
      //  └┐
      //   ↓
      //
      else if(end.x - start.x <= (fromMargins.right + toMargins.left)/2 + this.edgeRadius){
        start.y += fromMargins.bottom;
        end.y -= toMargins.top + this.markerSize;
        this.definePath3LinesY(start, end, 0, 1, 1);
      }
      // Case 1d: two line segments
      //  
      //  ──┐
      //    ↓
      //
      else {
        start.x += fromMargins.right;
        end.y -= toMargins.top + this.markerSize;
        start.y -= this.distanceSecond;
        end.x += this.distanceSecond;
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
    // Case 2: The start actor is left to and underneath the end actor.
    else if(start.x <= end.x && start.y > end.y){
      // Case 2a: straight line
      //  
      //  ↑
      //  │
      //
      if(start.x == end.x){
        start.y -= fromMargins.top;
        end.y += toMargins.bottom + this.markerSize;
        start.x += this.distanceSecond;
        end.x += this.distanceSecond;
        this.definePath1Line(start, end);
      }
      // Case 2b: three line segments
      //
      //   ┌──➝
      // ──┘
      //
      else if(start.y - end.y <  (fromMargins.top + toMargins.bottom)/2 + this.edgeRadius*3){
        start.x += fromMargins.right;
        end.x -= toMargins.left + this.markerSize;
        this.definePath3LinesX(start, end, 0, 1, 1);
      }
      // Case 2c: three line segments
      //  
      //   ↑
      //  ┌┘
      //  │
      //
      else if(end.x - start.x < (fromMargins.right + toMargins.left)/2 + this.edgeRadius){
        start.y -= fromMargins.top;
        end.y += toMargins.bottom + this.markerSize;
        this.definePath3LinesY(start, end, 1, 0, -1);
      }
      // Case 2d: two line segments
      //  
      //    ↑
      //  ──┘
      //  
      else {
        start.x += fromMargins.right;
        end.y += toMargins.bottom + this.markerSize;
        start.y += this.distanceSecond;
        end.x += this.distanceSecond;
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
    // Case 3: The start actor is right to and above the end actor.
    else if(start.x > end.x && start.y <= end.y){
      // Case 3a: straight lines
      //  
      //  ←──
      //
      if(start.y == end.y){
        start.x -= fromMargins.right;
        end.x += toMargins.left + this.markerSize;
        start.y -= this.distanceSecond;
        end.y -= this.distanceSecond;
        this.definePath1Line(start, end);
      }
      // Case 3b: three line segments
      //
      //    ┌──
      //  ←─┘
      //
      else if(end.y - start.y < (fromMargins.bottom + toMargins.top)/2 + this.edgeRadius*3){
        start.x -= fromMargins.left;
        end.x += toMargins.right + this.markerSize;
        this.definePath3LinesX(start, end, 0, 1, 1);
      }
      // Case 3c: three lines segments
      //
      //    │
      //  ┌─┘
      //  ↓
      //
      else if(start.x - end.x < (fromMargins.left + toMargins.right)/2 + 3*this.edgeRadius){
        start.y += fromMargins.bottom;
        end.y -= toMargins.top + this.markerSize;
        this.definePath3LinesY(start, end, 1, 0, -1);
      }
      // Case 3d: two line segments
      //
      //  ┌──
      //  │
      //  ↓
      //
      else {
        start.x -= fromMargins.left;
        end.y -= toMargins.top + this.markerSize;
        start.y -= this.distanceSecond;
        end.x -= this.distanceSecond;
        start2 = {
          x : start.x,
          y : start.y + this.edgeRadius
        };
        end2 = {
          x : end.x + this.edgeRadius,
          y : end.y
        };
        this.definePath2Lines(start, end, start2, end2, 0, this.edgeRadius);
      }
    }
    // Case 4: The start actor is right to and underneath the end actor.
    else {
      // Case 4a: straight line
      //
      //  │
      //  ↓
      //
      if(start.x == end.x){
        start.y += fromMargins.bottom;
        end.y -= toMargins.top + this.markerSize;
        start.x += this.distanceSecond;
        end.x += this.distanceSecond;
        this.definePath1Line(start, end);
      }
      // Case 4b: three line segments
      //
      //  ←─┐
      //    └──
      //
      else if(start.y - end.y < (fromMargins.top + toMargins.bottom)/2 + this.edgeRadius*3){
        start.x -= fromMargins.left;
        end.x += toMargins.right + this.markerSize;
        this.definePath3LinesX(start, end, 1, 0, -1);
      }
      // Case 4c: three line segments
      //
      //    ↑
      //    └┐
      //     │
      //
      else if(start.x - end.x < (fromMargins.left + toMargins.right)/2 + 3*this.edgeRadius){
        start.y -= fromMargins.top;
        end.y += toMargins.bottom + this.markerSize;
        this.definePath3LinesY(start, end, 0, 1, 1);
      }
      // Case 4d: two line segments
      //
      //    │
      //  ←─┘
      //
      else {
        start.x -= fromMargins.left;
        end.y += toMargins.bottom + this.markerSize;
        start.y += this.distanceSecond;
        end.x -= this.distanceSecond;
        start2 = {
          x : start.x,
          y : start.y - this.edgeRadius
        };
        end2 = {
          x : end.x + this.edgeRadius,
          y : end.y
        };
        this.definePath2Lines(start, end, start2, end2, 1, this.edgeRadius);
      }
    }
    
    // remove path and its clones
    if(this.pathSymbol) this.svg.remove(this.pathSymbol);
    if(this.selectPath) this.svg.remove(this.selectPath);
    if(this.pathElement) this.svg.remove(this.pathElement);
    if(this.clickArea) this.svg.remove(this.clickArea);

    // render all paths and clones
    // (tried to do this just once and then only update the path but that produced unwanted 'ghost' connections)
    this.pathSymbol = this.svg.path(this.g, this.path, { 'id': this.model.id +'-path' });
    this.selectPath = this.svg.use(this.g, 0, 0, "100%", "100%", '#' + this.model.id +'-path', this.selectSettings);
    this.pathElement = this.svg.use(this.g, 0, 0, "100%", "100%", '#' + this.model.id +'-path', this.pathSettings);
    this.clickArea = this.svg.use(this.g, 0, 0, "100%", "100%", '#' + this.model.id +'-path', { class_: 'clickBorder', strokeWidth: this.clickAreaRadius });

    if(this.isMoney){
      mediator.trigger(['change', 'thickness', this.model.from.id, this.model.to.id].join(':'), this.strokeWidth, this.model.id);
      mediator.trigger(['change', 'thickness', this.model.to.id, this.model.from.id].join(':'), this.strokeWidth, this.model.id);
    }

  },
  
  inputDown: function(event){
    // select
    event.stopPropagation();
    this.select();
    
    // set timer to show details (this gets intersected on mouseup or when the mouse is moved)
    if(Modernizr.touch)
      this.longPressTimeout = setTimeout(this.showDetails, this.longPressDelay, event);
  },
  
  cancelLongPress: function(){
    clearTimeout(this.longPressTimeout);
  },

  showDetails: function(event){    
    // don't show when model is locked
    if(this.model.isLocked()) return; 
    
    var mousePosition = {
      left: this.normalizedX(event),
      top: this.normalizedY(event)
    };

    var cfw = new ConnectionDetailsView({ model: this.model, editor: this.editor, connection: this, mousePosition: mousePosition });
    this.editor.$el.append(cfw.render().el);
    
    return false;
  },
  
  // Draws a straight line.
  definePath1Line: function(start, end){
    this.path = 'M ' + start.x + ' ' + start.y;
    this.path += ' L ' + end.x + ' ' + end.y;
    if(this.corruptionRisk){
      var corrX;
      var corrY;
      if (start.x == end.x){
        corrX = start.x + this.model.from.margins.top;
        corrY = (start.y+end.y)/2 + this.model.from.margins.top;
      }
      else{
        corrX = (start.x+end.x)/2 + this.model.from.margins.top;
        corrY = start.y+this.model.from.margins.top/2*2
      }
      this.drawCorruptionFlag(corrX, corrY);
    }
  },
  
  // Draws two line segments whcih are connected by a rounded corner.
  definePath2Lines: function(start, end, start2, end2, sweepFlag, edgeRadius){

    this.path = 'M ' + start.x + ' ' + start.y;
    var distanceX = Math.abs(start.x - end.x);
    var distanceY = Math.abs(start.y - end.y);
    var halfSum = (distanceY + distanceX)/2;

    if(start.x < end.x){
      this.path += ' L ' + end2.x + ' ' + start.y;
      this.path += ' A ' + edgeRadius + ' ' + edgeRadius + ' ' + 0  + ' ' + 0 + ' ' + sweepFlag + ' ' + end.x + ' ' + start2.y;
      this.path += ' L ' + end.x + ' ' + end.y;  
    }
    else{
      this.path += ' L ' + end2.x + ' ' + start.y;
      this.path += ' A ' + edgeRadius + ' ' + edgeRadius + ' ' + 0  + ' ' + 0 + ' ' + sweepFlag + ' ' + end.x + ' ' + start2.y;
      this.path += ' L ' + end.x + ' ' + end.y; 
    }

    // The position of the corruption risk symbol is calculated when the corruption risk is checked
    if(this.corruptionRisk){
      var corrX;
      var corrY;
      // Get the midpoint of the connection
      if(distanceX > distanceY){
        if(start.x < end.x){
          // x1 + halfsum, y1
          corrX = start.x + halfSum;
          corrY = start.y;
        }
        else{
          // x1 - halfsum, y1
          corrX = start.x - halfSum + this.model.from.margins.top;
          corrY = start.y;
        }
      }
      else{
        if(start.y < end.y){
          // x2, y2-halfsum
          corrX = end.x;
          corrY = end.y - halfSum - this.distanceSecond/4;
        }
        else{
          // x2, y1-halfsum
          corrX = end.x;
          corrY = start.y - halfSum + this.model.from.margins.top*2 + this.distanceSecond;
        }
      }

      // The position of the corruption risk symbol is calculated when the corruption risk is checked
      corrX += this.model.from.margins.top;
      corrY += this.model.from.margins.top;
      this.drawCorruptionFlag(corrX, corrY);
    }

  },

  // Draws three lines which are connected by two rounded corners.
  // The y-Distance from the start and end actor is smaller as the x-Distance.
  definePath3LinesX: function(start, end, sweepFlag1, sweepFlag2, prefixSecondDistance){
    start.y += this.distanceSecond;
    end.y += this.distanceSecond;

    var edgeRadius = this.edgeRadius;
    var halfX = start.x + (end.x - start.x)/2;
    halfX += this.distanceSecond * prefixSecondDistance;
    var firstY, secondY, firstX, secondX;
    var dy = Math.abs(end.y - start.y);
    
    if(dy/2 < edgeRadius)
      edgeRadius = dy/2;
    
    // Define the waypoints of the connection.
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
      
    // Add all connection parts.
    this.path = 'M ' + start.x + ' ' + start.y;
    this.path += ' L ' + firstX + ' ' + start.y;
    this.path += ' A ' + edgeRadius + ' ' + edgeRadius + ' ' + 0  + ' ' + 0 + ' ' + sweepFlag1 + ' ' + halfX + ' ' + firstY;
    this.path += ' L ' + halfX + ' ' + secondY;
    this.path += ' A ' + edgeRadius + ' ' + edgeRadius + ' ' + 0  + ' ' + 0 + ' ' + sweepFlag2 + ' ' + secondX + ' ' + end.y;
    this.path += ' L ' + end.x + ' ' + end.y; 
    
    // The position of the corruption risk symbol is calculated when the corruption risk is checked.
    if(this.corruptionRisk){
      var corrX = (start.x + end.x)/2 + this.model.from.margins.top + this.distanceSecond * prefixSecondDistance;
      var corrY = (start.y + end.y)/2 + this.model.from.margins.top;
      this.drawCorruptionFlag(corrX, corrY);
    }
  },

  // Draws three lines which are connected by two rounded corners.
  // The x-Distance from the start and end actor is smaller as the y-Distance.
  definePath3LinesY: function(start, end, sweepFlag1, sweepFlag2, prefixSecondDistance){
    start.x -= this.distanceSecond;
    end.x -= this.distanceSecond;

    var edgeRadius = this.edgeRadius;
    var halfY = start.y + (end.y - start.y)/2;
    halfY += this.distanceSecond * prefixSecondDistance
    var firstX, secondX, firstY, secondY;
    var dx = Math.abs(end.x - start.x);

    if(dx/2 < edgeRadius)
      edgeRadius = dx/2;

    // Define the waypoints of the connection.
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

    // Add all connection parts.
    this.path = 'M ' + start.x + ' ' + start.y;
    this.path += ' L ' + start.x + ' ' + firstY;
    this.path += ' A ' + edgeRadius + ' ' + edgeRadius + ' ' + 0  + ' ' + 0 + ' ' + sweepFlag1 + ' ' + firstX + ' ' + halfY;
    this.path += ' L ' + secondX + ' ' + halfY;
    this.path += ' A ' + edgeRadius + ' ' + edgeRadius + ' ' + 0  + ' ' + 0 + ' ' + sweepFlag2 + ' ' + end.x + ' ' + secondY;
    this.path += ' L ' + end.x + ' ' + end.y;

    // The position of the corruption risk symbol is calculated when the corruption risk is checked.
    if(this.corruptionRisk){
      var corrX = (start.x + end.x)/2 + this.model.from.margins.top;
      var corrY = (start.y + end.y)/2 + this.model.from.margins.top + this.distanceSecond * prefixSecondDistance;
      this.drawCorruptionFlag(corrX, corrY);
    }
      
  },

  drawCorruptionFlag: function (x, y){
    var corruptionRisk = this.$('.corruptionRisk');
    corruptionRisk.css({left: x, top: y});
    corruptionRisk.show(); 
  },
});
