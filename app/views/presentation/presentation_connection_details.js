var View = require('../view');

module.exports = View.extend({

  template: require('../templates/presentation/presentation_connection_details'),

  className : 'modal hidden connectionDetails',

  events: {

    'change input[type=radio]': 'updateMoneyConnections',

    'click .cancel': 'close',
    
    // make the whole thing draggable..
    'mousedown': 'dragStart',
    
    // ..except all the text, buttons and inputs
    'mousedown label': 'dontDrag',
    'mousedown input': 'dontDrag',
    'mousedown textarea': 'dontDrag',
    'mousedown button': 'dontDrag'
  },

  dontDrag: function(event){
    event.stopPropagation();
  },

  initialize: function(options){

    _.bindAll(this, 'handleKeys', 'dragStop', 'drag',  'destroy');
    
    this.connection = options.connection;
    this.connectionType = this.model.get('connectionType');
    this.editor = options.editor;
    
    this.width = 320;
    this.controlsHeight = 46;
    this.arrowHeight = 42;
    this.borderRadius = 5;
    this.distanceToConnection = 21;
    
  },
  
  dragStart: function(event){
    event.stopPropagation();

    var pos = this.$el.offset();
    
    this.startX = event.pageX - pos.left;
    this.startY = event.pageY - pos.top;
    
    // stop when the user is clicking onto a scrollbar (chrome bug)
    if(this.pressOnScrollbar(this.startX))
      return;
  
    this.$el.addClass('moved');
    
    $(document).on('mousemove.global', this.drag);
    $(document).one('mouseup', this.dragStop);
  },

  drag: function(event){ 
    this.$el.css({
      left: event.pageX - this.startX,
      top: event.pageY - this.startY
    })
  },
  
  dragStop : function(){
    $(document).unbind('mousemove.global');
  },

  currentMoneyMode: function () {
    this.$('#' + config.get('moneyConnectionMode')).prop("checked", true);
  },

  getRenderData : function(){
    return this.model.toJSON();
  },
  
  placeNextToConnection: function(){
    // absolute position inside the window
    var pos = this.connection.$el.offset();
    var padding = this.editor.padding;
    var arrow = this.$('.arrow');
    this.height = this.$el.height();
    var arrowPos = this.height / 2;
    
    var connectionWidth = this.connection.$('svg').width() * this.editor.zoom.value;
    var connectionHeight = this.connection.$('svg').height() * this.editor.zoom.value;
    
    // we want to place the modal next to the connection
    // on the right
    pos.left += connectionWidth + this.distanceToConnection;
    
    // if the space on the right is not big enough
    // place it on the left hand side
    if(pos.left + padding + this.width > this.editor.$el.width()){
      pos.left -= (connectionWidth + 2*this.distanceToConnection + this.width);
      this.$el.addClass('leftAligned');
    }
    
    // vertically, we want to place the modal centered
    pos.top += connectionHeight/2  - this.height/2;
    
    // if the position is too far up
    // or too down low, adjust the position AND the arrow
    if(pos.top - padding < 0){
      arrowPos -= Math.abs(padding - pos.top);
      pos.top = padding;
    }
    else if(pos.top + this.height + padding > this.editor.$el.height()){      
      arrowPos += Math.abs(pos.top + this.height - this.editor.$el.height() + padding);
      pos.top = this.editor.$el.height() - padding - this.height;
    }

    // keep the arrow positonend inside the boundaries
    var max = this.height-this.controlsHeight-this.arrowHeight/2;
    var min = this.borderRadius+this.arrowHeight/2;

    arrowPos = Math.min(max, Math.max(min, arrowPos));
    arrow.css('top', arrowPos - this.arrowHeight/2);

    // limit the maximum height to show scrollbars
    // if the details would get too high
    var maxHeight = this.editor.$el.height() - pos.top - padding - this.controlsHeight;
    this.$('.holder').css('maxHeight', maxHeight);

    this.$el.css({
      left: pos.left,
      top: pos.top
    });
  },
  
  handleKeys: function(event){
    switch (event.keyCode) {
      case 27: // ESC
        this.close();
        break;
      case 13: // Enter
        this.close();
        break;
    }
  },
  
  addClickCatcher: function(){
    this.clickCatcher = $('<div class="clickCatcher"></div>').appendTo(this.editor.$el);
    this.clickCatcher.on('click', this.close);
  },

  afterRender: function(){

    //set the money part to invisible per default
    this.$('.money').hide();

    // detect which connection type we have and show/hide related fields
    if(this.connectionType === 'money'){
      this.$('.money').show();

      var _disbursed = this.model.get('disbursed');
      var _pledged = this.model.get('pledged');

      this.$('#disbursed').val(_disbursed);
      this.$('#pledged').val(_pledged);   

      this.$('#disbursed').numeric();
      this.$('#pledged').numeric();

      this.currentMoneyMode();
      config.on('change:moneyConnectionMode', this.currentMoneyMode, this);
    }
    
    var sentences = {
      'accountability': 'is accountable for',
      'monitoring': 'monitors',
      'money': 'pays',
    };
    
    this.fillInActorNames( sentences[this.connectionType] );
    
    this.autosize = this.$('textarea').autosize({ className: 'actorDetailsAutosizeHelper' });
    this.holder = this.$('.holder');
    
    this.addClickCatcher();

    $(document).keydown(this.handleKeys);
    
    // focus first input field
    var self = this;
    _.defer(function(){ 
      self.placeNextToConnection();
      self.$el.removeClass('hidden');
      
      self.widthWithoutScrollbar = self.holder.css('overflow', 'hidden').find('div:first-child').width();
      self.holder.css('overflow', 'auto');
      
      self.$('input').first().focus();
    });
  },
  
  /*
  
    detects if there is a scrollbar
    and measures its thickness
    
    this is a workaround needed for draggable 
    because of this bug in Chrome:
    https://code.google.com/p/chromium/issues/detail?id=14204
    (no mouseup on scrollbar)
    
  */
  
  pressOnScrollbar: function(x){ 
    this.widthWithScrollbar = this.holder.find('div:first-child').width();
    this.scrollbarThickness = this.widthWithoutScrollbar - this.widthWithScrollbar;
    
    return this.scrollbarThickness > 0 && x >= this.width - this.scrollbarThickness;
  },
  
  fillInActorNames: function(text){
    var from = this.model.from.get('abbreviation') || this.model.from.get('name') || 'Unknown';
    var to = this.model.to.get('abbreviation') || this.model.to.get('name') || 'Unknown';

    this.$('.connectionName').text(from + ' ' + text + ' ' + to);
  },

  updateMoneyConnections: function (event) {
    config.set('moneyConnectionMode', event.currentTarget.id);
  },

  
  close: function(){

    this.$el.one(this.transEndEventName, this.destroy);

    if(this.clickCatcher)
      this.clickCatcher.remove();
    
    $(document).unbind('keydown', this.handleKeys);
    
    this.$el.addClass('hidden');
  },

  destroy: function(){
    // remove autosize helper
    $('.actorDetailsAutosizeHelper').remove();

    View.prototype.destroy.call(this);
  }
});