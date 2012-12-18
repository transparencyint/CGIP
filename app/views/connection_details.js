var View = require('./view');

module.exports = View.extend({

  template: require('./templates/connection_details'),

  className : 'modal connectionDetails',

  events: {
    'input #disbursed'        : 'updateDisbursed', 
    'input #pledged'          : 'updatePledged', 
    'change input[type=radio]': 'updateMoneyConnections',
    
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
    
    this.width = 360;
    this.height = 200;
    this.controlsHeight = 46;
    this.arrowHeight = 42;
    this.borderRadius = 5;
    this.distanceToConnection = 21;
  },
  
  dragStart: function(event){
    event.stopPropagation();

    var pos = this.$el.offset();
    
    this.$el.addClass('moved');
    
    this.startX = event.pageX - pos.left;
    this.startY = event.pageY - pos.top;
  
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
    
    this.placeNextToConnection();
    this.addClickCatcher();

    $(document).keydown(this.handleEscape);
    
    // focus first input field
    var self = this;
    _.defer(function(){ self.$('input').first().focus(); });
  },

  updateDisbursed: function () {
    var newDisbursed = this.$('#disbursed').val();
    this.model.set({disbursed: Number(newDisbursed)});
  },

  updatePledged: function () {
    var newPledged = this.$('#pledged').val();
    this.model.set({pledged: Number(newPledged)});
  },

  updateMoneyConnections: function (event) {
    this.editor.moneyConnectionMode = event.currentTarget.id;
    this.editor.trigger('change:moneyConnectionMode');
  },
  
  toggleAdditionalInfo: function(event){
    var additionalInfo = $(event.target).nextAll('.additionalInfo');
    var toggle = $(event.target);
    var shouldSelectFirst = false;
    
    if(toggle.attr('type') == 'checkbox'){
      //
      // Case: Corruption Risk checkbox
      // Does: show/hide the textarea and input field for description and source
      //
      if(toggle.prop('checked')){
        additionalInfo.slideDown();
        shouldSelectFirst = true;
      } else {
        additionalInfo.slideUp();
      }
    }
    else {
      //
      // Case: dropdown 'Type' when chaning the value
      // Does: show/hide the input field when type is 'other
      //
      var shouldHide = toggle.val() === 'other' ? false : true;
      additionalInfo.toggleClass('hidden', shouldHide);
      
      shouldSelectFirst = !shouldHide;
    }
    
    // Does: focus the first input inside the additonal info
    if(shouldSelectFirst)
      additionalInfo.find('textarea, input').first().select();
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
    
    var _disbursed = Number(this.$el.find('#disbursed').val());
    var _pledged = Number(this.$el.find('#pledged').val());

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
    
    $(document).unbind('keydown', this.handleEscape);
  }
});