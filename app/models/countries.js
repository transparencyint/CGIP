var Country = require('./country');
var Collection = require('./collection');

module.exports = Collection.extend({
  model: Country,
  url: '/countries',
  
  comparator: function(country){
    return country.get('name');
  },

  containsCountry: function(iso){
    var contains = false;
    this.each(function(country){
      if(country.get('abbreviation') == iso)
        contains = true;
    });
    return contains;
  }
});