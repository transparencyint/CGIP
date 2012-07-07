var View = require('./view');

module.exports = View.extend({
  
  template : require('./templates/country_selection'),

  leave: function(done){
    var view = this;
    this.$el.fadeOut(function(){
      view.destroy();
      done();
    });
  }
});