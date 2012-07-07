module.exports = Backbone.Router.extend({
  containerElement: '#container',

  initialize: function(){
    this.currentView = null;
    Backbone.Router.prototype.initialize.call(this);
  },

  switchToView: function(view, delay){
    if(!delay) delay = 0;

    var router = this;
    clearTimeout(this.lastTimeout);
    this.lastTimeout = setTimeout(function(){
      if(router.currentView && router.currentView.leave)
        router.currentView.leave(function(){
          router._renderViewToContainer(view);
        });
      else
        router._renderViewToContainer(view);
    }, delay);
  },

  _renderViewToContainer: function(view){    
    view.render();
    $(this.containerElement).html(view.el)
    this.currentView = view;

    if(view.enter)
      view.enter();
  }
});