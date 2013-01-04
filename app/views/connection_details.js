var View = require('./view');

module.exports = View.extend({

  template: require('./templates/connection_details'),

  className : 'modal hidden connectionDetails',

  events: {
    // live updates on the input fields
    'input .money [type=text]': 'updateValue', 
    'change input[type=radio]': 'updateMoneyConnections',
    'input #corruptionRisk': 'updateValue',
    'input #corruptionRiskSource': 'updateValue',
    
    // the controls buttons at the bottom
    'click .delete': 'deleteConnection',
    'click .revert': 'revert',
    'click .done': 'submitAndClose',
    
    // show/hide the 'other' input field on 'Type'
    // and the Corruption Risk details
    'change .hasAdditionalInfo': 'toggleAdditionalInfo',
    
    // submit on enter
    'form submit': 'submitAndClose',
    
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
    _.bindAll(this, 'handleEscape', 'dragStop', 'drag', 'submitAndClose');
    this.oldDisbursed = this.model.get('disbursed');
    this.oldPledged = this.model.get('pledged');
    
    this.connection = options.connection;
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
    this.$('#' + this.editor.moneyConnectionMode).prop("checked", true);
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
  
  handleEscape: function(event){
    if (event.keyCode === 27) {
      this.revert();
    }
  },
  
  addClickCatcher: function(){
    this.clickCatcher = $('<div class="clickCatcher"></div>').appendTo(this.editor.$el);
    this.clickCatcher.on('click', this.submitAndClose);
  },

  afterRender: function(){
    var _disbursed = this.model.get('disbursed');
    var _pledged = this.model.get('pledged');

    this.$('#disbursed').val(_disbursed);
    this.$('#pledged').val(_pledged);   

    this.$('#disbursed').numeric();
    this.$('#pledged').numeric();

    this.currentMoneyMode();
    this.editor.on('change:moneyConnectionMode', this.currentMoneyMode, this);
    this.autosize = this.$('textarea').autosize({ className: 'actorDetailsAutosizeHelper' });
    this.holder = this.$('.holder');
    
    this.fillInActorNames();
    this.addClickCatcher();

    $(document).keydown(this.handleEscape);
    
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
  
  fillInActorNames: function(){
    this.$('.actorA').text( this.model.from.get('abbreviation') || this.model.from.get('name') || 'Unknown' );
    this.$('.actorB').text( this.model.to.get('abbreviation') || this.model.to.get('name') || 'Unknown' );
  },

  updateValue: function(event) {
    var attributes = {};
    var type = $(event.target).data('type');
    var value;
    
    switch(type){
      case 'integer':
        value = parseInt(event.target.value, 10);
        break;
      case 'string':
        value = event.target.value;
        break;
      case 'boolean':
        value = event.target.checked ? true : false;
        break
    }
    attributes[event.target.name] = value;
    
    this.model.set(attributes);
  },

  updateMoneyConnections: function(event) {
    this.editor.moneyConnectionMode = event.currentTarget.id;
    this.editor.trigger('change:moneyConnectionMode');
  },
  
  toggleAdditionalInfo: function(event){
    var toggle = $(event.target);
    var additionalInfo = toggle.nextAll('.additionalInfo');
    
    // show/hide the textarea and input field for description and source
    if(toggle.prop('checked')){
      additionalInfo.slideDown();
    } else {
      this.$el.addClass('moved');
      additionalInfo.slideUp();
    }
    
    // Does: focus the first input inside the additonal info
    additionalInfo.find('textarea, input').first().select();
    
    // save state
    this.updateValue(event);
  },

  deleteConnection: function(){
    if(this.model) 
      this.model.destroy();

    this.destroy();  
    
    // prevent form forwarding
    return false;
  },

  revert: function(event){
    this.model.set({
      disbursed: this.oldDisbursed,
      pledged: this.oldPledged
    });
    
    this.destroy();
    
    // prevent form forwarding
    return false;
  },

  submitAndClose: function(e){
    e.preventDefault();
    
    var _disbursed = parseInt(this.$el.find('#disbursed').val(), 10);
    var _pledged = parseInt(this.$el.find('#pledged').val(), 10);

    this.model.save({
      disbursed: _disbursed,
      pledged: _pledged
    });

    this.destroy();
    
    // prevent form forwarding
    return false;
  },

  destroy: function(){
    View.prototype.destroy.call(this);
    
    this.clickCatcher.remove();
    
    // remove autosize helper
    $('.actorDetailsAutosizeHelper').remove();
    
    $(document).unbind('keydown', this.handleEscape);
  }
});