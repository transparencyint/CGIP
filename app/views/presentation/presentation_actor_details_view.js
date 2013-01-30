var View = require('../view');
var ActorDetails = require('../actor_details');

module.exports = View.extend({

  template: require('../templates/presentation/presentation_actor_details'),
  className: 'modal hidden actorDetails',

  events: {
    // the buttons at the bottom
    'click .close': 'close',

    // make the whole thing draggable..
    'mousedown': 'dragStart',
    
    // ..except all the text, buttons and inputs
    'mousedown label': 'dontDrag',
    'mousedown input': 'dontDrag',
    'mousedown textarea': 'dontDrag',
    'mousedown select': 'dontDrag',
    'mousedown button': 'dontDrag'
  }, 

  dragStart: ActorDetails.prototype.dragStart,
  dragStop: ActorDetails.prototype.dragStop,
  drag: ActorDetails.prototype.drag,
  dontDrag: ActorDetails.prototype.dontDrag,
  pressOnScrollbar: ActorDetails.prototype.pressOnScrollbar,
  placeNextToActor: ActorDetails.prototype.placeNextToActor,
  getRenderData: ActorDetails.prototype.getRenderData,
  initOrganizationType: ActorDetails.prototype.initOrganizationType,
    
  initialize: function(options){
    View.prototype.initialize.call(this);

    _.bindAll(this, 'handleKeys', 'drag', 'close', 'destroy');
    
    this.actor = options.actor;
    this.editor = options.editor;
    this.width = 360;
    this.controlsHeight = 46;
    this.arrowHeight = 42;
    this.borderRadius = 5;
    this.distanceToActor = 10;

    this.initOrganizationType();

    // backup data for cancel
    this.backup = this.model.toJSON();
    delete this.backup._rev;
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

  afterRender: function() {
    this.addClickCatcher();
    
    $(document).keydown(this.handleKeys);
    this.holder = this.$('.holder');

    var corruptionRiskSource;
    if(this.model.has('corruptionRiskSource')){
      corruptionRiskSource = this.model.get('corruptionRiskSource');

      if(this.isURL(corruptionRiskSource))
        corruptionRiskSource = '<a href="'+corruptionRiskSource+'" target="_blank">'+corruptionRiskSource+'</a>'
    }

    this.$('.corruption-risk-source').html(corruptionRiskSource);

    // focus first input field
    var self = this;
    _.defer(function(){ 
      self.placeNextToActor();
      self.$el.removeClass('hidden');
      
      self.widthWithoutScrollbar = self.holder.css('overflow', 'hidden').find('div:first-child').width();
      self.holder.css('overflow', 'auto');
    });
  },

  /**
   * source: 
   * http://stackoverflow.com/questions/1701898/how-to-detect-whether-a-string-is-in-url-format-using-javascript
   */
  isURL: function(url) {
    var strRegex = "^((https|http|ftp|rtsp|mms)?://)"
        + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?"
        + "(([0-9]{1,3}\.){3}[0-9]{1,3}"
        + "|"
        + "([0-9a-z_!~*'()-]+\.)*"
        + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\."
        + "[a-z]{2,6})"
        + "(:[0-9]{1,4})?"
        + "((/?)|"
        + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
     var re = new RegExp(strRegex);
     return re.test(url);
  }
});
