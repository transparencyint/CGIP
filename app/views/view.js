require('lib/view_helper');

// Base class for all views.
module.exports = Backbone.View.extend({
  // config fields //
  // deactivated gridline-checking
  noGridlines: false,
  // is this view selectable
  selectable: false,
  // don't snap to the grid,
  dontSnap: false,

  initialize: function() {
    this.render = _.bind(this.render, this);
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
      $('.selected').removeClass('selected');
      this.$el.addClass('selected');
      $(document).trigger('viewSelected', this);
    }
  }

});
