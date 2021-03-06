// The actor details allow the user to give more specific information about an actor or an actor group.
// Following information can be given: Name, Role, Purpose and possibly corruption risk details

var View = require('./view');
var clickCatcher = require('./click_catcher_view');

module.exports = View.extend({

  template: require('./templates/actor_details'),
  className: 'modal hidden actorDetails',

  events: function(){
    var _events = {
      // live updates on the input fields
      // input gets triggered everytime 
      // the input's content changes
      'input [type=text]': 'submitForm',
      'input textarea': 'submitForm',
      'change [type=checkbox]': 'submitForm',
      'change select': 'submitForm',
      'change textarea': 'submitForm',
      'keyup [data-type=text]': 'interceptKeys',
      'keyup [type=text]': 'interceptKeys',
    
      // show/hide the 'other' input field on 'Type'
      // and the Corruption Risk details
      'change .hasAdditionalInfo': 'toggleAdditionalInfo',
    
      // the buttons at the bottom
      'click .delete': 'deleteActor',
      'click .cancel': 'cancel',
      'click .done': 'submitAndClose',
    
      // submit on enter
      'form submit': 'submitAndClose'
    };
    
    // make the whole thing draggable..
    _events[ this.inputDownEvent ] = 'dragStart';
    
    // ..except all the text, buttons and inputs
    _events[ this.inputDownEvent + ' label'   ] = 'dontDrag';
    _events[ this.inputDownEvent + ' input'   ] = 'dontDrag';
    _events[ this.inputDownEvent + ' textarea'] = 'dontDrag';
    _events[ this.inputDownEvent + ' select'  ] = 'dontDrag';
    _events[ this.inputDownEvent + ' button'  ] = 'dontDrag';

    _events[ this.inputDownEvent + ' .delete'  ] = 'deleteActor';
    _events[ this.inputDownEvent + ' .cancel'  ] = 'cancel';
    _events[ this.inputDownEvent + ' .done'  ] = 'submitAndClose';
    
    // don't bubble inputUp (cause the clickCatcher listens on it)
    _events[ this.inputUpEvent + ' button'  ] = 'stopPropagation';
    
    return _events;
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
    
    this.actor = options.actor;
    this.editor = options.editor;
    this.width = 360;
    this.controlsHeight = 46;
    this.arrowHeight = 42;
    this.borderRadius = 5;
    this.distanceToActor = 10;

    this.model.on('change:abbreviation', this.updateName, this);
    this.model.on('change:name', this.updateName, this);
    this.model.on('destroy', this.destroy, this);
    this.model.on('change:organizationType', this.updateType, this);
    this.initOrganizationType();
    
    // backup data for cancel
    this.backup = this.model.toJSON();
    delete this.backup._rev;
    
    // debounce form realtime updates 
    // http://underscorejs.org/#debounce
    this.saveFormData = _.debounce(this.saveFormData, 500);
    
    this.updateName();
  },
  
  stopPropagation: function(event){
    event.stopPropagation();
  },
  
  dontDrag: function(event){
    event.stopPropagation();
  },
  
  interceptKeys: function(event){
    event.stopPropagation();

    // stop the delete key from going to the actor editor which would delete this view
    if(event.keyCode === 46){
      event.preventDefault()
      return false;
    }
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
  
  dragStop: function(){
    $(document).unbind(this.inputMoveEvent, this.drag);
  },
  
  place: function(x, y){
    this.$el.css(Modernizr.prefixed('transform'), 'translate3d('+ x +'px,'+ y +'px,0)');
  },

  updateName: function(){
    var abbrev = this.model.get('abbreviation');
    var name = this.model.get('name');
    if(abbrev !== "")
      this.$('#title').text(abbrev);
    else if(name !== "")
      this.$('#title').text(name);
    else
      this.$('#title').text("Unknown");
  },

  initOrganizationType: function(){
    //removes whitespaces
    this.orgaType = this.model.get('organizationType').replace(/\s/g, "");
    if(this.orgaType === "")
      this.orgaType = "Unknown";
  },

  updateType: function(){
    this.initOrganizationType();
    var value = 'url(/images/pictograms/' + this.orgaType + '.png)';
    this.$('.pictogram').css('background-image', value);
  },

  deleteActor: function(){

    if(this.model) 
      this.model.destroy();

    this.close();
    
    // prevent form forwarding
    return false;
  },
  
  cancel: function(){
    this.saveFormData(this.backup);
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
    
    if(this.clickCatcher)
      this.clickCatcher.destroy();

    this.$el.one(this.transEndEventName, this.destroy);
    
    this.$el.addClass('hidden');
  },

  destroy: function(){
    if(!this.unlockedModel) this.model.unlock();
    
    this.clickCatcher.unbind(this.inputDownEvent, this.submitAndClose);

    $(document).unbind('keydown', this.handleKeys);

    // remove autosize helper
    $('.actorDetailsAutosizeHelper').remove();

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
    }
  },
  
  placeNextToActor: function(){
    // absolute position inside the window
    var actorPos = this.actor.$el.offset();
    var pos = _.clone(actorPos);
    var padding = this.editor.padding;
    this.height = this.$el.height();
    var arrowPos = Math.round(this.height/2);
    var editorHeight = this.editor.$el.height();
    
    var actorWidth = this.actor.width * this.editor.zoom.value;
    var actorHeight = this.actor.height * this.editor.zoom.value;
    
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
    pos.top += Math.round(actorHeight/2  - this.height/2);
    
    // if the position is too far up
    // or too down low, adjust the position AND the arrow
    if(pos.top - padding < 0){
      arrowPos -= Math.abs(padding - pos.top);
      pos.top = padding;
    }
    else if(pos.top + this.height + padding > editorHeight){      
      pos.top = Math.max(padding, editorHeight - padding - this.height);
      arrowPos = actorPos.top + actorHeight/2 - pos.top;
    }
    
    // limit the maximum height to show scrollbars
    // if the details would get too high
    var maxHeight = editorHeight - pos.top - padding - this.controlsHeight;
    this.holder.css('maxHeight', maxHeight);
    
    // keep the arrow positonend inside the boundaries
    var max = maxHeight-this.arrowHeight/2;
    var min = this.borderRadius+this.arrowHeight/2;
    
    arrowPos = Math.min(max, Math.max(min, arrowPos));
    this.$('.arrow').css('top', arrowPos - this.arrowHeight/2);

    this.place(pos.left, pos.top);
  },

  getRenderData : function(){
    var data = this.model.toJSON();
    data.orgaType = this.orgaType;
    return data;
  },

  afterRender: function() {
    this.clickCatcher = new clickCatcher({ callback: this.submitAndClose, holder: this.editor.$el });
    
    $(document).keydown(this.handleKeys);
    this.holder = this.$('.holder');
    
    var self = this;
    _.defer(function(){ 
      self.placeNextToActor();
      self.$el.removeClass('hidden');
      
      self.widthWithoutScrollbar = self.holder.css('overflow', 'hidden').find('div:first-child').width();
      self.holder.css('overflow', 'auto');
      
      // on desktop browsers: focus first input field
      if(!Modernizr.touch)
        self.$('input').first().focus();

      // fixes wrong height calculation of the textareas
      self.autosize = self.$('textarea').autosize({ className: 'actorDetailsAutosizeHelper' });
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
        this.$el.addClass('moved');
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

  /**
    Gather all the data given by the user through inputs and save the addional Information to the actor model
  */
  submitForm: function(){
    
    var formData = this.$('form').serializeArray();

    var sets = [ 'purpose', 'role' ];
    var cleanedData = {
      'purpose' : [],
      'role' : []
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
  
  saveFormData: function(data){
    if(!data) data = {};
    var view = this;
    // If there is an ongorin request, pospone the next request until this one is done
    if(this.lastRequest)
      this.lastRequest.done(function(){ view.lastRequest = view.model.save(data); });
    else
      this.lastRequest = this.model.save(data);
  }
});
