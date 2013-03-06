var View = require('./view');

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
    this.options.cancelVerb = options.cancelVerb || t('Cancel');
    
    // set up the callbacks
    this.options.success = options.success || function(){};
    this.options.cancel = options.cancel || function(){};
    
    // set up the parent element
    this.options.holder = options.holder || 'body';
      
    _.bindAll(this, 'handleKeys', 'success', 'destroy');
    
    this.render();
  },
  
  success: function(event){
    if(event) event.stopPropagation();
    this.options.success();
    this.close();
  },
  
  cancel: function(event){
    if(event) event.stopPropagation();
    this.options.cancel();
    this.close();
  },
  
  render: function(){
    this.$el.html(this.template(this.options));
    this.$el.appendTo(this.options.holder);
    
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
        this.success();
        break;
    }
  },
  
  close: function(){
    this.$el.one(this.transEndEventName, this.destroy).addClass('hidden');
    
    if(this.clickCatcher)
      this.clickCatcher.destroy();
    
    $(document).unbind('keydown', this.handleKeys);
  }
});