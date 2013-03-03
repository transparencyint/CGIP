// This view is the equivalents of the connection details view. 

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

      this.$('#disbursed').val(_disbursed);
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