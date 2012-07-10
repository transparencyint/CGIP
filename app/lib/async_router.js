module.exports = Backbone.Router.extend({
  containerElement: '#container',

  initialize: function(){
    this.currentView = null;
    Backbone.Router.prototype.initialize.call(this);
  },

  switchToView: function(view){
    var router = this;

    this._leaveCurrentView(function(){
      router._renderViewToContainer(view);
    });
  },

  _renderViewToContainer: function(view){    
    view.render();
    $(this.containerElement).html(view.el)
    this.currentView = view;

    if(view.enter)
      view.enter();
  },

  /* UNSTABLE DO NOT YET USE */
  leaveCurrentView: function(done){
    if(!done) done = function(){};
    this._leaveCurrentView(done)
  },

  _leaveCurrentView: function(done){
    var router = this;
    if(router.currentView)
      router.currentView.leave(function(){
        delete router.currentView;
        done();
      });
    else
      done();
  }
});