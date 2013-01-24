var View = require('./view');

module.exports = View.extend({  
  // clickCatcher has no template because it's a plain <div>
  
  className: 'clickCatcher',
  
  initialize: function(options){
    this.holder = options.holder;
    this.zIndex = options.zIndex || 10;
    
    var _this = this;
    var _callback = options.callback;
    this.callback = function(event){
      event.stopPropagation();
      _callback();
      _this.destroy();
    };
    
    _.bindAll('callback');
    
    this.render();
  },
  
  render: function(){
    this.$el.css('z-index', this.zIndex);
    this.$el.appendTo(this.holder);
    this.$el.on( this.inputDownEvent, this.callback);
  }
});