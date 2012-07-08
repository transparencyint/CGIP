require('lib/view_helper');

// Base class for all views.
module.exports = Backbone.View.extend({
  initialize: function() {
    this.render = _.bind(this.render, this);
  },

  template: function() {},
  getRenderData: function() {},

  render: function() {
    this.$el.html(this.template(this.getRenderData()));
    this.afterRender();
    return this;
  },

  normalizedX: function(event){
    return window.Touch ? event.originalEvent.touches[0].pageX : event.pageX;
  },

  normalizedY: function(event){
    return window.Touch ? event.originalEvent.touches[0].pageY : event.pageY;
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

  fadedLeave: function(done){
    var view = this;
    this.$el.fadeOut(function(){
      view.destroy();
      done();
    });
  }
});
