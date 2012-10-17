var View = require('./view');
var ContextMenuView = require('./contextmenu_view');
var ConnectionFormView = require('views/connection_form_view');

module.exports = View.extend({

  template: require('./templates/connection'),

  tagName : 'div',
  className : 'connection hasContextMenu',

  events: {
    'mouseover path' : 'showMetadata',
    'mouseout path' : 'hideMetadata',
    'dblclick path' : 'showMetadataForm',
    'contextmenu': 'showContextMenu'
  },

  initialize: function(options){
    if(options.noClick)
      this.$el.unbind('click')

    if(this.model.from)
      this.model.from.on('change:pos', this.update, this);
      
    if(this.model.to)
      this.model.to.on('change:pos', this.update, this);

    this.model.on('destroy', this.destroy, this);

    this.model.on('change:amount', this.updateStrokeWidth, this);
    this.model.on('change:amount', this.updateAmount, this);

    this.contextmenu = new ContextMenuView({model: this.model});
    this.contextmenu.deletableOnly();
  },

  getRenderData : function(){
    return this.model.toJSON();
  },

  showContextMenu: function(event){
    event.preventDefault();
    this.contextmenu.show(event);
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
    this.strokeStyle = this.model.get("connectionType") === 'accountability' ? 'white' : '#f8df47'; // yellow
    this.selectStyle = 'hsl(205,100%,55%)';
    
    this.updateStrokeWidth();

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

    this.$el.append(this.contextmenu.render().el);
    
    this.$el.addClass( this.model.get("connectionType") );

    var amount = this.model.get("amount");
  },

  hasBothConnections: function(){
    return (this.model.from && this.model.to);
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
    
    var path = 'M' + start.x +','+ start.y +' '+ end.x +','+ end.y;
    //var path = 'M'+ start.x +','+start.y+' C'+cp1.x+','+cp1.y+' '+cp2.x+','+cp2.y+' '+end.x+','+end.y;

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
  },

  /* 
   * Define the thickness of the money line.
   */
  updateStrokeWidth: function(){

    var minAmount = 0;
    var maxAmount = 20000000;

    var minStroke = 6;
    var maxStroke = 40;

    var amount = this.model.get('amount');

    if(typeof(amount) !== 'undefined')
    {
      var percent = amount * 100 / maxAmount;
      var strokeWidth = percent * maxStroke / 100;

      if(strokeWidth < minStroke)
        strokeWidth = minStroke;

      this.strokeWidth = strokeWidth;
    }
    else
      this.strokeWidth = minStroke;

    this.$el.find('path').attr('stroke-width', this.strokeWidth);
  },

  updateAmount: function(){
    this.$('.connection-metadata').text(this.model.get('amount'));
  },

  showMetadataInput: function(){   
    this.$el.find('.overlay-form-container').fadeIn(100);
  },

  showMetadataForm: function(){
    //Remove all other forms
    $('.connection-form-container').remove();
    var model = this.model;
    var cfw = new ConnectionFormView({ model: model });
    $(document.body).append(cfw.render().el);  
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