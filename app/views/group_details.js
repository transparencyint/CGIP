var View = require('./view');

module.exports = View.extend({

  template: require('./templates/group_details'),
  className: 'modal hidden groupDetails',

  events: {
    // live updates on the input fields
    // input gets triggered everytime 
    // the input's content changes
    'input [type=text]': 'submitForm',
    
    // the buttons at the bottom
    'click .delete': 'deleteActor',
    'click .cancel': 'cancel',
    'click .done': 'submitAndClose',
    
    // submit on enter
    'form submit': 'submitAndClose',
    
    // make the whole thing draggable..
    'mousedown': 'dragStart',
    
    // ..except all the text, buttons and inputs
    'mousedown label': 'dontDrag',
    'mousedown input': 'dontDrag',
    'mousedown button': 'dontDrag'
  }, 

  initialize: function(options){
    // handle lock-states
    if(this.model.isLocked()){
      this.close();
      return;
    }else{
      this.model.lock();
    }

    View.prototype.initialize.call(this);
    _.bindAll(this, 'handleKeys', 'dragStop', 'drag', 'submitAndClose', 'destroy');
    
    this.group = options.group;
    this.editor = options.editor;
    this.width = 360;
    this.controlsHeight = 46;
    this.arrowHeight = 42;
    this.borderRadius = 5;
    this.distanceToActor = 10;

    this.model.on('change:abbreviation', this.updateName, this);
    this.model.on('change:name', this.updateName, this);
    
    // backup data for cancel
    this.backup = this.model.toJSON();
    delete this.backup._rev;
    
    // debounce form realtime updates 
    // http://underscorejs.org/#debounce
    this.saveFormData = _.debounce(this.saveFormData, 500);
    
    this.updateName();
  },
  
  dontDrag: function(event){
    event.stopPropagation();
  },
  
  allowEnter: function(event){
    event.stopPropagation();
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

  updateName: function(){
    var name = this.model.get('name');
    this.$('.name').text(name);
  },

  deleteActor: function(){

    if(this.model) 
      this.model.destroy();

    this.close();
    
    // prevent form forwarding
    return false;
  },
  
  cancel: function(){
    this.model.save(this.backup);
    this.close();
    
    // prevent form forwarding
    return false;
  },

  submitAndClose: function(){
    
    this.saveFormData();
    this.close();
    
    // prevent form forwarding
    return false;
  },
  
  close: function(){
    // unlock the model
    this.model.unlock();
    this.unlockedModel = true;

    this.$el.one(this.transEndEventName, this.destroy);
    
    if(this.clickCatcher)
      this.clickCatcher.remove();
    
    $(document).unbind('keydown', this.handleKeys);
    
    this.$el.addClass('hidden');
  },

  destroy: function(){
    if(!this.unlockedModel) this.model.unlock();

    View.prototype.destroy.call(this);
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
  
  placeNextToActor: function(){
    // absolute position inside the window
    var pos = this.group.$el.offset();
    var padding = this.editor.padding;
    var arrow = this.$('.arrow');
    this.height = this.$el.height();
    var arrowPos = (this.height-this.controlsHeight) / 2;
    
    var actorWidth = this.group.width * this.editor.zoom.value;
    var actorHeight = this.group.height * this.editor.zoom.value;
    
    // we want to place the modal next to the actor
    // on the right
    pos.left += actorWidth + this.distanceToActor;
    
    // if the space on the right is not big enough
    // place it on the left hand side
    if(pos.left + padding + this.width > this.editor.$el.width()){
      pos.left -= (actorWidth + 2*this.distanceToActor + this.width);
      this.$el.addClass('leftAligned');
    }
    
    // vertically, we want to place the modal centered
    pos.top += actorHeight/2  - (this.height-this.controlsHeight)/2;
    
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
  
  addClickCatcher: function(){
    this.clickCatcher = $('<div class="clickCatcher"></div>').appendTo(this.editor.$el);
    this.clickCatcher.on('click', this.submitAndClose);
  },

  afterRender: function() {
    this.addClickCatcher();
    
    $(document).keydown(this.handleKeys);
    this.holder = this.$('.holder');
    
    // focus first input field
    var self = this;
    _.defer(function(){ 
      self.placeNextToActor();
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

  /**
    Gather all the data given by the user through inputs and save the addional Information to the actor model
  */
  submitForm: function(){
    
    var formData = this.$('form').serializeArray();
    var sets = [ 'role', 'purpose' ];
    var cleanedData = {
      'role' : [],
      'purpose' : []
    };
    var checkboxes = [ 'hasCorruptionRisk' ];
    var hasCorruptionRisk = false;
    
    for(var i=0; i<formData.length; i++){
      var name = formData[i].name;
      var value = formData[i].value;
      
      // save typeOther only when option 'other' is set
      if(name === 'typeOther'){
        if(cleanedData.organizationType === 'other')
          cleanedData[name] = value;
      }
      
      // for our multiple checkbox: create an array of the name and add values to it
      else if(sets.indexOf(name) !== -1){
        cleanedData[name].push(value);
      } 
      
      // otherwise save as string (name: value)
      else {
        if(checkboxes.indexOf(name) !== -1){
          // save 'on' and 'off' as true and false
          value = 'on' ? true : false;
        }
        
        // handle hasCorruptionRisk seperately
        // because it doesn't get listed when its false
        // but we need it all the time
        if(name === 'hasCorruptionRisk')
          hasCorruptionRisk = value;
        
        cleanedData[name] = value;
      }
    }
    
    cleanedData.hasCorruptionRisk = hasCorruptionRisk;
    
    this.model.set(cleanedData);
    this.saveFormData();
  },
  
  // don't sync in realtime but just every 500ms
  saveFormData: function(){
    this.model.save();
  }
});
