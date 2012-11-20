var View = require('./view');

module.exports = View.extend({
  
  template : require('./templates/country_selection'),
  
  className : 'countrySelection',

  getRenderData: function(){
    return { countries: this.options.countries.toJSON(), user: user.toJSON() };
  }
});