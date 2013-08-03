require('lib/view_helper');

var transEndEventNames = {
  'WebkitTransition' : 'webkitTransitionEnd',
  'MozTransition'    : 'transitionend',
  'OTransition'      : 'oTransitionEnd',
  'msTransition'     : 'MSTransitionEnd',
  'transition'       : 'transitionend'
};

// Base class for all views.
module.exports = Backbone.View.extend({
  // config fields //
  // deactivated gridline-checking
  noGridlines: false,
  // is this view selectable
  selectable: false,
  // don't snap to the grid,
  dontSnap: false,
  // should the model get saved after snapping to the grid?
  saveAfterSnap: true,
  
  transEndEventName: transEndEventNames[ Modernizr.prefixed('transition') ],
  inputDownEvent: Modernizr.touch ? 'touchstart' : 'mousedown',
  inputMoveEvent: Modernizr.touch ? 'touchmove' : 'mousemove',
  inputUpEvent: Modernizr.touch ? 'touchend' : 'mouseup',

  initialize: function() {    
    this.render = _.bind(this.render, this);
    this.toggleLocked = _.bind(this.toggleLocked, this);

    if(this.model && this.model.lockable == true)
      this.model.on('change:locked', this.toggleLocked, this);
  },

  template: function() {},
  getRenderData: function() {
    if(this.model)
      return this.model.toJSON();
    else
      return {};
  },

  render: function() {
    this.$el.html(this.template(this.getRenderData()));
    this.afterRender();

    // check if the model is locked, if so, toggle the view's lock
    if(this.model && this.model.lockable && this.model.isLocked() && config.isRealtimeEnabled()){
      this.toggleLocked();
    }

    return this;
  },

  alertError: function(model, error){
    console.log(error, error.responseText);
    alert(error);
  },

  afterRender: function() {},

  destroy: function(){
    if(this.model)
      this.model.off(null, null, this);

    this.$el.remove();
  },

  leave: function(done){
    this.destroy();
    done();
  },

  select: function(event){
    if(this.selectable){
      if(event) event.stopPropagation();
      this.$el.addClass('selected');
      $(document).trigger('viewSelected', this);
    }
  },

  toggleLocked: function(){
    var isLocked = this.model.get('locked');
    if(isLocked == true)
      this.$el.addClass('locked');
    else
      this.$el.removeClass('locked');
  },
  
  /*
    touch / mouse normalizers
    =========================
    
    - changedTouches is needed because this gets called from 'touchend'
    in 'connection_view.js', where both touches and targetTouches might
    be empty
     
  */
  normalizedX: function(event){
    return Modernizr.touch ? event.originalEvent.changedTouches[0].pageX : event.pageX;
  },
  
  normalizedY: function(event){
    return Modernizr.touch ? event.originalEvent.changedTouches[0].pageY : event.pageY;
  }
});
