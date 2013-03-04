var View = require('./view');
var clickCatcher = require('./click_catcher_view');

module.exports = View.extend({  
  template: require('./templates/dialog'),
  
  className: 'dialogView hidden',
  
  events: {
    'click .overlay': 'cancel',
    'click .cancel': 'cancel',
    'click .ok': 'success'
  },
  
  initialize: function(options){  
    // set up the dialog captions
    this.options.title = options.title || t('Confirm');
    this.options.verb = options.verb || t('Ok');
    this.options.cancel = options.cancel || t('Cancel');
    
    // set up the parent element
    this.options.holder = options.holder || 'body';

    // set up the success callback
    var _this = this;
    var _success = this.options.success || function(){};
    this.success = function(event){
      event.stopPropagation();
      _success();
      _this.cancel();
    };
      
    _.bindAll(this, 'handleKeys', 'success', 'cancel', 'stopPropagation', 'destroy');
    
    this.render();
  },
  
  stopPropagation: function(event){
    event.stopPropagation();
  },
  
  render: function(){
    this.$el.html(this.template(this.options));
    this.$el.appendTo(this.options.holder);
    this.$el.on(this.inputDownEvent, this.stopPropagation);
    
    this.clickCatcher = new clickCatcher({ callback: this.cancel, holder: $(this.options.holder) });
    $(document).bind('keydown', this.handleKeys);
    
    var _this = this;
    _.defer(function(){
      _this.$el.removeClass('hidden');
    });
  },
  
  handleKeys: function(event){
    switch (event.keyCode) {
      case 27: // ESC
        this.cancel();
        break;
      case 13: // Enter
        this.success(event);
        break;
    }
  },
  
  cancel: function(){
    this.$el.one(this.transEndEventName, this.destroy).addClass('hidden');
    
    if(this.clickCatcher)
      this.clickCatcher.destroy();
    
    $(document).unbind('keydown', this.handleKeys);
  }
});