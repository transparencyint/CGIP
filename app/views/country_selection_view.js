var View = require('./view');

module.exports = View.extend({
  
  template : require('./templates/country_selection'),
  
  className : 'countrySelection',

  leave: function(done){
    this.fadedLeave(done);
  }
});