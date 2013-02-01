var View = require('./view');
var clickCatcher = require('./click_catcher_view');

module.exports = View.extend({

  template: require('./templates/connection_details'),

  className : 'modal hidden connectionDetails',

  events: function(){
    var _events = {
      // live updates on the input fields
      'input .money [type=text]': 'updateValue', 
      'change input[type=radio]': 'updateMoneyConnections',
      'input #corruptionRisk': 'updateValue',
      'input #corruptionRiskSource': 'updateValue',
      'keydown [data-type=text]': 'allowEnter',
    
      // the controls buttons at the bottom
      'click .delete': 'deleteConnection',
      'click .cancel': 'cancel',
      'click .done': 'submitAndClose',
    
      // show/hide the 'other' input field on 'Type'
      // and the Corruption Risk details
      'change .hasAdditionalInfo': 'toggleAdditionalInfo',
    
      // submit on enter
      'form submit': 'submitAndClose'
    };
    
    // make the whole thing draggable..
    _events[ this.inputDownEvent ] = 'dragStart';
    
    // ..except all the text, buttons and inputs
    _events[ this.inputDownEvent + ' label'   ] = 'dontDrag';
    _events[ this.inputDownEvent + ' input'   ] = 'dontDrag';
    _events[ this.inputDownEvent + ' textarea'] = 'dontDrag';
    _events[ this.inputDownEvent + ' button'  ] = 'dontDrag';
    
    return _events;
  },

  dontDrag: function(event){
    event.stopPropagation();
  },
  
  allowEnter: function(event){
    event.stopPropagation();
  },

  initialize: function(options){
    // handle lock-states
    if(this.model.isLocked()){
      this.close();
      return;
    }else{
      this.model.lock();
    }

    _.bindAll(this, 'handleKeys', 'dragStop', 'drag', 'submitAndClose', 'destroy');
    
    this.connection = options.connection;
    this.connectionType = this.model.get('connectionType');
    this.editor = options.editor;
    this.mousePosition = options.mousePosition;
    
    this.width = 320;
    this.controlsHeight = 46;
    this.arrowHeight = 42;
    this.borderRadius = 5;
    this.distanceToConnection = 34;
    
    // backup data for cancel
    this.backup = this.model.toJSON();
    delete this.backup._rev;

    this.model.on('destroy', this.destroy, this);
  },
  
  dragStart: function(event){
    event.stopPropagation();
    event.preventDefault();

    var pos = this.$el.offset();
    
    this.startX = this.normalizedX(event) - pos.left;
    this.startY = this.normalizedY(event) - pos.top;
    
    // stop when the user is clicking onto a scrollbar (chrome bug)
    if(this.pressOnScrollbar(this.startX))
      return;

    this.$el.addClass('moved');
  
    $(document).on(this.inputMoveEvent, this.drag);
    $(document).one(this.inputUpEvent, this.dragStop);
  },

  drag: function(event){ 
    var x = this.normalizedX(event) - this.startX;
    var y = this.normalizedY(event) - this.startY;
    this.place(x, y);
  },
  
  dragStop : function(){
    $(document).unbind(this.inputMoveEvent, this.drag);
  },
  
  place: function(x, y){
    this.$el.css(Modernizr.prefixed('transform'), 'translate3d('+ x +'px,'+ y +'px,0)');
  },

  currentMoneyMode: function () {
    this.$('#' + config.get('moneyConnectionMode')).prop("checked", true);
  },

  getRenderData : function(){
    return this.model.toJSON();
  },
  
  placeNextToConnection: function(){
    var padding = this.editor.padding;
    var arrow = this.$('.arrow');
    this.height = this.$el.height();
    var arrowPos = this.height / 2;
    
    // we want to place the modal next to mouse
    // on the right
    this.mousePosition.left += this.distanceToConnection;
    
    // if the space on the right is not big enough
    // place it on the left hand side
    if(this.mousePosition.left + padding + this.width > this.editor.$el.width()){
      this.mousePosition.left -= 2*this.distanceToConnection + this.width;
      this.$el.addClass('leftAligned');
    }
    
    // vertically, we want to place the modal centered
    this.mousePosition.top -= this.height/2;
    
    // if the position is too far up
    // or too down low, adjust the position AND the arrow
    if(this.mousePosition.top - padding < 0){
      arrowPos -= Math.abs(padding - this.mousePosition.top);
      this.mousePosition.top = padding;
    }
    // hitting the bottom
    else if(this.mousePosition.top + this.height + padding > this.editor.$el.height()){      
      arrowPos += Math.abs(this.mousePosition.top + this.height - this.editor.$el.height() + padding);
      this.mousePosition.top = this.editor.$el.height() - padding - this.height;
    }

    // keep the arrow positonend inside the boundaries
    var max = this.height-this.controlsHeight-this.arrowHeight/2;
    var min = this.borderRadius+this.arrowHeight/2;

    arrowPos = Math.min(max, Math.max(min, arrowPos));
    arrow.css('top', arrowPos - this.arrowHeight/2);

    // limit the maximum height to show scrollbars
    // if the details would get too high
    var maxHeight = this.editor.$el.height() - this.mousePosition.top - padding - this.controlsHeight;
    this.$('.holder').css('maxHeight', maxHeight);

    this.place(this.mousePosition.left, this.mousePosition.top);
  },
  
  handleKeys: function(event){
    switch (event.keyCode) {
      case 27: // ESC
        this.cancel();
        break;
      case 13: // Enter
        this.submitAndClose();
        break;
      case 46: // Delete
        this.deleteConnection();
        break;
    }
  },

  afterRender: function(){

    // detect which connection type we have and show/hide related fields
    if(this.connectionType === 'money'){

      var _disbursed = this.model.get('disbursed');
      var _pledged = this.model.get('pledged');

      if(_disbursed > 0)
        this.$('#disbursed').val(_disbursed);
      if(_pledged > 0)
        this.$('#pledged').val(_pledged);   

      this.$('#disbursed').numeric();
      this.$('#pledged').numeric();

      this.currentMoneyMode();
      config.on('change:moneyConnectionMode', this.currentMoneyMode, this);
    }
    
    var sentences = {
      'accountability': 'is_accountable_for',
      'monitoring': 'monitors',
      'money': 'pays',
    };
    
    this.fillInActorNames( sentences[this.connectionType] );
    
    this.autosize = this.$('textarea').autosize({ className: 'actorDetailsAutosizeHelper' });
    this.holder = this.$('.holder');
    
    this.clickCatcher = new clickCatcher({ callback: this.submitAndClose, holder: this.editor.$el });

    $(document).keydown(this.handleKeys);
    
    var self = this;
    _.defer(function(){ 
      self.placeNextToConnection();
      self.$el.removeClass('hidden');
      
      self.widthWithoutScrollbar = self.holder.css('overflow', 'hidden').find('div:first-child').width();
      self.holder.css('overflow', 'auto');
      
      // on desktop browsers: focus first input field
      if(!Modernizr.touch) 
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

    this.$('.connectionName').text(from + ' ' + t(text) + ' ' + to);
  },

  updateValue: function(event) {
    var attributes = {};
    var type = $(event.target).data('type');
    var value;
    
    switch(type){
      case 'integer':
        value = parseInt(event.target.value, 10) || 0;
        break;
      case 'string': case 'text':
        value = event.target.value;
        break;
      case 'boolean':
        value = event.target.checked ? true : false;
        break
    }
    attributes[event.target.name] = value;
    
    this.model.set(attributes);
  },

  updateMoneyConnections: function (event) {
    config.set({moneyConnectionMode: event.currentTarget.id});
  },
  
  toggleAdditionalInfo: function(event){
    var toggle = $(event.target);
    var additionalInfo = toggle.nextAll('.additionalInfo');
    
    // show/hide the textarea and input field for description and source
    if(toggle.prop('checked')){
      additionalInfo.slideDown();
      
      // Does: focus the first input inside the additonal info
      additionalInfo.find('textarea, input').first().select();
    } else {
      this.$el.addClass('moved');
      additionalInfo.slideUp();
    }
    
    // save state
    this.updateValue(event);
  },

  deleteConnection: function(){
    if(this.model) 
      this.model.destroy();

    this.close();  
    
    // prevent form forwarding
    return false;
  },

  cancel: function(event){
    this.model.save(this.backup);
    this.close();
    
    // prevent form forwarding
    return false;
  },

  submitAndClose: function(){
    var _disbursed = parseInt(this.$el.find('#disbursed').val(), 10) || 0;
    var _pledged = parseInt(this.$el.find('#pledged').val(), 10) || 0;

    this.model.save({
      disbursed: _disbursed,
      pledged: _pledged
    });

    this.close();
    
    // prevent form forwarding
    return false;
  },
  
  close: function(){
    // unlock the model
    this.model.unlock();
    this.unlockedModel = true;
    
    if(this.clickCatcher)
      this.clickCatcher.destroy();

    this.$el.one(this.transEndEventName, this.destroy);
    
    $(document).unbind('keydown', this.handleKeys);
    
    this.$el.addClass('hidden');
  },

  destroy: function(){
    // remove autosize helper
    $('.actorDetailsAutosizeHelper').remove();
    
    this.clickCatcher.unbind(this.inputDownEvent, this.submitAndClose);
    
    if(!this.unlockedModel) this.model.unlock();

    View.prototype.destroy.call(this);
  }
});