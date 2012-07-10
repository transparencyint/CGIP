var View = require('./view');

module.exports = View.extend({
  
  template : require('./templates/country_selection'),

  leave: function(done){
    this.fadedLeave(done);
  }
});