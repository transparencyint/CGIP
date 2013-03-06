// This view is the equivalent of the connection details view. 

var View = require('../view');
var ConnectionDetails = require('../connection_details');

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

  dragStart: ConnectionDetails.prototype.dragStart,
  dragStop: ConnectionDetails.prototype.dragStop,
  drag: ConnectionDetails.prototype.drag,
  dontDrag: ConnectionDetails.prototype.dontDrag,
  placeNextToConnection: ConnectionDetails.prototype.placeNextToConnection,
  updateMoneyConnections: ConnectionDetails.prototype.updateMoneyConnections,
  pressOnScrollbar: ConnectionDetails.prototype.pressOnScrollbar,
  currentMoneyMode: ConnectionDetails.prototype.currentMoneyMode,
  getRenderData: ConnectionDetails.prototype.getRenderData,
  fillInActorNames: ConnectionDetails.prototype.fillInActorNames,
  place: ConnectionDetails.prototype.place,
  
  initialize: function(options){

    _.bindAll(this, 'handleKeys', 'drag', 'close', 'destroy', 'placeNextToConnection');
    
    this.connection = options.connection;
    this.connectionType = this.model.get('connectionType');
    this.editor = options.editor;
    this.mousePosition = options.mousePosition;

    this.width = 320;
    this.controlsHeight = 0;
    this.arrowHeight = 42;
    this.borderRadius = 5;
    this.distanceToConnection = 21;
    
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

      _disbursed = this.seperateValue(_disbursed);
      _pledged = this.seperateValue(_pledged);

      this.$('.amounts .disbursed').text(_disbursed);
      this.$('.amounts .pledged').text(_pledged);   

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

  //Adds a seperator to the given number for better reading
  //Source: http://stackoverflow.com/questions/9743038/how-do-i-add-a-thousand-seperator-to-a-number-in-javascript
  seperateValue: function(amount) {
    var sep = ' ';
    amount += '';
    x = amount.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + sep + '$2');
    }
    amount = x1 + x2;
    return amount;
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