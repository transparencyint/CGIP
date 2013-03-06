// This view is the equivalent of the actor details view. 
var View = require('../view');
var ActorDetails = require('../actor_details');

module.exports = View.extend({

  template: require('../templates/presentation/presentation_actor_details'),
  className: 'modal hidden actorDetails',

  events: {

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
  place: ActorDetails.prototype.place,
  initOrganizationType: ActorDetails.prototype.initOrganizationType,
    
  initialize: function(options){
    View.prototype.initialize.call(this);

    _.bindAll(this, 'handleKeys', 'drag', 'close', 'destroy', 'placeNextToActor');
    
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

  getRenderData: function(){
    var data = ActorDetails.prototype.getRenderData.call(this);
    if(this.model.has('corruptionRiskSource')){

      // replace unwanted white spaces to prevent browser crash!
      var corruptionRiskSource = this.model.get('corruptionRiskSource').replace(/\s+/g, '');

      data.corruptionRiskSourceIsALink = this.isURL(corruptionRiskSource);
      if(data.corruptionRiskSourceIsALink)
        if(corruptionRiskSource.indexOf('http://') != 0 && corruptionRiskSource.indexOf('https://') != 0)
          corruptionRiskSource = 'http://' + corruptionRiskSource;
      data.corruptionRiskSource = corruptionRiskSource;
    }
    return data;
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

    // focus first input field
    var self = this;
    _.defer(function(){ 
      self.placeNextToActor();
      self.$el.removeClass('hidden');
      
      self.widthWithoutScrollbar = self.holder.css('overflow', 'hidden').find('div:first-child').width();
      self.holder.css('overflow', 'auto');
    });
  },

  // Detect if the passed String is actually a URL
  isURL: function(url) {
    var strRegex = "^((https|http)?://|www.)";
    var re = new RegExp(strRegex);
    return re.test(url);
  }
});
