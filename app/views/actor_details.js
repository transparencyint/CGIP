var View = require('./view');

// Base class for all views.
module.exports = View.extend({

  template: require('./templates/actor_details'),
  className: 'modal actorDetails',

  events: {
    // live updates on the input fields
    // input gets triggered everytime 
    // the input's content changes
    'input [type=text]': 'submitForm',
    'change [type=checkbox]': 'submitForm',
    'change select': 'submitForm',
    'change textarea': 'submitForm',
    
    // show/hide the 'other' input field on 'Type'
    // and the Corruption Risk details
    'change .hasAdditionalInfo': 'toggleAdditionalInfo',
    
    // the buttons at the bottom
    'click .delete': 'deleteActor',
    'click .revert': 'revert',
    'click .done': 'submitAndClose',
    
    // submit on enter
    'form submit': 'submitAndClose',
    
    // make the whole thing draggable
    'mousedown': 'dragStart',
    
    // except all the text, buttons and inputs
    'mousedown label': 'stopPropagation',
    'mousedown input': 'stopPropagation',
    'mousedown textarea': 'stopPropagation',
    'mousedown select': 'stopPropagation',
    'mousedown button': 'stopPropagation'
  }, 

  initialize: function(options){
    View.prototype.initialize.call(this);
    _.bindAll(this, 'handleEscape', 'dragStop', 'drag', 'submitAndClose');
    
    this.actor = options.actor;
    this.editor = this.actor.editor;
    this.width = 360;
    this.height = 515;
    this.controlsHeight = 46;
    this.arrowHeight = 42;
    this.borderRadius = 5;
    this.distanceToActor = 10;

    this.model.on('change:abbreviation', this.updateName, this);
    this.model.on('change:name', this.updateName, this);
    
    // backup data for revert
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

  deleteActor: function(){

    if(this.model) 
      this.model.destroy();

    this.destroy();
    
    // prevent form forwarding
    return false;
  },
  
  revert: function(){
    this.model.save(this.backup);
    this.destroy();
    
    // prevent form forwarding
    return false;
  },

  submitAndClose: function(){
    
    this.saveFormData();
    this.destroy();
    
    // prevent form forwarding
    return false;
  },

  destroy: function(){
    View.prototype.destroy.call(this);
    
    // remove autosize helper (maybe not enough)
    $('.actorDetailsAutosizeHelper').remove();
    
    if(this.clickCatcher)
      this.clickCatcher.remove();
    this.clickCatcher = null;
    
    $(document).unbind('mousemove.global', this.drag);
    $(document).unbind('keydown', this.handleEscape);
  },

  handleEscape: function(event){
    if (event.keyCode === 27) {
      this.revert();
    }
  },
  
  placeNextToActor: function(){
    // absolute position inside the window
    var pos = this.actor.$el.offset();
    var padding = this.editor.padding;
    var arrow = this.$('.arrow');
    var arrowPos;
    
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
    pos.top += actorHeight/2  - this.height/2;
    
    // if the position is too far up
    // or too down low, adjust the position AND the arrow
    if(pos.top - padding < 0){
      arrowPos = this.height/2 - Math.abs(padding - pos.top);
      pos.top = padding;
    }
    else if(pos.top + this.height + padding > this.editor.$el.height()){      
      arrowPos = this.height/2 + Math.abs(pos.top + this.height - this.editor.$el.height() + padding);
      pos.top = this.editor.$el.height() - padding - this.height;
    }
    
    if(arrowPos){
      // keep the arrow positonend inside the boundaries
      var max = this.height-this.controlsHeight-this.arrowHeight/2;
      var min = this.borderRadius+this.arrowHeight/2;
      
      arrowPos = Math.min(max, Math.max(min, arrowPos));
      arrow.css('top', arrowPos - this.arrowHeight/2);
    }

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
    this.placeNextToActor();
    this.addClickCatcher();
    
    $(document).keydown(this.handleEscape);
    this.autosize = this.$('textarea').autosize({ className: 'actorDetailsAutosizeHelper' });
    
    // focus first input field
    var self = this;
    _.defer(function(){ self.$('input').first().focus(); });
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

  /**
    Gather all the data given by the user through inputs and save the addional Information to the actor model
  */
  submitForm: function(){
    
    var formData = this.$('form').serializeArray();
    var cleanedData = {};
    var sets = [ 'role', 'purpose'];
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
        if(cleanedData[name] === undefined)
          cleanedData[name] = [];
        
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
